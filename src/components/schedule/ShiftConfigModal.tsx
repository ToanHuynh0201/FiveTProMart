import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Box,
	Button,
	VStack,
	HStack,
	Input,
	FormControl,
	FormLabel,
	IconButton,
	Text,
	Divider,
	useToast,
	NumberInput,
	NumberInputField,
	NumberInputStepper,
	NumberIncrementStepper,
	NumberDecrementStepper,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import type { ShiftTemplate, ShiftConfig } from "@/types";
import { scheduleService } from "@/services/scheduleService";

interface ShiftConfigModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentConfig: ShiftConfig;
	onSave: (config: ShiftConfig) => void;
}

const ShiftConfigModal = ({
	isOpen,
	onClose,
	currentConfig,
	onSave,
}: ShiftConfigModalProps) => {
	const [shifts, setShifts] = useState<ShiftTemplate[]>([]);
	const [maxShiftsPerWeek, setMaxShiftsPerWeek] = useState<number>(6);
	const [editingShift, setEditingShift] = useState<ShiftTemplate | null>(
		null,
	);
	const [isAddingNew, setIsAddingNew] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (isOpen) {
			setShifts([...currentConfig.shifts]);
			setMaxShiftsPerWeek(currentConfig.maxShiftsPerWeek || 6);
			setEditingShift(null);
			setIsAddingNew(false);
		}
	}, [isOpen, currentConfig]);

	const handleAddShift = () => {
		const newShift: ShiftTemplate = {
			id: `shift-${Date.now()}`,
			name: "",
			startTime: "08:00",
			endTime: "12:00",
			requiredWarehouseStaff: 1,
			requiredSalesStaff: 2,
			order: shifts.length,
		};
		setEditingShift(newShift);
		setIsAddingNew(true);
	};

	// Helper function to calculate working hours
	const calculateWorkingHours = (
		startTime: string,
		endTime: string,
	): number => {
		const [startHour, startMinute] = startTime.split(":").map(Number);
		const [endHour, endMinute] = endTime.split(":").map(Number);

		const startInMinutes = startHour * 60 + startMinute;
		const endInMinutes = endHour * 60 + endMinute;

		const durationInMinutes = endInMinutes - startInMinutes;
		const hours = durationInMinutes / 60;

		return parseFloat(hours.toFixed(2));
	};

	const handleSaveShift = async () => {
		if (!editingShift) return;

		if (!editingShift.name.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên ca làm việc",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (editingShift.startTime >= editingShift.endTime) {
			toast({
				title: "Lỗi",
				description: "Giờ kết thúc phải sau giờ bắt đầu",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		// Calculate and set working hours
		const workingHours = calculateWorkingHours(
			editingShift.startTime,
			editingShift.endTime,
		);
		editingShift.workingHours = workingHours;

		// Check for time overlap with other shifts
		const otherShifts = shifts.filter((s) => s.id !== editingShift.id);
		const hasOverlap = otherShifts.some((shift) => {
			// Check if new shift overlaps with existing shift
			// Overlap occurs if: (start1 < end2) AND (start2 < end1)
			return (
				editingShift.startTime < shift.endTime &&
				shift.startTime < editingShift.endTime
			);
		});

		if (hasOverlap) {
			toast({
				title: "Lỗi",
				description:
					"Thời gian ca làm việc bị trùng với ca khác. Vui lòng chọn thời gian khác.",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
			return;
		}

		// If adding new shift, create via API
		if (isAddingNew) {
			try {
				// First, create a role config for this shift
				const roleConfigResult = await scheduleService.createRoleConfig({
					configName: `Config cho ${editingShift.name}`,
					requirements: [
						{
							accountType: "WarehouseStaff",
							quantity: editingShift.requiredWarehouseStaff,
						},
						{
							accountType: "SalesStaff",
							quantity: editingShift.requiredSalesStaff,
						},
					],
				});

				if (!roleConfigResult.success) {
					toast({
						title: "Lỗi",
						description:
							roleConfigResult.error ||
							"Không thể tạo cấu hình ca làm việc",
						status: "error",
						duration: 3000,
					});
					return;
				}

				// Then create the work shift template
				const shiftResult = await scheduleService.createWorkShift({
					shiftName: editingShift.name,
					startTime: editingShift.startTime,
					endTime: editingShift.endTime,
					roleConfigId: roleConfigResult.data.id,
				});

				if (shiftResult.success) {
					// Add to local list with the returned ID
					const newShift = {
						...editingShift,
						id: shiftResult.data.id,
					};
					setShifts([...shifts, newShift]);

					toast({
						title: "Thành công",
						description: `Đã thêm ca "${editingShift.name}"`,
						status: "success",
						duration: 2000,
						isClosable: true,
					});
				} else {
					toast({
						title: "Lỗi",
						description:
							shiftResult.error || "Không thể tạo ca làm việc",
						status: "error",
						duration: 3000,
					});
					return;
				}
			} catch (error) {
				console.error("Error creating shift:", error);
				toast({
					title: "Lỗi",
					description: "Đã xảy ra lỗi khi tạo ca làm việc",
					status: "error",
					duration: 3000,
				});
				return;
			}
		} else {
			// For editing existing shifts, just update local state
			// (API doesn't have update endpoint)
			setShifts(
				shifts.map((shift) =>
					shift.id === editingShift.id ? editingShift : shift,
				),
			);
			toast({
				title: "Thành công",
				description: `Đã cập nhật ca "${editingShift.name}" (chỉ cục bộ)`,
				status: "success",
				duration: 2000,
				isClosable: true,
			});
		}

		setEditingShift(null);
		setIsAddingNew(false);
	};

	const handleDeleteShift = (shiftId: string) => {
		if (shifts.length <= 1) {
			toast({
				title: "Lỗi",
				description: "Phải có ít nhất 1 ca làm việc",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setShifts(
			shifts
				.filter((shift) => shift.id !== shiftId)
				.map((shift, index) => ({ ...shift, order: index })),
		);

		if (editingShift?.id === shiftId) {
			setEditingShift(null);
			setIsAddingNew(false);
		}
	};

	const handleCancel = () => {
		setEditingShift(null);
		setIsAddingNew(false);
	};

	const handleSaveConfig = () => {
		if (editingShift) {
			toast({
				title: "Lưu ý",
				description: "Vui lòng hoàn tất chỉnh sửa ca làm việc hiện tại",
				status: "warning",
				duration: 3000,
			});
			return;
		}

		const config: ShiftConfig = {
			shifts: shifts.map((shift, index) => ({ ...shift, order: index })),
			maxShiftsPerWeek: maxShiftsPerWeek,
			updatedAt: new Date().toISOString(),
		};

		onSave(config);
		toast({
			title: "Thành công",
			description: "Đã lưu cấu hình ca làm việc",
			status: "success",
			duration: 3000,
		});
		onClose();
	};

	const moveShift = (index: number, direction: "up" | "down") => {
		const newIndex = direction === "up" ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= shifts.length) return;

		const newShifts = [...shifts];
		[newShifts[index], newShifts[newIndex]] = [
			newShifts[newIndex],
			newShifts[index],
		];
		setShifts(newShifts.map((shift, idx) => ({ ...shift, order: idx })));
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="4xl">
			<ModalOverlay />
			<ModalContent maxW="900px">
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600"
					borderBottom="2px solid"
					borderColor="brand.600"
					pb={4}>
					Cấu hình ca làm việc
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody py={6}>
					<VStack
						spacing={4}
						align="stretch">
						{/* Max Shifts Per Week Setting */}
						<Box
							p={4}
							bg="blue.50"
							borderRadius="md"
							borderLeft="4px solid"
							borderLeftColor="blue.500">
							<FormControl>
								<HStack
									spacing={4}
									align="center">
									<Box flex={1}>
										<FormLabel
											fontSize="15px"
											fontWeight="600"
											mb={1}>
											Số ca tối đa mỗi nhân viên có thể
											làm trong 1 tuần
										</FormLabel>
										<Text
											fontSize="13px"
											color="gray.600">
											Nhân viên sẽ không xuất hiện trong
											danh sách khi đã đạt giới hạn
										</Text>
									</Box>
									<NumberInput
										value={maxShiftsPerWeek}
										onChange={(_, value) =>
											setMaxShiftsPerWeek(value)
										}
										min={1}
										max={14}
										w="120px">
										<NumberInputField />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</HStack>
							</FormControl>
						</Box>
						<Box
							p={4}
							bg="blue.50"
							borderRadius="md"
							borderLeft="4px solid"
							borderLeftColor="green.500">
							<FormControl>
								<HStack
									spacing={4}
									align="center">
									<Box flex={1}>
										<FormLabel
											fontSize="15px"
											fontWeight="600"
											mb={1}>
											Số giờ tối mỗi nhân viên có thể làm
											trong 1 tuần
										</FormLabel>
										<Text
											fontSize="13px"
											color="green.600">
											Nhân viên sẽ không xuất hiện trong
											danh sách khi đã đạt giới hạn
										</Text>
									</Box>
									<NumberInput
										value={maxShiftsPerWeek}
										onChange={(_, value) =>
											setMaxShiftsPerWeek(value)
										}
										min={1}
										max={14}
										w="120px">
										<NumberInputField />
										<NumberInputStepper>
											<NumberIncrementStepper />
											<NumberDecrementStepper />
										</NumberInputStepper>
									</NumberInput>
								</HStack>
							</FormControl>
						</Box>

						<Divider />

						{/* Shift List */}
						<Box>
							<HStack
								justify="space-between"
								mb={4}>
								<Text
									fontSize="18px"
									fontWeight="600"
									color="brand.600">
									Danh sách ca làm việc
								</Text>
								<Button
									leftIcon={<AddIcon />}
									colorScheme="blue"
									size="sm"
									onClick={handleAddShift}
									isDisabled={editingShift !== null}>
									Thêm ca
								</Button>
							</HStack>

							<VStack
								spacing={3}
								align="stretch">
								{/* New Shift Form (when adding) */}
								{isAddingNew && editingShift && (
									<Box
										p={4}
										border="2px solid"
										borderColor="blue.500"
										borderRadius="md"
										bg="blue.50">
										<Text
											fontSize="16px"
											fontWeight="600"
											color="blue.700"
											mb={3}>
											➕ Thêm ca làm việc mới
										</Text>
										<VStack
											spacing={3}
											align="stretch">
											<FormControl>
												<FormLabel
													fontSize="14px"
													fontWeight="600">
													Tên ca
												</FormLabel>
												<Input
													value={editingShift.name}
													onChange={(e) =>
														setEditingShift({
															...editingShift,
															name: e.target
																.value,
														})
													}
													placeholder="VD: Ca Sáng, Ca Chiều, Ca Tối"
													bg="white"
												/>
											</FormControl>

											<HStack spacing={4}>
												<FormControl flex={1}>
													<FormLabel
														fontSize="14px"
														fontWeight="600">
														Giờ bắt đầu
													</FormLabel>
													<Input
														type="time"
														step="3600"
														value={
															editingShift.startTime
														}
														onChange={(e) =>
															setEditingShift({
																...editingShift,
																startTime:
																	e.target
																		.value,
															})
														}
														bg="white"
													/>
												</FormControl>

												<FormControl flex={1}>
													<FormLabel
														fontSize="14px"
														fontWeight="600">
														Giờ kết thúc
													</FormLabel>
													<Input
														type="time"
														step="3600"
														value={
															editingShift.endTime
														}
														onChange={(e) =>
															setEditingShift({
																...editingShift,
																endTime:
																	e.target
																		.value,
															})
														}
														bg="white"
													/>
												</FormControl>
											</HStack>

											{/* Display calculated working hours */}
											{editingShift.startTime &&
												editingShift.endTime &&
												editingShift.startTime <
													editingShift.endTime && (
													<Box
														p={2}
														bg="blue.50"
														borderRadius="md"
														border="1px solid"
														borderColor="blue.200">
														<Text
															fontSize="14px"
															color="blue.700"
															fontWeight="600">
															📋 Số giờ làm việc:{" "}
															{calculateWorkingHours(
																editingShift.startTime,
																editingShift.endTime,
															)}{" "}
															giờ
														</Text>
													</Box>
												)}

											<HStack spacing={4}>
												<FormControl flex={1}>
													<FormLabel
														fontSize="14px"
														fontWeight="600">
														Nhân viên kho cần thiết
													</FormLabel>
													<NumberInput
														value={
															editingShift.requiredWarehouseStaff
														}
														onChange={(_, value) =>
															setEditingShift({
																...editingShift,
																requiredWarehouseStaff:
																	value || 0,
															})
														}
														min={0}
														max={50}
														bg="white">
														<NumberInputField />
														<NumberInputStepper>
															<NumberIncrementStepper />
															<NumberDecrementStepper />
														</NumberInputStepper>
													</NumberInput>
												</FormControl>

												<FormControl flex={1}>
													<FormLabel
														fontSize="14px"
														fontWeight="600">
														Nhân viên bán hàng cần
														thiết
													</FormLabel>
													<NumberInput
														value={
															editingShift.requiredSalesStaff
														}
														onChange={(_, value) =>
															setEditingShift({
																...editingShift,
																requiredSalesStaff:
																	value || 0,
															})
														}
														min={0}
														max={50}
														bg="white">
														<NumberInputField />
														<NumberInputStepper>
															<NumberIncrementStepper />
															<NumberDecrementStepper />
														</NumberInputStepper>
													</NumberInput>
												</FormControl>
											</HStack>

											<HStack
												justify="flex-end"
												spacing={2}>
												<Button
													size="sm"
													onClick={handleCancel}>
													Hủy
												</Button>
												<Button
													size="sm"
													colorScheme="blue"
													onClick={handleSaveShift}>
													Lưu ca mới
												</Button>
											</HStack>
										</VStack>
									</Box>
								)}

								{/* Existing Shifts List */}
								{shifts.map((shift, index) => (
									<Box
										key={shift.id}
										p={4}
										border="1px solid"
										borderColor={
											editingShift?.id === shift.id
												? "brand.500"
												: "gray.200"
										}
										borderRadius="md"
										bg={
											editingShift?.id === shift.id
												? "blue.50"
												: "white"
										}>
										{editingShift?.id === shift.id ? (
											// Edit Mode
											<VStack
												spacing={3}
												align="stretch">
												<FormControl>
													<FormLabel
														fontSize="14px"
														fontWeight="600">
														Tên ca
													</FormLabel>
													<Input
														value={
															editingShift.name
														}
														onChange={(e) =>
															setEditingShift({
																...editingShift,
																name: e.target
																	.value,
															})
														}
														placeholder="VD: Ca Sáng, Ca Chiều, Ca Tối"
													/>
												</FormControl>
												<HStack spacing={4}>
													<FormControl flex={1}>
														<FormLabel
															fontSize="14px"
															fontWeight="600">
															Giờ bắt đầu
														</FormLabel>
														<Input
															type="time"
															step="3600"
															value={
																editingShift.startTime
															}
															onChange={(e) =>
																setEditingShift(
																	{
																		...editingShift,
																		startTime:
																			e
																				.target
																				.value,
																	},
																)
															}
														/>
													</FormControl>

													<FormControl flex={1}>
														<FormLabel
															fontSize="14px"
															fontWeight="600">
															Giờ kết thúc
														</FormLabel>
														<Input
															type="time"
															step="3600"
															value={
																editingShift.endTime
															}
															onChange={(e) =>
																setEditingShift(
																	{
																		...editingShift,
																		endTime:
																			e
																				.target
																				.value,
																	},
																)
															}
														/>
													</FormControl>
												</HStack>

												{/* Display calculated working hours */}
												{editingShift.startTime &&
													editingShift.endTime &&
													editingShift.startTime <
														editingShift.endTime && (
														<Box
															p={2}
															bg="blue.50"
															borderRadius="md"
															border="1px solid"
															borderColor="blue.200">
															<Text
																fontSize="14px"
																color="blue.700"
																fontWeight="600">
																📋 Số giờ làm
																việc:{" "}
																{calculateWorkingHours(
																	editingShift.startTime,
																	editingShift.endTime,
																)}{" "}
																giờ
															</Text>
														</Box>
													)}

												<HStack spacing={4}>
													<FormControl flex={1}>
														<FormLabel
															fontSize="14px"
															fontWeight="600">
															Nhân viên kho cần
															thiết
														</FormLabel>
														<NumberInput
															value={
																editingShift.requiredWarehouseStaff
															}
															onChange={(
																_,
																value,
															) =>
																setEditingShift(
																	{
																		...editingShift,
																		requiredWarehouseStaff:
																			value ||
																			0,
																	},
																)
															}
															min={0}
															max={50}>
															<NumberInputField />
															<NumberInputStepper>
																<NumberIncrementStepper />
																<NumberDecrementStepper />
															</NumberInputStepper>
														</NumberInput>
													</FormControl>

													<FormControl flex={1}>
														<FormLabel
															fontSize="14px"
															fontWeight="600">
															Nhân viên bán hàng
															cần thiết
														</FormLabel>
														<NumberInput
															value={
																editingShift.requiredSalesStaff
															}
															onChange={(
																_,
																value,
															) =>
																setEditingShift(
																	{
																		...editingShift,
																		requiredSalesStaff:
																			value ||
																			0,
																	},
																)
															}
															min={0}
															max={50}>
															<NumberInputField />
															<NumberInputStepper>
																<NumberIncrementStepper />
																<NumberDecrementStepper />
															</NumberInputStepper>
														</NumberInput>
													</FormControl>
												</HStack>
												<HStack
													justify="flex-end"
													spacing={2}>
													<Button
														size="sm"
														onClick={handleCancel}>
														Hủy
													</Button>
													<Button
														size="sm"
														colorScheme="blue"
														onClick={
															handleSaveShift
														}>
														Lưu
													</Button>
												</HStack>
											</VStack>
										) : (
											// View Mode
											<HStack justify="space-between">
												<VStack
													align="start"
													spacing={1}
													flex={1}>
													<HStack>
														<Text
															fontSize="16px"
															fontWeight="600">
															{shift.name ||
																"Chưa đặt tên"}
														</Text>
														<Text
															fontSize="14px"
															color="gray.600">
															({shift.startTime} -{" "}
															{shift.endTime})
														</Text>
														<Text
															fontSize="14px"
															color="blue.600"
															fontWeight="600">
															•{" "}
															{shift.workingHours ||
																calculateWorkingHours(
																	shift.startTime,
																	shift.endTime,
																)}{" "}
															giờ
														</Text>
													</HStack>
													<HStack
														spacing={4}
														fontSize="14px">
														<Text>
															<strong>
																Kho:
															</strong>{" "}
															{
																shift.requiredWarehouseStaff
															}{" "}
															người
														</Text>
														<Text>
															<strong>
																Bán hàng:
															</strong>{" "}
															{
																shift.requiredSalesStaff
															}{" "}
															người
														</Text>
													</HStack>
												</VStack>

												<HStack spacing={1}>
													<IconButton
														aria-label="Move up"
														icon={
															<Text fontSize="18px">
																↑
															</Text>
														}
														size="sm"
														variant="ghost"
														onClick={() =>
															moveShift(
																index,
																"up",
															)
														}
														isDisabled={
															index === 0 ||
															editingShift !==
																null
														}
													/>
													<IconButton
														aria-label="Move down"
														icon={
															<Text fontSize="18px">
																↓
															</Text>
														}
														size="sm"
														variant="ghost"
														onClick={() =>
															moveShift(
																index,
																"down",
															)
														}
														isDisabled={
															index ===
																shifts.length -
																	1 ||
															editingShift !==
																null
														}
													/>
													<IconButton
														aria-label="Edit shift"
														icon={<EditIcon />}
														size="sm"
														colorScheme="blue"
														variant="ghost"
														onClick={() =>
															setEditingShift(
																shift,
															)
														}
														isDisabled={
															editingShift !==
															null
														}
													/>
													<IconButton
														aria-label="Delete shift"
														icon={<DeleteIcon />}
														size="sm"
														colorScheme="red"
														variant="ghost"
														onClick={() =>
															handleDeleteShift(
																shift.id,
															)
														}
														isDisabled={
															editingShift !==
															null
														}
													/>
												</HStack>
											</HStack>
										)}
									</Box>
								))}
							</VStack>
						</Box>

						<Divider my={4} />

						{/* Action Buttons */}
						<HStack
							justify="flex-end"
							spacing={3}>
							<Button onClick={onClose}>Hủy</Button>
							<Button
								colorScheme="blue"
								onClick={handleSaveConfig}>
								Lưu cấu hình
							</Button>
						</HStack>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default ShiftConfigModal;
