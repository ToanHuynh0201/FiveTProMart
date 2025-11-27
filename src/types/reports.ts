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

// Report Detail Types
export interface ReportDetail {
	id: string;
	type: "revenue" | "orders" | "products" | "customers";
	title: string;
	period: DateRangeFilter;
	data: unknown;
	generatedAt: Date;
}
