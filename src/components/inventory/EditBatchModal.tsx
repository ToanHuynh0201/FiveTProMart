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
	Select,
	Text,
} from "@chakra-ui/react";
import type {
	StockInventoryItem,
	StockInventoryStatus,
	UpdateStockInventoryRequest,
} from "@/types/stockInventory";

interface EditBatchModalProps {
	isOpen: boolean;
	onClose: () => void;
	batch: StockInventoryItem | null;
	productName: string;
	onUpdate: (
		lotId: string,
		updates: UpdateStockInventoryRequest,
	) => Promise<void>;
}

const EditBatchModal = ({
	isOpen,
	onClose,
	batch,
	productName,
	onUpdate,
}: EditBatchModalProps) => {
	const [loading, setLoading] = useState(false);

	// Form state - use backend enum values
	const [formData, setFormData] = useState({
		quantityShelf: 0,
		status: "AVAILABLE" as StockInventoryStatus,
	});

	// Business rule: shelf + storage = availableQuantity
	// availableQuantity = stockQuantity - reservedQuantity (items not yet sold)
	// User only edits shelf; storage = availableQuantity - shelf
	const availableQuantity = batch
		? batch.stockQuantity - (batch.reservedQuantity ?? 0)
		: 0;
	const computedStorage = availableQuantity - formData.quantityShelf;

	// Populate form when batch changes
	useEffect(() => {
		if (batch) {
			setFormData({
				quantityShelf: batch.quantityShelf ?? 0,
				status: batch.status || "AVAILABLE",
			});
		}
	}, [batch]);

	const handleSubmit = async () => {
		if (!batch) return;

		// Validate: shelf cannot exceed available
		if (formData.quantityShelf > availableQuantity) {
			return; // Button is disabled, but guard anyway
		}

		setLoading(true);
		try {
			await onUpdate(batch.lotId, {
				quantityStorage: computedStorage,
				quantityShelf: formData.quantityShelf,
				status: formData.status,
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

						<FormControl>
							<FormLabel>Mã lô</FormLabel>
							<Input
								value={batch?.lotId || ""}
								isReadOnly
								bg="gray.50"
							/>
						</FormControl>

						<HStack
							spacing={4}
							width="full">
							<FormControl flex={1}>
								<FormLabel>Số lượng trong kho</FormLabel>
								<Input
									type="number"
									value={computedStorage}
									isReadOnly
									bg="gray.100"
									title="Tự động tính: Tổng tồn - Số lượng trưng bày"
								/>
								<Text fontSize="xs" color="gray.500" mt={1}>
									Tự động tính từ tổng tồn
								</Text>
							</FormControl>

							<FormControl
								isRequired
								flex={1}
								isInvalid={formData.quantityShelf > availableQuantity}>
								<FormLabel>Số lượng trưng bày</FormLabel>
								<Input
									type="number"
									value={formData.quantityShelf}
									onChange={(e) => {
										const value = parseInt(e.target.value) || 0;
										setFormData({
											...formData,
											quantityShelf: Math.max(0, Math.min(value, availableQuantity)),
										});
									}}
									min={0}
									max={availableQuantity}
								/>
								<Text fontSize="xs" color="gray.500" mt={1}>
									Tối đa: {availableQuantity} (tổng tồn khả dụng)
								</Text>
							</FormControl>
						</HStack>

						<Text
							fontSize="sm"
							color="gray.600"
							alignSelf="flex-start">
							Tổng số lượng khả dụng:{" "}
							<Text as="span" fontWeight="bold">{availableQuantity}</Text>
							{" "}= Trưng bày ({formData.quantityShelf}) + Trong kho ({computedStorage})
						</Text>

						<FormControl isRequired>
							<FormLabel>Trạng thái</FormLabel>
							<Select
								value={formData.status}
								onChange={(e) =>
									setFormData({
										...formData,
										status: e.target.value as StockInventoryStatus,
									})
								}>
								<option value="AVAILABLE">Còn hàng</option>
								<option value="OUT_OF_STOCK">Hết hàng</option>
								<option value="EXPIRED">Hết hạn</option>
								<option value="DISPOSED">Đã hủy</option>
							</Select>
						</FormControl>

						<Text
							fontSize="sm"
							color="gray.600"
							alignSelf="flex-start">
							* Chỉ có thể chỉnh sửa số lượng và trạng thái
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
