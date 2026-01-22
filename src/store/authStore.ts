import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/auth'

/**
 * SECURITY ARCHITECTURE:
 * - Access tokens: Stored in memory (this store) - cleared on tab close
 * - Refresh tokens: HttpOnly cookies managed by backend - immune to XSS
 * - User profile: Persisted to localStorage (non-sensitive display data)
 * 
 * This eliminates XSS attack vectors while maintaining good UX.
 */

/**
 * Validates that a user object has the minimum required fields.
 */
const isValidUser = (user: unknown): user is User => {
	if (!user || typeof user !== 'object') return false
	const u = user as Record<string, unknown>
	return (
		typeof u.profileId === 'string' && u.profileId.length > 0 &&
		typeof u.userId === 'string' && u.userId.length > 0
	)
}

interface AuthState {
	isAuthenticated: boolean
	user: User | null
	accessToken: string | null
	isLoading: boolean
	isHydrated: boolean
	
	// Actions
	login: (accessToken: string) => void
	setUser: (user: User) => void
	logout: () => void
	setLoading: (isLoading: boolean) => void
	setHydrated: (isHydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			isAuthenticated: false,
			user: null,
			accessToken: null,
			isLoading: true,
			isHydrated: false,

			/**
			 * login() sets the access token and marks as authenticated.
			 * Call setUser() separately after fetching profile.
			 * 
			 * SECURITY: Token only stored in memory - cleared on tab close.
			 */
			login: (accessToken: string) => {
				if (!accessToken || accessToken.trim() === '') {
					console.error('[authStore] Login rejected: missing accessToken')
					return
				}

				set({
					isAuthenticated: true,
					accessToken,
				})
			},

			/**
			 * setUser() sets the user profile after validation.
			 */
			setUser: (user: User) => {
				if (!isValidUser(user)) {
					console.error('[authStore] setUser rejected: invalid user', { user })
					return
				}
				set({ user })
			},

			/**
			 * logout() clears all auth state.
			 * Backend will invalidate HttpOnly refresh token cookie.
			 */
			logout: () => {
				set({
					isAuthenticated: false,
					user: null,
					accessToken: null,
					isLoading: false,
				})
			},

			setLoading: (isLoading: boolean) => set({ isLoading }),
			setHydrated: (isHydrated: boolean) => set({ isHydrated }),
		}),
		{
			name: 'fivet-auth-storage',
			// CRITICAL: Only persist non-sensitive user profile data
			// Access tokens stay in memory - cleared on browser close
			partialize: (state) => ({
				user: state.user,
				// Explicitly NOT persisting: accessToken, isAuthenticated
			}),
		}
	)
)
