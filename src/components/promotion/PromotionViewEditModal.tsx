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
	FormControl,
	FormLabel,
	Input,
	Select,
	VStack,
	HStack,
	Textarea,
	useToast,
	Text,
	Grid,
	GridItem,
	Spinner,
	Center,
	Flex,
	Badge,
	Icon,
	Box,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	useDisclosure,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Tag,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
} from "@chakra-ui/react";
import type {
	PromotionDetail,
	PromotionType,
	PromotionStatus,
	BuyXGetYProductPair,
} from "@/types/promotion";
import { promotionService } from "@/services/promotionService";
import {
	FiCalendar,
	FiPercent,
	FiGift,
	FiEdit2,
	FiXCircle,
	FiTag,
} from "react-icons/fi";
import { ProductSelector } from "../supplier/ProductSelector";
import { BuyXGetYProductPairSelector } from "./BuyXGetYProductPairSelector";

interface SelectedProduct {
	productId: string;
	productName: string;
}

interface PromotionViewEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	promotionId: string | null;
	mode: "view" | "edit";
	onSuccess?: () => void;
}

// Helper to parse dd-MM-yyyy to yyyy-MM-dd for input[type=date]
const parseDDMMYYYYToInput = (dateStr: string): string => {
	if (!dateStr) return "";
	const parts = dateStr.split("-");
	if (parts.length !== 3) return "";
	return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Helper to format currency
const formatCurrency = (value: number) => {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(value);
};

export const PromotionViewEditModal: React.FC<PromotionViewEditModalProps> = ({
	isOpen,
	onClose,
	promotionId,
	mode: initialMode,
	onSuccess,
}) => {
	const toast = useToast();
	const [mode, setMode] = useState<"view" | "edit">(initialMode);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [isCancelling, setIsCancelling] = useState(false);
	const [promotionData, setPromotionData] = useState<PromotionDetail | null>(
		null,
	);

	// Cancel confirmation dialog
	const {
		isOpen: isCancelDialogOpen,
		onOpen: onCancelDialogOpen,
		onClose: onCancelDialogClose,
	} = useDisclosure();
	const cancelRef = useRef<HTMLButtonElement>(null);

	// Form data for edit mode
	const [formData, setFormData] = useState({
		promotionName: "",
		promotionDescription: "",
		promotionType: "Discount" as PromotionType,
		discountPercent: 10,
		buyQuantity: 1,
		getQuantity: 1,
		startDate: "",
		endDate: "",
	});

	// Selected products for edit mode
	const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
		[],
	);

	// Product pairs for Buy X Get Y promotions
	const [productPairs, setProductPairs] = useState<BuyXGetYProductPair[]>([]);

	const handleProductsChange = (newProducts: SelectedProduct[]) => {
		setSelectedProducts(newProducts);
	};

	const handleProductPairsChange = (newPairs: BuyXGetYProductPair[]) => {
		setProductPairs(newPairs);
	};

	// Load promotion data when modal opens
	useEffect(() => {
		if (isOpen && promotionId) {
			loadPromotionData();
		}
		// Reset mode to initial mode when modal opens
		setMode(initialMode);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, promotionId, initialMode]);

	const loadPromotionData = async () => {
		if (!promotionId) return;

		setIsFetching(true);
		try {
			const result = await promotionService.getPromotionById(promotionId);
			console.log(result);

			if (result.success && result.data) {
				setPromotionData(result.data);
				// Populate form data for edit mode
				setFormData({
					promotionName: result.data.promotionName,
					promotionDescription:
						result.data.promotionDescription || "",
					promotionType: result.data.promotionType,
					discountPercent: result.data.discountPercent || 10,
					buyQuantity: result.data.buyQuantity || 1,
					getQuantity: result.data.getQuantity || 1,
					startDate: result.data.startDate,
					endDate: result.data.endDate,
				});

				// Map products based on promotion type
				if (result.data.promotionType === "Discount") {
					const existingProducts: SelectedProduct[] =
						result.data.products.map((p: any) => ({
							productId: p.productId,
							productName: p.productName,
						}));
					setSelectedProducts(existingProducts);
				} else {
					// For Buy X Get Y, map to product pairs
					const existingPairs: BuyXGetYProductPair[] =
						result.data.products.map((p: any) => ({
							productBuy: p.productBuy,
							productBuyName: p.productBuyName,
							productGet: p.productGet,
							productGetName: p.productGetName,
						}));
					setProductPairs(existingPairs);
				}
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải thông tin khuyến mãi",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error loading promotion:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tải thông tin khuyến mãi",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsFetching(false);
		}
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

		// Validate products/product pairs based on type
		if (formData.promotionType === "Discount") {
			if (selectedProducts.length === 0) {
				toast({
					title: "Lỗi",
					description: "Vui lòng chọn ít nhất 1 sản phẩm áp dụng",
					status: "error",
					duration: 3000,
				});
				return;
			}
		} else {
			if (productPairs.length === 0) {
				toast({
					title: "Lỗi",
					description: "Vui lòng chọn ít nhất 1 cặp sản phẩm áp dụng",
					status: "error",
					duration: 3000,
				});
				return;
			}
		}

		// Validate based on type
		if (formData.promotionType === "Discount") {
			if (
				formData.discountPercent < 1 ||
				formData.discountPercent > 100
			) {
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
			if (formData.buyQuantity < 1 || formData.getQuantity < 1) {
				toast({
					title: "Lỗi",
					description: "Số lượng mua và tặng phải lớn hơn 0",
					status: "error",
					duration: 3000,
				});
				return;
			}
		}

		if (!promotionId) return;

		setIsLoading(true);

		try {
			let requestData;

			if (formData.promotionType === "Discount") {
				const productIds = selectedProducts.map((p) => p.productId);
				requestData = {
					promotionName: formData.promotionName,
					promotionDescription:
						formData.promotionDescription || undefined,
					products: productIds,
					promotionType: "Discount" as const,
					discountPercent: formData.discountPercent,
					startDate: formData.startDate, // yyyy-MM-dd format from HTML input
					endDate: formData.endDate, // yyyy-MM-dd format from HTML input
				};
			} else {
				// For Buy X Get Y, use product pairs directly
				const pairs = productPairs.map((pair) => ({
					productBuy: pair.productBuy,
					productGet: pair.productGet,
				}));
				requestData = {
					promotionName: formData.promotionName,
					promotionDescription:
						formData.promotionDescription || undefined,
					products: pairs,
					promotionType: "Buy X Get Y" as const,
					buyQuantity: formData.buyQuantity,
					getQuantity: formData.getQuantity,
					startDate: formData.startDate, // yyyy-MM-dd format from HTML input
					endDate: formData.endDate, // yyyy-MM-dd format from HTML input
				};
			}

			const result = await promotionService.updatePromotion(
				promotionId,
				requestData,
			);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã cập nhật khuyến mãi thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onSuccess?.();
				setMode("view");
				await loadPromotionData(); // Reload data
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể cập nhật khuyến mãi",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error updating promotion:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật khuyến mãi",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const switchToEditMode = () => {
		setMode("edit");
	};

	const handleCancel = async () => {
		if (!promotionId) return;

		setIsCancelling(true);

		try {
			const result = await promotionService.cancelPromotion(promotionId);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã hủy khuyến mãi thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onCancelDialogClose();
				onSuccess?.();
				onClose();
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Có lỗi xảy ra khi hủy khuyến mãi",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error cancelling promotion:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi hủy khuyến mãi",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsCancelling(false);
		}
	};

	const getStatusBadge = (status: PromotionStatus) => {
		const statusConfig: Record<
			PromotionStatus,
			{ color: string; label: string }
		> = {
			Active: { color: "green", label: "Đang áp dụng" },
			Upcoming: { color: "orange", label: "Sắp diễn ra" },
			Expired: { color: "gray", label: "Đã hết hạn" },
			Cancelled: { color: "red", label: "Đã hủy" },
		};

		const config = statusConfig[status] || { color: "gray", label: status };

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

	const getTypeBadge = (type: PromotionType) => {
		const typeConfig: Record<
			PromotionType,
			{ color: string; label: string }
		> = {
			Discount: { color: "blue", label: "Giảm giá" },
			"Buy X Get Y": { color: "purple", label: "Mua X tặng Y" },
		};

		const config = typeConfig[type] || { color: "gray", label: type };

		return (
			<Tag
				colorScheme={config.color}
				size="lg"
				fontWeight="600">
				{config.label}
			</Tag>
		);
	};

	// Check if promotion can be cancelled or edited
	// Only Upcoming promotions can be cancelled or edited (not Active)
	const canCancel = (status: PromotionStatus) => {
		return status === "Upcoming";
	};

	const canEdit = (status: PromotionStatus) => {
		return status === "Upcoming"; // Only upcoming promotions can be edited
	};

	const InfoCard = ({
		icon,
		label,
		value,
		valueColor = "gray.800",
	}: {
		icon: React.ElementType;
		label: string;
		value?: string | number | null;
		valueColor?: string;
	}) => (
		<Flex
			direction="column"
			p={3}
			bg="gray.50"
			borderRadius="12px"
			border="1px solid"
			borderColor="gray.200"
			minH="70px">
			<Flex
				align="center"
				gap={2}
				mb={1}>
				<Icon
					as={icon}
					w="14px"
					h="14px"
					color="gray.500"
				/>
				<Text
					fontSize="12px"
					fontWeight="500"
					color="gray.500">
					{label}
				</Text>
			</Flex>
			<Text
				fontSize="14px"
				fontWeight="600"
				color={valueColor}>
				{value ?? "-"}
			</Text>
		</Flex>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={{ base: "full", md: "4xl" }}
			isCentered
			motionPreset="slideInBottom"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent
				borderRadius={{ base: 0, md: "2xl" }}
				mx={{ base: 0, md: 4 }}
				my={{ base: 0, md: 4 }}
				maxH={{ base: "100vh", md: "90vh" }}>
				<ModalHeader
					fontSize={{ base: "20px", md: "24px" }}
					fontWeight="700"
					color="brand.600"
					pt={5}
					pb={3}
					px={6}
					borderBottom="1px solid"
					borderColor="gray.100">
					{mode === "view"
						? "Chi tiết khuyến mãi"
						: "Chỉnh sửa khuyến mãi"}
				</ModalHeader>
				<ModalCloseButton
					top={5}
					right={6}
					size="lg"
					color="gray.500"
					_hover={{ color: "gray.700", bg: "gray.100" }}
				/>

				<ModalBody
					px={6}
					py={4}>
					{isFetching ? (
						<Center py={10}>
							<Spinner
								size="xl"
								color="brand.500"
							/>
						</Center>
					) : promotionData ? (
						<VStack
							spacing={4}
							align="stretch">
							{mode === "view" ? (
								/* VIEW MODE */
								<>
									{/* Header Info */}
									<Flex
										justify="space-between"
										align="flex-start"
										flexWrap="wrap"
										gap={3}
										pb={2}>
										<Box>
											<Text
												fontSize="22px"
												fontWeight="700"
												color="gray.800"
												mb={1}>
												{promotionData.promotionName}
											</Text>
											<Flex
												gap={2}
												align="center">
												<Badge
													colorScheme="brand"
													fontSize="13px"
													px={2}
													py={1}>
													{promotionData.promotionId}
												</Badge>
												{getTypeBadge(
													promotionData.promotionType,
												)}
											</Flex>
										</Box>
										{getStatusBadge(promotionData.status)}
									</Flex>

									{/* Description */}
									{promotionData.promotionDescription && (
										<Box
											p={3}
											bg="gray.50"
											borderRadius="8px"
											borderLeft="4px solid"
											borderLeftColor="brand.500">
											<Text
												fontSize="14px"
												color="gray.600">
												{
													promotionData.promotionDescription
												}
											</Text>
										</Box>
									)}

									{/* Info Grid */}
									<Grid
										templateColumns={{
											base: "1fr",
											sm: "repeat(2, 1fr)",
											md: "repeat(4, 1fr)",
										}}
										gap={3}>
										<GridItem>
											<InfoCard
												icon={FiCalendar}
												label="Ngày bắt đầu"
												value={promotionData.startDate}
											/>
										</GridItem>
										<GridItem>
											<InfoCard
												icon={FiCalendar}
												label="Ngày kết thúc"
												value={promotionData.endDate}
											/>
										</GridItem>
										{promotionData.promotionType ===
											"Discount" && (
											<GridItem>
												<InfoCard
													icon={FiPercent}
													label="Phần trăm giảm"
													value={`${promotionData.discountPercent}%`}
													valueColor="blue.600"
												/>
											</GridItem>
										)}
										{promotionData.promotionType ===
											"Buy X Get Y" && (
											<>
												<GridItem>
													<InfoCard
														icon={FiTag}
														label="Số lượng mua"
														value={
															promotionData.buyQuantity
														}
														valueColor="purple.600"
													/>
												</GridItem>
												<GridItem>
													<InfoCard
														icon={FiGift}
														label="Số lượng tặng"
														value={
															promotionData.getQuantity
														}
														valueColor="green.600"
													/>
												</GridItem>
											</>
										)}
									</Grid>

									{/* Products Table - Conditional Rendering by Promotion Type */}
									<Box mt={2}>
										{promotionData.promotionType === "Discount" ? (
											// Discount Promotion - Show Products
											<>
												<Text
													fontSize="15px"
													fontWeight="600"
													color="gray.700"
													mb={3}>
													Sản phẩm áp dụng (
													{promotionData.products.length})
												</Text>
												<Box
													border="1px solid"
													borderColor="gray.200"
													borderRadius="12px"
													overflow="hidden">
													<Table
														size="sm"
														variant="simple">
														<Thead bg="gray.50">
															<Tr>
																<Th
																	fontSize="12px"
																	fontWeight="700"
																	color="gray.600"
																	py={3}>
																	Tên sản phẩm
																</Th>
																<Th
																	fontSize="12px"
																	fontWeight="700"
																	color="gray.600"
																	py={3}>
																	ĐVT
																</Th>
																<Th
																	fontSize="12px"
																	fontWeight="700"
																	color="gray.600"
																	py={3}
																	isNumeric>
																	Giá bán
																</Th>
																<Th
																	fontSize="12px"
																	fontWeight="700"
																	color="gray.600"
																	py={3}
																	isNumeric>
																	Giá KM
																</Th>
															</Tr>
														</Thead>
														<Tbody>
															{promotionData.products.map(
																(product: any) => (
																	<Tr
																		key={
																			product.productId
																		}
																		_hover={{
																			bg: "gray.50",
																		}}>
																		<Td
																			fontSize="13px"
																			py={3}>
																			<VStack
																				align="flex-start"
																				spacing={
																					0
																				}>
																				<Text
																					fontWeight="600"
																					color="gray.800">
																					{
																						product.productName
																					}
																				</Text>
																				<Text
																					fontSize="11px"
																					color="gray.500">
																					{
																						product.productId
																					}
																				</Text>
																			</VStack>
																		</Td>
																		<Td
																			fontSize="13px"
																			color="gray.600"
																			py={3}>
																			{
																				product.unitOfMeasure
																			}
																		</Td>
																		<Td
																			fontSize="13px"
																			fontWeight="600"
																			color="gray.700"
																			py={3}
																			isNumeric>
																			{formatCurrency(
																				product.sellingPrice,
																			)}
																		</Td>
																		<Td
																			fontSize="13px"
																			fontWeight="700"
																			color="green.600"
																			py={3}
																			isNumeric>
																			{product.promotionPrice !==
																			null
																				? formatCurrency(
																						product.promotionPrice,
																					)
																				: "-"}
																		</Td>
																	</Tr>
																),
															)}
														</Tbody>
													</Table>
												</Box>
											</>
										) : (
											// Buy X Get Y Promotion - Show Product Pairs
											<>
												<Text
													fontSize="15px"
													fontWeight="600"
													color="gray.700"
													mb={1}>
													Cặp sản phẩm áp dụng (
													{promotionData.products.length})
												</Text>
												<Text
													fontSize="13px"
													color="gray.600"
													mb={3}>
													Khách mua sản phẩm X sẽ được tặng sản phẩm Y
												</Text>
												<Box
													border="1px solid"
													borderColor="gray.200"
													borderRadius="12px"
													overflow="hidden">
													<Table
														size="sm"
														variant="simple">
														<Thead bg="purple.50">
															<Tr>
																<Th
																	fontSize="12px"
																	fontWeight="700"
																	color="gray.600"
																	py={3}
																	width="45%">
																	Sản phẩm mua (X)
																</Th>
																<Th
																	fontSize="12px"
																	fontWeight="700"
																	color="purple.600"
																	py={3}
																	textAlign="center"
																	width="10%">
																	→
																</Th>
																<Th
																	fontSize="12px"
																	fontWeight="700"
																	color="gray.600"
																	py={3}
																	width="45%">
																	Sản phẩm tặng (Y)
																</Th>
															</Tr>
														</Thead>
														<Tbody>
															{promotionData.products.map(
																(
																	product: any,
																	index: number,
																) => (
																	<Tr
																		key={
																			index
																		}
																		_hover={{
																			bg: "purple.25",
																		}}>
																		<Td
																			fontSize="13px"
																			py={3}>
																			<VStack
																				align="flex-start"
																				spacing={
																					0
																				}>
																				<Text
																					fontWeight="600"
																					color="gray.800">
																					{product.productBuyName ||
																						product.productName}
																				</Text>
																				<Text
																					fontSize="11px"
																					color="gray.500">
																					{product.productBuy ||
																						product.productId}
																				</Text>
																			</VStack>
																		</Td>
																		<Td
																			fontSize="16px"
																			fontWeight="700"
																			color="purple.500"
																			py={3}
																			textAlign="center">
																			→
																		</Td>
																		<Td
																			fontSize="13px"
																			py={3}>
																			<VStack
																				align="flex-start"
																				spacing={
																					0
																				}>
																				<Text
																					fontWeight="600"
																					color="gray.800">
																					{
																						product.productGetName
																					}
																				</Text>
																				<Text
																					fontSize="11px"
																					color="gray.500">
																					{
																						product.productGet
																					}
																				</Text>
																			</VStack>
																		</Td>
																	</Tr>
																),
															)}
														</Tbody>
													</Table>
												</Box>
											</>
										)}
									</Box>
								</>
							) : (
								/* EDIT MODE */
								<>
									<Grid
										templateColumns={{
											base: "1fr",
											md: "repeat(2, 1fr)",
										}}
										gap={4}>
										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl isRequired>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Tên chương trình
												</FormLabel>
												<Input
													value={
														formData.promotionName
													}
													onChange={(e) =>
														setFormData({
															...formData,
															promotionName:
																e.target.value,
														})
													}
													size="md"
												/>
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Mô tả
												</FormLabel>
												<Textarea
													value={
														formData.promotionDescription
													}
													onChange={(e) =>
														setFormData({
															...formData,
															promotionDescription:
																e.target.value,
														})
													}
													size="md"
													rows={2}
												/>
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl isRequired>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Loại khuyến mãi
												</FormLabel>
												<Select
													value={
														formData.promotionType
													}
													onChange={(e) =>
														setFormData({
															...formData,
															promotionType: e
																.target
																.value as PromotionType,
														})
													}
													size="md"
													isDisabled={
														promotionData.status !==
														"Upcoming"
													}>
													<option value="Discount">
														Giảm giá (%)
													</option>
													<option value="Buy X Get Y">
														Mua X tặng Y
													</option>
												</Select>
											</FormControl>
										</GridItem>

										{/* Discount Configuration */}
										{formData.promotionType ===
											"Discount" && (
											<GridItem
												colSpan={{ base: 1, md: 2 }}>
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
															Phần trăm giảm giá
															(%)
														</FormLabel>
														<NumberInput
															min={1}
															max={100}
															value={
																formData.discountPercent
															}
															onChange={(
																_,
																value,
															) =>
																setFormData({
																	...formData,
																	discountPercent:
																		value ||
																		0,
																})
															}>
															<NumberInputField
																placeholder="VD: 20"
																fontSize="15px"
																h="44px"
																bg="white"
															/>
															<NumberInputStepper>
																<NumberIncrementStepper />
																<NumberDecrementStepper />
															</NumberInputStepper>
														</NumberInput>
													</FormControl>
												</Box>
											</GridItem>
										)}

										{/* Buy X Get Y Configuration */}
										{formData.promotionType ===
											"Buy X Get Y" && (
											<GridItem
												colSpan={{ base: 1, md: 2 }}>
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
																value={
																	formData.buyQuantity
																}
																onChange={(
																	_,
																	value,
																) =>
																	setFormData(
																		{
																			...formData,
																			buyQuantity:
																				value ||
																				1,
																		},
																	)
																}>
																<NumberInputField
																	placeholder="VD: 2"
																	fontSize="15px"
																	h="44px"
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
																Số lượng tặng
																(Y)
															</FormLabel>
															<NumberInput
																min={1}
																value={
																	formData.getQuantity
																}
																onChange={(
																	_,
																	value,
																) =>
																	setFormData(
																		{
																			...formData,
																			getQuantity:
																				value ||
																				1,
																		},
																	)
																}>
																<NumberInputField
																	placeholder="VD: 1"
																	fontSize="15px"
																	h="44px"
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
											</GridItem>
										)}

										<GridItem>
											<FormControl isRequired>
												<FormLabel
													fontSize="14px"
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
															startDate:
																e.target.value,
														})
													}
													size="md"
												/>
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl isRequired>
												<FormLabel
													fontSize="14px"
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
															endDate:
																e.target.value,
														})
													}
													size="md"
												/>
											</FormControl>
										</GridItem>

										{/* Sản phẩm áp dụng - hiển thị khác nhau theo loại khuyến mãi */}
										<GridItem colSpan={{ base: 1, md: 2 }}>
											{formData.promotionType === "Discount" ? (
												<FormControl isRequired>
													<FormLabel
														fontSize="14px"
														fontWeight="600"
														color="gray.700">
														Sản phẩm áp dụng
													</FormLabel>
													<Box
														p={4}
														border="1px solid"
														borderColor="gray.200"
														borderRadius="lg"
														bg="gray.50">
														<ProductSelector
															selectedProducts={
																selectedProducts
															}
															onProductsChange={
																handleProductsChange
															}
														/>
													</Box>
												</FormControl>
											) : (
												<FormControl isRequired>
													<FormLabel
														fontSize="14px"
														fontWeight="600"
														color="gray.700">
														Cặp sản phẩm áp dụng
													</FormLabel>
													<Text
														fontSize="13px"
														color="gray.600"
														mb={2}>
														Chọn cặp sản phẩm: khách mua sản phẩm X sẽ được tặng sản phẩm Y
													</Text>
													<BuyXGetYProductPairSelector
														productPairs={productPairs}
														onProductPairsChange={
															handleProductPairsChange
														}
													/>
												</FormControl>
											)}
										</GridItem>
									</Grid>
								</>
							)}
						</VStack>
					) : (
						<Text
							textAlign="center"
							color="gray.500"
							py={10}>
							Không tìm thấy thông tin khuyến mãi
						</Text>
					)}
				</ModalBody>

				<ModalFooter
					px={6}
					py={4}
					borderTop="1px solid"
					borderColor="gray.200">
					<Flex
						justify="space-between"
						w="full">
						{/* Left side - Cancel button (only in view mode) */}
						<Box>
							{mode === "view" &&
								promotionData &&
								canCancel(promotionData.status) && (
									<Button
										leftIcon={<Icon as={FiXCircle} />}
										colorScheme="red"
										variant="ghost"
										size="md"
										onClick={onCancelDialogOpen}
										_hover={{ bg: "red.50" }}>
										Hủy khuyến mãi
									</Button>
								)}
						</Box>

						{/* Right side - Action buttons */}
						<HStack spacing={3}>
							<Button
								variant="ghost"
								size="md"
								onClick={() => {
									if (mode === "edit") {
										setMode("view");
										// Reset form data
										if (promotionData) {
											setFormData({
												promotionName:
													promotionData.promotionName,
												promotionDescription:
													promotionData.promotionDescription ||
													"",
												promotionType:
													promotionData.promotionType,
												discountPercent:
													promotionData.discountPercent ||
													10,
												buyQuantity:
													promotionData.buyQuantity ||
													1,
												getQuantity:
													promotionData.getQuantity ||
													1,
												startDate: parseDDMMYYYYToInput(
													promotionData.startDate,
												),
												endDate: parseDDMMYYYYToInput(
													promotionData.endDate,
												),
											});
											const existingProducts: SelectedProduct[] =
												promotionData.products.map(
													(p) => ({
														productId: p.productId,
														productName:
															p.productName,
													}),
												);
											setSelectedProducts(
												existingProducts,
											);
										}
									} else {
										onClose();
									}
								}}
								isDisabled={isLoading}
								px={6}>
								{mode === "edit" ? "Quay lại" : "Đóng"}
							</Button>
							{mode === "edit" ? (
								<Button
									bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
									color="white"
									size="md"
									onClick={handleSubmit}
									isLoading={isLoading}
									loadingText="Đang cập nhật..."
									_hover={{
										bgGradient:
											"linear(135deg, brand.600 0%, brand.500 100%)",
									}}
									isDisabled={isFetching}
									px={6}>
									Cập nhật
								</Button>
							) : (
								promotionData &&
								canEdit(promotionData.status) && (
									<Button
										leftIcon={<Icon as={FiEdit2} />}
										bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
										color="white"
										_hover={{
											bgGradient:
												"linear(135deg, brand.600 0%, brand.500 100%)",
										}}
										size="md"
										onClick={switchToEditMode}
										px={6}>
										Chỉnh sửa
									</Button>
								)
							)}
						</HStack>
					</Flex>
				</ModalFooter>
			</ModalContent>

			{/* Cancel Confirmation Dialog */}
			<AlertDialog
				isOpen={isCancelDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onCancelDialogClose}
				isCentered>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold">
							Xác nhận hủy khuyến mãi
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc chắn muốn hủy khuyến mãi{" "}
							<Text
								as="span"
								fontWeight="bold"
								color="brand.600">
								{promotionData?.promotionName}
							</Text>
							? Hành động này không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={cancelRef}
								onClick={onCancelDialogClose}
								isDisabled={isCancelling}>
								Không
							</Button>
							<Button
								colorScheme="red"
								onClick={handleCancel}
								ml={3}
								isLoading={isCancelling}
								loadingText="Đang hủy...">
								Hủy khuyến mãi
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Modal>
	);
};

export default PromotionViewEditModal;
