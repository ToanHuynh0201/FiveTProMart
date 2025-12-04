import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	FormControl,
	FormLabel,
	Input,
	Select,
	VStack,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	useToast,
	Textarea,
} from "@chakra-ui/react";
import type { Expense, ExpenseCategory } from "@/types/reports";
import { getExpenseCategoryLabel } from "@/services/expenseService";

interface AddExpenseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (expense: Omit<Expense, "id">) => Promise<void>;
}

const expenseCategories: ExpenseCategory[] = [
	"electricity",
	"water",
	"supplies",
	"repairs",
	"other",
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
	isOpen,
	onClose,
	onAdd,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		category: "electricity" as ExpenseCategory,
		description: "",
		amount: 0,
		date: new Date().toISOString().split("T")[0],
		notes: "",
	});

	const [errors, setErrors] = useState({
		description: "",
		amount: "",
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				category: "electricity",
				description: "",
				amount: 0,
				date: new Date().toISOString().split("T")[0],
				notes: "",
			});
			setErrors({
				description: "",
				amount: "",
			});
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		// Reset errors
		const newErrors = {
			description: "",
			amount: "",
		};

		// Validation
		if (!formData.description.trim()) {
			newErrors.description = "Vui lòng nhập mô tả chi phí";
		}

		if (formData.amount <= 0) {
			newErrors.amount = "Số tiền phải lớn hơn 0";
		}

		setErrors(newErrors);

		// Check if there are any errors
		if (Object.values(newErrors).some((error) => error !== "")) {
			return;
		}

		setIsLoading(true);

		try {
			await onAdd({
				category: formData.category,
				description: formData.description.trim(),
				amount: formData.amount,
				date: new Date(formData.date),
				notes: formData.notes.trim() || undefined,
				createdBy: "Admin", // In real app, this would be current user
			});

			toast({
				title: "Thành công",
				description: "Đã thêm chi phí mới",
				status: "success",
				duration: 3000,
			});

			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Không thể thêm chi phí",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="xl">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Thêm Chi Phí Phát Sinh</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<VStack spacing={4} align="stretch">
						<FormControl isRequired isInvalid={!!errors.description}>
							<FormLabel>Loại chi phí</FormLabel>
							<Select
								value={formData.category}
								onChange={(e) =>
									setFormData({
										...formData,
										category: e.target.value as ExpenseCategory,
									})
								}
							>
								{expenseCategories.map((category) => (
									<option key={category} value={category}>
										{getExpenseCategoryLabel(category)}
									</option>
								))}
							</Select>
						</FormControl>

						<FormControl isRequired isInvalid={!!errors.description}>
							<FormLabel>Mô tả</FormLabel>
							<Input
								placeholder="Nhập mô tả chi phí..."
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
							/>
							{errors.description && (
								<FormLabel color="red.500" fontSize="sm" mt={1}>
									{errors.description}
								</FormLabel>
							)}
						</FormControl>

						<FormControl isRequired isInvalid={!!errors.amount}>
							<FormLabel>Số tiền (VNĐ)</FormLabel>
							<NumberInput
								min={0}
								value={formData.amount}
								onChange={(_, value) =>
									setFormData({ ...formData, amount: value })
								}
							>
								<NumberInputField placeholder="Nhập số tiền..." />
								<NumberInputStepper>
									<NumberIncrementStepper />
									<NumberDecrementStepper />
								</NumberInputStepper>
							</NumberInput>
							{errors.amount && (
								<FormLabel color="red.500" fontSize="sm" mt={1}>
									{errors.amount}
								</FormLabel>
							)}
						</FormControl>

						<FormControl isRequired>
							<FormLabel>Ngày</FormLabel>
							<Input
								type="date"
								value={formData.date}
								onChange={(e) =>
									setFormData({ ...formData, date: e.target.value })
								}
							/>
						</FormControl>

						<FormControl>
							<FormLabel>Ghi chú</FormLabel>
							<Textarea
								placeholder="Nhập ghi chú (không bắt buộc)..."
								value={formData.notes}
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
								rows={3}
							/>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter>
					<Button variant="ghost" mr={3} onClick={onClose}>
						Hủy
					</Button>
					<Button
						colorScheme="blue"
						onClick={handleSubmit}
						isLoading={isLoading}
					>
						Thêm
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
