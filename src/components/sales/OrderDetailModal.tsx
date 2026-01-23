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
	Grid,
} from "@chakra-ui/react";
import type { SalesOrder } from "@/types/sales";
import { formatDate, formatTime } from "@/utils/date";

interface OrderDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	order: SalesOrder | null;
}

const OrderDetailModal = ({
	isOpen,
	onClose,
	order,
}: OrderDetailModalProps) => {
	if (!order) return null;

	const getStatusBadge = (status: SalesOrder["status"]) => {
		const statusConfig = {
			completed: { label: "Hoàn thành", colorScheme: "green" },
			draft: { label: "Nháp", colorScheme: "gray" },
			cancelled: { label: "Đã hủy", colorScheme: "red" },
		};

		const config = statusConfig[status];
		return (
			<Badge
				colorScheme={config.colorScheme}
				fontSize="md"
				px={3}
				py={1}
				borderRadius="md">
				{config.label}
			</Badge>
		);
	};

	const getPaymentMethodLabel = (method?: string) => {
		const methods = {
			cash: "Tiền mặt",
			card: "Thẻ",
			transfer: "Chuyển khoản",
		};
		return method ? methods[method as keyof typeof methods] : "-";
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="4xl"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent>
				<ModalHeader
					color="#161f70"
					fontSize="2xl">
					Chi tiết đơn hàng
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<VStack
						spacing={6}
						align="stretch">
						{/* Thông tin đơn hàng */}
						<Box>
							<Text
								fontSize="lg"
								fontWeight="semibold"
								mb={3}
								color="#161f70">
								Thông tin đơn hàng
							</Text>
							<Grid
								templateColumns="repeat(2, 1fr)"
								gap={4}
								bg="gray.50"
								p={4}
								borderRadius="lg">
								<Box>
									<Text
										fontSize="sm"
										color="gray.600">
										Mã đơn hàng
									</Text>
									<Text
										fontWeight="semibold"
										fontSize="lg">
										{order.orderNumber}
									</Text>
								</Box>
								<Box>
									<Text
										fontSize="sm"
										color="gray.600">
										Trạng thái
									</Text>
									<Box mt={1}>
										{getStatusBadge(order.status)}
									</Box>
								</Box>
								<Box>
									<Text
										fontSize="sm"
										color="gray.600">
										Thời gian tạo
									</Text>
									<Text fontWeight="medium">
										{formatDate(order.createdAt)} -{" "}
										{formatTime(order.createdAt)}
									</Text>
								</Box>
								<Box>
									<Text
										fontSize="sm"
										color="gray.600">
										Nhân viên
									</Text>
									<Text fontWeight="medium">
										{order.staff?.name || "-"}
									</Text>
								</Box>
							</Grid>
						</Box>

						<Divider />

						{/* Thông tin khách hàng */}
						<Box>
							<Text
								fontSize="lg"
								fontWeight="semibold"
								mb={3}
								color="#161f70">
								Thông tin khách hàng
							</Text>
							<Grid
								templateColumns="repeat(2, 1fr)"
								gap={4}
								bg="gray.50"
								p={4}
								borderRadius="lg">
								<Box>
									<Text
										fontSize="sm"
										color="gray.600">
										Tên khách hàng
									</Text>
									<Text fontWeight="medium">
										{order.customer?.name || "Khách lẻ"}
									</Text>
								</Box>
								<Box>
									<Text
										fontSize="sm"
										color="gray.600">
										Số điện thoại
									</Text>
									<Text fontWeight="medium">
										{order.customer?.phone || "-"}
									</Text>
								</Box>
								{order.customer?.points !== undefined && (
									<Box>
										<Text
											fontSize="sm"
											color="gray.600">
											Điểm tích lũy
										</Text>
										<Text
											fontWeight="medium"
											color="orange.500">
											{order.customer.points} điểm
										</Text>
									</Box>
								)}
							</Grid>
						</Box>

						<Divider />

						{/* Danh sách sản phẩm */}
						<Box>
							<Text
								fontSize="lg"
								fontWeight="semibold"
								mb={3}
								color="#161f70">
								Danh sách sản phẩm
							</Text>
							<Box
								overflowX="auto"
								borderWidth={1}
								borderRadius="lg">
								<Table variant="simple">
									<Thead bg="gray.50">
										<Tr>
											<Th>Mã hàng</Th>
											<Th>Tên sản phẩm</Th>
											<Th isNumeric>Đơn giá</Th>
											<Th isNumeric>Số lượng</Th>
											<Th isNumeric>Thành tiền</Th>
										</Tr>
									</Thead>
									<Tbody>
										{order.items.map((item) => (
											<Tr key={item.id}>
												<Td>{item.product.code}</Td>
												<Td>
													{item.product.name}
													{item.isFreeItem && (
														<Badge
															ml={2}
															colorScheme="green"
															fontSize="xs">
															Tặng
														</Badge>
													)}
												</Td>
												<Td isNumeric>
													{item.isFreeItem ? (
														<Text fontWeight="700" color="green.600">
															MIỄN PHÍ
														</Text>
													) : item.promotionalPrice ? (
														<VStack align="flex-end" spacing={0}>
															<Text
																fontSize="xs"
																color="gray.400"
																textDecoration="line-through">
																{item.unitPrice.toLocaleString("vi-VN")}đ
															</Text>
															<Text fontWeight="600" color="red.500">
																{item.promotionalPrice.toLocaleString("vi-VN")}đ
															</Text>
														</VStack>
													) : (
														`${item.unitPrice.toLocaleString("vi-VN")}đ`
													)}
												</Td>
												<Td isNumeric>
													{item.quantity}
												</Td>
												<Td
													isNumeric
													fontWeight="semibold">
													{item.totalPrice.toLocaleString(
														"vi-VN",
													)}
													đ
												</Td>
											</Tr>
										))}
									</Tbody>
								</Table>
							</Box>
						</Box>

						<Divider />

						{/* Thông tin thanh toán */}
						<Box>
							<Text
								fontSize="lg"
								fontWeight="semibold"
								mb={3}
								color="#161f70">
								Thông tin thanh toán
							</Text>
							<VStack
								spacing={3}
								bg="gray.50"
								p={4}
								borderRadius="lg">
								<HStack
									justify="space-between"
									w="full">
									<Text color="gray.600">Tạm tính:</Text>
									<Text fontWeight="medium">
										{order.subtotal.toLocaleString("vi-VN")}
										đ
									</Text>
								</HStack>
								{order.discount > 0 && (
									<HStack
										justify="space-between"
										w="full">
										<Text color="gray.600">Giảm giá:</Text>
										<Text
											fontWeight="medium"
											color="red.500">
											-
											{order.discount.toLocaleString(
												"vi-VN",
											)}
											đ
										</Text>
									</HStack>
								)}
								<Divider />
								<HStack
									justify="space-between"
									w="full">
									<Text
										fontSize="lg"
										fontWeight="semibold"
										color="#161f70">
										Tổng cộng:
									</Text>
									<Text
										fontSize="xl"
										fontWeight="bold"
										color="#161f70">
										{order.total.toLocaleString("vi-VN")}đ
									</Text>
								</HStack>
								<HStack
									justify="space-between"
									w="full"
									pt={2}>
									<Text color="gray.600">
										Phương thức thanh toán:
									</Text>
									<Badge
										colorScheme="blue"
										fontSize="sm"
										px={3}
										py={1}
										borderRadius="md">
										{getPaymentMethodLabel(
											order.paymentMethod,
										)}
									</Badge>
								</HStack>
							</VStack>
						</Box>
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button
						colorScheme="gray"
						mr={3}
						onClick={onClose}>
						Đóng
					</Button>
					<Button colorScheme="blue">In hóa đơn</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default OrderDetailModal;
