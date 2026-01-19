// ============================================================
// Analytics Types - AI-powered business intelligence
// EXACTLY mirrors Python Pydantic models in promart-ai-service
// ============================================================

// ==================== MARGIN OPTIMIZER ====================

export interface MarginAlert {
	type: "NEGATIVE_MARGIN" | "THIN_MARGIN" | "EXPIRY_RISK";
	severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
	productId: string;
	productName: string;
	currentPrice?: number;
	costPrice?: number;
	marginPercent?: number; // Percentage (e.g., 15.5 = 15.5%)
	unitsAtRisk?: number;
	expiryDate?: string; // ISO date
	daysRemaining?: number;
	costValue?: number;
	suggestion: string;
}

export interface MarginSummary {
	totalProducts: number;
	healthyMargins: number;
	thinMargins: number;
	negativeMargins: number;
	atRiskOfWaste: number;
	totalPotentialWasteValue: number;
}

export interface MarginInsightResponse {
	dataQuality: "INSUFFICIENT" | "MINIMAL" | "SUFFICIENT" | "RICH";
	summary: MarginSummary;
	alerts: MarginAlert[];
	generatedAt: string; // ISO datetime
}

// ==================== DEMAND INTELLIGENCE ====================

export interface DataRange {
	fromDate: string | null; // ISO date
	toDate: string | null; // ISO date
	daysOfData: number;
}

export interface WeeklyPattern {
	monday: number | null;
	tuesday: number | null;
	wednesday: number | null;
	thursday: number | null;
	friday: number | null;
	saturday: number | null;
	sunday: number | null;
}

export interface Forecast {
	next7Days: number | null;
	next14Days: number | null;
	next30Days: number | null;
	confidence: number | null;
}

export interface ExternalFactors {
	weatherImpact: string | null;
	holidayImpact: string | null;
}

export interface DemandInsightResponse {
	productId: string;
	productName: string;
	dataQuality: "INSUFFICIENT" | "MINIMAL" | "SUFFICIENT" | "RICH";
	currentStock: number | null;
	averageDailySales: number | null;
	daysUntilStockout: number | null;
	suggestedReorderPoint: number | null;
	suggestedReorderQuantity: number | null;
	weeklyPattern: WeeklyPattern | null;
	forecast: Forecast | null;
	externalFactors: ExternalFactors | null;
	insightMessage: string;
	generatedAt: string; // ISO datetime
	dataRange: DataRange;
}

export interface ReorderAlert {
	productId: string;
	productName: string;
	currentStock: number;
	daysUntilStockout: number;
	urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
	suggestedQuantity: number;
}

// ==================== BUNDLE INSIGHTS ====================

export interface AssociationRule {
	antecedent: string[]; // Products that were bought
	consequent: string[]; // Products likely to be bought with
	support: number; // How often this pattern occurs (0-1)
	confidence: number; // Probability of consequent given antecedent (0-1)
	lift: number; // How much more likely vs random (>1 = positive association)
}

export interface PlacementSuggestion {
	product: string;
	suggestNear: string;
	reason: string;
}

export interface BundleInsightResponse {
	dataQuality: "INSUFFICIENT" | "MINIMAL" | "SUFFICIENT" | "RICH";
	totalOrdersAnalyzed: number;
	multiItemOrdersAnalyzed: number;
	totalPairsFound: number;
	rules: AssociationRule[];
	placementSuggestions: PlacementSuggestion[];
	insightMessage: string | null;
	generatedAt: string;
}

export interface BundleDataStatus {
	readyForAnalysis: boolean;
	multiItemOrders: number;
	requiredOrders: number;
	ordersNeeded: number;
	progressPercent: number;
	firstOrderDate: string | null;
	lastOrderDate: string | null;
	message: string;
}

// ==================== HEALTH CHECK ====================

export interface AnalyticsHealthResponse {
	status: "healthy" | "degraded" | "down";
	database: boolean;
	timestamp: string;
}

// ==================== AGGREGATE DASHBOARD ====================

export interface AnalyticsDashboardData {
	margins: MarginInsightResponse | null;
	reorderAlerts: ReorderAlert[] | null;
	bundleStatus: BundleDataStatus | null;
	health: AnalyticsHealthResponse | null;
	loadedAt: string;
}
