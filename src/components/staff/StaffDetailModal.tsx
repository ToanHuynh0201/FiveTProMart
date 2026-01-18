import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	Box,
	Flex,
	Text,
	Badge,
	Divider,
	Grid,
	GridItem,
	VStack,
	HStack,
	Spinner,
	Button,
	Input,
	Select,
	FormControl,
	FormLabel,
	useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { StaffDetail, UpdateStaffDTO, AccountType } from "@/types/staff";
import { ACCOUNT_TYPE_LABELS, ACCOUNT_TYPE_OPTIONS } from "@/types/staff";
import { staffService } from "@/services/staffService";
import { formatDateForAPI, formatDateForInput } from "@/utils/dateFormat";

interface StaffDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	staffId: string | null;
	onDelete?: (id: string) => void;
}

const StaffDetailModal = ({
	isOpen,
	onClose,
	staffId,
	onDelete,
}: StaffDetailModalProps) => {
	const [staffDetail, setStaffDetail] = useState<StaffDetail | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [formData, setFormData] = useState<UpdateStaffDTO>({});
	const toast = useToast();

	useEffect(() => {
		if (staffId && isOpen) {
			loadStaffDetail();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [staffId, isOpen]);

	const loadStaffDetail = async () => {
		if (!staffId) return;

		setIsLoading(true);
		try {
			const result = await staffService.getStaffById(staffId);

			if (result.success && result.data) {
				setStaffDetail(result.data);
				setFormData({
					fullName: result.data.fullName,
					email: result.data.email,
					phoneNumber: result.data.phoneNumber,
					accountType: result.data.accountType,
					dateOfBirth: formatDateForInput(result.data.dateOfBirth),
					location: result.data.location || "",
				});
			} else {
				toast({
					title: "Lỗi",
					description: "Không thể tải thông tin nhân viên",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error loading staff detail:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải thông tin nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleSave = async () => {
		if (!staffId) return;

		setIsSaving(true);
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
			};

			const result = await staffService.updateStaff(staffId, updateData);

			if (result.success) {
				setStaffDetail(result.data);
				setIsEditing(false);
				toast({
					title: "Thành công",
					description: "Cập nhật thông tin nhân viên thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể cập nhật thông tin nhân viên",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error updating staff:", error);
			toast({
				title: "Lỗi",
				description: "Không thể cập nhật thông tin nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		if (staffDetail) {
			setFormData({
				fullName: staffDetail.fullName,
				email: staffDetail.email,
				phoneNumber: staffDetail.phoneNumber,
				accountType: staffDetail.accountType,
				dateOfBirth: formatDateForInput(staffDetail.dateOfBirth),
				location: staffDetail.location || "",
			});
		}
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (!staffId || !onDelete) return;

		setIsDeleting(true);
		try {
			const result = await staffService.deleteStaff(staffId);

			if (result.success) {
				onDelete(staffId);
				onClose();
				toast({
					title: "Thành công",
					description: "Xóa nhân viên thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể xóa nhân viên",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error deleting staff:", error);
			toast({
				title: "Lỗi",
				description: "Không thể xóa nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	const InfoRow = ({
		label,
		value,
	}: {
		label: string;
		value?: string | number | null;
	}) => (
		<Flex
			justify="space-between"
			align="center"
			py={2}>
			<Text
				fontSize="14px"
				fontWeight="600"
				color="gray.600">
				{label}:
			</Text>
			<Text
				fontSize="14px"
				fontWeight="500"
				color="brand.600">
				{value || "N/A"}
			</Text>
		</Flex>
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="2xl"
			isCentered>
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent
				borderRadius="24px"
				maxH="90vh"
				overflowY="auto"
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
						Thông tin chi tiết nhân viên
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
					{isLoading ? (
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
					) : staffDetail ? (
						<VStack
							spacing={6}
							align="stretch">
							<VStack
								spacing={6}
								align="stretch">
								{/* Header Section */}
								<Flex
									gap={6}
									align="start">
									{/* Avatar */}
									<Box
										w="100px"
										h="100px"
										borderRadius="full"
										bg="brand.100"
										display="flex"
										alignItems="center"
										justifyContent="center"
										fontSize="40px"
										fontWeight="700"
										color="brand.500"
										flexShrink={0}>
										{staffDetail.fullName.charAt(0)}
									</Box>
									{/* Basic Info */}
									<VStack
										align="start"
										spacing={3}
										flex={1}>
										<Text
											fontSize="28px"
											fontWeight="900"
											color="brand.600">
											{staffDetail.fullName}
										</Text>

										{isEditing ? (
											<VStack
												align="start"
												spacing={2}
												w="full">
												<FormControl>
													<FormLabel
														fontSize="14px"
														fontWeight="600"
														color="gray.600">
														Chức vụ
													</FormLabel>
													<Select
														value={
															formData.accountType ||
															""
														}
														onChange={(e) =>
															setFormData({
																...formData,
																accountType: e
																	.target
																	.value as AccountType,
															})
														}
														size="sm">
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
											</VStack>
										) : (
											<>
												<Text
													fontSize="14px"
													color="gray.600">
													@{staffDetail.username}
												</Text>
												<Badge
													colorScheme={
														staffDetail.accountType ===
														"SalesStaff"
															? "blue"
															: "green"
													}
													borderRadius="8px"
													px={3}
													py={1}
													fontSize="12px"
													fontWeight="500">
													{
														ACCOUNT_TYPE_LABELS[
															staffDetail.accountType
														]
													}
												</Badge>
											</>
										)}
									</VStack>
									{/* Action Buttons */}
									{!isEditing && (
										<HStack spacing={2}>
											<Button
												size="sm"
												colorScheme="brand"
												onClick={() =>
													setIsEditing(true)
												}>
												Chỉnh sửa
											</Button>
											{onDelete && (
												<Button
													size="sm"
													colorScheme="red"
													variant="outline"
													onClick={() =>
														setShowDeleteConfirm(
															true,
														)
													}>
													Xóa
												</Button>
											)}
										</HStack>
									)}
								</Flex>
								<Divider />
								{/* Contact Information */}
								<Box>
									<Text
										fontSize="18px"
										fontWeight="700"
										color="brand.600"
										mb={3}>
										Thông tin liên hệ
									</Text>
									<VStack
										spacing={3}
										align="stretch">
										{isEditing ? (
											<>
												<FormControl>
													<FormLabel
														fontSize="14px"
														fontWeight="600"
														color="gray.600">
														Số điện thoại
													</FormLabel>
													<Input
														value={
															formData.phoneNumber ||
															""
														}
														onChange={(e) =>
															setFormData({
																...formData,
																phoneNumber:
																	e.target
																		.value,
															})
														}
														size="sm"
													/>
												</FormControl>
												<FormControl>
													<FormLabel
														fontSize="14px"
														fontWeight="600"
														color="gray.600">
														Email
													</FormLabel>
													<Input
														value={
															formData.email || ""
														}
														onChange={(e) =>
															setFormData({
																...formData,
																email: e.target
																	.value,
															})
														}
														size="sm"
														type="email"
													/>
												</FormControl>
												<FormControl>
													<FormLabel
														fontSize="14px"
														fontWeight="600"
														color="gray.600">
														Địa chỉ
													</FormLabel>
													<Input
														value={
															formData.location ||
															""
														}
														onChange={(e) =>
															setFormData({
																...formData,
																location:
																	e.target
																		.value,
															})
														}
														size="sm"
													/>
												</FormControl>
											</>
										) : (
											<>
												<InfoRow
													label="Số điện thoại"
													value={
														staffDetail.phoneNumber
													}
												/>
												<InfoRow
													label="Email"
													value={staffDetail.email}
												/>
												<InfoRow
													label="Địa chỉ"
													value={staffDetail.location}
												/>
											</>
										)}
									</VStack>
								</Box>
								<Divider />
								{/* Work Information */}
								<Box>
									<Text
										fontSize="18px"
										fontWeight="700"
										color="brand.600"
										mb={3}>
										Thông tin công việc
									</Text>
									<Grid
										templateColumns="repeat(2, 1fr)"
										gap={4}>
										<GridItem>
											{isEditing ? (
												<FormControl>
													<FormLabel
														fontSize="14px"
														fontWeight="600"
														color="gray.600">
														Ngày sinh
													</FormLabel>
													<Input
														value={
															formData.dateOfBirth ||
															""
														}
														onChange={(e) =>
															setFormData({
																...formData,
																dateOfBirth:
																	e.target
																		.value,
															})
														}
														size="sm"
														type="date"
													/>
												</FormControl>
											) : (
												<InfoRow
													label="Ngày sinh"
													value={
														staffDetail.dateOfBirth
													}
												/>
											)}
										</GridItem>
									</Grid>
								</Box>
							</VStack>
						</VStack>
					) : (
						<Box
							textAlign="center"
							py={10}>
							<Text
								fontSize="18px"
								color="gray.500">
								Không tìm thấy thông tin nhân viên
							</Text>
						</Box>
					)}
				</ModalBody>

				{isEditing && (
					<ModalFooter
						borderTop="1px solid"
						borderColor="gray.100">
						<HStack spacing={3}>
							<Button
								variant="outline"
								onClick={handleCancel}
								isDisabled={isSaving}>
								Hủy
							</Button>
							<Button
								colorScheme="brand"
								onClick={handleSave}
								isLoading={isSaving}
								loadingText="Đang lưu...">
								Lưu thay đổi
							</Button>
						</HStack>
					</ModalFooter>
				)}

				{/* Delete Confirmation Dialog */}
				{showDeleteConfirm && (
					<Box
						position="absolute"
						top="0"
						left="0"
						right="0"
						bottom="0"
						bg="blackAlpha.600"
						display="flex"
						alignItems="center"
						justifyContent="center"
						borderRadius="24px"
						zIndex={10}>
						<Box
							bg="white"
							borderRadius="16px"
							p={6}
							maxW="400px"
							w="90%"
							boxShadow="xl">
							<Text
								fontSize="18px"
								fontWeight="700"
								color="brand.600"
								mb={4}>
								Xác nhận xóa
							</Text>
							<Text
								fontSize="14px"
								color="gray.700"
								mb={6}>
								Bạn có chắc chắn muốn xóa nhân viên{" "}
								<strong>{staffDetail?.fullName}</strong>? Hành động
								này không thể hoàn tác.
							</Text>
							<HStack
								spacing={3}
								justify="flex-end">
								<Button
									variant="outline"
									onClick={() => setShowDeleteConfirm(false)}
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
							</HStack>
						</Box>
					</Box>
				)}
			</ModalContent>
		</Modal>
	);
};

export default StaffDetailModal;
