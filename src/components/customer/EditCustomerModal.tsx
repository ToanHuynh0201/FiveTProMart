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
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
	useToast,
	Text,
	Spinner,
	Flex,
} from "@chakra-ui/react";
import type { Customer } from "@/types";

interface EditCustomerModalProps {
	isOpen: boolean;
	onClose: () => void;
	customerId: string | null;
	onUpdate: (id: string, customer: Partial<Customer>) => Promise<void>;
}

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
	isOpen,
	onClose,
	customerId,
	onUpdate,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		gender: "Nam" as "Nam" | "Nữ" | "Khác",
		loyaltyPoints: 0,
	});

	const [errors, setErrors] = useState({
		name: "",
		phone: "",
	});

	useEffect(() => {
		if (isOpen && customerId) {
			loadCustomerData();
		}
	}, [isOpen, customerId]);

	const loadCustomerData = async () => {
		if (!customerId) return;

		setIsFetching(true);
		try {
			// TODO: Implement API call to fetch customer by ID
			// const customer = await customerService.getCustomerById(customerId);
			// if (customer) {
			// 	setFormData({
			// 		name: customer.name,
			// 		phone: customer.phone,
			// 		gender: customer.gender,
			// 		loyaltyPoints: customer.loyaltyPoints,
			// 	});
			// }
		} catch (error) {
			console.error("Error loading customer:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải thông tin khách hàng",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsFetching(false);
		}
	};

	const validatePhone = (phone: string): boolean => {
		// Vietnamese phone number validation: starts with 0 and has 10 digits
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const handleSubmit = async () => {
		if (!customerId) return;

		// Reset errors
		const newErrors = {
			name: "",
			phone: "",
		};

		// Validation
		if (!formData.name.trim()) {
			newErrors.name = "Vui lòng nhập tên khách hàng";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "Tên khách hàng phải có ít nhất 2 ký tự";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "Vui lòng nhập số điện thoại";
		} else if (!validatePhone(formData.phone)) {
			newErrors.phone =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		setErrors(newErrors);

		// If there are errors, don't submit
		if (newErrors.name || newErrors.phone) {
			return;
		}

		setIsLoading(true);

		try {
			// TODO: Implement API call to update customer
			// await onUpdate(customerId, formData);
			toast({
				title: "Thành công",
				description: "Cập nhật thông tin khách hàng thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật khách hàng",
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
					Chỉnh sửa thông tin khách hàng
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
					{isFetching ? (
						<Flex
							justify="center"
							align="center"
							minH="400px">
							<Spinner
								size="xl"
								color="brand.500"
								thickness="4px"
							/>
						</Flex>
					) : (
						<VStack
							spacing={5}
							align="stretch">
							{/* Tên khách hàng */}
							<FormControl
								isRequired
								isInvalid={!!errors.name}>
								<FormLabel
									fontSize={{ base: "16px", md: "18px" }}
									fontWeight="600"
									color="gray.700"
									mb={2}>
									Tên khách hàng
								</FormLabel>
								<Input
									placeholder="Nhập tên khách hàng"
									value={formData.name}
									onChange={(e) => {
										setFormData({
											...formData,
											name: e.target.value,
										});
										setErrors({ ...errors, name: "" });
									}}
									size="lg"
									fontSize={{ base: "14px", md: "16px" }}
									borderColor={
										errors.name ? "red.500" : "gray.300"
									}
									_hover={{
										borderColor: errors.name
											? "red.600"
											: "gray.400",
									}}
									_focus={{
										borderColor: errors.name
											? "red.500"
											: "brand.500",
										boxShadow: errors.name
											? "0 0 0 1px var(--chakra-colors-red-500)"
											: "0 0 0 1px var(--chakra-colors-brand-500)",
									}}
								/>
								{errors.name && (
									<Text
										color="red.500"
										fontSize="14px"
										mt={1}>
										{errors.name}
									</Text>
								)}
							</FormControl>

							{/* Số điện thoại */}
							<FormControl
								isRequired
								isInvalid={!!errors.phone}>
								<FormLabel
									fontSize={{ base: "16px", md: "18px" }}
									fontWeight="600"
									color="gray.700"
									mb={2}>
									Số điện thoại
								</FormLabel>
								<Input
									placeholder="Nhập số điện thoại (10 chữ số)"
									value={formData.phone}
									onChange={(e) => {
										const value = e.target.value.replace(
											/\D/g,
											"",
										); // Only allow digits
										setFormData({ ...formData, phone: value });
										setErrors({ ...errors, phone: "" });
									}}
									maxLength={10}
									size="lg"
									fontSize={{ base: "14px", md: "16px" }}
									borderColor={
										errors.phone ? "red.500" : "gray.300"
									}
									_hover={{
										borderColor: errors.phone
											? "red.600"
											: "gray.400",
									}}
									_focus={{
										borderColor: errors.phone
											? "red.500"
											: "brand.500",
										boxShadow: errors.phone
											? "0 0 0 1px var(--chakra-colors-red-500)"
											: "0 0 0 1px var(--chakra-colors-brand-500)",
									}}
								/>
								{errors.phone && (
									<Text
										color="red.500"
										fontSize="14px"
										mt={1}>
										{errors.phone}
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

							{/* Điểm tích lũy */}
							<FormControl>
								<FormLabel
									fontSize={{ base: "16px", md: "18px" }}
									fontWeight="600"
									color="gray.700"
									mb={2}>
									Điểm tích lũy
								</FormLabel>
								<NumberInput
									value={formData.loyaltyPoints}
									onChange={(_, value) =>
										setFormData({
											...formData,
											loyaltyPoints: value || 0,
										})
									}
									min={0}
									max={100000}
									size="lg">
									<NumberInputField
										fontSize={{ base: "14px", md: "16px" }}
										borderColor="gray.300"
										_hover={{ borderColor: "gray.400" }}
										_focus={{
											borderColor: "brand.500",
											boxShadow:
												"0 0 0 1px var(--chakra-colors-brand-500)",
										}}
									/>
									<NumberInputStepper>
										<NumberIncrementStepper />
										<NumberDecrementStepper />
									</NumberInputStepper>
								</NumberInput>
								<Text
									fontSize="13px"
									color="gray.500"
									mt={1}>
									Điều chỉnh điểm tích lũy của khách hàng
								</Text>
							</FormControl>
						</VStack>
					)}
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
							isDisabled={isLoading || isFetching}
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
							loadingText="Đang cập nhật..."
							size="lg"
							fontSize={{ base: "14px", md: "16px" }}
							flex={1}
							isDisabled={isFetching}
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
							Cập nhật
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default EditCustomerModal;
