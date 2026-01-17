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
	DateRangeFilter,
	RevenueReport,
	OrdersReport,
	ProductsReport,
	CategoryReport,
	CustomerStats,
	ExpenseReport,
} from "@/types/reports";
import MainLayout from "@/components/layout/MainLayout";

export const ReportsPage: React.FC = () => {
	const toast = useToast();
	const [dateRange, setDateRange] = useState<DateRange>("month");
	const [loading, setLoading] = useState(true);

	// Data states
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
				// Load all reports in parallel
				const [revenue, orders, products, category, customers, expenses] = await Promise.all([
					reportService.getRevenueReport(dateRange),
					reportService.getOrdersReport(dateRange),
					reportService.getProductsReport(dateRange),
					reportService.getCategoryReport(dateRange),
					reportService.getCustomerStats(),
					reportService.getExpenseReport(dateRange),
				]);
				
				setRevenueData(revenue);
				setOrdersData(orders);
				setProductsData(products);
				setCategoryData(category);
				setCustomerData(customers);
				setExpenseData(expenses);
			} catch {
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
								revenueData?.totalRevenue || 0,
							)}`}
							suffix=" đ"
							icon={FiDollarSign}
							bgGradient="linear(to-br, brand.500, brand.600)"
							growth={revenueData?.growth}
							onClick={onRevenueModalOpen}
						/>
						<MetricCard
							title="Lợi nhuận"
							value={`${formatCurrency(
								revenueData?.totalProfit || 0,
							)}`}
							suffix=" đ"
							icon={FiTrendingUp}
							bgGradient="linear(to-br, success.500, green.600)"
							growth={revenueData?.growth}
							onClick={onRevenueModalOpen}
						/>
						<MetricCard
							title="Tổng Đơn hàng"
							value={ordersData?.totalOrders || 0}
							icon={FiShoppingCart}
							bgGradient="linear(to-br, purple.500, purple.600)"
							growth={ordersData?.growth}
							onClick={onOrdersModalOpen}
						/>
						<MetricCard
							title="Sản phẩm bán"
							value={productsData?.totalProductsSold || 0}
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
								ordersData?.averageOrderValue || 0,
							)}`}
							suffix=" đ"
							icon={FiCreditCard}
							bgGradient="linear(to-br, teal.500, teal.600)"
						/>
						<MetricCard
							title="Tổng khách hàng"
							value={customerData?.totalCustomers || 0}
							icon={FiUsers}
							bgGradient="linear(to-br, pink.500, pink.600)"
						/>
						<MetricCard
							title="Khách hàng mới"
							value={customerData?.newCustomers || 0}
							icon={FiUsers}
							bgGradient="linear(to-br, cyan.500, cyan.600)"
						/>
						<MetricCard
							title="Chi phí phát sinh"
							value={`${formatCurrency(expenseData?.totalExpense || 0)}`}
							suffix=" đ"
							icon={FiAlertCircle}
							bgGradient="linear(to-br, red.500, red.600)"
							growth={expenseData?.growth}
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
