import { useState, useEffect, useRef } from "react";
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
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	useDisclosure,
} from "@chakra-ui/react";
import { FiPackage } from "react-icons/fi";
import type { InventoryProduct } from "../../types/inventory";
import { inventoryService } from "../../services/inventoryService";

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
	
	// Delete confirmation dialog
	const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
	const cancelRef = useRef<HTMLButtonElement>(null);

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

		setIsDeleting(true);
		try {
			await onDelete(product.productId);
			toast({
				title: "Thành công",
				description: "Đã xóa sản phẩm",
				status: "success",
				duration: 3000,
			});
			onDeleteClose();
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
		<>
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
										{product.productName}
									</Text>
										{getStatusBadge((product.totalStockQuantity ?? 0) > 0 ? "active" : "out-of-stock")}
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
										{product.productId}
									</Text>
									<Text
										fontSize="14px"
										color="gray.600">
										<Text
											as="span"
											fontWeight="600">
											Danh mục:
										</Text>{" "}
										{product.categoryId}
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
											{(product.sellingPrice ?? 0).toLocaleString(
												"vi-VN",
											)}
											đ
										</Text>
									</Text>
								</Flex>
							</Box>

							<Divider />

							{/* Stock warning */}
							{product.totalStockQuantity === 0 && (
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

							{/* Thông tin tồn kho */}
							<Box>
								<Text
									fontSize="16px"
									fontWeight="700"
									color="gray.700"
									mb={2}>
									Thông tin tồn kho
								</Text>
								<InfoRow
									label="Tồn kho hiện tại"
									value={product.totalStockQuantity ?? 0}
								/>
								<InfoRow
									label="Đơn vị tính"
									value={product.unitOfMeasure}
								/>
							</Box>
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
						onClick={onDeleteOpen}
						isDisabled={isLoading || !product}>
						Xóa
					</Button>
					{onManageBatches && (
						<Button
							leftIcon={<FiPackage />}
							colorScheme="purple"
							variant="outline"
							onClick={() => {
								if (product) {
									onManageBatches(product.productId);
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
						onClick={() => product && onEdit(product.productId)}
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

		{/* Delete Confirmation Dialog */}
		<AlertDialog
			isOpen={isDeleteOpen}
			leastDestructiveRef={cancelRef}
			onClose={onDeleteClose}
			isCentered>
			<AlertDialogOverlay>
				<AlertDialogContent>
					<AlertDialogHeader fontSize="lg" fontWeight="bold">
						Xóa sản phẩm
					</AlertDialogHeader>

					<AlertDialogBody>
						Bạn có chắc chắn muốn xóa sản phẩm "{product?.productName}"?
						Hành động này không thể hoàn tác.
					</AlertDialogBody>

					<AlertDialogFooter>
						<Button ref={cancelRef} onClick={onDeleteClose}>
							Hủy
						</Button>
						<Button
							colorScheme="red"
							onClick={handleDelete}
							isLoading={isDeleting}
							ml={3}>
							Xóa
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialogOverlay>
		</AlertDialog>
	</>
	);
};
