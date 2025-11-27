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
	IconButton,
	Flex,
	Spinner,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import type {
	Promotion,
	PromotionType,
	PromotionProduct,
} from "../../types/promotion";
import { promotionService } from "../../services/promotionService";

interface EditPromotionModalProps {
	isOpen: boolean;
	onClose: () => void;
	promotionId: string | null;
	onUpdate: (id: string, updates: Partial<Promotion>) => Promise<void>;
}

export const EditPromotionModal: React.FC<EditPromotionModalProps> = ({
	isOpen,
	onClose,
	promotionId,
	onUpdate,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const [products, setProducts] = useState<PromotionProduct[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [_promotion, setPromotion] = useState<Promotion | null>(null);

	const [formData, setFormData] = useState<{
		code: string;
		name: string;
		description: string;
		type: PromotionType;
		productId: string;
		discountPercentage: number;
		buy1GetNQuantity: number;
		giftProducts: { productId: string; quantity: number }[];
		startDate: string;
		endDate: string;
		status: "active" | "inactive" | "expired";
	}>({
		code: "",
		name: "",
		description: "",
		type: "discount",
		productId: "",
		discountPercentage: 0,
		buy1GetNQuantity: 1,
		giftProducts: [],
		startDate: "",
		endDate: "",
		status: "active",
	});

	useEffect(() => {
		if (isOpen && promotionId) {
			loadData();
		}
	}, [isOpen, promotionId]);

	const loadData = async () => {
		setIsFetching(true);
		try {
			const [productsData, promotionData] = await Promise.all([
				promotionService.getAvailableProducts(),
				promotionService.getPromotionById(promotionId!),
			]);

			setProducts(productsData);

			if (promotionData) {
				setPromotion(promotionData);

				// Convert promotion to form data
				const giftProducts =
					promotionData.type === "buyThisGetThat" &&
					promotionData.buyThisGetThatConfig
						? promotionData.buyThisGetThatConfig.giftProducts.map(
								(g) => ({
									productId: g.product.id,
									quantity: g.quantity,
								}),
						  )
						: [];

				setFormData({
					code: promotionData.code,
					name: promotionData.name,
					description: promotionData.description || "",
					type: promotionData.type,
					productId: promotionData.product.id,
					discountPercentage:
						promotionData.discountConfig?.percentage || 0,
					buy1GetNQuantity:
						promotionData.buy1GetNConfig?.quantityReceived || 1,
					giftProducts,
					startDate: new Date(promotionData.startDate)
						.toISOString()
						.slice(0, 16),
					endDate: new Date(promotionData.endDate)
						.toISOString()
						.slice(0, 16),
					status: promotionData.status,
				});
			}
		} catch (error) {
			console.error("Error loading data:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải dữ liệu",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsFetching(false);
		}
	};

	const handleAddGiftProduct = () => {
		setFormData({
			...formData,
			giftProducts: [
				...formData.giftProducts,
				{ productId: "", quantity: 1 },
			],
		});
	};

	const handleRemoveGiftProduct = (index: number) => {
		const newGiftProducts = formData.giftProducts.filter(
			(_, i) => i !== index,
		);
		setFormData({ ...formData, giftProducts: newGiftProducts });
	};

	const handleGiftProductChange = (
		index: number,
		field: "productId" | "quantity",
		value: string | number,
	) => {
		const newGiftProducts = [...formData.giftProducts];
		newGiftProducts[index] = {
			...newGiftProducts[index],
			[field]: value,
		};
		setFormData({ ...formData, giftProducts: newGiftProducts });
	};

	const handleSubmit = async () => {
		if (!promotionId) return;

		// Validation (same as AddPromotionModal)
		if (!formData.name.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên chương trình khuyến mãi",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!formData.productId) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn sản phẩm áp dụng",
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

		setIsLoading(true);

		try {
			const selectedProduct = products.find(
				(p) => p.id === formData.productId,
			);
			if (!selectedProduct) {
				throw new Error("Product not found");
			}

			const updates: Partial<Promotion> = {
				code: formData.code,
				name: formData.name,
				description: formData.description,
				type: formData.type,
				product: selectedProduct,
				startDate: new Date(formData.startDate),
				endDate: new Date(formData.endDate),
				status: formData.status,
			}; // Add type-specific config
			if (formData.type === "discount") {
				updates.discountConfig = {
					percentage: formData.discountPercentage,
				};
			} else if (formData.type === "buy1getN") {
				updates.buy1GetNConfig = {
					quantityReceived: formData.buy1GetNQuantity,
				};
			} else if (formData.type === "buyThisGetThat") {
				updates.buyThisGetThatConfig = {
					giftProducts: formData.giftProducts.map((gift) => {
						const giftProduct = products.find(
							(p) => p.id === gift.productId,
						);
						if (!giftProduct) {
							throw new Error("Gift product not found");
						}
						return {
							product: giftProduct,
							quantity: gift.quantity,
						};
					}),
				};
			}

			await onUpdate(promotionId, updates);
			toast({
				title: "Thành công",
				description: "Cập nhật khuyến mãi thành công",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật khuyến mãi",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const filteredProducts = products.filter(
		(p) =>
			p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			p.code.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	if (isFetching) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="2xl">
				<ModalOverlay bg="blackAlpha.600" />
				<ModalContent>
					<ModalBody
						py={12}
						display="flex"
						justifyContent="center">
						<Spinner
							size="xl"
							color="brand.500"
						/>
					</ModalBody>
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent maxH="90vh">
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600">
					Chỉnh sửa khuyến mãi
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack
						spacing={4}
						align="stretch">
						{/* Mã và trạng thái */}
						<HStack spacing={4}>
							<FormControl>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Mã khuyến mãi
								</FormLabel>
								<Input
									value={formData.code}
									isReadOnly
									bg="gray.50"
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
									value={formData.status}
									onChange={(e) =>
										setFormData({
											...formData,
											status: e.target.value as
												| "active"
												| "inactive"
												| "expired",
										})
									}
									fontSize="15px"
									h="48px">
									<option value="active">Đang áp dụng</option>
									<option value="inactive">
										Chưa áp dụng
									</option>
									<option value="expired">Đã hết hạn</option>
								</Select>
							</FormControl>
						</HStack>{" "}
						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Tên chương trình
							</FormLabel>
							<Input
								placeholder="VD: Giảm giá 20% Coca Cola"
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
						<FormControl>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Mô tả
							</FormLabel>
							<Textarea
								placeholder="Mô tả chi tiết về chương trình khuyến mãi"
								value={formData.description}
								onChange={(e) =>
									setFormData({
										...formData,
										description: e.target.value,
									})
								}
								fontSize="15px"
								rows={2}
							/>
						</FormControl>
						{/* Loại khuyến mãi - Disabled */}
						<FormControl>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Loại khuyến mãi
							</FormLabel>
							<Select
								value={formData.type}
								isDisabled
								fontSize="15px"
								h="48px"
								bg="gray.50">
								<option value="discount">Giảm giá (%)</option>
								<option value="buy1getN">Mua 1 tặng N</option>
								<option value="buyThisGetThat">
									Mua này tặng kia
								</option>
							</Select>
							<Text
								fontSize="12px"
								color="gray.500"
								mt={1}>
								Không thể thay đổi loại khuyến mãi
							</Text>
						</FormControl>
						{/* Sản phẩm áp dụng */}
						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Sản phẩm áp dụng
							</FormLabel>
							<Input
								placeholder="Tìm kiếm sản phẩm..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								fontSize="15px"
								h="48px"
								mb={2}
							/>
							<Select
								placeholder="Chọn sản phẩm"
								value={formData.productId}
								onChange={(e) =>
									setFormData({
										...formData,
										productId: e.target.value,
									})
								}
								fontSize="15px"
								h="48px">
								{filteredProducts.map((product) => (
									<option
										key={product.id}
										value={product.id}>
										{product.code} - {product.name}
									</option>
								))}
							</Select>
						</FormControl>
						{/* Configuration based on type */}
						{formData.type === "discount" && (
							<FormControl isRequired>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Phần trăm giảm giá (%)
								</FormLabel>
								<NumberInput
									min={1}
									max={100}
									value={formData.discountPercentage}
									onChange={(_, value) =>
										setFormData({
											...formData,
											discountPercentage: value,
										})
									}>
									<NumberInputField
										placeholder="VD: 20"
										fontSize="15px"
										h="48px"
									/>
									<NumberInputStepper>
										<NumberIncrementStepper />
										<NumberDecrementStepper />
									</NumberInputStepper>
								</NumberInput>
							</FormControl>
						)}
						{formData.type === "buy1getN" && (
							<FormControl isRequired>
								<FormLabel
									fontSize="15px"
									fontWeight="600"
									color="gray.700">
									Số lượng tặng (N)
								</FormLabel>
								<NumberInput
									min={1}
									value={formData.buy1GetNQuantity}
									onChange={(_, value) =>
										setFormData({
											...formData,
											buy1GetNQuantity: value,
										})
									}>
									<NumberInputField
										placeholder="VD: 2 (mua 1 tặng 2)"
										fontSize="15px"
										h="48px"
									/>
									<NumberInputStepper>
										<NumberIncrementStepper />
										<NumberDecrementStepper />
									</NumberInputStepper>
								</NumberInput>
							</FormControl>
						)}
						{formData.type === "buyThisGetThat" && (
							<Box>
								<Flex
									justify="space-between"
									align="center"
									mb={2}>
									<FormLabel
										fontSize="15px"
										fontWeight="600"
										color="gray.700"
										mb={0}>
										Sản phẩm tặng
									</FormLabel>
									<Button
										leftIcon={<AddIcon />}
										size="sm"
										colorScheme="brand"
										onClick={handleAddGiftProduct}>
										Thêm sản phẩm
									</Button>
								</Flex>

								<VStack
									spacing={3}
									align="stretch">
									{formData.giftProducts.map(
										(gift, index) => (
											<Box
												key={index}
												p={3}
												bg="gray.50"
												borderRadius="8px">
												<Flex
													gap={2}
													align="flex-end">
													<FormControl flex={2}>
														<FormLabel
															fontSize="13px"
															fontWeight="600"
															color="gray.700">
															Sản phẩm {index + 1}
														</FormLabel>
														<Select
															placeholder="Chọn sản phẩm"
															value={
																gift.productId
															}
															onChange={(e) =>
																handleGiftProductChange(
																	index,
																	"productId",
																	e.target
																		.value,
																)
															}
															fontSize="14px"
															h="44px">
															{products.map(
																(product) => (
																	<option
																		key={
																			product.id
																		}
																		value={
																			product.id
																		}>
																		{
																			product.code
																		}{" "}
																		-{" "}
																		{
																			product.name
																		}
																	</option>
																),
															)}
														</Select>
													</FormControl>

													<FormControl flex={1}>
														<FormLabel
															fontSize="13px"
															fontWeight="600"
															color="gray.700">
															Số lượng
														</FormLabel>
														<NumberInput
															min={1}
															value={
																gift.quantity
															}
															onChange={(
																_,
																value,
															) =>
																handleGiftProductChange(
																	index,
																	"quantity",
																	value,
																)
															}>
															<NumberInputField
																fontSize="14px"
																h="44px"
															/>
															<NumberInputStepper>
																<NumberIncrementStepper />
																<NumberDecrementStepper />
															</NumberInputStepper>
														</NumberInput>
													</FormControl>

													<IconButton
														aria-label="Xóa sản phẩm"
														icon={<DeleteIcon />}
														colorScheme="red"
														variant="ghost"
														size="md"
														h="44px"
														onClick={() =>
															handleRemoveGiftProduct(
																index,
															)
														}
													/>
												</Flex>
											</Box>
										),
									)}
								</VStack>
							</Box>
						)}
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
									type="datetime-local"
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
									type="datetime-local"
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
						Cập nhật
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
