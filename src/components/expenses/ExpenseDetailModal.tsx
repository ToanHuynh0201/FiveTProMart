import type { Expense } from "@/types/expense";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	VStack,
	Box,
	Divider,
	Badge,
	Text,
} from "@chakra-ui/react";

interface ExpenseDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	expense: Expense | null;
}

export const ExpenseDetailModal = ({
	isOpen,
	onClose,
	expense,
}: ExpenseDetailModalProps) => {
	if (!expense) return null;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="md">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Chi tiết chi phí</ModalHeader>
				<ModalBody>
					<VStack spacing={4} align="start" w="100%">
						<Box w="100%">
							<Text fontSize="sm" color="gray.600">
								ID
							</Text>
							<Text fontWeight="bold">{expense.id}</Text>
						</Box>

						<Divider />

						<Box w="100%">
							<Text fontSize="sm" color="gray.600">
								Danh mục
							</Text>
							<Badge colorScheme="blue">{expense.category}</Badge>
						</Box>

						<Box w="100%">
							<Text fontSize="sm" color="gray.600">
								Mô tả
							</Text>
							<Text>{expense.description}</Text>
						</Box>

						<Box w="100%">
							<Text fontSize="sm" color="gray.600">
								Số tiền
							</Text>
							<Text fontWeight="bold" fontSize="lg">
								{expense.amount.toLocaleString("vi-VN")} VND
							</Text>
						</Box>

						<Box w="100%">
							<Text fontSize="sm" color="gray.600">
								Ngày thanh toán
							</Text>
							<Text>{expense.payDate}</Text>
						</Box>

						{expense.image && (
							<Box w="100%">
								<Text fontSize="sm" color="gray.600" mb={2}>
									Hình ảnh
								</Text>
								<Text fontSize="sm" color="blue.600">
									{expense.image}
								</Text>
							</Box>
						)}
					</VStack>
				</ModalBody>
				<ModalFooter>
					<Button onClick={onClose}>Đóng</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};