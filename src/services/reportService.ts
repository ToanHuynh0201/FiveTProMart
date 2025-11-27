/**
 * Report Service
 * Handles report data fetching and processing
 */

import type {
	RevenueReport,
	OrdersReport,
	ProductsReport,
	CategoryReport,
	PaymentReport,
	StaffReport,
	CustomerStats,
	DashboardStats,
	DateRangeFilter,
	RevenueDataPoint,
	OrdersDataPoint,
	TopProduct,
	CategoryPerformance,
	PaymentMethodData,
	StaffPerformance,
} from "@/types/reports";

/**
 * Generate mock revenue data for testing
 */
const generateMockRevenueData = (days: number): RevenueDataPoint[] => {
	const data: RevenueDataPoint[] = [];
	const today = new Date();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		const revenue = Math.floor(Math.random() * 50000000 + 20000000); // 20M - 70M VND
		const cost = Math.floor(revenue * (0.5 + Math.random() * 0.2)); // 50-70% of revenue
		const profit = revenue - cost;
		const orders = Math.floor(Math.random() * 100 + 50); // 50-150 orders

		data.push({
			date: date.toISOString().split("T")[0],
			revenue,
			cost,
			profit,
			orders,
		});
	}

	return data;
};

/**
 * Generate mock orders data
 */
const generateMockOrdersData = (days: number): OrdersDataPoint[] => {
	const data: OrdersDataPoint[] = [];
	const today = new Date();

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date(today);
		date.setDate(date.getDate() - i);

		const totalOrders = Math.floor(Math.random() * 100 + 50);
		const completedOrders = Math.floor(
			totalOrders * (0.85 + Math.random() * 0.1),
		);
		const cancelledOrders = totalOrders - completedOrders;
		const averageValue = Math.floor(Math.random() * 500000 + 200000);

		data.push({
			date: date.toISOString().split("T")[0],
			totalOrders,
			completedOrders,
			cancelledOrders,
			averageValue,
		});
	}

	return data;
};

/**
 * Get revenue report
 */
export const getRevenueReport = async (
	period: DateRangeFilter,
): Promise<RevenueReport> => {
	// Simulate API call
	await new Promise((resolve) => setTimeout(resolve, 500));

	const days = period.type === "today" ? 1 : period.type === "week" ? 7 : 30;
	const data = generateMockRevenueData(days);

	const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
	const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
	const totalProfit = totalRevenue - totalCost;
	const profitMargin = (totalProfit / totalRevenue) * 100;

	return {
		period,
		totalRevenue,
		totalCost,
		totalProfit,
		profitMargin,
		data,
		growth: Math.random() * 30 - 10, // -10% to +20%
	};
};

/**
 * Get orders report
 */
export const getOrdersReport = async (
	period: DateRangeFilter,
): Promise<OrdersReport> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const days = period.type === "today" ? 1 : period.type === "week" ? 7 : 30;
	const data = generateMockOrdersData(days);

	const totalOrders = data.reduce((sum, item) => sum + item.totalOrders, 0);
	const completedOrders = data.reduce(
		(sum, item) => sum + item.completedOrders,
		0,
	);
	const cancelledOrders = data.reduce(
		(sum, item) => sum + item.cancelledOrders,
		0,
	);
	const completionRate = (completedOrders / totalOrders) * 100;
	const averageOrderValue =
		data.reduce((sum, item) => sum + item.averageValue, 0) / data.length;

	return {
		period,
		totalOrders,
		completedOrders,
		cancelledOrders,
		completionRate,
		averageOrderValue,
		data,
		growth: Math.random() * 25 - 5,
	};
};

/**
 * Get products report
 */
