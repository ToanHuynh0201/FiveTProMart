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

const EditBatchModal = ({
	isOpen,
	onClose,
	batch,
	productName,
	onUpdate,
}: EditBatchModalProps) => {
	const toast = useToast();
	const [loading, setLoading] = useState(false);

	// Form state
	const [formData, setFormData] = useState({
		batchNumber: "",
		quantity: 0,
		quantityInStock: 0,
		quantityOnDisplay: 0,
		costPrice: 0,
		expiryDate: "",
		importDate: "",
		supplier: "",
		status: "active" as "active" | "expired" | "sold-out",
	});

	// Populate form when batch changes
	useEffect(() => {
		if (batch) {
			setFormData({
				batchNumber: batch.batchNumber,
				quantity: batch.quantity,
				quantityInStock: batch.quantityInStock || 0,
				quantityOnDisplay: batch.quantityOnDisplay || 0,
				costPrice: batch.costPrice,
				expiryDate: batch.expiryDate
					? new Date(batch.expiryDate).toISOString().split("T")[0]
					: "",
				importDate: new Date(batch.importDate)
					.toISOString()
					.split("T")[0],
				supplier: batch.supplier || "",
				status: batch.status,
			});
		}
	}, [batch]);

	const handleSubmit = async () => {
		if (!batch) return;

		// Validation
		if (!formData.batchNumber.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập số lô",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (formData.quantityInStock < 0 || formData.quantityOnDisplay < 0) {
			toast({
				title: "Lỗi",
				description: "Số lượng không được âm",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (formData.quantityInStock + formData.quantityOnDisplay <= 0) {
			toast({
				title: "Lỗi",
				description: "Tổng số lượng phải lớn hơn 0",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (formData.costPrice <= 0) {
			toast({
				title: "Lỗi",
				description: "Giá vốn phải lớn hơn 0",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!formData.importDate) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn ngày nhập",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setLoading(true);
		try {
			await onUpdate(batch.id, {
				batchNumber: formData.batchNumber,
				quantity: formData.quantityInStock + formData.quantityOnDisplay,
				quantityInStock: formData.quantityInStock,
				quantityOnDisplay: formData.quantityOnDisplay,
				costPrice: formData.costPrice,
				expiryDate: formData.expiryDate
					? new Date(formData.expiryDate)
					: undefined,
				importDate: new Date(formData.importDate),
				supplier: formData.supplier,
				status: formData.status,
			});

			toast({
				title: "Thành công",
				description: "Đã cập nhật lô hàng",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
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
						<FormControl>
							<FormLabel>Sản phẩm</FormLabel>
							<Input
								value={productName}
								isReadOnly
								bg="gray.50"
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Số lô</FormLabel>
							<Input
								value={formData.batchNumber}
								onChange={(e) =>
									setFormData({
										...formData,
										batchNumber: e.target.value,
									})
								}
								placeholder="VD: LOT001"
							/>
						</FormControl>

						<HStack
							width="100%"
							spacing={4}>
							<FormControl isRequired>
								<FormLabel>SL trong kho</FormLabel>
								<Input
									type="number"
									value={formData.quantityInStock}
									onChange={(e) =>
										setFormData({
											...formData,
											quantityInStock:
												parseInt(e.target.value) || 0,
										})
									}
									min={0}
								/>
							</FormControl>

							<FormControl isRequired>
								<FormLabel>SL trưng bày</FormLabel>
								<Input
									type="number"
									value={formData.quantityOnDisplay}
									onChange={(e) =>
										setFormData({
											...formData,
											quantityOnDisplay:
												parseInt(e.target.value) || 0,
										})
									}
									min={0}
								/>
							</FormControl>
						</HStack>

						<HStack
							width="100%"
							spacing={4}>
							<FormControl>
								<FormLabel>Tổng số lượng</FormLabel>
								<Input
									type="number"
									value={formData.quantityInStock + formData.quantityOnDisplay}
									isReadOnly
									bg="gray.50"
								/>
							</FormControl>

							<FormControl isRequired>
								<FormLabel>Giá vốn (VNĐ)</FormLabel>
								<Input
									type="number"
									value={formData.costPrice}
									onChange={(e) =>
										setFormData({
											...formData,
											costPrice:
												parseInt(e.target.value) || 0,
										})
									}
									min={0}
								/>
							</FormControl>
						</HStack>

						<HStack
							width="100%"
							spacing={4}>
							<FormControl isRequired>
								<FormLabel>Ngày nhập</FormLabel>
								<Input
									type="date"
									value={formData.importDate}
									onChange={(e) =>
										setFormData({
											...formData,
											importDate: e.target.value,
										})
									}
								/>
							</FormControl>

							<FormControl>
								<FormLabel>Hạn sử dụng</FormLabel>
								<Input
									type="date"
									value={formData.expiryDate}
									onChange={(e) =>
										setFormData({
											...formData,
											expiryDate: e.target.value,
										})
									}
								/>
							</FormControl>
						</HStack>

						<FormControl>
							<FormLabel>Nhà cung cấp</FormLabel>
							<Input
								value={formData.supplier}
								onChange={(e) =>
									setFormData({
										...formData,
										supplier: e.target.value,
									})
								}
								placeholder="Tên nhà cung cấp"
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Trạng thái</FormLabel>
							<Select
								value={formData.status}
								onChange={(e) =>
									setFormData({
										...formData,
										status: e.target.value as
											| "active"
											| "expired"
											| "sold-out",
									})
								}>
								<option value="active">Đang hoạt động</option>
								<option value="expired">Hết hạn</option>
								<option value="sold-out">Đã bán hết</option>
							</Select>
						</FormControl>

						<Text
							fontSize="sm"
							color="gray.600"
							alignSelf="flex-start">
							* Các trường có dấu sao là bắt buộc
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
						bg="#161f70"
						color="white"
						_hover={{ bg: "#0f1654" }}
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
