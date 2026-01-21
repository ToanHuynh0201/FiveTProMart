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
import type { InventoryProduct, InventoryCategory } from "../../types/inventory";
import { EmptyState } from "../common";

interface ProductTableProps {
	products: InventoryProduct[];
	categories?: InventoryCategory[];
	onViewDetail: (id: string) => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
	products,
	categories = [],
	onViewDetail,
	onEdit,
	onDelete,
}) => {
	// Create a key based on products to trigger animation on filter changes
	const tableKey = products.map((p) => p.productId).join("-");

	// Helper to get category name from id
	const getCategoryName = (categoryId: string): string => {
		const category = categories.find((c) => c.categoryId === categoryId);
		return category?.categoryName || categoryId;
	};

	const getStatusBadge = (status: string) => {
		const statusConfig = {
			active: { color: "green", label: "─Éang kinh doanh" },
			inactive: { color: "gray", label: "Ngß╗½ng kinh doanh" },
			"out-of-stock": { color: "red", label: "Hß║┐t h├áng" },
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
					Hß║┐t h├áng
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
					Sß║»p hß║┐t
				</Text>
			);
		}
		return null;
	};

	// Helper to derive status from stock quantity
	const getProductStatus = (product: InventoryProduct): string => {
		if (product.totalStockQuantity === 0) return "out-of-stock";
		return "active";
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
								M├ú h├áng
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="200px">
								T├¬n h├áng h├│a
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="120px">
								Danh mß╗Ñc
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="100px"
								isNumeric>
								Tß╗ôn kho
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="80px">
								─É╞ín vß╗ï
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="120px"
								isNumeric>
								Gi├í b├ín
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="140px">
								Trß║íng th├íi
							</Th>
							<Th
								fontSize="13px"
								fontWeight="700"
								color="gray.700"
								textTransform="none"
								py={4}
								width="110px"
								textAlign="center">
								Thao t├íc
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
									{product.productId}
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
								{(product.sellingPrice ?? 0).toLocaleString("vi-VN")}─æ
							</Td>
							<Td width="140px">
								{getStatusBadge(getProductStatus(product))}
								</Td>
								<Td width="110px">
									<Flex
										justify="center"
										gap={1}>
										<Tooltip
											label="Xem chi tiß║┐t"
											fontSize="xs">
											<IconButton
												aria-label="Xem chi tiß║┐t"
												icon={<ViewIcon />}
												size="sm"
												variant="ghost"
												colorScheme="blue"
												onClick={() =>
													onViewDetail(product.productId)
												}
											/>
										</Tooltip>
										<Menu>
											<MenuButton
												as={IconButton}
												aria-label="Thao t├íc kh├íc"
												icon={<BsThreeDotsVertical />}
												size="sm"
												variant="ghost"
											/>
											<MenuList>
												<MenuItem
													icon={<EditIcon />}
													onClick={() =>
														onEdit(product.productId)
													}>
													Chß╗ënh sß╗¡a
												</MenuItem>
												<MenuItem
													icon={<DeleteIcon />}
													color="red.500"
													onClick={() =>
														onDelete(product.productId)
													}>
													X├│a
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
					title="Kh├┤ng t├¼m thß║Ñy sß║ún phß║⌐m"
					description="Thß╗¡ thay ─æß╗òi bß╗Ö lß╗ìc hoß║╖c tß╗½ kh├│a t├¼m kiß║┐m"
				/>
			)}
		</Box>
	);
};
