import { useState, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Pagination, LoadingSpinner } from "@/components/common";
import {
	AddExpenseModal,
	EditExpenseModal,
	ExpenseDetailModal,
	ExpenseTable,
} from "@/components/expenses";
import { useFilters, usePagination } from "@/hooks";
import type { Expense } from "@/types/expense";
import type { ExpenseFilters } from "@/types/filters";
import { expenseService } from "@/services/expenseService";
import { EXPENSE_CATEGORIES } from "@/constants";

import {
	Box,
	Text,
	Flex,
	Button,
	useDisclosure,
	Container,
	Heading,
	Card,
	CardBody,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	SimpleGrid,
	Input,
	InputGroup,
	InputLeftElement,
	useToast,
 	Select,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiSearch, FiBarChart2 } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

const ExpensesPage = () => {
	const toast = useToast();

	// State for data from API
	const [expenseList, setExpenseList] = useState<Expense[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

	// Modals
	const {
		isOpen: isAddModalOpen,
		onOpen: onAddModalOpen,
		onClose: onAddModalClose,
	} = useDisclosure();

	const {
		isOpen: isEditModalOpen,
		onOpen: onEditModalOpen,
		onClose: onEditModalClose,
	} = useDisclosure();

	const {
		isOpen: isDetailModalOpen,
		onOpen: onDetailModalOpen,
		onClose: onDetailModalClose,
	} = useDisclosure();

	// Fetch function with client-side filtering
	const fetchExpenses = useCallback(
		async (filters: ExpenseFilters) => {
			try {
				const response = await expenseService.getExpenses(filters);
				let filtered = response.data || [];

				// Client-side filtering by category
				if (filters.category && filters.category !== "all") {
					filtered = filtered.filter(
						(e) => e.category === filters.category,
					);
				}

				// Client-side filtering by search query
				if (filters.searchQuery) {
					const searchLower = filters.searchQuery.toLowerCase();
					filtered = filtered.filter(
						(e) =>
							e.description
								.toLowerCase()
								.includes(searchLower) ||
							e.category
								.toLowerCase()
								.includes(searchLower),
					);
				}

				setExpenseList(filtered);
				setTotalItems(filtered.length);
			} catch (error: any) {
				console.error("Error fetching expenses:", error);
				
				let errorMessage = "Không thể tải dữ liệu chi phí";
				
				// Check for specific error types
				if (error.message?.includes("404")) {
					errorMessage = "Backend API chưa có endpoint /api/v1/stats/. Vui lòng kiểm tra backend Spring Boot đã chạy và implement endpoint này chưa.";
				} else if (error.message?.includes("401")) {
					errorMessage = "Vui lòng đăng nhập để xem chi phí";
				} else if (error.message?.includes("Network Error")) {
					errorMessage = "Backend không chạy. Vui lòng khởi động Spring Boot server tại localhost:8080";
				}
				
				toast({
					title: "Lỗi kết nối API",
					description: errorMessage,
					status: "error",
					duration: 5000,
					isClosable: true,
				});
				
				// Set empty data to prevent loading forever
				setExpenseList([]);
				setTotalItems(0);
			}
		},
		[toast],
	);

	// useFilters for filtering + pagination state
	const { filters, loading, handleFilterChange, handlePageChange } =
		useFilters<ExpenseFilters>(
			{
				page: 1,
				pageSize: ITEMS_PER_PAGE,
				searchQuery: "",
				category: "all",
			},
			fetchExpenses,
			500,
		);

	// usePagination for metadata
	const { currentPage, pageSize, pagination } = usePagination({
		initialPage: filters.page || 1,
		pageSize: filters.pageSize || ITEMS_PER_PAGE,
		initialTotal: totalItems,
	});

	// Paginate expenses
	const paginatedExpenses = expenseList.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	// Calculate statistics
	const totalExpense = expenseList.reduce(
		(sum, expense) => sum + expense.amount,
		0,
	);

	// Get category breakdown
	const categoryBreakdown = expenseList.reduce(
		(acc, expense) => {
			if (!acc[expense.category]) {
				acc[expense.category] = 0;
			}
			acc[expense.category] += expense.amount;
			return acc;
		},
		{} as Record<string, number>,
	);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const handleEdit = (expense: Expense) => {
		setSelectedExpense(expense);
		onEditModalOpen();
	};

	const handleViewDetail = (expense: Expense) => {
		setSelectedExpense(expense);
		onDetailModalOpen();
	};

	const handleRefresh = () => {
		fetchExpenses(filters);
	};

	if (loading && expenseList.length === 0) {
		return (
			<MainLayout>
				<Box
					minH="100vh"
					display="flex"
					alignItems="center"
					justifyContent="center"
				>
					<LoadingSpinner />
				</Box>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<Box minH="100vh" bg="gray.50" py={8}>
				<Container maxW="container.2xl">
					{/* Header */}
					<Flex
						direction={{ base: "column", md: "row" }}
						justify="space-between"
						align={{ base: "flex-start", md: "center" }}
						gap={{ base: 4, md: 0 }}
						mb={8}
					>
						<Box>
							<Heading
								size={{ base: "lg", md: "xl" }}
								fontWeight="800"
								color="gray.800"
								mb={2}
							>
								Quản Lý Chi Phí Phát Sinh
							</Heading>
							<Text
								color="gray.600"
								fontSize={{ base: "sm", md: "md" }}
							>
								Quản lý các chi phí điện nước, nhu yếu phẩm,
								sửa chữa
							</Text>
						</Box>
						<Button
							leftIcon={<AddIcon />}
							colorScheme="blue"
							onClick={onAddModalOpen}
							size={{ base: "md", md: "lg" }}
						>
							Thêm Chi Phí
						</Button>
					</Flex>

					{/* Statistics Cards */}
					<SimpleGrid
						columns={{ base: 1, md: 2, lg: 4 }}
						spacing={6}
						mb={8}
					>
						<Card>
							<CardBody>
								<Stat>
									<StatLabel>Tổng Chi Phí</StatLabel>
									<StatNumber color="red.600" fontSize="2xl">
										{formatCurrency(totalExpense)}
									</StatNumber>
									<StatHelpText>Tất cả thời gian</StatHelpText>
								</Stat>
							</CardBody>
						</Card>

						<Card>
							<CardBody>
								<Stat>
									<StatLabel>Số lượng khoản chi</StatLabel>
									<StatNumber color="blue.600" fontSize="2xl">
										{expenseList.length}
									</StatNumber>
									<StatHelpText>Khoản chi phí</StatHelpText>
								</Stat>
							</CardBody>
						</Card>

						<Card>
							<CardBody>
								<Stat>
									<StatLabel>Chi phí cao nhất</StatLabel>
									<StatNumber
										color="orange.600"
										fontSize="2xl"
									>
										{expenseList.length > 0
											? formatCurrency(
													Math.max(
														...expenseList.map(
															(e) => e.amount,
														),
													),
												)
											: "0 VND"}
									</StatNumber>
									<StatHelpText>Trong danh sách</StatHelpText>
								</Stat>
							</CardBody>
						</Card>

						<Card
							cursor="pointer"
							transition="all 0.2s"
							_hover={{
								shadow: "md",
								transform: "translateY(-2px)",
							}}
							onClick={onDetailModalOpen}
						>
							<CardBody>
								<Stat>
									<Flex
										justify="space-between"
										align="center"
									>
										<Box>
											<StatLabel>Phân tích</StatLabel>
											<StatNumber
												color="purple.600"
												fontSize="lg"
											>
												{Object.keys(categoryBreakdown)
													.length}{" "}
												loại
											</StatNumber>
											<StatHelpText>
												Chi tiết chi phí
											</StatHelpText>
										</Box>
										<FiBarChart2
											size={32}
											color="#805AD5"
										/>
									</Flex>
								</Stat>
							</CardBody>
						</Card>
					</SimpleGrid>

					{/* Category Breakdown Stats */}
					{Object.keys(categoryBreakdown).length > 0 && (
						<SimpleGrid columns={{ base: 1, md: 5 }} spacing={4} mb={8}>
							{Object.entries(categoryBreakdown).map(
								([category, amount]) => (
									<Card key={category} bg="white" shadow="sm">
										<CardBody>
											<Text
												fontSize="sm"
												fontWeight="semibold"
												textTransform="capitalize"
												mb={2}
											>
												{category}
											</Text>
											<Text
												fontSize="lg"
												fontWeight="bold"
												color="blue.600"
											>
												{formatCurrency(amount)}
											</Text>
										</CardBody>
									</Card>
								),
							)}
						</SimpleGrid>
					)}

					{/* Filters */}
					<Card mb={6}>
						<CardBody>
							<Flex
								gap={4}
								direction={{ base: "column", md: "row" }}
								align="flex-end"
							>
								<Box flex={1}>
									<InputGroup>
										<InputLeftElement pointerEvents="none">
											<FiSearch color="gray" />
										</InputLeftElement>
										<Input
											placeholder="Tìm kiếm theo mô tả..."
											value={
												filters.searchQuery || ""
											}
											onChange={(e) =>
												handleFilterChange(
													"searchQuery",
													e.target.value,
												)
											}
											bg="white"
										/>
									</InputGroup>
								</Box>
							<Select
								value={filters.category || "all"}
								onChange={(e) =>
									handleFilterChange(
										"category",
										e.target.value,
									)
								}
								bg="white"
								w={{ base: "full", md: "200px" }}
							>
								<option value="all">Tất cả loại</option>
								{EXPENSE_CATEGORIES.map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</Select>
						</Flex>
						</CardBody>
					</Card>

					{/* Expense Table */}
					<Card>
						<CardBody>
							<ExpenseTable
								expenses={paginatedExpenses}
								onEdit={handleEdit}
								onViewDetail={handleViewDetail}
								onDelete={handleRefresh}
							/>

							{/* Pagination */}
							{paginatedExpenses.length > 0 && (
								<Flex justify="center" mt={6}>
									<Pagination
										currentPage={currentPage}
										totalPages={pagination.totalPages}
										totalItems={totalItems}
										pageSize={pageSize}
										onPageChange={handlePageChange}
										showInfo={true}
										itemLabel="chi phí"
									/>
								</Flex>
							)}
						</CardBody>
					</Card>
				</Container>
			</Box>

			{/* Add Expense Modal */}
			<AddExpenseModal
				isOpen={isAddModalOpen}
				onClose={onAddModalClose}
				onSuccess={handleRefresh}
			/>

			{/* Edit Expense Modal */}
			<EditExpenseModal
				isOpen={isEditModalOpen}
				onClose={onEditModalClose}
				expense={selectedExpense}
				onSuccess={handleRefresh}
			/>

			{/* Expense Detail Modal */}
			<ExpenseDetailModal
				isOpen={isDetailModalOpen}
				onClose={onDetailModalClose}
				expense={selectedExpense}
			/>
		</MainLayout>
	);
};

export default ExpensesPage;
