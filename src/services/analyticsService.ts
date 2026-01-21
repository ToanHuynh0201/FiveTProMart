import apiService from "@/lib/api";
import type {
	MarginInsightResponse,
	MarginAlert,
	DemandInsightResponse,
	ReorderAlert,
	BundleInsightResponse,
	BundleDataStatus,
	AnalyticsHealthResponse,
	AnalyticsDashboardData,
} from "@/types/analytics";

/**
 * Analytics Service - AI-powered business intelligence
 * 
 * Endpoints:
 * - /api/v1/analytics/margins - Overall margin analysis
 * - /api/v1/analytics/margins/alerts - Products needing price adjustment
 * - /api/v1/analytics/demand/{productId} - Per-product demand forecast
 * - /api/v1/analytics/demand/reorder-alerts - Stock replenishment alerts
 * - /api/v1/analytics/bundles - Product association rules
 * - /api/v1/analytics/bundles/data-status - Bundle analysis readiness
 * - /api/v1/analytics/health - AI service health check
 */
export const analyticsService = {
	// ==================== MARGIN OPTIMIZER ====================

	/**
	 * Get comprehensive margin analysis
	 * Includes alerts for products with margins below target
	 */
	async getMarginInsights(): Promise<MarginInsightResponse> {
		const response = await apiService.get<{ data: MarginInsightResponse }>("/analytics/margins");
		return response.data;
	},

	/**
	 * Get only margin alerts (products needing attention)
	 * Lighter endpoint for dashboard widgets
	 */
	async getMarginAlerts(): Promise<MarginAlert[]> {
		const response = await apiService.get<{ data: { alerts: MarginAlert[] } }>("/analytics/margins/alerts");
		return response.data.alerts;
	},

	// ==================== DEMAND INTELLIGENCE ====================

	/**
	 * Get demand analysis for a specific product
	 * Includes sales patterns, trends, and forecasts
	 */
	async getDemandInsight(productId: string): Promise<DemandInsightResponse> {
		const response = await apiService.get<{ data: DemandInsightResponse }>(
			`/analytics/demand/${productId}`,
		);
		return response.data;
	},

	/**
	 * Get reorder alerts for low-stock products
	 * Prioritized by urgency (CRITICAL → HIGH → MEDIUM → LOW)
	 */
	async getReorderAlerts(): Promise<ReorderAlert[]> {
		const response = await apiService.get<{ data: ReorderAlert[] }>(
			"/analytics/demand/reorder-alerts",
		);
		return response.data;
	},

	// ==================== BUNDLE INSIGHTS ====================

	/**
	 * Get product bundle/association analysis
	 * Uses Apriori algorithm to find frequently co-purchased items
	 */
	async getBundleInsights(): Promise<BundleInsightResponse> {
		const response = await apiService.get<{ data: BundleInsightResponse }>(
			"/analytics/bundles",
		);
		return response.data;
	},

	/**
	 * Check if there's enough order data for bundle analysis
	 * Requires minimum order count for meaningful patterns
	 */
	async getBundleDataStatus(): Promise<BundleDataStatus> {
		const response = await apiService.get<{ data: BundleDataStatus }>(
			"/analytics/bundles/data-status",
		);
		return response.data;
	},

	// ==================== HEALTH & DIAGNOSTICS ====================

	/**
	 * Check AI analytics service health
	 * Returns service status, version, and database connectivity
	 */
	async getHealth(): Promise<AnalyticsHealthResponse> {
		const response = await apiService.get<{ data: AnalyticsHealthResponse }>(
			"/analytics/health",
		);
		return response.data;
	},

	/**
	 * Check if analytics service is available
	 * Quick boolean check for conditional UI rendering
	 */
	async isAvailable(): Promise<boolean> {
		try {
			const health = await this.getHealth();
			return health.status === "healthy";
		} catch {
			return false;
		}
	},

	// ==================== DASHBOARD AGGREGATION ====================

	/**
	 * Load all dashboard-relevant analytics data
	 * Fetches margins, reorder alerts, bundle status in parallel
	 * Returns partial data if some endpoints fail
	 */
	async getDashboardData(): Promise<AnalyticsDashboardData> {
		const [margins, reorderAlerts, bundleStatus, health] = await Promise.allSettled([
			this.getMarginInsights(),
			this.getReorderAlerts(),
			this.getBundleDataStatus(),
			this.getHealth(),
		]);

		return {
			margins: margins.status === "fulfilled" ? margins.value : null,
			reorderAlerts: reorderAlerts.status === "fulfilled" ? reorderAlerts.value : null,
			bundleStatus: bundleStatus.status === "fulfilled" ? bundleStatus.value : null,
			health: health.status === "fulfilled" ? health.value : null,
			loadedAt: new Date().toISOString(),
		};
	},
};

export default analyticsService;
