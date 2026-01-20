import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Text,
	Box,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	Spinner,
	Flex,
	useToast,
} from "@chakra-ui/react";
import type { InventoryProduct, ProductBatch } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";

interface BatchListModalProps {
	isOpen: boolean;
	onClose: () => void;
	product: InventoryProduct | null;
	onUpdateBatch: (
		batchId: string,
		updates: Partial<ProductBatch>,
	) => Promise<void>;
}

/**
 * Format date for display (Vietnamese format)
 */
const formatDate = (dateStr: string | null): string => {
	if (!dateStr) return "—";
	const date = new Date(dateStr);
	return date.toLocaleDateString("vi-VN");
};

/**
 * Check if a batch is expired or expiring soon
 */
const getExpiryStatus = (dateStr: string | null): "expired" | "expiring" | "ok" | null => {
	if (!dateStr) return null;
	const expiry = new Date(dateStr);
	const now = new Date();
	const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
	
	if (daysUntilExpiry < 0) return "expired";
	if (daysUntilExpiry <= 30) return "expiring";
	return "ok";
};

const BatchListModal = ({
	isOpen,
	onClose,
	product,
}: BatchListModalProps) => {
	const toast = useToast();
	const [batches, setBatches] = useState<ProductBatch[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen && product) {
			fetchBatches();
		}
	}, [isOpen, product]);

	const fetchBatches = async () => {
		if (!product) return;
		
		setIsLoading(true);
		try {
			const data = await inventoryService.getBatchesByProductId(product.productId);
			setBatches(data);
		} catch (error) {
			console.error("Error fetching batches:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải danh sách lô hàng",
				status: "error",
				duration: 3000,
			});
			setBatches([]);
		} finally {
			setIsLoading(false);
		}
	};

	if (!product) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="4xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					Quản lý lô hàng - {product.productName}
					<Text
						fontSize="sm"
						fontWeight="normal"
						color="gray.600"
						mt={1}>
						Mã sản phẩm: {product.productId} | Tổng tồn kho:{" "}
						{product.totalStockQuantity ?? 0} {product.unitOfMeasure}
					</Text>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					{isLoading ? (
						<Flex justify="center" align="center" py={10}>
							<Spinner size="xl" color="brand.500" thickness="4px" />
						</Flex>
					) : batches.length === 0 ? (
						<Box textAlign="center" py={10}>
							<Text color="gray.600" mb={2}>
								Không có lô hàng nào
							</Text>
							<Text fontSize="sm" color="gray.500">
								Sản phẩm này chưa có lô hàng trong kho.
							</Text>
						</Box>
					) : (
						<Box overflowX="auto">
							<Table variant="simple" size="sm">
								<Thead bg="gray.50">
									<Tr>
										<Th>Mã lô</Th>
										<Th isNumeric>Số lượng</Th>
										<Th isNumeric>Giá nhập</Th>
										<Th>Ngày sản xuất</Th>
										<Th>Hạn sử dụng</Th>
										<Th>Trạng thái</Th>
									</Tr>
								</Thead>
								<Tbody>
									{batches.map((batch) => {
										const expiryStatus = getExpiryStatus(batch.expirationDate);
										return (
											<Tr key={batch.lotId}>
												<Td fontFamily="mono" fontSize="sm">
													{batch.lotId}
												</Td>
												<Td isNumeric fontWeight="600">
													{batch.stockQuantity.toLocaleString("vi-VN")}
												</Td>
												<Td isNumeric>
													{batch.importPrice.toLocaleString("vi-VN")}đ
												</Td>
												<Td>{formatDate(batch.manufactureDate)}</Td>
												<Td>
													<Flex align="center" gap={2}>
														{formatDate(batch.expirationDate)}
														{expiryStatus === "expired" && (
															<Badge colorScheme="red" fontSize="xs">
																Hết hạn
															</Badge>
														)}
														{expiryStatus === "expiring" && (
															<Badge colorScheme="orange" fontSize="xs">
																Sắp hết hạn
															</Badge>
														)}
													</Flex>
												</Td>
												<Td>
													<Badge
														colorScheme={
															batch.status === "AVAILABLE"
																? "green"
																: batch.status === "EXPIRED"
																? "red"
																: "gray"
														}>
														{batch.status === "AVAILABLE"
															? "Còn hàng"
															: batch.status === "EXPIRED"
															? "Hết hạn"
															: batch.status}
													</Badge>
												</Td>
											</Tr>
										);
									})}
								</Tbody>
							</Table>
						</Box>
					)}
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default BatchListModal;
