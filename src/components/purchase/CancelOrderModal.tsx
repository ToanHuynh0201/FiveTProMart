import { useState } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	VStack,
	HStack,
	Text,
	Box,
	useToast,
	FormControl,
	FormLabel,
	Textarea,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import type { PurchaseDetail, CancelPurchaseOrderRequest } from "@/types/purchase";

interface CancelOrderModalProps {
	isOpen: boolean;
	onClose: () => void;
	purchase: PurchaseDetail | null;
	staffId: string;
	onCancel: (id: string, data: CancelPurchaseOrderRequest) => Promise<void>;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
	isOpen,
	onClose,
	purchase,
	staffId,
	onCancel,
}) => {
	const toast = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [cancelReason, setCancelReason] = useState("");

	const handleClose = () => {
		setCancelReason("");
		onClose();
	};

	const handleCancel = async () => {
		if (!purchase) return;

		if (!cancelReason.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập lý do hủy đơn",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const requestData: CancelPurchaseOrderRequest = {
				staffIdChecked: staffId,
				checkDate: new Date().toISOString(),
				cancelNotesReason: cancelReason,
			};

			await onCancel(purchase._id, requestData);
			toast({
				title: "Thành công",
				description: "Đã hủy đơn hàng",
				status: "success",
				duration: 3000,
			});
			handleClose();
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể hủy đơn hàng",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!purchase) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="lg">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader
					fontSize="20px"
					fontWeight="700"
					color="red.600">
					Hủy đơn nhập hàng
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					<VStack
						spacing={4}
						align="stretch">
						{/* Warning */}
						<Box
							bg="red.50"
							p={4}
							borderRadius="8px"
							borderLeft="4px solid"
							borderColor="red.500">
							<Text
								fontWeight="600"
								color="red.700"
								mb={2}>
								Bạn có chắc chắn muốn hủy đơn này?
							</Text>
							<Text
								fontSize="14px"
								color="gray.600">
								Hành động này không thể hoàn tác. Đơn hàng sẽ được
								chuyển sang trạng thái "Đã hủy".
							</Text>
						</Box>

						{/* Order Info */}
						<Box
							bg="gray.50"
							p={4}
							borderRadius="8px">
							<HStack justify="space-between">
								<Text
									fontSize="14px"
									color="gray.600">
									Mã đơn:
								</Text>
								<Text
									fontSize="14px"
									fontWeight="600"
									color="brand.500">
									{purchase.poCode}
								</Text>
							</HStack>
							<HStack
								justify="space-between"
								mt={2}>
								<Text
									fontSize="14px"
									color="gray.600">
									Nhà cung cấp:
								</Text>
								<Text
									fontSize="14px"
									fontWeight="500">
									{purchase.supplier.supplierName}
								</Text>
							</HStack>
							<HStack
								justify="space-between"
								mt={2}>
								<Text
									fontSize="14px"
									color="gray.600">
									Số sản phẩm:
								</Text>
								<Text
									fontSize="14px"
									fontWeight="500">
									{purchase.items.length}
								</Text>
							</HStack>
						</Box>

						{/* Cancel Reason */}
						<FormControl isRequired>
							<FormLabel fontSize="14px">Lý do hủy đơn</FormLabel>
							<Textarea
								value={cancelReason}
								onChange={(e) => setCancelReason(e.target.value)}
								placeholder="VD: Nhà cung cấp báo hết hàng, sai thông tin đơn hàng..."
								rows={3}
							/>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter borderTop="1px solid" borderColor="gray.200">
					<Button
						variant="ghost"
						mr={3}
						onClick={handleClose}>
						Đóng
					</Button>
					<Button
						colorScheme="red"
						leftIcon={<CloseIcon />}
						onClick={handleCancel}
						isLoading={isSubmitting}
						isDisabled={!cancelReason.trim()}>
						Xác nhận hủy
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
