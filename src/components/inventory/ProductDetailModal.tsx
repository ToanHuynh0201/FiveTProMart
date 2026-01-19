import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	VStack,
	Text,
	Badge,
	Divider,
	Box,
	Flex,
	useToast,
	Spinner,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Tooltip,
	Grid,
	GridItem,
	Input,
	IconButton,
} from "@chakra-ui/react";
import { FiPackage, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import type { InventoryProduct, ProductBatch } from "../../types/inventory";
import { inventoryService } from "../../services/inventoryService";
import { getExpiryStatus, isExpired } from "../../utils/date";

interface ProductDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	productId: string | null;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onManageBatches?: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
	isOpen,
	onClose,
	productId,
	onEdit,
	onDelete,
	onManageBatches,
}) => {
	const toast = useToast();
	const [product, setProduct] = useState<InventoryProduct | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
	const [editValues, setEditValues] = useState<{
		quantityInStock: number;
		quantityOnDisplay: number;
	}>({ quantityInStock: 0, quantityOnDisplay: 0 });

	useEffect(() => {
		if (isOpen && productId) {
			loadProduct();
		}
	}, [isOpen, productId]);

	const loadProduct = async () => {
		if (!productId) return;

		setIsLoading(true);
		try {
			const data = await inventoryService.getProductById(productId);
			setProduct(data || null);
		} catch (error) {
			console.error("Error loading product:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải thông tin sản phẩm",
				status: "error",
				duration: 3000,
			});
			setProduct(null);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!product) return;

		if (
			!window.confirm(
				`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`,
			)
		) {
			return;
		}

		setIsDeleting(true);
		try {
			await onDelete(product.id);
			toast({
				title: "Thành công",
				description: "Đã xóa sản phẩm",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Không thể xóa sản phẩm",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsDeleting(false);
		}
	};

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
				fontSize="13px"
				fontWeight="600">
				{config.label}
			</Badge>
		);
	};

	const handleStartEdit = (batch: ProductBatch) => {
		setEditingBatchId(batch.id);
		setEditValues({
			quantityInStock: batch.quantityInStock || 0,
			quantityOnDisplay: batch.quantityOnDisplay || 0,
		});
	};

	const handleCancelEdit = () => {
		setEditingBatchId(null);
		setEditValues({ quantityInStock: 0, quantityOnDisplay: 0 });
	};

	const handleQuantityChange = (
		field: "quantityInStock" | "quantityOnDisplay",
		value: number,
		currentBatch: ProductBatch,
	) => {
		const totalQuantity = currentBatch.quantity; // Tổng số lượng cố định
		const newValue = Math.max(0, Math.min(value, totalQuantity)); // Giới hạn từ 0 đến tổng

		if (field === "quantityInStock") {
			setEditValues({
				quantityInStock: newValue,
				quantityOnDisplay: totalQuantity - newValue,
			});
		} else {
			setEditValues({
				quantityInStock: totalQuantity - newValue,
				quantityOnDisplay: newValue,
			});
		}
	};

	const handleSaveEdit = async (batchId: string) => {
		if (!product) return;

		try {
			// API currently supports updating total quantity and status
			// For display/stock split, backend API extension needed
			const totalQuantity = editValues.quantityInStock + editValues.quantityOnDisplay;
			await inventoryService.updateLot(batchId, totalQuantity, "available");

			// Reload product to get updated data
			await loadProduct();

			toast({
				title: "Thành công",
				description: "Đã cập nhật số lượng lô hàng",
				status: "success",
				duration: 3000,
			});

			setEditingBatchId(null);
		} catch (error) {
			toast({
				title: "Lỗi",
				description:
					error instanceof Error
						? error.message
						: "Không thể cập nhật số lượng",
				status: "error",
				duration: 3000,
			});
		}
	};

	const InfoRow = ({
		label,
		value,
	}: {
		label: string;
		value: string | number;
	}) => (
		<Flex
			justify="space-between"
			align="center"
			py={2}>
			<Text
				fontSize="15px"
				color="gray.600"
				fontWeight="500">
				{label}
			</Text>
			<Text
				fontSize="15px"
				color="gray.800"
				fontWeight="600">
				{value}
			</Text>
		</Flex>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="3xl">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent>
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600">
					Chi tiết hàng hóa
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					{isLoading && (
						<Flex
							justify="center"
							align="center"
							py={12}>
							<Spinner
								size="xl"
								color="brand.500"
								thickness="4px"
							/>
						</Flex>
					)}

					{!isLoading && product && (
						<VStack
							spacing={4}
							align="stretch">
							{/* Header: Tên sản phẩm và trạng thái */}
							<Box>
								<Flex
									justify="space-between"
									align="center"
									mb={3}>
									<Text
										fontSize="20px"
										fontWeight="700"
										color="gray.800">
										{product.name}
									</Text>
									{getStatusBadge(product.status)}
								</Flex>
								<Flex
									gap={4}
									flexWrap="wrap">
									<Text
										fontSize="14px"
										color="gray.600">
										<Text
											as="span"
											fontWeight="600">
											Mã hàng:
										</Text>{" "}
										{product.code}
									</Text>
									<Text
										fontSize="14px"
										color="gray.600">
										<Text
											as="span"
											fontWeight="600">
											Danh mục:
										</Text>{" "}
										{product.category}
									</Text>
									<Text
										fontSize="14px"
										color="gray.600">
										<Text
											as="span"
											fontWeight="600">
											Giá bán:
										</Text>{" "}
										<Text
											as="span"
											color="blue.600"
											fontWeight="700">
											{product.price.toLocaleString(
												"vi-VN",
											)}
											đ
										</Text>
									</Text>
								</Flex>
							</Box>

							<Divider />

							<Box>
								<Text
									fontSize="18px"
									fontWeight="700"
									color="gray.700"
									mb={3}>
									Danh sách lô hàng (
									{product.batches?.length || 0} lô)
								</Text>

								{product.batches &&
								product.batches.length > 0 ? (
									<Box
										border="1px solid"
										borderColor="gray.200"
										borderRadius="8px"
										overflow="hidden"
										boxShadow="sm">
										<Table size="md">
											<Thead bg="gray.50">
												<Tr>
													<Th fontSize="12px">
														Số lô
													</Th>
													<Th
														fontSize="12px"
														isNumeric>
														Giá vốn
													</Th>
													<Th
														fontSize="12px"
														isNumeric>
														SL trong kho
													</Th>
													<Th
														fontSize="12px"
														isNumeric>
														SL trưng bày
													</Th>
													<Th fontSize="12px">
														Hạn SD
													</Th>
													<Th fontSize="12px">
														Trạng thái
													</Th>
													<Th fontSize="12px">
														Thao tác
													</Th>
												</Tr>
											</Thead>
											<Tbody>
												{product.batches.map(
													(batch) => {
														const expiryInfo =
															getExpiryStatus(
																batch.expiryDate,
															);
														const expired =
															isExpired(
																batch.expiryDate,
															);
														const isEditing =
															editingBatchId ===
															batch.id;

														return (
															<Tr
																key={batch.id}
																bg={
																	expired
																		? "red.50"
																		: "white"
																}>
																<Td
																	fontSize="13px"
																	fontWeight="600">
																	{
																		batch.batchNumber
																	}
																</Td>
																<Td
																	fontSize="13px"
																	isNumeric
																	fontWeight="600"
																	color="blue.600">
																	{batch.costPrice?.toLocaleString(
																		"vi-VN",
																	)}
																	đ
																</Td>
																<Td
																	fontSize="13px"
																	isNumeric>
																	{isEditing ? (
																		<Input
																			type="number"
																			size="sm"
																			value={
																				editValues.quantityInStock
																			}
																			onChange={(
																				e,
																			) =>
																				handleQuantityChange(
																					"quantityInStock",
																					Number.parseInt(
																						e
																							.target
																							.value,
																					) ||
																						0,
																					batch,
																				)
																			}
																			min={
																				0
																			}
																			max={
																				batch.quantity
																			}
																			w="80px"
																		/>
																	) : (
																		<Text
																			fontWeight="600">
																			{batch.quantityInStock ||
																				0}
																		</Text>
																	)}
																</Td>
																<Td
																	fontSize="13px"
																	isNumeric>
																	{isEditing ? (
																		<Input
																			type="number"
																			size="sm"
																			value={
																				editValues.quantityOnDisplay
																			}
																			onChange={(
																				e,
																			) =>
																				handleQuantityChange(
																					"quantityOnDisplay",
																					Number.parseInt(
																						e
																							.target
																							.value,
																					) ||
																						0,
																					batch,
																				)
																			}
																			min={
																				0
																			}
																			max={
																				batch.quantity
																			}
																			w="80px"
																		/>
																	) : (
																		<Text
																			fontWeight="600">
																			{batch.quantityOnDisplay ||
																				0}
																		</Text>
																	)}
																</Td>
																<Td fontSize="13px">
																	{batch.expiryDate ? (
																		<Tooltip
																			label={
																				expiryInfo.status ===
																				"expired"
																					? "Đã hết hạn"
																					: `Còn ${expiryInfo.text}`
																			}
																			hasArrow>
																			<Badge
																				colorScheme={
																					expired
																						? "red"
																						: expiryInfo.status ===
																						  "critical"
																						? "red"
																						: expiryInfo.status ===
																						  "warning"
																						? "orange"
																						: "green"
																				}
																				fontSize="11px">
																				{
																					expiryInfo.text
																				}
																			</Badge>
																		</Tooltip>
																	) : (
																		<Text
																			fontSize="12px"
																			color="gray.600">
																			Không
																			có
																			HSD
																		</Text>
																	)}
																</Td>
																<Td fontSize="13px">
																	<Badge
																		colorScheme={
																			batch.status ===
																			"active"
																				? "green"
																				: batch.status ===
																				  "expired"
																				? "red"
																				: "gray"
																		}
																		fontSize="11px">
																		{batch.status ===
																		"active"
																			? "Hoạt động"
																			: batch.status ===
																			  "expired"
																			? "Hết hạn"
																			: "Đã bán hết"}
																	</Badge>
																</Td>
																<Td>
																	{isEditing ? (
																		<Flex
																			gap={
																				1
																			}>
																			<IconButton
																				aria-label="Lưu"
																				icon={
																					<FiCheck />
																				}
																				size="sm"
																				colorScheme="green"
																				onClick={() =>
																					handleSaveEdit(
																						batch.id,
																					)
																				}
																			/>
																			<IconButton
																				aria-label="Hủy"
																				icon={
																					<FiX />
																				}
																				size="sm"
																				colorScheme="gray"
																				onClick={
																					handleCancelEdit
																				}
																			/>
																		</Flex>
																	) : (
																		<IconButton
																			aria-label="Chỉnh sửa"
																			icon={
																				<FiEdit2 />
																			}
																			size="sm"
																			variant="ghost"
																			colorScheme="blue"
																			onClick={() =>
																				handleStartEdit(
																					batch,
																				)
																			}
																		/>
																	)}
																</Td>
															</Tr>
														);
													},
												)}
											</Tbody>
										</Table>
									</Box>
								) : (
									<Box
										p={4}
										bg="gray.50"
										borderRadius="8px"
										textAlign="center"
										border="1px solid"
										borderColor="gray.200">
										<Text
											fontSize="14px"
											color="gray.600">
											Chưa có lô hàng nào
										</Text>
									</Box>
								)}
							</Box>

							<Divider />

							{/* Stock warning */}
							{product.stock === 0 && (
								<Box
									p={2}
									bg="red.50"
									borderRadius="8px"
									border="1px solid"
									borderColor="red.200">
									<Text
										fontSize="14px"
										color="red.600"
										fontWeight="600">
										⚠️ Sản phẩm đã hết hàng
									</Text>
								</Box>
							)}
							{product.stock > 0 &&
								product.stock <= product.minStock && (
									<Box
										p={2}
										bg="orange.50"
										borderRadius="8px"
										border="1px solid"
										borderColor="orange.200">
										<Text
											fontSize="14px"
											color="orange.600"
											fontWeight="600">
											⚠️ Sản phẩm sắp hết hàng
										</Text>
									</Box>
								)}

							{/* 2 cột thông tin chi tiết */}
							<Grid
								templateColumns="repeat(2, 1fr)"
								gap={4}>
								{/* Cột 1: Thông tin tồn kho */}
								<GridItem
									borderRight="1px solid"
									borderColor="gray.200">
									<Box pr={4}>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="gray.700"
											mb={2}>
											Thông tin tồn kho
										</Text>
										<InfoRow
											label="Tồn kho hiện tại"
											value={product.stock}
										/>
										<InfoRow
											label="Tồn kho tối thiểu"
											value={product.minStock}
										/>
										<InfoRow
											label="Tồn kho tối đa"
											value={product.maxStock}
										/>
										<Divider my={2} />
										<InfoRow
											label="Đơn vị tính"
											value={product.unit}
										/>
										{product.supplier && (
											<InfoRow
												label="Nhà cung cấp"
												value={product.supplier}
											/>
										)}
									</Box>
								</GridItem>

								{/* Cột 2: Thông tin khác */}
								<GridItem>
									<Box pl={4}>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="gray.700"
											mb={2}>
											Thông tin khác
										</Text>
										<InfoRow
											label="Ngày tạo"
											value={new Date(
												product.createdAt,
											).toLocaleDateString("vi-VN")}
										/>
										<InfoRow
											label="Cập nhật lần cuối"
											value={new Date(
												product.updatedAt,
											).toLocaleDateString("vi-VN")}
										/>
									</Box>
								</GridItem>
							</Grid>

							{product.description && (
								<>
									<Divider />
									<Box>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="gray.700"
											mb={2}>
											Mô tả
										</Text>
										<Text
											fontSize="14px"
											color="gray.600"
											lineHeight="1.6">
											{product.description}
										</Text>
									</Box>
								</>
							)}
						</VStack>
					)}

					{!isLoading && !product && (
						<Text
							fontSize="16px"
							color="gray.600"
							textAlign="center"
							py={12}>
							Không tìm thấy thông tin sản phẩm
						</Text>
					)}
				</ModalBody>
				<ModalFooter gap={3}>
					<Button
						variant="ghost"
						colorScheme="red"
						onClick={handleDelete}
						isLoading={isDeleting}
						isDisabled={isLoading}>
						Xóa
					</Button>
					{onManageBatches && (
						<Button
							leftIcon={<FiPackage />}
							colorScheme="purple"
							variant="outline"
							onClick={() => {
								if (product) {
									onManageBatches(product.id);
									onClose();
								}
							}}
							isDisabled={isLoading || !product}>
							Quản lý lô hàng
						</Button>
					)}
					<Button
						variant="outline"
						colorScheme="blue"
						onClick={() => product && onEdit(product.id)}
						isDisabled={isLoading || !product}>
						Chỉnh sửa
					</Button>
					<Button
						onClick={onClose}
						isDisabled={isLoading}>
						Đóng
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
