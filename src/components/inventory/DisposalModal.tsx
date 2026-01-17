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
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	IconButton,
	Input,
	Select,
	Text,
	Box,
	HStack,
	VStack,
	useToast,
	Textarea,
	Badge,
	Flex,
	Tooltip,
	Checkbox,
	useDisclosure,
	Tabs,
	TabList,
	Tab,
	TabPanels,
	TabPanel,
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
	AccordionIcon,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import type {
	DisposalItem,
	InventoryProduct,
	ProductBatch,
	DisposalRecord,
} from "@/types/inventory";
import { formatDate, isExpired } from "@/utils/date";
import apiService from "@/lib/api";

interface DisposalModalProps {
	isOpen: boolean;
	onClose: () => void;
	products: InventoryProduct[];
	onSubmit: (items: DisposalItem[], note: string) => Promise<void>;
}

const DisposalModal = ({
	isOpen,
	onClose,
	products,
	onSubmit,
}: DisposalModalProps) => {
	const toast = useToast();
	const [disposalItems, setDisposalItems] = useState<DisposalItem[]>([]);
	const [note, setNote] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showExpiredList, setShowExpiredList] = useState(false);
	const [selectedExpiredBatches, setSelectedExpiredBatches] = useState<
		Set<string>
	>(new Set());

	// Modal thêm sản phẩm
	const {
		isOpen: isAddModalOpen,
		onOpen: onAddModalOpen,
		onClose: onAddModalClose,
	} = useDisclosure();
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedBatches, setSelectedBatches] = useState<
		Map<string, { quantity: number; reason: string }>
	>(new Map());

	// Disposal history
	const [disposalHistory, setDisposalHistory] = useState<DisposalRecord[]>(
		[],
	);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);

	// Load disposal history
	const loadDisposalHistory = async () => {
		setIsLoadingHistory(true);
		try {
			// Disposal history API not yet implemented - will show empty state
			// When backend adds GET /stock-inventories/disposals, wire here
			const response = await apiService.get<{ data: DisposalRecord[] }>("/stock-inventories/disposals");
			setDisposalHistory(response.data || []);
		} catch {
			// API not available - show empty state without error
			setDisposalHistory([]);
		} finally {
			setIsLoadingHistory(false);
		}
	};

	// Khi modal mở, reset state
	useEffect(() => {
		if (isOpen) {
			setDisposalItems([]);
			setNote("");
			setShowExpiredList(false);
			setSelectedExpiredBatches(new Set());
			loadDisposalHistory();
		}
	}, [isOpen]);

	// Khi modal thêm sản phẩm mở, reset state
	useEffect(() => {
		if (isAddModalOpen) {
			setSearchQuery("");
			setSelectedBatches(new Map());
		}
	}, [isAddModalOpen]);

	// Lấy tất cả lô hàng đã hết hạn
	const getExpiredBatches = (): DisposalItem[] => {
		const expiredItems: DisposalItem[] = [];

		products.forEach((product) => {
			if (product.batches && product.batches.length > 0) {
				product.batches.forEach((batch) => {
					if (
						batch.quantity > 0 &&
						batch.expiryDate &&
						isExpired(batch.expiryDate)
					) {
						expiredItems.push({
							id: `${product.id}-${
								batch.id
							}-${Date.now()}-${Math.random()}`,
							productId: product.id,
							productName: product.name,
							productCode: product.code,
							batchId: batch.id,
							batchNumber: batch.batchNumber,
							quantity: batch.quantity,
							maxQuantity: batch.quantity,
							costPrice: batch.costPrice,
							expiryDate: batch.expiryDate,
							reason: "expired",
						});
					}
				});
			}
		});

		return expiredItems;
	};

	// Toggle checkbox cho lô hết hạn
	const handleToggleExpiredBatch = (batchKey: string) => {
		const newSelected = new Set(selectedExpiredBatches);
		if (newSelected.has(batchKey)) {
			newSelected.delete(batchKey);
		} else {
			newSelected.add(batchKey);
		}
		setSelectedExpiredBatches(newSelected);
	};

	// Toggle tất cả checkbox
	const handleToggleAllExpiredBatches = () => {
		const expiredBatches = getExpiredBatches();
		if (selectedExpiredBatches.size === expiredBatches.length) {
			setSelectedExpiredBatches(new Set());
		} else {
			const allKeys = new Set(
				expiredBatches.map((b) => `${b.productId}-${b.batchId}`),
			);
			setSelectedExpiredBatches(allKeys);
		}
	};

	// Thêm các lô hết hạn đã chọn vào danh sách hủy
	const handleAddSelectedExpiredBatches = () => {
		if (selectedExpiredBatches.size === 0) {
			toast({
				title: "Chưa chọn lô hàng",
				description: "Vui lòng chọn ít nhất một lô hàng để thêm",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		const expiredBatches = getExpiredBatches();
		const existingBatchIds = new Set(
			disposalItems.map((item) => `${item.productId}-${item.batchId}`),
		);

		const newBatches = expiredBatches.filter((batch) => {
			const batchKey = `${batch.productId}-${batch.batchId}`;
			return (
				selectedExpiredBatches.has(batchKey) &&
				!existingBatchIds.has(batchKey)
			);
		});

		if (newBatches.length === 0) {
			toast({
				title: "Thông báo",
				description: "Các lô đã chọn đều có trong danh sách rồi",
				status: "info",
				duration: 3000,
			});
			return;
		}

		setDisposalItems([...disposalItems, ...newBatches]);
		setSelectedExpiredBatches(new Set());
		toast({
			title: "Thành công",
			description: `Đã thêm ${newBatches.length} lô hàng`,
			status: "success",
			duration: 3000,
		});
	};

	// Lấy danh sách sản phẩm có lô hàng
	const getProductsWithBatches = () => {
		return products.filter((p) => p.batches && p.batches.length > 0);
	};

	// Lấy các lô hàng của một sản phẩm
	const getBatchesForProduct = (productId: string): ProductBatch[] => {
		const product = products.find((p) => p.id === productId);
		return product?.batches?.filter((b) => b.quantity > 0) || [];
	};

	// Thêm item mới vào danh sách hủy hàng - Mở modal
	const handleAddItem = () => {
		const productsWithBatches = getProductsWithBatches();
		if (productsWithBatches.length === 0) {
			toast({
				title: "Không có sản phẩm",
				description: "Không có sản phẩm nào có lô hàng để hủy",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		onAddModalOpen();
	};

	// Lọc sản phẩm theo search query
	const getFilteredProducts = () => {
		// Không hiển thị gì nếu chưa search
		if (!searchQuery.trim()) {
			return [];
		}

		const productsWithBatches = getProductsWithBatches();
		const query = searchQuery.toLowerCase();
		return productsWithBatches.filter(
			(product) =>
				product.name.toLowerCase().includes(query) ||
				product.code.toLowerCase().includes(query),
		);
	};

	// Toggle chọn/bỏ chọn lô hàng
	const handleToggleBatch = (
		productId: string,
		batchId: string,
		maxQuantity: number,
	) => {
		const key = `${productId}-${batchId}`;
		const newSelected = new Map(selectedBatches);

		if (newSelected.has(key)) {
			newSelected.delete(key);
		} else {
			// Tự động detect lý do dựa trên expiry date
			const product = products.find((p) => p.id === productId);
			const batch = product?.batches?.find((b) => b.id === batchId);
			const defaultReason =
				batch?.expiryDate && isExpired(batch.expiryDate)
					? "expired"
					: "other";

			newSelected.set(key, {
				quantity: maxQuantity,
				reason: defaultReason,
			});
		}

		setSelectedBatches(newSelected);
	};

	// Toggle tất cả lô hàng của một sản phẩm
	const handleToggleAllBatchesForProduct = (productId: string) => {
		const product = products.find((p) => p.id === productId);
		if (!product || !product.batches) return;

		const availableBatches = product.batches.filter((b) => b.quantity > 0);
		const allSelected = availableBatches.every((batch) =>
			selectedBatches.has(`${productId}-${batch.id}`),
		);

		const newSelected = new Map(selectedBatches);

		if (allSelected) {
			// Bỏ chọn tất cả
			availableBatches.forEach((batch) => {
				newSelected.delete(`${productId}-${batch.id}`);
			});
		} else {
			// Chọn tất cả
			availableBatches.forEach((batch) => {
				const key = `${productId}-${batch.id}`;
				if (!newSelected.has(key)) {
					const defaultReason =
						batch.expiryDate && isExpired(batch.expiryDate)
							? "expired"
							: "other";
					newSelected.set(key, {
						quantity: batch.quantity,
						reason: defaultReason,
					});
				}
			});
		}

		setSelectedBatches(newSelected);
	};

	// Cập nhật số lượng của lô hàng đã chọn
	const handleUpdateBatchQuantity = (
		productId: string,
		batchId: string,
		quantity: number,
	) => {
		const key = `${productId}-${batchId}`;
		const current = selectedBatches.get(key);
		if (!current) return;

		const newSelected = new Map(selectedBatches);
		newSelected.set(key, { ...current, quantity });
		setSelectedBatches(newSelected);
	};

	// Cập nhật lý do của lô hàng đã chọn
	const handleUpdateBatchReason = (
		productId: string,
		batchId: string,
		reason: string,
	) => {
		const key = `${productId}-${batchId}`;
		const current = selectedBatches.get(key);
		if (!current) return;

		const newSelected = new Map(selectedBatches);
		newSelected.set(key, { ...current, reason });
		setSelectedBatches(newSelected);
	};

	// Xác nhận thêm từ modal
	const handleConfirmAdd = () => {
		if (selectedBatches.size === 0) {
			toast({
				title: "Chưa chọn lô hàng",
				description: "Vui lòng chọn ít nhất một lô hàng để thêm",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		// Kiểm tra số lượng hợp lệ
		let hasInvalidQuantity = false;
		selectedBatches.forEach((value) => {
			if (value.quantity <= 0) {
				hasInvalidQuantity = true;
			}
		});

		if (hasInvalidQuantity) {
			toast({
				title: "Số lượng không hợp lệ",
				description: "Vui lòng nhập số lượng lớn hơn 0 cho tất cả các lô",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		// Tạo danh sách disposal items từ selected batches
		const newItems: DisposalItem[] = [];
		const existingBatchIds = new Set(
			disposalItems.map((item) => `${item.productId}-${item.batchId}`),
		);

		selectedBatches.forEach((value, key) => {
			if (existingBatchIds.has(key)) return; // Skip if already exists

			const [productId, batchId] = key.split("-");
			const product = products.find((p) => p.id === productId);
			const batch = product?.batches?.find((b) => b.id === batchId);

			if (product && batch) {
				newItems.push({
					id: `new-${Date.now()}-${Math.random()}`,
					productId: product.id,
					productName: product.name,
					productCode: product.code,
					batchId: batch.id,
					batchNumber: batch.batchNumber,
					quantity: value.quantity,
					maxQuantity: batch.quantity,
					costPrice: batch.costPrice,
					expiryDate: batch.expiryDate,
					reason: value.reason,
				});
			}
		});

		if (newItems.length === 0) {
			toast({
				title: "Thông báo",
				description: "Các lô đã chọn đều có trong danh sách rồi",
				status: "info",
				duration: 3000,
			});
			return;
		}

		setDisposalItems([...disposalItems, ...newItems]);
		onAddModalClose();
		toast({
			title: "Thành công",
			description: `Đã thêm ${newItems.length} lô hàng vào danh sách hủy`,
			status: "success",
			duration: 2000,
		});
	};

	// Xóa item khỏi danh sách
	const handleRemoveItem = (itemId: string) => {
		setDisposalItems(disposalItems.filter((item) => item.id !== itemId));
	};

	// Cập nhật số lượng
	const handleQuantityChange = (itemId: string, value: string) => {
		const quantity = parseInt(value) || 0;
		setDisposalItems(
			disposalItems.map((item) =>
				item.id === itemId
					? {
							...item,
							quantity: Math.min(
								Math.max(0, quantity),
								item.maxQuantity,
							),
					  }
					: item,
			),
		);
	};

	// Cập nhật lý do
	const handleReasonChange = (itemId: string, reason: string) => {
		setDisposalItems(
			disposalItems.map((item) =>
				item.id === itemId ? { ...item, reason } : item,
			),
		);
	};

	// Cập nhật sản phẩm được chọn
	const handleProductChange = (itemId: string, productId: string) => {
		const product = products.find((p) => p.id === productId);
		if (!product || !product.batches || product.batches.length === 0)
			return;

		const firstBatch = product.batches[0];
		setDisposalItems(
			disposalItems.map((item) =>
				item.id === itemId
					? {
							...item,
							productId: product.id,
							productName: product.name,
							productCode: product.code,
							batchId: firstBatch.id,
							batchNumber: firstBatch.batchNumber,
							quantity: Math.min(
								item.quantity,
								firstBatch.quantity,
							),
							maxQuantity: firstBatch.quantity,
							costPrice: firstBatch.costPrice,
							expiryDate: firstBatch.expiryDate,
					  }
					: item,
			),
		);
	};

	// Cập nhật lô hàng được chọn
	const handleBatchChange = (itemId: string, batchId: string) => {
		const item = disposalItems.find((i) => i.id === itemId);
		if (!item) return;

		const product = products.find((p) => p.id === item.productId);
		const batch = product?.batches?.find((b) => b.id === batchId);
		if (!batch) return;

		setDisposalItems(
			disposalItems.map((i) =>
				i.id === itemId
					? {
							...i,
							batchId: batch.id,
							batchNumber: batch.batchNumber,
							quantity: Math.min(i.quantity, batch.quantity),
							maxQuantity: batch.quantity,
							costPrice: batch.costPrice,
							expiryDate: batch.expiryDate,
					  }
					: i,
			),
		);
	};

	// Tính tổng giá trị hủy
	const getTotalValue = () => {
		return disposalItems.reduce(
			(sum, item) => sum + item.quantity * item.costPrice,
			0,
		);
	};

	// Submit disposal
	const handleSubmit = async () => {
		// Validate
		if (disposalItems.length === 0) {
			toast({
				title: "Không có hàng hóa",
				description: "Vui lòng thêm ít nhất một sản phẩm để hủy",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		// Kiểm tra số lượng
		const invalidItems = disposalItems.filter((item) => item.quantity <= 0);
		if (invalidItems.length > 0) {
			toast({
				title: "Số lượng không hợp lệ",
				description:
					"Vui lòng nhập số lượng lớn hơn 0 cho tất cả các mục",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		setIsSubmitting(true);
		try {
			await onSubmit(disposalItems, note);
			// Reload disposal history to show the new record
			await loadDisposalHistory();
			toast({
				title: "Thành công",
				description: "Đã hủy hàng thành công",
				status: "success",
				duration: 3000,
			});
			// Reset form
			setDisposalItems([]);
			setNote("");
		} catch (error) {
			console.error("Error submitting disposal:", error);
			toast({
				title: "Lỗi",
				description: "Không thể hủy hàng",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(value);
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				size="6xl"
				scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent maxH="90vh">
					<ModalHeader>
						<Text
							fontSize="24px"
							fontWeight="700"
							color="brand.600">
							Hủy hàng
						</Text>
						<Text
							fontSize="14px"
							fontWeight="400"
							color="gray.600"
							mt={1}>
							Quản lý hủy hàng hóa hết hạn hoặc hư hỏng
						</Text>
					</ModalHeader>
					<ModalCloseButton />

					<ModalBody>
						<Tabs
							colorScheme="brand"
							isLazy>
							<TabList>
								<Tab
									fontSize="15px"
									fontWeight="600">
									Hủy hàng mới
								</Tab>
								<Tab
									fontSize="15px"
									fontWeight="600">
									Lịch sử hủy hàng
								</Tab>
							</TabList>

							<TabPanels>
								{/* Tab 1: Hủy hàng mới */}
								<TabPanel px={0}>
									<VStack
										spacing={4}
										align="stretch">
										{/* Thông tin lô hết hạn */}
							<Box
								bg="orange.50"
								p={4}
								borderRadius="12px"
								border="1px solid"
								borderColor="orange.200">
								<Flex
									justify="space-between"
									align="center"
									mb={2}>
									<HStack>
										<Checkbox
											isChecked={
												selectedExpiredBatches.size ===
													getExpiredBatches()
														.length &&
												getExpiredBatches().length > 0
											}
											isIndeterminate={
												selectedExpiredBatches.size >
													0 &&
												selectedExpiredBatches.size <
													getExpiredBatches().length
											}
											onChange={
												handleToggleAllExpiredBatches
											}
											isDisabled={
												getExpiredBatches().length === 0
											}>
											<Text
												fontSize="14px"
												fontWeight="600"
												color="orange.800">
												🚨 Lô hàng đã hết hạn:{" "}
												{getExpiredBatches().length} lô
												{selectedExpiredBatches.size >
													0 &&
													` (${selectedExpiredBatches.size} đã chọn)`}
											</Text>
										</Checkbox>
									</HStack>
									<HStack spacing={2}>
										<Button
											size="sm"
											colorScheme="orange"
											variant="solid"
											onClick={
												handleAddSelectedExpiredBatches
											}
											isDisabled={
												selectedExpiredBatches.size ===
												0
											}>
											Thêm lô đã chọn (
											{selectedExpiredBatches.size})
										</Button>
										<Button
											size="sm"
											variant="ghost"
											colorScheme="orange"
											onClick={() =>
												setShowExpiredList(
													!showExpiredList,
												)
											}
											isDisabled={
												getExpiredBatches().length === 0
											}>
											{showExpiredList ? "Ẩn" : "Xem"}{" "}
											danh sách
										</Button>
									</HStack>
								</Flex>

								{/* Danh sách lô hết hạn */}
								{showExpiredList &&
									getExpiredBatches().length > 0 && (
										<Box
											mt={3}
											bg="white"
											borderRadius="8px"
											p={3}
											maxH="250px"
											overflowY="auto">
											<Table
												size="sm"
												variant="simple">
												<Thead
													bg="gray.50"
													position="sticky"
													top={0}
													zIndex={1}>
													<Tr>
														<Th
															width="40px"
															fontSize="11px">
															<Checkbox
																isChecked={
																	selectedExpiredBatches.size ===
																	getExpiredBatches()
																		.length
																}
																isIndeterminate={
																	selectedExpiredBatches.size >
																		0 &&
																	selectedExpiredBatches.size <
																		getExpiredBatches()
																			.length
																}
																onChange={
																	handleToggleAllExpiredBatches
																}
															/>
														</Th>
														<Th fontSize="11px">
															Sản phẩm
														</Th>
														<Th fontSize="11px">
															Lô hàng
														</Th>
														<Th
															fontSize="11px"
															isNumeric>
															Số lượng
														</Th>
														<Th fontSize="11px">
															Giá vốn
														</Th>
														<Th fontSize="11px">
															HSD
														</Th>
													</Tr>
												</Thead>
												<Tbody>
													{getExpiredBatches().map(
														(batch) => {
															const batchKey = `${batch.productId}-${batch.batchId}`;
															return (
																<Tr
																	key={
																		batch.id
																	}
																	bg={
																		selectedExpiredBatches.has(
																			batchKey,
																		)
																			? "orange.50"
																			: "white"
																	}
																	_hover={{
																		bg: selectedExpiredBatches.has(
																			batchKey,
																		)
																			? "orange.100"
																			: "gray.50",
																	}}
																	cursor="pointer"
																	onClick={() =>
																		handleToggleExpiredBatch(
																			batchKey,
																		)
																	}>
																	<Td>
																		<Checkbox
																			isChecked={selectedExpiredBatches.has(
																				batchKey,
																			)}
																			onChange={() =>
																				handleToggleExpiredBatch(
																					batchKey,
																				)
																			}
																			onClick={(
																				e,
																			) =>
																				e.stopPropagation()
																			}
																		/>
																	</Td>
																	<Td fontSize="12px">
																		{
																			batch.productCode
																		}{" "}
																		-{" "}
																		{
																			batch.productName
																		}
																	</Td>
																	<Td fontSize="12px">
																		{
																			batch.batchNumber
																		}
																	</Td>
																	<Td
																		fontSize="12px"
																		isNumeric>
																		{
																			batch.quantity
																		}
																	</Td>
																	<Td fontSize="12px">
																		{formatCurrency(
																			batch.costPrice,
																		)}
																	</Td>
																	<Td fontSize="12px">
																		<Badge
																			colorScheme="red"
																			fontSize="10px">
																			{batch.expiryDate
																				? formatDate(
																						batch.expiryDate,
																				  )
																				: "-"}
																		</Badge>
																	</Td>
																</Tr>
															);
														},
													)}
												</Tbody>
											</Table>
										</Box>
									)}
							</Box>

							{/* Nút thêm */}
							<Flex
								justify="space-between"
								align="center">
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700">
									Danh sách hàng hóa cần hủy (
									{disposalItems.length} mục)
								</Text>
								<Button
									leftIcon={<AddIcon />}
									colorScheme="brand"
									size="sm"
									onClick={handleAddItem}>
									Thêm hàng hóa
								</Button>
							</Flex>

							{/* Danh sách dạng Accordion */}
							{disposalItems.length > 0 ? (
								<Accordion
									allowMultiple
									defaultIndex={[]}
									bg="white"
									borderRadius="12px"
									border="1px solid"
									borderColor="gray.200">
									{disposalItems.map((item) => (
										<AccordionItem
											key={item.id}
											border="none"
											borderBottom="1px solid"
											borderColor="gray.100">
											<AccordionButton
												_hover={{ bg: "gray.50" }}
												py={3}
												px={4}>
												<Flex
													flex="1"
													justify="space-between"
													align="center">
													<HStack spacing={3}>
														<Box>
															<Text
																fontSize="14px"
																fontWeight="600"
																color="gray.800"
																textAlign="left">
																{item.productName}
															</Text>
															<HStack
																spacing={2}
																mt={1}>
																<Text
																	fontSize="12px"
																	color="gray.600">
																	{item.productCode}
																</Text>
																<Text
																	fontSize="12px"
																	color="gray.400">
																	•
																</Text>
																<Text
																	fontSize="12px"
																	color="gray.600">
																	Lô:{" "}
																	{item.batchNumber}
																</Text>
																<Text
																	fontSize="12px"
																	color="gray.400">
																	•
																</Text>
																<Text
																	fontSize="12px"
																	color="gray.600">
																	SL:{" "}
																	{item.quantity}
																</Text>
															</HStack>
														</Box>
													</HStack>
													<HStack spacing={3}>
														<VStack
															align="end"
															spacing={0}>
															<Text
																fontSize="12px"
																color="gray.500">
																Thành tiền
															</Text>
															<Text
																fontSize="15px"
																fontWeight="700"
																color="red.600">
																{formatCurrency(
																	item.quantity *
																		item.costPrice,
																)}
															</Text>
														</VStack>
														<AccordionIcon />
													</HStack>
												</Flex>
											</AccordionButton>
											<AccordionPanel
												pb={4}
												pt={0}
												px={4}>
												<Box
													bg="gray.50"
													p={4}
													borderRadius="8px">
													<VStack
														spacing={3}
														align="stretch">
														{/* Số lượng */}
														<Box>
															<Text
																fontSize="12px"
																fontWeight="600"
																color="gray.700"
																mb={2}>
																Số lượng hủy
															</Text>
															<Input
																type="number"
																size="sm"
																value={item.quantity}
																onChange={(e) =>
																	handleQuantityChange(
																		item.id,
																		e.target.value,
																	)
																}
																min={0}
																max={item.maxQuantity}
																placeholder="Nhập số lượng"
															/>
															<Text
																fontSize="11px"
																color="gray.500"
																mt={1}>
																Tồn kho: {item.maxQuantity}
															</Text>
														</Box>

														{/* Giá vốn & Thành tiền */}
														<Flex gap={3}>
															<Box flex="1">
																<Text
																	fontSize="12px"
																	fontWeight="600"
																	color="gray.700"
																	mb={2}>
																	Giá vốn
																</Text>
																<Text
																	fontSize="13px"
																	color="gray.800"
																	bg="white"
																	p={2}
																	borderRadius="6px">
																	{formatCurrency(
																		item.costPrice,
																	)}
																</Text>
															</Box>
															<Box flex="1">
																<Text
																	fontSize="12px"
																	fontWeight="600"
																	color="gray.700"
																	mb={2}>
																	Thành tiền
																</Text>
																<Text
																	fontSize="13px"
																	fontWeight="600"
																	color="red.600"
																	bg="white"
																	p={2}
																	borderRadius="6px">
																	{formatCurrency(
																		item.quantity *
																			item.costPrice,
																	)}
																</Text>
															</Box>
														</Flex>

														{/* HSD */}
														{item.expiryDate && (
															<Box>
																<Text
																	fontSize="12px"
																	fontWeight="600"
																	color="gray.700"
																	mb={2}>
																	Hạn sử dụng
																</Text>
																<HStack>
																	<Text
																		fontSize="13px"
																		color="gray.800">
																		{formatDate(
																			item.expiryDate,
																		)}
																	</Text>
																	{isExpired(item.expiryDate) && (
																		<Badge
																			colorScheme="red"
																			fontSize="10px">
																			Đã hết hạn
																		</Badge>
																	)}
																</HStack>
															</Box>
														)}

														{/* Lý do */}
														<Box>
															<Text
																fontSize="12px"
																fontWeight="600"
																color="gray.700"
																mb={2}>
																Lý do hủy
															</Text>
															<Select
																size="sm"
																value={item.reason}
																onChange={(e) =>
																	handleReasonChange(
																		item.id,
																		e.target.value,
																	)
																}>
																<option value="expired">
																	Hết hạn
																</option>
																<option value="damaged">
																	Hư hỏng
																</option>
																<option value="other">Khác</option>
															</Select>
														</Box>

														{/* Nút xóa */}
														<Flex justify="flex-end">
															<Button
																leftIcon={<DeleteIcon />}
																size="sm"
																colorScheme="red"
																variant="outline"
																onClick={() =>
																	handleRemoveItem(item.id)
																}>
																Xóa lô hàng này
															</Button>
														</Flex>
													</VStack>
												</Box>
											</AccordionPanel>
										</AccordionItem>
									))}
								</Accordion>
							) : (
								<Box
									bg="gray.50"
									p={8}
									borderRadius="12px"
									textAlign="center">
									<Text
										fontSize="16px"
										color="gray.500">
										Chưa có hàng hóa nào được thêm vào danh
										sách hủy
									</Text>
									<Text
										fontSize="14px"
										color="gray.400"
										mt={2}>
										Nhấn "Thêm hàng hóa" để thêm sản phẩm
										cần hủy
									</Text>
								</Box>
							)}

							{/* Tổng kết */}
							{disposalItems.length > 0 && (
								<Box
									bg="red.50"
									p={4}
									borderRadius="12px"
									border="1px solid"
									borderColor="red.200">
									<Flex
										justify="space-between"
										align="center">
										<Text
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Tổng giá trị hủy:
										</Text>
										<Text
											fontSize="20px"
											fontWeight="700"
											color="red.600">
											{formatCurrency(getTotalValue())}
										</Text>
									</Flex>
								</Box>
							)}

							{/* Ghi chú */}
							<Box>
								<Text
									fontSize="14px"
									fontWeight="600"
									color="gray.700"
									mb={2}>
									Ghi chú
								</Text>
								<Textarea
									value={note}
									onChange={(e) => setNote(e.target.value)}
									placeholder="Nhập ghi chú về đợt hủy hàng..."
									rows={3}
								/>
							</Box>
						</VStack>
								</TabPanel>

								{/* Tab 2: Lịch sử hủy hàng */}
								<TabPanel px={0}>
									{isLoadingHistory ? (
										<Flex
											justify="center"
											align="center"
											minH="400px">
											<VStack spacing={3}>
												<Text
													fontSize="14px"
													color="gray.600">
													Đang tải lịch sử...
												</Text>
											</VStack>
										</Flex>
									) : disposalHistory.length === 0 ? (
										<Flex
											justify="center"
											align="center"
											minH="400px">
											<VStack spacing={3}>
												<Text
													fontSize="16px"
													fontWeight="600"
													color="gray.600">
													Chưa có lịch sử hủy hàng
												</Text>
												<Text
													fontSize="14px"
													color="gray.500">
													Các đơn hủy hàng sẽ được hiển thị ở đây
												</Text>
											</VStack>
										</Flex>
									) : (
										<VStack
											spacing={4}
											align="stretch">
											{disposalHistory.map((record) => (
												<Box
													key={record.id}
													p={4}
													borderRadius="12px"
													border="1px solid"
													borderColor="gray.200"
													bg="white">
													<Flex
														justify="space-between"
														align="start"
														mb={3}>
														<VStack
															align="start"
															spacing={1}>
															<HStack>
																<Text
																	fontSize="15px"
																	fontWeight="700"
																	color="gray.800">
																	Mã phiếu:{" "}
																	{record.id}
																</Text>
																<Badge
																	colorScheme="red"
																	fontSize="11px">
																	Đã hủy
																</Badge>
															</HStack>
															<Text
																fontSize="13px"
																color="gray.600">
																{formatDate(
																	record.createdAt,
																)}{" "}
																• {record.items.length}{" "}
																lô hàng
															</Text>
														</VStack>
														<VStack
															align="end"
															spacing={0}>
															<Text
																fontSize="12px"
																color="gray.500">
																Tổng giá trị
															</Text>
															<Text
																fontSize="16px"
																fontWeight="700"
																color="red.600">
																{formatCurrency(
																	record.totalValue,
																)}
															</Text>
														</VStack>
													</Flex>

													{/* Chi tiết các lô hàng */}
													<Box
														borderTop="1px solid"
														borderColor="gray.100"
														pt={3}>
														<Table
															size="sm"
															variant="simple">
															<Thead bg="gray.50">
																<Tr>
																	<Th
																		fontSize="11px"
																		fontWeight="700"
																		color="gray.700">
																		Sản phẩm
																	</Th>
																	<Th
																		fontSize="11px"
																		fontWeight="700"
																		color="gray.700">
																		Mã lô
																	</Th>
																	<Th
																		fontSize="11px"
																		fontWeight="700"
																		color="gray.700"
																		isNumeric>
																		Số lượng
																	</Th>
																	<Th
																		fontSize="11px"
																		fontWeight="700"
																		color="gray.700"
																		isNumeric>
																		Giá vốn
																	</Th>
																	<Th
																		fontSize="11px"
																		fontWeight="700"
																		color="gray.700">
																		HSD
																	</Th>
																	<Th
																		fontSize="11px"
																		fontWeight="700"
																		color="gray.700">
																		Lý do
																	</Th>
																</Tr>
															</Thead>
															<Tbody>
																{record.items.map(
																	(item) => (
																		<Tr
																			key={
																				item.id
																			}>
																			<Td>
																				<VStack
																					align="start"
																					spacing={
																						0
																					}>
																					<Text
																						fontSize="13px"
																						fontWeight="600">
																						{
																							item.productName
																						}
																					</Text>
																					<Text
																						fontSize="12px"
																						color="gray.600">
																						{
																							item.productCode
																						}
																					</Text>
																				</VStack>
																			</Td>
																			<Td>
																				<Text fontSize="12px">
																					{
																						item.batchNumber
																					}
																				</Text>
																			</Td>
																			<Td
																				isNumeric>
																				<Text fontSize="13px">
																					{
																						item.quantity
																					}
																				</Text>
																			</Td>
																			<Td
																				isNumeric>
																				<Text fontSize="13px">
																					{formatCurrency(
																						item.costPrice,
																					)}
																				</Text>
																			</Td>
																			<Td>
																				{item.expiryDate ? (
																					<Text
																						fontSize="12px"
																						color={
																							isExpired(
																								item.expiryDate,
																							)
																								? "red.600"
																								: "gray.700"
																						}>
																						{formatDate(
																							item.expiryDate,
																						)}
																					</Text>
																				) : (
																					<Text
																						fontSize="12px"
																						color="gray.400">
																						N/A
																					</Text>
																				)}
																			</Td>
																			<Td>
																				<Badge
																					colorScheme={
																						item.reason ===
																						"expired"
																							? "red"
																							: item.reason ===
																								  "damaged"
																								? "orange"
																								: "gray"
																					}
																					fontSize="11px">
																					{item.reason ===
																					"expired"
																						? "Hết hạn"
																						: item.reason ===
																							  "damaged"
																							? "Hư hỏng"
																							: "Khác"}
																				</Badge>
																			</Td>
																		</Tr>
																	),
																)}
															</Tbody>
														</Table>
													</Box>

													{/* Ghi chú */}
													{record.note && (
														<Box
															mt={3}
															p={3}
															bg="gray.50"
															borderRadius="8px">
															<Text
																fontSize="12px"
																color="gray.500"
																mb={1}
																fontWeight="600">
																Ghi chú:
															</Text>
															<Text
																fontSize="13px"
																color="gray.700">
																{record.note}
															</Text>
														</Box>
													)}
												</Box>
											))}
										</VStack>
									)}
								</TabPanel>
							</TabPanels>
						</Tabs>
					</ModalBody>

					<ModalFooter>
						<HStack spacing={3}>
							<Button
								variant="ghost"
								onClick={onClose}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleSubmit}
								isLoading={isSubmitting}
								isDisabled={disposalItems.length === 0}>
								Xác nhận hủy hàng
							</Button>
						</HStack>
					</ModalFooter>
				</ModalContent>
			</Modal>

			{/* Modal Thêm Sản Phẩm */}
			<Modal
				isOpen={isAddModalOpen}
				onClose={onAddModalClose}
				size="6xl"
				scrollBehavior="inside">
				<ModalOverlay />
				<ModalContent maxH="90vh">
					<ModalHeader>
						<Text
							fontSize="20px"
							fontWeight="700"
							color="brand.600">
							Thêm sản phẩm cần hủy
						</Text>
						<Text
							fontSize="14px"
							fontWeight="400"
							color="gray.600"
							mt={1}>
							Tìm kiếm và chọn các lô hàng cần hủy
						</Text>
					</ModalHeader>
					<ModalCloseButton />

					<ModalBody>
						<VStack
							spacing={4}
							align="stretch">
							{/* Search Box */}
							<Box>
								<Input
									placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									size="lg"
									bg="white"
									borderColor="gray.300"
									_focus={{
										borderColor: "brand.500",
										boxShadow:
											"0 0 0 1px var(--chakra-colors-brand-500)",
									}}
								/>
							</Box>

							{/* Thông tin đã chọn */}
							{selectedBatches.size > 0 && (
								<Box
									bg="blue.50"
									p={3}
									borderRadius="8px"
									border="1px solid"
									borderColor="blue.200">
									<Text
										fontSize="14px"
										fontWeight="600"
										color="blue.800">
										✓ Đã chọn {selectedBatches.size} lô hàng
									</Text>
								</Box>
							)}

							{/* Product List */}
							<Box
								borderRadius="12px"
								border="1px solid"
								borderColor="gray.200"
								overflow="hidden"
								bg="white">
								<Box
									maxH="500px"
									overflowY="auto">
									{getFilteredProducts().length === 0 ? (
										<Box
											p={8}
											textAlign="center">
											<Text
												fontSize="16px"
												color="gray.500">
												{searchQuery
													? "Không tìm thấy sản phẩm nào"
													: "Nhập tên hoặc mã sản phẩm để tìm kiếm"}
											</Text>
										</Box>
									) : (
										<Table
											variant="simple"
											size="sm">
											<Thead
												bg="gray.50"
												position="sticky"
												top={0}
												zIndex={1}>
												<Tr>
													<Th width="40px">Chọn</Th>
													<Th>Sản phẩm</Th>
													<Th>Lô hàng</Th>
													<Th isNumeric>Tồn kho</Th>
													<Th>Giá vốn</Th>
													<Th>HSD</Th>
													<Th width="120px">
														Số lượng hủy
													</Th>
													<Th width="120px">Lý do</Th>
												</Tr>
											</Thead>
											<Tbody>
												{getFilteredProducts().map(
													(product) => {
														const batches =
															getBatchesForProduct(
																product.id,
															);
														return batches.map(
															(batch, idx) => {
																const key = `${product.id}-${batch.id}`;
																const isSelected =
																	selectedBatches.has(
																		key,
																	);
																const selectedData =
																	selectedBatches.get(
																		key,
																	);
																const isExpiredBatch =
																	batch.expiryDate &&
																	isExpired(
																		batch.expiryDate,
																	);
																const isFirstBatch =
																	idx === 0;

																return (
																	<Tr
																		key={
																			key
																		}
																		bg={
																			isSelected
																				? "blue.50"
																				: isExpiredBatch
																				? "red.50"
																				: "white"
																		}
																		_hover={{
																			bg: isSelected
																				? "blue.100"
																				: isExpiredBatch
																				? "red.100"
																				: "gray.50",
																		}}>
																		<Td>
																			<Checkbox
																				isChecked={
																					isSelected
																				}
																				onChange={() =>
																					handleToggleBatch(
																						product.id,
																						batch.id,
																						batch.quantity,
																					)
																				}
																			/>
																		</Td>
																		<Td>
																			<VStack
																				align="start"
																				spacing={0}>
																				<Text
																					fontSize="13px"
																					fontWeight="600">
																					{product.name}
																				</Text>
																				<Text
																					fontSize="12px"
																					color="gray.600">
																					{product.code}
																				</Text>
																			</VStack>
																		</Td>
																		<Td>
																			<Text fontSize="12px">
																				{
																					batch.batchNumber
																				}
																			</Text>
																		</Td>
																		<Td
																			isNumeric>
																			<Text
																				fontSize="12px"
																				fontWeight="600">
																				{
																					batch.quantity
																				}{" "}
																				{
																					product.unit
																				}
																			</Text>
																		</Td>
																		<Td>
																			<Text fontSize="12px">
																				{formatCurrency(
																					batch.costPrice,
																				)}
																			</Text>
																		</Td>
																		<Td>
																			<Badge
																				colorScheme={
																					isExpiredBatch
																						? "red"
																						: "green"
																				}
																				fontSize="10px">
																				{batch.expiryDate
																					? formatDate(
																							batch.expiryDate,
																					  )
																					: "-"}
																			</Badge>
																		</Td>
																		<Td>
																			{isSelected && (
																				<Input
																					type="number"
																					size="sm"
																					value={
																						selectedData?.quantity ||
																						0
																					}
																					onChange={(
																						e,
																					) =>
																						handleUpdateBatchQuantity(
																							product.id,
																							batch.id,
																							Math.min(
																								parseInt(
																									e
																										.target
																										.value,
																								) ||
																									0,
																								batch.quantity,
																							),
																						)
																					}
																					min={
																						1
																					}
																					max={
																						batch.quantity
																					}
																				/>
																			)}
																		</Td>
																		<Td>
																			{isSelected && (
																				<Select
																					size="sm"
																					value={
																						selectedData?.reason ||
																						"other"
																					}
																					onChange={(
																						e,
																					) =>
																						handleUpdateBatchReason(
																							product.id,
																							batch.id,
																							e
																								.target
																								.value,
																						)
																					}>
																					<option value="expired">
																						Hết
																						hạn
																					</option>
																					<option value="damaged">
																						Hư
																						hỏng
																					</option>
																					<option value="other">
																						Khác
																					</option>
																				</Select>
																			)}
																		</Td>
																	</Tr>
																);
															},
														);
													},
												)}
											</Tbody>
										</Table>
									)}
								</Box>
							</Box>
						</VStack>
					</ModalBody>

					<ModalFooter>
						<HStack spacing={3}>
							<Button
								variant="ghost"
								onClick={onAddModalClose}>
								Hủy
							</Button>
							<Button
								colorScheme="brand"
								onClick={handleConfirmAdd}
								isDisabled={selectedBatches.size === 0}>
								Thêm {selectedBatches.size} lô hàng vào danh
								sách
							</Button>
						</HStack>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default DisposalModal;