export const getProductsReport = async (
	period: DateRangeFilter,
): Promise<ProductsReport> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const mockProducts: TopProduct[] = [
		{
			id: "1",
			code: "SP001",
			name: "Coca Cola 330ml",
			category: "Đồ uống",
			quantitySold: 450,
			revenue: 13500000,
			stock: 120,
		},
		{
			id: "2",
			code: "SP002",
			name: "Bánh mì Sandwich",
			category: "Đồ ăn nhanh",
			quantitySold: 380,
			revenue: 11400000,
			stock: 45,
		},
		{
			id: "3",
			code: "SP003",
			name: "Cà phê sữa đá",
			category: "Đồ uống",
			quantitySold: 320,
			revenue: 9600000,
			stock: 0,
		},
		{
			id: "4",
			code: "SP004",
			name: "Snack khoai tây",
			category: "Snack",
			quantitySold: 280,
			revenue: 5600000,
			stock: 200,
		},
		{
			id: "5",
			code: "SP005",
			name: "Nước suối Aquafina",
			category: "Đồ uống",
			quantitySold: 520,
			revenue: 5200000,
			stock: 350,
		},
	];

	return {
		period,
		topSellingProducts: mockProducts,
		totalProductsSold: mockProducts.reduce(
			(sum, p) => sum + p.quantitySold,
			0,
		),
		totalCategories: new Set(mockProducts.map((p) => p.category)).size,
		lowStockProducts: mockProducts.filter((p) => p.stock < 50).length,
	};
};

/**
 * Get category report
 */
export const getCategoryReport = async (
	period: DateRangeFilter,
): Promise<CategoryReport> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const categories: CategoryPerformance[] = [
		{
			category: "Đồ uống",
			revenue: 28300000,
			quantitySold: 1290,
			productCount: 45,
			percentage: 35,
		},
		{
			category: "Đồ ăn nhanh",
			revenue: 22100000,
			quantitySold: 850,
			productCount: 32,
			percentage: 28,
		},
		{
			category: "Snack",
			revenue: 15400000,
			quantitySold: 680,
			productCount: 56,
			percentage: 19,
		},
		{
			category: "Bánh kẹo",
			revenue: 9800000,
			quantitySold: 420,
			productCount: 38,
			percentage: 12,
		},
		{
			category: "Khác",
			revenue: 5400000,
			quantitySold: 230,
			productCount: 28,
			percentage: 6,
		},
	];

	const totalRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);

	return {
		period,
		categories,
		totalRevenue,
	};
};

/**
 * Get payment methods report
 */
export const getPaymentReport = async (
	period: DateRangeFilter,
): Promise<PaymentReport> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const methods: PaymentMethodData[] = [
		{
			method: "Tiền mặt",
			count: 450,
			amount: 45000000,
			percentage: 52,
		},
		{
			method: "Chuyển khoản",
			count: 280,
			amount: 32000000,
			percentage: 37,
		},
		{
			method: "Thẻ",
			count: 95,
			amount: 9500000,
			percentage: 11,
		},
	];

	const totalTransactions = methods.reduce((sum, m) => sum + m.count, 0);
	const totalAmount = methods.reduce((sum, m) => sum + m.amount, 0);

	return {
		period,
		methods,
		totalTransactions,
		totalAmount,
	};
};

/**
 * Get staff performance report
 */
export const getStaffReport = async (
	period: DateRangeFilter,
): Promise<StaffReport> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	const staffPerformance: StaffPerformance[] = [
		{
			staffId: "NV001",
			staffName: "Nguyễn Văn A",
			totalOrders: 180,
			totalRevenue: 45000000,
			averageOrderValue: 250000,
			shiftsWorked: 24,
		},
		{
			staffId: "NV002",
			staffName: "Trần Thị B",
			totalOrders: 165,
			totalRevenue: 38000000,
			averageOrderValue: 230000,
			shiftsWorked: 22,
		},
		{
			staffId: "NV003",
			staffName: "Lê Văn C",
			totalOrders: 142,
			totalRevenue: 32000000,
			averageOrderValue: 225000,
			shiftsWorked: 20,
		},
	];

	return {
		period,
		staffPerformance,
		totalStaff: staffPerformance.length,
	};
};

/**
 * Get customer statistics
 */
export const getCustomerStats = async (
	_period: DateRangeFilter,
): Promise<CustomerStats> => {
	await new Promise((resolve) => setTimeout(resolve, 500));

	return {
		totalCustomers: 1250,
		newCustomers: 185,
		returningCustomers: 1065,
		averageOrdersPerCustomer: 3.2,
		customerRetentionRate: 85.2,
	};
};

/**
 * Get dashboard stats (all reports combined)
 */
export const getDashboardStats = async (
	period: DateRangeFilter,
): Promise<DashboardStats> => {
	const [revenue, orders, products, customers, payments] = await Promise.all([
		getRevenueReport(period),
		getOrdersReport(period),
		getProductsReport(period),
		getCustomerStats(period),
		getPaymentReport(period),
	]);

	return {
		revenue,
		orders,
		products,
		customers,
		payments,
	};
};
