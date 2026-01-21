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

	// Form state
	const [formData, setFormData] = useState({
		quantityStorage: 0,
		quantityShelf: 0,
		status: "active" as "active" | "expired" | "sold-out",
	});

	// Populate form when batch changes
	useEffect(() => {
		if (batch) {
			setFormData({
				quantityStorage: batch.quantityStorage ?? 0,
				quantityShelf: batch.quantityShelf ?? 0,
				status: batch.status,
			});
		}
	}, [batch]);

	const handleSubmit = async () => {
		if (!batch) return;

		setLoading(true);
		try {
			await onUpdate(batch.lotId, {
				quantityStorage: formData.quantityStorage,
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
							<FormControl
								isRequired
								flex={1}>
								<FormLabel>Số lượng trong kho</FormLabel>
								<Input
									type="number"
									value={formData.quantityStorage}
									onChange={(e) =>
										setFormData({
											...formData,
											quantityStorage:
												parseInt(e.target.value) || 0,
										})
									}
									min={0}
								/>
							</FormControl>

							<FormControl
								isRequired
								flex={1}>
								<FormLabel>Số lượng trưng bày</FormLabel>
								<Input
									type="number"
									value={formData.quantityShelf}
									onChange={(e) =>
										setFormData({
											...formData,
											quantityShelf:
												parseInt(e.target.value) || 0,
										})
									}
									min={0}
								/>
							</FormControl>
						</HStack>

						<Text
							fontSize="sm"
							color="gray.600"
							alignSelf="flex-start">
							Tổng số lượng:{" "}
							{formData.quantityStorage + formData.quantityShelf}
						</Text>

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
