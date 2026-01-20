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
	HStack,
	useToast,
	Text,
} from "@chakra-ui/react";
import { mapGenderToAPI } from "@/utils";
import { customerService } from "@/services/customerService";

interface AddCustomerModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (customer: {
		fullName: string;
		phoneNumber: string;
		email?: string;
		address?: string;
		gender: "Male" | "Female" | "Other";
		dateOfBirth?: string;
	}) => Promise<void>;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
	isOpen,
	onClose,
	onAdd,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		fullName: "",
		phoneNumber: "",
		gender: "Nam" as "Nam" | "Nữ" | "Khác",
		dateOfBirth: "",
	});

	const [errors, setErrors] = useState({
		fullName: "",
		phoneNumber: "",
		dateOfBirth: "",
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				fullName: "",
				phoneNumber: "",
				gender: "Nam",
				dateOfBirth: "",
			});
			setErrors({
				fullName: "",
				phoneNumber: "",
				dateOfBirth: "",
			});
		}
	}, [isOpen]);

	const validatePhone = (phone: string): boolean => {
		// Vietnamese phone number validation: starts with 0 and has 10 digits
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const validateEmail = (email: string): boolean => {
		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async () => {
		// Reset errors
		const newErrors = {
			fullName: "",
			phoneNumber: "",
			dateOfBirth: "",
		};

		// Validation
		if (!formData.fullName.trim()) {
			newErrors.fullName = "Vui lòng nhập tên khách hàng";
		} else if (formData.fullName.trim().length < 2) {
			newErrors.fullName = "Tên khách hàng phải có ít nhất 2 ký tự";
		}

		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
		} else if (!validatePhone(formData.phoneNumber)) {
			newErrors.phoneNumber =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		if (!formData.dateOfBirth.trim()) {
			newErrors.dateOfBirth = "Vui lòng chọn ngày sinh";
		} else {
			const birthDate = new Date(formData.dateOfBirth);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			
			if (birthDate >= today) {
				newErrors.dateOfBirth = "Ngày sinh phải là ngày trong quá khứ";
			} else {
				// Check if age is at least reasonable (not more than 150 years old)
				const age = today.getFullYear() - birthDate.getFullYear();
				if (age > 150) {
					newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
				}
			}
		}

		setErrors(newErrors);

		// If there are errors, don't submit
		if (newErrors.fullName || newErrors.phoneNumber || newErrors.dateOfBirth) {
			return;
		}

		setIsLoading(true);

		try {
			// Check if phone number already exists
			const existingCustomer = await customerService.findByPhone(formData.phoneNumber.trim());
			if (existingCustomer) {
				setErrors({
					...newErrors,
					phoneNumber: "Số điện thoại này đã được đăng ký",
				});
				setIsLoading(false);
				return;
			}

			// Send date in YYYY-MM-DD format (ISO format for Java LocalDate)
			// Map gender to API format and submit
			await onAdd({
				...formData,
				dateOfBirth: formData.dateOfBirth, // Already in YYYY-MM-DD from HTML input
				gender: mapGenderToAPI(formData.gender),
			});
			toast({
				title: "Thành công",
				description: "Thêm khách hàng thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			onClose();
		} catch (error) {
			console.error("Error adding customer:", error);
			toast({
				title: "Lỗi",
				description: error instanceof Error ? error.message : "Có lỗi xảy ra khi thêm khách hàng",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={{ base: "full", md: "xl" }}
			isCentered
			motionPreset="slideInBottom">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent
				borderRadius={{ base: 0, md: "2xl" }}
				mx={{ base: 0, md: 4 }}
				my={{ base: 0, md: 4 }}>
				<ModalHeader
					fontSize={{ base: "24px", md: "28px" }}
					fontWeight="700"
					color="brand.600"
					pt={6}
					px={6}>
					Thêm khách hàng mới
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					size="lg"
					color="gray.500"
					_hover={{ color: "gray.700", bg: "gray.100" }}
				/>

				<ModalBody
					px={6}
					py={4}>
					<VStack
						spacing={5}
						align="stretch">
						{/* Tên khách hàng */}
						<FormControl
							isRequired
							isInvalid={!!errors.fullName}>
							<FormLabel
								fontSize={{ base: "16px", md: "18px" }}
								fontWeight="600"
								color="gray.700"
								mb={2}>
								Tên khách hàng
							</FormLabel>
							<Input
								placeholder="Nhập tên khách hàng"
								value={formData.fullName}
								onChange={(e) => {
									setFormData({
										...formData,
										fullName: e.target.value,
									});
									setErrors({ ...errors, fullName: "" });
								}}
								size="lg"
								fontSize={{ base: "14px", md: "16px" }}
								borderColor={
									errors.fullName ? "red.500" : "gray.300"
								}
								_hover={{
									borderColor: errors.fullName
										? "red.600"
										: "gray.400",
								}}
								_focus={{
									borderColor: errors.fullName
										? "red.500"
										: "brand.500",
									boxShadow: errors.fullName
										? "0 0 0 1px var(--chakra-colors-red-500)"
										: "0 0 0 1px var(--chakra-colors-brand-500)",
								}}
							/>
							{errors.fullName && (
								<Text
									color="red.500"
									fontSize="14px"
									mt={1}>
									{errors.fullName}
								</Text>
							)}
						</FormControl>

						{/* Số điện thoại */}
						<FormControl
							isRequired
							isInvalid={!!errors.phoneNumber}>
							<FormLabel
								fontSize={{ base: "16px", md: "18px" }}
								fontWeight="600"
								color="gray.700"
								mb={2}>
								Số điện thoại
							</FormLabel>
							<Input
								placeholder="Nhập số điện thoại (10 chữ số)"
								value={formData.phoneNumber}
								onChange={(e) => {
									const value = e.target.value.replace(
										/\D/g,
										"",
									); // Only allow digits
									setFormData({ ...formData, phoneNumber: value });
									setErrors({ ...errors, phoneNumber: "" });
								}}
								maxLength={10}
								size="lg"
								fontSize={{ base: "14px", md: "16px" }}
								borderColor={
									errors.phoneNumber ? "red.500" : "gray.300"
								}
								_hover={{
									borderColor: errors.phoneNumber
										? "red.600"
										: "gray.400",
								}}
								_focus={{
									borderColor: errors.phoneNumber
										? "red.500"
										: "brand.500",
									boxShadow: errors.phoneNumber
										? "0 0 0 1px var(--chakra-colors-red-500)"
										: "0 0 0 1px var(--chakra-colors-brand-500)",
								}}
							/>
							{errors.phoneNumber && (
								<Text
									color="red.500"
									fontSize="14px"
									mt={1}>
									{errors.phoneNumber}
								</Text>
							)}
						</FormControl>
					{/* Ngày sinh */}
					<FormControl
						isRequired
						isInvalid={!!errors.dateOfBirth}>
						<FormLabel
							fontSize={{ base: "16px", md: "18px" }}
							fontWeight="600"
							color="gray.700"
							mb={2}>
							Ngày sinh
						</FormLabel>
						<Input
							type="date"
							value={formData.dateOfBirth}
							onChange={(e) => {
								setFormData({
									...formData,
									dateOfBirth: e.target.value,
								});
								setErrors({ ...errors, dateOfBirth: "" });
							}}
							size="lg"
							fontSize={{ base: "14px", md: "16px" }}
							borderColor={
								errors.dateOfBirth ? "red.500" : "gray.300"
							}
							_hover={{
								borderColor: errors.dateOfBirth
									? "red.600"
									: "gray.400",
							}}
							_focus={{
								borderColor: errors.dateOfBirth
									? "red.500"
									: "brand.500",
								boxShadow: errors.dateOfBirth
									? "0 0 0 1px var(--chakra-colors-red-500)"
									: "0 0 0 1px var(--chakra-colors-brand-500)",
							}}
						/>
						{errors.dateOfBirth && (
							<Text
								color="red.500"
								fontSize="14px"
								mt={1}>
								{errors.dateOfBirth}
							</Text>
						)}
					</FormControl>

					{/* Giới tính */}
					<FormControl isRequired>
						<FormLabel
							fontSize={{ base: "16px", md: "18px" }}
							fontWeight="600"
							color="gray.700"
							mb={2}>
							Giới tính
						</FormLabel>
						<Select
							value={formData.gender}
								onChange={(e) =>
									setFormData({
										...formData,
										gender: e.target.value as
											| "Nam"
											| "Nữ"
											| "Khác",
									})
								}
								size="lg"
								fontSize={{ base: "14px", md: "16px" }}
								borderColor="gray.300"
								_hover={{ borderColor: "gray.400" }}
								_focus={{
									borderColor: "brand.500",
									boxShadow:
										"0 0 0 1px var(--chakra-colors-brand-500)",
								}}>
								<option value="Nam">Nam</option>
								<option value="Nữ">Nữ</option>
								<option value="Khác">Khác</option>
							</Select>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter
					px={6}
					pb={6}
					pt={4}>
					<HStack
						spacing={3}
						width="100%">
						<Button
							variant="ghost"
							onClick={onClose}
							size="lg"
							fontSize={{ base: "14px", md: "16px" }}
							flex={1}
							isDisabled={isLoading}
							_hover={{
								bg: "gray.100",
							}}>
							Hủy
						</Button>
						<Button
							bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
							color="white"
							onClick={handleSubmit}
							isLoading={isLoading}
							loadingText="Đang thêm..."
							size="lg"
							fontSize={{ base: "14px", md: "16px" }}
							flex={1}
							_hover={{
								bgGradient:
									"linear(135deg, brand.600 0%, brand.500 100%)",
								transform: "translateY(-2px)",
								boxShadow: "0 6px 20px rgba(22, 31, 112, 0.35)",
							}}
							_active={{
								bgGradient:
									"linear(135deg, brand.700 0%, brand.600 100%)",
								transform: "translateY(0)",
							}}>
							Thêm khách hàng
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddCustomerModal;
