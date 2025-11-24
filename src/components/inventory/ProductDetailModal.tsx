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
} from "@chakra-ui/react";
import type { InventoryProduct } from "../../types/inventory";
import { inventoryService } from "../../services/inventoryService";

interface ProductDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	productId: string | null;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
	isOpen,
	onClose,
	productId,
	onEdit,
	onDelete,
}) => {
	const toast = useToast();
	const [product, setProduct] = useState<InventoryProduct | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

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
			toast({
				title: "Lỗi",
				description: "Không thể tải thông tin sản phẩm",
				status: "error",
				duration: 3000,
			});
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
			size="xl">
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
								<Text
									fontSize="14px"
									color="gray.600">
									Mã hàng: {product.code}
								</Text>
								{product.barcode && (
									<Text
										fontSize="14px"
										color="gray.600">
										Mã vạch: {product.barcode}
									</Text>
								)}
							</Box>

							<Divider />

							<Box>
								<Text
									fontSize="16px"
									fontWeight="700"
									color="gray.700"
									mb={2}>
									Thông tin cơ bản
								</Text>
								<InfoRow
									label="Danh mục"
									value={product.category}
								/>
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

							<Divider />

							<Box>
								<Text
									fontSize="16px"
									fontWeight="700"
									color="gray.700"
									mb={2}>
									Giá và tồn kho
								</Text>
								<InfoRow
									label="Giá vốn"
									value={`${product.costPrice.toLocaleString(
										"vi-VN",
									)}đ`}
								/>
								<InfoRow
									label="Giá bán"
									value={`${product.price.toLocaleString(
										"vi-VN",
									)}đ`}
								/>
								<Divider my={2} />
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

								{/* Stock warning */}
								{product.stock === 0 && (
									<Box
										mt={3}
										p={3}
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
											mt={3}
											p={3}
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
							</Box>

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

							<Divider />

							<Box>
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
						</VStack>
					)}

					{!isLoading && !product && (
						<Text
							fontSize="16px"
							color="gray.500"
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
