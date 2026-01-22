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
			await onDelete(selectedSupplier.supplierId);
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
									width="250px">
									Tên nhà cung cấp
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="120px">
									Loại NCC
								</Th>
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="130px">
									Số điện thoại
								</Th>
								{/* TODO: Add "Loại sản phẩm" column when GET /suppliers returns suppliedProductType
								    Currently the API only accepts this field in POST/PUT but doesn't return it in GET.
								    See SupplierAPI.md - GET response doesn't include suppliedProductType */}
								<Th
									fontSize="13px"
									fontWeight="700"
									color="gray.700"
									textTransform="none"
									width="120px"
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
										key={supplier.supplierId}
										_hover={{ bg: "gray.50" }}
										transition="background 0.2s">
										<Td
											fontSize="14px"
											fontWeight="500">
											<Tooltip
												label={supplier.supplierName}
												placement="top">
												<Text
													noOfLines={1}
													maxW="220px">
													{supplier.supplierName}
												</Text>
											</Tooltip>
										</Td>
										<Td
											fontSize="13px"
											color="gray.600">
											<Badge
												colorScheme="blue"
												px={2}
												py={1}
												borderRadius="md"
												fontSize="12px">
												{supplier.supplierType}
											</Badge>
										</Td>
										<Td
											fontSize="13px"
											color="gray.600">
											{supplier.phoneNumber}
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
																	supplier.supplierId,
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
																	supplier.supplierId,
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
							<strong>{selectedSupplier?.supplierName}</strong>?
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
