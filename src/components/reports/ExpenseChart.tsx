import { Box, Flex, Button, ButtonGroup } from "@chakra-ui/react";
import { useState, useMemo } from "react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { ExpenseReport } from "@/types/reports";

/**
 * Get Vietnamese label for expense category
 */
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

/**
 * Get color for expense category visualization
 */
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

interface ExpenseChartProps {
	data: ExpenseReport;
	onExpand?: () => void;
}

type ChartType = "line" | "bar" | "pie";
type MetricType =
	| "all"
	| "electricity"
	| "water"
	| "supplies"
	| "repairs"
	| "other";

export const ExpenseChart: React.FC<ExpenseChartProps> = ({
	data,
	onExpand,
}) => {
	const [chartType, setChartType] = useState<ChartType>("bar");
	const [metricType, setMetricType] = useState<MetricType>("all");

	const formatCurrency = (value: number) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(0)}K`;
		}
		return value.toString();
	};

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return `${date.getDate()}/${date.getMonth() + 1}`;
	};

	// Prepare pie chart data
	const pieChartData = useMemo(
		() =>
			[
				{
					name: getExpenseCategoryLabel("electricity"),
					value: data.byCategory.electricity,
					color: getExpenseCategoryColor("electricity"),
				},
				{
					name: getExpenseCategoryLabel("water"),
					value: data.byCategory.water,
					color: getExpenseCategoryColor("water"),
				},
				{
					name: getExpenseCategoryLabel("supplies"),
					value: data.byCategory.supplies,
					color: getExpenseCategoryColor("supplies"),
				},
				{
					name: getExpenseCategoryLabel("repairs"),
					value: data.byCategory.repairs,
					color: getExpenseCategoryColor("repairs"),
				},
				{
					name: getExpenseCategoryLabel("other"),
					value: data.byCategory.other,
					color: getExpenseCategoryColor("other"),
				},
			].filter((item) => item.value > 0),
		[data.byCategory],
	);

	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			return (
				<Box
					bg="white"
					p={3}
					borderRadius="md"
					boxShadow="lg"
					border="1px solid"
					borderColor="gray.200">
					<Box
						mb={2}
						fontWeight="600"
						fontSize="sm"
						color="gray.700">
						{formatDate(label)}
					</Box>
					{payload.map((entry: any, index: number) => (
						<Flex
							key={index}
							justify="space-between"
							gap={4}
							fontSize="sm">
							<Box color={entry.color}>{entry.name}:</Box>
							<Box fontWeight="600">
								{formatCurrency(entry.value)} đ
							</Box>
						</Flex>
					))}
				</Box>
			);
		}
		return null;
	};

	const CustomPieTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const percentage = (payload[0].value / data.totalExpense) * 100;
			return (
				<Box
					bg="white"
					p={3}
					borderRadius="md"
					boxShadow="lg"
					border="1px solid"
					borderColor="gray.200">
					<Box
						fontWeight="600"
						fontSize="sm"
						color="gray.700"
						mb={1}>
						{payload[0].name}
					</Box>
					<Flex
						justify="space-between"
						gap={4}
						fontSize="sm">
						<Box color="gray.600">Số tiền:</Box>
						<Box fontWeight="600">
							{formatCurrency(payload[0].value)} đ
						</Box>
					</Flex>
					<Flex
						justify="space-between"
						gap={4}
						fontSize="sm">
						<Box color="gray.600">Tỷ lệ:</Box>
						<Box fontWeight="600">{percentage.toFixed(1)}%</Box>
					</Flex>
				</Box>
			);
		}
		return null;
	};

	const actions = (
		<Flex
			gap={2}
			direction={{ base: "column", sm: "row" }}
			w={{ base: "full", sm: "auto" }}>
			<ButtonGroup
				size="sm"
				isAttached
				variant="outline">
				<Button
					onClick={() => setChartType("line")}
					bg={chartType === "line" ? "brand.500" : "white"}
					color={chartType === "line" ? "white" : "gray.700"}
					_hover={{
						bg: chartType === "line" ? "brand.600" : "gray.50",
					}}>
					Đường
				</Button>
				<Button
					onClick={() => setChartType("bar")}
					bg={chartType === "bar" ? "brand.500" : "white"}
					color={chartType === "bar" ? "white" : "gray.700"}
					_hover={{
						bg: chartType === "bar" ? "brand.600" : "gray.50",
					}}>
					Cột
				</Button>
				<Button
					onClick={() => setChartType("pie")}
					bg={chartType === "pie" ? "brand.500" : "white"}
					color={chartType === "pie" ? "white" : "gray.700"}
					_hover={{
						bg: chartType === "pie" ? "brand.600" : "gray.50",
					}}>
					Tròn
				</Button>
			</ButtonGroup>

			{chartType !== "pie" && (
				<ButtonGroup
					size="sm"
					isAttached
					variant="outline"
					w={{ base: "full", sm: "auto" }}>
					<Button
						onClick={() => setMetricType("all")}
						bg={metricType === "all" ? "brand.500" : "white"}
						color={metricType === "all" ? "white" : "gray.700"}
						_hover={{
							bg: metricType === "all" ? "brand.600" : "gray.50",
						}}
						fontSize={{ base: "xs", sm: "sm" }}>
						Tất cả
					</Button>
					<Button
						onClick={() => setMetricType("electricity")}
						bg={
							metricType === "electricity" ? "brand.500" : "white"
						}
						color={
							metricType === "electricity" ? "white" : "gray.700"
						}
						_hover={{
							bg:
								metricType === "electricity"
									? "brand.600"
									: "gray.50",
						}}
						fontSize={{ base: "xs", sm: "sm" }}>
						Điện
					</Button>
					<Button
						onClick={() => setMetricType("water")}
						bg={metricType === "water" ? "brand.500" : "white"}
						color={metricType === "water" ? "white" : "gray.700"}
						_hover={{
							bg:
								metricType === "water"
									? "brand.600"
									: "gray.50",
						}}
						fontSize={{ base: "xs", sm: "sm" }}>
						Nước
					</Button>
					<Button
						onClick={() => setMetricType("supplies")}
						bg={metricType === "supplies" ? "brand.500" : "white"}
						color={metricType === "supplies" ? "white" : "gray.700"}
						_hover={{
							bg:
								metricType === "supplies"
									? "brand.600"
									: "gray.50",
						}}
						fontSize={{ base: "xs", sm: "sm" }}>
						NVP
					</Button>
					<Button
						onClick={() => setMetricType("repairs")}
						bg={metricType === "repairs" ? "brand.500" : "white"}
						color={metricType === "repairs" ? "white" : "gray.700"}
						_hover={{
							bg:
								metricType === "repairs"
									? "brand.600"
									: "gray.50",
						}}
						fontSize={{ base: "xs", sm: "sm" }}>
						Sửa
					</Button>
				</ButtonGroup>
			)}
		</Flex>
	);

	const ChartComponent = chartType === "line" ? LineChart : BarChart;

	// Check if data is empty
	if (!data.data || data.data.length === 0) {
		return (
			<ChartCard
				title="Chi Phí Phát Sinh"
				subtitle={`Tổng chi phí: ${formatCurrency(
					data.totalExpense,
				)} đ`}
				actions={actions}
				onExpand={onExpand}>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					height="100%"
					color="gray.500">
					Không có dữ liệu chi phí trong khoảng thời gian này
				</Box>
			</ChartCard>
		);
	}

	// Render Pie Chart
	if (chartType === "pie") {
		return (
			<ChartCard
				title="Chi Phí Phát Sinh"
				subtitle={`Tổng chi phí: ${formatCurrency(
					data.totalExpense,
				)} đ`}
				actions={actions}
				onExpand={onExpand}>
				<ResponsiveContainer
					width="100%"
					height={350}>
					<PieChart>
						<Pie
							data={pieChartData}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ name, percent }) =>
								`${name}: ${(percent! * 100).toFixed(1)}%`
							}
							outerRadius={120}
							fill="#8884d8"
							dataKey="value">
							{pieChartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={entry.color}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomPieTooltip />} />
					</PieChart>
				</ResponsiveContainer>
			</ChartCard>
		);
	}

	return (
		<ChartCard
			title="Chi Phí Phát Sinh"
			subtitle={`Tổng chi phí: ${formatCurrency(data.totalExpense)} đ`}
			actions={actions}
			onExpand={onExpand}>
			<ResponsiveContainer
				width="100%"
				height={350}>
				<ChartComponent data={data.data}>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#E2E8F0"
					/>
					<XAxis
						dataKey="date"
						tickFormatter={formatDate}
						tick={{ fontSize: 12 }}
						stroke="#718096"
					/>
					<YAxis
						tickFormatter={formatCurrency}
						tick={{ fontSize: 12 }}
						stroke="#718096"
					/>
					<Tooltip content={<CustomTooltip />} />
					<Legend
						wrapperStyle={{ fontSize: "12px" }}
						formatter={(value) => {
							const labels: Record<string, string> = {
								electricity: "Điện",
								water: "Nước",
								supplies: "Nhu yếu phẩm",
								repairs: "Sửa chữa",
								other: "Khác",
								total: "Tổng",
							};
							return labels[value] || value;
						}}
					/>
					{chartType === "line" ? (
						<>
							{(metricType === "all" ||
								metricType === "electricity") && (
								<Line
									type="monotone"
									dataKey="electricity"
									stroke={getExpenseCategoryColor(
										"electricity",
									)}
									strokeWidth={2}
									dot={{ r: 4 }}
									activeDot={{ r: 6 }}
								/>
							)}
							{(metricType === "all" ||
								metricType === "water") && (
								<Line
									type="monotone"
									dataKey="water"
									stroke={getExpenseCategoryColor("water")}
									strokeWidth={2}
									dot={{ r: 4 }}
									activeDot={{ r: 6 }}
								/>
							)}
							{(metricType === "all" ||
								metricType === "supplies") && (
								<Line
									type="monotone"
									dataKey="supplies"
									stroke={getExpenseCategoryColor("supplies")}
									strokeWidth={2}
									dot={{ r: 4 }}
									activeDot={{ r: 6 }}
								/>
							)}
							{(metricType === "all" ||
								metricType === "repairs") && (
								<Line
									type="monotone"
									dataKey="repairs"
									stroke={getExpenseCategoryColor("repairs")}
									strokeWidth={2}
									dot={{ r: 4 }}
									activeDot={{ r: 6 }}
								/>
							)}
							{(metricType === "all" ||
								metricType === "other") && (
								<Line
									type="monotone"
									dataKey="other"
									stroke={getExpenseCategoryColor("other")}
									strokeWidth={2}
									dot={{ r: 4 }}
									activeDot={{ r: 6 }}
								/>
							)}
							{metricType === "all" && (
								<Line
									type="monotone"
									dataKey="total"
									stroke="#1a202c"
									strokeWidth={3}
									dot={{ r: 5 }}
									activeDot={{ r: 7 }}
								/>
							)}
						</>
					) : (
						<>
							{(metricType === "all" ||
								metricType === "electricity") && (
								<Bar
									dataKey="electricity"
									fill={getExpenseCategoryColor(
										"electricity",
									)}
									radius={[4, 4, 0, 0]}
								/>
							)}
							{(metricType === "all" ||
								metricType === "water") && (
								<Bar
									dataKey="water"
									fill={getExpenseCategoryColor("water")}
									radius={[4, 4, 0, 0]}
								/>
							)}
							{(metricType === "all" ||
								metricType === "supplies") && (
								<Bar
									dataKey="supplies"
									fill={getExpenseCategoryColor("supplies")}
									radius={[4, 4, 0, 0]}
								/>
							)}
							{(metricType === "all" ||
								metricType === "repairs") && (
								<Bar
									dataKey="repairs"
									fill={getExpenseCategoryColor("repairs")}
									radius={[4, 4, 0, 0]}
								/>
							)}
							{(metricType === "all" ||
								metricType === "other") && (
								<Bar
									dataKey="other"
									fill={getExpenseCategoryColor("other")}
									radius={[4, 4, 0, 0]}
								/>
							)}
						</>
					)}
				</ChartComponent>
			</ResponsiveContainer>
		</ChartCard>
	);
};
