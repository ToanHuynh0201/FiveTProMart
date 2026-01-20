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
	Box,
	Text,
	Divider,
} from "@chakra-ui/react";
import type {
	PromotionType,
	CreatePromotionRequest,
} from "../../types/promotion";
import { ProductSelector } from "../supplier/ProductSelector";

interface SelectedProduct {
	productId: string;
	productName: string;
}

interface AddPromotionModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (promotion: CreatePromotionRequest) => Promise<void>;
}

// HTML date input already returns yyyy-MM-dd format which is what backend expects

export const AddPromotionModal: React.FC<AddPromotionModalProps> = ({
	isOpen,
	onClose,
	onAdd,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState<{
		promotionName: string;
		promotionDescription: string;
		promotionType: PromotionType;
		discountPercent: number;
		buyQuantity: number;
		getQuantity: number;
		products: SelectedProduct[];
		startDate: string;
		endDate: string;
	}>({
		promotionName: "",
		promotionDescription: "",
		promotionType: "Discount",
		discountPercent: 10,
		buyQuantity: 1,
		getQuantity: 1,
		products: [],
		startDate: "",
		endDate: "",
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			resetForm();
		}
	}, [isOpen]);

	const resetForm = () => {
		setFormData({
			promotionName: "",
			promotionDescription: "",
			promotionType: "Discount",
			discountPercent: 10,
			buyQuantity: 1,
			getQuantity: 1,
			products: [],
			startDate: "",
			endDate: "",
		});
	};

	const handleProductsChange = (products: SelectedProduct[]) => {
		setFormData((prev) => ({ ...prev, products }));
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.promotionName.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên chương trình khuyến mãi",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!formData.startDate || !formData.endDate) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn thời gian áp dụng",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (new Date(formData.startDate) >= new Date(formData.endDate)) {
			toast({
				title: "Lỗi",
				description: "Ngày kết thúc phải sau ngày bắt đầu",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (formData.products.length === 0) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn ít nhất 1 sản phẩm áp dụng",
				status: "error",
				duration: 3000,
			});
			return;
		}

		// Validate based on type
		if (formData.promotionType === "Discount") {
			if (formData.discountPercent < 1 || formData.discountPercent > 100) {
				toast({
					title: "Lỗi",
					description: "Phần trăm giảm giá phải từ 1% đến 100%",
					status: "error",
					duration: 3000,
				});
				return;
			}
		}

		if (formData.promotionType === "Buy X Get Y") {
			if (formData.buyQuantity < 1) {
				toast({
					title: "Lỗi",
					description: "Số lượng mua phải lớn hơn 0",
					status: "error",
					duration: 3000,
				});
				return;
			}
			if (formData.getQuantity < 1) {
				toast({
					title: "Lỗi",
					description: "Số lượng tặng phải lớn hơn 0",
					status: "error",
					duration: 3000,
				});
				return;
			}
		}

		setIsLoading(true);

		try {
			const productIds = formData.products.map((p) => p.productId);

			let requestData: CreatePromotionRequest;

			if (formData.promotionType === "Discount") {
				requestData = {
					promotionName: formData.promotionName,
					promotionDescription: formData.promotionDescription || undefined,
					products: productIds,
					promotionType: "Discount",
					discountPercent: formData.discountPercent,
					startDate: formData.startDate, // yyyy-MM-dd format from HTML input
					endDate: formData.endDate, // yyyy-MM-dd format from HTML input
				};
			} else {
				requestData = {
					promotionName: formData.promotionName,
					promotionDescription: formData.promotionDescription || undefined,
					products: productIds,
					promotionType: "Buy X Get Y",
					buyQuantity: formData.buyQuantity,
					getQuantity: formData.getQuantity,
					startDate: formData.startDate, // yyyy-MM-dd format from HTML input
					endDate: formData.endDate, // yyyy-MM-dd format from HTML input
				};
			}

			await onAdd(requestData);
		} catch (error) {
			console.error("Error creating promotion:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi thêm khuyến mãi",
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
			<ModalContent maxH="90vh">
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600">
					Thêm khuyến mãi mới
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack
						spacing={4}
						align="stretch">
						{/* Tên chương trình */}
						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Tên chương trình
							</FormLabel>
							<Input
								placeholder="VD: Giảm giá 20% các sản phẩm nước uống"
								value={formData.promotionName}
								onChange={(e) =>
									setFormData({
										...formData,
										promotionName: e.target.value,
									})
								}
								fontSize="15px"
								h="48px"
							/>
						</FormControl>

						{/* Mô tả */}
						<FormControl>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Mô tả
							</FormLabel>
							<Textarea
								placeholder="Mô tả chi tiết về chương trình khuyến mãi"
								value={formData.promotionDescription}
								onChange={(e) =>
									setFormData({
										...formData,
										promotionDescription: e.target.value,
									})
								}
								fontSize="15px"
								rows={2}
							/>
						</FormControl>

						{/* Loại khuyến mãi */}
						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Loại khuyến mãi
							</FormLabel>
							<Select
								value={formData.promotionType}
								onChange={(e) =>
									setFormData({
										...formData,
										promotionType: e.target.value as PromotionType,
										products: [], // Reset products when type changes
									})
								}
								fontSize="15px"
								h="48px">
								<option value="Discount">Giảm giá (%)</option>
								<option value="Buy X Get Y">Mua X tặng Y</option>
							</Select>
						</FormControl>

						<Divider />

						{/* Discount Configuration */}
						{formData.promotionType === "Discount" && (
							<Box
								p={4}
								bg="blue.50"
								borderRadius="8px"
								borderWidth="1px"
								borderColor="blue.200">
								<Text
									fontSize="14px"
									fontWeight="700"
									color="blue.700"
									mb={3}>
									Cấu hình giảm giá
								</Text>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Phần trăm giảm giá (%)
									</FormLabel>
									<NumberInput
										min={1}
										max={100}
										value={formData.discountPercent}
										onChange={(_, value) =>
											setFormData({
												...formData,
												discountPercent: value || 0,
											})
										}>
										<NumberInputField
											placeholder="VD: 20"
											fontSize="15px"
											h="48px"
											bg="white"
										/>
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</FormControl>
							</Box>
						)}

						{/* Buy X Get Y Configuration */}
						{formData.promotionType === "Buy X Get Y" && (
							<Box
								p={4}
								bg="purple.50"
								borderRadius="8px"
								borderWidth="1px"
								borderColor="purple.200">
								<Text
									fontSize="14px"
									fontWeight="700"
									color="purple.700"
									mb={3}>
									Cấu hình Mua X tặng Y
								</Text>
								<HStack spacing={4}>
									<FormControl isRequired>
										<FormLabel
											fontSize="14px"
											fontWeight="600"
											color="gray.700">
											Số lượng mua (X)
										</FormLabel>
										<NumberInput
											min={1}
											value={formData.buyQuantity}
											onChange={(_, value) =>
												setFormData({
													...formData,
													buyQuantity: value || 1,
												})
											}>
											<NumberInputField
												placeholder="VD: 2"
												fontSize="15px"
												h="48px"
												bg="white"
											/>
											<NumberInputStepper>
												<NumberIncrementStepper />
												<NumberDecrementStepper />
											</NumberInputStepper>
										</NumberInput>
									</FormControl>

									<FormControl isRequired>
										<FormLabel
											fontSize="14px"
											fontWeight="600"
											color="gray.700">
											Số lượng tặng (Y)
										</FormLabel>
										<NumberInput
											min={1}
											value={formData.getQuantity}
											onChange={(_, value) =>
												setFormData({
													...formData,
													getQuantity: value || 1,
												})
											}>
											<NumberInputField
												placeholder="VD: 1"
												fontSize="15px"
												h="48px"
												bg="white"
											/>
											<NumberInputStepper>
												<NumberIncrementStepper />
												<NumberDecrementStepper />
											</NumberInputStepper>
										</NumberInput>
									</FormControl>
								</HStack>
							</Box>
						)}

						<Divider />

						{/* Sản phẩm áp dụng */}
						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Sản phẩm áp dụng
							</FormLabel>
							<ProductSelector
								selectedProducts={formData.products}
								onProductsChange={handleProductsChange}
							/>
						</FormControl>

						<Divider />

						{/* Thời gian */}
						<HStack spacing={4}>
							<FormControl isRequired>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Ngày bắt đầu
								</FormLabel>
								<Input
									type="date"
									value={formData.startDate}
									onChange={(e) =>
										setFormData({
											...formData,
											startDate: e.target.value,
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
									Ngày kết thúc
								</FormLabel>
								<Input
									type="date"
									value={formData.endDate}
									onChange={(e) =>
										setFormData({
											...formData,
											endDate: e.target.value,
										})
									}
									fontSize="15px"
									h="48px"
								/>
							</FormControl>
						</HStack>
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
						Thêm khuyến mãi
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
