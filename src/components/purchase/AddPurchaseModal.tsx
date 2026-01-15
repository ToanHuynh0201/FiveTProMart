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
	Text,
	Divider,
	Spinner,
	Flex,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import type {
	Supplier,
	SupplierProduct,
	CreateDraftRequest,
} from "@/types/purchase";

interface DraftItem {
	productId: string;
	productName: string;
	quantityOrdered: number;
}

interface AddPurchaseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSaveDraft: (data: CreateDraftRequest) => Promise<void>;
	suppliers: Supplier[];
	supplierProducts: SupplierProduct[];
	isLoadingProducts: boolean;
	onSupplierChange: (supplierId: string) => void;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
	isOpen,
	onClose,
	onSaveDraft,
	suppliers,
	supplierProducts,
	isLoadingProducts,
	onSupplierChange,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [items, setItems] = useState<DraftItem[]>([]);
	const [formData, setFormData] = useState({
		supplierId: "",
		notes: "",
	});

	// New item form
	const [newItem, setNewItem] = useState({
		productId: "",
		quantityOrdered: 0,
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				supplierId: "",
				notes: "",
			});
			setItems([]);
			resetNewItem();
		}
	}, [isOpen]);

	const resetNewItem = () => {
		setNewItem({
			productId: "",
			quantityOrdered: 0,
		});
	};

	const handleSupplierChange = (supplierId: string) => {
		setFormData({ ...formData, supplierId });
		setItems([]); // Clear items when supplier changes
		onSupplierChange(supplierId);
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

		if (newItem.quantityOrdered <= 0) {
			toast({
				title: "Lỗi",
				description: "Số lượng phải lớn hơn 0",
				status: "error",
				duration: 2000,
			});
			return;
		}

		// Check if product already added
		if (items.some((item) => item.productId === newItem.productId)) {
			toast({
				title: "Lỗi",
				description: "Sản phẩm đã được thêm",
				status: "error",
				duration: 2000,
			});
			return;
		}

		// Find selected product
		const product = supplierProducts.find(
			(p) => p.productId === newItem.productId,
		);
		if (!product) return;

		const item: DraftItem = {
			productId: newItem.productId,
			productName: product.productName,
			quantityOrdered: newItem.quantityOrdered,
		};

		setItems([...items, item]);
		resetNewItem();
	};

	const handleRemoveItem = (productId: string) => {
		setItems(items.filter((item) => item.productId !== productId));
	};

	const handleUpdateQuantity = (productId: string, quantity: number) => {
		setItems(
			items.map((item) =>
				item.productId === productId
					? { ...item, quantityOrdered: quantity }
					: item,
			),
		);
	};

	const handleSaveDraft = async () => {
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

		const draftData: CreateDraftRequest = {
			supplierId: formData.supplierId,
			notes: formData.notes || undefined,
			items: items.map((item) => ({
				productId: item.productId,
				quantityOrdered: item.quantityOrdered,
			})),
		};

		setIsLoading(true);

		try {
			await onSaveDraft(draftData);
			toast({
				title: "Thành công",
				description: "Đã tạo đơn nhập hàng nháp",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tạo đơn",
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
			size="4xl"
			scrollBehavior="inside">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader
					fontSize="20px"
					fontWeight="700"
					color="gray.800">
					Tạo đơn nhập hàng
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
								Thông tin đơn hàng
							</Text>
							<VStack spacing={4}>
								<FormControl isRequired>
									<FormLabel fontSize="14px">
										Nhà cung cấp
									</FormLabel>
									<Select
										value={formData.supplierId}
										onChange={(e) =>
											handleSupplierChange(e.target.value)
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

								<FormControl>
									<FormLabel fontSize="14px">Ghi chú</FormLabel>
									<Textarea
										value={formData.notes}
										onChange={(e) =>
											setFormData({
												...formData,
												notes: e.target.value,
											})
										}
										placeholder="Nhập ghi chú (nếu có)"
										rows={2}
									/>
								</FormControl>
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
											w="full"
											align="flex-end">
											<FormControl
												flex={3}
												isRequired>
												<FormLabel
													fontSize="13px"
													mb={1}>
													Sản phẩm
												</FormLabel>
												<Select
													placeholder="Chọn sản phẩm"
													value={newItem.productId}
													onChange={(e) =>
														setNewItem({
															...newItem,
															productId:
																e.target.value,
														})
													}
													size="sm">
													{supplierProducts
														.filter(
															(p) =>
																!items.some(
																	(item) =>
																		item.productId ===
																		p.productId,
																),
														)
														.map((product) => (
															<option
																key={
																	product.productId
																}
																value={
																	product.productId
																}>
																{
																	product.productName
																}
																{product.productCode &&
																	` - ${product.productCode}`}
																{product.unit &&
																	` (${product.unit})`}
															</option>
														))}
												</Select>
											</FormControl>
											<FormControl
												flex={1}
												isRequired>
												<FormLabel
													fontSize="13px"
													mb={1}>
													Số lượng
												</FormLabel>
												<NumberInput
													value={newItem.quantityOrdered}
													onChange={(_, val) =>
														setNewItem({
															...newItem,
															quantityOrdered: val || 0,
														})
													}
													min={1}
													size="sm">
													<NumberInputField placeholder="0" />
												</NumberInput>
											</FormControl>
											<Button
												leftIcon={<AddIcon />}
												colorScheme="blue"
												onClick={handleAddItem}
												size="sm"
												isDisabled={
													!newItem.productId ||
													newItem.quantityOrdered <= 0
												}>
												Thêm
											</Button>
										</HStack>
									</VStack>
								)}
							</Box>
						)}

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
												<Th>STT</Th>
												<Th>Tên sản phẩm</Th>
												<Th isNumeric>Số lượng</Th>
												<Th></Th>
											</Tr>
										</Thead>
										<Tbody>
											{items.map((item, index) => (
												<Tr key={item.productId}>
													<Td fontSize="13px">
														{index + 1}
													</Td>
													<Td fontSize="13px">
														{item.productName}
													</Td>
													<Td isNumeric>
														<NumberInput
															size="sm"
															value={
																item.quantityOrdered
															}
															onChange={(_, val) =>
																handleUpdateQuantity(
																	item.productId,
																	val || 0,
																)
															}
															min={1}
															maxW="80px">
															<NumberInputField
																textAlign="right"
																fontSize="13px"
															/>
														</NumberInput>
													</Td>
													<Td>
														<IconButton
															aria-label="Remove"
															icon={<DeleteIcon />}
															size="xs"
															colorScheme="red"
															variant="ghost"
															onClick={() =>
																handleRemoveItem(
																	item.productId,
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
						onClick={handleSaveDraft}
						isLoading={isLoading}
						isDisabled={!formData.supplierId || items.length === 0}>
						Tạo đơn nháp
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
