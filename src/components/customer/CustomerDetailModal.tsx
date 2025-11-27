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
import type { CustomerDetail } from "@/types";
import { customerService } from "@/services/customerService";
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
			const data = await customerService.getCustomerDetailById(
				customerId,
			);
			setCustomerDetail(data || null);
		} catch (error) {
			console.error("Error loading customer detail:", error);
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
			gap={3}
			py={3}
			px={4}
			bg="gray.50"
			borderRadius="12px">
			<Icon
				as={icon}
				w="20px"
				h="20px"
				color="brand.500"
			/>
			<Box flex={1}>
				<Text
					fontSize="12px"
					fontWeight="600"
					color="gray.600"
					mb={1}>
					{label}
				</Text>
				<Text
					fontSize="14px"
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
			size="2xl"
			isCentered>
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent
				borderRadius="24px"
				maxH="90vh"
				overflowY="auto"
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
					py={6}>
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
							spacing={6}
							align="stretch">
							{/* Header Section */}
							<Flex
								gap={6}
								align="start">
								{/* Avatar */}
								<Box
									w="100px"
									h="100px"
									borderRadius="full"
									bg="brand.100"
									display="flex"
									alignItems="center"
									justifyContent="center"
									fontSize="40px"
									fontWeight="700"
									color="brand.500"
									flexShrink={0}>
									{customerDetail.name.charAt(0)}
								</Box>
								{/* Basic Info */}
								<VStack
									align="start"
									spacing={3}
									flex={1}>
									<Text
										fontSize="28px"
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
											fontSize="14px"
											borderRadius="full"
											px={4}
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
												fontSize="14px"
												borderRadius="full"
												px={4}
												py={1}>
												{customerDetail.status ===
												"active"
													? "Hoạt động"
													: "Không hoạt động"}
											</Badge>
										)}
									</Flex>
								</VStack>
							</Flex>

							<Divider />

							{/* Loyalty Points Highlight */}
							<Box
								bg="gradient.brand"
								borderRadius="16px"
								p={6}
								textAlign="center">
								<Flex
									align="center"
									justify="center"
									gap={3}
									mb={2}>
									<Icon
										as={FiStar}
										w="32px"
										h="32px"
										color="orange.400"
									/>
									<Text
										fontSize="18px"
										fontWeight="600"
										color="white">
										Điểm tích lũy
									</Text>
								</Flex>
								<Text
									fontSize="48px"
									fontWeight="900"
									color="white"
									lineHeight="1">
									{customerDetail.loyaltyPoints.toLocaleString(
										"vi-VN",
									)}
								</Text>
								<Text
									fontSize="14px"
									fontWeight="400"
									color="white"
									opacity={0.9}
									mt={1}>
									điểm
								</Text>
							</Box>

							<Divider />

							{/* Contact Information */}
							<Box>
								<Text
									fontSize="18px"
									fontWeight="700"
									color="brand.600"
									mb={4}>
									Thông tin liên hệ
								</Text>
								<VStack
									spacing={3}
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
							</Box>

							<Divider />

							{/* Customer Statistics */}
							<Box>
								<Text
									fontSize="18px"
									fontWeight="700"
									color="brand.600"
									mb={4}>
									Thống kê khách hàng
								</Text>
								<Grid
									templateColumns="repeat(2, 1fr)"
									gap={4}>
									<GridItem>
										<InfoRow
											icon={FiCalendar}
											label="Ngày đăng ký"
											value={
												customerDetail.registeredDate
											}
										/>
									</GridItem>
									<GridItem>
										<InfoRow
											icon={FiCalendar}
											label="Ngày sinh"
											value={customerDetail.dateOfBirth}
										/>
									</GridItem>
									<GridItem>
										<InfoRow
											icon={FiShoppingBag}
											label="Số lần mua hàng"
											value={customerDetail.purchaseCount}
										/>
									</GridItem>
									<GridItem>
										<InfoRow
											icon={FiCalendar}
											label="Lần mua gần nhất"
											value={
												customerDetail.lastPurchaseDate
											}
										/>
									</GridItem>
									<GridItem colSpan={2}>
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
							</Box>
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
