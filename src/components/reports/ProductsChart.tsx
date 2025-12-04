import {
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	Flex,
} from "@chakra-ui/react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import { ChartCard } from "./ChartCard";
import type { ProductsReport } from "@/types/reports";

interface ProductsChartProps {
	data: ProductsReport;
	onExpand?: () => void;
}

const COLORS = ["#161F70", "#1C2A93", "#1728BC", "#6890FF", "#BBD6FF"];

export const ProductsChart: React.FC<ProductsChartProps> = ({
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

	const chartData = data.topSellingProducts.slice(0, 5).map((product) => ({
		name:
			product.name.length > 15
				? product.name.substring(0, 15) + "..."
				: product.name,
		revenue: product.revenue,
		quantity: product.quantitySold,
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
						{payload[0].payload.name}
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
						<Box color="gray.600">Đã bán:</Box>
						<Box fontWeight="600">
							{payload[0].payload.quantity}
						</Box>
					</Flex>
				</Box>
			);
		}
		return null;
	};

	return (
		<ChartCard
			title="Top Sản phẩm bán chạy"
			subtitle={`Tổng ${data.totalProductsSold} sản phẩm đã bán`}
			onExpand={onExpand}>
			<Box>
				{/* Chart */}
				<ResponsiveContainer
					width="100%"
					height={250}>
					<BarChart
						data={chartData}
						layout="vertical">
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="#f0f0f0"
						/>
						<XAxis
							type="number"
							tickFormatter={formatCurrency}
							stroke="#718096"
							fontSize={12}
						/>
						<YAxis
							dataKey="name"
							type="category"
							width={120}
							stroke="#718096"
							fontSize={11}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Bar
							dataKey="revenue"
							radius={[0, 8, 8, 0]}>
							{chartData.map((_, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>

				{/* Table - Hidden on mobile */}
				<Box
					mt={6}
					overflowX="auto"
					display={{ base: "none", lg: "block" }}>
					<Table
						size="sm"
						variant="simple">
						<Thead>
							<Tr>
								<Th>#</Th>
								<Th>Mã SP</Th>
								<Th>Tên sản phẩm</Th>
								<Th>Danh mục</Th>
								<Th isNumeric>Đã bán</Th>
								<Th isNumeric>Doanh thu</Th>
								<Th isNumeric>Tồn kho</Th>
							</Tr>
						</Thead>
						<Tbody>
							{data.topSellingProducts.slice(0, 5).map((product, index) => (
								<Tr
									key={product.id}
									_hover={{ bg: "gray.50" }}>
									<Td>
										<Flex
											w="24px"
											h="24px"
											borderRadius="full"
											bg={COLORS[index % COLORS.length]}
											color="white"
											align="center"
											justify="center"
											fontSize="xs"
											fontWeight="700">
											{index + 1}
										</Flex>
									</Td>
									<Td
										fontWeight="500"
										fontSize="sm">
										{product.code}
									</Td>
									<Td fontSize="sm">{product.name}</Td>
									<Td>
										<Badge
											colorScheme="blue"
											fontSize="xs">
											{product.category}
										</Badge>
									</Td>
									<Td
										isNumeric
										fontWeight="600"
										fontSize="sm">
										{product.quantitySold}
									</Td>
									<Td
										isNumeric
										fontWeight="600"
										fontSize="sm"
										color="brand.500">
										{formatCurrency(product.revenue)} đ
									</Td>
									<Td isNumeric>
										<Badge
											colorScheme={
												product.stock === 0
													? "red"
													: product.stock < 50
													? "orange"
													: "green"
											}
											fontSize="xs">
											{product.stock}
										</Badge>
									</Td>
								</Tr>
							))}
						</Tbody>
					</Table>
				</Box>
			</Box>
		</ChartCard>
	);
};
