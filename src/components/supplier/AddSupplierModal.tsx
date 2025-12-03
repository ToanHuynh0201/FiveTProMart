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
	Textarea,
	useToast,
	Text,
	Grid,
	GridItem,
} from "@chakra-ui/react";
import type { Supplier } from "@/types/supplier";

interface AddSupplierModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (
		supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
	) => Promise<void>;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
	isOpen,
	onClose,
	onAdd,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		code: "",
		name: "",
		phone: "",
		email: "",
		address: "",
		taxCode: "",
		contactPerson: "",
		contactPhone: "",
		bankAccount: "",
		bankName: "",
		status: "active" as "active" | "inactive",
		notes: "",
	});

	const [errors, setErrors] = useState({
		code: "",
		name: "",
		phone: "",
		email: "",
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				code: "",
				name: "",
				phone: "",
				email: "",
				address: "",
				taxCode: "",
				contactPerson: "",
				contactPhone: "",
				bankAccount: "",
				bankName: "",
				status: "active",
				notes: "",
			});
			setErrors({
				code: "",
				name: "",
				phone: "",
				email: "",
			});
		} else {
			// Auto-generate code when modal opens
			const newCode = `NCC${String(Date.now()).slice(-6)}`;
			setFormData((prev) => ({ ...prev, code: newCode }));
		}
	}, [isOpen]);

	const validatePhone = (phone: string): boolean => {
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const validateEmail = (email: string): boolean => {
		if (!email) return true; // Email is optional
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async () => {
		const newErrors = {
			code: "",
			name: "",
			phone: "",
			email: "",
		};

		// Validation
		if (!formData.code.trim()) {
			newErrors.code = "Vui lòng nhập mã nhà cung cấp";
		}

		if (!formData.name.trim()) {
			newErrors.name = "Vui lòng nhập tên nhà cung cấp";
		} else if (formData.name.trim().length < 3) {
			newErrors.name = "Tên nhà cung cấp phải có ít nhất 3 ký tự";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "Vui lòng nhập số điện thoại";
		} else if (!validatePhone(formData.phone)) {
			newErrors.phone =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		if (formData.email && !validateEmail(formData.email)) {
			newErrors.email = "Email không hợp lệ";
		}

		setErrors(newErrors);

		if (
			newErrors.code ||
			newErrors.name ||
			newErrors.phone ||
			newErrors.email
		) {
			return;
		}

		setIsLoading(true);

		try {
			await onAdd(formData);
			toast({
				title: "Thành công",
				description: "Thêm nhà cung cấp thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi thêm nhà cung cấp",
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
			size={{ base: "full", md: "4xl" }}
			isCentered
			motionPreset="slideInBottom"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent
				borderRadius={{ base: 0, md: "2xl" }}
				mx={{ base: 0, md: 4 }}
				my={{ base: 0, md: 4 }}
				maxH={{ base: "100vh", md: "90vh" }}>
				<ModalHeader
					fontSize={{ base: "24px", md: "28px" }}
					fontWeight="700"
					color="#161f70"
					pt={6}
					px={6}>
					Thêm nhà cung cấp mới
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
						<Grid
							templateColumns={{
								base: "1fr",
								md: "repeat(2, 1fr)",
							}}
							gap={5}>
							{/* Mã nhà cung cấp */}
							<GridItem>
								<FormControl
									isRequired
									isInvalid={!!errors.code}>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Mã nhà cung cấp
									</FormLabel>
									<Input
										placeholder="Mã tự động"
										value={formData.code}
										onChange={(e) => {
											setFormData({
												...formData,
												code: e.target.value,
											});
											setErrors({ ...errors, code: "" });
										}}
										size="lg"
										borderColor={
											errors.code ? "red.500" : "gray.300"
										}
									/>
									{errors.code && (
										<Text
											color="red.500"
											fontSize="sm"
											mt={1}>
											{errors.code}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Tên nhà cung cấp */}
							<GridItem>
								<FormControl
									isRequired
									isInvalid={!!errors.name}>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Tên nhà cung cấp
									</FormLabel>
									<Input
										placeholder="Nhập tên nhà cung cấp"
										value={formData.name}
										onChange={(e) => {
											setFormData({
												...formData,
												name: e.target.value,
											});
											setErrors({ ...errors, name: "" });
										}}
										size="lg"
										borderColor={
											errors.name ? "red.500" : "gray.300"
										}
									/>
									{errors.name && (
										<Text
											color="red.500"
											fontSize="sm"
											mt={1}>
											{errors.name}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Số điện thoại */}
							<GridItem>
								<FormControl
									isRequired
									isInvalid={!!errors.phone}>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Số điện thoại
									</FormLabel>
									<Input
										placeholder="0xxxxxxxxx"
										value={formData.phone}
										onChange={(e) => {
											setFormData({
												...formData,
												phone: e.target.value,
											});
											setErrors({ ...errors, phone: "" });
										}}
										size="lg"
										borderColor={
											errors.phone
												? "red.500"
												: "gray.300"
										}
									/>
									{errors.phone && (
										<Text
											color="red.500"
											fontSize="sm"
											mt={1}>
											{errors.phone}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Email */}
							<GridItem>
								<FormControl isInvalid={!!errors.email}>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Email
									</FormLabel>
									<Input
										placeholder="email@example.com"
										value={formData.email}
										onChange={(e) => {
											setFormData({
												...formData,
												email: e.target.value,
											});
											setErrors({ ...errors, email: "" });
										}}
										size="lg"
										borderColor={
											errors.email
												? "red.500"
												: "gray.300"
										}
									/>
									{errors.email && (
										<Text
											color="red.500"
											fontSize="sm"
											mt={1}>
											{errors.email}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Mã số thuế */}
							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Mã số thuế
									</FormLabel>
									<Input
										placeholder="Nhập mã số thuế"
										value={formData.taxCode}
										onChange={(e) =>
											setFormData({
												...formData,
												taxCode: e.target.value,
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* Người liên hệ */}
							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Người liên hệ
									</FormLabel>
									<Input
										placeholder="Tên người liên hệ"
										value={formData.contactPerson}
										onChange={(e) =>
											setFormData({
												...formData,
												contactPerson: e.target.value,
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* SĐT người liên hệ */}
							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										SĐT người liên hệ
									</FormLabel>
									<Input
										placeholder="0xxxxxxxxx"
										value={formData.contactPhone}
										onChange={(e) =>
											setFormData({
												...formData,
												contactPhone: e.target.value,
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* Trạng thái */}
							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Trạng thái
									</FormLabel>
									<Select
										value={formData.status}
										onChange={(e) =>
											setFormData({
												...formData,
												status: e.target.value as
													| "active"
													| "inactive",
											})
										}
										size="lg">
										<option value="active">
											Hoạt động
										</option>
										<option value="inactive">
											Ngưng hoạt động
										</option>
									</Select>
								</FormControl>
							</GridItem>

							{/* Số tài khoản */}
							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Số tài khoản
									</FormLabel>
									<Input
										placeholder="Số tài khoản ngân hàng"
										value={formData.bankAccount}
										onChange={(e) =>
											setFormData({
												...formData,
												bankAccount: e.target.value,
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* Tên ngân hàng */}
							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="16px"
										fontWeight="600"
										color="gray.700">
										Tên ngân hàng
									</FormLabel>
									<Input
										placeholder="Tên ngân hàng"
										value={formData.bankName}
										onChange={(e) =>
											setFormData({
												...formData,
												bankName: e.target.value,
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Địa chỉ */}
						<FormControl>
							<FormLabel
								fontSize="16px"
								fontWeight="600"
								color="gray.700">
								Địa chỉ
							</FormLabel>
							<Input
								placeholder="Nhập địa chỉ đầy đủ"
								value={formData.address}
								onChange={(e) =>
									setFormData({
										...formData,
										address: e.target.value,
									})
								}
								size="lg"
							/>
						</FormControl>

						{/* Ghi chú */}
						<FormControl>
							<FormLabel
								fontSize="16px"
								fontWeight="600"
								color="gray.700">
								Ghi chú
							</FormLabel>
							<Textarea
								placeholder="Nhập ghi chú (tùy chọn)"
								value={formData.notes}
								onChange={(e) =>
									setFormData({
										...formData,
										notes: e.target.value,
									})
								}
								size="lg"
								rows={3}
								resize="vertical"
							/>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter
					px={6}
					py={4}
					borderTop="1px solid"
					borderColor="gray.200">
					<HStack spacing={3}>
						<Button
							variant="ghost"
							size="lg"
							onClick={onClose}
							isDisabled={isLoading}
							_hover={{ bg: "gray.100" }}>
							Hủy
						</Button>
						<Button
							colorScheme="blue"
							size="lg"
							onClick={handleSubmit}
							isLoading={isLoading}
							loadingText="Đang thêm..."
							bg="#161f70"
							_hover={{ bg: "#0f1654" }}>
							Thêm nhà cung cấp
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddSupplierModal;
