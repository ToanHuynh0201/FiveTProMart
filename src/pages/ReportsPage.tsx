import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
	FiDollarSign,
	FiShoppingCart,
	FiPackage,
	FiTrendingUp,
	FiUsers,
	FiCreditCard,
	FiAlertCircle,
} from "react-icons/fi";
import {
	MetricCard,
	DateRangePicker,
	RevenueChart,
	OrdersChart,
	ProductsChart,
	CategoryChart,
	RevenueDetailModal,
	OrdersDetailModal,
	ProductsDetailModal,
	CategoryDetailModal,
	ExpenseChart,
	ExpenseDetailModal,
} from "@/components/reports";
import { LoadingSpinner } from "@/components/common";
import { reportService } from "@/services/reportService";
import type {
	DateRange,
	RevenueReport,
	OrdersReport,
	ProductsReport,
	CategoryReport,
	ExpenseReport,
	DashboardSummary,
} from "@/types/reports";
import MainLayout from "@/components/layout/MainLayout";
const formatDateForAPI = (date: Date): string => {
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${day}-${month}-${year}`;
};
// Helper function to convert DateRange to yyyy-MM-dd format
// Backend expects simple date format (yyyy-MM-dd) for proper parsing
// Helper function to convert DateRange to ISO 8601 Instant format
// Backend expects Instant format (UTC timestamp)

const getDateRangeParams = (
	dateRange: DateRange,
): { startDate: string; endDate: string } => {
	const now = new Date();
	let startDate: Date;

	switch (dateRange) {
		case "today":
			// Hôm nay: từ 00:00 hôm nay đến bây giờ
			startDate = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate(),
			);
			break;
		case "week":
			// 7 ngày qua: từ 7 ngày trước đến nay
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 7);
			break;
		case "month":
			// 30 ngày qua: từ 30 ngày trước đến nay
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 30);
			break;
		case "quarter":
			// 3 tháng qua: từ 90 ngày trước đến nay
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 90);
			break;
		case "year":
			// Năm nay: từ đầu năm đến nay
			startDate = new Date(now.getFullYear(), 0, 1);
			break;
		default:
			// Mặc định: 30 ngày qua
			startDate = new Date(now);
			startDate.setDate(now.getDate() - 30);
	}

	const result = {
		startDate: formatDateForAPI(startDate),
		endDate: formatDateForAPI(now),
	};

	console.log("🔍 Date strings being sent to backend:", result);

	return result;
};
export const ReportsPage: React.FC = () => {
	const [dateRange, setDateRange] = useState<DateRange>("month");
	const [loading, setLoading] = useState(true);
	const toast = useToast();

	// Data states - Statistics API
	const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
		null,
	);

	// Legacy data states (for compatibility with existing components)
	const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
	const [ordersData, setOrdersData] = useState<OrdersReport | null>(null);
	const [productsData, setProductsData] = useState<ProductsReport | null>(
		null,
	);
	const [categoryData, setCategoryData] = useState<CategoryReport | null>(
		null,
	);
	const [expenseData] = useState<ExpenseReport | null>(null);

	// Modal states
	const {
		isOpen: isRevenueModalOpen,
		onOpen: onRevenueModalOpen,
		onClose: onRevenueModalClose,
	} = useDisclosure();

	const {
		isOpen: isOrdersModalOpen,
		onOpen: onOrdersModalOpen,
		onClose: onOrdersModalClose,
	} = useDisclosure();

	const {
		isOpen: isProductsModalOpen,
		onOpen: onProductsModalOpen,
		onClose: onProductsModalClose,
	} = useDisclosure();

	const {
		isOpen: isCategoryModalOpen,
		onOpen: onCategoryModalOpen,
		onClose: onCategoryModalClose,
	} = useDisclosure();

	const {
		isOpen: isExpenseModalOpen,
		onOpen: onExpenseModalOpen,
		onClose: onExpenseModalClose,
	} = useDisclosure();

	// Fetch data
	useEffect(() => {
		console.log(
			"🔄 useEffect triggered - dateRange changed to:",
			dateRange,
		);

		const loadAllReports = async () => {
			setLoading(true);
			try {
				const dateParams = getDateRangeParams(dateRange);

				console.log("📅 Date params:", dateParams);

				// 1.1 Load dashboard summary
				const summaryResponse =
					await reportService.getDashboardSummary(dateParams);
				console.log("✅ Summary response:", summaryResponse);
				if (summaryResponse.success) {
					setDashboardData(summaryResponse.data);
				}

				// 1.2 Load revenue & profit chart
				const revenueProfitResponse =
					await reportService.getRevenueProfitChart(dateParams);
				console.log(
					"✅ Revenue-Profit chart response:",
					revenueProfitResponse,
				);
				if (revenueProfitResponse.success) {
					// Convert to legacy format for existing RevenueChart component
					setRevenueData({
						period: { type: dateRange },
						totalRevenue: summaryResponse.data.totalRevenue,
						totalCost: summaryResponse.data.incurredStats,
						totalProfit: summaryResponse.data.netProfit,
						profitMargin:
							summaryResponse.data.totalRevenue > 0
								? (summaryResponse.data.netProfit /
										summaryResponse.data.totalRevenue) *
									100
								: 0,
						data: revenueProfitResponse.data.map((item) => ({
							date: item.date,
							revenue: item.revenue,
							cost: item.expense,
							profit: item.profit,
							orders: 0, // Not available in new API
						})),
						growth: 0, // Not available in new API
					});
				}

				// 1.3 Load orders chart
				const ordersChartResponse =
					await reportService.getOrdersChart(dateParams);
				console.log("✅ Orders chart response:", ordersChartResponse);
				if (ordersChartResponse.success) {
					// Convert to legacy format for existing OrdersChart component
					setOrdersData({
						period: { type: dateRange },
						totalOrders: summaryResponse.data.totalOrders,
						completedOrders: summaryResponse.data.totalOrders,
						cancelledOrders: 0,
						completionRate: 100,
						averageOrderValue:
							summaryResponse.data.averageOrderValue,
						data: ordersChartResponse.data.map((item) => ({
							date: item.date,
							totalOrders: item.completedOrders,
							completedOrders: item.completedOrders,
							cancelledOrders: 0,
							averageValue:
								summaryResponse.data.averageOrderValue,
						})),
						growth: 0,
					});
				}

				// 1.4 Load category revenue (top 5 categories)
				const categoryRevenueResponse =
					await reportService.getCategoryRevenue({
						...dateParams,
						limit: 5,
					});
				console.log(
					"✅ Category revenue response:",
					categoryRevenueResponse,
				);
				if (categoryRevenueResponse.success) {
					// Convert to legacy format for existing CategoryChart component
					const totalRevenue = categoryRevenueResponse.data.reduce(
						(sum, cat) => sum + cat.totalRevenue,
						0,
					);
					setCategoryData({
						period: { type: dateRange },
						categories: categoryRevenueResponse.data.map((cat) => ({
							category: cat.categoryName,
							revenue: cat.totalRevenue,
							quantitySold: cat.totalQuantitySold,
							productCount: cat.orderCount,
							percentage: Math.round(
								(cat.totalRevenue / totalRevenue) * 100,
							),
						})),
						totalRevenue,
					});
				}

				// 1.5 Load top selling products (top 10)
				const topProductsResponse = await reportService.getTopProducts({
					...dateParams,
					limit: 10,
				});
				console.log("✅ Top products response:", topProductsResponse);
				if (topProductsResponse.success) {
					// Convert to legacy format for existing ProductsChart component
					setProductsData({
						period: { type: dateRange },
						topSellingProducts: topProductsResponse.data.map(
							(product) => ({
								id: product.productId,
								code: product.productId, // Using ID as code for now
								name: product.productName,
								category: product.categoryName,
								quantitySold: product.totalQuantitySold,
								revenue: product.totalRevenue,
								stock:
									typeof product.totalStockQuantity ===
									"number"
										? product.totalStockQuantity
										: 0,
							}),
						),
						totalProductsSold:
							summaryResponse.data.totalProductsSold,
						totalCategories: categoryRevenueResponse.data.length,
						lowStockProducts: 0, // Not available in new API
					});
				}
			} catch (error) {
				console.error("❌ Failed to load reports:", error);
				toast({
					title: "Lỗi tải báo cáo",
					description:
						"Không thể tải dữ liệu báo cáo. Vui lòng thử lại.",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
				// Data will remain null - components handle empty states
			} finally {
				setLoading(false);
			}
		};

		loadAllReports();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dateRange]); // Only re-run when dateRange changes

	const formatCurrency = (value: number) => {
		if (value >= 1000000000) {
			return `${(value / 1000000000).toFixed(1)}B`;
		}
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(0)}K`;
		}
		return value.toString();
	};

	return (
		<MainLayout>
			<Box
				minH="100vh"
				bg="gray.50"
				py={8}>
				<Container maxW="container.2xl">
					{/* Header */}
					<Flex
						direction={{ base: "column", md: "row" }}
						justify="space-between"
						align={{ base: "flex-start", md: "center" }}
						gap={{ base: 4, md: 0 }}
						mb={{ base: 6, md: 8 }}>
						<Box>
							<Heading
								size={{ base: "lg", md: "xl" }}
								fontWeight="800"
								color="gray.800"
								mb={2}>
								Báo cáo & Thống kê
							</Heading>
							<Text
								color="gray.600"
								fontSize={{ base: "md", md: "lg" }}>
								Tổng quan và phân tích dữ liệu kinh doanh
							</Text>
						</Box>
						<Box w={{ base: "full", md: "auto" }}>
							<DateRangePicker
								value={dateRange}
								onChange={(range) => {
									setDateRange(range);
								}}
							/>
						</Box>
					</Flex>

					{loading && (
						<Box
							h="100vh"
							display="flex"
							alignItems="center"
							justifyContent="center">
							<LoadingSpinner />
						</Box>
					)}

					{/* Overview Metrics */}
					<Grid
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(4, 1fr)",
						}}
						gap={{ base: 4, md: 6 }}
						mb={{ base: 6, md: 8 }}>
						<MetricCard
							title="Tổng Doanh thu"
							value={`${formatCurrency(
								dashboardData?.totalRevenue || 0,
							)}`}
							suffix=" đ"
							icon={FiDollarSign}
							bgGradient="linear(to-br, brand.500, brand.600)"
							onClick={onRevenueModalOpen}
						/>
						<MetricCard
							title="Lợi nhuận"
							value={`${formatCurrency(
								dashboardData?.netProfit || 0,
							)}`}
							suffix=" đ"
							icon={FiTrendingUp}
							bgGradient="linear(to-br, success.500, green.600)"
							onClick={onRevenueModalOpen}
						/>
						<MetricCard
							title="Tổng Đơn hàng"
							value={dashboardData?.totalOrders || 0}
							icon={FiShoppingCart}
							bgGradient="linear(to-br, purple.500, purple.600)"
							onClick={onOrdersModalOpen}
						/>
						<MetricCard
							title="Sản phẩm bán"
							value={dashboardData?.totalProductsSold || 0}
							icon={FiPackage}
							bgGradient="linear(to-br, orange.500, orange.600)"
							onClick={onProductsModalOpen}
						/>
					</Grid>

					{/* Secondary Metrics */}
					<Grid
						templateColumns={{
							base: "1fr",
							sm: "repeat(2, 1fr)",
							lg: "repeat(4, 1fr)",
						}}
						gap={{ base: 4, md: 6 }}
						mb={{ base: 6, md: 8 }}>
						<MetricCard
							title="Giá trị đơn TB"
							value={`${formatCurrency(
								dashboardData?.averageOrderValue || 0,
							)}`}
							suffix=" đ"
							icon={FiCreditCard}
							bgGradient="linear(to-br, teal.500, teal.600)"
						/>
						<MetricCard
							title="Tổng khách hàng"
							value={dashboardData?.totalCustomers || 0}
							icon={FiUsers}
							bgGradient="linear(to-br, pink.500, pink.600)"
						/>
						<MetricCard
							title="Khách hàng mới"
							value={dashboardData?.newCustomers || 0}
							icon={FiUsers}
							bgGradient="linear(to-br, cyan.500, cyan.600)"
						/>
						<MetricCard
							title="Chi phí phát sinh"
							value={`${formatCurrency(dashboardData?.incurredStats || 0)}`}
							suffix=" đ"
							icon={FiAlertCircle}
							bgGradient="linear(to-br, red.500, red.600)"
							onClick={onExpenseModalOpen}
						/>
					</Grid>

					{/* Charts Section */}
					<Box mb={{ base: 4, md: 6 }}>
						{revenueData && (
							<RevenueChart
								data={revenueData}
								onExpand={onRevenueModalOpen}
							/>
						)}
					</Box>

					<Grid
						templateColumns={{
							base: "1fr",
							lg: "repeat(2, 1fr)",
						}}
						gap={{ base: 4, md: 6 }}
						mb={{ base: 4, md: 6 }}>
						{ordersData && (
							<OrdersChart
								data={ordersData}
								onExpand={onOrdersModalOpen}
							/>
						)}
						{categoryData && (
							<CategoryChart
								data={categoryData}
								onExpand={onCategoryModalOpen}
							/>
						)}
					</Grid>

					<Box mb={{ base: 4, md: 6 }}>
						{productsData && (
							<ProductsChart
								data={productsData}
								onExpand={onProductsModalOpen}
							/>
						)}
					</Box>

					<Box mb={{ base: 4, md: 6 }}>
						{expenseData && (
							<ExpenseChart
								data={expenseData}
								onExpand={onExpenseModalOpen}
							/>
						)}
					</Box>

					{/* Detail Modals */}
					{revenueData && (
						<RevenueDetailModal
							isOpen={isRevenueModalOpen}
							onClose={onRevenueModalClose}
							data={revenueData}
						/>
					)}
					{ordersData && (
						<OrdersDetailModal
							isOpen={isOrdersModalOpen}
							onClose={onOrdersModalClose}
							data={ordersData}
						/>
					)}
					{productsData && (
						<ProductsDetailModal
							isOpen={isProductsModalOpen}
							onClose={onProductsModalClose}
							data={productsData}
						/>
					)}
					{categoryData && (
						<CategoryDetailModal
							isOpen={isCategoryModalOpen}
							onClose={onCategoryModalClose}
							data={categoryData}
						/>
					)}
					{expenseData && (
						<ExpenseDetailModal
							isOpen={isExpenseModalOpen}
							onClose={onExpenseModalClose}
							data={expenseData}
						/>
					)}
				</Container>
			</Box>
		</MainLayout>
	);
};
