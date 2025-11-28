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
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import type { StaffDetail, WorkSchedule, UpdateStaffData } from "@/types";
import { staffService } from "@/services/staffService";

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
	const [workSchedule, setWorkSchedule] = useState<WorkSchedule[]>([]);
	const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
	const [formData, setFormData] = useState<UpdateStaffData>({});
	const toast = useToast();

	useEffect(() => {
		if (staffId && isOpen) {
			loadStaffDetail();
			loadWorkSchedule();
		}
	}, [staffId, isOpen]);

	const loadStaffDetail = async () => {
		if (!staffId) return;

		setIsLoading(true);
		try {
			const data = await staffService.getStaffDetailById(staffId);
			setStaffDetail(data || null);
			if (data) {
				setFormData({
					phone: data.phone,
					email: data.email,
					address: data.address,
					salary: data.salary,
					shift: data.shift,
					status: data.status,
					position: data.position,
					dateOfBirth: data.dateOfBirth,
					hireDate: data.hireDate,
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

	const loadWorkSchedule = async () => {
		if (!staffId) return;

		setIsLoadingSchedule(true);
		try {
			const currentDate = new Date();
			const schedule = await staffService.getWorkSchedule(
				staffId,
				currentDate.getMonth() + 1,
				currentDate.getFullYear(),
			);
			setWorkSchedule(schedule);
		} catch (error) {
			console.error("Error loading work schedule:", error);
		} finally {
			setIsLoadingSchedule(false);
		}
	};

	const handleSave = async () => {
		if (!staffId) return;

		setIsSaving(true);
		try {
			const updatedStaff = await staffService.updateStaff(
				staffId,
				formData,
			);
			if (updatedStaff) {
				setStaffDetail(updatedStaff);
				setIsEditing(false);
				toast({
					title: "Thành công",
					description: "Cập nhật thông tin nhân viên thành công",
					status: "success",
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
				phone: staffDetail.phone,
				email: staffDetail.email,
				address: staffDetail.address,
				salary: staffDetail.salary,
				shift: staffDetail.shift,
				status: staffDetail.status,
				position: staffDetail.position,
				dateOfBirth: staffDetail.dateOfBirth,
				hireDate: staffDetail.hireDate,
			});
		}
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (!staffId || !onDelete) return;

		setIsDeleting(true);
		try {
			const success = await staffService.deleteStaff(staffId);
			if (success) {
				onDelete(staffId);
				onClose();
				toast({
					title: "Thành công",
					description: "Xóa nhân viên thành công",
					status: "success",
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

	const getStatusBadge = (status: string) => {
		const statusMap = {
			scheduled: { label: "Đã lên lịch", color: "blue.500" },
			completed: { label: "Hoàn thành", color: "success.500" },
			late: { label: "Đi muộn", color: "orange.500" },
			absent: { label: "Nghỉ", color: "error.500" },
		};
		return (
			statusMap[status as keyof typeof statusMap] || {
				label: status,
				color: "gray.500",
			}
		);
	};

	const getShiftLabel = (shift: "morning" | "afternoon" | "evening") => {
		const shiftMap = {
			morning: "Sáng",
			afternoon: "Chiều",
			evening: "Tối",
		};
		return shiftMap[shift] || shift;
	};

	const InfoRow = ({
		label,
		value,
	}: {
		label: string;
		value?: string | number;
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
						<Tabs
							colorScheme="brand"
							variant="enclosed">
							<TabList>
								<Tab
									fontWeight="600"
									_selected={{
										color: "brand.500",
										borderColor: "brand.500",
										borderBottomColor: "white",
									}}>
									Thông tin
								</Tab>
								<Tab
									fontWeight="600"
									_selected={{
										color: "brand.500",
										borderColor: "brand.500",
										borderBottomColor: "white",
									}}>
									Lịch làm việc
								</Tab>
							</TabList>

							<TabPanels>
								{/* Info Tab */}
								<TabPanel px={0}>
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
												{staffDetail.name.charAt(0)}
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
													{staffDetail.name}
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
																Vị trí
															</FormLabel>
															<Select
																value={
																	formData.position ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			position:
																				e
																					.target
																					.value,
																		},
																	)
																}
																size="sm">
																<option value="Nhân viên bán hàng">
																	Nhân viên
																	bán hàng
																</option>
																<option value="Nhân viên kho">
																	Nhân viên
																	kho
																</option>
															</Select>
														</FormControl>
														<FormControl>
															<FormLabel
																fontSize="14px"
																fontWeight="600"
																color="gray.600">
																Trạng thái
															</FormLabel>
															<Select
																value={
																	formData.status ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			status: e
																				.target
																				.value as
																				| "active"
																				| "inactive"
																				| "on-leave",
																		},
																	)
																}
																size="sm">
																<option value="active">
																	Đang làm
																	việc
																</option>
																<option value="on-leave">
																	Nghỉ phép
																</option>
																<option value="inactive">
																	Không hoạt
																	động
																</option>
															</Select>
														</FormControl>
													</VStack>
												) : (
													<>
														<Text
															fontSize="18px"
															fontWeight="500"
															color="gray.700">
															{
																staffDetail.position
															}
														</Text>
														{staffDetail.status && (
															<Badge
																colorScheme={
																	staffDetail.status ===
																	"active"
																		? "green"
																		: staffDetail.status ===
																		  "on-leave"
																		? "orange"
																		: "gray"
																}
																borderRadius="8px"
																px={3}
																py={1}
																fontSize="12px"
																fontWeight="500">
																{staffDetail.status ===
																"active"
																	? "Đang làm việc"
																	: staffDetail.status ===
																	  "on-leave"
																	? "Nghỉ phép"
																	: "Không hoạt động"}
															</Badge>
														)}
													</>
												)}
											</VStack>{" "}
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
										</Flex>{" "}
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
																	formData.phone ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			phone: e
																				.target
																				.value,
																		},
																	)
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
																	formData.email ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			email: e
																				.target
																				.value,
																		},
																	)
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
																	formData.address ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			address:
																				e
																					.target
																					.value,
																		},
																	)
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
																staffDetail.phone
															}
														/>
														<InfoRow
															label="Email"
															value={
																staffDetail.email
															}
														/>
														<InfoRow
															label="Địa chỉ"
															value={
																staffDetail.address
															}
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
														<FormControl mt={2}>
															<FormLabel
																fontSize="14px"
																fontWeight="600"
																color="gray.600">
																Ca làm việc
															</FormLabel>
															<Input
																value={
																	formData.shift ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			shift: e
																				.target
																				.value,
																		},
																	)
																}
																size="sm"
																placeholder="Sáng: 7:00 - 11:00"
															/>
														</FormControl>
													) : (
														<InfoRow
															label="Ca làm việc"
															value={
																staffDetail.shift
															}
														/>
													)}
												</GridItem>
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
																	setFormData(
																		{
																			...formData,
																			dateOfBirth:
																				e
																					.target
																					.value,
																		},
																	)
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
													{isEditing ? (
														<FormControl mt={2}>
															<FormLabel
																fontSize="14px"
																fontWeight="600"
																color="gray.600">
																Ngày vào làm
															</FormLabel>
															<Input
																value={
																	formData.hireDate ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			hireDate:
																				e
																					.target
																					.value,
																		},
																	)
																}
																size="sm"
																type="date"
															/>
														</FormControl>
													) : (
														<InfoRow
															label="Ngày vào làm"
															value={
																staffDetail.hireDate
															}
														/>
													)}
													{isEditing ? (
														<FormControl mt={2}>
															<FormLabel
																fontSize="14px"
																fontWeight="600"
																color="gray.600">
																Lương (VNĐ)
															</FormLabel>
															<Input
																value={
																	formData.salary ||
																	""
																}
																onChange={(e) =>
																	setFormData(
																		{
																			...formData,
																			salary:
																				Number(
																					e
																						.target
																						.value,
																				) ||
																				0,
																		},
																	)
																}
																size="sm"
																type="number"
																placeholder="8000000"
															/>
														</FormControl>
													) : (
														<InfoRow
															label="Lương"
															value={
																staffDetail.salary
																	? `${staffDetail.salary.toLocaleString(
																			"vi-VN",
																	  )} VNĐ`
																	: undefined
															}
														/>
													)}
												</GridItem>
											</Grid>
											{staffDetail.workDays &&
												staffDetail.workDays.length >
													0 && (
													<Box mt={3}>
														<Text
															fontSize="14px"
															fontWeight="600"
															color="gray.600"
															mb={2}>
															Ngày làm việc:
														</Text>
														<Flex
															gap={2}
															flexWrap="wrap">
															{staffDetail.workDays.map(
																(day) => (
																	<Badge
																		key={
																			day
																		}
																		bg="brand.50"
																		color="brand.600"
																		borderRadius="6px"
																		px={2}
																		py={1}
																		fontSize="12px">
																		{day}
																	</Badge>
																),
															)}
														</Flex>
													</Box>
												)}
										</Box>
									</VStack>
								</TabPanel>

								{/* Schedule Tab */}
								<TabPanel px={0}>
									<VStack
										spacing={6}
										align="stretch">
										<Flex
											justify="space-between"
											align="center">
											<Text
												fontSize="18px"
												fontWeight="700"
												color="brand.600">
												Lịch làm việc tháng{" "}
												{new Date().getMonth() + 1}/
												{new Date().getFullYear()}
											</Text>
										</Flex>{" "}
										{isLoadingSchedule ? (
											<Flex
												justify="center"
												py={10}>
												<Spinner
													size="lg"
													color="brand.500"
												/>
											</Flex>
										) : workSchedule.length > 0 ? (
											<>
												{/* Table View */}
												<Box>
													<Text
														fontSize="16px"
														fontWeight="700"
														color="brand.600"
														mb={3}>
														Chi tiết lịch làm việc
													</Text>
													<Box
														overflowX="auto"
														borderRadius="12px"
														border="1px solid"
														borderColor="gray.200">
														<Table variant="simple">
															<Thead bg="brand.50">
																<Tr>
																	<Th
																		color="brand.600"
																		fontWeight="700">
																		Ngày
																	</Th>
																	<Th
																		color="brand.600"
																		fontWeight="700">
																		Ca làm
																		việc
																	</Th>
																	<Th
																		color="brand.600"
																		fontWeight="700">
																		Giờ làm
																	</Th>
																	<Th
																		color="brand.600"
																		fontWeight="700">
																		Trạng
																		thái
																	</Th>
																	<Th
																		color="brand.600"
																		fontWeight="700">
																		Ghi chú
																	</Th>
																</Tr>
															</Thead>
															<Tbody>
																{workSchedule.map(
																	(
																		schedule,
																		index,
																	) => {
																		const statusBadge =
																			getStatusBadge(
																				schedule.status,
																			);
																		// Format date to DD/MM/YYYY
																		const dateObj =
																			new Date(
																				schedule.date,
																			);
																		const formattedDate = `${dateObj
																			.getDate()
																			.toString()
																			.padStart(
																				2,
																				"0",
																			)}/${(
																			dateObj.getMonth() +
																			1
																		)
																			.toString()
																			.padStart(
																				2,
																				"0",
																			)}/${dateObj.getFullYear()}`;

																		return (
																			<Tr
																				key={
																					index
																				}>
																				<Td
																					fontWeight="600"
																					color="gray.700">
																					{
																						formattedDate
																					}
																				</Td>
																				<Td>
																					{getShiftLabel(
																						schedule.shift,
																					)}
																				</Td>
																				<Td>
																					{
																						schedule.startTime
																					}{" "}
																					-{" "}
																					{
																						schedule.endTime
																					}
																				</Td>
																				<Td>
																					<Badge
																						bg={
																							statusBadge.color
																						}
																						color="white"
																						borderRadius="6px"
																						px={
																							2
																						}
																						py={
																							1
																						}
																						fontSize="12px">
																						{
																							statusBadge.label
																						}
																					</Badge>
																				</Td>
																				<Td
																					fontSize="14px"
																					color="gray.600">
																					{schedule.notes ||
																						"-"}
																				</Td>
																			</Tr>
																		);
																	},
																)}
															</Tbody>
														</Table>
													</Box>
												</Box>

												<Divider />

												{/* Legend */}
												<Box
													borderRadius="12px"
													border="1px solid"
													borderColor="gray.200"
													bg="gray.50"
													p={4}>
													<Text
														fontSize="14px"
														fontWeight="600"
														color="gray.700"
														mb={3}>
														Chú thích trạng thái:
													</Text>
													<Flex
														gap={4}
														flexWrap="wrap">
														<Flex
															align="center"
															gap={2}>
															<Box
																w="20px"
																h="20px"
																bg="blue.500"
																borderRadius="4px"
															/>
															<Text fontSize="14px">
																Đã lên lịch
															</Text>
														</Flex>
														<Flex
															align="center"
															gap={2}>
															<Box
																w="20px"
																h="20px"
																bg="success.500"
																borderRadius="4px"
															/>
															<Text fontSize="14px">
																Hoàn thành
															</Text>
														</Flex>
														<Flex
															align="center"
															gap={2}>
															<Box
																w="20px"
																h="20px"
																bg="orange.500"
																borderRadius="4px"
															/>
															<Text fontSize="14px">
																Đi muộn
															</Text>
														</Flex>
														<Flex
															align="center"
															gap={2}>
															<Box
																w="20px"
																h="20px"
																bg="error.500"
																borderRadius="4px"
															/>
															<Text fontSize="14px">
																Nghỉ
															</Text>
														</Flex>
													</Flex>
												</Box>
											</>
										) : (
											<Box
												textAlign="center"
												py={10}
												color="gray.500">
												Không có lịch làm việc
											</Box>
										)}
									</VStack>
								</TabPanel>
							</TabPanels>
						</Tabs>
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
								<strong>{staffDetail?.name}</strong>? Hành động
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
