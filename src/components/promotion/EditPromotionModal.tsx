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
	Divider,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import type {
	Promotion,
	PromotionType,
	PromotionProduct,
} from "../../types/promotion";
// TODO: Import promotionService

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
	const [productSearchQuery, setProductSearchQuery] = useState("");
	const [_promotion, setPromotion] = useState<Promotion | null>(null);

	const [formData, setFormData] = useState<{
		code: string;
		name: string;
		description: string;
		type: PromotionType;
		discountPercentage: number;
		discountProducts: string[]; // Array of product IDs for discount
		purchaseGroups: { productId: string; quantity: number }[]; // For buyThisGetThat
		giftProducts: { productId: string; quantity: number }[];
		startDate: string;
		endDate: string;
		status: "active" | "inactive" | "expired";
	}>({
		code: "",
		name: "",
		description: "",
		type: "discount",
		discountPercentage: 0,
		discountProducts: [],
		purchaseGroups: [],
		giftProducts: [],
		startDate: "",
		endDate: "",
		status: "inactive",
	});

	useEffect(() => {
		if (isOpen && promotionId) {
			loadData();
		}
	}, [isOpen, promotionId]);

	const loadData = async () => {
		setIsFetching(true);
		try {
			// TODO: Fetch available products
			setProducts([]);

			// TODO: Fetch promotion data by ID
			// TODO: Convert promotion to form data based on type
			setFormData({
				code: "",
				name: "",
				description: "",
				type: "discount",
				discountPercentage: 0,
				discountProducts: [],
				purchaseGroups: [],
				giftProducts: [],
				startDate: "",
				endDate: "",
				status: "inactive",
			});
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

	// Discount products management
	const handleAddDiscountProduct = () => {
		setFormData({
			...formData,
			discountProducts: [...formData.discountProducts, ""],
		});
	};

	const handleRemoveDiscountProduct = (index: number) => {
		const newProducts = formData.discountProducts.filter(
			(_, i) => i !== index,
		);
		setFormData({ ...formData, discountProducts: newProducts });
	};

	const handleDiscountProductChange = (index: number, productId: string) => {
		const newProducts = [...formData.discountProducts];
		newProducts[index] = productId;
		setFormData({ ...formData, discountProducts: newProducts });
	};

	// Purchase groups management (for buyThisGetThat)
	const handleAddPurchaseGroup = () => {
		setFormData({
			...formData,
			purchaseGroups: [
				...formData.purchaseGroups,
				{ productId: "", quantity: 1 },
			],
		});
	};

	const handleRemovePurchaseGroup = (index: number) => {
		const newGroups = formData.purchaseGroups.filter((_, i) => i !== index);
		setFormData({ ...formData, purchaseGroups: newGroups });
	};

	const handlePurchaseGroupChange = (
		index: number,
		field: "productId" | "quantity",
		value: string | number,
	) => {
		const newGroups = [...formData.purchaseGroups];
		newGroups[index] = {
			...newGroups[index],
			[field]: value,
		};
		setFormData({ ...formData, purchaseGroups: newGroups });
	};

	// Gift products management
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

	// Filter products based on search query
	const filteredProducts = products.filter(
		(p) =>
			p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
			p.code.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
			p.category?.toLowerCase().includes(productSearchQuery.toLowerCase()),
	);

	const handleSubmit = async () => {
		if (!promotionId) return;

		// Validation
		if (!formData.name.trim()) {
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

		// Validate based on type
		if (formData.type === "discount") {
			if (
				formData.discountPercentage <= 0 ||
				formData.discountPercentage > 100
			) {
				toast({
					title: "Lỗi",
					description: "Phần trăm giảm giá phải từ 1% đến 100%",
					status: "error",
					duration: 3000,
				});
				return;
			}

			if (formData.discountProducts.length === 0) {
				toast({
					title: "Lỗi",
					description: "Vui lòng thêm ít nhất 1 sản phẩm áp dụng",
					status: "error",
					duration: 3000,
				});
				return;
			}

			for (const productId of formData.discountProducts) {
				if (!productId) {
					toast({
						title: "Lỗi",
						description: "Vui lòng chọn sản phẩm áp dụng",
						status: "error",
						duration: 3000,
					});
					return;
				}
			}
		}

		if (formData.type === "buyThisGetThat") {
			if (formData.purchaseGroups.length === 0) {
				toast({
					title: "Lỗi",
					description: "Vui lòng thêm ít nhất 1 sản phẩm cần mua",
					status: "error",
					duration: 3000,
				});
				return;
			}

			for (const group of formData.purchaseGroups) {
				if (!group.productId) {
					toast({
						title: "Lỗi",
						description: "Vui lòng chọn sản phẩm cần mua",
						status: "error",
						duration: 3000,
					});
					return;
				}
				if (group.quantity <= 0) {
					toast({
						title: "Lỗi",
						description: "Số lượng phải lớn hơn 0",
						status: "error",
						duration: 3000,
					});
					return;
				}
			}

			if (formData.giftProducts.length === 0) {
				toast({
					title: "Lỗi",
					description: "Vui lòng thêm ít nhất 1 sản phẩm tặng",
					status: "error",
					duration: 3000,
				});
				return;
			}

			for (const gift of formData.giftProducts) {
				if (!gift.productId) {
					toast({
						title: "Lỗi",
						description: "Vui lòng chọn sản phẩm tặng",
						status: "error",
						duration: 3000,
					});
					return;
				}
				if (gift.quantity <= 0) {
					toast({
						title: "Lỗi",
						description: "Số lượng tặng phải lớn hơn 0",
						status: "error",
						duration: 3000,
					});
					return;
				}
			}
		}

		setIsLoading(true);

		try {
			const updates: Partial<Promotion> = {
				code: formData.code,
				name: formData.name,
				description: formData.description,
				type: formData.type,
				startDate: new Date(formData.startDate),
				endDate: new Date(formData.endDate),
				status: formData.status,
			};

			// Add type-specific config
			if (formData.type === "discount") {
				const discountProductsList = formData.discountProducts
					.map((id) => products.find((p) => p.id === id))
					.filter((p): p is PromotionProduct => p !== undefined);

				updates.discountConfig = {
					percentage: formData.discountPercentage,
					products: discountProductsList,
				};
			} else if (formData.type === "buyThisGetThat") {
				const purchaseGroupsList = formData.purchaseGroups.map(
					(group) => {
						const product = products.find(
							(p) => p.id === group.productId,
						);
						if (!product) {
							throw new Error("Purchase product not found");
						}
						return {
							product,
							quantity: group.quantity,
						};
					},
				);

				const giftProductsList = formData.giftProducts.map((gift) => {
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
				});

				updates.buyThisGetThatConfig = {
					purchaseGroups: purchaseGroupsList,
					giftProducts: giftProductsList,
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
						{/* Mã khuyến mãi và Trạng thái */}
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
						</HStack>

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

						{/* Discount Configuration */}
						{formData.type === "discount" && (
							<>
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
											Sản phẩm áp dụng
										</FormLabel>
										<Button
											leftIcon={<AddIcon />}
											size="sm"
											colorScheme="brand"
											onClick={handleAddDiscountProduct}>
											Thêm sản phẩm
										</Button>
									</Flex>

									{formData.discountProducts.length === 0 && (
										<Box
											p={4}
											bg="gray.50"
											borderRadius="8px"
											textAlign="center">
											<Text
												fontSize="14px"
												color="gray.500">
												Chưa có sản phẩm nào
											</Text>
										</Box>
									)}

									<VStack
										spacing={3}
										align="stretch">
										{formData.discountProducts.map(
											(productId, index) => (
												<Box
													key={index}
													p={3}
													bg="gray.50"
													borderRadius="8px">
													<VStack
														spacing={2}
														align="stretch">
														<FormControl>
															<Flex
																justify="space-between"
																align="center"
																mb={1}>
																<FormLabel
																	fontSize="13px"
																	fontWeight="600"
																	color="gray.700"
																	mb={0}>
																	Tìm kiếm sản phẩm{" "}
																	{index + 1}
																</FormLabel>
																{productSearchQuery && (
																	<Text
																		fontSize="12px"
																		color="brand.500"
																		fontWeight="600">
																		{
																			filteredProducts.length
																		}{" "}
																		kết quả
																	</Text>
																)}
															</Flex>
															<Input
																placeholder="Gõ để tìm sản phẩm..."
																value={
																	productSearchQuery
																}
																onChange={(e) =>
																	setProductSearchQuery(
																		e.target
																			.value,
																	)
																}
																fontSize="14px"
																h="40px"
																bg="white"
																_focus={{
																	borderColor:
																		"brand.400",
																	boxShadow:
																		"0 0 0 1px var(--chakra-colors-brand-400)",
																}}
															/>
														</FormControl>

														<Flex
															gap={2}
															align="flex-end">
															<FormControl flex={1}>
																<FormLabel
																	fontSize="13px"
																	fontWeight="600"
																	color="gray.700">
																	Chọn sản phẩm (
																	{
																		filteredProducts.length
																	}{" "}
																	SP)
																</FormLabel>
																<Select
																	placeholder="Chọn sản phẩm từ danh sách"
																	value={
																		productId
																	}
																	onChange={(
																		e,
																	) =>
																		handleDiscountProductChange(
																			index,
																			e
																				.target
																				.value,
																		)
																	}
																	fontSize="14px"
																	h="44px">
																	{filteredProducts.map(
																		(
																			product,
																		) => (
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
																				{product.category &&
																					` (${product.category})`}
																			</option>
																		),
																	)}
																</Select>
																{filteredProducts.length ===
																	0 &&
																	productSearchQuery && (
																		<Text
																			fontSize="12px"
																			color="red.500"
																			mt={1}>
																			Không tìm thấy
																			sản phẩm
																		</Text>
																	)}
															</FormControl>

															<IconButton
																aria-label="Xóa sản phẩm"
																icon={
																	<DeleteIcon />
																}
																colorScheme="red"
																variant="ghost"
																size="md"
																h="44px"
																onClick={() =>
																	handleRemoveDiscountProduct(
																		index,
																	)
																}
															/>
														</Flex>
													</VStack>
												</Box>
											),
										)}
									</VStack>
								</Box>
							</>
						)}

						{/* BuyThisGetThat Configuration */}
						{formData.type === "buyThisGetThat" && (
							<>
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
											Sản phẩm cần mua
										</FormLabel>
										<Button
											leftIcon={<AddIcon />}
											size="sm"
											colorScheme="brand"
											onClick={handleAddPurchaseGroup}>
											Thêm sản phẩm
										</Button>
									</Flex>

									{formData.purchaseGroups.length === 0 && (
										<Box
											p={4}
											bg="gray.50"
											borderRadius="8px"
											textAlign="center">
											<Text
												fontSize="14px"
												color="gray.500">
												Chưa có sản phẩm cần mua nào
											</Text>
										</Box>
									)}

									<VStack
										spacing={3}
										align="stretch">
										{formData.purchaseGroups.map(
											(group, index) => (
												<Box
													key={index}
													p={3}
													bg="gray.50"
													borderRadius="8px">
													<VStack
														spacing={2}
														align="stretch">
														<FormControl>
															<Flex
																justify="space-between"
																align="center"
																mb={1}>
																<FormLabel
																	fontSize="13px"
																	fontWeight="600"
																	color="gray.700"
																	mb={0}>
																	Tìm kiếm sản phẩm{" "}
																	{index + 1}
																</FormLabel>
																{productSearchQuery && (
																	<Text
																		fontSize="12px"
																		color="brand.500"
																		fontWeight="600">
																		{
																			filteredProducts.length
																		}{" "}
																		kết quả
																	</Text>
																)}
															</Flex>
															<Input
																placeholder="Gõ để tìm sản phẩm..."
																value={
																	productSearchQuery
																}
																onChange={(e) =>
																	setProductSearchQuery(
																		e.target
																			.value,
																	)
																}
																fontSize="14px"
																h="40px"
																bg="white"
																_focus={{
																	borderColor:
																		"brand.400",
																	boxShadow:
																		"0 0 0 1px var(--chakra-colors-brand-400)",
																}}
															/>
														</FormControl>

														<Flex
															gap={2}
															align="flex-end">
															<FormControl flex={2}>
																<FormLabel
																	fontSize="13px"
																	fontWeight="600"
																	color="gray.700">
																	Chọn sản phẩm (
																	{
																		filteredProducts.length
																	}{" "}
																	SP)
																</FormLabel>
																<Select
																	placeholder="Chọn sản phẩm từ danh sách"
																	value={
																		group.productId
																	}
																	onChange={(
																		e,
																	) =>
																		handlePurchaseGroupChange(
																			index,
																			"productId",
																			e
																				.target
																				.value,
																		)
																	}
																	fontSize="14px"
																	h="44px">
																	{filteredProducts.map(
																		(
																			product,
																		) => (
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
																				{product.category &&
																					` (${product.category})`}
																			</option>
																		),
																	)}
																</Select>
																{filteredProducts.length ===
																	0 &&
																	productSearchQuery && (
																		<Text
																			fontSize="12px"
																			color="red.500"
																			mt={1}>
																			Không tìm thấy
																			sản phẩm
																		</Text>
																	)}
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
																		group.quantity
																	}
																	onChange={(
																		_,
																		value,
																	) =>
																		handlePurchaseGroupChange(
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
																icon={
																	<DeleteIcon />
																}
																colorScheme="red"
																variant="ghost"
																size="md"
																h="44px"
																onClick={() =>
																	handleRemovePurchaseGroup(
																		index,
																	)
																}
															/>
														</Flex>
													</VStack>
												</Box>
											),
										)}
									</VStack>
								</Box>

								<Divider />

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
											colorScheme="green"
											onClick={handleAddGiftProduct}>
											Thêm sản phẩm
										</Button>
									</Flex>

									{formData.giftProducts.length === 0 && (
										<Box
											p={4}
											bg="gray.50"
											borderRadius="8px"
											textAlign="center">
											<Text
												fontSize="14px"
												color="gray.500">
												Chưa có sản phẩm tặng nào
											</Text>
										</Box>
									)}

									<VStack
										spacing={3}
										align="stretch">
										{formData.giftProducts.map(
											(gift, index) => (
												<Box
													key={index}
													p={3}
													bg="green.50"
													borderRadius="8px">
													<VStack
														spacing={2}
														align="stretch">
														<FormControl>
															<Flex
																justify="space-between"
																align="center"
																mb={1}>
																<FormLabel
																	fontSize="13px"
																	fontWeight="600"
																	color="gray.700"
																	mb={0}>
																	Tìm kiếm sản phẩm{" "}
																	{index + 1}
																</FormLabel>
																{productSearchQuery && (
																	<Text
																		fontSize="12px"
																		color="brand.500"
																		fontWeight="600">
																		{
																			filteredProducts.length
																		}{" "}
																		kết quả
																	</Text>
																)}
															</Flex>
															<Input
																placeholder="Gõ để tìm sản phẩm..."
																value={
																	productSearchQuery
																}
																onChange={(e) =>
																	setProductSearchQuery(
																		e.target
																			.value,
																	)
																}
																fontSize="14px"
																h="40px"
																bg="white"
																_focus={{
																	borderColor:
																		"brand.400",
																	boxShadow:
																		"0 0 0 1px var(--chakra-colors-brand-400)",
																}}
															/>
														</FormControl>

														<Flex
															gap={2}
															align="flex-end">
															<FormControl flex={2}>
																<FormLabel
																	fontSize="13px"
																	fontWeight="600"
																	color="gray.700">
																	Chọn sản phẩm (
																	{
																		filteredProducts.length
																	}{" "}
																	SP)
																</FormLabel>
																<Select
																	placeholder="Chọn sản phẩm từ danh sách"
																	value={
																		gift.productId
																	}
																	onChange={(
																		e,
																	) =>
																		handleGiftProductChange(
																			index,
																			"productId",
																			e
																				.target
																				.value,
																		)
																	}
																	fontSize="14px"
																	h="44px">
																	{filteredProducts.map(
																		(
																			product,
																		) => (
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
																				{product.category &&
																					` (${product.category})`}
																			</option>
																		),
																	)}
																</Select>
																{filteredProducts.length ===
																	0 &&
																	productSearchQuery && (
																		<Text
																			fontSize="12px"
																			color="red.500"
																			mt={1}>
																			Không tìm thấy
																			sản phẩm
																		</Text>
																	)}
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
																icon={
																	<DeleteIcon />
																}
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
													</VStack>
												</Box>
											),
										)}
									</VStack>
								</Box>
							</>
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
