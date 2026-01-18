import { useState, useEffect, useMemo } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Divider,
	Box,
	Flex,
	Text,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	SimpleGrid,
	Stat,
	StatLabel,
	StatNumber,
	Select,
	useToast,
} from "@chakra-ui/react";
import Pagination from "@/components/common/Pagination";
import { usePagination } from "@/hooks";
import { LoadingSpinner } from "@/components/common";
import { ExpenseChart } from "@/components/reports";
import type { ExpenseReport } from "@/types/reports";

interface ExpenseDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const PAGE_SIZE = 10;

type TimeFilter = "7days" | "30days" | "3months" | "year";

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

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
	isOpen,
	onClose,
}) => {
	const toast = useToast();
	const [loading, setLoading] = useState(false);
	const [expenseData, setExpenseData] = useState<ExpenseReport | null>(null);
	const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");

	// Fetch expense data when modal opens
	useEffect(() => {
		if (isOpen) {
			fetchExpenseData();
		}
	}, [isOpen]);

	const fetchExpenseData = async () => {
		setLoading(true);
		try {
			// TODO: Replace with API call to getExpenseReport(period)
			// const period: DateRangeFilter = {
			// 	type: "year", // Get full year data to allow filtering
			// };
			// const data = await getExpenseReport(period);

			// Placeholder until API is implemented
			const data: ExpenseReport = {
				period: {
					type: "year",
				},
				totalExpense: 0,
				byCategory: {
					electricity: 0,
					water: 0,
					supplies: 0,
					repairs: 0,
					other: 0,
				},
				expenses: [],
				data: [],
				growth: 0,
			};
			setExpenseData(data);
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Không thể tải dữ liệu chi phí",
				status: "error",
				duration: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	// Filter expenses by time
	const filteredExpenses = useMemo(() => {
		if (!expenseData) return [];

		const now = new Date();
		let filterDate = new Date();

		switch (timeFilter) {
			case "7days":
				filterDate.setDate(now.getDate() - 7);
				break;
			case "30days":
				filterDate.setDate(now.getDate() - 30);
				break;
			case "3months":
				filterDate.setMonth(now.getMonth() - 3);
				break;
			case "year":
				filterDate.setFullYear(now.getFullYear());
				filterDate.setMonth(0);
				filterDate.setDate(1);
				break;
		}

		return expenseData.expenses.filter((expense) => {
			const expenseDate = new Date(expense.date);
			return expenseDate >= filterDate && expenseDate <= now;
		});
	}, [expenseData, timeFilter]);

	// usePagination for metadata
	const { currentPage, pageSize, pagination, goToPage } = usePagination({
		initialPage: 1,
		pageSize: PAGE_SIZE,
		initialTotal: filteredExpenses.length,
	});

	// Update total when filtered data changes
	useEffect(() => {
		goToPage(1); // Reset to first page when filter changes
	}, [timeFilter]);

	// Paginate expenses (client-side)
	const paginatedExpenses = useMemo(() => {
		const startIndex = (currentPage - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		return filteredExpenses.slice(startIndex, endIndex);
	}, [filteredExpenses, currentPage, pageSize]);

	// Recalculate statistics based on filtered data
	const filteredStats = useMemo(() => {
		const byCategory = {
			electricity: 0,
			water: 0,
			supplies: 0,
			repairs: 0,
			other: 0,
		};

		let totalExpense = 0;

		filteredExpenses.forEach((expense) => {
			byCategory[expense.category] += expense.amount;
			totalExpense += expense.amount;
		});

		return { byCategory, totalExpense };
	}, [filteredExpenses]);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("vi-VN");
	};

	// Prepare filtered expense report for chart
	const filteredExpenseReport = useMemo(() => {
		if (!expenseData) return null;

		// Group filtered expenses by date for time-series chart
		const dataMap = new Map<
			string,
			{
				date: string;
				electricity: number;
				water: number;
				supplies: number;
				repairs: number;
				other: number;
				total: number;
			}
		>();

		filteredExpenses.forEach((expense) => {
			const dateKey = new Date(expense.date).toISOString().split("T")[0];

			if (!dataMap.has(dateKey)) {
				dataMap.set(dateKey, {
					date: dateKey,
					electricity: 0,
					water: 0,
					supplies: 0,
					repairs: 0,
					other: 0,
					total: 0,
				});
			}

			const dataPoint = dataMap.get(dateKey)!;
			dataPoint[expense.category] += expense.amount;
			dataPoint.total += expense.amount;
		});

		// Convert map to sorted array
		const timeSeriesData = Array.from(dataMap.values()).sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);

		return {
			period: expenseData.period,
			totalExpense: filteredStats.totalExpense,
			byCategory: filteredStats.byCategory,
			expenses: filteredExpenses,
			data: timeSeriesData,
			growth: 0,
		} as ExpenseReport;
	}, [expenseData, filteredExpenses, filteredStats]);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="6xl"
			scrollBehavior="inside">
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent>
				<ModalHeader>Chi Tiết Chi Phí Phát Sinh</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					{loading ? (
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							minH="400px">
							<LoadingSpinner />
						</Box>
					) : (
						<>
							{/* Time Filter */}
							<Flex
								justify="space-between"
								align="center"
								mb={6}>
								<Text
									fontSize="md"
									fontWeight="600"
									color="gray.700">
									Lọc theo thời gian:
								</Text>
								<Select
									value={timeFilter}
									onChange={(e) => {
										setTimeFilter(
											e.target.value as TimeFilter,
										);
									}}
									w="200px"
									size="sm">
									<option value="7days">7 ngày qua</option>
									<option value="30days">30 ngày qua</option>
									<option value="3months">3 tháng qua</option>
									<option value="year">Trong năm nay</option>
								</Select>
							</Flex>

							{/* Summary Stats */}
							<SimpleGrid
								columns={{ base: 1, md: 3, lg: 5 }}
								spacing={4}
								mb={6}>
								<Stat
									bg="orange.50"
									p={4}
									borderRadius="lg"
									border="1px solid"
									borderColor="orange.200">
									<StatLabel color="orange.700">
										Điện
									</StatLabel>
									<StatNumber
										fontSize="lg"
										color="orange.800">
										{formatCurrency(
											filteredStats.byCategory
												.electricity,
										)}
									</StatNumber>
								</Stat>
								<Stat
									bg="blue.50"
									p={4}
									borderRadius="lg"
									border="1px solid"
									borderColor="blue.200">
									<StatLabel color="blue.700">Nước</StatLabel>
									<StatNumber
										fontSize="lg"
										color="blue.800">
										{formatCurrency(
											filteredStats.byCategory.water,
										)}
									</StatNumber>
								</Stat>
								<Stat
									bg="green.50"
									p={4}
									borderRadius="lg"
									border="1px solid"
									borderColor="green.200">
									<StatLabel color="green.700">
										Nhu yếu phẩm
									</StatLabel>
									<StatNumber
										fontSize="lg"
										color="green.800">
										{formatCurrency(
											filteredStats.byCategory.supplies,
										)}
									</StatNumber>
								</Stat>
								<Stat
									bg="red.50"
									p={4}
									borderRadius="lg"
									border="1px solid"
									borderColor="red.200">
									<StatLabel color="red.700">
										Sửa chữa
									</StatLabel>
									<StatNumber
										fontSize="lg"
										color="red.800">
										{formatCurrency(
											filteredStats.byCategory.repairs,
										)}
									</StatNumber>
								</Stat>
								<Stat
									bg="gray.50"
									p={4}
									borderRadius="lg"
									border="1px solid"
									borderColor="gray.200">
									<StatLabel color="gray.700">Khác</StatLabel>
									<StatNumber
										fontSize="lg"
										color="gray.800">
										{formatCurrency(
											filteredStats.byCategory.other,
										)}
									</StatNumber>
								</Stat>
							</SimpleGrid>

							{/* Expense Chart - with line, bar, pie options */}
							{filteredExpenseReport && (
								<Box mb={6}>
									<ExpenseChart
										data={filteredExpenseReport}
									/>
								</Box>
							)}

							<Divider mb={6} />

							{/* Expense List Table */}
							<Box>
								<Flex
									justify="space-between"
									align="center"
									mb={4}>
									<Text
										fontSize="lg"
										fontWeight="600">
										Danh Sách Chi Phí
									</Text>
									<Text
										fontSize="sm"
										color="gray.600">
										Tổng: {filteredExpenses.length} khoản
										chi
									</Text>
								</Flex>

								<Box overflowX="auto">
									<Table
										variant="simple"
										size="sm">
										<Thead bg="gray.50">
											<Tr>
												<Th>Ngày</Th>
												<Th>Loại</Th>
												<Th>Mô tả</Th>
												<Th isNumeric>Số tiền</Th>
												<Th>Ghi chú</Th>
											</Tr>
										</Thead>
										<Tbody>
											{paginatedExpenses.length === 0 ? (
												<Tr>
													<Td
														colSpan={5}
														textAlign="center"
														py={8}>
														<Text color="gray.500">
															Không có chi phí nào
															trong khoảng thời
															gian này
														</Text>
													</Td>
												</Tr>
											) : (
												paginatedExpenses.map(
													(expense) => (
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
																{
																	expense.description
																}
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
																	noOfLines={
																		1
																	}
																	maxW="200px">
																	{expense.notes ||
																		"-"}
																</Text>
															</Td>
														</Tr>
													),
												)
											)}
										</Tbody>
									</Table>
								</Box>

								{pagination.totalPages > 1 && (
									<Flex
										justify="center"
										mt={4}>
										<Pagination
											currentPage={currentPage}
											totalPages={pagination.totalPages}
											totalItems={filteredExpenses.length}
											pageSize={pageSize}
											onPageChange={goToPage}
										/>
									</Flex>
								)}
							</Box>

							{/* Total Summary */}
							<Divider my={6} />
							<Flex
								justify="space-between"
								align="center"
								bg="gray.50"
								p={4}
								borderRadius="lg">
								<Text
									fontSize="lg"
									fontWeight="600">
									Tổng Chi Phí (
									{timeFilter === "7days"
										? "7 ngày qua"
										: timeFilter === "30days"
											? "30 ngày qua"
											: timeFilter === "3months"
												? "3 tháng qua"
												: "Trong năm nay"}
									)
								</Text>
								<Text
									fontSize="2xl"
									fontWeight="700"
									color="brand.600">
									{formatCurrency(filteredStats.totalExpense)}
								</Text>
							</Flex>
						</>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
