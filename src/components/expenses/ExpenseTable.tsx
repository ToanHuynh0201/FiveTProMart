import type { Expense } from "@/types/expense";
import {
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	Badge,
	HStack,
	IconButton,
	Box,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	useToast,
	AlertDialog,
	AlertDialogOverlay,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
	Button,
	useDisclosure,
} from "@chakra-ui/react";
import { FiMoreVertical, FiTrash2, FiEdit2, FiEye } from "react-icons/fi";
import { expenseService } from "@/services/expenseService";
import { useRef, useState } from "react";

interface ExpenseTableProps {
	expenses: Expense[];
	onEdit: (expense: Expense) => void;
	onViewDetail: (expense: Expense) => void;
	onDelete: () => void;
}

export const ExpenseTable = ({
	expenses,
	onEdit,
	onViewDetail,
	onDelete,
}: ExpenseTableProps) => {
	const toast = useToast();
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const cancelRef = useRef<HTMLButtonElement>(null);
	const {
		isOpen: isDeleteOpen,
		onOpen: onDeleteOpen,
		onClose: onDeleteClose,
	} = useDisclosure();

	const handleDeleteClick = (id: string) => {
		setDeleteId(id);
		onDeleteOpen();
	};

	const handleConfirmDelete = async () => {
		if (!deleteId) return;

		try {
			await expenseService.deleteExpense(deleteId);
			toast({
				title: "Thành công",
				description: "Chi phí đã được xóa",
				status: "success",
				duration: 3,
				isClosable: true,
			});
			onDelete();
		} catch (error) {
			toast({
				title: "Lỗi",
				description:
					error instanceof Error
						? error.message
						: "Không thể xóa chi phí",
				status: "error",
				duration: 3,
				isClosable: true,
			});
		} finally {
			onDeleteClose();
			setDeleteId(null);
		}
	};

	if (expenses.length === 0) {
		return (
			<Box textAlign="center" py={8}>
				Không có chi phí nào
			</Box>
		);
	}

	return (
		<>
			<Box overflowX="auto">
				<Table variant="simple" size="sm">
					<Thead bg="gray.50">
						<Tr>
							<Th>Danh mục</Th>
							<Th>Mô tả</Th>
							<Th isNumeric>Số tiền</Th>
							<Th>Ngày thanh toán</Th>
							<Th>Hành động</Th>
						</Tr>
					</Thead>
					<Tbody>
						{expenses.map((expense) => (
							<Tr key={expense.id}>
								<Td>
									<Badge colorScheme="blue">
										{expense.category}
									</Badge>
								</Td>
								<Td maxW="200px" noOfLines={1}>
									{expense.description}
								</Td>
								<Td isNumeric fontWeight="bold">
									{expense.amount.toLocaleString("vi-VN")} VND
								</Td>
								<Td>{expense.payDate}</Td>
								<Td>
									<HStack spacing={2}>
										<IconButton
											icon={<FiEye />}
											aria-label="View"
											size="sm"
											variant="ghost"
											onClick={() =>
												onViewDetail(expense)
											}
										/>
										<IconButton
											icon={<FiEdit2 />}
											aria-label="Edit"
											size="sm"
											variant="ghost"
											colorScheme="blue"
											onClick={() => onEdit(expense)}
										/>
										<Menu>
											<MenuButton
												as={IconButton}
												icon={<FiMoreVertical />}
												aria-label="More"
												size="sm"
												variant="ghost"
											/>
											<MenuList>
												<MenuItem
													icon={<FiTrash2 />}
													onClick={() =>
														handleDeleteClick(
															expense.id,
														)
													}
													color="red.600"
												>
													Xóa
												</MenuItem>
											</MenuList>
										</Menu>
									</HStack>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</Box>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={isDeleteOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteClose}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Xóa chi phí
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc chắn muốn xóa chi phí này? Hành động
							này không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={cancelRef} onClick={onDeleteClose}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleConfirmDelete}
								ml={3}
							>
								Xóa
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
};
