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
							{/* Header thông tin đơn */}
							<Box
								bg={
									purchase.status === "Completed"
										? "green.50"
										: purchase.status === "Cancelled"
											? "red.50"
											: "gray.50"
								}
								p={5}
								borderRadius="12px"
								borderLeft="4px solid"
								borderColor={
									purchase.status === "Completed"
										? "green.500"
										: purchase.status === "Cancelled"
											? "red.500"
											: "gray.400"
								}>
								<HStack
									justify="space-between"
									align="start"
									flexWrap="wrap"
									gap={4}>
									<Box>
										<HStack
											spacing={3}
											mb={2}>
											<Text
												fontSize="22px"
												fontWeight="700"
												color="gray.800">
												{purchase.poCode}
											</Text>
											{getStatusBadge(purchase.status)}
										</HStack>
										<VStack
											align="start"
											spacing={1}>
											<Text
												fontSize="14px"
												color="gray.600">
												Ngày tạo đơn:{" "}
												<Text
													as="span"
													fontWeight="600"
													color="gray.800">
													{formatDate(
														purchase.purchaseDate,
													)}
												</Text>
											</Text>
											{purchase.checkDate && (
												<Text
													fontSize="14px"
													color="gray.600">
													Ngày kiểm nhận:{" "}
													<Text
														as="span"
														fontWeight="600"
														color="gray.800">
														{formatDate(
															purchase.checkDate,
														)}
													</Text>
												</Text>
											)}
										</VStack>
									</Box>
									<Box textAlign="right">
										<Text
											fontSize="14px"
											color="gray.600"
											mb={1}>
											Tổng giá trị đơn hàng
										</Text>
										<Text
											fontSize="28px"
											fontWeight="700"
											color="brand.500">
											{formatCurrency(
												purchase.totalAmount,
											)}
										</Text>
									</Box>
								</HStack>
							</Box>

							{/* Thông tin nhà cung cấp và nhân viên */}
							<HStack
								spacing={4}
								align="start">
								{/* Nhà cung cấp */}
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
										bg="blue.50"
										p={4}
										borderRadius="8px"
										borderLeft="3px solid"
										borderColor="blue.400">
										<Text
											fontSize="16px"
											fontWeight="700"
											color="blue.800">
											{purchase.supplier.supplierName}
										</Text>
										{purchase.supplier.phone && (
											<HStack>
												<Text
													fontSize="13px"
													color="gray.600"
													fontWeight="600">
													Số điện thoại:
												</Text>
												<Text
													fontSize="13px"
													color="gray.700">
													{purchase.supplier.phone}
												</Text>
											</HStack>
										)}
										{purchase.supplier.representName && (
											<>
												<Divider borderColor="blue.200" />
												<HStack>
													<Text
														fontSize="13px"
														color="gray.600"
														fontWeight="600">
														Người đại diện:
													</Text>
													<Text
														fontSize="13px"
														color="gray.700">
														{
															purchase.supplier
																.representName
														}
													</Text>
												</HStack>
												{purchase.supplier
													.representPhoneNumber && (
													<HStack>
														<Text
															fontSize="13px"
															color="gray.600"
															fontWeight="600">
															SĐT đại diện:
														</Text>
														<Text
															fontSize="13px"
															color="gray.700">
															{
																purchase
																	.supplier
																	.representPhoneNumber
															}
														</Text>
													</HStack>
												)}
											</>
										)}
									</VStack>
								</Box>

								{/* Thông tin nhân viên */}
								<Box flex={1}>
									<Text
										fontSize="16px"
										fontWeight="600"
										color="gray.700"
										mb={3}>
										Nhân viên xử lý
									</Text>
									<VStack
										spacing={3}
										align="stretch"
										bg="purple.50"
										p={4}
										borderRadius="8px"
										borderLeft="3px solid"
										borderColor="purple.400">
										<HStack>
											<Text
												fontSize="13px"
												color="gray.600"
												fontWeight="600"
												minW="110px">
												Người tạo đơn:
											</Text>
											<Badge
												colorScheme="purple"
												fontSize="12px"
												px={2}
												py={1}>
												ID: {purchase.staffIdCreated}
											</Badge>
										</HStack>
										{purchase.staffIdChecked && (
											<>
												<Divider borderColor="purple.200" />
												<HStack>
													<Text
														fontSize="13px"
														color="gray.600"
														fontWeight="600"
														minW="110px">
														Người kiểm hàng:
													</Text>
													<Badge
														colorScheme="green"
														fontSize="12px"
														px={2}
														py={1}>
														ID:{" "}
														{
															purchase.staffIdChecked
														}
													</Badge>
												</HStack>
											</>
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
										Ghi chú đơn hàng
									</Text>
									<Box
										bg="yellow.50"
										p={4}
										borderRadius="8px"
										borderLeft="3px solid"
										borderColor="yellow.400">
										<Text
											fontSize="14px"
											color="gray.700"
											fontStyle="italic">
											{purchase.notes}
										</Text>
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
										Thông tin hóa đơn từ nhà cung cấp
									</Text>
									<VStack
										spacing={3}
										align="stretch"
										bg="orange.50"
										p={5}
										borderRadius="8px"
										borderLeft="4px solid"
										borderColor="orange.400">
										<HStack spacing={4}>
											<Box
												bg="white"
												p={3}
												borderRadius="md"
												flex={1}>
												<Text
													fontSize="12px"
													color="gray.500"
													mb={1}>
													Số hóa đơn
												</Text>
												<Text
													fontSize="16px"
													fontWeight="700"
													color="orange.700">
													{
														purchase.invoice
															.invoiceNumber
													}
												</Text>
											</Box>
											<Box
												bg="white"
												p={3}
												borderRadius="md"
												flex={1}>
												<Text
													fontSize="12px"
													color="gray.500"
													mb={1}>
													Ngày hóa đơn
												</Text>
												<Text
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													{
														purchase.invoice
															.invoiceDate
													}
												</Text>
											</Box>
										</HStack>
										{purchase.invoice.images &&
											purchase.invoice.images.length >
												0 && (
												<Box>
													<Text
														fontSize="13px"
														color="gray.600"
														fontWeight="600"
														mb={2}>
														Ảnh hóa đơn (
														{
															purchase.invoice
																.images.length
														}
														)
													</Text>
													<SimpleGrid
														columns={4}
														spacing={3}>
														{purchase.invoice.images.map(
															(img, index) => (
																<Box
																	key={index}
																	position="relative"
																	bg="white"
																	p={1}
																	borderRadius="md"
																	border="2px solid"
																	borderColor="orange.200"
																	cursor="pointer"
																	transition="all 0.2s"
																	_hover={{
																		borderColor:
																			"orange.400",
																		transform:
																			"scale(1.05)",
																	}}
																	onClick={() =>
																		window.open(
																			img,
																			"_blank",
																		)
																	}>
																	<Image
																		src={
																			img
																		}
																		alt={`Invoice ${index + 1}`}
																		borderRadius="md"
																		h="120px"
																		w="100%"
																		objectFit="cover"
																	/>
																	<Badge
																		position="absolute"
																		top={2}
																		right={
																			2
																		}
																		colorScheme="orange"
																		fontSize="10px">
																		#
																		{index +
																			1}
																	</Badge>
																</Box>
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
								<HStack
									justify="space-between"
									align="center"
									mb={3}>
									<Text
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Danh sách sản phẩm
									</Text>
									<Badge
										colorScheme="blue"
										fontSize="14px"
										px={3}
										py={1}
										borderRadius="full">
										{purchase.items.length} sản phẩm
									</Badge>
								</HStack>
								<Box
									border="1px solid"
									borderColor="gray.200"
									borderRadius="8px"
									overflow="hidden"
									overflowX="auto">
									<Table size="sm">
										<Thead bg="gray.700">
											<Tr>
												<Th
													color="white"
													fontSize="12px">
													STT
												</Th>
												<Th
													color="white"
													fontSize="12px"
													minW="200px">
													Tên sản phẩm
												</Th>
												<Th
													color="white"
													fontSize="12px"
													isNumeric>
													Số lượng đặt
												</Th>
												<Th
													color="white"
													fontSize="12px"
													isNumeric>
													Số lượng nhận
												</Th>
												<Th
													color="white"
													fontSize="12px"
													isNumeric>
													Giá nhập
												</Th>
												<Th
													color="white"
													fontSize="12px"
													isNumeric>
													Thành tiền
												</Th>
											</Tr>
										</Thead>
										<Tbody>
											{purchase.items.map(
												(item, index) => (
													<Tr
														key={item.productId}
														_hover={{
															bg: "gray.50",
														}}>
														<Td fontWeight="600">
															{index + 1}
														</Td>
														<Td fontSize="14px">
															{item.productName}
														</Td>
														<Td
															isNumeric
															fontSize="14px"
															color="gray.600">
															{
																item.quantityOrdered
															}
														</Td>
														<Td
															isNumeric
															fontSize="14px"
															fontWeight="700"
															color={
																item.quantityReceived >
																0
																	? "green.600"
																	: "gray.400"
															}>
															{item.quantityReceived ||
																"-"}
														</Td>
														<Td
															isNumeric
															fontSize="14px"
															color="gray.700">
															{item.importPrice >
															0
																? formatCurrency(
																		item.importPrice,
																	)
																: "-"}
														</Td>
														<Td
															isNumeric
															fontSize="14px"
															fontWeight="700"
															color="brand.600">
															{item.subTotal > 0
																? formatCurrency(
																		item.subTotal,
																	)
																: "-"}
														</Td>
													</Tr>
												),
											)}
										</Tbody>
									</Table>
								</Box>
							</Box>

							{/* Danh sách lot đã tạo (nếu có) */}
							{purchase.generatedLotIds &&
								purchase.generatedLotIds.length > 0 && (
									<Box>
										<HStack
											justify="space-between"
											align="center"
											mb={3}>
											<Text
												fontSize="16px"
												fontWeight="600"
												color="gray.700">
												Lô hàng đã nhập kho
											</Text>
											<Badge
												colorScheme="green"
												fontSize="14px"
												px={3}
												py={1}
												borderRadius="full">
												{
													purchase.generatedLotIds
														.length
												}{" "}
												lô
											</Badge>
										</HStack>
										<Box
											bg="green.50"
											p={5}
											borderRadius="8px"
											borderLeft="4px solid"
											borderColor="green.500">
											<Text
												fontSize="13px"
												color="green.700"
												fontWeight="600"
												mb={3}>
												Các sản phẩm đã được phân bổ vào
												kho theo lô:
											</Text>
											<HStack
												spacing={2}
												flexWrap="wrap"
												gap={2}>
												{purchase.generatedLotIds.map(
													(lotId) => (
														<Badge
															key={lotId}
															colorScheme="green"
															px={4}
															py={2}
															borderRadius="md"
															fontSize="13px"
															fontWeight="700"
															border="1px solid"
															borderColor="green.300"
															bg="white">
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
