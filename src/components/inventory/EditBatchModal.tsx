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
		stockQuantity: 0,
		status: "active" as "active" | "expired" | "sold-out",
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

		setLoading(true);
		try {
			await onUpdate(batch.lotId, {
				stockQuantity: formData.stockQuantity,
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

						<FormControl isRequired>
							<FormLabel>Số lượng tồn kho</FormLabel>
							<Input
								type="number"
								value={formData.stockQuantity}
								onChange={(e) =>
									setFormData({
										...formData,
										stockQuantity:
											parseInt(e.target.value) || 0,
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
