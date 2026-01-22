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
	Text,
	Box,
	VStack,
	HStack,
	Badge,
	Checkbox,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	Textarea,
	Select,
	Spinner,
	Flex,
	Divider,
	useToast,
} from "@chakra-ui/react";
import { FiTrash2, FiAlertTriangle } from "react-icons/fi";
import type { DisposalItem, InventoryProduct, ProductBatch } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";
import { getExpiryStatus } from "@/utils/date";

interface DisposalModalProps {
	isOpen: boolean;
	onClose: () => void;
	products: InventoryProduct[];
	onSubmit: (items: DisposalItem[], note: string) => Promise<void>;
}

interface BatchWithSelection extends ProductBatch {
	selected: boolean;
	disposeQuantity: number;
	productName: string;
	isAutoExpired: boolean; // true if auto-fetched from EXPIRED status
}

const DisposalModal = ({
	isOpen,
	onClose,
	products,
	onSubmit,
}: DisposalModalProps) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [expiredBatches, setExpiredBatches] = useState<BatchWithSelection[]>([]);
	const [availableBatches, setAvailableBatches] = useState<BatchWithSelection[]>([]);
	const [note, setNote] = useState("");
	const [reason, setReason] = useState<"expired" | "damaged" | "lost" | "other" | "">("");

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			setExpiredBatches([]);
			setAvailableBatches([]);
			setNote("");
			setReason("");
		}
	}, [isOpen]);

	// Load batches when modal opens
	useEffect(() => {
		if (isOpen) {
			loadAllBatches();
		}
	}, [isOpen, products]);

	const loadAllBatches = async () => {
		setIsLoading(true);
		try {
			// Fetch ALL batches with stock, then categorize by expiration date
			const allBatchesList: BatchWithSelection[] = [];
			
			for (const product of products) {
				const productBatches = await inventoryService.getBatchesByProductId(product.productId);
				// Include all batches with stock (regardless of status)
				const withStock = productBatches
					.filter(b => b.stockQuantity > 0 && b.status !== "DISPOSED")
					.map(b => {
						// Check if physically expired (expirationDate < today)
						const isPhysicallyExpired = b.expirationDate 
							? new Date(b.expirationDate) < new Date() 
							: false;
						
						return {
							...b,
							productName: product.productName,
							// Auto-select expired items, user can deselect
							selected: isPhysicallyExpired,
							disposeQuantity: isPhysicallyExpired ? b.stockQuantity : 0,
							isAutoExpired: isPhysicallyExpired,
						};
					});
				allBatchesList.push(...withStock);
			}
			
			// Split into expired and non-expired sections
			const expired = allBatchesList.filter(b => b.isAutoExpired);
			const available = allBatchesList.filter(b => !b.isAutoExpired);
			
			setExpiredBatches(expired);
			setAvailableBatches(available);
		} catch (error) {
			console.error("Error loading batches:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải thông tin lô hàng",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleBatch = (lotId: string, isExpired: boolean) => {
		const setter = isExpired ? setExpiredBatches : setAvailableBatches;
		setter(prev => prev.map(b => {
			if (b.lotId === lotId) {
				return {
					...b,
					selected: !b.selected,
					disposeQuantity: !b.selected ? b.stockQuantity : 0,
				};
			}
			return b;
		}));
	};

	const handleQuantityChange = (lotId: string, value: number, isExpired: boolean) => {
		const setter = isExpired ? setExpiredBatches : setAvailableBatches;
		setter(prev => prev.map(b => {
			if (b.lotId === lotId) {
				return {
					...b,
					disposeQuantity: Math.min(Math.max(0, value), b.stockQuantity),
				};
			}
			return b;
		}));
	};

	const handleSubmit = async () => {
		// Combine selected batches from both lists
		const allBatches = [...expiredBatches, ...availableBatches];
		const selectedBatches = allBatches.filter(b => b.selected && b.disposeQuantity > 0);
		
		if (selectedBatches.length === 0) {
			toast({
				title: "Chưa chọn lô hàng",
				description: "Vui lòng chọn ít nhất một lô hàng để hủy",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		// For expired items, auto-set reason; for others, require selection
		const hasNonExpiredSelected = selectedBatches.some(b => !b.isAutoExpired);
		if (hasNonExpiredSelected && !reason) {
			toast({
				title: "Chưa chọn lý do",
				description: "Vui lòng chọn lý do hủy hàng",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		const disposalItems: DisposalItem[] = selectedBatches.map((b, index) => ({
			id: `disposal-${Date.now()}-${index}`,
			batchId: b.lotId,
			batchNumber: b.lotId,
			productId: b.productId,
			productName: b.productName,
			productCode: b.productId,
			quantity: b.disposeQuantity,
			maxQuantity: b.stockQuantity,
			costPrice: b.importPrice,
			expiryDate: b.expirationDate ? new Date(b.expirationDate) : undefined,
			reason: b.isAutoExpired ? "expired" : reason, // Auto-set for expired items
		}));

		setIsSubmitting(true);
		try {
			await onSubmit(disposalItems, note);
			toast({
				title: "Thành công",
				description: `Đã hủy ${selectedBatches.length} lô hàng`,
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể hủy hàng. Vui lòng thử lại.",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const allBatches = [...expiredBatches, ...availableBatches];
	const selectedCount = allBatches.filter(b => b.selected).length;
	const totalDisposeQuantity = allBatches.reduce((sum, b) => sum + (b.selected ? b.disposeQuantity : 0), 0);
	const hasOnlyExpiredSelected = allBatches.filter(b => b.selected).every(b => b.isAutoExpired);

	// Helper to render a batch item
	const renderBatchItem = (batch: BatchWithSelection, isExpiredSection: boolean) => {
		const expiryStatus = getExpiryStatus(batch.expirationDate ?? undefined);
		const badgeColorScheme = expiryStatus.color.split('.')[0];
		
		return (
			<Box
				key={batch.lotId}
				p={4}
				borderRadius="lg"
				border="1px solid"
				borderColor={batch.selected ? "red.300" : "gray.200"}
				bg={batch.selected ? "red.50" : "white"}
				transition="all 0.2s"
			>
				<HStack justify="space-between" align="start">
					<Checkbox
						isChecked={batch.selected}
						onChange={() => handleToggleBatch(batch.lotId, isExpiredSection)}
						colorScheme="red"
					>
						<VStack align="start" spacing={1} ml={2}>
							<HStack>
								<Text fontWeight="600">{batch.productName}</Text>
								{batch.isAutoExpired && (
									<Badge colorScheme="red" variant="solid" fontSize="10px">
										<HStack spacing={1}>
											<Box as={FiAlertTriangle} />
											<Text>Hết hạn</Text>
										</HStack>
									</Badge>
								)}
							</HStack>
							<HStack spacing={2}>
								<Badge colorScheme="blue">Lô: {batch.lotId.slice(0, 8)}...</Badge>
								<Badge colorScheme={badgeColorScheme}>
									{expiryStatus.text}
								</Badge>
							</HStack>
							<Text fontSize="13px" color="gray.600">
								Tồn: {batch.stockQuantity} | HSD: {batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString("vi-VN") : "N/A"}
							</Text>
						</VStack>
					</Checkbox>

					{batch.selected && (
						<NumberInput
							size="sm"
							maxW={20}
							min={1}
							max={batch.stockQuantity}
							value={batch.disposeQuantity}
							onChange={(_, val) => handleQuantityChange(batch.lotId, val, isExpiredSection)}
						>
							<NumberInputField />
							<NumberInputStepper>
								<NumberIncrementStepper />
								<NumberDecrementStepper />
							</NumberInputStepper>
						</NumberInput>
					)}
				</HStack>
			</Box>
		);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
			<ModalOverlay />
			<ModalContent maxH="90vh">
				<ModalHeader>
					<HStack>
						<Box as={FiTrash2} color="red.500" />
						<Text fontSize="20px" fontWeight="700" color="brand.600">
							Hủy hàng
						</Text>
					</HStack>
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					{isLoading ? (
						<Flex justify="center" py={8}>
							<Spinner size="lg" color="brand.500" />
						</Flex>
					) : expiredBatches.length === 0 && availableBatches.length === 0 ? (
						<VStack spacing={4} py={8}>
							<Text color="gray.500">Không có lô hàng nào để hủy</Text>
						</VStack>
					) : (
						<VStack spacing={4} align="stretch">
							{/* SECTION 1: Auto-populated Expired Items */}
							{expiredBatches.length > 0 && (
								<Box>
									<HStack mb={2}>
										<Box as={FiAlertTriangle} color="red.500" />
										<Text fontSize="14px" fontWeight="600" color="red.600">
											Lô hàng hết hạn ({expiredBatches.length})
										</Text>
									</HStack>
									<Text fontSize="12px" color="gray.500" mb={3}>
										Các lô hàng dưới đây đã hết hạn và được chọn sẵn để hủy:
									</Text>
									<VStack spacing={2} align="stretch">
										{expiredBatches.map(batch => renderBatchItem(batch, true))}
									</VStack>
								</Box>
							)}

							{/* Divider if both sections exist */}
							{expiredBatches.length > 0 && availableBatches.length > 0 && (
								<Divider my={2} />
							)}

							{/* SECTION 2: Manual selection from Available items */}
							{availableBatches.length > 0 && (
								<Box>
									<Text fontSize="14px" fontWeight="600" color="gray.700" mb={2}>
										Lô hàng còn hạn ({availableBatches.length})
									</Text>
									<Text fontSize="12px" color="gray.500" mb={3}>
										Chọn thêm lô hàng cần hủy (hư hỏng, mất mát...):
									</Text>
									<VStack spacing={2} align="stretch">
										{availableBatches.map(batch => renderBatchItem(batch, false))}
									</VStack>
								</Box>
							)}

							{/* Reason selector - only show if non-expired items selected */}
							{!hasOnlyExpiredSelected && selectedCount > 0 && (
								<Box mt={4}>
									<Text fontSize="14px" fontWeight="600" mb={2}>
										Lý do hủy hàng:
									</Text>
									<Select
										placeholder="Chọn lý do"
										value={reason}
										onChange={(e) => setReason(e.target.value as "expired" | "damaged" | "lost" | "other" | "")}
										size="sm"
									>
										<option value="expired">Hết hạn sử dụng</option>
										<option value="damaged">Hư hỏng</option>
										<option value="lost">Mất mát</option>
										<option value="other">Khác</option>
									</Select>
								</Box>
							)}

							<Box mt={3}>
								<Text fontSize="14px" fontWeight="600" mb={2}>
									Ghi chú (tùy chọn):
								</Text>
								<Textarea
									placeholder="VD: Hết hạn sử dụng, hư hỏng, lỗi sản phẩm..."
									value={note}
									onChange={(e) => setNote(e.target.value)}
									size="sm"
								/>
							</Box>

							{selectedCount > 0 && (
								<Box
									p={3}
									bg="red.100"
									borderRadius="md"
									border="1px solid"
									borderColor="red.300"
								>
									<Text fontWeight="600" color="red.700">
										Xác nhận hủy {selectedCount} lô hàng, tổng số lượng: {totalDisposeQuantity}
									</Text>
								</Box>
							)}
						</VStack>
					)}
				</ModalBody>

				<ModalFooter gap={3}>
					<Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
						Hủy bỏ
					</Button>
					<Button
						colorScheme="red"
						onClick={handleSubmit}
						isLoading={isSubmitting}
						isDisabled={isLoading || selectedCount === 0}
						leftIcon={<FiTrash2 />}
					>
						Xác nhận hủy hàng
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default DisposalModal;
