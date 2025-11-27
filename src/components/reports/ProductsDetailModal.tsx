import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
	Text,
	Divider,
	Grid,
	Flex,
	Badge,
} from "@chakra-ui/react";
import { ProductsChart } from "./ProductsChart";
import type { ProductsReport } from "@/types/reports";

interface ProductsDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	data: ProductsReport;
}

export const ProductsDetailModal: React.FC<ProductsDetailModalProps> = ({
	isOpen,
	onClose,
	data,
}) => {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
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
					{/* Summary Stats */}
					<Grid
						templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
						gap={4}
						mb={6}>
						<Box
							bg="blue.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="blue.100">
							<Text
								color="blue.700"
								fontWeight="600"
								fontSize="sm"
								mb={1}>
								Tổng sản phẩm bán
							</Text>
							<Text
								color="blue.800"
								fontSize="3xl"
								fontWeight="700">
								{data.totalProductsSold}
							</Text>
						</Box>

						<Box
							bg="purple.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="purple.100">
							<Text
								color="purple.700"
								fontWeight="600"
								fontSize="sm"
								mb={1}>
								Số danh mục
							</Text>
							<Text
								color="purple.800"
								fontSize="3xl"
								fontWeight="700">
								{data.totalCategories}
							</Text>
						</Box>

						<Box
							bg="orange.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="orange.100">
							<Text
								color="orange.700"
								fontWeight="600"
								fontSize="sm"
								mb={1}>
								Sản phẩm sắp hết
							</Text>
							<Text
								color="orange.800"
								fontSize="3xl"
								fontWeight="700">
								{data.lowStockProducts}
							</Text>
						</Box>

						<Box
							bg="green.50"
							p={4}
							borderRadius="lg"
							border="1px solid"
							borderColor="green.100">
							<Text
								color="green.700"
								fontWeight="600"
								fontSize="sm"
								mb={1}>
								Top 5 sản phẩm
							</Text>
							<Text
								color="green.800"
								fontSize="3xl"
								fontWeight="700">
								{data.topSellingProducts.length}
							</Text>
						</Box>
					</Grid>

					<Divider mb={6} />

					{/* Chart */}
					<ProductsChart data={data} />

					<Divider my={6} />

					{/* Detailed Product Cards */}
					<Box>
						<Text
							fontSize="18px"
							fontWeight="700"
							mb={4}>
							Chi tiết sản phẩm bán chạy
						</Text>
						<Grid
							templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
							gap={4}>
							{data.topSellingProducts.map((product, index) => (
								<Box
									key={product.id}
									p={4}
									bg="white"
									border="1px solid"
									borderColor="gray.200"
									borderRadius="lg"
									_hover={{
										boxShadow: "md",
										borderColor: "brand.200",
									}}
									transition="all 0.2s">
									<Flex
										justify="space-between"
										align="start"
										mb={3}>
										<Flex
											align="center"
											gap={3}>
											<Flex
												w="32px"
												h="32px"
												borderRadius="full"
												bg="brand.500"
												color="white"
												align="center"
												justify="center"
												fontSize="sm"
												fontWeight="700">
												#{index + 1}
											</Flex>
											<Box>
												<Text
													fontSize="sm"
													fontWeight="700"
													color="gray.800">
													{product.name}
												</Text>
												<Text
													fontSize="xs"
													color="gray.500">
													{product.code}
												</Text>
											</Box>
										</Flex>
										<Badge
											colorScheme="blue"
											fontSize="xs">
											{product.category}
										</Badge>
									</Flex>

									<Divider mb={3} />

									<Grid
										templateColumns="repeat(2, 1fr)"
										gap={3}>
										<Box>
											<Text
												fontSize="xs"
												color="gray.500"
												mb={1}>
												Đã bán
											</Text>
											<Text
												fontSize="lg"
												fontWeight="700"
												color="brand.500">
												{product.quantitySold}
											</Text>
										</Box>
										<Box>
											<Text
												fontSize="xs"
												color="gray.500"
												mb={1}>
												Doanh thu
											</Text>
											<Text
												fontSize="md"
												fontWeight="700"
												color="green.600">
												{formatCurrency(
													product.revenue,
												)}
											</Text>
										</Box>
										<Box>
											<Text
												fontSize="xs"
												color="gray.500"
												mb={1}>
												Tồn kho
											</Text>
											<Badge
												colorScheme={
													product.stock === 0
														? "red"
														: product.stock < 50
														? "orange"
														: "green"
												}
												fontSize="sm"
												px={2}
												py={1}>
												{product.stock}
											</Badge>
										</Box>
										<Box>
											<Text
												fontSize="xs"
												color="gray.500"
												mb={1}>
												Trạng thái
											</Text>
											<Badge
												colorScheme={
													product.stock > 0
														? "green"
														: "red"
												}
												fontSize="xs"
												px={2}
												py={1}>
												{product.stock > 0
													? "Còn hàng"
													: "Hết hàng"}
											</Badge>
										</Box>
									</Grid>
								</Box>
							))}
						</Grid>
					</Box>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};
