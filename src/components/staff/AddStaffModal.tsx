import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	Button,
	FormControl,
	FormLabel,
	Input,
	Select,
	Textarea,
	VStack,
	Grid,
	GridItem,
	useToast,
	HStack,
	Text,
	InputGroup,
	InputRightElement,
	IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import type { CreateStaffDTO, AccountType } from "@/types/staff";
import { ACCOUNT_TYPE_OPTIONS } from "@/types/staff";
import { formatDateForAPI } from "@/utils/dateFormat";

interface AddStaffModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (staff: CreateStaffDTO) => Promise<void>;
}

const AddStaffModal = ({ isOpen, onClose, onAdd }: AddStaffModalProps) => {
	const toast = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const [formData, setFormData] = useState({
		username: "",
		password: "",
		fullName: "",
		email: "",
		phoneNumber: "",
		accountType: "SalesStaff" as AccountType,
		dateOfBirth: "",
		location: "",
		bio: "",
	});

	const resetForm = () => {
		setFormData({
			username: "",
			password: "",
			fullName: "",
			email: "",
			phoneNumber: "",
			accountType: "SalesStaff",
			dateOfBirth: "",
			location: "",
			bio: "",
		});
		setShowPassword(false);
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.username.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên đăng nhập",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Username validation (3-50 characters, only letters, numbers, underscores)
		const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
		if (!usernameRegex.test(formData.username.trim())) {
			toast({
				title: "Lỗi",
				description:
					"Tên đăng nhập phải có 3-50 ký tự và chỉ chứa chữ cái, số, và dấu gạch dưới",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!formData.password.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập mật khẩu",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
		if (!passwordRegex.test(formData.password)) {
			toast({
				title: "Lỗi",
				description:
					"Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
			return;
		}

		if (!formData.fullName.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập họ và tên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!formData.email.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập email",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			toast({
				title: "Lỗi",
				description: "Email không hợp lệ",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!formData.phoneNumber.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập số điện thoại",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Phone validation (Vietnamese phone number)
		const phoneRegex = /^0\d{9}$/;
		if (!phoneRegex.test(formData.phoneNumber)) {
			toast({
				title: "Lỗi",
				description:
					"Số điện thoại phải có 10 chữ số và bắt đầu bằng 0",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const newStaff: CreateStaffDTO = {
				username: formData.username.trim(),
				password: formData.password,
				fullName: formData.fullName.trim(),
				email: formData.email.trim(),
				phoneNumber: formData.phoneNumber.trim(),
				accountType: formData.accountType,
				dateOfBirth: formData.dateOfBirth
					? formatDateForAPI(formData.dateOfBirth)
					: undefined,
				location: formData.location.trim() || undefined,
				bio: formData.bio.trim() || undefined,
			};

			await onAdd(newStaff);
			resetForm();
		} catch (error) {
			console.error("Error adding staff:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		resetForm();
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCancel}
			size="3xl"
			isCentered
			scrollBehavior="inside">
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent
				borderRadius="24px"
				maxH="90vh"
				bg="white"
				boxShadow="0 20px 60px rgba(22, 31, 112, 0.3)">
				<ModalHeader
					borderBottom="1px solid"
					borderColor="gray.100"
					pb={4}
					pt={6}
					px={8}>
					<Text
						fontSize="24px"
						fontWeight="700"
						color="brand.600">
						Thêm nhân viên mới
					</Text>
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					color="gray.500"
					_hover={{ color: "brand.500", bg: "brand.50" }}
					borderRadius="full"
				/>

				<ModalBody
					px={8}
					py={6}>
					<VStack
						spacing={5}
						align="stretch">
						{/* Account Information */}
						<Text
							fontSize="16px"
							fontWeight="600"
							color="gray.700">
							Thông tin tài khoản
						</Text>
						<Grid
							templateColumns="repeat(2, 1fr)"
							gap={4}>
							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Tên đăng nhập
									</FormLabel>
									<Input
										value={formData.username}
										onChange={(e) =>
											setFormData({
												...formData,
												username: e.target.value,
											})
										}
										placeholder="3-50 ký tự (chữ, số, _)"
										size="md"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Mật khẩu
									</FormLabel>
									<InputGroup>
										<Input
											type={
												showPassword
													? "text"
													: "password"
											}
											value={formData.password}
											onChange={(e) =>
												setFormData({
													...formData,
													password: e.target.value,
												})
											}

											placeholder="Ít nhất 8 ký tự (A-Z, a-z, 0-9)"
											size="md"
										/>
										<InputRightElement>
											<IconButton
												aria-label={
													showPassword
														? "Ẩn mật khẩu"
														: "Hiện mật khẩu"
												}
												icon={
													showPassword ? (
														<ViewOffIcon />
													) : (
														<ViewIcon />
													)
												}
												variant="ghost"
												size="sm"
												onClick={() =>
													setShowPassword(
														!showPassword,
													)
												}
											/>
										</InputRightElement>
									</InputGroup>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Personal Information */}
						<Text
							fontSize="16px"
							fontWeight="600"
							color="gray.700"
							mt={2}>
							Thông tin cá nhân
						</Text>
						<Grid
							templateColumns="repeat(2, 1fr)"
							gap={4}>
							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Họ và tên
									</FormLabel>
									<Input
										value={formData.fullName}
										onChange={(e) =>
											setFormData({
												...formData,
												fullName: e.target.value,
											})
										}
										placeholder="Nguyễn Văn A"
										size="md"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Chức vụ
									</FormLabel>
									<Select
										value={formData.accountType}
										onChange={(e) =>
											setFormData({
												...formData,
												accountType: e.target
													.value as AccountType,
											})
										}
										size="md">
										{ACCOUNT_TYPE_OPTIONS.map((option) => (
											<option
												key={option.value}
												value={option.value}>
												{option.label}
											</option>
										))}
									</Select>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Contact Information */}
						<Grid
							templateColumns="repeat(2, 1fr)"
							gap={4}>
							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Email
									</FormLabel>
									<Input
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										placeholder="example@email.com"
										size="md"
										type="email"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Số điện thoại
									</FormLabel>
									<Input
										value={formData.phoneNumber}
										onChange={(e) =>
											setFormData({
												...formData,
												phoneNumber: e.target.value,
											})
										}
										placeholder="0901234567"
										size="md"
										type="tel"
									/>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Additional Information */}
						<Grid
							templateColumns="repeat(2, 1fr)"
							gap={4}>
							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Ngày sinh
									</FormLabel>
									<Input
										value={formData.dateOfBirth}
										onChange={(e) =>
											setFormData({
												...formData,
												dateOfBirth: e.target.value,
											})
										}
										size="md"
										type="date"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Địa chỉ
									</FormLabel>
									<Input
										value={formData.location}
										onChange={(e) =>
											setFormData({
												...formData,
												location: e.target.value,
											})
										}
										placeholder="123 Đường ABC, Quận 1, TP.HCM"
										size="md"
									/>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Bio */}
						<FormControl>
							<FormLabel
								fontSize="14px"
								fontWeight="600"
								color="gray.700">
								Ghi chú
							</FormLabel>
							<Textarea
								value={formData.bio}
								onChange={(e) =>
									setFormData({
										...formData,
										bio: e.target.value,
									})
								}
								placeholder="Thông tin thêm về nhân viên..."
								size="md"
								rows={3}
							/>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter
					borderTop="1px solid"
					borderColor="gray.100"
					px={8}
					py={4}>
					<HStack spacing={3}>
						<Button
							variant="outline"
							onClick={handleCancel}
							isDisabled={isSubmitting}
							size="md">
							Hủy
						</Button>
						<Button
							colorScheme="brand"
							onClick={handleSubmit}
							isLoading={isSubmitting}
							loadingText="Đang thêm..."
							size="md">
							Thêm nhân viên
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddStaffModal;
