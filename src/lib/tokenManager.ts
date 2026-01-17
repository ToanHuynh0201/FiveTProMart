/**
 * TokenManager - Production-Grade Token Management
 * 
 * PHILOSOPHY: All logic based on JWT expiry claims, not manual timers.
 * Prevents race conditions with queue-based refresh pattern.
 * 
 * USAGE:
 * - Proactive refresh: Scheduled based on actual token expiry
 * - Reactive refresh: Called by axios interceptor on 401
 * - Visibility handling: Refresh stale tokens when user returns
 */

import apiService from '@/lib/api'

// ============================================================================
// CONSTANTS
// ============================================================================

// Access token lifetime (adjust to match your backend)
export const ACCESS_TOKEN_LIFETIME_SECONDS = 30 * 60 // 30 minutes

// Refresh when 20% of lifetime remains (6 minutes before expiry)
export const REFRESH_THRESHOLD_PERCENTAGE = 0.2

export const REFRESH_THRESHOLD_SECONDS =
	ACCESS_TOKEN_LIFETIME_SECONDS * REFRESH_THRESHOLD_PERCENTAGE

// Minimum interval between refresh attempts
export const MIN_REFRESH_INTERVAL_MS = 10 * 1000 // 10 seconds

// ============================================================================
// TOKEN DECODING
// ============================================================================

export interface DecodedToken {
	exp: number // Expiry timestamp (seconds since epoch)
	iat: number // Issued at timestamp
	sub: string // Subject (user ID)
	[key: string]: unknown
}

/**
 * Decode JWT without verification (client-side).
 * SECURITY: Only use for reading claims like expiry. Backend verifies signature.
 */
export const decodeToken = (token: string): DecodedToken | null => {
	try {
		const parts = token.split('.')
		if (parts.length !== 3) return null

		const payload = parts[1]
		const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
		return decoded
	} catch (error) {
		console.error('[tokenManager] Token decode failed:', error)
		return null
	}
}

/**
 * Get token expiry time in seconds.
 */
export const getTokenExpiry = (token: string): number | null => {
	const decoded = decodeToken(token)
	return decoded?.exp || null
}

/**
 * Check if token is expired.
 */
export const isTokenExpired = (token: string): boolean => {
	const expiry = getTokenExpiry(token)
	if (!expiry) return true

	const now = Math.floor(Date.now() / 1000)
	return now >= expiry
}

/**
 * Check if token should be refreshed (within threshold of expiry).
 */
export const shouldRefreshToken = (token: string): boolean => {
	const expiry = getTokenExpiry(token)
	if (!expiry) return true

	const now = Math.floor(Date.now() / 1000)
	const timeUntilExpiry = expiry - now

	return timeUntilExpiry <= REFRESH_THRESHOLD_SECONDS
}

/**
 * Get token status for debugging.
 */
export const getTokenStatus = (token: string): {
	expired: boolean
	shouldRefresh: boolean
	expiresIn: number
	expiryTime: Date | null
} => {
	const expiry = getTokenExpiry(token)
	if (!expiry) {
		return {
			expired: true,
			shouldRefresh: true,
			expiresIn: 0,
			expiryTime: null,
		}
	}

	const now = Math.floor(Date.now() / 1000)
	const expiresIn = expiry - now

	return {
		expired: expiresIn <= 0,
		shouldRefresh: expiresIn <= REFRESH_THRESHOLD_SECONDS,
		expiresIn,
		expiryTime: new Date(expiry * 1000),
	}
}

// ============================================================================
// REFRESH QUEUE (Prevents Race Conditions)
// ============================================================================

let refreshPromise: Promise<{ success: boolean; token?: string }> | null = null
let lastRefreshAttempt = 0

/**
 * Check if a refresh is currently in progress.
 */
export const isRefreshInProgress = (): boolean => {
	return refreshPromise !== null
}

/**
 * Wait for any ongoing refresh to complete.
 */
export const waitForRefresh = async (): Promise<{
	success: boolean
	token?: string
}> => {
	if (refreshPromise) {
		return await refreshPromise
	}
	return { success: false }
}

/**
 * Centralized token refresh with queue pattern.
 * Multiple callers will wait for the same refresh operation.
 * 
 * @param onTokenRefreshed - Callback to update store with new token
 * @param onSessionExpired - Callback to handle logout
 */
export const refreshAccessToken = async (
	onTokenRefreshed: (token: string) => void,
	onSessionExpired: () => void
): Promise<{ success: boolean; token?: string }> => {
	// If refresh already in progress, wait for it
	if (refreshPromise) {
		return await refreshPromise
	}

	// Rate limiting: prevent rapid-fire refresh attempts
	const now = Date.now()
	if (now - lastRefreshAttempt < MIN_REFRESH_INTERVAL_MS) {
		console.warn('[tokenManager] Refresh rate limited')
		return { success: false }
	}

	lastRefreshAttempt = now

	// Create refresh promise
	refreshPromise = (async () => {
		try {
			// Call refresh endpoint (uses HttpOnly cookie automatically)
			const response = await apiService.post('/auth/refresh-token', {})

			const newAccessToken = (response as any)?.data?.data?.accessToken
			if (!newAccessToken) {
				throw new Error('No access token in refresh response')
			}

			// Update store with new token
			onTokenRefreshed(newAccessToken)

			return { success: true, token: newAccessToken }
		} catch (error) {
			console.error('[tokenManager] Token refresh failed:', error)

			// Only logout on explicit auth failure, not network errors
			const status = (error as any)?.response?.status
			if (status === 401 || status === 403) {
				onSessionExpired()
			}

			return { success: false }
		} finally {
			refreshPromise = null
		}
	})()

	return await refreshPromise
}

// ============================================================================
// PROACTIVE REFRESH SCHEDULING
// ============================================================================

let scheduledRefreshTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Cancel any scheduled refresh.
 */
export const cancelScheduledRefresh = (): void => {
	if (scheduledRefreshTimeout) {
		clearTimeout(scheduledRefreshTimeout)
		scheduledRefreshTimeout = null
	}
}

/**
 * Schedule proactive token refresh based on JWT expiry.
 * Cancels any existing scheduled refresh.
 * 
 * @param token - Current access token
 * @param onTokenRefreshed - Callback to update store
 * @param onSessionExpired - Callback to handle logout
 */
export const scheduleProactiveRefresh = (
	token: string,
	onTokenRefreshed: (token: string) => void,
	onSessionExpired: () => void
): void => {
	cancelScheduledRefresh()

	const expiry = getTokenExpiry(token)
	if (!expiry) {
		console.warn('[tokenManager] Cannot schedule refresh: invalid token')
		return
	}

	const now = Math.floor(Date.now() / 1000)
	const timeUntilRefresh = expiry - now - REFRESH_THRESHOLD_SECONDS

	if (timeUntilRefresh <= 0) {
		// Token already needs refresh
		refreshAccessToken(onTokenRefreshed, onSessionExpired)
		return
	}

	// Schedule refresh
	const delayMs = timeUntilRefresh * 1000
	scheduledRefreshTimeout = setTimeout(() => {
		refreshAccessToken(onTokenRefreshed, onSessionExpired)
	}, delayMs)

	console.log(
		`[tokenManager] Proactive refresh scheduled in ${Math.round(timeUntilRefresh / 60)} minutes`
	)
}
