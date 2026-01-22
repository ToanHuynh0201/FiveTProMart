import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Text,
	useDisclosure,
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
	CustomerStats,
	ExpenseReport,
	DashboardSummary,
} from "@/types/reports";
import MainLayout from "@/components/layout/MainLayout";

// Helper function to convert DateRange to yyyy-MM-dd format
// Backend expects simple date format (yyyy-MM-dd) for proper parsing
// Helper function to convert DateRange to ISO 8601 Instant format
// Backend expects Instant format (UTC timestamp)
const getDateRangeParams = (dateRange: DateRange): { startDate: string; endDate: string } => {
    const now = new Date();
    let startDate: Date;
    
    // Logic chọn ngày giữ nguyên
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
    
    // Hàm build chuỗi thủ công + ghép chữ Z vào cuối
    const toFakeUTCString = (date: Date): string => {
        const pad = (num: number) => num.toString().padStart(2, '0');
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const ms = date.getMilliseconds().toString().padStart(3, '0'); // Thêm mili giây cho chuẩn ISO

        // Kết quả: "2026-01-01T00:00:00.000Z" (Nhưng là giờ VN)
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}Z`;
    };

    const result = {
        startDate: toFakeUTCString(startDate),
        endDate: toFakeUTCString(now),
    };

    console.log('🔍 Date strings being sent to backend:', result);
    
    return result;
};
export const ReportsPage: React.FC = () => {
	const [dateRange, setDateRange] = useState<DateRange>("month");
	const [loading, setLoading] = useState(true);

	// Data states - New API
	const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
	
	// Legacy data states (commented out until components are updated)
	const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
	const [ordersData, setOrdersData] = useState<OrdersReport | null>(null);
	const [productsData, setProductsData] = useState<ProductsReport | null>(
		null,
	);
	const [categoryData, setCategoryData] = useState<CategoryReport | null>(
		null,
	);
	const [customerData, setCustomerData] = useState<CustomerStats | null>(
		null,
	);
	const [expenseData, setExpenseData] = useState<ExpenseReport | null>(null);

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
		const loadAllReports = async () => {
			setLoading(true);
			try {
				const dateParams = getDateRangeParams(dateRange);
				
				console.log('📅 Date params:', dateParams);
				
				// Load dashboard summary with new API
				const summaryResponse = await reportService.getDashboardSummary(dateParams);
				console.log('✅ Summary response:', summaryResponse);
				setDashboardData(summaryResponse.data);
				
				// TODO: Load other statistics as needed
				// const revenueChart = await reportService.getRevenueProfitChart(dateParams);
				// const ordersChart = await reportService.getOrdersChart(dateParams);
				// const categoryRevenue = await reportService.getCategoryRevenue({ ...dateParams, limit: 5 });
				// const topProducts = await reportService.getTopProducts({ ...dateParams, limit: 10 });
				
			} catch (error) {
				console.error('❌ Failed to load reports:', error);
				// Data will remain null - components handle empty states
			} finally {
				setLoading(false);
			}
		};

		loadAllReports();
	}, [dateRange]);

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
								onChange={setDateRange}
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
