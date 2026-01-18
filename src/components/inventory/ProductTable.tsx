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
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { InventoryProduct } from "../../types/inventory";
import { isExpired, isExpiringSoon } from "../../utils/date";
import { EmptyState } from "../common";

interface ProductTableProps {
	products: InventoryProduct[];
	onViewDetail: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
	products,
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	// Create a key based on products to trigger animation on filter changes
	const tableKey = products.map((p) => p.id).join("-");
	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: { color: "green", label: "Đang kinh doanh" },
			inactive: { color: "gray", label: "Ngừng kinh doanh" },
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
		if (product.stock === 0) {
			return (
				<Text
					color="red.500"
					fontSize="13px"
					fontWeight="600">
					Hết hàng
				</Text>
			);
		}
		if (product.stock <= product.minStock) {
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

	// Kiểm tra lô hàng hết hạn
	const getBatchExpiryWarning = (product: InventoryProduct) => {
		if (!product.batches || product.batches.length === 0) return null;

		let expiredCount = 0;
		let expiringSoonCount = 0;

		product.batches.forEach((batch) => {
			if (batch.quantity > 0) {
				if (isExpired(batch.expiryDate)) {
					expiredCount++;
				} else if (isExpiringSoon(batch.expiryDate, 7)) {
					expiringSoonCount++;
				}
			}
		});

		if (expiredCount > 0) {
			return (
				<Tooltip
					label={`${expiredCount} lô đã hết hạn`}
					placement="top"
					hasArrow>
					<Badge
						colorScheme="red"
						fontSize="10px"
						px={2}
						py={0.5}
						borderRadius="md"
						cursor="help">
						⚠️ {expiredCount} lô hết hạn
					</Badge>
				</Tooltip>
			);
		}

		if (expiringSoonCount > 0) {
			return (
				<Tooltip
					label={`${expiringSoonCount} lô sắp hết hạn trong 7 ngày`}
					placement="top"
					hasArrow>
					<Badge
						colorScheme="orange"
						fontSize="10px"
						px={2}
						py={0.5}
						borderRadius="md"
						cursor="help">
						🔔 {expiringSoonCount} lô sắp hết hạn
					</Badge>
				</Tooltip>
			);
		}

		return null;
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
								key={product.id}
								_hover={{ bg: "gray.50" }}
								transition="all 0.2s">
								<Td
									fontSize="14px"
									color="gray.700"
									fontWeight="500"
									width="100px">
									{product.code}
								</Td>
								<Td
									fontSize="14px"
									color="gray.800"
									fontWeight="600"
									width="200px">
									<Flex
										direction="column"
										gap={1}>
										<Text>{product.name}</Text>
										{getBatchExpiryWarning(product)}
									</Flex>
								</Td>
								<Td
									fontSize="14px"
									color="gray.600"
									width="120px">
									{product.category}
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
											{product.stock}
										</Text>
										{getStockWarning(product)}
									</Flex>
								</Td>
								<Td
									fontSize="14px"
									color="gray.600"
									width="80px">
									{product.unit}
								</Td>
								<Td
									fontSize="14px"
									fontWeight="600"
									color="brand.600"
									width="120px"
									isNumeric>
									{product.price.toLocaleString("vi-VN")}đ
								</Td>
								<Td width="140px">
									{getStatusBadge(product.status)}
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
													onViewDetail(product.id)
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
												<MenuItem
													icon={<EditIcon />}
													onClick={() =>
														onEdit(product.id)
													}>
													Chỉnh sửa
												</MenuItem>
												<MenuItem
													icon={<DeleteIcon />}
													color="red.500"
													onClick={() =>
														onDelete(product.id)
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
