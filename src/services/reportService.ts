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
			name: "Snack khoai tây Lays",
			category: "Snack",
			quantitySold: 280,
			revenue: 8400000,
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
		{
			id: "6",
			code: "SP006",
			name: "Pepsi 330ml",
			category: "Đồ uống",
			quantitySold: 410,
			revenue: 12300000,
			stock: 95,
		},
		{
			id: "7",
			code: "SP007",
			name: "Bánh mì thịt nguội",
			category: "Đồ ăn nhanh",
			quantitySold: 290,
			revenue: 8700000,
			stock: 30,
		},
		{
			id: "8",
			code: "SP008",
			name: "Trà xanh C2",
			category: "Đồ uống",
			quantitySold: 385,
			revenue: 7700000,
			stock: 180,
		},
		{
			id: "9",
			code: "SP009",
			name: "Sữa chua Vinamilk",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 340,
			revenue: 10200000,
			stock: 110,
		},
		{
			id: "10",
			code: "SP010",
			name: "Bánh quy Oreo",
			category: "Bánh kẹo",
			quantitySold: 265,
			revenue: 7950000,
			stock: 145,
		},
		{
			id: "11",
			code: "SP011",
			name: "Mì ly Hảo Hảo",
			category: "Mì ăn liền",
			quantitySold: 480,
			revenue: 4800000,
			stock: 420,
		},
		{
			id: "12",
			code: "SP012",
			name: "Sting dâu 330ml",
			category: "Đồ uống",
			quantitySold: 370,
			revenue: 11100000,
			stock: 160,
		},
		{
			id: "13",
			code: "SP013",
			name: "Xúc xích CP",
			category: "Đồ ăn nhanh",
			quantitySold: 255,
			revenue: 7650000,
			stock: 75,
		},
		{
			id: "14",
			code: "SP014",
			name: "Bánh chocopie",
			category: "Bánh kẹo",
			quantitySold: 310,
			revenue: 9300000,
			stock: 190,
		},
		{
			id: "15",
			code: "SP015",
			name: "Nước cam Teppy",
			category: "Đồ uống",
			quantitySold: 298,
			revenue: 8940000,
			stock: 125,
		},
		{
			id: "16",
			code: "SP016",
			name: "Snack Ostar",
			category: "Snack",
			quantitySold: 245,
			revenue: 7350000,
			stock: 210,
		},
		{
			id: "17",
			code: "SP017",
			name: "Sữa tươi TH True Milk",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 330,
			revenue: 9900000,
			stock: 85,
		},
		{
			id: "18",
			code: "SP018",
			name: "Kẹo dẻo Haribo",
			category: "Bánh kẹo",
			quantitySold: 220,
			revenue: 6600000,
			stock: 165,
		},
		{
			id: "19",
			code: "SP019",
			name: "Red Bull 250ml",
			category: "Đồ uống",
			quantitySold: 285,
			revenue: 8550000,
			stock: 92,
		},
		{
			id: "20",
			code: "SP020",
			name: "Bánh mì que",
			category: "Đồ ăn nhanh",
			quantitySold: 270,
			revenue: 5400000,
			stock: 140,
		},
		{
			id: "21",
			code: "SP021",
			name: "Nước tăng lực Number 1",
			category: "Đồ uống",
			quantitySold: 315,
			revenue: 9450000,
			stock: 175,
		},
		{
			id: "22",
			code: "SP022",
			name: "Poca khoai tây",
			category: "Snack",
			quantitySold: 235,
			revenue: 7050000,
			stock: 188,
		},
		{
			id: "23",
			code: "SP023",
			name: "Sữa đậu nành Fami",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 295,
			revenue: 5900000,
			stock: 155,
		},
		{
			id: "24",
			code: "SP024",
			name: "Bánh gạo Want Want",
			category: "Bánh kẹo",
			quantitySold: 250,
			revenue: 7500000,
			stock: 205,
		},
		{
			id: "25",
			code: "SP025",
			name: "Nước khoáng Lavie",
			category: "Đồ uống",
			quantitySold: 495,
			revenue: 4950000,
			stock: 380,
		},
		{
			id: "26",
			code: "SP026",
			name: "Cơm hộp Bento",
			category: "Đồ ăn nhanh",
			quantitySold: 195,
			revenue: 9750000,
			stock: 25,
		},
		{
			id: "27",
			code: "SP027",
			name: "Trà sữa Lipton",
			category: "Đồ uống",
			quantitySold: 260,
			revenue: 7800000,
			stock: 142,
		},
		{
			id: "28",
			code: "SP028",
			name: "Snack Swing",
			category: "Snack",
			quantitySold: 215,
			revenue: 6450000,
			stock: 198,
		},
		{
			id: "29",
			code: "SP029",
			name: "Sữa chua uống Yakult",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 380,
			revenue: 11400000,
			stock: 95,
		},
		{
			id: "30",
			code: "SP030",
			name: "Kẹo Alpenliebe",
			category: "Bánh kẹo",
			quantitySold: 190,
			revenue: 5700000,
			stock: 225,
		},
		{
			id: "31",
			code: "SP031",
			name: "Nước ngọt 7Up",
			category: "Đồ uống",
			quantitySold: 348,
			revenue: 10440000,
			stock: 118,
		},
		{
			id: "32",
			code: "SP032",
			name: "Hamburger",
			category: "Đồ ăn nhanh",
			quantitySold: 178,
			revenue: 8900000,
			stock: 35,
		},
		{
			id: "33",
			code: "SP033",
			name: "Trà Ô Long Tea Plus",
			category: "Đồ uống",
			quantitySold: 272,
			revenue: 8160000,
			stock: 158,
		},
		{
			id: "34",
			code: "SP034",
			name: "Rong biển Tao Kae Noi",
			category: "Snack",
			quantitySold: 228,
			revenue: 6840000,
			stock: 172,
		},
		{
			id: "35",
			code: "SP035",
			name: "Sữa chua ăn Vinamilk",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 305,
			revenue: 9150000,
			stock: 88,
		},
		{
			id: "36",
			code: "SP036",
			name: "Bánh bông lan Kinh Đô",
			category: "Bánh kẹo",
			quantitySold: 198,
			revenue: 5940000,
			stock: 135,
		},
		{
			id: "37",
			code: "SP037",
			name: "Monster Energy",
			category: "Đồ uống",
			quantitySold: 165,
			revenue: 8250000,
			stock: 68,
		},
		{
			id: "38",
			code: "SP038",
			name: "Pizza mini",
			category: "Đồ ăn nhanh",
			quantitySold: 155,
			revenue: 7750000,
			stock: 42,
		},
		{
			id: "39",
			code: "SP039",
			name: "Nước ép trái cây Twister",
			category: "Đồ uống",
			quantitySold: 242,
			revenue: 7260000,
			stock: 128,
		},
		{
			id: "40",
			code: "SP040",
			name: "Snack Slide",
			category: "Snack",
			quantitySold: 205,
			revenue: 6150000,
			stock: 185,
		},
		{
			id: "41",
			code: "SP041",
			name: "Sữa đặc Ông Thọ",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 178,
			revenue: 5340000,
			stock: 145,
		},
		{
			id: "42",
			code: "SP042",
			name: "Kẹo mút Chupa Chups",
			category: "Bánh kẹo",
			quantitySold: 325,
			revenue: 4875000,
			stock: 245,
		},
		{
			id: "43",
			code: "SP043",
			name: "Nước chanh Minute Maid",
			category: "Đồ uống",
			quantitySold: 218,
			revenue: 6540000,
			stock: 152,
		},
		{
			id: "44",
			code: "SP044",
			name: "Gà rán KFC",
			category: "Đồ ăn nhanh",
			quantitySold: 128,
			revenue: 6400000,
			stock: 0,
		},
		{
			id: "45",
			code: "SP045",
			name: "Trà chanh Fuze Tea",
			category: "Đồ uống",
			quantitySold: 235,
			revenue: 7050000,
			stock: 165,
		},
		{
			id: "46",
			code: "SP046",
			name: "Bánh quế Loacker",
			category: "Bánh kẹo",
			quantitySold: 188,
			revenue: 9400000,
			stock: 98,
		},
		{
			id: "47",
			code: "SP047",
			name: "Snack đậu phộng",
			category: "Snack",
			quantitySold: 192,
			revenue: 5760000,
			stock: 215,
		},
		{
			id: "48",
			code: "SP048",
			name: "Sữa hạt Mộc Châu",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 168,
			revenue: 5040000,
			stock: 125,
		},
		{
			id: "49",
			code: "SP049",
			name: "Kẹo cao su Doublemint",
			category: "Bánh kẹo",
			quantitySold: 285,
			revenue: 4275000,
			stock: 268,
		},
		{
			id: "50",
			code: "SP050",
			name: "Nước dừa Cocoxim",
			category: "Đồ uống",
			quantitySold: 225,
			revenue: 6750000,
			stock: 138,
		},
		{
			id: "51",
			code: "SP051",
			name: "Hotdog",
			category: "Đồ ăn nhanh",
			quantitySold: 148,
			revenue: 4440000,
			stock: 48,
		},
		{
			id: "52",
			code: "SP052",
			name: "Nước tăng lực Revive",
			category: "Đồ uống",
			quantitySold: 208,
			revenue: 6240000,
			stock: 145,
		},
		{
			id: "53",
			code: "SP053",
			name: "Snack rong biển Seleco",
			category: "Snack",
			quantitySold: 175,
			revenue: 5250000,
			stock: 195,
		},
		{
			id: "54",
			code: "SP054",
			name: "Sữa chua Probi",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 158,
			revenue: 4740000,
			stock: 112,
		},
		{
			id: "55",
			code: "SP055",
			name: "Socola Kitkat",
			category: "Bánh kẹo",
			quantitySold: 172,
			revenue: 8600000,
			stock: 88,
		},
		{
			id: "56",
			code: "SP056",
			name: "Nước ngọt Mirinda",
			category: "Đồ uống",
			quantitySold: 198,
			revenue: 5940000,
			stock: 168,
		},
		{
			id: "57",
			code: "SP057",
			name: "Mì tôm chua cay",
			category: "Mì ăn liền",
			quantitySold: 445,
			revenue: 4450000,
			stock: 385,
		},
		{
			id: "58",
			code: "SP058",
			name: "Bánh tráng trộn",
			category: "Snack",
			quantitySold: 165,
			revenue: 3300000,
			stock: 225,
		},
		{
			id: "59",
			code: "SP059",
			name: "Sữa tươi Dalat Milk",
			category: "Sữa và sản phẩm từ sữa",
			quantitySold: 142,
			revenue: 4260000,
			stock: 95,
		},
		{
			id: "60",
			code: "SP060",
			name: "Kẹo sữa Milkita",
			category: "Bánh kẹo",
			quantitySold: 248,
			revenue: 3720000,
			stock: 285,
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
			percentage: 28.5,
		},
		{
			category: "Đồ ăn nhanh",
			revenue: 22100000,
			quantitySold: 850,
			productCount: 32,
			percentage: 22.3,
		},
		{
			category: "Snack",
			revenue: 15400000,
			quantitySold: 680,
			productCount: 56,
			percentage: 15.5,
		},
		{
			category: "Bánh kẹo",
			revenue: 9800000,
			quantitySold: 420,
			productCount: 38,
			percentage: 9.9,
		},
		{
			category: "Sữa và sản phẩm từ sữa",
			revenue: 4800000,
			quantitySold: 190,
			productCount: 22,
			percentage: 4.8,
		},
		{
			category: "Đồ ăn đóng hộp",
			revenue: 3200000,
			quantitySold: 150,
			productCount: 18,
			percentage: 3.2,
		},
		{
			category: "Bánh mì và ngũ cốc",
			revenue: 2900000,
			quantitySold: 140,
			productCount: 15,
			percentage: 2.9,
		},
		{
			category: "Gia vị và đồ khô",
			revenue: 2400000,
			quantitySold: 120,
			productCount: 25,
			percentage: 2.4,
		},
		{
			category: "Đồ đông lạnh",
			revenue: 2100000,
			quantitySold: 95,
			productCount: 12,
			percentage: 2.1,
		},
		{
			category: "Rau củ quả tươi",
			revenue: 1800000,
			quantitySold: 85,
			productCount: 20,
			percentage: 1.8,
		},
		{
			category: "Mì ăn liền",
			revenue: 1600000,
			quantitySold: 160,
			productCount: 8,
			percentage: 1.6,
		},
		{
			category: "Nước sốt và gia vị",
			revenue: 1300000,
			quantitySold: 70,
			productCount: 14,
			percentage: 1.3,
		},
		{
			category: "Trà và cà phê",
			revenue: 1100000,
			quantitySold: 65,
			productCount: 10,
			percentage: 1.1,
		},
		{
			category: "Bánh tráng và đồ vặt",
			revenue: 950000,
			quantitySold: 55,
			productCount: 16,
			percentage: 0.96,
		},
		{
			category: "Đồ dùng cá nhân",
			revenue: 800000,
			quantitySold: 40,
			productCount: 12,
			percentage: 0.81,
		},
		{
			category: "Đồ gia dụng",
			revenue: 650000,
			quantitySold: 30,
			productCount: 9,
			percentage: 0.66,
		},
		{
			category: "Thực phẩm chức năng",
			revenue: 580000,
			quantitySold: 28,
			productCount: 11,
			percentage: 0.59,
		},
		{
			category: "Thuốc lá và rượu bia",
			revenue: 520000,
			quantitySold: 45,
			productCount: 6,
			percentage: 0.52,
		},
		{
			category: "Đồ chơi trẻ em",
			revenue: 450000,
			quantitySold: 22,
			productCount: 8,
			percentage: 0.45,
		},
		{
			category: "Văn phòng phẩm",
			revenue: 380000,
			quantitySold: 35,
			productCount: 15,
			percentage: 0.38,
		},
		{
			category: "Mỹ phẩm làm đẹp",
			revenue: 320000,
			quantitySold: 18,
			productCount: 7,
			percentage: 0.32,
		},
		{
			category: "Đồ điện tử nhỏ",
			revenue: 280000,
			quantitySold: 12,
			productCount: 5,
			percentage: 0.28,
		},
		{
			category: "Sách và tạp chí",
			revenue: 240000,
			quantitySold: 20,
			productCount: 12,
			percentage: 0.24,
		},
		{
			category: "Đồ thú cưng",
			revenue: 200000,
			quantitySold: 15,
			productCount: 8,
			percentage: 0.20,
		},
		{
			category: "Hàng thủ công mỹ nghệ",
			revenue: 160000,
			quantitySold: 10,
			productCount: 6,
			percentage: 0.16,
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
