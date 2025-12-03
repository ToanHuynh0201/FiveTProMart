import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	Box,
	Flex,
	Text,
	Badge,
	Divider,
	Grid,
	GridItem,
	VStack,
	Spinner,
	Button,
	Icon,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { SupplierDetail } from "@/types/supplier";
import { supplierService } from "@/services/supplierService";
import {
	FiPhone,
	FiMail,
	FiMapPin,
	FiUser,
	FiCreditCard,
	FiPackage,
	FiShoppingCart,
	FiDollarSign,
} from "react-icons/fi";

interface SupplierDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	supplierId: string | null;
}

const SupplierDetailModal = ({
	isOpen,
	onClose,
	supplierId,
}: SupplierDetailModalProps) => {
	const [supplierDetail, setSupplierDetail] = useState<SupplierDetail | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (supplierId && isOpen) {
			loadSupplierDetail();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supplierId, isOpen]);

	const loadSupplierDetail = async () => {
		if (!supplierId) return;

		setIsLoading(true);
		try {
			const data = await supplierService.getSupplierById(supplierId);
			setSupplierDetail(data || null);
		} catch (error) {
			console.error("Error loading supplier detail:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const InfoRow = ({
		icon,
		label,
		value,
	}: {
		icon: React.ElementType;
		label: string;
		value?: string | number;
	}) => (
		<Flex
			align="center"
			gap={2}
			py={2}
			px={3}
			bg="gray.50"
			borderRadius="10px">
			<Icon
				as={icon}
				w="16px"
				h="16px"
				color="#161f70"
			/>
			<Box flex={1}>
				<Text
					fontSize="11px"
					fontWeight="600"
					color="gray.600"
					mb={0.5}>
					{label}
				</Text>
				<Text
					fontSize="13px"
					fontWeight="500"
					color="#161f70">
					{value || "N/A"}
				</Text>
			</Box>
		</Flex>
	);

	const formatCurrency = (value: number | undefined) => {
		if (!value) return "0đ";
		return value.toLocaleString("vi-VN") + "đ";
	};

	const formatDate = (date: Date | undefined) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("vi-VN");
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="6xl"
			isCentered
			scrollBehavior="inside">
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent
				borderRadius="24px"
				bg="white"
				boxShadow="0 20px 60px rgba(22, 31, 112, 0.3)"
				maxH="90vh">
				<ModalHeader
					borderBottom="1px solid"
					borderColor="gray.100"
					pb={4}
					pt={6}
					px={8}>
					<Text
						fontSize="24px"
						fontWeight="700"
						color="#161f70">
						Thông tin chi tiết nhà cung cấp
					</Text>
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					color="gray.500"
					_hover={{ color: "#161f70", bg: "blue.50" }}
					borderRadius="full"
				/>

				<ModalBody
					px={8}
					py={5}>
					{isLoading ? (
						<Flex
							justify="center"
							align="center"
							minH="400px">
							<Spinner
								size="xl"
								color="#161f70"
								thickness="4px"
							/>
						</Flex>
					) : supplierDetail ? (
						<VStack
							spacing={6}
							align="stretch">
							{/* Header Info */}
							<Flex
								justify="space-between"
								align="flex-start"
								flexWrap="wrap"
								gap={4}>
								<Box>
									<Text
										fontSize="28px"
										fontWeight="700"
										color="#161f70"
										mb={1}>
										{supplierDetail.name}
									</Text>
									<Text
										fontSize="16px"
										color="gray.600"
										fontWeight="600">
										{supplierDetail.code}
									</Text>
								</Box>
								<Badge
									colorScheme={
										supplierDetail.status === "active"
											? "green"
											: "gray"
									}
									fontSize="14px"
									px={4}
									py={2}
									borderRadius="full">
									{supplierDetail.status === "active"
										? "Hoạt động"
										: "Ngưng hoạt động"}
								</Badge>
							</Flex>

							<Divider />

							{/* Contact & Basic Info */}
							<Grid
								templateColumns={{
									base: "1fr",
									md: "repeat(3, 1fr)",
								}}
								gap={4}>
								<GridItem>
									<InfoRow
										icon={FiPhone}
										label="Số điện thoại"
										value={supplierDetail.phone}
									/>
								</GridItem>
								<GridItem>
									<InfoRow
										icon={FiMail}
										label="Email"
										value={supplierDetail.email}
									/>
								</GridItem>
								<GridItem>
									<InfoRow
										icon={FiCreditCard}
										label="Mã số thuế"
										value={supplierDetail.taxCode}
									/>
								</GridItem>
								<GridItem colSpan={{ base: 1, md: 3 }}>
									<InfoRow
										icon={FiMapPin}
										label="Địa chỉ"
										value={supplierDetail.address}
									/>
								</GridItem>
							</Grid>

							<Divider />

							{/* Contact Person & Bank Info */}
							<Grid
								templateColumns={{
									base: "1fr",
									md: "repeat(2, 1fr)",
								}}
								gap={4}>
								<GridItem>
									<InfoRow
										icon={FiUser}
										label="Người liên hệ"
										value={supplierDetail.contactPerson}
									/>
								</GridItem>
								<GridItem>
									<InfoRow
										icon={FiPhone}
										label="SĐT người liên hệ"
										value={supplierDetail.contactPhone}
									/>
								</GridItem>
								<GridItem>
									<InfoRow
										icon={FiCreditCard}
										label="Số tài khoản"
										value={supplierDetail.bankAccount}
									/>
								</GridItem>
								<GridItem>
									<InfoRow
										icon={FiCreditCard}
										label="Ngân hàng"
										value={supplierDetail.bankName}
									/>
								</GridItem>
							</Grid>

							<Divider />

							{/* Statistics */}
							<Grid
								templateColumns={{
									base: "1fr",
									md: "repeat(4, 1fr)",
								}}
								gap={4}>
								<GridItem>
									<Box
										bg="blue.50"
										p={4}
										borderRadius="12px"
										textAlign="center">
										<Icon
											as={FiPackage}
											w="24px"
											h="24px"
											color="#161f70"
											mb={2}
										/>
										<Text
											fontSize="24px"
											fontWeight="700"
											color="#161f70">
											{supplierDetail.totalProducts || 0}
										</Text>
										<Text
											fontSize="13px"
											color="gray.600">
											Sản phẩm
										</Text>
									</Box>
								</GridItem>
								<GridItem>
									<Box
										bg="green.50"
										p={4}
										borderRadius="12px"
										textAlign="center">
										<Icon
											as={FiShoppingCart}
											w="24px"
											h="24px"
											color="green.600"
											mb={2}
										/>
										<Text
											fontSize="24px"
											fontWeight="700"
											color="green.600">
											{supplierDetail.totalPurchases || 0}
										</Text>
										<Text
											fontSize="13px"
											color="gray.600">
											Đơn nhập hàng
										</Text>
									</Box>
								</GridItem>
								<GridItem colSpan={{ base: 1, md: 2 }}>
									<Box
										bg="orange.50"
										p={4}
										borderRadius="12px"
										textAlign="center">
										<Icon
											as={FiDollarSign}
											w="24px"
											h="24px"
											color="orange.600"
											mb={2}
										/>
										<Text
											fontSize="24px"
											fontWeight="700"
											color="orange.600">
											{formatCurrency(
												supplierDetail.totalValue,
											)}
										</Text>
										<Text
											fontSize="13px"
											color="gray.600">
											Tổng giá trị nhập hàng
										</Text>
									</Box>
								</GridItem>
							</Grid>

							{/* Notes */}
							{supplierDetail.notes && (
								<>
									<Divider />
									<Box>
										<Text
											fontSize="14px"
											fontWeight="600"
											color="gray.700"
											mb={2}>
											Ghi chú:
										</Text>
										<Text
											fontSize="14px"
											color="gray.600"
											bg="gray.50"
											p={3}
											borderRadius="8px">
											{supplierDetail.notes}
										</Text>
									</Box>
								</>
							)}

							<Divider />

							{/* Tabs for Products and Purchase History */}
							<Tabs
								colorScheme="blue"
								variant="enclosed">
								<TabList>
									<Tab
										_selected={{
											color: "#161f70",
											bg: "blue.50",
											borderColor: "#161f70",
										}}>
										Sản phẩm cung cấp (
										{supplierDetail.products?.length || 0})
									</Tab>
									<Tab
										_selected={{
											color: "#161f70",
											bg: "blue.50",
											borderColor: "#161f70",
										}}>
										Lịch sử nhập hàng (
										{supplierDetail.purchaseHistory
											?.length || 0}
										)
									</Tab>
								</TabList>

								<TabPanels>
									<TabPanel px={0}>
										<Box
											maxH="300px"
											overflowY="auto">
											<Table
												variant="simple"
												size="sm">
												<Thead
													bg="gray.50"
													position="sticky"
													top={0}
													zIndex={1}>
													<Tr>
														<Th>Mã SP</Th>
														<Th>Tên sản phẩm</Th>
														<Th>Nhóm hàng</Th>
														<Th>Đơn vị</Th>
														<Th isNumeric>
															Giá nhập gần nhất
														</Th>
														<Th>
															Ngày nhập gần nhất
														</Th>
													</Tr>
												</Thead>
												<Tbody>
													{supplierDetail.products &&
													supplierDetail.products
														.length > 0 ? (
														supplierDetail.products.map(
															(product) => (
																<Tr
																	key={
																		product.id
																	}>
																	<Td fontWeight="600">
																		{
																			product.productCode
																		}
																	</Td>
																	<Td>
																		{
																			product.productName
																		}
																	</Td>
																	<Td>
																		<Badge colorScheme="purple">
																			{
																				product.category
																			}
																		</Badge>
																	</Td>
																	<Td>
																		{
																			product.unit
																		}
																	</Td>
																	<Td
																		isNumeric
																		color="green.600"
																		fontWeight="600">
																		{formatCurrency(
																			product.lastPurchasePrice,
																		)}
																	</Td>
																	<Td>
																		{formatDate(
																			product.lastPurchaseDate,
																		)}
																	</Td>
																</Tr>
															),
														)
													) : (
														<Tr>
															<Td
																colSpan={6}
																textAlign="center"
																color="gray.500">
																Chưa có sản phẩm
																nào
															</Td>
														</Tr>
													)}
												</Tbody>
											</Table>
										</Box>
									</TabPanel>

									<TabPanel px={0}>
										<Box
											maxH="300px"
											overflowY="auto">
											<Table
												variant="simple"
												size="sm">
												<Thead
													bg="gray.50"
													position="sticky"
													top={0}
													zIndex={1}>
													<Tr>
														<Th>Mã phiếu</Th>
														<Th>Ngày nhập</Th>
														<Th isNumeric>
															Số mặt hàng
														</Th>
														<Th isNumeric>
															Tổng tiền
														</Th>
														<Th>Trạng thái</Th>
													</Tr>
												</Thead>
												<Tbody>
													{supplierDetail.purchaseHistory &&
													supplierDetail
														.purchaseHistory
														.length > 0 ? (
														supplierDetail.purchaseHistory.map(
															(purchase) => (
																<Tr
																	key={
																		purchase.id
																	}>
																	<Td fontWeight="600">
																		{
																			purchase.purchaseNumber
																		}
																	</Td>
																	<Td>
																		{formatDate(
																			purchase.date,
																		)}
																	</Td>
																	<Td
																		isNumeric>
																		{
																			purchase.itemCount
																		}
																	</Td>
																	<Td
																		isNumeric
																		color="green.600"
																		fontWeight="600">
																		{formatCurrency(
																			purchase.totalAmount,
																		)}
																	</Td>
																	<Td>
																		<Badge
																			colorScheme={
																				purchase.status ===
																				"received"
																					? "green"
																					: purchase.status ===
																					  "ordered"
																					? "blue"
																					: "red"
																			}>
																			{purchase.status ===
																			"received"
																				? "Đã nhận"
																				: purchase.status ===
																				  "ordered"
																				? "Đã đặt"
																				: "Đã hủy"}
																		</Badge>
																	</Td>
																</Tr>
															),
														)
													) : (
														<Tr>
															<Td
																colSpan={5}
																textAlign="center"
																color="gray.500">
																Chưa có lịch sử
																nhập hàng
															</Td>
														</Tr>
													)}
												</Tbody>
											</Table>
										</Box>
									</TabPanel>
								</TabPanels>
							</Tabs>
						</VStack>
					) : (
						<Text
							textAlign="center"
							color="gray.500"
							py={10}>
							Không tìm thấy thông tin nhà cung cấp
						</Text>
					)}
				</ModalBody>

				<ModalFooter
					borderTop="1px solid"
					borderColor="gray.100"
					px={8}
					py={4}>
					<Button
						onClick={onClose}
						size="lg"
						bg="#161f70"
						color="white"
						_hover={{ bg: "#0f1654" }}
						px={8}>
						Đóng
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default SupplierDetailModal;
