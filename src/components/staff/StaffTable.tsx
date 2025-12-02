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
} from "@chakra-ui/react";
import { ViewIcon, DeleteIcon } from "@chakra-ui/icons";
import type { Staff } from "@/types";
import { useState } from "react";

interface StaffTableProps {
	staffList: Staff[];
	onViewDetails?: (id: string) => void;
	onDelete?: (id: string) => void;
}

const StaffTable = ({
	staffList,
	onViewDetails,
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
			await onDelete(selectedStaff.id);
			onClose();
			toast({
				title: "Thành công",
				description: "Xóa nhân viên thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
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
									Vị trí
								</Th>
								<Th
									fontSize="12px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									py={3}>
									Ca làm việc
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
										colSpan={5}
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
										key={staff.id}
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
												onViewDetails?.(staff.id)
											}
											_hover={{
												textDecoration: "underline",
											}}
											py={3}>
											{staff.name}
										</Td>
										<Td>
											<Text
												fontSize="13px"
												fontWeight="500"
												color="gray.800"
												py={3}>
												{staff.position}
											</Text>
										</Td>
										<Td
											fontSize="13px"
											color="gray.600"
											py={3}>
											{staff.shift}
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
																staff.id,
															)
														}
													/>
												</Tooltip>

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
							<strong>{selectedStaff?.name}</strong>? Hành động
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

export default StaffTable;
