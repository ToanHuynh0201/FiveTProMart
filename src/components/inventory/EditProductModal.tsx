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
	FormControl,
	FormLabel,
	Input,
	Select,
	VStack,
	HStack,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	useToast,
	Spinner,
	Flex,
} from "@chakra-ui/react";
import type {
	InventoryProduct,
	InventoryCategory,
} from "../../types/inventory";
import { inventoryService } from "../../services/inventoryService";

interface EditProductModalProps {
	isOpen: boolean;
	onClose: () => void;
	productId: string | null;
	onUpdate: (id: string, updates: Partial<InventoryProduct>) => Promise<void>;
	categories: InventoryCategory[];
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
	isOpen,
	onClose,
	productId,
	onUpdate,
	categories,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [product, setProduct] = useState<InventoryProduct | null>(null);

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
			if (data) {
				setProduct(data);
			}
		} catch (error) {
			console.error("Error loading product:", error);
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

	const handleSubmit = async () => {
		if (!product) return;

		// Validation
		if (!product.productName.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên hàng hóa",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!product.categoryId) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn danh mục",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!product.unitOfMeasure.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập đơn vị tính",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!product.sellingPrice || product.sellingPrice <= 0) {
			toast({
				title: "Lỗi",
				description: "Giá bán phải lớn hơn 0",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsSaving(true);

		try {
			await onUpdate(product.productId, product);
			toast({
				title: "Thành công",
				description: "Cập nhật hàng hóa thành công",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật hàng hóa",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsSaving(false);
		}
	};

	const updateField = (field: keyof InventoryProduct, value: unknown) => {
		if (!product) return;
		setProduct({ ...product, [field]: value });
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent>
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600">
					Chỉnh sửa hàng hóa
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
							<FormControl isRequired>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Tên hàng hóa
								</FormLabel>
								<Input
									value={product.productName}
									onChange={(e) =>
										updateField("productName", e.target.value)
									}
									fontSize="15px"
									h="48px"
								/>
							</FormControl>

							<HStack spacing={4}>
								<FormControl isRequired>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Danh mục
									</FormLabel>
									<Select
										value={product.categoryId}
										onChange={(e) =>
											updateField(
												"categoryId",
												e.target.value,
											)
										}
										fontSize="15px"
										h="48px">
										{categories.map((cat) => (
											<option
												key={cat.categoryId}
												value={cat.categoryId}>
												{cat.categoryName}
											</option>
										))}
									</Select>
								</FormControl>

								<FormControl isRequired>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Đơn vị tính
									</FormLabel>
									<Input
										value={product.unitOfMeasure}
										onChange={(e) =>
											updateField("unitOfMeasure", e.target.value)
										}
										fontSize="15px"
										h="48px"
									/>
								</FormControl>
							</HStack>

							<FormControl isRequired>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Giá bán (đ)
								</FormLabel>
								<NumberInput
									min={0}
										value={product.sellingPrice ?? 0}
									onChange={(_, value) =>
										updateField("sellingPrice", value)
									}>
									<NumberInputField
										fontSize="15px"
										h="48px"
									/>
									<NumberInputStepper>
										<NumberIncrementStepper />
										<NumberDecrementStepper />
									</NumberInputStepper>
								</NumberInput>
							</FormControl>
						</VStack>
					)}
				</ModalBody>

				<ModalFooter gap={3}>
					<Button
						variant="ghost"
						onClick={onClose}
						isDisabled={isSaving || isLoading}>
						Hủy
					</Button>
					<Button
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						onClick={handleSubmit}
						isLoading={isSaving}
						isDisabled={isLoading}
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
						}}>
						Lưu thay đổi
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
