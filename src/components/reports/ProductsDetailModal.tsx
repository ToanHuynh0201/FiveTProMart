import { useState, useMemo } from "react";
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
	Select,
	Text,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
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
import Pagination from "@/components/common/Pagination";
import type { ProductsReport } from "@/types/reports";

interface ProductsDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: ProductsReport;
}

const COLORS = ["#161F70", "#1C2A93", "#1728BC", "#6890FF", "#BBD6FF"];
const PAGE_SIZE = 10;

export const ProductsDetailModal: React.FC<ProductsDetailModalProps> = ({
	isOpen,
	onClose,
	data,
}) => {
	const [topLimit, setTopLimit] = useState<number | "all">(10);
	const [currentPage, setCurrentPage] = useState(1);

	// Filter data based on selected top limit
	const filteredProducts = useMemo(() => {
		if (topLimit === "all") {
			return data.topSellingProducts;
		}
		return data.topSellingProducts.slice(0, topLimit);
	}, [data.topSellingProducts, topLimit]);

	// Paginate table data
	const paginatedProducts = useMemo(() => {
		const startIndex = (currentPage - 1) * PAGE_SIZE;
		const endIndex = startIndex + PAGE_SIZE;
		return filteredProducts.slice(startIndex, endIndex);
	}, [filteredProducts, currentPage]);

	const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);

	// Reset to page 1 when filter changes
	const handleTopLimitChange = (value: string) => {
		const newLimit = value === "all" ? "all" : Number.parseInt(value);
		setTopLimit(newLimit);
		setCurrentPage(1);
	};

	const formatCurrency = (value: number) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(0)}K`;
		}
		return value.toString();
	};

	const chartData = filteredProducts.map((product) => ({
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
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="6xl"
			scrollBehavior="inside">
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent maxH="90vh">
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="gray.800">
					Chi tiết Báo cáo Sản phẩm
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					{/* Top Limit Selector */}
					<Flex
						justify="space-between"
						align="center"
						mb={6}>
						<Text
							fontSize="lg"
							fontWeight="600"
							color="gray.700">
							Top Sản phẩm bán chạy
						</Text>
						<Flex
							align="center"
							gap={3}>
							<Text
								fontSize="sm"
								color="gray.600">
								Hiển thị:
							</Text>
							<Select
								value={topLimit}
								onChange={(e) => handleTopLimitChange(e.target.value)}
								size="sm"
								width="120px"
								bg="white"
								borderColor="gray.300">
								<option value={5}>Top 5</option>
								<option value={10}>Top 10</option>
								<option value={50}>Top 50</option>
								<option value="all">Tất cả</option>
							</Select>
						</Flex>
					</Flex>

					{/* Chart */}
					<Box
						bg="white"
						borderRadius="lg"
						p={6}
						boxShadow="sm"
						border="1px solid"
						borderColor="gray.200">
						<ResponsiveContainer
							width="100%"
							height={500}>
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
					</Box>

					<Divider my={6} />

					{/* Table with Pagination */}
					<Box>
						<Text
							fontSize="lg"
							fontWeight="600"
							color="gray.700"
							mb={4}>
							Chi tiết sản phẩm ({filteredProducts.length} sản phẩm)
						</Text>
						<Box
							overflowX="auto"
							borderRadius="lg"
							border="1px solid"
							borderColor="gray.200">
							<Table
								size="sm"
								variant="simple">
								<Thead bg="gray.50">
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
									{paginatedProducts.map((product, index) => {
										const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
										return (
											<Tr
												key={product.id}
												_hover={{ bg: "gray.50" }}>
												<Td>
													<Flex
														w="24px"
														h="24px"
														borderRadius="full"
														bg={COLORS[globalIndex % COLORS.length]}
														color="white"
														align="center"
														justify="center"
														fontSize="xs"
														fontWeight="700">
														{globalIndex + 1}
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
										);
									})}
								</Tbody>
							</Table>
						</Box>

						{/* Pagination Controls */}
						<Pagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={filteredProducts.length}
							pageSize={PAGE_SIZE}
							onPageChange={setCurrentPage}
							itemLabel="sản phẩm"
						/>
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
