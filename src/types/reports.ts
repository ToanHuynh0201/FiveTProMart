/**
 * Reports data types and interfaces
 */

export type DateRange =
	| "today"
	| "week"
	| "month"
	| "quarter"
	| "year"
	| "custom";

export type ReportPeriod = "day" | "week" | "month" | "quarter" | "year";

export interface DateRangeFilter {
	type: DateRange;
	startDate?: Date;
	endDate?: Date;
}

// Revenue Report Types
export interface RevenueDataPoint {
	date: string; // ISO date string
	revenue: number;
	cost: number;
	profit: number;
	orders: number;
}

export interface RevenueReport {
	period: DateRangeFilter;
	totalRevenue: number;
	totalCost: number;
	totalProfit: number;
	profitMargin: number; // percentage
	data: RevenueDataPoint[];
	growth: number; // percentage compared to previous period
}

// Orders Report Types
export interface OrdersDataPoint {
	date: string;
	totalOrders: number;
	completedOrders: number;
	cancelledOrders: number;
	averageValue: number;
}

export interface OrdersReport {
	period: DateRangeFilter;
	totalOrders: number;
	completedOrders: number;
	cancelledOrders: number;
	completionRate: number; // percentage
	averageOrderValue: number;
	data: OrdersDataPoint[];
	growth: number; // percentage
}

// Products Report Types
export interface TopProduct {
	id: string;
	code: string;
	name: string;
	category: string;
	quantitySold: number;
	revenue: number;
	stock: number;
	image?: string;
}

export interface ProductsReport {
	period: DateRangeFilter;
	topSellingProducts: TopProduct[];
	totalProductsSold: number;
	totalCategories: number;
	lowStockProducts: number;
}

// Category Performance
export interface CategoryPerformance {
	category: string;
	revenue: number;
	quantitySold: number;
	productCount: number;
	percentage: number;
}

export interface CategoryReport {
	period: DateRangeFilter;
	categories: CategoryPerformance[];
	totalRevenue: number;
}

// Payment Methods Report
export interface PaymentMethodData {
	method: string;
	count: number;
	amount: number;
	percentage: number;
}

export interface PaymentReport {
	period: DateRangeFilter;
	methods: PaymentMethodData[];
	totalTransactions: number;
	totalAmount: number;
}

// Customer Report Types
export interface CustomerStats {
	totalCustomers: number;
	newCustomers: number;
	returningCustomers: number;
	averageOrdersPerCustomer: number;
	customerRetentionRate: number;
}

// Staff Performance
export interface StaffPerformance {
	staffId: string;
	staffName: string;
	totalOrders: number;
	totalRevenue: number;
	averageOrderValue: number;
	shiftsWorked: number;
}

export interface StaffReport {
	period: DateRangeFilter;
	staffPerformance: StaffPerformance[];
	totalStaff: number;
}

// Overall Dashboard Stats
export interface DashboardStats {
	revenue: RevenueReport;
	orders: OrdersReport;
	products: ProductsReport;
	customers: CustomerStats;
	payments: PaymentReport;
}

// Expense Types
export type ExpenseCategory =
	| "electricity"
	| "water"
	| "supplies"
	| "repairs"
	| "other";

export interface Expense {
	id: string;
	category: ExpenseCategory;
	description: string;
	amount: number;
	date: Date;
	createdBy?: string;
	notes?: string;
}

export interface ExpenseDataPoint {
	date: string;
	electricity: number;
	water: number;
	supplies: number;
	repairs: number;
	other: number;
	total: number;
}

export interface ExpenseReport {
	period: DateRangeFilter;
	totalExpense: number;
	byCategory: {
		electricity: number;
		water: number;
		supplies: number;
		repairs: number;
		other: number;
	};
	data: ExpenseDataPoint[];
	growth: number; // percentage
	expenses: Expense[];
}

// Report Detail Types
export interface ReportDetail {
	id: string;
	type: "revenue" | "orders" | "products" | "customers";
	title: string;
	period: DateRangeFilter;
	data: unknown;
	generatedAt: Date;
}

// ============================================================
// Statistics API Types (New API v1)
// ============================================================

// 1.1 Dashboard Summary
export interface DashboardSummary {
	totalRevenue: number; // Tổng doanh thu
	netProfit: number; // Lợi nhuận
	totalOrders: number; // Tổng số đơn hàng
	totalProductsSold: number; // Tổng số lượng sản phẩm bán ra
	averageOrderValue: number; // Giá trị trung bình đơn
	totalCustomers: number; // Số khách đã mua hàng trong kỳ
	newCustomers: number; // Số khách đăng ký mới trong kỳ
	incurredStats: number; // Chi phí phát sinh
}

// 1.2 Revenue & Profit Chart
export interface RevenueProfitChartDataPoint {
	date: string; // Format: dd-MM-yyyy
	revenue: number;
	expense: number;
	profit: number;
}

// 1.3 Orders Chart
export interface OrdersChartDataPoint {
	date: string; // Format: dd-MM-yyyy
	completedOrders: number;
}

// 1.4 Category Revenue
export interface CategoryRevenue {
	categoryId: string;
	categoryName: string;
	totalRevenue: number;
	totalQuantitySold: number;
	orderCount: number;
}

// 1.5 Top Selling Products
export interface TopSellingProduct {
	productId: string;
	productName: string;
	categoryName: string;
	totalRevenue: number;
	totalQuantitySold: number;
	totalStockQuantity: number | string; // Có thể là số hoặc đơn vị như "Gói"
}

// Statistics Request Parameters
export interface StatisticsDateRange {
	startDate: string; // Format: dd-MM-yyyy
	endDate: string; // Format: dd-MM-yyyy
}

export interface CategoryRevenueRequest extends StatisticsDateRange {
	limit: number;
}

export interface TopProductsRequest extends StatisticsDateRange {
	limit: number;
}
