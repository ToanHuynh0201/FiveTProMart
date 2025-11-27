import { Box, Flex, Text } from "@chakra-ui/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChartCard } from "./ChartCard";
import type { CategoryReport } from "@/types/reports";

interface CategoryChartProps {
	data: CategoryReport;
	onExpand?: () => void;
}

const COLORS = ["#161F70", "#1C2A93", "#6890FF", "#BBD6FF", "#C8C8C8"];

export const CategoryChart: React.FC<CategoryChartProps> = ({
	data,
	onExpand,
}) => {
	const formatCurrency = (value: number) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(0)}K`;
		}
		return value.toString();
	};

	const chartData = data.categories.map((cat) => ({
		name: cat.category,
		value: cat.revenue,
		percentage: cat.percentage,
	}));

	const CustomTooltip = ({ active, payload }: any) => {
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
						{payload[0].name}
					</Box>
					<Flex
						justify="space-between"
						gap={4}
						fontSize="sm">
						<Box color="gray.600">Doanh thu:</Box>
						<Box fontWeight="600">
							{formatCurrency(payload[0].value)} đ
						</Box>
					</Flex>
					<Flex
						justify="space-between"
						gap={4}
						fontSize="sm">
						<Box color="gray.600">Tỷ lệ:</Box>
						<Box fontWeight="600">
							{payload[0].payload.percentage}%
						</Box>
					</Flex>
				</Box>
			);
		}
		return null;
	};

	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percentage,
	}: any) => {
		const RADIAN = Math.PI / 180;
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text
				x={x}
				y={y}
				fill="white"
				textAnchor={x > cx ? "start" : "end"}
				dominantBaseline="central"
				fontSize={14}
				fontWeight="600">
				{percentage > 5 ? `${percentage}%` : ""}
			</text>
		);
	};

	return (
		<ChartCard
			title="Doanh thu theo Danh mục"
			subtitle={`Tổng doanh thu: ${formatCurrency(data.totalRevenue)} đ`}
			onExpand={onExpand}>
			<Flex
				direction={{ base: "column", lg: "row" }}
				gap={{ base: 4, lg: 6 }}
				align="center">
				<Box
					w="full"
					maxW={{ base: "full", lg: "50%" }}>
					<ResponsiveContainer
						width="100%"
						height={280}>
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={renderCustomizedLabel}
								outerRadius={100}
								fill="#8884d8"
								dataKey="value">
								{chartData.map((_, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip content={<CustomTooltip />} />
						</PieChart>
					</ResponsiveContainer>
				</Box>

				<Box
					flex={1}
					w="full">
					{data.categories.map((cat, index) => (
						<Flex
							key={cat.category}
							justify="space-between"
							align="center"
							p={3}
							borderRadius="md"
							_hover={{ bg: "gray.50" }}
							mb={2}>
							<Flex
								align="center"
								gap={3}>
								<Box
									w="16px"
									h="16px"
									borderRadius="sm"
									bg={COLORS[index % COLORS.length]}
								/>
								<Box>
									<Text
										fontSize="sm"
										fontWeight="600">
										{cat.category}
									</Text>
									<Text
										fontSize="xs"
										color="gray.500">
										{cat.productCount} sản phẩm •{" "}
										{cat.quantitySold} đã bán
									</Text>
								</Box>
							</Flex>
							<Box textAlign="right">
								<Text
									fontSize="sm"
									fontWeight="700"
									color="brand.500">
									{formatCurrency(cat.revenue)} đ
								</Text>
								<Text
									fontSize="xs"
									color="gray.500">
									{cat.percentage}%
								</Text>
							</Box>
						</Flex>
					))}
				</Box>
			</Flex>
		</ChartCard>
	);
};
