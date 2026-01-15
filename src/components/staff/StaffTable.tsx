import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Box,
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
	Badge,
} from "@chakra-ui/react";
import { ViewIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import type { Staff } from "@/types/staff";
import { ACCOUNT_TYPE_LABELS } from "@/types/staff";
import { useState } from "react";

interface StaffTableProps {
	staffList: Staff[];
	onViewDetails?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
}

const StaffTable = ({
	staffList,
	onViewDetails,
	onEdit,
	onDelete,
}: StaffTableProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const toast = useToast();

	const handleDeleteClick = (staff: Staff) => {
		setSelectedStaff(staff);
		onOpen();
	};

	const handleDelete = async () => {
		if (!selectedStaff || !onDelete) return;

		setIsDeleting(true);
		try {
			await onDelete(selectedStaff.profileId);
			onClose();
		} catch (error) {
			console.error("Error deleting staff:", error);
			toast({
				title: "Lỗi",
				description: "Không thể xóa nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsDeleting(false);
			setSelectedStaff(null);
		}
	};

	return (
		<>
			<Box
				bg="white"
				borderRadius="12px"
				boxShadow="sm"
				overflow="hidden">
				<Box overflowX="auto">
					<Table
						variant="simple"
						size="sm">
						<Thead bg="gray.50">
							<Tr>
								<Th
									fontSize="12px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									STT
								</Th>
								<Th
									fontSize="12px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Tên nhân viên
								</Th>
								<Th
									fontSize="12px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Chức vụ
								</Th>
								<Th
									fontSize="12px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Email
								</Th>
								<Th
									fontSize="12px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Số điện thoại
								</Th>
								<Th
									fontSize="12px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									textAlign="center"
									py={3}>
									Thao tác
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{staffList.length === 0 ? (
								<Tr>
									<Td
										colSpan={6}
										textAlign="center"
										py={6}>
										<Text
											fontSize="15px"
											color="gray.500">
											Không có nhân viên nào
										</Text>
									</Td>
								</Tr>
							) : (
								staffList.map((staff, index) => (
									<Tr
										key={staff.profileId}
										_hover={{ bg: "gray.50" }}
										transition="background 0.2s">
										<Td
											fontSize="13px"
											fontWeight="600"
											color="gray.700"
											py={3}>
											{index + 1}
										</Td>
										<Td
											fontSize="13px"
											fontWeight="600"
											color="brand.500"
											cursor="pointer"
											onClick={() =>
												onViewDetails?.(staff.profileId)
											}
											_hover={{
												textDecoration: "underline",
											}}
											py={3}>
											{staff.fullName}
										</Td>
										<Td py={3}>
											<Badge
												colorScheme={
													staff.accountType ===
													"SalesStaff"
														? "blue"
														: "green"
												}
												fontSize="11px"
												px={2}
												py={1}
												borderRadius="full">
												{
													ACCOUNT_TYPE_LABELS[
														staff.accountType
													]
												}
											</Badge>
										</Td>
										<Td
											fontSize="13px"
											fontWeight="500"
											color="gray.700"
											py={3}>
											{staff.email}
										</Td>
										<Td
											fontSize="13px"
											fontWeight="500"
											color="gray.700"
											py={3}>
											{staff.phoneNumber}
										</Td>
										<Td>
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
																staff.profileId,
															)
														}
													/>
												</Tooltip>

												{onEdit && (
													<Tooltip label="Chỉnh sửa">
														<IconButton
															aria-label="Edit staff"
															icon={<EditIcon />}
															size="sm"
															variant="ghost"
															colorScheme="green"
															onClick={() =>
																onEdit(
																	staff.profileId,
																)
															}
														/>
													</Tooltip>
												)}

												{onDelete && (
													<Tooltip label="Xóa nhân viên">
														<IconButton
															aria-label="Delete staff"
															icon={
																<DeleteIcon />
															}
															size="sm"
															variant="ghost"
															colorScheme="red"
															onClick={() =>
																handleDeleteClick(
																	staff,
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
							Bạn có chắc chắn muốn xóa nhân viên{" "}
							<strong>{selectedStaff?.fullName}</strong>? Hành
							động này không thể hoàn tác.
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

export default StaffTable;
