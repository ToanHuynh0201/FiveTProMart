import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Pagination, LoadingSpinner } from "@/components/common";
import { AddExpenseModal, ExpenseDetailModal } from "@/components/expenses";
import { usePagination, useFilters } from "@/hooks";
import type { Expense } from "@/types/reports";
import type { ExpenseFilters } from "@/types/filters";
import { expenseService } from "@/services/expenseService";

import {
	Box,
	Text,
	Flex,
	Button,
	useDisclosure,
	Container,
	Heading,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	IconButton,
	useToast,
	Select,
	Input,
	InputGroup,
	InputLeftElement,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	Card,
	CardBody,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	SimpleGrid,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import {
	FiSearch,
	FiMoreVertical,
	FiTrash2,
	FiBarChart2,
} from "react-icons/fi";
import { useRef } from "react";

const ITEMS_PER_PAGE = 10;

const ExpensesPage = () => {
	const toast = useToast();

	// State for data from API
	const [expenseList, setExpenseList] = useState<Expense[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);

	const {
		isOpen: isAddModalOpen,
		onOpen: onAddModalOpen,
		onClose: onAddModalClose,
	} = useDisclosure();

	const {
		isOpen: isDeleteAlertOpen,
		onOpen: onDeleteAlertOpen,
		onClose: onDeleteAlertClose,
	} = useDisclosure();

	const {
		isOpen: isDetailModalOpen,
		onOpen: onDetailModalOpen,
		onClose: onDetailModalClose,
	} = useDisclosure();

	// Fetch function for API call
	const fetchExpenses = async (filters: ExpenseFilters) => {
		const response = await expenseService.getExpenses(filters);
		setExpenseList(response.data);
		setTotalItems(response.pagination.totalItems);
	};

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

	// usePagination for metadata only
	const { currentPage, pageSize, pagination, goToPage } = usePagination({
		initialPage: filters.page,
		pageSize: filters.pageSize,
		initialTotal: totalItems,
	});

	// Sync pagination with filters
	useEffect(() => {
		if (currentPage !== filters.page) {
			goToPage(filters.page);
		}
	}, [filters.page, currentPage, goToPage]);

	// Calculate statistics
	const totalExpense = expenseList.reduce(
		(sum, expense) => sum + expense.amount,
		0,
	);
	const monthExpense = expenseList
		.filter((expense) => {
			const expenseDate = new Date(expense.date);
			const now = new Date();
			return (
				expenseDate.getMonth() === now.getMonth() &&
				expenseDate.getFullYear() === now.getFullYear()
			);
		})
		.reduce((sum, expense) => sum + expense.amount, 0);

	// Calculate average expense per month
	const uniqueMonths = new Set(
		expenseList.map((expense) => {
			const date = new Date(expense.date);
			return `${date.getFullYear()}-${date.getMonth()}`;
		}),
	);
	const monthCount = uniqueMonths.size > 0 ? uniqueMonths.size : 1;
	const averagePerMonth = totalExpense / monthCount;

	const handleAddExpense = async (_expense: Omit<Expense, "id">) => {
		try {
			await expenseService.createExpense(_expense);
			await fetchExpenses(filters);
			onAddModalClose();
			toast({
				title: "Thành công",
				description: "Đã thêm chi phí mới",
				status: "success",
				duration: 3000,
			});
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Không thể thêm chi phí",
				status: "error",
				duration: 3000,
			});
		}
	};

	const handleDeleteClick = (id: string) => {
		setExpenseToDelete(id);
		onDeleteAlertOpen();
	};

	const handleDeleteConfirm = async () => {
		if (!expenseToDelete) return;

		try {
			await expenseService.deleteExpense(expenseToDelete);
			await fetchExpenses(filters);
			toast({
				title: "Thành công",
				description: "Đã xóa chi phí",
				status: "success",
				duration: 3000,
			});
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Không thể xóa chi phí",
				status: "error",
				duration: 3000,
			});
		} finally {
			setExpenseToDelete(null);
			onDeleteAlertClose();
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("vi-VN");
	};

	const getExpenseCategoryLabel = (category: string): string => {
		const labels: Record<string, string> = {
			electricity: "Điện",
			water: "Nước",
			supplies: "Nhu yếu phẩm",
			repairs: "Sửa chữa",
			other: "Khác",
		};
		return labels[category] || category;
	};

	if (loading) {
		return (
			<MainLayout>
				<Box
					minH="100vh"
					display="flex"
					alignItems="center"
					justifyContent="center">
					<LoadingSpinner />
				</Box>
			</MainLayout>
		);
	}

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
						mb={8}>
						<Box>
							<Heading
								size={{ base: "lg", md: "xl" }}
								fontWeight="800"
								color="gray.800"
								mb={2}>
								Quản Lý Chi Phí Phát Sinh
							</Heading>
							<Text
								color="gray.600"
								fontSize={{ base: "md", md: "lg" }}>
								Quản lý các chi phí điện nước, nhu yếu phẩm, sửa
								chữa
							</Text>
						</Box>
						<Button
							leftIcon={<AddIcon />}
							colorScheme="blue"
							onClick={onAddModalOpen}
							size={{ base: "md", md: "lg" }}>
							Thêm Chi Phí
						</Button>
					</Flex>

					{/* Statistics Cards */}
					<SimpleGrid
						columns={{ base: 1, md: 2, lg: 5 }}
						spacing={6}
						mb={8}>
						<Card>
							<CardBody>
								<Stat>
									<StatLabel>Tổng Chi Phí</StatLabel>
									<StatNumber color="red.600">
										{formatCurrency(totalExpense)}
									</StatNumber>
									<StatHelpText>
										Tất cả thời gian
									</StatHelpText>
								</Stat>
							</CardBody>
						</Card>
						<Card>
							<CardBody>
								<Stat>
									<StatLabel>Chi Phí Tháng Này</StatLabel>
									<StatNumber color="orange.600">
										{formatCurrency(monthExpense)}
									</StatNumber>
									<StatHelpText>
										{new Date().toLocaleDateString(
											"vi-VN",
											{
												month: "long",
												year: "numeric",
											},
										)}
									</StatHelpText>
								</Stat>
							</CardBody>
						</Card>
						<Card>
							<CardBody>
								<Stat>
									<StatLabel>TB / Tháng</StatLabel>
									<StatNumber color="teal.600">
										{formatCurrency(averagePerMonth)}
									</StatNumber>
									<StatHelpText>
										{monthCount} tháng
									</StatHelpText>
								</Stat>
							</CardBody>
						</Card>
						<Card>
							<CardBody>
								<Stat>
									<StatLabel>Tổng Số Khoản Chi</StatLabel>
									<StatNumber color="blue.600">
										{expenseList.length}
									</StatNumber>
									<StatHelpText>Khoản chi phí</StatHelpText>
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
							onClick={onDetailModalOpen}>
							<CardBody>
								<Stat>
									<Flex
										justify="space-between"
										align="center">
										<Box>
											<StatLabel>Xem Biểu Đồ</StatLabel>
											<StatNumber
												color="purple.600"
												fontSize="md">
												Chi tiết
											</StatNumber>
											<StatHelpText>
												Phân tích chi phí
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

					{/* Filters */}
					<Card mb={6}>
						<CardBody>
							<Flex
								gap={4}
								direction={{ base: "column", md: "row" }}>
								<InputGroup flex={1}>
									<InputLeftElement pointerEvents="none">
										<FiSearch color="gray" />
									</InputLeftElement>
									<Input
										placeholder="Tìm kiếm theo mô tả, ghi chú..."
										value={filters.searchQuery || ""}
										onChange={(e) =>
											handleFilterChange(
												"searchQuery",
												e.target.value,
											)
										}
										bg="white"
									/>
								</InputGroup>
								<Select
									value={filters.category || "all"}
									onChange={(e) =>
										handleFilterChange(
											"category",
											e.target.value,
										)
									}
									bg="white"
									w={{ base: "full", md: "250px" }}>
									<option value="all">Tất cả loại</option>
									<option value="electricity">Điện</option>
									<option value="water">Nước</option>
									<option value="supplies">
										Nhu yếu phẩm
									</option>
									<option value="repairs">Sửa chữa</option>
									<option value="other">Khác</option>
								</Select>
							</Flex>
						</CardBody>
					</Card>

					{/* Expense Table */}
					<Card>
						<CardBody>
							<Box overflowX="auto">
								<Table variant="simple">
									<Thead bg="gray.50">
										<Tr>
											<Th>Ngày</Th>
											<Th>Loại</Th>
											<Th>Mô tả</Th>
											<Th isNumeric>Số tiền</Th>
											<Th>Ghi chú</Th>
											<Th>Người tạo</Th>
											<Th></Th>
										</Tr>
									</Thead>
									<Tbody>
										{expenseList.length === 0 ? (
											<Tr>
												<Td
													colSpan={7}
													textAlign="center"
													py={8}>
													<Text color="gray.500">
														Không tìm thấy chi phí
														nào
													</Text>
												</Td>
											</Tr>
										) : (
											expenseList.map((expense) => (
												<Tr key={expense.id}>
													<Td>
														{formatDate(
															expense.date,
														)}
													</Td>
													<Td>
														<Badge
															colorScheme={
																expense.category ===
																"electricity"
																	? "orange"
																	: expense.category ===
																	  "water"
																	? "blue"
																	: expense.category ===
																	  "supplies"
																	? "green"
																	: expense.category ===
																	  "repairs"
																	? "red"
																	: "gray"
															}>
															{getExpenseCategoryLabel(
																expense.category,
															)}
														</Badge>
													</Td>
													<Td>
														{expense.description}
													</Td>
													<Td
														isNumeric
														fontWeight="600">
														{formatCurrency(
															expense.amount,
														)}
													</Td>
													<Td>
														<Text
															fontSize="sm"
															color="gray.600"
															noOfLines={1}
															maxW="200px">
															{expense.notes ||
																"-"}
														</Text>
													</Td>
													<Td>
														<Text
															fontSize="sm"
															color="gray.600">
															{expense.createdBy ||
																"-"}
														</Text>
													</Td>
													<Td>
														<Menu>
															<MenuButton
																as={IconButton}
																icon={
																	<FiMoreVertical />
																}
																variant="ghost"
																size="sm"
															/>
															<MenuList>
																<MenuItem
																	icon={
																		<FiTrash2 />
																	}
																	onClick={() =>
																		handleDeleteClick(
																			expense.id,
																		)
																	}
																	color="red.500">
																	Xóa
																</MenuItem>
															</MenuList>
														</Menu>
													</Td>
												</Tr>
											))
										)}
									</Tbody>
								</Table>
							</Box>

							{/* Pagination */}
							{expenseList.length > 0 && (
								<Flex
									justify="center"
									mt={6}>
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
				onAdd={handleAddExpense}
			/>

			{/* Expense Detail Modal with Chart */}
			<ExpenseDetailModal
				isOpen={isDetailModalOpen}
				onClose={onDetailModalClose}
			/>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={isDeleteAlertOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteAlertClose}>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold">
							Xóa Chi Phí
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc chắn muốn xóa chi phí này? Hành động này
							không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={cancelRef}
								onClick={onDeleteAlertClose}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleDeleteConfirm}
								ml={3}>
								Xóa
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</MainLayout>
	);
};

export default ExpensesPage;
