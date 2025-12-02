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
	Divider,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	Box,
} from "@chakra-ui/react";
import type { Purchase } from "../../types/purchase";
import { formatDate } from "../../utils/date";

interface PurchaseDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	purchase: Purchase | null;
}

export const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
	isOpen,
	onClose,
	purchase,
}) => {
	if (!purchase) return null;

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const getStatusBadge = (status: Purchase["status"]) => {
		const statusConfig = {
			draft: { color: "gray", label: "Nháp" },
			ordered: { color: "blue", label: "Đã đặt" },
			received: { color: "green", label: "Đã nhận" },
			cancelled: { color: "red", label: "Đã hủy" },
		};
		const config = statusConfig[status];
		return (
			<Badge
				colorScheme={config.color}
				px={3}
				py={1}
				borderRadius="full"
				fontSize="13px"
				fontWeight="600">
				{config.label}
			</Badge>
		);
	};

	const getPaymentStatusBadge = (
		paymentStatus: Purchase["paymentStatus"],
	) => {
		const statusConfig = {
			unpaid: { color: "red", label: "Chưa trả" },
			paid: { color: "green", label: "Đã trả" },
		};
		const config = statusConfig[paymentStatus];
		return (
			<Badge
				colorScheme={config.color}
				px={3}
				py={1}
				borderRadius="full"
				fontSize="13px"
				fontWeight="600">
				{config.label}
			</Badge>
		);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="5xl"
			scrollBehavior="inside">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader
					fontSize="20px"
					fontWeight="700"
					color="gray.800">
					Chi tiết phiếu nhập hàng
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					<VStack
						spacing={6}
						align="stretch">
						{/* Thông tin chung, Nhà cung cấp và Thanh toán - ngang */}
						<HStack
							spacing={4}
							align="start">
							{/* Thông tin phiếu nhập */}
							<Box flex={1}>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Thông tin phiếu nhập
								</Text>
								<VStack
									spacing={3}
									align="stretch"
									bg="gray.50"
									p={4}
									borderRadius="8px">
									<HStack justify="space-between">
										<Text
											fontSize="14px"
											color="gray.600">
											Mã phiếu nhập:
										</Text>
										<Text
											fontSize="14px"
											fontWeight="600"
											color="brand.500">
											{purchase.purchaseNumber}
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text
											fontSize="14px"
											color="gray.600">
											Trạng thái:
										</Text>
										{getStatusBadge(purchase.status)}
									</HStack>
									<HStack justify="space-between">
										<Text
											fontSize="14px"
											color="gray.600">
											Thanh toán:
										</Text>
										{getPaymentStatusBadge(
											purchase.paymentStatus,
										)}
									</HStack>
									<HStack justify="space-between">
										<Text
											fontSize="14px"
											color="gray.600">
											Kho hàng:
										</Text>
										<Text
											fontSize="14px"
											fontWeight="500">
											{purchase.warehouseLocation ||
												"N/A"}
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text
											fontSize="14px"
											color="gray.600">
											Ngày tạo:
										</Text>
										<Text
											fontSize="14px"
											fontWeight="500">
											{formatDate(purchase.createdAt)}
										</Text>
									</HStack>
								</VStack>
							</Box>

							{/* Thông tin nhà cung cấp */}
							<Box flex={1}>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Nhà cung cấp
								</Text>
								<VStack
									spacing={2}
									align="stretch"
									bg="gray.50"
									p={4}
									borderRadius="8px">
									<Text
										fontSize="15px"
										fontWeight="600">
										{purchase.supplier.name}
									</Text>
									{purchase.supplier.phone && (
										<Text
											fontSize="14px"
											color="gray.600">
											SĐT: {purchase.supplier.phone}
										</Text>
									)}
									{purchase.supplier.email && (
										<Text
											fontSize="14px"
											color="gray.600">
											Email: {purchase.supplier.email}
										</Text>
									)}
									{purchase.supplier.address && (
										<Text
											fontSize="14px"
											color="gray.600">
											Địa chỉ: {purchase.supplier.address}
										</Text>
									)}
								</VStack>
							</Box>

							{/* Thông tin thanh toán */}
							<Box flex={1}>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Thông tin thanh toán
								</Text>
								<VStack
									spacing={2}
									align="stretch"
									bg="gray.50"
									p={4}
									borderRadius="8px">
									<HStack justify="space-between">
										<Text fontSize="14px">
											Tổng tiền hàng:
										</Text>
										<Text
											fontSize="14px"
											fontWeight="600">
											{formatCurrency(purchase.subtotal)}
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text fontSize="14px">Thuế VAT:</Text>
										<Text fontSize="14px">
											{formatCurrency(purchase.tax)}
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text fontSize="14px">
											Phí vận chuyển:
										</Text>
										<Text fontSize="14px">
											{formatCurrency(
												purchase.shippingFee,
											)}
										</Text>
									</HStack>
									<HStack justify="space-between">
										<Text fontSize="14px">Giảm giá:</Text>
										<Text
											fontSize="14px"
											color="red.500">
											-{formatCurrency(purchase.discount)}
										</Text>
									</HStack>
									<Divider
										borderColor="gray.300"
										my={2}
									/>
									<HStack justify="space-between">
										<Text
											fontSize="15px"
											fontWeight="700">
											Tổng thanh toán:
										</Text>
										<Text
											fontSize="18px"
											fontWeight="700"
											color="brand.500">
											{formatCurrency(purchase.total)}
										</Text>
									</HStack>
								</VStack>
							</Box>
						</HStack>

						{/* Danh sách sản phẩm */}
						<Box>
							<Text
								fontSize="16px"
								fontWeight="600"
								color="gray.700"
								mb={3}>
								Danh sách sản phẩm ({purchase.items.length})
							</Text>
							<Box
								border="1px solid"
								borderColor="gray.200"
								borderRadius="8px"
								overflow="hidden">
								<Table size="sm">
									<Thead bg="gray.50">
										<Tr>
											<Th>STT</Th>
											<Th>Mã SP</Th>
											<Th>Tên sản phẩm</Th>
											<Th>Đơn vị</Th>
											<Th isNumeric>Số lượng</Th>
											<Th isNumeric>Đơn giá</Th>
											<Th isNumeric>Thành tiền</Th>
										</Tr>
									</Thead>
									<Tbody>
										{purchase.items.map((item, index) => (
											<Tr key={item.id}>
												<Td>{index + 1}</Td>
												<Td fontSize="13px">
													{item.productCode}
												</Td>
												<Td fontSize="13px">
													{item.productName}
												</Td>
												<Td fontSize="13px">
													{item.unit}
												</Td>
												<Td
													isNumeric
													fontSize="13px"
													fontWeight="600">
													{item.quantity}
												</Td>
												<Td
													isNumeric
													fontSize="13px">
													{formatCurrency(
														item.unitPrice,
													)}
												</Td>
												<Td
													isNumeric
													fontSize="13px"
													fontWeight="700">
													{formatCurrency(
														item.totalPrice,
													)}
												</Td>
											</Tr>
										))}
									</Tbody>
								</Table>
							</Box>
						</Box>

						{/* Ghi chú */}
						{purchase.notes && (
							<Box>
								<Text
									fontSize="16px"
									fontWeight="600"
									color="gray.700"
									mb={3}>
									Ghi chú
								</Text>
								<Box
									bg="gray.50"
									p={4}
									borderRadius="8px">
									<Text fontSize="14px">
										{purchase.notes}
									</Text>
								</Box>
							</Box>
						)}
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button
						colorScheme="brand"
						onClick={onClose}>
						Đóng
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
