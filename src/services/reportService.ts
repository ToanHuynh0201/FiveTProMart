/**
 * Report Service - Statistics API v1
 * 
 * API service for Statistics endpoints
 */

import apiService from "@/lib/api";
import type {
	// New Statistics API types
	DashboardSummary,
	RevenueProfitChartDataPoint,
	OrdersChartDataPoint,
	CategoryRevenue,
	TopSellingProduct,
	StatisticsDateRange,
	CategoryRevenueRequest,
	TopProductsRequest,
} from "@/types/reports";

// ===================================================================
// Statistics API Service
// ===================================================================

export const reportService = {
	/**
	 * 1.1 Get Dashboard Summary
	 * Endpoint: GET /api/v1/statistics/summary
	 */
	async getDashboardSummary(params: StatisticsDateRange): Promise<{
		success: boolean;
		message: string;
		data: DashboardSummary;
	}> {
		return apiService.get(
			`/statistics/summary?startDate=${params.startDate}&endDate=${params.endDate}`
		);
	},

	/**
	 * 1.2 Get Revenue & Profit Chart
	 * Endpoint: GET /api/v1/statistics/revenue-profit-chart
	 */
	async getRevenueProfitChart(params: StatisticsDateRange): Promise<{
		success: boolean;
		data: RevenueProfitChartDataPoint[];
	}> {
		return apiService.get(
			`/statistics/revenue-profit-chart?startDate=${params.startDate}&endDate=${params.endDate}`
		);
	},

	/**
	 * 1.3 Get Orders Chart
	 * Endpoint: GET /api/v1/statistics/orders-chart
	 */
	async getOrdersChart(params: StatisticsDateRange): Promise<{
		success: boolean;
		data: OrdersChartDataPoint[];
	}> {
		return apiService.get(
			`/statistics/orders-chart?startDate=${params.startDate}&endDate=${params.endDate}`
		);
	},

	/**
	 * 1.4 Get Revenue by Category
	 * Endpoint: GET /api/v1/statistics/category-revenue
	 * Note: Backend sẽ sort giảm dần theo doanh thu, các category từ limit+1 trở đi gộp thành "Khác"
	 */
	async getCategoryRevenue(params: CategoryRevenueRequest): Promise<{
		success: boolean;
		data: CategoryRevenue[];
	}> {
		return apiService.get(
			`/statistics/category-revenue?limit=${params.limit}&startDate=${params.startDate}&endDate=${params.endDate}`
		);
	},

	/**
	 * 1.5 Get Top Selling Products
	 * Endpoint: GET /api/v1/statistics/top-products
	 * Note: Backend sẽ sort giảm dần theo totalQuantitySold và chỉ trả về 'limit' sản phẩm đầu tiên
	 */
	async getTopProducts(params: TopProductsRequest): Promise<{
		success: boolean;
		data: TopSellingProduct[];
	}> {
		return apiService.get(
			`/statistics/top-products?limit=${params.limit}&startDate=${params.startDate}&endDate=${params.endDate}`
		);
	},
};
