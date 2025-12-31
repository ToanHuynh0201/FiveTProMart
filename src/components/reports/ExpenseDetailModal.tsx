import { useState, useMemo, useEffect } from "react";
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
} from "@chakra-ui/react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
} from "recharts";
import Pagination from "@/components/common/Pagination";
import { usePagination } from "@/hooks";
import type { ExpenseReport } from "@/types/reports";

// TODO: Implement getExpenseCategoryLabel service
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

// TODO: Implement getExpenseCategoryColor service
const getExpenseCategoryColor = (category: string): string => {
	const colors: Record<string, string> = {
		electricity: "#FF8C42",
		water: "#4A90E2",
		supplies: "#7ED321",
		repairs: "#F5A623",
		other: "#B8E986",
	};
	return colors[category] || "#999999";
};

interface ExpenseDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: ExpenseReport;
}

const PAGE_SIZE = 10;

type TimeFilter = "7days" | "30days" | "3months" | "year";

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
	isOpen,
	onClose,
	data,
}) => {
	const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");

	// Filter expenses by time
	const filteredExpenses = useMemo(() => {
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

		return data.expenses.filter((expense) => {
			const expenseDate = new Date(expense.date);
			return expenseDate >= filterDate && expenseDate <= now;
		});
	}, [data.expenses, timeFilter]);

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

	// Prepare pie chart data
	const pieChartData = useMemo(() => [
		{
			name: getExpenseCategoryLabel("electricity"),
			value: filteredStats.byCategory.electricity,
			color: getExpenseCategoryColor("electricity"),
		},
		{
			name: getExpenseCategoryLabel("water"),
			value: filteredStats.byCategory.water,
			color: getExpenseCategoryColor("water"),
		},
		{
			name: getExpenseCategoryLabel("supplies"),
			value: filteredStats.byCategory.supplies,
			color: getExpenseCategoryColor("supplies"),
		},
		{
			name: getExpenseCategoryLabel("repairs"),
			value: filteredStats.byCategory.repairs,
			color: getExpenseCategoryColor("repairs"),
		},
		{
			name: getExpenseCategoryLabel("other"),
			value: filteredStats.byCategory.other,
			color: getExpenseCategoryColor("other"),
		},
	].filter((item) => item.value > 0), [filteredStats]);

	const CustomPieTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const percentage = (payload[0].value / filteredStats.totalExpense) * 100;
			return (
				<Box
					bg="white"
					p={3}
					borderRadius="md"
					boxShadow="lg"
					border="1px solid"
					borderColor="gray.200">
					<Box fontWeight="600" fontSize="sm" color="gray.700" mb={1}>
						{payload[0].name}
					</Box>
					<Flex justify="space-between" gap={4} fontSize="sm">
						<Box color="gray.600">Số tiền:</Box>
						<Box fontWeight="600">{formatCurrency(payload[0].value)}</Box>
					</Flex>
					<Flex justify="space-between" gap={4} fontSize="sm">
						<Box color="gray.600">Tỷ lệ:</Box>
						<Box fontWeight="600">{percentage.toFixed(1)}%</Box>
					</Flex>
				</Box>
			);
		}
		return null;
	};

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
					{/* Time Filter */}
					<Flex justify="space-between" align="center" mb={6}>
						<Text fontSize="md" fontWeight="600" color="gray.700">
							Lọc theo thời gian:
						</Text>
						<Select
							value={timeFilter}
							onChange={(e) => {
								setTimeFilter(e.target.value as TimeFilter);
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
					<SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={4} mb={6}>
						<Stat
							bg="orange.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="orange.200">
							<StatLabel color="orange.700">Điện</StatLabel>
							<StatNumber fontSize="lg" color="orange.800">
								{formatCurrency(filteredStats.byCategory.electricity)}
							</StatNumber>
						</Stat>
						<Stat
							bg="blue.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="blue.200">
							<StatLabel color="blue.700">Nước</StatLabel>
							<StatNumber fontSize="lg" color="blue.800">
								{formatCurrency(filteredStats.byCategory.water)}
							</StatNumber>
						</Stat>
						<Stat
							bg="green.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="green.200">
							<StatLabel color="green.700">Nhu yếu phẩm</StatLabel>
							<StatNumber fontSize="lg" color="green.800">
								{formatCurrency(filteredStats.byCategory.supplies)}
							</StatNumber>
						</Stat>
						<Stat
							bg="red.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="red.200">
							<StatLabel color="red.700">Sửa chữa</StatLabel>
							<StatNumber fontSize="lg" color="red.800">
								{formatCurrency(filteredStats.byCategory.repairs)}
							</StatNumber>
						</Stat>
						<Stat
							bg="gray.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="gray.200">
							<StatLabel color="gray.700">Khác</StatLabel>
							<StatNumber fontSize="lg" color="gray.800">
								{formatCurrency(filteredStats.byCategory.other)}
							</StatNumber>
						</Stat>
					</SimpleGrid>

					{/* Pie Chart */}
					<Box bg="gray.50" p={6} borderRadius="lg" mb={6}>
						<Text fontSize="lg" fontWeight="600" mb={4}>
							Phân Bố Chi Phí Theo Loại
						</Text>
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={pieChartData}
									cx="50%"
									cy="50%"
									labelLine={false}
									label={({ name, percent }) =>
										`${name}: ${(percent * 100).toFixed(1)}%`
									}
									outerRadius={100}
									fill="#8884d8"
									dataKey="value">
									{pieChartData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip content={<CustomPieTooltip />} />
							</PieChart>
						</ResponsiveContainer>
					</Box>

					<Divider mb={6} />

					{/* Expense List Table */}
					<Box>
						<Flex justify="space-between" align="center" mb={4}>
							<Text fontSize="lg" fontWeight="600">
								Danh Sách Chi Phí
							</Text>
							<Text fontSize="sm" color="gray.600">
								Tổng: {filteredExpenses.length} khoản chi
							</Text>
						</Flex>

						<Box overflowX="auto">
							<Table variant="simple" size="sm">
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
									{paginatedExpenses.map((expense) => (
										<Tr key={expense.id}>
											<Td>{formatDate(expense.date)}</Td>
											<Td>
												<Badge
													colorScheme={
														expense.category === "electricity"
															? "orange"
															: expense.category === "water"
																? "blue"
																: expense.category === "supplies"
																	? "green"
																	: expense.category === "repairs"
																		? "red"
																		: "gray"
													}>
													{getExpenseCategoryLabel(expense.category)}
												</Badge>
											</Td>
											<Td>{expense.description}</Td>
											<Td isNumeric fontWeight="600">
												{formatCurrency(expense.amount)}
											</Td>
											<Td>
												<Text
													fontSize="sm"
													color="gray.600"
													noOfLines={1}
													maxW="200px">
													{expense.notes || "-"}
												</Text>
											</Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</Box>

						{pagination.totalPages > 1 && (
							<Flex justify="center" mt={4}>
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
						<Text fontSize="lg" fontWeight="600">
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
						<Text fontSize="2xl" fontWeight="700" color="brand.600">
							{formatCurrency(filteredStats.totalExpense)}
						</Text>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
