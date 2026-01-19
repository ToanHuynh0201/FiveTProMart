/**
 * Global Inventory Alerts Hook
 *
 * Fetches and caches inventory stats to display alert badges in sidebar
 * and other components. Provides real-time visibility into critical stock issues.
 */
import { useState, useEffect, useCallback } from "react";
import type { InventoryStats } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";

/** Refresh interval: 5 minutes */
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

interface UseInventoryAlertsResult {
	/** Raw inventory stats from API */
	stats: InventoryStats | null;
	/** Total critical issues (expired + out of stock) */
	criticalCount: number;
	/** Total warning issues (expiring soon + low stock) */
	warningCount: number;
	/** Combined total of all issues */
	totalIssues: number;
	/** Whether data is currently loading */
	isLoading: boolean;
	/** Error message if fetch failed */
	error: string | null;
	/** Force refresh stats */
	refresh: () => Promise<void>;
}

export function useInventoryAlerts(): UseInventoryAlertsResult {
	const [stats, setStats] = useState<InventoryStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = useCallback(async () => {
		try {
			setError(null);
			const data = await inventoryService.getStats();
			setStats(data);
		} catch (err) {
			console.error("Failed to fetch inventory alerts:", err);
			setError("Failed to load inventory alerts");
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Initial fetch on mount
	useEffect(() => {
		fetchStats();

		// Set up periodic refresh
		const intervalId = setInterval(fetchStats, REFRESH_INTERVAL_MS);

		return () => clearInterval(intervalId);
	}, [fetchStats]);

	// Calculate counts
	const criticalCount = stats
		? stats.expiredBatches + stats.outOfStockProducts
		: 0;
	const warningCount = stats
		? stats.expiringSoonBatches + stats.lowStockProducts
		: 0;
	const totalIssues = criticalCount + warningCount;

	return {
		stats,
		criticalCount,
		warningCount,
		totalIssues,
		isLoading,
		error,
		refresh: fetchStats,
	};
}
