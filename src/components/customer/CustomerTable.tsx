import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Box,
	Badge,
	IconButton,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Flex,
	Text,
	Tooltip,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { ViewIcon, DeleteIcon } from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";
import type { Customer } from "@/types";
import { useState } from "react";

interface CustomerTableProps {
	customerList: Customer[];
	onViewDetails?: (id: string) => void;
	onDelete?: (id: string) => void;
}

const CustomerTable = ({
	customerList,
	onViewDetails,
	onDelete,
}: CustomerTableProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const toast = useToast();

	const handleDeleteClick = (customer: Customer) => {
		setSelectedCustomer(customer);
		onOpen();
	};

	const handleDelete = async () => {
		if (!selectedCustomer || !onDelete) return;

		setIsDeleting(true);
		try {
			await onDelete(selectedCustomer.id);
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
			setSelectedCustomer(null);
		}
	};

	const formatPoints = (points: number) => {
		return points.toLocaleString("vi-VN");
	};

	return (
		<>
			<Box
				bg="white"
				borderRadius="12px"
				boxShadow="sm"
				overflow="hidden">
				<Box overflowX="auto">
					<Table variant="simple">
						<Thead bg="gray.50">
							<Tr>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={4}>
									STT
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none">
									Tên khách hàng
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none">
									Số điện thoại
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none">
									Giới tính
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									isNumeric>
									Điểm tích lũy
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									textAlign="center">
									Thao tác
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{customerList.length === 0 ? (
								<Tr>
									<Td
										colSpan={6}
										textAlign="center"
										py={10}>
										<Text
											fontSize="15px"
											color="gray.500">
											Không có khách hàng nào
										</Text>
									</Td>
								</Tr>
							) : (
								customerList.map((customer, index) => (
									<Tr
										key={customer.id}
										_hover={{ bg: "gray.50" }}
										transition="background 0.2s">
										<Td
											fontSize="14px"
											fontWeight="600"
											color="gray.700">
											{index + 1}
										</Td>
										<Td
											fontSize="14px"
											fontWeight="600"
											color="brand.500"
											cursor="pointer"
											onClick={() =>
												onViewDetails?.(customer.id)
											}
											_hover={{
												textDecoration: "underline",
											}}>
											{customer.name}
										</Td>
										<Td>
											<Text
												fontSize="14px"
												fontWeight="500"
												color="gray.800">
												{customer.phone}
											</Text>
										</Td>
										<Td>
											<Badge
												colorScheme={
													customer.gender === "Nam"
														? "blue"
														: customer.gender ===
														  "Nữ"
														? "pink"
														: "gray"
												}
												px={3}
												py={1}
												borderRadius="full"
												fontSize="12px"
												fontWeight="600">
												{customer.gender}
											</Badge>
										</Td>
										<Td
											isNumeric
											fontSize="14px"
											fontWeight="700"
											color="orange.500">
											{formatPoints(
												customer.loyaltyPoints,
											)}{" "}
											điểm
										</Td>
										<Td>
											<Flex
												justify="center"
												gap={1}>
												<Tooltip label="Xem chi tiết">
													<IconButton
														aria-label="View detail"
														icon={<ViewIcon />}
														size="sm"
														variant="ghost"
														colorScheme="blue"
														onClick={() =>
															onViewDetails?.(
																customer.id,
															)
														}
													/>
												</Tooltip>

												<Menu>
													<MenuButton
														as={IconButton}
														aria-label="More actions"
														icon={
															<BsThreeDotsVertical />
														}
														size="sm"
														variant="ghost"
														colorScheme="gray"
													/>
													<MenuList>
														{onDelete && (
															<MenuItem
																icon={
																	<DeleteIcon />
																}
																color="red.500"
																onClick={() =>
																	handleDeleteClick(
																		customer,
																	)
																}>
																Xóa khách hàng
															</MenuItem>
														)}
													</MenuList>
												</Menu>
											</Flex>
										</Td>
									</Tr>
								))
							)}
						</Tbody>
					</Table>
				</Box>
			</Box>

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
							<strong>{selectedCustomer?.name}</strong>? Hành động
							này không thể hoàn tác.
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
		</>
	);
};

export default CustomerTable;
