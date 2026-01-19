import { useEffect, useRef, useCallback } from "react";

interface UseAutoRefreshOptions {
	intervalMs?: number; // Default: 5 minutes
	onRefresh: () => void | Promise<void>;
	enabled?: boolean;
}

/**
 * useAutoRefresh - Custom hook for automatic data refreshing
 * EXTREME QUALITY: Professional analytics dashboards auto-refresh
 * 
 * @param onRefresh - Function to call on each refresh cycle
 * @param intervalMs - Refresh interval in milliseconds (default: 5 minutes)
 * @param enabled - Whether auto-refresh is active (default: true)
 */
export const useAutoRefresh = ({ 
	onRefresh, 
	intervalMs = 5 * 60 * 1000, // 5 minutes
	enabled = true 
}: UseAutoRefreshOptions) => {
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const startAutoRefresh = useCallback(() => {
		if (!enabled) return;

		// Clear any existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
		}

		// Set up new interval
		intervalRef.current = setInterval(async () => {
			try {
				await onRefresh();
			} catch (error) {
				console.error("Auto-refresh failed:", error);
			}
		}, intervalMs);
	}, [onRefresh, intervalMs, enabled]);

	const stopAutoRefresh = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, []);

	// Start on mount, clean up on unmount
	useEffect(() => {
		if (enabled) {
			startAutoRefresh();
		}

		return () => {
			stopAutoRefresh();
		};
	}, [enabled, startAutoRefresh, stopAutoRefresh]);

	return {
		startAutoRefresh,
		stopAutoRefresh,
	};
};
