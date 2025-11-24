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
} from "@chakra-ui/react";
import type {
	InventoryProduct,
	InventoryCategory,
} from "../../types/inventory";

interface AddProductModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (
		product: Omit<InventoryProduct, "id" | "createdAt" | "updatedAt">,
	) => Promise<void>;
	categories: InventoryCategory[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
	isOpen,
	onClose,
	onAdd,
	categories,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		code: "",
		name: "",
		category: "",
		unit: "",
		price: 0,
		costPrice: 0,
		stock: 0,
		minStock: 10,
		maxStock: 100,
		supplier: "",
		barcode: "",
		description: "",
		status: "active" as const,
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				code: "",
				name: "",
				category: "",
				unit: "",
				price: 0,
				costPrice: 0,
				stock: 0,
				minStock: 10,
				maxStock: 100,
				supplier: "",
				barcode: "",
				description: "",
				status: "active",
			});
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		// Validation
		if (!formData.name.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên hàng hóa",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!formData.category) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn danh mục",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!formData.unit.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập đơn vị tính",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (formData.price <= 0) {
			toast({
				title: "Lỗi",
				description: "Giá bán phải lớn hơn 0",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);

		try {
			await onAdd(formData);
			toast({
				title: "Thành công",
				description: "Thêm hàng hóa thành công",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi thêm hàng hóa",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
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
					Thêm hàng hóa mới
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack
						spacing={4}
						align="stretch">
						<HStack spacing={4}>
							<FormControl isRequired>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Mã hàng
								</FormLabel>
								<Input
									placeholder="VD: SN00000001"
									value={formData.code}
									onChange={(e) =>
										setFormData({
											...formData,
											code: e.target.value,
										})
									}
									fontSize="15px"
									h="48px"
								/>
							</FormControl>

							<FormControl isRequired>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Mã vạch
								</FormLabel>
								<Input
									placeholder="VD: 8934567890123"
									value={formData.barcode}
									onChange={(e) =>
										setFormData({
											...formData,
											barcode: e.target.value,
										})
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
								placeholder="Nhập tên hàng hóa"
								value={formData.name}
								onChange={(e) =>
									setFormData({
										...formData,
										name: e.target.value,
									})
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
									placeholder="Chọn danh mục"
									value={formData.category}
									onChange={(e) =>
										setFormData({
											...formData,
											category: e.target.value,
										})
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
									placeholder="VD: kg, gói, thùng"
									value={formData.unit}
									onChange={(e) =>
										setFormData({
											...formData,
											unit: e.target.value,
										})
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
									value={formData.costPrice}
									onChange={(_, value) =>
										setFormData({
											...formData,
											costPrice: value,
										})
									}>
									<NumberInputField
										placeholder="0"
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
									value={formData.price}
									onChange={(_, value) =>
										setFormData({
											...formData,
											price: value,
										})
									}>
									<NumberInputField
										placeholder="0"
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
									Tồn kho hiện tại
								</FormLabel>
								<NumberInput
									min={0}
									value={formData.stock}
									onChange={(_, value) =>
										setFormData({
											...formData,
											stock: value,
										})
									}>
									<NumberInputField
										placeholder="0"
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
									Tồn kho tối thiểu
								</FormLabel>
								<NumberInput
									min={0}
									value={formData.minStock}
									onChange={(_, value) =>
										setFormData({
											...formData,
											minStock: value,
										})
									}>
									<NumberInputField
										placeholder="10"
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
									value={formData.maxStock}
									onChange={(_, value) =>
										setFormData({
											...formData,
											maxStock: value,
										})
									}>
									<NumberInputField
										placeholder="100"
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
								placeholder="Nhập tên nhà cung cấp"
								value={formData.supplier}
								onChange={(e) =>
									setFormData({
										...formData,
										supplier: e.target.value,
									})
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
								Mô tả
							</FormLabel>
							<Textarea
								placeholder="Nhập mô tả sản phẩm"
								value={formData.description}
								onChange={(e) =>
									setFormData({
										...formData,
										description: e.target.value,
									})
								}
								fontSize="15px"
								rows={3}
							/>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter gap={3}>
					<Button
						variant="ghost"
						onClick={onClose}
						isDisabled={isLoading}>
						Hủy
					</Button>
					<Button
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						onClick={handleSubmit}
						isLoading={isLoading}
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
						}}>
						Thêm hàng hóa
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
