import {
	Box,
	Flex,
	Text,
	Icon,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	IconButton,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	useDisclosure,
	useToast,
	Portal,
	Badge,
} from "@chakra-ui/react";
import type { Customer } from "@/types";
import { useState } from "react";
import { FiUser, FiPhone, FiStar } from "react-icons/fi";

interface CustomerCardProps {
	customer: Customer;
	onViewDetails?: (id: string) => void;
	onDelete?: (id: string) => void;
}

const CustomerCard = ({
	customer,
	onViewDetails,
	onDelete,
}: CustomerCardProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [isDeleting, setIsDeleting] = useState(false);
	const toast = useToast();

	const handleDelete = async () => {
		if (!onDelete) return;

		setIsDeleting(true);
		try {
			await onDelete(customer.id);
			onClose();
			toast({
				title: "Thành công",
				description: "Xóa khách hàng thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Error deleting customer:", error);
			toast({
				title: "Lỗi",
				description: "Không thể xóa khách hàng",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Box
			bg="white"
			borderRadius="24px"
			p={6}
			boxShadow="11px 9px 19px 0px rgba(187, 214, 255, 1)"
			transition="all 0.3s ease"
			_hover={{
				transform: "translateY(-4px)",
				boxShadow: "15px 12px 25px 0px rgba(187, 214, 255, 1.2)",
			}}
			cursor="pointer"
			position="relative"
			onClick={() => onViewDetails?.(customer.id)}
			h="100%"
			isolation="auto">
			{/* Menu dropdown */}
			<Box
				position="absolute"
				top={4}
				right={4}
				zIndex={10}>
				<Menu>
					<MenuButton
						as={IconButton}
						aria-label="Options"
						icon={
							<Icon
								viewBox="0 0 24 24"
								w={6}
								h={6}>
								<path
									fill="currentColor"
									d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
								/>
							</Icon>
						}
						variant="ghost"
						colorScheme="brand"
						size="sm"
						onClick={(e) => e.stopPropagation()}
						_hover={{ bg: "brand.50" }}
					/>
					<Portal>
						<MenuList zIndex={2000}>
							<MenuItem
								onClick={(e) => {
									e.stopPropagation();
									onViewDetails?.(customer.id);
								}}>
								Xem chi tiết
							</MenuItem>
							{onDelete && (
								<MenuItem
									color="red.500"
									onClick={(e) => {
										e.stopPropagation();
										onOpen();
									}}>
									Xóa khách hàng
								</MenuItem>
							)}
						</MenuList>
					</Portal>
				</Menu>
			</Box>

			{/* Avatar */}
			<Flex
				justify="flex-start"
				mb={4}>
				<Box
					w="84px"
					h="84px"
					borderRadius="full"
					bg="brand.100"
					display="flex"
					alignItems="center"
					justifyContent="center"
					fontSize="32px"
					fontWeight="700"
					color="brand.500">
					<Icon
						as={FiUser}
						w="40px"
						h="40px"
					/>
				</Box>
			</Flex>

			{/* Name */}
			<Text
				fontSize="20px"
				fontWeight="900"
				color="brand.600"
				mb={1}
				lineHeight="1.2">
				{customer.name}
			</Text>

			{/* Gender Badge */}
			<Flex
				gap={2}
				mb={3}>
				<Badge
					colorScheme={
						customer.gender === "Nam"
							? "blue"
							: customer.gender === "Nữ"
							? "pink"
							: "gray"
					}
					fontSize="12px"
					borderRadius="full"
					px={3}
					py={1}>
					{customer.gender}
				</Badge>
			</Flex>

			{/* Phone */}
			<Flex
				align="center"
				gap={2}
				mb={3}>
				<Icon
					as={FiPhone}
					w="16px"
					h="16px"
					color="brand.500"
				/>
				<Text
					fontSize="15px"
					fontWeight="500"
					color="gray.700">
					{customer.phone}
				</Text>
			</Flex>

			{/* Loyalty Points */}
			<Box
				bg="brand.50"
				borderRadius="12px"
				p={3}
				mb={4}>
				<Flex
					align="center"
					justify="space-between">
					<Flex
						align="center"
						gap={2}>
						<Icon
							as={FiStar}
							w="18px"
							h="18px"
							color="orange.400"
						/>
						<Text
							fontSize="14px"
							fontWeight="600"
							color="brand.700">
							Điểm tích lũy
						</Text>
					</Flex>
					<Text
						fontSize="18px"
						fontWeight="700"
						color="orange.500">
						{customer.loyaltyPoints.toLocaleString("vi-VN")}
					</Text>
				</Flex>
			</Box>

			{/* View Details Link */}
			<Text
				fontSize="10px"
				fontWeight="300"
				color="black"
				textAlign="center"
				cursor="pointer"
				mt={4}
				_hover={{
					textDecoration: "underline",
					color: "brand.500",
				}}
				onClick={() => onViewDetails?.(customer.id)}>
				Xem chi tiết
			</Text>

			{/* Delete Confirmation Modal */}
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				isCentered>
				<ModalOverlay
					bg="blackAlpha.600"
					backdropFilter="blur(4px)"
				/>
				<ModalContent
					borderRadius="16px"
					maxW="400px"
					boxShadow="xl">
					<ModalHeader
						fontSize="18px"
						fontWeight="700"
						color="brand.600">
						Xác nhận xóa
					</ModalHeader>
					<ModalBody>
						<Text
							fontSize="14px"
							color="gray.700">
							Bạn có chắc chắn muốn xóa khách hàng{" "}
							<strong>{customer.name}</strong>? Hành động này
							không thể hoàn tác.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Flex
							gap={3}
							w="full"
							justify="flex-end">
							<Button
								variant="outline"
								onClick={onClose}
								isDisabled={isDeleting}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleDelete}
								isLoading={isDeleting}
								loadingText="Đang xóa...">
								Xóa
							</Button>
						</Flex>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
};

export default CustomerCard;
