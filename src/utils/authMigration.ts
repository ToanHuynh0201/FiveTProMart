/**
 * Migration Utility - Transition from localStorage to Zustand Store
 * 
 * This utility helps migrate existing users who have tokens in localStorage
 * to the new secure architecture with Zustand + HttpOnly cookies.
 * 
 * USAGE:
 * 1. Import and call in App.tsx or AuthProvider initialization
 * 2. Run once on app load
 * 3. Remove after all users have migrated (1-2 weeks)
 */

import { useAuthStore } from '@/store/authStore'
import { AUTH_CONFIG } from '@/constants'

const OLD_KEYS = {
	ACCESS_TOKEN: 'accessToken',
	REFRESH_TOKEN: 'refreshToken',
	USER: 'user',
}

/**
 * Migrate tokens from old localStorage format to new Zustand store
 */
export const migrateOldAuthData = (): boolean => {
	try {
		// Check if old data exists
		const oldAccessToken = localStorage.getItem(OLD_KEYS.ACCESS_TOKEN)
		const oldUser = localStorage.getItem(OLD_KEYS.USER)

		if (!oldAccessToken && !oldUser) {
			// Nothing to migrate
			return false
		}

		console.log('[Migration] Found old auth data, migrating...')

		// Migrate access token
		if (oldAccessToken) {
			try {
				const token = JSON.parse(oldAccessToken)
				if (typeof token === 'string' && token.trim().length > 0) {
					useAuthStore.getState().login(token)
					console.log('[Migration] ✓ Access token migrated')
				}
			} catch {
				console.warn('[Migration] Failed to parse old access token')
			}
		}

		// Migrate user profile
		if (oldUser) {
			try {
				const user = JSON.parse(oldUser)
				if (user && typeof user === 'object' && (user.profileId || user.userId)) {
					useAuthStore.getState().setUser(user)
					console.log('[Migration] ✓ User profile migrated')
				}
			} catch {
				console.warn('[Migration] Failed to parse old user data')
			}
		}

		// Clean up old localStorage entries
		localStorage.removeItem(OLD_KEYS.ACCESS_TOKEN)
		localStorage.removeItem(OLD_KEYS.REFRESH_TOKEN)
		localStorage.removeItem(OLD_KEYS.USER)

		// Also clean up variations with AUTH_CONFIG keys if they exist
		if (AUTH_CONFIG?.TOKEN_STORAGE_KEY) {
			localStorage.removeItem(AUTH_CONFIG.TOKEN_STORAGE_KEY)
		}
		if (AUTH_CONFIG?.REFRESH_TOKEN_STORAGE_KEY) {
			localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY)
		}
		if (AUTH_CONFIG?.USER_STORAGE_KEY) {
			localStorage.removeItem(AUTH_CONFIG.USER_STORAGE_KEY)
		}

		console.log('[Migration] ✓ Old localStorage entries cleaned up')
		console.log('[Migration] Migration complete!')

		return true
	} catch (error) {
		console.error('[Migration] Error during migration:', error)
		return false
	}
}

/**
 * Check if user needs to re-login after migration
 * (if we couldn't migrate their tokens successfully)
 */
export const needsReLogin = (): boolean => {
	const { isAuthenticated, accessToken } = useAuthStore.getState()
	return !isAuthenticated || !accessToken
}

/**
 * Show migration notice to user (optional)
 */
export const showMigrationNotice = (): void => {
	const notice = `
Your session has been upgraded to a more secure authentication system.

What changed:
✓ Your account is now protected against XSS attacks
✓ Tokens are stored more securely
✓ Your session will automatically refresh in the background

You may need to log in again. This is a one-time upgrade.
	`.trim()

	console.info('[Migration] %c' + notice, 'color: #4CAF50; font-weight: bold;')
}

/**
 * Full migration flow with user feedback
 */
export const performMigration = (): { migrated: boolean; needsLogin: boolean } => {
	const migrated = migrateOldAuthData()

	if (migrated) {
		showMigrationNotice()
	}

	const needsLogin = needsReLogin()

	return { migrated, needsLogin }
}

export default {
	migrateOldAuthData,
	needsReLogin,
	showMigrationNotice,
	performMigration,
}
