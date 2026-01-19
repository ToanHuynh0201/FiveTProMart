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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { customerService } from "../../services";
import type { CustomerDetail } from "@/types";
import {
	FiPhone,
	FiMail,
	FiMapPin,
	FiCalendar,
	FiStar,
	FiShoppingBag,
	FiDollarSign,
} from "react-icons/fi";

interface CustomerDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	customerId: string | null;
	onDelete?: (id: string) => void;
}

const CustomerDetailModal = ({
	isOpen,
	onClose,
	customerId,
}: CustomerDetailModalProps) => {
	const [customerDetail, setCustomerDetail] = useState<CustomerDetail | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (customerId && isOpen) {
			loadCustomerDetail();
		}
	}, [customerId, isOpen]);

	const loadCustomerDetail = async () => {
		if (!customerId) return;

		setIsLoading(true);
		try {
			const data = await customerService.getCustomerById(customerId);
			setCustomerDetail(data || null);
		} catch (error) {
			console.error("Error loading customer detail:", error);
			setCustomerDetail(null);
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
				color="brand.500"
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
					color="brand.600">
					{value || "N/A"}
				</Text>
			</Box>
		</Flex>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="5xl"
			isCentered>
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent
				borderRadius="24px"
				bg="white"
				boxShadow="0 20px 60px rgba(22, 31, 112, 0.3)">
				<ModalHeader
					borderBottom="1px solid"
					borderColor="gray.100"
					pb={4}
					pt={6}
					px={8}>
					<Text
						fontSize="24px"
						fontWeight="700"
						color="brand.600">
						Thông tin chi tiết khách hàng
					</Text>
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					color="gray.500"
					_hover={{ color: "brand.500", bg: "brand.50" }}
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
								color="brand.500"
								thickness="4px"
							/>
						</Flex>
					) : customerDetail ? (
						<VStack
							spacing={5}
							align="stretch">
							{/* Header Section - Name and Loyalty Points Side by Side */}
							<Flex
								gap={6}
								align="stretch">
								{/* Avatar */}
								<Box
									w="80px"
									h="80px"
									borderRadius="full"
									bg="brand.100"
									display="flex"
									alignItems="center"
									justifyContent="center"
									fontSize="32px"
									fontWeight="700"
									color="brand.500"
									flexShrink={0}>
									{customerDetail.name.charAt(0)}
								</Box>
								{/* Basic Info */}
								<VStack
									align="start"
									spacing={2}
									flex={1}>
									<Text
										fontSize="24px"
										fontWeight="900"
										color="brand.600">
										{customerDetail.name}
									</Text>
									<Flex
										gap={2}
										align="center">
										<Badge
											colorScheme={
												customerDetail.gender === "Nam"
													? "blue"
													: customerDetail.gender ===
													  "Nữ"
													? "pink"
													: "gray"
											}
											fontSize="13px"
											borderRadius="full"
											px={3}
											py={1}>
											{customerDetail.gender}
										</Badge>
										{customerDetail.status && (
											<Badge
												colorScheme={
													customerDetail.status ===
													"active"
														? "green"
														: "gray"
												}
												fontSize="13px"
												borderRadius="full"
												px={3}
												py={1}>
												{customerDetail.status ===
												"active"
													? "Hoạt động"
													: "Không hoạt động"}
											</Badge>
										)}
									</Flex>
								</VStack>
								{/* Loyalty Points */}
								<Box
									bg="gradient.brand"
									borderRadius="16px"
									p={4}
									textAlign="center"
									minW="200px">
									<Flex
										align="center"
										justify="center"
										gap={2}
										mb={1}>
										<Icon
											as={FiStar}
											w="20px"
											h="20px"
											color="orange.400"
										/>
										<Text
											fontSize="14px"
											fontWeight="600"
											color="brand.600">
											Điểm tích lũy
										</Text>
									</Flex>
									<Text
										fontSize="36px"
										fontWeight="900"
										color="brand.600"
										lineHeight="1">
										{customerDetail.loyaltyPoints.toLocaleString(
											"vi-VN",
										)}
									</Text>
									<Text
										fontSize="12px"
										fontWeight="400"
										color="white"
										opacity={0.9}
										mt={1}>
										điểm
									</Text>
								</Box>
							</Flex>

							<Divider />

							{/* Two Column Layout for Contact and Statistics */}
							<Grid
								templateColumns="repeat(2, 1fr)"
								gap={6}>
								{/* Contact Information */}
								<GridItem>
									<Text
										fontSize="16px"
										fontWeight="700"
										color="brand.600"
										mb={3}>
										Thông tin liên hệ
									</Text>
									<VStack
										spacing={2}
										align="stretch">
										<InfoRow
											icon={FiPhone}
											label="Số điện thoại"
											value={customerDetail.phone}
										/>
										<InfoRow
											icon={FiMail}
											label="Email"
											value={customerDetail.email}
										/>
										<InfoRow
											icon={FiMapPin}
											label="Địa chỉ"
											value={customerDetail.address}
										/>
									</VStack>
								</GridItem>

								{/* Customer Statistics */}
								<GridItem>
									<Text
										fontSize="16px"
										fontWeight="700"
										color="brand.600"
										mb={3}>
										Thống kê khách hàng
									</Text>
									<VStack
										spacing={2}
										align="stretch">
										<InfoRow
											icon={FiCalendar}
											label="Ngày đăng ký"
											value={
												customerDetail.registeredDate
											}
										/>
										<InfoRow
											icon={FiCalendar}
											label="Ngày sinh"
											value={customerDetail.dateOfBirth}
										/>
										<InfoRow
											icon={FiShoppingBag}
											label="Số lần mua hàng"
											value={customerDetail.purchaseCount}
										/>
									</VStack>
								</GridItem>

								{/* Span across both columns */}
								<GridItem colSpan={2}>
									<Grid
										templateColumns="repeat(2, 1fr)"
										gap={2}>
										<GridItem>
											<InfoRow
												icon={FiCalendar}
												label="Lần mua gần nhất"
												value={
													customerDetail.lastPurchaseDate
												}
											/>
										</GridItem>
										<GridItem>
											<InfoRow
												icon={FiDollarSign}
												label="Tổng chi tiêu"
												value={
													customerDetail.totalSpent
														? `${customerDetail.totalSpent.toLocaleString(
																"vi-VN",
														  )} VNĐ`
														: undefined
												}
											/>
										</GridItem>
									</Grid>
								</GridItem>
							</Grid>
						</VStack>
					) : (
						<Box
							textAlign="center"
							py={10}>
							<Text
								fontSize="18px"
								color="gray.500">
								Không tìm thấy thông tin khách hàng
							</Text>
						</Box>
					)}
				</ModalBody>

				{customerDetail && (
					<ModalFooter
						borderTop="1px solid"
						borderColor="gray.100">
						<Button
							variant="outline"
							onClick={onClose}>
							Đóng
						</Button>
					</ModalFooter>
				)}
			</ModalContent>
		</Modal>
	);
};

export default CustomerDetailModal;
