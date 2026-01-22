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
	Spinner,
	Flex,
	useToast,
} from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";
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
	const [batches, setBatches] = useState<BatchWithSelection[]>([]);
	const [note, setNote] = useState("");

	// Load batches for all products when modal opens
	useEffect(() => {
		if (isOpen && products.length > 0) {
			loadBatches();
		}
	}, [isOpen, products]);

	const loadBatches = async () => {
		setIsLoading(true);
		try {
			const allBatches: BatchWithSelection[] = [];
			
			for (const product of products) {
				const productBatches = await inventoryService.getBatchesByProductId(product.productId);
				// Only include active batches with stock
				const activeBatches = productBatches
					.filter(b => b.status === "ACTIVE" && b.stockQuantity > 0)
					.map(b => ({
						...b,
						selected: false,
						disposeQuantity: 0,
						productName: product.productName,
					}));
				allBatches.push(...activeBatches);
			}
			
			setBatches(allBatches);
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

	const handleToggleBatch = (lotId: string) => {
		setBatches(prev => prev.map(b => {
			if (b.lotId === lotId) {
				return {
					...b,
					selected: !b.selected,
					disposeQuantity: !b.selected ? b.stockQuantity : 0, // Default to full quantity when selected
				};
			}
			return b;
		}));
	};

	const handleQuantityChange = (lotId: string, value: number) => {
		setBatches(prev => prev.map(b => {
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
		const selectedBatches = batches.filter(b => b.selected && b.disposeQuantity > 0);
		
		if (selectedBatches.length === 0) {
			toast({
				title: "Chưa chọn lô hàng",
				description: "Vui lòng chọn ít nhất một lô hàng để hủy",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		const disposalItems: DisposalItem[] = selectedBatches.map((b, index) => ({
			id: `disposal-${Date.now()}-${index}`,
			batchId: b.lotId,
			batchNumber: b.lotId, // lotId serves as batch identifier
			productId: b.productId,
			productName: b.productName,
			productCode: b.productId, // Using productId as product code
			quantity: b.disposeQuantity,
			maxQuantity: b.stockQuantity,
			costPrice: b.importPrice,
			expiryDate: b.expirationDate ? new Date(b.expirationDate) : undefined,
			reason: note || "Hủy hàng theo yêu cầu",
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
		} catch (error) {
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

	const selectedCount = batches.filter(b => b.selected).length;
	const totalDisposeQuantity = batches.reduce((sum, b) => sum + (b.selected ? b.disposeQuantity : 0), 0);

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
			<ModalOverlay />
			<ModalContent>
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
					) : batches.length === 0 ? (
						<VStack spacing={4} py={8}>
							<Text color="gray.500">Không có lô hàng nào để hủy</Text>
						</VStack>
					) : (
						<VStack spacing={4} align="stretch">
							<Text fontSize="14px" color="gray.600">
								Chọn các lô hàng cần hủy và số lượng tương ứng:
							</Text>

							{batches.map((batch) => {
								const expiryStatus = getExpiryStatus(batch.expirationDate ?? undefined);
								// Extract color scheme from color (e.g., "red.500" → "red")
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
												onChange={() => handleToggleBatch(batch.lotId)}
												colorScheme="red"
											>
												<VStack align="start" spacing={1} ml={2}>
													<Text fontWeight="600">{batch.productName}</Text>
													<HStack spacing={2}>
														<Badge colorScheme="blue">Lô: {batch.lotId}</Badge>
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
													onChange={(_, val) => handleQuantityChange(batch.lotId, val)}
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
							})}

							<Box mt={4}>
								<Text fontSize="14px" fontWeight="600" mb={2}>
									Lý do hủy hàng (tùy chọn):
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

