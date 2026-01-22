import { Box, Flex, Button, ButtonGroup } from "@chakra-ui/react";
import { useState } from "react";
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
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { RevenueReport } from "@/types/reports";
import { formatDateDDMMYYYYToDisplay } from "@/utils/date";

interface RevenueChartProps {
	data: RevenueReport;
	onExpand?: () => void;
}

type ChartType = "line" | "bar";
type MetricType = "revenue" | "profit" | "all";

export const RevenueChart: React.FC<RevenueChartProps> = ({
	data,
	onExpand,
}) => {
	const [chartType, setChartType] = useState<ChartType>("line");
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
		return formatDateDDMMYYYYToDisplay(dateStr);
	};

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
			</ButtonGroup>
			<ButtonGroup
				size="sm"
				isAttached
				variant="outline">
				<Button
					onClick={() => setMetricType("all")}
					bg={metricType === "all" ? "brand.500" : "white"}
					color={metricType === "all" ? "white" : "gray.700"}
					fontSize="xs"
					_hover={{
						bg: metricType === "all" ? "brand.600" : "gray.50",
					}}>
					Tất cả
				</Button>
				<Button
					onClick={() => setMetricType("revenue")}
					bg={metricType === "revenue" ? "brand.500" : "white"}
					color={metricType === "revenue" ? "white" : "gray.700"}
					fontSize="xs"
					_hover={{
						bg: metricType === "revenue" ? "brand.600" : "gray.50",
					}}>
					Doanh thu
				</Button>
				<Button
					onClick={() => setMetricType("profit")}
					bg={metricType === "profit" ? "brand.500" : "white"}
					color={metricType === "profit" ? "white" : "gray.700"}
					fontSize="xs"
					_hover={{
						bg: metricType === "profit" ? "brand.600" : "gray.50",
					}}>
					Lợi nhuận
				</Button>
			</ButtonGroup>
		</Flex>
	);

	return (
		<ChartCard
			title="Biểu đồ Doanh thu & Lợi nhuận"
			subtitle={`Tổng doanh thu: ${formatCurrency(
				data.totalRevenue,
			)} đ | Lợi nhuận: ${formatCurrency(data.totalProfit)} đ`}
			onExpand={onExpand}
			actions={actions}>
			<ResponsiveContainer
				width="100%"
				height={350}>
				{chartType === "line" ? (
					<LineChart data={data.data}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#f0f0f0"
						/>
						<XAxis
							dataKey="date"
							tickFormatter={formatDate}
							stroke="#718096"
							fontSize={12}
						/>
						<YAxis
							tickFormatter={formatCurrency}
							stroke="#718096"
							fontSize={12}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend wrapperStyle={{ fontSize: "14px" }} />
						{(metricType === "all" || metricType === "revenue") && (
							<Line
								type="monotone"
								dataKey="revenue"
								name="Doanh thu"
								stroke="#161F70"
								strokeWidth={2}
								dot={{ fill: "#161F70", r: 4 }}
								activeDot={{ r: 6 }}
							/>
						)}
						{(metricType === "all" || metricType === "revenue") && (
							<Line
								type="monotone"
								dataKey="cost"
								name="Chi phí"
								stroke="#C8C8C8"
								strokeWidth={2}
								dot={{ fill: "#C8C8C8", r: 4 }}
							/>
						)}
						{(metricType === "all" || metricType === "profit") && (
							<Line
								type="monotone"
								dataKey="profit"
								name="Lợi nhuận"
								stroke="#009781"
								strokeWidth={2}
								dot={{ fill: "#009781", r: 4 }}
								activeDot={{ r: 6 }}
							/>
						)}
					</LineChart>
				) : (
					<BarChart data={data.data}>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#f0f0f0"
						/>
						<XAxis
							dataKey="date"
							tickFormatter={formatDate}
							stroke="#718096"
							fontSize={12}
						/>
						<YAxis
							tickFormatter={formatCurrency}
							stroke="#718096"
							fontSize={12}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend wrapperStyle={{ fontSize: "14px" }} />
						{(metricType === "all" || metricType === "revenue") && (
							<Bar
								dataKey="revenue"
								name="Doanh thu"
								fill="#161F70"
								radius={[8, 8, 0, 0]}
							/>
						)}
						{(metricType === "all" || metricType === "revenue") && (
							<Bar
								dataKey="cost"
								name="Chi phí"
								fill="#C8C8C8"
								radius={[8, 8, 0, 0]}
							/>
						)}
						{(metricType === "all" || metricType === "profit") && (
							<Bar
								dataKey="profit"
								name="Lợi nhuận"
								fill="#009781"
								radius={[8, 8, 0, 0]}
							/>
						)}
					</BarChart>
				)}
			</ResponsiveContainer>
		</ChartCard>
	);
};
