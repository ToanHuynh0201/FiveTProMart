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
	VStack,
	HStack,
	useToast,
	Select,
	Text,
} from "@chakra-ui/react";
import type { ProductBatch } from "@/types/inventory";
import { inventoryService } from "@/services/inventoryService";

interface EditBatchModalProps {
	isOpen: boolean;
	onClose: () => void;
	batch: ProductBatch | null;
	productName: string;
	onUpdate: (
		batchId: string,
		updates: Partial<ProductBatch>,
	) => Promise<void>;
}

/**
 * EditBatchModal - Edit stock inventory batch
 * 
 * Matches backend PUT /api/v1/stock_inventories/{lotId}
 * Editable fields: stockQuantity, status
 */
const EditBatchModal = ({
	isOpen,
	onClose,
	batch,
	productName,
}: EditBatchModalProps) => {
	const toast = useToast();
	const [loading, setLoading] = useState(false);

	// Form state - only fields that backend accepts for update
	const [formData, setFormData] = useState({
		stockQuantity: 0,
		status: "AVAILABLE" as string,
	});

	// Populate form when batch changes
	useEffect(() => {
		if (batch) {
			setFormData({
				stockQuantity: batch.stockQuantity,
				status: batch.status,
			});
		}
	}, [batch]);

	const handleSubmit = async () => {
		if (!batch) return;

		// Validation
		if (formData.stockQuantity < 0) {
			toast({
				title: "Lỗi",
				description: "Số lượng không được âm",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setLoading(true);
		try {
			// Call backend PUT /api/v1/stock_inventories/{lotId}
			await inventoryService.updateLot(
				batch.lotId,
				formData.stockQuantity,
				formData.status,
			);

			toast({
				title: "Thành công",
				description: "Đã cập nhật lô hàng",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			console.error("Error updating batch:", error);
			toast({
				title: "Lỗi",
				description: "Không thể cập nhật lô hàng",
				status: "error",
				duration: 3000,
			});
		} finally {
			setLoading(false);
		}
	};

	if (!batch) return null;

	/**
	 * Format date for display (Vietnamese format)
	 */
	const formatDate = (dateStr: string | null): string => {
		if (!dateStr) return "—";
		const date = new Date(dateStr);
		return date.toLocaleDateString("vi-VN");
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Chỉnh sửa lô hàng</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<VStack spacing={4}>
						{/* Read-only info */}
						<FormControl>
							<FormLabel color="gray.600">Sản phẩm</FormLabel>
							<Text fontWeight="600">{productName}</Text>
						</FormControl>

						<HStack width="100%" spacing={4}>
							<FormControl>
								<FormLabel color="gray.600">Mã lô</FormLabel>
								<Text fontFamily="mono">{batch.lotId}</Text>
							</FormControl>

							<FormControl>
								<FormLabel color="gray.600">Giá nhập</FormLabel>
								<Text>{batch.importPrice.toLocaleString("vi-VN")}đ</Text>
							</FormControl>
						</HStack>

						<HStack width="100%" spacing={4}>
							<FormControl>
								<FormLabel color="gray.600">Ngày sản xuất</FormLabel>
								<Text>{formatDate(batch.manufactureDate)}</Text>
							</FormControl>

							<FormControl>
								<FormLabel color="gray.600">Hạn sử dụng</FormLabel>
								<Text>{formatDate(batch.expirationDate)}</Text>
							</FormControl>
						</HStack>

						{/* Editable fields */}
						<FormControl isRequired>
							<FormLabel>Số lượng tồn kho</FormLabel>
							<Input
								type="number"
								value={formData.stockQuantity}
								onChange={(e) =>
									setFormData({
										...formData,
										stockQuantity: parseInt(e.target.value) || 0,
									})
								}
								min={0}
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Trạng thái</FormLabel>
							<Select
								value={formData.status}
								onChange={(e) =>
									setFormData({
										...formData,
										status: e.target.value,
									})
								}>
								<option value="AVAILABLE">Còn hàng</option>
								<option value="EXPIRED">Hết hạn</option>
								<option value="SOLD_OUT">Đã bán hết</option>
							</Select>
						</FormControl>

						<Text
							fontSize="sm"
							color="gray.500"
							alignSelf="flex-start">
							Lưu ý: Chỉ có thể chỉnh sửa số lượng và trạng thái. 
							Các thông tin khác được cố định khi nhập lô hàng.
						</Text>
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
						bg="brand.500"
						color="white"
						_hover={{ bg: "brand.600" }}
						onClick={handleSubmit}
						isLoading={loading}>
						Cập nhật
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default EditBatchModal;
