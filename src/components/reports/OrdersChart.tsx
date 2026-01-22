import { Box, Flex } from "@chakra-ui/react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { OrdersReport } from "@/types/reports";
import { formatDateDDMMYYYYToDisplay } from "@/utils/date";

interface OrdersChartProps {
	data: OrdersReport;
	onExpand?: () => void;
}

export const OrdersChart: React.FC<OrdersChartProps> = ({ data, onExpand }) => {
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
							<Box fontWeight="600">{entry.value}</Box>
						</Flex>
					))}
				</Box>
			);
		}
		return null;
	};

	return (
		<ChartCard
			title="Biểu đồ Đơn hàng"
			subtitle={`Tổng: ${data.totalOrders} đơn`}
			onExpand={onExpand}>
			<ResponsiveContainer
				width="100%"
				height={350}>
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
						stroke="#718096"
						fontSize={12}
					/>
					<Tooltip content={<CustomTooltip />} />
					<Bar
						dataKey="completedOrders"
						name="Đơn hàng"
						fill="#009781"
						radius={[8, 8, 0, 0]}
					/>
				</BarChart>
			</ResponsiveContainer>
		</ChartCard>
	);
};
