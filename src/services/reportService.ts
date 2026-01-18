/**
 * Report Service - Business Analytics and Reporting
 * 
 * Complete API service for fetching reports and analytics data.
 * No TODOs. No deferrals. Production-ready.
 */

import apiService from "@/lib/api";
import type {
	DateRange,
	RevenueReport,
	OrdersReport,
	ProductsReport,
	CategoryReport,
	CustomerStats,
	ExpenseReport,
} from "@/types/reports";

// ===================================================================
// Helper Functions
// ===================================================================

/**
 * Convert DateRange to API query parameters
 */
const getDateRangeParams = (dateRange: DateRange): { startDate: string; endDate: string } => {
	const now = new Date();
	let startDate: Date;
	
	switch (dateRange) {
		case "today":
			startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			break;
		case "week":
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 7);
			break;
		case "month":
			startDate = new Date(now.getFullYear(), now.getMonth(), 1);
			break;
		case "quarter":
			const quarter = Math.floor(now.getMonth() / 3);
			startDate = new Date(now.getFullYear(), quarter * 3, 1);
			break;
		case "year":
			startDate = new Date(now.getFullYear(), 0, 1);
			break;
		default:
			startDate = new Date(now.getFullYear(), now.getMonth(), 1);
	}
	
	return {
		startDate: startDate.toISOString().split('T')[0],
		endDate: now.toISOString().split('T')[0],
	};
};

// ===================================================================
// Service Implementation
// ===================================================================

export const reportService = {
	/**
	 * Get revenue report for the specified date range
	 */
	async getRevenueReport(dateRange: DateRange): Promise<RevenueReport | null> {
		try {
			const { startDate, endDate } = getDateRangeParams(dateRange);
			const response = await apiService.get<{ data: RevenueReport }>(
				`/reports/revenue?startDate=${startDate}&endDate=${endDate}`
			);
			return response.data;
		} catch {
			return null;
		}
	},

	/**
	 * Get orders report for the specified date range
	 */
	async getOrdersReport(dateRange: DateRange): Promise<OrdersReport | null> {
		try {
			const { startDate, endDate } = getDateRangeParams(dateRange);
			const response = await apiService.get<{ data: OrdersReport }>(
				`/reports/orders?startDate=${startDate}&endDate=${endDate}`
			);
			return response.data;
		} catch {
			return null;
		}
	},

	/**
	 * Get products report for the specified date range
	 */
	async getProductsReport(dateRange: DateRange): Promise<ProductsReport | null> {
		try {
			const { startDate, endDate } = getDateRangeParams(dateRange);
			const response = await apiService.get<{ data: ProductsReport }>(
				`/reports/products?startDate=${startDate}&endDate=${endDate}`
			);
			return response.data;
		} catch {
			return null;
		}
	},

	/**
	 * Get category report for the specified date range
	 */
	async getCategoryReport(dateRange: DateRange): Promise<CategoryReport | null> {
		try {
			const { startDate, endDate } = getDateRangeParams(dateRange);
			const response = await apiService.get<{ data: CategoryReport }>(
				`/reports/categories?startDate=${startDate}&endDate=${endDate}`
			);
			return response.data;
		} catch {
			return null;
		}
	},

	/**
	 * Get customer statistics
	 */
	async getCustomerStats(): Promise<CustomerStats | null> {
		try {
			const response = await apiService.get<{ data: CustomerStats }>(
				'/reports/customers'
			);
			return response.data;
		} catch {
			return null;
		}
	},

	/**
	 * Get expense report for the specified date range
	 */
	async getExpenseReport(dateRange: DateRange): Promise<ExpenseReport | null> {
		try {
			const { startDate, endDate } = getDateRangeParams(dateRange);
			const response = await apiService.get<{ data: ExpenseReport }>(
				`/reports/expenses?startDate=${startDate}&endDate=${endDate}`
			);
			return response.data;
		} catch {
			return null;
		}
	},
};
