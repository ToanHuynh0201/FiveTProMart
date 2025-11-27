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
				px={3}
				py={1}
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
			bg="white"
			borderRadius="12px"
			boxShadow="sm"
			overflow="hidden">
			<Box overflowX="auto">
				<Table variant="simple">
					<Thead bg="gray.50">
						<Tr>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Mã hàng
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Tên hàng hóa
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Danh mục
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								isNumeric>
								Tồn kho
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Đơn vị
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								isNumeric>
								Giá bán
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}>
								Trạng thái
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
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
									fontWeight="500">
									{product.code}
								</Td>
								<Td
									fontSize="14px"
									color="gray.800"
									fontWeight="600"
									maxW="250px">
									<Flex
										direction="column"
										gap={1}>
										<Text>{product.name}</Text>
										{getBatchExpiryWarning(product)}
									</Flex>
								</Td>
								<Td
									fontSize="14px"
									color="gray.600">
									{product.category}
								</Td>
								<Td
									fontSize="14px"
									fontWeight="600"
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
									color="gray.600">
									{product.unit}
								</Td>
								<Td
									fontSize="14px"
									fontWeight="600"
									color="brand.600"
									isNumeric>
									{product.price.toLocaleString("vi-VN")}đ
								</Td>
								<Td>{getStatusBadge(product.status)}</Td>
								<Td>
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
				<Flex
					justify="center"
					align="center"
					py={12}>
					<Text
						fontSize="16px"
						color="gray.500"
						fontWeight="500">
						Không tìm thấy sản phẩm nào
					</Text>
				</Flex>
			)}
		</Box>
	);
};
