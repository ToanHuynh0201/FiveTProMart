import { useState, useEffect, useRef } from "react";
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
	Spinner,
	Center,
	Flex,
	Badge,
	Divider,
	Icon,
	Tooltip,
	Box,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	useDisclosure,
	Avatar,
} from "@chakra-ui/react";
import type { Staff, AccountType, UpdateStaffDTO } from "@/types/staff";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_OPTIONS } from "@/types/staff";
import { staffService } from "@/services/staffService";
import { formatDateForAPI, formatDateForInput } from "@/utils/dateFormat";
import {
	FiPhone,
	FiMail,
	FiMapPin,
	FiUser,
	FiCopy,
	FiCheck,
	FiEdit2,
	FiTrash2,
	FiCalendar,
	FiDollarSign,
} from "react-icons/fi";

interface StaffViewEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	staffId: string | null;
	mode: "view" | "edit";
	onSuccess?: () => void;
	onViewSalary?: (staffId: string) => void;
}

export const StaffViewEditModal: React.FC<StaffViewEditModalProps> = ({
	isOpen,
	onClose,
	staffId,
	mode: initialMode,
	onSuccess,
	onViewSalary,
}) => {
	const toast = useToast();
	const [mode, setMode] = useState<"view" | "edit">(initialMode);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [staffData, setStaffData] = useState<Staff | null>(null);

	// Delete confirmation dialog
	const {
		isOpen: isDeleteDialogOpen,
		onOpen: onDeleteDialogOpen,
		onClose: onDeleteDialogClose,
	} = useDisclosure();
	const cancelRef = useRef<HTMLButtonElement>(null);

	// Form data for edit mode
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phoneNumber: "",
		accountType: "SalesStaff" as AccountType,
		dateOfBirth: "",
		location: "",
		bio: "",
	});

	const [errors, setErrors] = useState({
		fullName: "",
		email: "",
		phoneNumber: "",
	});

	// Copy states
	const [isPhoneCopied, setIsPhoneCopied] = useState(false);
	const [isEmailCopied, setIsEmailCopied] = useState(false);

	// Load staff data when modal opens
	useEffect(() => {
		if (isOpen && staffId) {
			loadStaffData();
		}
		// Reset mode to initial mode when modal opens
		setMode(initialMode);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, staffId, initialMode]);

	const loadStaffData = async () => {
		if (!staffId) return;

		setIsFetching(true);
		try {
			const result = await staffService.getStaffById(staffId);

			if (result.success && result.data) {
				setStaffData(result.data);
				// Populate form data for edit mode
				setFormData({
					fullName: result.data.fullName,
					email: result.data.email,
					phoneNumber: result.data.phoneNumber,
					accountType: result.data.accountType,
					dateOfBirth: formatDateForInput(result.data.dateOfBirth),
					location: result.data.location || "",
					bio: "",
				});
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải thông tin nhân viên",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error loading staff:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tải thông tin nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsFetching(false);
		}
	};

	const validatePhone = (phone: string): boolean => {
		if (!phone) return false;
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const validateEmail = (email: string): boolean => {
		if (!email) return false;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async () => {
		// Validate form
		const newErrors = {
			fullName: "",
			email: "",
			phoneNumber: "",
		};

		if (!formData.fullName.trim()) {
			newErrors.fullName = "Vui lòng nhập họ và tên";
		} else if (formData.fullName.trim().length < 2) {
			newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Vui lòng nhập email";
		} else if (!validateEmail(formData.email)) {
			newErrors.email = "Email không hợp lệ";
		}

		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
		} else if (!validatePhone(formData.phoneNumber)) {
			newErrors.phoneNumber =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		setErrors(newErrors);

		if (newErrors.fullName || newErrors.email || newErrors.phoneNumber) {
			return;
		}

		if (!staffId) return;

		setIsLoading(true);

		try {
			const updateData: UpdateStaffDTO = {
				fullName: formData.fullName,
				email: formData.email,
				phoneNumber: formData.phoneNumber,
				accountType: formData.accountType,
				dateOfBirth: formData.dateOfBirth
					? formatDateForAPI(formData.dateOfBirth)
					: undefined,
				location: formData.location || undefined,
				bio: formData.bio || undefined,
			};

			const result = await staffService.updateStaff(staffId, updateData);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Cập nhật nhân viên thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onSuccess?.();
				onClose();
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Có lỗi xảy ra khi cập nhật nhân viên",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error updating staff:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyPhone = async () => {
		if (!staffData?.phoneNumber) return;

		try {
			await navigator.clipboard.writeText(staffData.phoneNumber);
			setIsPhoneCopied(true);
			setTimeout(() => setIsPhoneCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const handleCopyEmail = async () => {
		if (!staffData?.email) return;

		try {
			await navigator.clipboard.writeText(staffData.email);
			setIsEmailCopied(true);
			setTimeout(() => setIsEmailCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const switchToEditMode = () => {
		setMode("edit");
	};

	const handleDelete = async () => {
		if (!staffId) return;

		setIsDeleting(true);

		try {
			const result = await staffService.deleteStaff(staffId);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã xóa nhân viên thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onDeleteDialogClose();
				onSuccess?.();
				onClose();
			} else {
				// Handle 409 conflict - staff has pending orders
				toast({
					title: "Lỗi",
					description:
						result.error || "Có lỗi xảy ra khi xóa nhân viên",
					status: "error",
					duration: 5000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error deleting staff:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi xóa nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const InfoRow = ({
		icon,
		label,
		value,
		onCopy,
		isCopied,
	}: {
		icon: React.ElementType;
		label: string;
		value?: string | null;
		onCopy?: () => void;
		isCopied?: boolean;
	}) => (
		<Flex
			align="center"
			gap={2}
			py={2}
			px={3}
			bg="gray.50"
			borderRadius="10px"
			cursor={onCopy ? "pointer" : "default"}
			onClick={onCopy}
			_hover={onCopy ? { bg: "gray.100" } : {}}
			transition="background 0.2s">
			<Icon
				as={icon}
				w="16px"
				h="16px"
				color="#161f70"
			/>
			<Box flex={1}>
				<Text
					fontSize="11px"
					fontWeight="600"
					color="gray.600"
					mb={0.5}>
					{label}
				</Text>
				<Flex
					align="center"
					gap={2}>
					<Text
						fontSize="13px"
						fontWeight="500"
						color="#161f70">
						{value || "N/A"}
					</Text>
					{onCopy && value && (
						<Tooltip
							label={isCopied ? "Đã copy!" : "Click để copy"}
							placement="top"
							hasArrow>
							<Box>
								<Icon
									as={isCopied ? FiCheck : FiCopy}
									w="14px"
									h="14px"
									color={isCopied ? "green.500" : "gray.500"}
								/>
							</Box>
						</Tooltip>
					)}
				</Flex>
			</Box>
		</Flex>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={{ base: "full", md: "3xl" }}
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
					px={6}
					borderBottom="1px solid"
					borderColor="gray.100">
					{mode === "view"
						? "Thông tin chi tiết nhân viên"
						: "Chỉnh sửa nhân viên"}
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
						<Center py={10}>
							<Spinner
								size="xl"
								color="#161f70"
							/>
						</Center>
					) : staffData ? (
						<VStack
							spacing={5}
							align="stretch"
							mt={4}>
							{mode === "view" ? (
								/* VIEW MODE */
								<>
									{/* Header Info */}
									<Flex
										gap={4}
										align="center"
										flexWrap="wrap">
										<Avatar
											size="xl"
											name={staffData.fullName}
											src={staffData.avatarUrl || undefined}
											bg="#161f70"
											color="white"
										/>
										<Box flex={1}>
											<Text
												fontSize="28px"
												fontWeight="700"
												color="#161f70"
												mb={1}>
												{staffData.fullName}
											</Text>
											<HStack spacing={2}>
												<Text
													fontSize="14px"
													color="gray.600"
													fontWeight="500">
													@{staffData.username}
												</Text>
												<Badge
													colorScheme={
														staffData.accountType ===
														"SalesStaff"
															? "blue"
															: "green"
													}
													fontSize="12px"
													px={3}
													py={1}
													borderRadius="full">
													{
														ACCOUNT_TYPE_LABELS[
															staffData.accountType
														]
													}
												</Badge>
											</HStack>
										</Box>
									</Flex>

									<Divider />

									{/* Contact Info Grid */}
									<Grid
										templateColumns={{
											base: "1fr",
											md: "repeat(2, 1fr)",
										}}
										gap={4}>
										<GridItem>
											<InfoRow
												icon={FiPhone}
												label="Số điện thoại"
												value={staffData.phoneNumber}
												onCopy={handleCopyPhone}
												isCopied={isPhoneCopied}
											/>
										</GridItem>
										<GridItem>
											<InfoRow
												icon={FiMail}
												label="Email"
												value={staffData.email}
												onCopy={handleCopyEmail}
												isCopied={isEmailCopied}
											/>
										</GridItem>
										<GridItem>
											<InfoRow
												icon={FiCalendar}
												label="Ngày sinh"
												value={staffData.dateOfBirth}
											/>
										</GridItem>
										<GridItem>
											<InfoRow
												icon={FiUser}
												label="User ID"
												value={staffData.userId}
											/>
										</GridItem>
										<GridItem colSpan={{ base: 1, md: 2 }}>
											<InfoRow
												icon={FiMapPin}
												label="Địa chỉ"
												value={staffData.location}
											/>
										</GridItem>
									</Grid>
								</>
							) : (
								/* EDIT MODE */
								<>
									<Grid
										templateColumns={{
											base: "1fr",
											md: "repeat(2, 1fr)",
										}}
										gap={5}>
										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl
												isRequired
												isInvalid={!!errors.fullName}>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Họ và tên
												</FormLabel>
												<Input
													value={formData.fullName}
													onChange={(e) => {
														setFormData({
															...formData,
															fullName:
																e.target.value,
														});
														setErrors({
															...errors,
															fullName: "",
														});
													}}
													size="lg"
													borderColor={
														errors.fullName
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.fullName && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{errors.fullName}
													</Text>
												)}
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl isRequired>
												<FormLabel
													fontSize="16px"
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
													size="lg">
													{ACCOUNT_TYPE_OPTIONS.map(
														(option) => (
															<option
																key={
																	option.value
																}
																value={
																	option.value
																}>
																{option.label}
															</option>
														),
													)}
												</Select>
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl
												isRequired
												isInvalid={!!errors.email}>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Email
												</FormLabel>
												<Input
													value={formData.email}
													onChange={(e) => {
														setFormData({
															...formData,
															email: e.target
																.value,
														});
														setErrors({
															...errors,
															email: "",
														});
													}}
													size="lg"
													type="email"
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

										<GridItem>
											<FormControl
												isRequired
												isInvalid={!!errors.phoneNumber}>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Số điện thoại
												</FormLabel>
												<Input
													value={formData.phoneNumber}
													onChange={(e) => {
														setFormData({
															...formData,
															phoneNumber:
																e.target.value,
														});
														setErrors({
															...errors,
															phoneNumber: "",
														});
													}}
													size="lg"
													borderColor={
														errors.phoneNumber
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.phoneNumber && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{errors.phoneNumber}
													</Text>
												)}
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Ngày sinh
												</FormLabel>
												<Input
													value={formData.dateOfBirth}
													onChange={(e) =>
														setFormData({
															...formData,
															dateOfBirth:
																e.target.value,
														})
													}
													size="lg"
													type="date"
												/>
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Địa chỉ
												</FormLabel>
												<Input
													value={formData.location}
													onChange={(e) =>
														setFormData({
															...formData,
															location:
																e.target.value,
														})
													}
													size="lg"
													placeholder="123 Đường ABC, Quận 1, TP.HCM"
												/>
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl>
												<FormLabel
													fontSize="16px"
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
													size="lg"
													rows={3}
													resize="vertical"
													placeholder="Thông tin thêm về nhân viên..."
												/>
											</FormControl>
										</GridItem>
									</Grid>
								</>
							)}
						</VStack>
					) : (
						<Text
							textAlign="center"
							color="gray.500"
							py={10}>
							Không tìm thấy thông tin nhân viên
						</Text>
					)}
				</ModalBody>

				<ModalFooter
					px={6}
					py={4}
					borderTop="1px solid"
					borderColor="gray.200">
					<Flex
						justify="space-between"
						w="full">
						{/* Left side - Delete button (only in view mode) */}
					<HStack spacing={3}>
						{mode === "view" && staffData && onViewSalary && (
							<Button
								leftIcon={<Icon as={FiDollarSign} />}
								colorScheme="green"
								variant="ghost"
								size="lg"
								onClick={() => onViewSalary(staffData.userId)}
								_hover={{ bg: "green.50" }}>
								Xem lương
							</Button>
						)}
						{mode === "view" && staffData && (
							<Button
								leftIcon={<Icon as={FiTrash2} />}
								colorScheme="red"
								variant="ghost"
								size="lg"
								onClick={onDeleteDialogOpen}
								_hover={{ bg: "red.50" }}>
								Xóa
							</Button>
						)}
					</HStack>
						{/* Right side - Action buttons */}
						<HStack spacing={3}>
							<Button
								variant="ghost"
								size="lg"
								onClick={() => {
									if (mode === "edit") {
										setMode("view");
										// Reset form data
										if (staffData) {
											setFormData({
												fullName: staffData.fullName,
												email: staffData.email,
												phoneNumber:
													staffData.phoneNumber,
												accountType:
													staffData.accountType,
												dateOfBirth: formatDateForInput(
													staffData.dateOfBirth,
												),
												location:
													staffData.location || "",
												bio: "",
											});
										}
										setErrors({
											fullName: "",
											email: "",
											phoneNumber: "",
										});
									} else {
										onClose();
									}
								}}
								isDisabled={isLoading}
								_hover={{ bg: "gray.100" }}
								px={8}>
								{mode === "edit" ? "Quay lại" : "Đóng"}
							</Button>
							{mode === "edit" ? (
								<Button
									colorScheme="blue"
									size="lg"
									onClick={handleSubmit}
									isLoading={isLoading}
									loadingText="Đang cập nhật..."
									bg="#161f70"
									_hover={{ bg: "#0f1654" }}
									isDisabled={isFetching}
									px={8}>
									Cập nhật
								</Button>
							) : (
								staffData && (
									<Button
										leftIcon={<Icon as={FiEdit2} />}
										colorScheme="blue"
										bg="#161f70"
										_hover={{ bg: "#0f1654" }}
										size="lg"
										onClick={switchToEditMode}
										px={8}>
										Chỉnh sửa
									</Button>
								)
							)}
						</HStack>
					</Flex>
				</ModalFooter>
			</ModalContent>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={isDeleteDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteDialogClose}
				isCentered>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold">
							Xác nhận xóa nhân viên
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc chắn muốn xóa nhân viên{" "}
							<Text
								as="span"
								fontWeight="bold"
								color="#161f70">
								{staffData?.fullName}
							</Text>
							? Hành động này không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={cancelRef}
								onClick={onDeleteDialogClose}
								isDisabled={isDeleting}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleDelete}
								ml={3}
								isLoading={isDeleting}
								loadingText="Đang xóa...">
								Xóa
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Modal>
	);
};

export default StaffViewEditModal;
