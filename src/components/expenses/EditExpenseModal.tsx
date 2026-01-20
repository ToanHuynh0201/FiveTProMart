import { useState, useEffect } from "react";
import type { Expense, UpdateExpenseRequest } from "@/types/expense";
import { EXPENSE_CATEGORIES } from "@/constants";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	FormControl,
	FormLabel,
	FormErrorMessage,
	Textarea,
	useToast,
	VStack,
	HStack,
	Select,
} from "@chakra-ui/react";
import { expenseService } from "@/services/expenseService";

interface EditExpenseModalProps {
	isOpen: boolean;
	onClose: () => void;
	expense: Expense | null;
	onSuccess?: () => void;
}

export const EditExpenseModal = ({
	isOpen,
	onClose,
	expense,
	onSuccess,
}: EditExpenseModalProps) => {
	const toast = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [formData, setFormData] = useState<UpdateExpenseRequest>({
		category: "",
		description: "",
		amount: 0,
		payDate: "",
		image: "",
	});

	useEffect(() => {
		if (isOpen && expense) {
			setFormData({
				category: expense.category,
				description: expense.description,
				amount: expense.amount,
				payDate: expense.payDate,
				image: expense.image || "",
			});
			setErrors({});
		}
	}, [isOpen, expense]);

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.category?.trim()) {
			newErrors.category = "Danh mục là bắt buộc";
		}

		if (!formData.description?.trim()) {
			newErrors.description = "Mô tả là bắt buộc";
		}

		if (!formData.amount || formData.amount <= 0) {
			newErrors.amount = "Số tiền phải lớn hơn 0";
		}

		if (!formData.payDate) {
			newErrors.payDate = "Ngày thanh toán là bắt buộc";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;

		if (name === "amount") {
			setFormData((prev) => ({
				...prev,
				[name]: value ? parseInt(value) : 0,
			}));
		} else if (name === "payDate") {
			// Convert yyyy-MM-dd to dd-MM-yyyy format for API
			if (value) {
				const [year, month, day] = value.split("-");
				const apiDate = `${day}-${month}-${year}`;
				setFormData((prev) => ({
					...prev,
					[name]: apiDate,
				}));
			} else {
				setFormData((prev) => ({
					...prev,
					[name]: "",
				}));
			}
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}

		// Clear error for this field
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleSubmit = async () => {
		if (!validateForm() || !expense) return;

		setIsSubmitting(true);
		try {
			// Remove empty strings from formData
			const dataToSend = Object.fromEntries(
				Object.entries(formData).filter(([, value]) => value !== "")
			);
			await expenseService.updateExpense(expense.id, dataToSend as UpdateExpenseRequest);

			toast({
				title: "Thành công",
				description: "Chi phí đã được cập nhật",
				status: "success",
				duration: 3,
				isClosable: true,
			});

			onClose();
			onSuccess?.();
		} catch (error) {
			toast({
				title: "Lỗi",
				description:
					error instanceof Error
						? error.message
						: "Không thể cập nhật chi phí",
				status: "error",
				duration: 3,
				isClosable: true,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Convert dd-MM-yyyy to yyyy-MM-dd for HTML date input
	const getDateInputValue = () => {
		if (!formData.payDate) return "";
		const parts = formData.payDate.split("-");
		if (parts.length === 3) {
			return `${parts[2]}-${parts[1]}-${parts[0]}`;
		}
		return "";
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="md">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Chỉnh sửa chi phí</ModalHeader>
				<ModalBody>
					<VStack spacing={4}>
						<FormControl isInvalid={!!errors.category}>
							<FormLabel>Danh mục</FormLabel>
							<Select
								name="category"
								placeholder="Chọn danh mục"
								value={formData.category || ""}
								onChange={handleInputChange}
							>
								{EXPENSE_CATEGORIES.map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</Select>
							{errors.category && (
								<FormErrorMessage>{errors.category}</FormErrorMessage>
							)}
						</FormControl>

						<FormControl isInvalid={!!errors.description}>
							<FormLabel>Mô tả</FormLabel>
							<Textarea
								name="description"
								placeholder="Chi tiết về chi phí"
								value={formData.description || ""}
								onChange={handleInputChange}
								rows={3}
							/>
							{errors.description && (
								<FormErrorMessage>{errors.description}</FormErrorMessage>
							)}
						</FormControl>

						<FormControl isInvalid={!!errors.amount}>
							<FormLabel>Số tiền (VND)</FormLabel>
							<Input
								name="amount"
								type="number"
								placeholder="0"
								value={formData.amount || ""}
								onChange={handleInputChange}
								min="0"
							/>
							{errors.amount && (
								<FormErrorMessage>{errors.amount}</FormErrorMessage>
							)}
						</FormControl>

						<FormControl isInvalid={!!errors.payDate}>
							<FormLabel>Ngày thanh toán</FormLabel>
							<Input
								name="payDate"
								type="date"
								value={getDateInputValue()}
								onChange={handleInputChange}
							/>
							{errors.payDate && (
								<FormErrorMessage>{errors.payDate}</FormErrorMessage>
							)}
						</FormControl>

						<FormControl>
							<FormLabel>Hình ảnh</FormLabel>
							<Input
								name="image"
								placeholder="Tên tệp hoặc URL hình ảnh"
								value={formData.image || ""}
								onChange={handleInputChange}
							/>
						</FormControl>
					</VStack>
				</ModalBody>
				<ModalFooter>
					<HStack spacing={2}>
						<Button variant="ghost" onClick={onClose}>
							Hủy
						</Button>
						<Button
							colorScheme="blue"
							onClick={handleSubmit}
							isLoading={isSubmitting}
						>
							Cập nhật
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
