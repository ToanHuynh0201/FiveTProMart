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
	Tooltip,
	Box,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	useDisclosure,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	IconButton,
} from "@chakra-ui/react";
import type {
	SupplierDetail,
	SupplierType,
	SupplierProduct,
} from "@/types/supplier";
import type { PurchaseListItem, PurchaseDetail } from "@/types/purchase";
import { supplierService } from "@/services/supplierService";
import { purchaseService } from "@/services/purchaseService";
import {
	FiPhone,
	FiUser,
	FiCopy,
	FiCheck,
	FiEdit2,
	FiTrash2,
	FiMapPin,
	FiEye,
} from "react-icons/fi";
import { ProductSelector } from "./ProductSelector";
import { PurchaseDetailModal } from "../purchase/PurchaseDetailModal";

interface SelectedProduct {
	productId: string;
	productName: string;
}

interface SupplierViewEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	supplierId: string | null;
	mode: "view" | "edit";
	onSuccess?: () => void;
	onViewPurchaseDetail?: (
		purchaseId: string,
		supplierData: { supplierId: string; mode: "view" | "edit" },
	) => void;
}

export const SupplierViewEditModal: React.FC<SupplierViewEditModalProps> = ({
	isOpen,
	onClose,
	supplierId,
	mode: initialMode,
	onSuccess,
	onViewPurchaseDetail,
}) => {
	const toast = useToast();
	const [mode, setMode] = useState<"view" | "edit">(initialMode);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [supplierData, setSupplierData] = useState<SupplierDetail | null>(
		null,
	);

	// Products and Purchase History data
	const [products, setProducts] = useState<SupplierProduct[]>([]);
	const [purchaseHistory, setPurchaseHistory] = useState<PurchaseListItem[]>(
		[],
	);
	const [isLoadingProducts, setIsLoadingProducts] = useState(false);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [productsTotalItems, setProductsTotalItems] = useState(0);
	const [historyTotalItems, setHistoryTotalItems] = useState(0);

	// Tab state
	const [tabIndex, setTabIndex] = useState(0);

	// Purchase detail modal state
	const [selectedPurchase, setSelectedPurchase] =
		useState<PurchaseDetail | null>(null);
	const [isLoadingPurchaseDetail, setIsLoadingPurchaseDetail] =
		useState(false);
	const {
		isOpen: isPurchaseDetailOpen,
		onOpen: onPurchaseDetailOpen,
		onClose: onPurchaseDetailClose,
	} = useDisclosure();

	// Delete confirmation dialog
	const {
		isOpen: isDeleteDialogOpen,
		onOpen: onDeleteDialogOpen,
		onClose: onDeleteDialogClose,
	} = useDisclosure();
	const cancelRef = useRef<HTMLButtonElement>(null);

	// Form data for edit mode
	const [formData, setFormData] = useState({
		supplierName: "",
		address: "",
		phoneNumber: "",
		representName: "",
		representPhoneNumber: "",
		supplierType: "Doanh nghiệp" as SupplierType,
	});

	// Selected products for edit mode
	const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
		[],
	);

	const [errors, setErrors] = useState({
		supplierName: "",
		phoneNumber: "",
		email: "",
		representPhoneNumber: "",
	});

	// Copy states
	const [copiedField, setCopiedField] = useState<string | null>(null);

	const handleProductsChange = (newProducts: SelectedProduct[]) => {
		setSelectedProducts(newProducts);
	};

	// Load supplier data when modal opens
	useEffect(() => {
		if (isOpen && supplierId) {
			loadSupplierData();
			setTabIndex(0);
		}
		// Reset mode to initial mode when modal opens
		setMode(initialMode);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, supplierId, initialMode]);

	// Load products and purchase history when tab changes
	useEffect(() => {
		if (isOpen && supplierId && mode === "view") {
			if (tabIndex === 0) {
				loadProducts();
				loadPurchaseHistory();
			} else if (tabIndex === 1) {
				loadPurchaseHistory();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tabIndex, isOpen, supplierId, mode]);

	const loadSupplierData = async () => {
		if (!supplierId) return;

		setIsFetching(true);
		try {
			const result = await supplierService.getSupplierById(supplierId);
			console.log(result);

			if (result.success && result.data) {
				setSupplierData(result.data);
				// Populate form data for edit mode
				setFormData({
					supplierName: result.data.supplierName,
					address: result.data.address,
					phoneNumber: result.data.phoneNumber,

					representName: result.data.representName || "",
					representPhoneNumber:
						result.data.representPhoneNumber || "",
					supplierType: result.data.supplierType,
				});

				// Load products for edit mode - we need product names
				const productsResult =
					await supplierService.getSupplierProducts(supplierId, {
						page: 0,
						size: 100,
					});
				if (productsResult.success && productsResult.data) {
					const existingProducts: SelectedProduct[] =
						productsResult.data.map((p: SupplierProduct) => ({
							productId: p.productId,
							productName: p.productName,
						}));
					setSelectedProducts(existingProducts);
				}
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải thông tin nhà cung cấp",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error loading supplier:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tải thông tin nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsFetching(false);
		}
	};

	const loadProducts = async () => {
		if (!supplierId) return;

		setIsLoadingProducts(true);
		try {
			const result = await supplierService.getSupplierProducts(
				supplierId,
				{
					page: 0,
					size: 100,
				},
			);

			if (result.success) {
				setProducts(result.data || []);
				setProductsTotalItems(result.pagination?.totalItems || 0);
			}
		} catch (error) {
			console.error("Error loading products:", error);
		} finally {
			setIsLoadingProducts(false);
		}
	};

	const loadPurchaseHistory = async () => {
		if (!supplierId) return;

		setIsLoadingHistory(true);
		try {
			const result = await purchaseService.getPurchaseOrders({
				supplierId: supplierId,
				page: 0,
				size: 100,
			});

			if (result.success) {
				setPurchaseHistory(result.data || []);
				console.log(result);

				setHistoryTotalItems(result.pagination?.totalItems || 0);
			}
		} catch (error) {
			console.error("Error loading purchase history:", error);
		} finally {
			setIsLoadingHistory(false);
		}
	};

	const validatePhone = (phone: string): boolean => {
		if (!phone) return true;
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const handleSubmit = async () => {
		// Validate form
		const newErrors = {
			supplierName: "",
			phoneNumber: "",
			email: "",
			representPhoneNumber: "",
		};

		if (!formData.supplierName.trim()) {
			newErrors.supplierName = "Vui lòng nhập tên nhà cung cấp";
		} else if (formData.supplierName.trim().length < 3) {
			newErrors.supplierName = "Tên nhà cung cấp phải có ít nhất 3 ký tự";
		}

		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
		} else if (!validatePhone(formData.phoneNumber)) {
			newErrors.phoneNumber =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		if (
			formData.representPhoneNumber &&
			!validatePhone(formData.representPhoneNumber)
		) {
			newErrors.representPhoneNumber =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		setErrors(newErrors);

		if (
			newErrors.supplierName ||
			newErrors.phoneNumber ||
			newErrors.email ||
			newErrors.representPhoneNumber
		) {
			return;
		}

		if (!supplierId) return;

		setIsLoading(true);

		try {
			const result = await supplierService.updateSupplier(supplierId, {
				supplierName: formData.supplierName,
				address: formData.address,
				phoneNumber: formData.phoneNumber,
				representName: formData.representName || undefined,
				representPhoneNumber:
					formData.representPhoneNumber || undefined,
				supplierType: formData.supplierType,
				suppliedProductType: selectedProducts.map((p) => p.productId),
			});

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Cập nhật nhà cung cấp thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onSuccess?.();
				onClose();
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error ||
						"Có lỗi xảy ra khi cập nhật nhà cung cấp",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error updating supplier:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopy = async (value: string, field: string) => {
		if (!value) return;

		try {
			await navigator.clipboard.writeText(value);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const switchToEditMode = () => {
		setMode("edit");
	};

	const handleDelete = async () => {
		if (!supplierId) return;

		setIsDeleting(true);

		try {
			const result = await supplierService.deleteSupplier(supplierId);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã xóa nhà cung cấp thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onDeleteDialogClose();
				onSuccess?.();
				onClose();
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Có lỗi xảy ra khi xóa nhà cung cấp",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error deleting supplier:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi xóa nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const formatCurrency = (value: number) => {
		return value.toLocaleString("vi-VN") + "đ";
	};

	const formatDate = (dateString: string | null) => {
		if (!dateString) return "-";
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("vi-VN");
		} catch {
			return dateString;
		}
	};

	const handleViewPurchaseDetail = async (purchaseId: string) => {
		// If parent handler is provided, use it to close this modal and open purchase detail in parent
		if (onViewPurchaseDetail && supplierId) {
			onViewPurchaseDetail(purchaseId, { supplierId, mode });
			return;
		}

		// Fallback: open modal within this component (legacy behavior)
		setIsLoadingPurchaseDetail(true);
		onPurchaseDetailOpen();

		try {
			const result =
				await purchaseService.getPurchaseOrderById(purchaseId);
			if (result.success && result.data) {
				setSelectedPurchase(result.data);
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải chi tiết đơn nhập hàng",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error loading purchase detail:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tải chi tiết đơn nhập hàng",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoadingPurchaseDetail(false);
		}
	};

	const handleClosePurchaseDetail = () => {
		onPurchaseDetailClose();
		setSelectedPurchase(null);
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "green";
			case "Draft":
				return "yellow";
			case "Cancelled":
				return "red";
			default:
				return "gray";
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "Completed":
				return "ĐÃ NHẬN";
			case "Draft":
				return "NHÁP";
			case "Cancelled":
				return "ĐÃ HỦY";
			default:
				return status;
		}
	};

	const InfoCard = ({
		icon,
		label,
		value,
		canCopy = false,
		fieldName = "",
	}: {
		icon: React.ElementType;
		label: string;
		value?: string | null;
		canCopy?: boolean;
		fieldName?: string;
	}) => (
		<Flex
			direction="column"
			p={3}
			bg="gray.50"
			borderRadius="12px"
			border="1px solid"
			borderColor="gray.200"
			minH="70px"
			cursor={canCopy && value ? "pointer" : "default"}
			onClick={() => canCopy && value && handleCopy(value, fieldName)}
			_hover={canCopy && value ? { bg: "gray.100" } : {}}
			transition="background 0.2s">
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
			<Flex
				align="center"
				gap={2}>
				<Text
					fontSize="14px"
					fontWeight="600"
					color="#161f70">
					{value || "-"}
				</Text>
				{canCopy && value && (
					<Tooltip
						label={
							copiedField === fieldName
								? "Đã copy!"
								: "Click để copy"
						}
						placement="top"
						hasArrow>
						<Box>
							<Icon
								as={
									copiedField === fieldName ? FiCheck : FiCopy
								}
								w="12px"
								h="12px"
								color={
									copiedField === fieldName
										? "green.500"
										: "gray.400"
								}
							/>
						</Box>
					</Tooltip>
				)}
			</Flex>
		</Flex>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={{ base: "full", md: "5xl" }}
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
					color="#161f70"
					pt={5}
					pb={3}
					px={6}
					borderBottom="1px solid"
					borderColor="gray.100">
					{mode === "view"
						? "Thông tin chi tiết nhà cung cấp"
						: "Chỉnh sửa nhà cung cấp"}
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
								color="#161f70"
							/>
						</Center>
					) : supplierData ? (
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
												fontSize="24px"
												fontWeight="700"
												color="#161f70"
												mb={0.5}>
												{supplierData.supplierName}
											</Text>
											<Text
												fontSize="14px"
												color="gray.500"
												fontWeight="500">
												{supplierData.supplierId}
											</Text>
										</Box>
										<Badge
											colorScheme={
												supplierData.status ===
												"HOẠT ĐỘNG"
													? "green"
													: "gray"
											}
											fontSize="13px"
											px={4}
											py={1.5}
											borderRadius="full"
											border="1px solid"
											borderColor={
												supplierData.status ===
												"HOẠT ĐỘNG"
													? "green.200"
													: "gray.300"
											}>
											{supplierData.status}
										</Badge>
									</Flex>

									{/* Info Grid - 4 columns */}
									<Grid
										templateColumns={{
											base: "1fr",
											sm: "repeat(2, 1fr)",
											md: "repeat(4, 1fr)",
										}}
										gap={3}>
										<GridItem>
											<InfoCard
												icon={FiPhone}
												label="Số điện thoại"
												value={supplierData.phoneNumber}
												canCopy
												fieldName="phone"
											/>
										</GridItem>
										<GridItem>
											<InfoCard
												icon={FiUser}
												label="Người liên hệ"
												value={
													supplierData.representName
												}
											/>
										</GridItem>
										<GridItem>
											<InfoCard
												icon={FiPhone}
												label="SĐT người liên hệ"
												value={
													supplierData.representPhoneNumber
												}
												canCopy
												fieldName="representPhone"
											/>
										</GridItem>
										<GridItem>
											<InfoCard
												icon={FiMapPin}
												label="Địa chỉ"
												value={supplierData.address}
											/>
										</GridItem>
									</Grid>

									{/* Tabs Section */}
									<Box mt={2}>
										<Tabs
											index={tabIndex}
											onChange={setTabIndex}
											variant="unstyled">
											<TabList
												borderBottom="1px solid"
												borderColor="gray.200">
												<Tab
													fontSize="14px"
													fontWeight="600"
													color={
														tabIndex === 0
															? "#161f70"
															: "gray.500"
													}
													borderBottom={
														tabIndex === 0
															? "2px solid"
															: "none"
													}
													borderColor="#161f70"
													pb={3}
													px={4}
													_hover={{
														color: "#161f70",
													}}>
													Sản phẩm cung cấp (
													{productsTotalItems})
												</Tab>
												<Tab
													fontSize="14px"
													fontWeight="600"
													color={
														tabIndex === 1
															? "#161f70"
															: "gray.500"
													}
													borderBottom={
														tabIndex === 1
															? "2px solid"
															: "none"
													}
													borderColor="#161f70"
													pb={3}
													px={4}
													_hover={{
														color: "#161f70",
													}}>
													Lịch sử nhập hàng (
													{historyTotalItems})
												</Tab>
											</TabList>

											<TabPanels>
												{/* Products Tab */}
												<TabPanel
													px={0}
													py={4}>
													{isLoadingProducts ? (
														<Center py={8}>
															<Spinner color="#161f70" />
														</Center>
													) : products.length > 0 ? (
														<Box
															overflowX="auto"
															borderRadius="lg"
															border="1px solid"
															borderColor="gray.200">
															<Table
																variant="simple"
																size="sm">
																<Thead bg="gray.50">
																	<Tr>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Mã
																			SP
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Tên
																			sản
																			phẩm
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Tổng
																			SL
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Đơn
																			vị
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}
																			isNumeric>
																			Giá
																			nhập
																			gần
																			nhất
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Ngày
																			nhập
																			gần
																			nhất
																		</Th>
																	</Tr>
																</Thead>
																<Tbody>
																	{products.map(
																		(
																			product,
																		) => (
																			<Tr
																				key={
																					product.productId
																				}
																				_hover={{
																					bg: "gray.50",
																				}}>
																				<Td
																					fontSize="13px"
																					fontWeight="600"
																					color="#161f70"
																					py={
																						3
																					}>
																					{
																						product.productId
																					}
																				</Td>
																				<Td
																					fontSize="13px"
																					color="gray.700"
																					py={
																						3
																					}>
																					{
																						product.productName
																					}
																				</Td>
																				<Td
																					py={
																						3
																					}>
																					<Badge
																						colorScheme="purple"
																						fontSize="11px"
																						px={
																							2
																						}
																						py={
																							0.5
																						}
																						borderRadius="md">
																						{
																							product.totalStockQuantity
																						}
																					</Badge>
																				</Td>
																				<Td
																					fontSize="13px"
																					color="gray.600"
																					py={
																						3
																					}>
																					{
																						product.unitOfMeasure
																					}
																				</Td>
																				<Td
																					fontSize="13px"
																					fontWeight="600"
																					color="purple.600"
																					py={
																						3
																					}
																					isNumeric>
																					{product.lastImportPrice
																						? formatCurrency(
																								product.lastImportPrice,
																							)
																						: "-"}
																				</Td>
																				<Td
																					fontSize="13px"
																					color="gray.600"
																					py={
																						3
																					}>
																					{formatDate(
																						product.lastImportDate,
																					)}
																				</Td>
																			</Tr>
																		),
																	)}
																</Tbody>
															</Table>
														</Box>
													) : (
														<Center py={8}>
															<Text color="gray.500">
																Chưa có sản phẩm
																nào
															</Text>
														</Center>
													)}
												</TabPanel>

												{/* Purchase History Tab */}
												<TabPanel
													px={0}
													py={4}>
													{isLoadingHistory ? (
														<Center py={8}>
															<Spinner color="#161f70" />
														</Center>
													) : purchaseHistory.length >
													  0 ? (
														<Box
															overflowX="auto"
															borderRadius="lg"
															border="1px solid"
															borderColor="gray.200">
															<Table
																variant="simple"
																size="sm">
																<Thead bg="gray.50">
																	<Tr>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Mã
																			phiếu
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Ngày
																			nhập
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Ngày
																			kiểm
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Người
																			tạo
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}
																			isNumeric>
																			Tổng
																			tiền
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}>
																			Trạng
																			thái
																		</Th>
																		<Th
																			fontSize="11px"
																			fontWeight="700"
																			color="gray.600"
																			textTransform="uppercase"
																			py={
																				3
																			}
																			textAlign="center">
																			Chi
																			tiết
																		</Th>
																	</Tr>
																</Thead>
																<Tbody>
																	{purchaseHistory.map(
																		(
																			item,
																		) => (
																			<Tr
																				key={
																					item.id
																				}
																				_hover={{
																					bg: "gray.50",
																				}}>
																				<Td
																					fontSize="13px"
																					fontWeight="600"
																					color="#161f70"
																					py={
																						3
																					}>
																					{
																						item.poCode
																					}
																				</Td>
																				<Td
																					fontSize="13px"
																					color="gray.700"
																					py={
																						3
																					}>
																					{
																						item.purchaseDate
																					}
																				</Td>
																				<Td
																					fontSize="13px"
																					color="gray.700"
																					py={
																						3
																					}>
																					{
																						item.checkDate
																					}
																				</Td>
																				<Td
																					fontSize="13px"
																					color="gray.600"
																					py={
																						3
																					}>
																					{
																						item.staffNameCreated
																					}
																				</Td>
																				<Td
																					fontSize="13px"
																					fontWeight="600"
																					color="purple.600"
																					py={
																						3
																					}
																					isNumeric>
																					{formatCurrency(
																						item.totalAmount,
																					)}
																				</Td>
																				<Td
																					py={
																						3
																					}>
																					<Badge
																						colorScheme={getStatusColor(
																							item.status,
																						)}
																						fontSize="11px"
																						px={
																							2
																						}
																						py={
																							0.5
																						}
																						borderRadius="md">
																						{getStatusLabel(
																							item.status,
																						)}
																					</Badge>
																				</Td>
																				<Td
																					py={
																						3
																					}
																					textAlign="center">
																					<IconButton
																						aria-label="Xem chi tiết"
																						icon={
																							<FiEye />
																						}
																						size="sm"
																						variant="ghost"
																						color="gray.500"
																						_hover={{
																							color: "#161f70",
																							bg: "gray.100",
																						}}
																						onClick={() =>
																							handleViewPurchaseDetail(
																								item.id,
																							)
																						}
																					/>
																				</Td>
																			</Tr>
																		),
																	)}
																</Tbody>
															</Table>
														</Box>
													) : (
														<Center py={8}>
															<Text color="gray.500">
																Chưa có lịch sử
																nhập hàng
															</Text>
														</Center>
													)}
												</TabPanel>
											</TabPanels>
										</Tabs>
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
											<FormControl
												isRequired
												isInvalid={
													!!errors.supplierName
												}>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Tên nhà cung cấp
												</FormLabel>
												<Input
													value={
														formData.supplierName
													}
													onChange={(e) => {
														setFormData({
															...formData,
															supplierName:
																e.target.value,
														});
														setErrors({
															...errors,
															supplierName: "",
														});
													}}
													size="md"
													borderColor={
														errors.supplierName
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.supplierName && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{errors.supplierName}
													</Text>
												)}
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl isRequired>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Loại nhà cung cấp
												</FormLabel>
												<Select
													value={
														formData.supplierType
													}
													onChange={(e) =>
														setFormData({
															...formData,
															supplierType: e
																.target
																.value as SupplierType,
														})
													}
													size="md">
													<option value="Doanh nghiệp">
														Doanh nghiệp
													</option>
													<option value="Tư nhân">
														Tư nhân
													</option>
												</Select>
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl
												isRequired
												isInvalid={
													!!errors.phoneNumber
												}>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Số điện thoại
												</FormLabel>
												<Input
													value={formData.phoneNumber}
													onChange={(e) => {
														setFormData({
															...formData,
															phoneNumber:
																e.target.value,
														});
														setErrors({
															...errors,
															phoneNumber: "",
														});
													}}
													size="md"
													borderColor={
														errors.phoneNumber
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.phoneNumber && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{errors.phoneNumber}
													</Text>
												)}
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Người liên hệ
												</FormLabel>
												<Input
													value={
														formData.representName
													}
													onChange={(e) =>
														setFormData({
															...formData,
															representName:
																e.target.value,
														})
													}
													size="md"
												/>
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl
												isInvalid={
													!!errors.representPhoneNumber
												}>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													SĐT người liên hệ
												</FormLabel>
												<Input
													value={
														formData.representPhoneNumber
													}
													onChange={(e) => {
														setFormData({
															...formData,
															representPhoneNumber:
																e.target.value,
														});
														setErrors({
															...errors,
															representPhoneNumber:
																"",
														});
													}}
													size="md"
													borderColor={
														errors.representPhoneNumber
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.representPhoneNumber && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{
															errors.representPhoneNumber
														}
													</Text>
												)}
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl isRequired>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Địa chỉ
												</FormLabel>
												<Textarea
													value={formData.address}
													onChange={(e) =>
														setFormData({
															...formData,
															address:
																e.target.value,
														})
													}
													size="md"
													rows={2}
													resize="vertical"
												/>
											</FormControl>
										</GridItem>

										{/* Sản phẩm cung cấp */}
										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl>
												<FormLabel
													fontSize="14px"
													fontWeight="600"
													color="gray.700">
													Sản phẩm cung cấp
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
							Không tìm thấy thông tin nhà cung cấp
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
						{/* Left side - Delete button (only in view mode) */}
						<Box>
							{mode === "view" && supplierData && (
								<Button
									leftIcon={<Icon as={FiTrash2} />}
									colorScheme="red"
									variant="ghost"
									size="md"
									onClick={onDeleteDialogOpen}
									_hover={{ bg: "red.50" }}>
									Xóa
								</Button>
							)}
						</Box>

						{/* Right side - Action buttons */}
						<HStack spacing={3}>
							<Button
								variant="ghost"
								size="md"
								onClick={async () => {
									if (mode === "edit") {
										setMode("view");
										// Reset form data
										if (supplierData) {
											setFormData({
												supplierName:
													supplierData.supplierName,
												address: supplierData.address,
												phoneNumber:
													supplierData.phoneNumber,
												representName:
													supplierData.representName ||
													"",
												representPhoneNumber:
													supplierData.representPhoneNumber ||
													"",
												supplierType:
													supplierData.supplierType,
											});
											// Reload products from API to reset selected products
											if (supplierId) {
												const productsResult =
													await supplierService.getSupplierProducts(
														supplierId,
														{ page: 0, size: 100 },
													);
												if (
													productsResult.success &&
													productsResult.data
												) {
													const existingProducts: SelectedProduct[] =
														productsResult.data.map(
															(
																p: SupplierProduct,
															) => ({
																productId:
																	p.productId,
																productName:
																	p.productName,
															}),
														);
													setSelectedProducts(
														existingProducts,
													);
												}
											}
										}
										setErrors({
											supplierName: "",
											phoneNumber: "",
											email: "",
											representPhoneNumber: "",
										});
									} else {
										onClose();
									}
								}}
								isDisabled={isLoading}
								_hover={{ bg: "gray.100" }}
								px={6}
								bg="#161f70"
								color="white"
								_disabled={{ bg: "gray.300" }}>
								{mode === "edit" ? "Quay lại" : "Đóng"}
							</Button>
							{mode === "edit" ? (
								<Button
									colorScheme="blue"
									size="md"
									onClick={handleSubmit}
									isLoading={isLoading}
									loadingText="Đang cập nhật..."
									bg="#161f70"
									_hover={{ bg: "#0f1654" }}
									isDisabled={isFetching}
									px={6}>
									Cập nhật
								</Button>
							) : (
								supplierData && (
									<Button
										leftIcon={<Icon as={FiEdit2} />}
										colorScheme="blue"
										bg="#161f70"
										_hover={{ bg: "#0f1654" }}
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

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={isDeleteDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteDialogClose}
				isCentered>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold">
							Xác nhận xóa nhà cung cấp
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
							<Text
								as="span"
								fontWeight="bold"
								color="#161f70">
								{supplierData?.supplierName}
							</Text>
							? Hành động này không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={cancelRef}
								onClick={onDeleteDialogClose}
								isDisabled={isDeleting}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleDelete}
								ml={3}
								isLoading={isDeleting}
								loadingText="Đang xóa...">
								Xóa
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			{/* Purchase Detail Modal */}
			<PurchaseDetailModal
				isOpen={isPurchaseDetailOpen}
				onClose={handleClosePurchaseDetail}
				purchase={selectedPurchase}
				isLoading={isLoadingPurchaseDetail}
			/>
		</Modal>
	);
};

export default SupplierViewEditModal;
