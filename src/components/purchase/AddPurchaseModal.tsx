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
	useToast,
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	IconButton,
	Flex,
	Text,
	Divider,
	Spinner,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import type { Purchase, PurchaseItem, Supplier } from "../../types/purchase";
import { purchaseService } from "../../services/purchaseService";
import { supplierService } from "../../services/supplierService";

interface AddPurchaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (
		purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt">,
	) => Promise<void>;
	suppliers: Supplier[];
	initialItems?: PurchaseItem[]; // Items từ Excel import
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
	isOpen,
	onClose,
	onAdd,
	suppliers,
	initialItems = [],
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [items, setItems] = useState<PurchaseItem[]>([]);
	const [supplierProducts, setSupplierProducts] = useState<any[]>([]);
	const [isLoadingProducts, setIsLoadingProducts] = useState(false);
	const [formData, setFormData] = useState({
		purchaseNumber: "",
		supplierId: "",
		tax: 0,
		shippingFee: 0,
		discount: 0,
		notes: "",
	});

	// New item form
	const [newItem, setNewItem] = useState({
		productId: "",
		quantity: 0,
	});

	useEffect(() => {
		if (isOpen) {
			// Generate purchase number
			const purchaseNumber = purchaseService.generatePurchaseNumber();
			setFormData((prev) => ({ ...prev, purchaseNumber }));

			// Set initial items from Excel if provided
			if (initialItems.length > 0) {
				setItems(initialItems);
			}
		} else {
			// Reset form
			setFormData({
				purchaseNumber: "",
				supplierId: "",
				tax: 0,
				shippingFee: 0,
				discount: 0,
				notes: "",
			});
			setItems([]);
			setSupplierProducts([]);
			resetNewItem();
		}
	}, [isOpen, initialItems]);

	const resetNewItem = () => {
		setNewItem({
			productId: "",
			quantity: 0,
		});
	};

	const handleSupplierChange = async (supplierId: string) => {
		setFormData({ ...formData, supplierId });

		if (!supplierId) {
			setSupplierProducts([]);
			return;
		}

		// Load supplier's products
		setIsLoadingProducts(true);
		try {
			const supplierDetail = await supplierService.getSupplierById(
				supplierId,
			);
			if (supplierDetail?.products) {
				setSupplierProducts(supplierDetail.products);
			}
		} catch (error) {
			console.error("Error loading supplier products:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải danh sách sản phẩm",
				status: "error",
				duration: 2000,
			});
		} finally {
			setIsLoadingProducts(false);
		}
	};

	const handleAddItem = () => {
		if (!newItem.productId) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn sản phẩm",
				status: "error",
				duration: 2000,
			});
			return;
		}

		if (newItem.quantity <= 0) {
			toast({
				title: "Lỗi",
				description: "Số lượng phải lớn hơn 0",
				status: "error",
				duration: 2000,
			});
			return;
		}

		// Find selected product
		const product = supplierProducts.find(
			(p) => p.id === newItem.productId,
		);
		if (!product) return;

		const item: PurchaseItem = {
			id: `temp_${Date.now()}`,
			productCode: product.productCode,
			productName: product.productName,
			category: product.category,
			unit: product.unit,
			quantity: newItem.quantity,
			unitPrice: product.lastPurchasePrice || 0,
			totalPrice: newItem.quantity * (product.lastPurchasePrice || 0),
		};

		setItems([...items, item]);
		resetNewItem();
	};

	const handleRemoveItem = (id: string) => {
		setItems(items.filter((item) => item.id !== id));
	};

	const calculateTotals = () => {
		const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
		const total =
			subtotal + formData.tax + formData.shippingFee - formData.discount;
		return { subtotal, total };
	};

	const handleSubmit = async () => {
		if (!formData.supplierId) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn nhà cung cấp",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (items.length === 0) {
			toast({
				title: "Lỗi",
				description: "Vui lòng thêm ít nhất 1 sản phẩm",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);

		try {
			const supplier = suppliers.find(
				(s) => s.id === formData.supplierId,
			)!;
			const { subtotal, total } = calculateTotals();

			const purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt"> = {
				purchaseNumber: formData.purchaseNumber,
				supplier,
				items,
				subtotal,
				tax: formData.tax,
				shippingFee: formData.shippingFee,
				discount: formData.discount,
				total,
				paymentStatus: "unpaid",
				paidAmount: 0,
				notes: formData.notes,
				warehouseLocation: "Kho A",
				status: "ordered",
				staff: {
					id: "staff_1",
					name: "Nguyễn Văn A",
				},
			};

			await onAdd(purchase);
			toast({
				title: "Thành công",
				description: "Tạo phiếu nhập hàng thành công",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tạo phiếu nhập",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN").format(amount);
	};

	const { subtotal, total } = calculateTotals();

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="6xl"
			scrollBehavior="inside">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader
					fontSize="20px"
					fontWeight="700"
					color="gray.800">
					Tạo phiếu nhập hàng
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					<VStack
						spacing={6}
						align="stretch">
						{/* Thông tin cơ bản */}
						<Box>
							<Text
								fontSize="16px"
								fontWeight="600"
								color="gray.700"
								mb={4}>
								Thông tin phiếu nhập
							</Text>
							<VStack spacing={4}>
								<HStack
									spacing={4}
									w="full">
									<FormControl>
										<FormLabel fontSize="14px">
											Mã phiếu nhập
										</FormLabel>
										<Input
											value={formData.purchaseNumber}
											isReadOnly
											bg="gray.100"
										/>
									</FormControl>
									<FormControl isRequired>
										<FormLabel fontSize="14px">
											Nhà cung cấp
										</FormLabel>
										<Select
											value={formData.supplierId}
											onChange={(e) =>
												handleSupplierChange(
													e.target.value,
												)
											}
											placeholder="Chọn nhà cung cấp">
											{suppliers.map((supplier) => (
												<option
													key={supplier.id}
													value={supplier.id}>
													{supplier.name}
												</option>
											))}
										</Select>
									</FormControl>
								</HStack>
							</VStack>
						</Box>
						<Divider />
						{/* Thêm sản phẩm */}
						{formData.supplierId && (
							<Box>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={4}>
									Thêm sản phẩm
								</Text>
								{isLoadingProducts ? (
									<Flex
										justify="center"
										py={4}>
										<Spinner
											size="md"
											color="brand.500"
										/>
									</Flex>
								) : supplierProducts.length === 0 ? (
									<Text
										color="gray.500"
										textAlign="center"
										py={4}>
										Nhà cung cấp này chưa có sản phẩm nào
									</Text>
								) : (
									<VStack spacing={3}>
										<HStack
											spacing={3}
											w="full">
											<FormControl flex={2}>
												<Select
													placeholder="Chọn sản phẩm *"
													value={newItem.productId}
													onChange={(e) =>
														setNewItem({
															...newItem,
															productId:
																e.target.value,
														})
													}>
													{supplierProducts.map(
														(product) => (
															<option
																key={product.id}
																value={
																	product.id
																}>
																{
																	product.productName
																}{" "}
																-{" "}
																{
																	product.productCode
																}{" "}
																({product.unit})
															</option>
														),
													)}
												</Select>
											</FormControl>
											<FormControl flex={1}>
												<NumberInput
													value={newItem.quantity}
													onChange={(_, val) =>
														setNewItem({
															...newItem,
															quantity: val,
														})
													}
													min={0}>
													<NumberInputField placeholder="Số lượng *" />
												</NumberInput>
											</FormControl>
											<Button
												colorScheme="brand"
												leftIcon={<AddIcon />}
												onClick={handleAddItem}
												flexShrink={0}
												isDisabled={
													!newItem.productId ||
													newItem.quantity <= 0
												}>
												Thêm
											</Button>
										</HStack>
										{newItem.productId && (
											<Box
												w="full"
												bg="blue.50"
												p={3}
												borderRadius="md">
												<Text
													fontSize="13px"
													color="gray.700">
													<strong>
														Giá nhập gần nhất:
													</strong>{" "}
													{formatCurrency(
														supplierProducts.find(
															(p) =>
																p.id ===
																newItem.productId,
														)?.lastPurchasePrice ||
															0,
													)}
													đ/
													{
														supplierProducts.find(
															(p) =>
																p.id ===
																newItem.productId,
														)?.unit
													}
												</Text>
											</Box>
										)}
									</VStack>
								)}
							</Box>
						)}{" "}
						{/* Danh sách sản phẩm */}
						{items.length > 0 && (
							<Box>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Danh sách sản phẩm ({items.length})
								</Text>
								<Box
									border="1px solid"
									borderColor="gray.200"
									borderRadius="8px"
									overflow="hidden">
									<Table size="sm">
										<Thead bg="gray.50">
											<Tr>
												<Th>Mã SP</Th>
												<Th>Tên sản phẩm</Th>
												<Th>Đơn vị</Th>
												<Th isNumeric>Số lượng</Th>
												<Th isNumeric>Đơn giá</Th>
												<Th isNumeric>Thành tiền</Th>
												<Th></Th>
											</Tr>
										</Thead>
										<Tbody>
											{items.map((item) => (
												<Tr key={item.id}>
													<Td fontSize="13px">
														{item.productCode}
													</Td>
													<Td fontSize="13px">
														{item.productName}
													</Td>
													<Td fontSize="13px">
														{item.unit}
													</Td>
													<Td
														isNumeric
														fontSize="13px">
														{item.quantity}
													</Td>
													<Td
														isNumeric
														fontSize="13px">
														{formatCurrency(
															item.unitPrice,
														)}
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														fontWeight="600">
														{formatCurrency(
															item.totalPrice,
														)}
													</Td>
													<Td>
														<IconButton
															aria-label="Remove"
															icon={
																<DeleteIcon />
															}
															size="xs"
															colorScheme="red"
															variant="ghost"
															onClick={() =>
																handleRemoveItem(
																	item.id,
																)
															}
														/>
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</Box>
							</Box>
						)}
						<Divider />
						{/* Thông tin thanh toán */}
						<Box>
							<Text
								fontSize="16px"
								fontWeight="600"
								color="gray.700"
								mb={4}>
								Thông tin thanh toán
							</Text>
							<VStack spacing={3}>
								<HStack
									spacing={4}
									w="full">
									<FormControl>
										<FormLabel fontSize="14px">
											Thuế VAT
										</FormLabel>
										<NumberInput
											value={formData.tax}
											onChange={(_, val) =>
												setFormData({
													...formData,
													tax: val,
												})
											}
											min={0}>
											<NumberInputField />
										</NumberInput>
									</FormControl>
									<FormControl>
										<FormLabel fontSize="14px">
											Phí vận chuyển
										</FormLabel>
										<NumberInput
											value={formData.shippingFee}
											onChange={(_, val) =>
												setFormData({
													...formData,
													shippingFee: val,
												})
											}
											min={0}>
											<NumberInputField />
										</NumberInput>
									</FormControl>
									<FormControl>
										<FormLabel fontSize="14px">
											Giảm giá
										</FormLabel>
										<NumberInput
											value={formData.discount}
											onChange={(_, val) =>
												setFormData({
													...formData,
													discount: val,
												})
											}
											min={0}>
											<NumberInputField />
										</NumberInput>
									</FormControl>
								</HStack>

								<FormControl>
									<FormLabel fontSize="14px">
										Ghi chú
									</FormLabel>
									<Textarea
										value={formData.notes}
										onChange={(e) =>
											setFormData({
												...formData,
												notes: e.target.value,
											})
										}
										placeholder="Nhập ghi chú (nếu có)"
										rows={3}
									/>
								</FormControl>

								{/* Tổng tiền */}
								<Box
									w="full"
									bg="gray.50"
									p={4}
									borderRadius="8px">
									<Flex
										justify="space-between"
										mb={2}>
										<Text fontSize="14px">
											Tổng tiền hàng:
										</Text>
										<Text
											fontSize="14px"
											fontWeight="600">
											{formatCurrency(subtotal)}
										</Text>
									</Flex>
									<Flex
										justify="space-between"
										mb={2}>
										<Text fontSize="14px">Thuế VAT:</Text>
										<Text fontSize="14px">
											{formatCurrency(formData.tax)}
										</Text>
									</Flex>
									<Flex
										justify="space-between"
										mb={2}>
										<Text fontSize="14px">
											Phí vận chuyển:
										</Text>
										<Text fontSize="14px">
											{formatCurrency(
												formData.shippingFee,
											)}
										</Text>
									</Flex>
									<Flex
										justify="space-between"
										mb={3}>
										<Text fontSize="14px">Giảm giá:</Text>
										<Text
											fontSize="14px"
											color="red.500">
											-{formatCurrency(formData.discount)}
										</Text>
									</Flex>
									<Divider
										borderColor="gray.300"
										mb={3}
									/>
									<Flex justify="space-between">
										<Text
											fontSize="16px"
											fontWeight="700">
											Tổng thanh toán:
										</Text>
										<Text
											fontSize="20px"
											fontWeight="700"
											color="brand.500">
											{formatCurrency(total)}
										</Text>
									</Flex>
								</Box>
							</VStack>
						</Box>
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button
						variant="ghost"
						mr={3}
						onClick={onClose}>
						Hủy
					</Button>
					<Button
						colorScheme="brand"
						onClick={handleSubmit}
						isLoading={isLoading}>
						Tạo phiếu nhập
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
