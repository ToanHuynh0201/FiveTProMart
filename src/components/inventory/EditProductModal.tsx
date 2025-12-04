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
	Textarea,
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

	const handleSubmit = async () => {
		if (!product) return;

		// Validation
		if (!product.name.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên hàng hóa",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!product.category) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn danh mục",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!product.unit.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập đơn vị tính",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (product.price <= 0) {
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
			await onUpdate(product.id, product);
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

	const updateField = (field: keyof InventoryProduct, value: any) => {
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
							<HStack spacing={4}>
								<FormControl>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Mã hàng
									</FormLabel>
									<Input
										value={product.code}
										onChange={(e) =>
											updateField("code", e.target.value)
										}
										fontSize="15px"
										h="48px"
									/>
								</FormControl>

								<FormControl>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Mã Lô
									</FormLabel>
									<Input
										value={product.barcode || ""}
										onChange={(e) =>
											updateField(
												"barcode",
												e.target.value,
											)
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
									Tên hàng hóa
								</FormLabel>
								<Input
									value={product.name}
									onChange={(e) =>
										updateField("name", e.target.value)
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
										value={product.category}
										onChange={(e) =>
											updateField(
												"category",
												e.target.value,
											)
										}
										fontSize="15px"
										h="48px">
										{categories.map((cat) => (
											<option
												key={cat.id}
												value={cat.name}>
												{cat.name}
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
										value={product.unit}
										onChange={(e) =>
											updateField("unit", e.target.value)
										}
										fontSize="15px"
										h="48px"
									/>
								</FormControl>
							</HStack>

							<HStack spacing={4}>
								<FormControl isRequired>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Giá vốn (đ)
									</FormLabel>
									<NumberInput
										min={0}
										value={product.costPrice}
										onChange={(_, value) =>
											updateField("costPrice", value)
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

								<FormControl isRequired>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Giá bán (đ)
									</FormLabel>
									<NumberInput
										min={0}
										value={product.price}
										onChange={(_, value) =>
											updateField("price", value)
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
							</HStack>

							<HStack spacing={4}>
								<FormControl>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Tồn kho tối thiểu
									</FormLabel>
									<NumberInput
										min={0}
										value={product.minStock}
										onChange={(_, value) =>
											updateField("minStock", value)
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

								<FormControl>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700">
										Tồn kho tối đa
									</FormLabel>
									<NumberInput
										min={0}
										value={product.maxStock}
										onChange={(_, value) =>
											updateField("maxStock", value)
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
							</HStack>

							<FormControl>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Nhà cung cấp
								</FormLabel>
								<Input
									value={product.supplier || ""}
									onChange={(e) =>
										updateField("supplier", e.target.value)
									}
									fontSize="15px"
									h="48px"
								/>
							</FormControl>

							<FormControl>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Trạng thái
								</FormLabel>
								<Select
									value={product.status}
									onChange={(e) =>
										updateField(
											"status",
											e.target.value as
												| "active"
												| "inactive"
												| "out-of-stock",
										)
									}
									fontSize="15px"
									h="48px">
									<option value="active">
										Đang kinh doanh
									</option>
									<option value="inactive">
										Ngừng kinh doanh
									</option>
									<option value="out-of-stock">
										Hết hàng
									</option>
								</Select>
							</FormControl>

							<FormControl>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Mô tả
								</FormLabel>
								<Textarea
									value={product.description || ""}
									onChange={(e) =>
										updateField(
											"description",
											e.target.value,
										)
									}
									fontSize="15px"
									rows={3}
								/>
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
