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
	Tooltip,
	IconButton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { SupplierDetail } from "@/types/supplier";
import { supplierService } from "@/services/supplierService";
import { purchaseService } from "@/services/purchaseService";
import { PurchaseDetailModal } from "@/components/purchase/PurchaseDetailModal";
import type { Purchase } from "@/types/purchase";
import {
	FiPhone,
	FiMail,
	FiMapPin,
	FiUser,
	FiCreditCard,
	FiEye,
	FiCopy,
	FiCheck,
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
	const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(
		null,
	);
	const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
		null,
	);
	const [isCopied, setIsCopied] = useState(false);
	const [isPhoneCopied, setIsPhoneCopied] = useState(false);
	const [isContactPhoneCopied, setIsContactPhoneCopied] = useState(false);

	// Load purchase detail when selectedPurchaseId changes
	useEffect(() => {
		if (selectedPurchaseId) {
			loadPurchaseDetail(selectedPurchaseId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPurchaseId]);

	const loadPurchaseDetail = async (purchaseId: string) => {
		try {
			const purchase = await purchaseService.getPurchaseById(purchaseId);
			setSelectedPurchase(purchase || null);
		} catch (error) {
			console.error("Error loading purchase detail:", error);
			setSelectedPurchase(null);
		}
	};

	const handleClosePurchaseDetail = () => {
		setSelectedPurchaseId(null);
		setSelectedPurchase(null);
	};

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
			setSupplierDetail(null);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyBankAccount = async () => {
		if (!supplierDetail?.bankAccount) return;

		try {
			await navigator.clipboard.writeText(supplierDetail.bankAccount);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const handleCopyPhone = async () => {
		if (!supplierDetail?.phone) return;

		try {
			await navigator.clipboard.writeText(supplierDetail.phone);
			setIsPhoneCopied(true);
			setTimeout(() => setIsPhoneCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const handleCopyContactPhone = async () => {
		if (!supplierDetail?.contactPhone) return;

		try {
			await navigator.clipboard.writeText(supplierDetail.contactPhone);
			setIsContactPhoneCopied(true);
			setTimeout(() => setIsContactPhoneCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
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
		<>
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

							{/* Contact & Basic Info - 4 columns layout */}
							<Grid
								templateColumns={{
									base: "1fr",
									md: "repeat(4, 1fr)",
								}}
								gap={4}>
								<GridItem>
									<Flex
										align="center"
										gap={2}
										py={2}
										px={3}
										bg="gray.50"
										borderRadius="10px"
										cursor={supplierDetail.phone ? "pointer" : "default"}
										onClick={handleCopyPhone}
										_hover={
											supplierDetail.phone
												? { bg: "gray.100" }
												: {}
										}
										transition="background 0.2s">
										<Icon
											as={FiPhone}
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
												Số điện thoại
											</Text>
											<Flex
												align="center"
												gap={2}>
												<Text
													fontSize="13px"
													fontWeight="500"
													color="#161f70">
													{supplierDetail.phone || "N/A"}
												</Text>
												{supplierDetail.phone && (
													<Tooltip
														label={isPhoneCopied ? "Đã copy!" : "Click để copy"}
														placement="top"
														hasArrow>
														<Box>
															<Icon
																as={isPhoneCopied ? FiCheck : FiCopy}
																w="14px"
																h="14px"
																color={isPhoneCopied ? "green.500" : "gray.500"}
															/>
														</Box>
													</Tooltip>
												)}
											</Flex>
										</Box>
									</Flex>
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
								<GridItem>
									<InfoRow
										icon={FiUser}
										label="Người liên hệ"
										value={supplierDetail.contactPerson}
									/>
								</GridItem>
								<GridItem>
									<Flex
										align="center"
										gap={2}
										py={2}
										px={3}
										bg="gray.50"
										borderRadius="10px"
										cursor={supplierDetail.contactPhone ? "pointer" : "default"}
										onClick={handleCopyContactPhone}
										_hover={
											supplierDetail.contactPhone
												? { bg: "gray.100" }
												: {}
										}
										transition="background 0.2s">
										<Icon
											as={FiPhone}
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
												SĐT người liên hệ
											</Text>
											<Flex
												align="center"
												gap={2}>
												<Text
													fontSize="13px"
													fontWeight="500"
													color="#161f70">
													{supplierDetail.contactPhone || "N/A"}
												</Text>
												{supplierDetail.contactPhone && (
													<Tooltip
														label={isContactPhoneCopied ? "Đã copy!" : "Click để copy"}
														placement="top"
														hasArrow>
														<Box>
															<Icon
																as={isContactPhoneCopied ? FiCheck : FiCopy}
																w="14px"
																h="14px"
																color={isContactPhoneCopied ? "green.500" : "gray.500"}
															/>
														</Box>
													</Tooltip>
												)}
											</Flex>
										</Box>
									</Flex>
								</GridItem>
								<GridItem>
									<Flex
										align="center"
										gap={2}
										py={2}
										px={3}
										bg="gray.50"
										borderRadius="10px"
										cursor={supplierDetail.bankAccount ? "pointer" : "default"}
										onClick={handleCopyBankAccount}
										_hover={
											supplierDetail.bankAccount
												? { bg: "gray.100" }
												: {}
										}
										transition="background 0.2s">
										<Icon
											as={FiCreditCard}
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
												Số tài khoản
											</Text>
											<Flex
												align="center"
												gap={2}>
												<Text
													fontSize="13px"
													fontWeight="500"
													color="#161f70">
													{supplierDetail.bankAccount || "N/A"}
												</Text>
												{supplierDetail.bankAccount && (
													<Tooltip
														label={isCopied ? "Đã copy!" : "Click để copy"}
														placement="top"
														hasArrow>
														<Box>
															<Icon
																as={isCopied ? FiCheck : FiCopy}
																w="14px"
																h="14px"
																color={isCopied ? "green.500" : "gray.500"}
															/>
														</Box>
													</Tooltip>
												)}
											</Flex>
										</Box>
									</Flex>
								</GridItem>
								<GridItem>
									<InfoRow
										icon={FiCreditCard}
										label="Ngân hàng"
										value={supplierDetail.bankName}
									/>
								</GridItem>
								<GridItem>
									<Flex
										align="center"
										gap={2}
										py={2}
										px={3}
										bg="gray.50"
										borderRadius="10px">
										<Icon
											as={FiMapPin}
											w="16px"
											h="16px"
											color="#161f70"
											flexShrink={0}
										/>
										<Box flex={1}>
											<Text
												fontSize="11px"
												fontWeight="600"
												color="gray.600"
												mb={0.5}>
												Địa chỉ
											</Text>
											<Tooltip
												label={supplierDetail.address || "N/A"}
												placement="top"
												hasArrow>
												<Text
													fontSize="13px"
													fontWeight="500"
													color="#161f70"
													noOfLines={1}
													cursor="default">
													{supplierDetail.address || "N/A"}
												</Text>
											</Tooltip>
										</Box>
									</Flex>
								</GridItem>
							</Grid>

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
											maxH="450px"
											overflowY="auto">
											<Table
												variant="simple"
												size="md">
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
											maxH="450px"
											overflowY="auto">
											<Table
												variant="simple"
												size="md">
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
														<Th textAlign="center">
															Chi tiết
														</Th>
													</Tr>
												</Thead>
												<Tbody>
													{supplierDetail.purchaseHistory &&
													supplierDetail
														.purchaseHistory
														.length > 0 ? (
														// Sort by date descending (newest first)
														[
															...supplierDetail.purchaseHistory,
														]
															.sort(
																(a, b) =>
																	new Date(
																		b.date,
																	).getTime() -
																	new Date(
																		a.date,
																	).getTime(),
															)
															.map(
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
																		<Td textAlign="center">
																			<Tooltip
																				label="Xem chi tiết"
																				placement="top">
																				<IconButton
																					aria-label="Xem chi tiết"
																					icon={
																						<Icon
																							as={
																								FiEye
																							}
																						/>
																					}
																					size="sm"
																					colorScheme="blue"
																					variant="ghost"
																					onClick={() =>
																						setSelectedPurchaseId(
																							purchase.id,
																						)
																					}
																				/>
																			</Tooltip>
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

		{/* Purchase Detail Modal */}
		<PurchaseDetailModal
			isOpen={!!selectedPurchase}
			onClose={handleClosePurchaseDetail}
			purchase={selectedPurchase}
		/>
	</>
	);
};

export default SupplierDetailModal;
