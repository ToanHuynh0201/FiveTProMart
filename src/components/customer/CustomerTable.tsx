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
import { ViewIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import type { Customer } from "@/types";
import { useState } from "react";
import { getCustomerId, getCustomerName, getCustomerPhone, getCustomerGender } from "@/utils";

interface CustomerTableProps {
	customerList: Customer[];
	onViewDetails?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
}

const CustomerTable = ({
	customerList,
	onViewDetails,
	onEdit,
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
			await onDelete(getCustomerId(selectedCustomer));
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
									py={3}>
									STT
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Tên khách hàng
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Số điện thoại
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Giới tính
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}
									isNumeric>
									Điểm tích lũy
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}
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
										py={4}>
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
									key={getCustomerId(customer)}
										_hover={{ bg: "gray.50" }}
										transition="background 0.2s">
										<Td
											fontSize="14px"
											fontWeight="600"
											color="gray.700"
											py={2}>
											{index + 1}
										</Td>
										<Td
											fontSize="14px"
											fontWeight="600"
											color="brand.500"
											cursor="pointer"
											py={2}
											onClick={() =>
											onViewDetails?.(getCustomerId(customer))
										}
										_hover={{
											textDecoration: "underline",
										}}>
										{getCustomerName(customer)}
										</Td>
										<Td py={2}>
											<Text
												fontSize="14px"
												fontWeight="500"
												color="gray.800">
											{getCustomerPhone(customer)}
											</Text>
										</Td>
										<Td py={2}>
											<Badge
												colorScheme={
												getCustomerGender(customer) === "Nam"
													? "blue"
													: getCustomerGender(customer) ===
													  "Nữ"
													? "pink"
													: "gray"
											}
											px={3}
											py={1}
											borderRadius="full"
											fontSize="12px"
											fontWeight="600">
											{getCustomerGender(customer)}
											</Badge>
										</Td>
										<Td
											isNumeric
											fontSize="14px"
											fontWeight="700"
											color="orange.500"
											py={2}>
											{formatPoints(
												customer.loyaltyPoints,
											)}{" "}
											điểm
										</Td>
										<Td py={2}>
											<Flex
												justify="center"
												gap={2}>
												<Tooltip label="Xem chi tiết">
													<IconButton
														aria-label="View detail"
														icon={<ViewIcon />}
														size="sm"
														variant="ghost"
														colorScheme="blue"
														onClick={() =>
															onViewDetails?.(
																getCustomerId(customer),
															)
														}
													/>
												</Tooltip>

												{onEdit && (
													<Tooltip label="Chỉnh sửa">
														<IconButton
															aria-label="Edit customer"
															icon={<EditIcon />}
															size="sm"
															variant="ghost"
															colorScheme="orange"
															onClick={() =>
																onEdit(getCustomerId(customer))
															}
														/>
													</Tooltip>
												)}

												{onDelete && (
													<Tooltip label="Xóa">
														<IconButton
															aria-label="Delete customer"
															icon={<DeleteIcon />}
															size="sm"
															variant="ghost"
															colorScheme="red"
															onClick={() =>
																handleDeleteClick(
																	customer,
																)
															}
														/>
													</Tooltip>
												)}
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
							<strong>{selectedCustomer && getCustomerName(selectedCustomer)}</strong>? Hành động
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