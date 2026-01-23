import {
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Text,
	Badge,
	IconButton,
	Flex,
	Tooltip,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	useToast,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import type {
	InventoryProduct,
	InventoryCategory,
} from "../../types/inventory";
import { EmptyState } from "../common";

interface ProductTableProps {
	products: InventoryProduct[];
	categories?: InventoryCategory[];
	onViewDetail: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onManageBatches?: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
	products,
	categories = [],
	onViewDetail,
	onEdit,
	onDelete,
	onManageBatches,
}) => {
	const toast = useToast();
	// Create a key based o
	// n products to trigger animation on filter changes
	const tableKey = products.map((p) => p.productId).join("-");

	// Helper to get category name from id
	const getCategoryName = (categoryId: string): string => {
		const category = categories.find((c) => c.categoryId === categoryId);
		return category?.categoryName || categoryId;
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			"in-stock": { color: "green", label: "Còn hàng" },
			"out-of-stock": { color: "red", label: "Hết hàng" },
		};

		const config = statusConfig[status as keyof typeof statusConfig] || {
			color: "gray",
			label: status,
		};

		return (
			<Badge
				colorScheme={config.color}
				px={1}
				py={0}
				borderRadius="full"
				fontSize="12px"
				fontWeight="600">
				{config.label}
			</Badge>
		);
	};

	const getStockWarning = (product: InventoryProduct) => {
		const qty = product.totalStockQuantity ?? 0;
		if (qty === 0) {
			return (
				<Text
					color="red.500"
					fontSize="13px"
					fontWeight="600">
					Hết hàng
				</Text>
			);
		}
		// Low stock warning (threshold: 10 units)
		if (qty <= 10) {
			return (
				<Text
					color="orange.500"
					fontSize="13px"
					fontWeight="600">
					Sắp hết
				</Text>
			);
		}
		return null;
	};

	// Helper to derive status from stock quantity
	const getProductStatus = (product: InventoryProduct): string => {
		if (product.totalStockQuantity === 0) return "out-of-stock";
		return "in-stock";
	};

	return (
		<Box
			key={tableKey}
			bg="white"
			borderRadius="12px"
			boxShadow="sm"
			overflow="hidden"
			sx={{
				"@keyframes fadeIn": {
					from: { opacity: 0, transform: "translateY(8px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
				animation: "fadeIn 0.3s ease-out",
			}}>
			<Box overflowX="auto">
				<Table
					variant="simple"
					sx={{ tableLayout: "fixed" }}>
					<Thead bg="gray.50">
						<Tr>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="100px">
								Mã hàng
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="200px">
								Tên hàng hóa
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="120px">
								Danh mục
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="100px"
								isNumeric>
								Tồn kho
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="80px">
								Đơn vị
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="120px"
								isNumeric>
								Giá bán
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="140px">
								Trạng thái
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="110px"
								textAlign="center">
								Thao tác
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{products.map((product) => (
							<Tr
								key={product.productId}
								_hover={{ bg: "gray.50" }}
								transition="all 0.2s">
								<Td
									fontSize="14px"
									color="gray.700"
									fontWeight="500"
									width="100px">
									<Text
										overflow="hidden"
										textOverflow="ellipsis"
										whiteSpace="nowrap"
										cursor="pointer"
										onClick={() => {
											navigator.clipboard.writeText(
												product.productId,
											);
											toast({
												title: "Đã copy",
												description: `Đã copy mã sản phẩm: ${product.productId}`,
												status: "success",
												duration: 1500,
											});
										}}>
										{product.productId}
									</Text>
								</Td>
								<Td
									fontSize="14px"
									color="gray.800"
									fontWeight="600"
									width="200px">
									<Text>{product.productName}</Text>
								</Td>
								<Td
									fontSize="14px"
									color="gray.600"
									width="120px">
									{getCategoryName(product.categoryId)}
								</Td>
								<Td
									fontSize="14px"
									fontWeight="600"
									width="100px"
									isNumeric>
									<Flex
										direction="column"
										align="flex-end"
										gap={1}>
										<Text color="gray.800">
											{product.totalStockQuantity}
										</Text>
										{getStockWarning(product)}
									</Flex>
								</Td>
								<Td
									fontSize="14px"
									color="gray.600"
									width="80px">
									{product.unitOfMeasure}
								</Td>
								<Td
									fontSize="14px"
									fontWeight="600"
									color="brand.600"
									width="120px"
									isNumeric>
									{(product.sellingPrice ?? 0).toLocaleString(
										"vi-VN",
									)}
									đ
								</Td>
								<Td width="140px">
									{getStatusBadge(getProductStatus(product))}
								</Td>
								<Td width="110px">
									<Flex
										justify="center"
										gap={1}>
										<Tooltip
											label="Xem chi tiết"
											fontSize="xs">
											<IconButton
												aria-label="Xem chi tiết"
												icon={<ViewIcon />}
												size="sm"
												variant="ghost"
												colorScheme="blue"
												onClick={() =>
													onViewDetail(
														product.productId,
													)
												}
											/>
										</Tooltip>
										<Menu>
											<MenuButton
												as={IconButton}
												aria-label="Thao tác khác"
												icon={<BsThreeDotsVertical />}
												size="sm"
												variant="ghost"
											/>
											<MenuList>
												{onManageBatches && (
													<MenuItem
														onClick={() => onManageBatches(product.productId)}>
														Quản lý lô hàng
													</MenuItem>
												)}
												<MenuItem
													icon={<EditIcon />}
													onClick={() =>
														onEdit(
															product.productId,
														)
													}>
													Chỉnh sửa
												</MenuItem>
												<MenuItem
													icon={<DeleteIcon />}
													color="red.500"
													onClick={() =>
														onDelete(
															product.productId,
														)
													}>
													Xóa
												</MenuItem>
											</MenuList>
										</Menu>
									</Flex>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>

			{products.length === 0 && (
				<EmptyState
					variant="no-search-results"
					size="md"
					title="Không tìm thấy sản phẩm"
					description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
				/>
			)}
		</Box>
	);
};
