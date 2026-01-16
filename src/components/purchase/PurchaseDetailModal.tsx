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
	Image,
	SimpleGrid,
	Spinner,
	Flex,
} from "@chakra-ui/react";
import type { PurchaseDetail, PurchaseStatus } from "@/types/purchase";

interface PurchaseDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	purchase: PurchaseDetail | null;
	isLoading?: boolean;
}

export const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({
	isOpen,
	onClose,
	purchase,
	isLoading = false,
}) => {
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "-";
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("vi-VN");
		} catch {
			return dateString;
		}
	};

	const getStatusBadge = (status: PurchaseStatus) => {
		const statusConfig = {
			Draft: { color: "gray", label: "Nháp" },
			Completed: { color: "green", label: "Hoàn thành" },
			Cancelled: { color: "red", label: "Đã hủy" },
		};
		const config = statusConfig[status];
		if (!config) return null;
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
					Chi tiết đơn nhập hàng
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody>
					{isLoading ? (
						<Flex
							justify="center"
							align="center"
							py={10}>
							<Spinner
								size="lg"
								color="brand.500"
							/>
						</Flex>
					) : !purchase ? (
						<Text
							textAlign="center"
							py={10}
							color="gray.500">
							Không tìm thấy thông tin đơn hàng
						</Text>
					) : (
						<VStack
							spacing={6}
							align="stretch">
							{/* Thông tin chung và Nhà cung cấp - ngang */}
							<HStack
								spacing={4}
								align="start">
								{/* Thông tin đơn hàng */}
								<Box flex={1}>
									<Text
										fontSize="16px"
										fontWeight="600"
										color="gray.700"
										mb={3}>
										Thông tin đơn hàng
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
												Mã đơn:
											</Text>
											<Text
												fontSize="14px"
												fontWeight="600"
												color="brand.500">
												{purchase.poCode}
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
												Ngày tạo:
											</Text>
											<Text
												fontSize="14px"
												fontWeight="500">
												{formatDate(purchase.purchaseDate)}
											</Text>
										</HStack>
										{purchase.checkDate && (
											<HStack justify="space-between">
												<Text
													fontSize="14px"
													color="gray.600">
													Ngày kiểm:
												</Text>
												<Text
													fontSize="14px"
													fontWeight="500">
													{formatDate(purchase.checkDate)}
												</Text>
											</HStack>
										)}
										<Divider borderColor="gray.300" />
										<HStack justify="space-between">
											<Text
												fontSize="16px"
												fontWeight="700">
												Tổng tiền:
											</Text>
											<Text
												fontSize="18px"
												fontWeight="700"
												color="brand.500">
												{formatCurrency(purchase.totalAmount)}
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
											{purchase.supplier.supplierName}
										</Text>
										{purchase.supplier.phone && (
											<Text
												fontSize="14px"
												color="gray.600">
												SĐT: {purchase.supplier.phone}
											</Text>
										)}
										{purchase.supplier.representName && (
											<Text
												fontSize="14px"
												color="gray.600">
												Người đại diện:{" "}
												{purchase.supplier.representName}
											</Text>
										)}
										{purchase.supplier.representPhoneNumber && (
											<Text
												fontSize="14px"
												color="gray.600">
												SĐT đại diện:{" "}
												{purchase.supplier.representPhoneNumber}
											</Text>
										)}
									</VStack>
								</Box>
							</HStack>

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
										<Text fontSize="14px">{purchase.notes}</Text>
									</Box>
								</Box>
							)}

							{/* Thông tin hóa đơn (nếu có) */}
							{purchase.invoice && (
								<Box>
									<Text
										fontSize="16px"
										fontWeight="600"
										color="gray.700"
										mb={3}>
										Thông tin hóa đơn
									</Text>
									<VStack
										spacing={2}
										align="stretch"
										bg="blue.50"
										p={4}
										borderRadius="8px"
										borderLeft="4px solid"
										borderColor="blue.500">
										<HStack>
											<Text
												fontSize="14px"
												color="gray.600"
												minW="120px">
												Số hóa đơn:
											</Text>
											<Text
												fontSize="14px"
												fontWeight="600">
												{purchase.invoice.invoiceNumber}
											</Text>
										</HStack>
										<HStack>
											<Text
												fontSize="14px"
												color="gray.600"
												minW="120px">
												Ngày hóa đơn:
											</Text>
											<Text
												fontSize="14px"
												fontWeight="500">
												{formatDate(purchase.invoice.invoiceDate)}
											</Text>
										</HStack>
										{purchase.invoice.images &&
											purchase.invoice.images.length > 0 && (
												<Box mt={2}>
													<Text
														fontSize="14px"
														color="gray.600"
														mb={2}>
														Ảnh hóa đơn:
													</Text>
													<SimpleGrid
														columns={3}
														spacing={2}>
														{purchase.invoice.images.map(
															(img, index) => (
																<Image
																	key={index}
																	src={img}
																	alt={`Invoice ${index + 1}`}
																	borderRadius="md"
																	maxH="100px"
																	objectFit="cover"
																	cursor="pointer"
																	onClick={() =>
																		window.open(
																			img,
																			"_blank",
																		)
																	}
																/>
															),
														)}
													</SimpleGrid>
												</Box>
											)}
									</VStack>
								</Box>
							)}

							<Divider />

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
												<Th>Tên sản phẩm</Th>
												<Th isNumeric>SL đặt</Th>
												<Th isNumeric>SL nhận</Th>
												<Th isNumeric>Giá nhập</Th>
												<Th isNumeric>Thành tiền</Th>
											</Tr>
										</Thead>
										<Tbody>
											{purchase.items.map((item, index) => (
												<Tr key={item.productId}>
													<Td>{index + 1}</Td>
													<Td fontSize="13px">
														{item.productName}
													</Td>
													<Td
														isNumeric
														fontSize="13px">
														{item.quantityOrdered}
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														fontWeight="600"
														color={
															item.quantityReceived > 0
																? "green.600"
																: "gray.500"
														}>
														{item.quantityReceived}
													</Td>
													<Td
														isNumeric
														fontSize="13px">
														{item.importPrice > 0
															? formatCurrency(
																	item.importPrice,
															  )
															: "-"}
													</Td>
													<Td
														isNumeric
														fontSize="13px"
														fontWeight="700">
														{item.subTotal > 0
															? formatCurrency(
																	item.subTotal,
															  )
															: "-"}
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</Box>
							</Box>

							{/* Danh sách lot đã tạo (nếu có) */}
							{purchase.generatedLotIds &&
								purchase.generatedLotIds.length > 0 && (
									<Box>
										<Text
											fontSize="16px"
											fontWeight="600"
											color="gray.700"
											mb={3}>
											Mã lô hàng đã tạo (
											{purchase.generatedLotIds.length})
										</Text>
										<Box
											bg="green.50"
											p={4}
											borderRadius="8px"
											borderLeft="4px solid"
											borderColor="green.500">
											<HStack
												spacing={2}
												flexWrap="wrap">
												{purchase.generatedLotIds.map(
													(lotId) => (
														<Badge
															key={lotId}
															colorScheme="green"
															px={3}
															py={1}
															borderRadius="full">
															{lotId}
														</Badge>
													),
												)}
											</HStack>
										</Box>
									</Box>
								)}
						</VStack>
					)}
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
