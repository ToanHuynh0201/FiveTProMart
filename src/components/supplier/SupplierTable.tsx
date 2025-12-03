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
import type { Supplier } from "@/types/supplier";
import { useState } from "react";

interface SupplierTableProps {
	supplierList: Supplier[];
	onViewDetails?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
}

const SupplierTable = ({
	supplierList,
	onViewDetails,
	onEdit,
	onDelete,
}: SupplierTableProps) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
		null,
	);
	const [isDeleting, setIsDeleting] = useState(false);
	const toast = useToast();

	const handleDeleteClick = (supplier: Supplier) => {
		setSelectedSupplier(supplier);
		onOpen();
	};

	const handleDelete = async () => {
		if (!selectedSupplier || !onDelete) return;

		setIsDeleting(true);
		try {
			await onDelete(selectedSupplier.id);
			onClose();
			toast({
				title: "Thành công",
				description: "Xóa nhà cung cấp thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
		} catch (error) {
			console.error("Error deleting supplier:", error);
			toast({
				title: "Lỗi",
				description: "Không thể xóa nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsDeleting(false);
			setSelectedSupplier(null);
		}
	};

	const formatDate = (date: Date | undefined) => {
		if (!date) return "N/A";
		return new Date(date).toLocaleDateString("vi-VN");
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
						style={{ tableLayout: "fixed" }}>
						<Thead bg="gray.50">
							<Tr>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="120px">
									Mã NCC
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="300px">
									Tên nhà cung cấp
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="150px"
									textAlign="center">
									Nhập gần nhất
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="150px"
									textAlign="center">
									Trạng thái
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="150px"
									textAlign="center">
									Thao tác
								</Th>
							</Tr>
						</Thead>
						<Tbody>
							{supplierList.length === 0 ? (
								<Tr>
									<Td
										colSpan={5}
										textAlign="center"
										py={8}
										color="gray.500">
										Không có nhà cung cấp nào
									</Td>
								</Tr>
							) : (
								supplierList.map((supplier) => (
									<Tr
										key={supplier.id}
										_hover={{ bg: "gray.50" }}
										transition="background 0.2s">
										<Td
											fontSize="14px"
											fontWeight="600"
											color="#161f70">
											{supplier.code}
										</Td>
										<Td
											fontSize="14px"
											fontWeight="500">
											<Tooltip
												label={supplier.name}
												placement="top">
												<Text
													noOfLines={1}
													maxW="250px">
													{supplier.name}
												</Text>
											</Tooltip>
										</Td>
										<Td
											fontSize="13px"
											textAlign="center"
											color="gray.600">
											{formatDate(
												supplier.lastPurchaseDate,
											)}
										</Td>
										<Td textAlign="center">
											<Badge
												colorScheme={
													supplier.status === "active"
														? "green"
														: "gray"
												}
												px={3}
												py={1}
												borderRadius="full"
												fontSize="12px"
												fontWeight="600">
												{supplier.status === "active"
													? "Hoạt động"
													: "Ngưng"}
											</Badge>
										</Td>
										<Td>
											<Flex
												gap={2}
												justify="center">
												{onViewDetails && (
													<Tooltip
														label="Xem chi tiết"
														placement="top">
														<IconButton
															aria-label="View details"
															icon={<ViewIcon />}
															size="sm"
															colorScheme="blue"
															variant="ghost"
															onClick={() =>
																onViewDetails(
																	supplier.id,
																)
															}
														/>
													</Tooltip>
												)}
												{onEdit && (
													<Tooltip
														label="Chỉnh sửa"
														placement="top">
														<IconButton
															aria-label="Edit"
															icon={<EditIcon />}
															size="sm"
															colorScheme="orange"
															variant="ghost"
															onClick={() =>
																onEdit(
																	supplier.id,
																)
															}
														/>
													</Tooltip>
												)}
												{onDelete && (
													<Tooltip
														label="Xóa"
														placement="top">
														<IconButton
															aria-label="Delete"
															icon={
																<DeleteIcon />
															}
															size="sm"
															colorScheme="red"
															variant="ghost"
															onClick={() =>
																handleDeleteClick(
																	supplier,
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
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Xác nhận xóa</ModalHeader>
					<ModalBody>
						<Text>
							Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
							<strong>{selectedSupplier?.name}</strong>?
						</Text>
						<Text
							mt={2}
							fontSize="sm"
							color="gray.600">
							Hành động này không thể hoàn tác.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="ghost"
							mr={3}
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
					</ModalFooter>
				</ModalContent>
			</Modal>
		</>
	);
};

export default SupplierTable;
