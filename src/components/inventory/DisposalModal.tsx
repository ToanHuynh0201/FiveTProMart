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
	Icon,
} from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import type { DisposalItem, InventoryProduct } from "@/types/inventory";

interface DisposalModalProps {
	isOpen: boolean;
	onClose: () => void;
	products: InventoryProduct[];
	onSubmit: (items: DisposalItem[], note: string) => Promise<void>;
}

/**
 * DisposalModal - Currently disabled pending batch data API
 * 
 * The disposal feature requires batch/lot information (batchId, batchNumber, 
 * expiryDate, costPrice per batch) to properly track which specific batches 
 * are being disposed.
 * 
 * The current InventoryProduct type from ProductResponse only includes:
 * - productId, productName, sellingPrice, totalStockQuantity, categoryId, unitOfMeasure
 * 
 * Missing batch-level data needed for disposal:
 * - Individual batch IDs and batch numbers
 * - Per-batch quantities and cost prices
 * - Expiry dates per batch
 * 
 * TODO: Implement GET /stock-inventories/{productId}/batches endpoint
 * or include batch details in a separate stock inventory response.
 */
const DisposalModal = ({
	isOpen,
	onClose,
	products: _products,
	onSubmit: _onSubmit,
}: DisposalModalProps) => {
	// Suppress unused variable warnings - these will be used when batch API is ready
	void _products;
	void _onSubmit;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					<Text fontSize="20px" fontWeight="700" color="brand.600">
						Hủy hàng
					</Text>
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					<VStack spacing={4} align="center" py={8}>
						<Box
							p={4}
							borderRadius="full"
							bg="orange.100"
						>
							<Icon
								as={WarningIcon}
								boxSize={8}
								color="orange.500"
							/>
						</Box>
						
						<Text
							fontSize="18px"
							fontWeight="600"
							color="gray.700"
							textAlign="center"
						>
							Tính năng chưa khả dụng
						</Text>
						
						<Text
							fontSize="14px"
							color="gray.600"
							textAlign="center"
							maxW="400px"
						>
							Tính năng hủy hàng yêu cầu thông tin chi tiết về lô hàng 
							(batch) bao gồm mã lô, ngày hết hạn và số lượng từng lô.
						</Text>
						
						<Box
							bg="orange.50"
							p={4}
							borderRadius="md"
							border="1px solid"
							borderColor="orange.200"
							w="full"
						>
							<Text fontSize="13px" color="orange.800" fontWeight="500">
								📦 Dữ liệu cần thiết:
							</Text>
							<Text fontSize="13px" color="orange.700" mt={2}>
								• Mã lô hàng (Batch ID)
								<br />
								• Số lượng từng lô
								<br />
								• Ngày hết hạn từng lô
								<br />
								• Giá vốn từng lô
							</Text>
							<Text fontSize="12px" color="orange.600" mt={3} fontStyle="italic">
								API endpoint cần được bổ sung để cung cấp thông tin lô hàng.
							</Text>
						</Box>
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button
						onClick={onClose}
						colorScheme="brand"
						size="md"
					>
						Đóng
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default DisposalModal;

