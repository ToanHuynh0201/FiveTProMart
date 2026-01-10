import { useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
	scheduleProactiveRefresh,
	cancelScheduledRefresh,
	refreshAccessToken,
	shouldRefreshToken,
	isRefreshInProgress,
} from '@/lib/tokenManager'

/**
 * TokenRefreshProvider - Proactive Token Refresh
 * 
 * STRATEGY:
 * 1. On mount/token change: Schedule refresh based on JWT expiry
 * 2. On visibility change: Refresh if token is stale
 * 3. Uses TokenManager to avoid race conditions
 * 
 * The token's `exp` claim is the single source of truth.
 */

// Global promise for coordinating visibility-triggered refresh
let visibilityRefreshPromise: Promise<boolean> | null = null

/**
 * Wait for any ongoing visibility-triggered refresh.
 * Call this from AuthContext BEFORE making API calls.
 */
export const waitForVisibilityRefresh = async (): Promise<void> => {
	if (visibilityRefreshPromise) {
		await visibilityRefreshPromise
	}
}

interface TokenRefreshProviderProps {
	children: ReactNode
}

export const TokenRefreshProvider = ({ children }: TokenRefreshProviderProps) => {
	const { isAuthenticated, accessToken, logout } = useAuthStore()
	const hasScheduledRef = useRef(false)

	/**
	 * Callbacks for TokenManager
	 */
	const onTokenRefreshed = useCallback((newToken: string) => {
		useAuthStore.setState({ accessToken: newToken })
	}, [])

	const onSessionExpired = useCallback(() => {
		logout()
		// Redirect to login
		window.location.href = '/login?session=expired'
	}, [logout])

	/**
	 * Refresh the token (used for visibility change)
	 */
	const doRefresh = useCallback(async (): Promise<boolean> => {
		if (isRefreshInProgress()) {
			return false
		}

		const result = await refreshAccessToken(onTokenRefreshed, onSessionExpired)
		return result.success
	}, [onTokenRefreshed, onSessionExpired])

	/**
	 * Schedule proactive refresh when authenticated.
	 */
	useEffect(() => {
		if (!isAuthenticated || !accessToken) {
			cancelScheduledRefresh()
			hasScheduledRef.current = false
			return
		}

		// Schedule proactive refresh based on token expiry
		if (!hasScheduledRef.current) {
			scheduleProactiveRefresh(accessToken, onTokenRefreshed, onSessionExpired)
			hasScheduledRef.current = true
		}

		return () => {
			cancelScheduledRefresh()
			hasScheduledRef.current = false
		}
	}, [isAuthenticated, accessToken, onTokenRefreshed, onSessionExpired])

	/**
	 * Handle visibility change: refresh if token is stale.
	 */
	useEffect(() => {
		const handleVisibilityChange = async () => {
			if (document.visibilityState === 'visible') {
				const { accessToken: currentToken, isAuthenticated: isAuth } =
					useAuthStore.getState()

				if (!isAuth || !currentToken) return

				// Check if token needs refresh
				if (shouldRefreshToken(currentToken)) {
					console.log('[TokenRefreshProvider] Tab visible, token stale - refreshing')

					// Store promise globally so AuthContext can wait
					visibilityRefreshPromise = doRefresh()
					await visibilityRefreshPromise
					visibilityRefreshPromise = null
				}
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange)
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [doRefresh])

	return <>{children}</>
}
