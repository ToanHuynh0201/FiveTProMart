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
	HStack,
	Text,
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	useToast,
	Input,
	FormControl,
	FormLabel,
	Textarea,
	Divider,
	Flex,
	NumberInput,
	NumberInputField,
	IconButton,
	Icon,
	Image,
	SimpleGrid,
	Badge,
	Spinner,
} from "@chakra-ui/react";
import { CheckIcon, DeleteIcon } from "@chakra-ui/icons";
import { BsCamera } from "react-icons/bs";
import type {
	PurchaseDetail,
	ConfirmReceiptRequest,
	LotToPrint,
} from "@/types/purchase";

interface ActualItemInput {
	productId: string;
	productName: string;
	quantityOrdered: number;
	quantityReceived: number;
	importPrice: number;
	manufactureDate: string;
	expirationDate: string;
	notes: string; // Ghi chú cho từng sản phẩm
}

interface ConfirmReceiptModalProps {
	isOpen: boolean;
	onClose: () => void;
	purchase: PurchaseDetail | null;
	staffId: string;
	onConfirm: (
		id: string,
		data: ConfirmReceiptRequest,
	) => Promise<{ lotsToPrint: LotToPrint[] } | null>;
	isLoading?: boolean;
}

export const ConfirmReceiptModal: React.FC<ConfirmReceiptModalProps> = ({
	isOpen,
	onClose,
	purchase,
	staffId,
	onConfirm,
	isLoading = false,
}) => {
	const toast = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [actualItems, setActualItems] = useState<ActualItemInput[]>([]);
	const [displayPrices, setDisplayPrices] = useState<Record<string, string>>(
		{},
	);
	const [invoiceData, setInvoiceData] = useState({
		invoiceNumber: "",
		invoiceDate: "",
		images: [] as string[],
	});
	const [notes, setNotes] = useState("");
	const [lotsToPrint, setLotsToPrint] = useState<LotToPrint[] | null>(null);

	// Format currency for display
	const formatCurrencyInput = (value: number) => {
		if (!value && value !== 0) return "";
		return value.toLocaleString("vi-VN");
	};

	// Handle price input change with formatting
	const handlePriceInputChange = (
		productId: string,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const inputValue = e.target.value;
		const numericValue = inputValue.replace(/\D/g, "");

		if (numericValue === "") {
			setDisplayPrices((prev) => ({ ...prev, [productId]: "" }));
			handleItemChange(productId, "importPrice", 0);
			return;
		}

		const parsedValue = parseInt(numericValue, 10);
		setDisplayPrices((prev) => ({
			...prev,
			[productId]: formatCurrencyInput(parsedValue),
		}));
		handleItemChange(productId, "importPrice", parsedValue);
	};

	// Initialize actual items from purchase items
	useEffect(() => {
		if (purchase && isOpen) {
			const items: ActualItemInput[] = purchase.items.map((item) => ({
				productId: item.productId,
				productName: item.productName,
				quantityOrdered: item.quantityOrdered,
				quantityReceived: item.quantityOrdered, // Default to ordered quantity
				importPrice: item.importPrice || 0,
				manufactureDate: "",
				expirationDate: "",
				notes: "", // Ghi chú cho từng sản phẩm
			}));
			setActualItems(items);

			// Initialize display prices
			const prices: Record<string, string> = {};
			items.forEach((item) => {
				prices[item.productId] = formatCurrencyInput(item.importPrice);
			});
			setDisplayPrices(prices);

			setNotes(purchase.notes || "");
			setLotsToPrint(null);
		}
	}, [purchase, isOpen]);

	const handleClose = () => {
		setActualItems([]);
		setDisplayPrices({});
		setInvoiceData({
			invoiceNumber: "",
			invoiceDate: "",
			images: [],
		});
		setNotes("");
		setLotsToPrint(null);
		onClose();
	};

	const handleItemChange = (
		productId: string,
		field: keyof ActualItemInput,
		value: string | number,
	) => {
		setActualItems((prev) =>
			prev.map((item) =>
				item.productId === productId
					? { ...item, [field]: value }
					: item,
			),
		);
	};

	const handleFileSelect = () => fileInputRef.current?.click();

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files) return;

		// Convert files to base64 or upload to server
		// For now, create object URLs for preview
		const newImages: string[] = [];
		Array.from(files).forEach((file) => {
			const url = URL.createObjectURL(file);
			newImages.push(url);
		});

		setInvoiceData((prev) => ({
			...prev,
			images: [...prev.images, ...newImages],
		}));

		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const handleRemoveImage = (index: number) => {
		setInvoiceData((prev) => ({
			...prev,
			images: prev.images.filter((_, i) => i !== index),
		}));
	};

	const validateForm = (): boolean => {
		// Check invoice info
		if (!invoiceData.invoiceNumber.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập số hóa đơn",
				status: "error",
				duration: 3000,
			});
			return false;
		}

		if (!invoiceData.invoiceDate) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập ngày hóa đơn",
				status: "error",
				duration: 3000,
			});
			return false;
		}

		// Check each item
		for (const item of actualItems) {
			if (item.quantityReceived <= 0) {
				toast({
					title: "Lỗi",
					description: `Số lượng nhận của "${item.productName}" phải lớn hơn 0`,
					status: "error",
					duration: 3000,
				});
				return false;
			}

			if (item.importPrice <= 0) {
				toast({
					title: "Lỗi",
					description: `Giá nhập của "${item.productName}" phải lớn hơn 0`,
					status: "error",
					duration: 3000,
				});
				return false;
			}

			if (!item.expirationDate) {
				toast({
					title: "Lỗi",
					description: `Vui lòng nhập hạn sử dụng cho "${item.productName}"`,
					status: "error",
					duration: 3000,
				});
				return false;
			}
		}

		return true;
	};

	const handleConfirm = async () => {
		if (!purchase || !validateForm()) return;

		setIsSubmitting(true);

		try {
			// Helper function to convert date to backend format (dd-MM-yyyy)
			const toBackendDateFormat = (date: Date | string): string => {
				const d = typeof date === "string" ? new Date(date) : date;
				const day = String(d.getDate()).padStart(2, "0");
				const month = String(d.getMonth() + 1).padStart(2, "0");
				const year = d.getFullYear();
				return `${day}-${month}-${year}`;
			};

			// Convert HTML date input (yyyy-MM-dd) to backend format (dd-MM-yyyy)
			const convertInputDate = (dateString: string): string => {
				if (!dateString) return "";
				const [year, month, day] = dateString.split("-");
				return `${day}-${month}-${year}`;
			};

			const requestData: ConfirmReceiptRequest = {
				staffIdChecked: staffId,
				checkDate: toBackendDateFormat(new Date()), // Convert to dd-MM-yyyy
				notes: notes || undefined,
				invoice: {
					invoiceNumber: invoiceData.invoiceNumber,
					invoiceDate: convertInputDate(invoiceData.invoiceDate), // Convert yyyy-MM-dd to dd-MM-yyyy
					images: invoiceData.images,
				},
				actualItems: actualItems.map((item) => ({
					productId: item.productId,
					quantityReceived: item.quantityReceived,
					importPrice: item.importPrice,
					manufactureDate: item.manufactureDate
						? convertInputDate(item.manufactureDate)
						: toBackendDateFormat(new Date()), // Convert to dd-MM-yyyy
					expirationDate: convertInputDate(item.expirationDate), // Convert yyyy-MM-dd to dd-MM-yyyy
					notes: item.notes || undefined,
				})),
			};

			const result = await onConfirm(purchase._id, requestData);

			if (result) {
				setLotsToPrint(result.lotsToPrint);
				toast({
					title: "Thành công",
					description: "Đã xác nhận nhận hàng và cập nhật kho",
					status: "success",
					duration: 3000,
				});
			}
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể xác nhận nhận hàng",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN").format(amount);
	};

	const calculateTotal = () => {
		return actualItems.reduce(
			(sum, item) => sum + item.quantityReceived * item.importPrice,
			0,
		);
	};

	// Show labels to print after successful confirmation
	if (lotsToPrint) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleClose}
				size="4xl"
				scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader
						fontSize="20px"
						fontWeight="700"
						color="green.600">
						Nhận hàng thành công!
					</ModalHeader>
					<ModalCloseButton />

					<ModalBody>
						<VStack
							spacing={6}
							align="stretch">
							<Box
								bg="green.50"
								p={4}
								borderRadius="8px"
								borderLeft="4px solid"
								borderColor="green.500">
								<Text
									fontWeight="600"
									color="green.700"
									mb={2}>
									Đơn hàng đã được xác nhận và kho đã được cập
									nhật
								</Text>
								<Text
									fontSize="14px"
									color="gray.600">
									Vui lòng in tem cho các lô hàng bên dưới
								</Text>
							</Box>

							<Box>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Danh sách tem cần in ({lotsToPrint.length})
								</Text>
								<Box
									border="1px solid"
									borderColor="gray.200"
									borderRadius="8px"
									overflow="hidden">
									<Table size="sm">
										<Thead bg="gray.50">
											<Tr>
												<Th>Mã lô</Th>
												<Th>Tên sản phẩm</Th>
												<Th isNumeric>Số tem</Th>
												<Th>Hạn sử dụng</Th>
											</Tr>
										</Thead>
										<Tbody>
											{lotsToPrint.map((lot) => (
												<Tr key={lot.lotId}>
													<Td>
														<Badge
															colorScheme="blue"
															fontSize="12px">
															{lot.lotId}
														</Badge>
													</Td>
													<Td fontSize="13px">
														{lot.productName}
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														fontWeight="600"
														color="green.600">
														{lot.quantity}
													</Td>
													<Td fontSize="13px">
														{lot.expirationDate}
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</Box>
							</Box>
						</VStack>
					</ModalBody>

					<ModalFooter>
						<Button
							colorScheme="green"
							onClick={() => {
								// TODO: Implement print labels
								toast({
									title: "Thông báo",
									description:
										"Tính năng in tem đang phát triển",
									status: "info",
									duration: 2000,
								});
							}}
							mr={3}>
							In tem
						</Button>
						<Button
							variant="ghost"
							onClick={handleClose}>
							Đóng
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		);
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="6xl"
			scrollBehavior="inside">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader
					fontSize="20px"
					fontWeight="700"
					color="gray.800">
					Xác nhận nhận hàng
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					{isLoading ? (
						<Flex
							justify="center"
							align="center"
							py={10}>
							<Spinner
								size="lg"
								color="brand.500"
							/>
						</Flex>
					) : !purchase ? (
						<Text
							textAlign="center"
							py={10}
							color="gray.500">
							Không tìm thấy thông tin đơn hàng
						</Text>
					) : (
						<VStack
							spacing={6}
							align="stretch">
							{/* Purchase Info */}
							<Box
								bg="blue.50"
								p={4}
								borderRadius="8px"
								borderLeft="4px solid"
								borderColor="blue.500">
								<HStack
									justify="space-between"
									flexWrap="wrap"
									gap={2}>
									<Box>
										<Text
											fontWeight="600"
											color="blue.700">
											Đơn hàng: {purchase.poCode}
										</Text>
										<Text
											fontSize="14px"
											color="gray.600">
											Nhà cung cấp:{" "}
											{purchase.supplier.supplierName}
										</Text>
									</Box>
									<Box textAlign="right">
										<Text
											fontSize="14px"
											color="gray.600">
											Số sản phẩm: {purchase.items.length}
										</Text>
									</Box>
								</HStack>
							</Box>

							{/* Invoice Info */}
							<Box>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={4}>
									Thông tin hóa đơn từ NCC
								</Text>
								<VStack spacing={4}>
									<HStack
										spacing={4}
										w="full">
										<FormControl
											flex={1}
											isRequired>
											<FormLabel fontSize="14px">
												Số hóa đơn
											</FormLabel>
											<Input
												value={
													invoiceData.invoiceNumber
												}
												onChange={(e) =>
													setInvoiceData((prev) => ({
														...prev,
														invoiceNumber:
															e.target.value,
													}))
												}
												placeholder="VD: HD_1234"
											/>
										</FormControl>
										<FormControl
											flex={1}
											isRequired>
											<FormLabel fontSize="14px">
												Ngày hóa đơn
											</FormLabel>
											<Input
												type="date"
												value={invoiceData.invoiceDate}
												onChange={(e) =>
													setInvoiceData((prev) => ({
														...prev,
														invoiceDate:
															e.target.value,
													}))
												}
											/>
										</FormControl>
									</HStack>

									{/* Invoice images */}
									<FormControl>
										<FormLabel fontSize="14px">
											Ảnh hóa đơn
										</FormLabel>
										<HStack spacing={3}>
											<Button
												leftIcon={
													<Icon as={BsCamera} />
												}
												colorScheme="gray"
												variant="outline"
												onClick={handleFileSelect}>
												Chụp/Chọn ảnh
											</Button>
											<input
												ref={fileInputRef}
												type="file"
												accept="image/*"
												multiple
												style={{ display: "none" }}
												onChange={handleFileChange}
											/>
										</HStack>
										{invoiceData.images.length > 0 && (
											<SimpleGrid
												columns={4}
												spacing={2}
												mt={3}>
												{invoiceData.images.map(
													(img, index) => (
														<Box
															key={index}
															position="relative">
															<Image
																src={img}
																alt={`Invoice ${index + 1}`}
																borderRadius="md"
																h="80px"
																w="100%"
																objectFit="cover"
															/>
															<IconButton
																aria-label="Remove image"
																icon={
																	<DeleteIcon />
																}
																size="xs"
																colorScheme="red"
																position="absolute"
																top={1}
																right={1}
																onClick={() =>
																	handleRemoveImage(
																		index,
																	)
																}
															/>
														</Box>
													),
												)}
											</SimpleGrid>
										)}
									</FormControl>
								</VStack>
							</Box>

							<Divider />

							{/* Actual Items */}
							<Box>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Chi tiết sản phẩm nhận
								</Text>
								<Box
									border="1px solid"
									borderColor="gray.200"
									borderRadius="8px"
									overflow="hidden"
									overflowX="auto">
									<Table size="sm">
										<Thead bg="gray.50">
											<Tr>
												<Th
													fontSize="12px"
													minW="180px">
													Tên sản phẩm
												</Th>
												<Th
													fontSize="12px"
													isNumeric
													minW="80px">
													SL đặt
												</Th>
												<Th
													fontSize="12px"
													isNumeric
													minW="100px">
													SL nhận *
												</Th>
												<Th
													fontSize="12px"
													isNumeric
													minW="120px">
													Giá nhập *
												</Th>
												<Th
													fontSize="12px"
													minW="130px">
													Ngày SX
												</Th>
												<Th
													fontSize="12px"
													minW="130px">
													Hạn SD *
												</Th>
												<Th
													fontSize="12px"
													isNumeric
													minW="120px">
													Thành tiền
												</Th>
												<Th
													fontSize="12px"
													minW="150px">
													Ghi chú
												</Th>
											</Tr>
										</Thead>
										<Tbody>
											{actualItems.map((item) => (
												<Tr key={item.productId}>
													<Td fontSize="13px">
														{item.productName}
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														color="gray.500">
														{item.quantityOrdered}
													</Td>
													<Td isNumeric>
														<NumberInput
															size="sm"
															value={
																item.quantityReceived
															}
															onChange={(
																_,
																val,
															) =>
																handleItemChange(
																	item.productId,
																	"quantityReceived",
																	val || 0,
																)
															}
															min={0}
															max={
																item.quantityOrdered *
																2
															}
															maxW="80px">
															<NumberInputField
																textAlign="right"
																fontSize="13px"
															/>
														</NumberInput>
													</Td>
													<Td isNumeric>
														<Input
															size="sm"
															value={
																displayPrices[
																	item
																		.productId
																] || ""
															}
															onChange={(e) =>
																handlePriceInputChange(
																	item.productId,
																	e,
																)
															}
															placeholder="0"
															textAlign="right"
															fontSize="13px"
															maxW="100px"
														/>
													</Td>
													<Td>
														<Input
															type="date"
															size="sm"
															value={
																item.manufactureDate
															}
															onChange={(e) =>
																handleItemChange(
																	item.productId,
																	"manufactureDate",
																	e.target
																		.value,
																)
															}
															fontSize="13px"
														/>
													</Td>
													<Td>
														<Input
															type="date"
															size="sm"
															value={
																item.expirationDate
															}
															onChange={(e) =>
																handleItemChange(
																	item.productId,
																	"expirationDate",
																	e.target
																		.value,
																)
															}
															fontSize="13px"
														/>
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														fontWeight="600">
														{formatCurrency(
															item.quantityReceived *
																item.importPrice,
														)}
													</Td>
													<Td>
														<Input
															size="sm"
															value={item.notes}
															onChange={(e) =>
																handleItemChange(
																	item.productId,
																	"notes",
																	e.target
																		.value,
																)
															}
															placeholder="VD: Thiếu 2, hư 1..."
															fontSize="13px"
														/>
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</Box>

								{/* Total */}
								<Flex
									justify="flex-end"
									mt={4}
									p={3}
									bg="gray.50"
									borderRadius="md">
									<HStack spacing={4}>
										<Text
											fontSize="16px"
											fontWeight="600">
											Tổng tiền:
										</Text>
										<Text
											fontSize="20px"
											fontWeight="700"
											color="brand.500">
											{formatCurrency(calculateTotal())}{" "}
											VNĐ
										</Text>
									</HStack>
								</Flex>
							</Box>

							<Divider />

							{/* Notes */}
							<FormControl>
								<FormLabel fontSize="14px">
									Ghi chú kiểm hàng
								</FormLabel>
								<Textarea
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="VD: Hàng đủ, không hư hỏng..."
									rows={2}
								/>
							</FormControl>
						</VStack>
					)}
				</ModalBody>

				<ModalFooter
					borderTop="1px solid"
					borderColor="gray.200">
					<Button
						variant="ghost"
						mr={3}
						onClick={handleClose}>
						Hủy
					</Button>
					<Button
						colorScheme="green"
						leftIcon={<CheckIcon />}
						onClick={handleConfirm}
						isLoading={isSubmitting}
						isDisabled={!purchase || isLoading}>
						Xác nhận nhận hàng
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
