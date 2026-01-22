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
	Select,
	Badge,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import type { ShiftTemplate, ShiftConfig, ShiftRoleConfig } from "@/types";
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
	const [roleConfigs, setRoleConfigs] = useState<ShiftRoleConfig[]>([]);
	const [selectedRoleConfigId, setSelectedRoleConfigId] =
		useState<string>("");
	const [newRoleConfig, setNewRoleConfig] = useState({
		configName: "",
		warehouseStaff: 1,
		salesStaff: 2,
	});
	const [isCreatingRoleConfig, setIsCreatingRoleConfig] = useState(false);
	const [editingRoleConfig, setEditingRoleConfig] =
		useState<ShiftRoleConfig | null>(null);
	const [isUpdatingRoleConfig, setIsUpdatingRoleConfig] = useState(false);
	const toast = useToast();

	useEffect(() => {
		if (isOpen) {
			setShifts([...currentConfig.shifts]);
			setMaxShiftsPerWeek(currentConfig.maxShiftsPerWeek || 6);
			setEditingShift(null);
			setIsAddingNew(false);
			loadRoleConfigs();
		}
	}, [isOpen, currentConfig]);

	const loadRoleConfigs = async () => {
		try {
			const result = await scheduleService.getRoleConfigs(true);
			if (result.success && result.data) {
				setRoleConfigs(result.data);
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải danh sách cấu hình role",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error loading role configs:", error);
		} finally {
		}
	};

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
		setSelectedRoleConfigId("");
	};

	const handleCreateRoleConfig = async () => {
		if (!newRoleConfig.configName.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên cấu hình",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsCreatingRoleConfig(true);
		try {
			const result = await scheduleService.createRoleConfig({
				configName: newRoleConfig.configName,
				requirements: [
					{
						accountType: "WarehouseStaff",
						quantity: newRoleConfig.warehouseStaff,
					},
					{
						accountType: "SalesStaff",
						quantity: newRoleConfig.salesStaff,
					},
				],
			});

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã tạo cấu hình role mới",
					status: "success",
					duration: 2000,
				});
				await loadRoleConfigs();
				setNewRoleConfig({
					configName: "",
					warehouseStaff: 1,
					salesStaff: 2,
				});
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể tạo cấu hình role",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error creating role config:", error);
		} finally {
			setIsCreatingRoleConfig(false);
		}
	};

	const handleUpdateRoleConfig = async () => {
		if (!editingRoleConfig) return;

		if (!editingRoleConfig.configName.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên cấu hình",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsUpdatingRoleConfig(true);
		try {
			const result = await scheduleService.updateRoleConfig(
				editingRoleConfig.id,
				{
					configName: editingRoleConfig.configName,
					requirements: editingRoleConfig.requirements,
					isActive: editingRoleConfig.isActive ?? true,
				},
			);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã cập nhật cấu hình role",
					status: "success",
					duration: 2000,
				});
				await loadRoleConfigs();
				setEditingRoleConfig(null);
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể cập nhật cấu hình role",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error updating role config:", error);
		} finally {
			setIsUpdatingRoleConfig(false);
		}
	};

	const handleDeleteRoleConfig = async (id: string, configName: string) => {
		if (!confirm(`Bạn có chắc muốn xóa cấu hình "${configName}"?`)) {
			return;
		}

		try {
			const result = await scheduleService.deleteRoleConfig(id);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã xóa cấu hình role",
					status: "success",
					duration: 2000,
				});
				await loadRoleConfigs();
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể xóa cấu hình role",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error deleting role config:", error);
		}
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

		// Check if this is a new shift (not yet saved to backend)
		const isNewShift = editingShift.id.startsWith("shift-");

		if (isNewShift) {
			// Validate role config selection for new shifts
			if (!selectedRoleConfigId) {
				toast({
					title: "Lỗi",
					description: "Vui lòng chọn cấu hình role cho ca làm việc",
					status: "error",
					duration: 3000,
				});
				return;
			}

			try {
				// Create the work shift template with selected role config
				const shiftResult = await scheduleService.createWorkShift({
					shiftName: editingShift.name,
					startTime: editingShift.startTime,
					endTime: editingShift.endTime,
					roleConfigId: selectedRoleConfigId,
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
			// For editing existing shifts, call update API
			// Need to get the roleConfigId from the shift or use selected one
			const roleConfigIdToUse =
				selectedRoleConfigId ||
				roleConfigs.find(
					(config) =>
						config.requirements.some(
							(req) =>
								req.accountType === "WarehouseStaff" &&
								req.quantity ===
									editingShift.requiredWarehouseStaff,
						) &&
						config.requirements.some(
							(req) =>
								req.accountType === "SalesStaff" &&
								req.quantity ===
									editingShift.requiredSalesStaff,
						),
				)?.id;

			if (!roleConfigIdToUse) {
				toast({
					title: "Lỗi",
					description: "Không tìm thấy cấu hình role phù hợp",
					status: "error",
					duration: 3000,
				});
				return;
			}

			try {
				const updateResult = await scheduleService.updateWorkShift(
					editingShift.id,
					{
						shiftName: editingShift.name,
						startTime: editingShift.startTime,
						endTime: editingShift.endTime,
						roleConfigId: roleConfigIdToUse,
						isActive: true,
					},
				);

				if (updateResult.success) {
					// Update local state
					setShifts(
						shifts.map((shift) =>
							shift.id === editingShift.id ? editingShift : shift,
						),
					);

					toast({
						title: "Thành công",
						description: `Đã cập nhật ca "${editingShift.name}"`,
						status: "success",
						duration: 2000,
						isClosable: true,
					});
				} else {
					toast({
						title: "Lỗi",
						description:
							updateResult.error ||
							"Không thể cập nhật ca làm việc",
						status: "error",
						duration: 3000,
					});
					return;
				}
			} catch (error) {
				console.error("Error updating shift:", error);
				toast({
					title: "Lỗi",
					description: "Đã xảy ra lỗi khi cập nhật ca làm việc",
					status: "error",
					duration: 3000,
				});
				return;
			}
		}

		setEditingShift(null);
		setIsAddingNew(false);
	};

	const handleDeleteShift = async (shiftId: string, shiftName: string) => {
		if (shifts.length <= 1) {
			toast({
				title: "Lỗi",
				description: "Phải có ít nhất 1 ca làm việc",
				status: "error",
				duration: 3000,
			});
			return;
		}

		// Check if this is a new shift (not yet saved to backend)
		const isNewShift = shiftId.startsWith("shift-");

		if (!isNewShift) {
			// Confirm deletion for existing shifts
			if (!confirm(`Bạn có chắc muốn xóa ca "${shiftName}"?`)) {
				return;
			}

			// Find the shift to get its data
			const shiftToDelete = shifts.find((s) => s.id === shiftId);
			if (!shiftToDelete) {
				toast({
					title: "Lỗi",
					description: "Không tìm thấy thông tin ca làm việc",
					status: "error",
					duration: 3000,
				});
				return;
			}

			// Find the matching role config for this shift
			const matchingConfig = roleConfigs.find(
				(config) =>
					config.requirements.some(
						(req) =>
							req.accountType === "WarehouseStaff" &&
							req.quantity ===
								shiftToDelete.requiredWarehouseStaff,
					) &&
					config.requirements.some(
						(req) =>
							req.accountType === "SalesStaff" &&
							req.quantity === shiftToDelete.requiredSalesStaff,
					),
			);

			if (!matchingConfig) {
				toast({
					title: "Lỗi",
					description: "Không tìm thấy cấu hình role phù hợp",
					status: "error",
					duration: 3000,
				});
				return;
			}

			try {
				const result = await scheduleService.deleteWorkShift(shiftId, {
					shiftName: shiftToDelete.name,
					startTime: shiftToDelete.startTime,
					endTime: shiftToDelete.endTime,
					roleConfigId: matchingConfig.id,
				});

				if (result.success) {
					toast({
						title: "Thành công",
						description: `Đã xóa ca "${shiftName}"`,
						status: "success",
						duration: 2000,
					});
				} else {
					toast({
						title: "Lỗi",
						description:
							result.error || "Không thể xóa ca làm việc",
						status: "error",
						duration: 3000,
					});
					return;
				}
			} catch (error) {
				console.error("Error deleting shift:", error);
				toast({
					title: "Lỗi",
					description: "Đã xảy ra lỗi khi xóa ca làm việc",
					status: "error",
					duration: 3000,
				});
				return;
			}
		}

		// Remove from local state
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
					<Tabs
						colorScheme="blue"
						variant="enclosed">
						<TabList>
							<Tab fontWeight="600">Quản lý ca làm việc</Tab>
							<Tab fontWeight="600">Quản lý cấu hình role</Tab>
						</TabList>

						<TabPanels>
							{/* Tab 1: Shift Management */}
							<TabPanel px={0}>
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
														Số ca tối đa mỗi nhân
														viên có thể làm trong 1
														tuần
													</FormLabel>
													<Text
														fontSize="13px"
														color="gray.600">
														Nhân viên sẽ không xuất
														hiện trong danh sách khi
														đã đạt giới hạn
													</Text>
												</Box>
												<NumberInput
													value={maxShiftsPerWeek}
													onChange={(_, value) =>
														setMaxShiftsPerWeek(
															value,
														)
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
												isDisabled={
													editingShift !== null
												}>
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
																value={
																	editingShift.name
																}
																onChange={(e) =>
																	setEditingShift(
																		{
																			...editingShift,
																			name: e
																				.target
																				.value,
																		},
																	)
																}
																placeholder="VD: Ca Sáng, Ca Chiều, Ca Tối"
																bg="white"
															/>
														</FormControl>

														<HStack spacing={4}>
															<FormControl
																flex={1}>
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
																	onChange={(
																		e,
																	) =>
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
																	bg="white"
																/>
															</FormControl>

															<FormControl
																flex={1}>
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
																	onChange={(
																		e,
																	) =>
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
																		📋 Số
																		giờ làm
																		việc:{" "}
																		{calculateWorkingHours(
																			editingShift.startTime,
																			editingShift.endTime,
																		)}{" "}
																		giờ
																	</Text>
																</Box>
															)}

														{/* Role Config Selection */}
														<FormControl isRequired>
															<FormLabel
																fontSize="14px"
																fontWeight="600">
																Cấu hình role
																<Text
																	as="span"
																	color="red.500"
																	ml={1}>
																	*
																</Text>
															</FormLabel>
															<Select
																value={
																	selectedRoleConfigId
																}
																onChange={(
																	e,
																) => {
																	const configId =
																		e.target
																			.value;
																	setSelectedRoleConfigId(
																		configId,
																	);

																	// Update shift requirements based on selected config
																	const selectedConfig =
																		roleConfigs.find(
																			(
																				c,
																			) =>
																				c.id ===
																				configId,
																		);
																	if (
																		selectedConfig &&
																		editingShift
																	) {
																		const warehouseReq =
																			selectedConfig.requirements.find(
																				(
																					req,
																				) =>
																					req.accountType ===
																					"WarehouseStaff",
																			)
																				?.quantity ||
																			0;
																		const salesReq =
																			selectedConfig.requirements.find(
																				(
																					req,
																				) =>
																					req.accountType ===
																					"SalesStaff",
																			)
																				?.quantity ||
																			0;

																		setEditingShift(
																			{
																				...editingShift,
																				requiredWarehouseStaff:
																					warehouseReq,
																				requiredSalesStaff:
																					salesReq,
																			},
																		);
																	}
																}}
																placeholder="Chọn cấu hình role"
																bg="white">
																{roleConfigs.map(
																	(
																		config,
																	) => (
																		<option
																			key={
																				config.id
																			}
																			value={
																				config.id
																			}>
																			{
																				config.configName
																			}{" "}
																			(
																			{config.requirements
																				.map(
																					(
																						req,
																					) =>
																						`${req.accountType === "WarehouseStaff" ? "Kho" : "Bán hàng"}: ${req.quantity}`,
																				)
																				.join(
																					", ",
																				)}
																			)
																		</option>
																	),
																)}
															</Select>
															<Text
																fontSize="12px"
																color="gray.600"
																mt={1}>
																💡 Chọn cấu hình
																role sẽ tự động
																điền số nhân
																viên yêu cầu
															</Text>
														</FormControl>

														<HStack
															justify="flex-end"
															spacing={2}>
															<Button
																size="sm"
																onClick={
																	handleCancel
																}>
																Hủy
															</Button>
															<Button
																size="sm"
																colorScheme="blue"
																onClick={
																	handleSaveShift
																}>
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
														editingShift?.id ===
														shift.id
															? "brand.500"
															: "gray.200"
													}
													borderRadius="md"
													bg={
														editingShift?.id ===
														shift.id
															? "blue.50"
															: "white"
													}>
													{editingShift?.id ===
													shift.id ? (
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
																	onChange={(
																		e,
																	) =>
																		setEditingShift(
																			{
																				...editingShift,
																				name: e
																					.target
																					.value,
																			},
																		)
																	}
																	placeholder="VD: Ca Sáng, Ca Chiều, Ca Tối"
																/>
															</FormControl>
															<HStack spacing={4}>
																<FormControl
																	flex={1}>
																	<FormLabel
																		fontSize="14px"
																		fontWeight="600">
																		Giờ bắt
																		đầu
																	</FormLabel>
																	<Input
																		type="time"
																		step="3600"
																		value={
																			editingShift.startTime
																		}
																		onChange={(
																			e,
																		) =>
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

																<FormControl
																	flex={1}>
																	<FormLabel
																		fontSize="14px"
																		fontWeight="600">
																		Giờ kết
																		thúc
																	</FormLabel>
																	<Input
																		type="time"
																		step="3600"
																		value={
																			editingShift.endTime
																		}
																		onChange={(
																			e,
																		) =>
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
																			📋
																			Số
																			giờ
																			làm
																			việc:{" "}
																			{calculateWorkingHours(
																				editingShift.startTime,
																				editingShift.endTime,
																			)}{" "}
																			giờ
																		</Text>
																	</Box>
																)}

															{/* Role Config Selection */}
															<FormControl
																isRequired>
																<FormLabel
																	fontSize="14px"
																	fontWeight="600">
																	Cấu hình
																	role
																	<Text
																		as="span"
																		color="red.500"
																		ml={1}>
																		*
																	</Text>
																</FormLabel>
																<Select
																	value={
																		selectedRoleConfigId
																	}
																	onChange={(
																		e,
																	) => {
																		const configId =
																			e
																				.target
																				.value;
																		setSelectedRoleConfigId(
																			configId,
																		);

																		// Update shift requirements based on selected config
																		const selectedConfig =
																			roleConfigs.find(
																				(
																					c,
																				) =>
																					c.id ===
																					configId,
																			);
																		if (
																			selectedConfig &&
																			editingShift
																		) {
																			const warehouseReq =
																				selectedConfig.requirements.find(
																					(
																						req,
																					) =>
																						req.accountType ===
																						"WarehouseStaff",
																				)
																					?.quantity ||
																				0;
																			const salesReq =
																				selectedConfig.requirements.find(
																					(
																						req,
																					) =>
																						req.accountType ===
																						"SalesStaff",
																				)
																					?.quantity ||
																				0;

																			setEditingShift(
																				{
																					...editingShift,
																					requiredWarehouseStaff:
																						warehouseReq,
																					requiredSalesStaff:
																						salesReq,
																				},
																			);
																		}
																	}}
																	placeholder="Chọn cấu hình role"
																	bg="white">
																	{roleConfigs.map(
																		(
																			config,
																		) => (
																			<option
																				key={
																					config.id
																				}
																				value={
																					config.id
																				}>
																				{
																					config.configName
																				}{" "}
																				(
																				{config.requirements
																					.map(
																						(
																							req,
																						) =>
																							`${req.accountType === "WarehouseStaff" ? "Kho" : "Bán hàng"}: ${req.quantity}`,
																					)
																					.join(
																						", ",
																					)}

																				)
																			</option>
																		),
																	)}
																</Select>
																<Text
																	fontSize="12px"
																	color="gray.600"
																	mt={1}>
																	💡 Chọn cấu
																	hình role sẽ
																	tự động điền
																	số nhân viên
																	yêu cầu
																</Text>
															</FormControl>
															<HStack
																justify="flex-end"
																spacing={2}>
																<Button
																	size="sm"
																	onClick={
																		handleCancel
																	}>
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
																		(
																		{
																			shift.startTime
																		}{" "}
																		-{" "}
																		{
																			shift.endTime
																		}
																		)
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
																			Bán
																			hàng:
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
																		index ===
																			0 ||
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
																	icon={
																		<EditIcon />
																	}
																	size="sm"
																	colorScheme="blue"
																	variant="ghost"
																	onClick={() => {
																		setEditingShift(
																			shift,
																		);
																		// Find and set the matching roleConfig
																		const matchingConfig =
																			roleConfigs.find(
																				(
																					config,
																				) =>
																					config.requirements.some(
																						(
																							req,
																						) =>
																							req.accountType ===
																								"WarehouseStaff" &&
																							req.quantity ===
																								shift.requiredWarehouseStaff,
																					) &&
																					config.requirements.some(
																						(
																							req,
																						) =>
																							req.accountType ===
																								"SalesStaff" &&
																							req.quantity ===
																								shift.requiredSalesStaff,
																					),
																			);
																		setSelectedRoleConfigId(
																			matchingConfig?.id ||
																				"",
																		);
																	}}
																	isDisabled={
																		editingShift !==
																		null
																	}
																/>
																<IconButton
																	aria-label="Delete shift"
																	icon={
																		<DeleteIcon />
																	}
																	size="sm"
																	colorScheme="red"
																	variant="ghost"
																	onClick={() =>
																		handleDeleteShift(
																			shift.id,
																			shift.name,
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
							</TabPanel>

							{/* Tab 2: Role Config Management */}
							<TabPanel px={0}>
								<VStack
									spacing={4}
									align="stretch">
									{/* Create New Role Config */}
									<Box
										p={4}
										bg="green.50"
										borderRadius="md"
										borderLeft="4px solid"
										borderLeftColor="green.500">
										<Text
											fontSize="15px"
											fontWeight="600"
											mb={3}
											color="green.700">
											➕ Tạo cấu hình role mới
										</Text>
										<VStack
											spacing={3}
											align="stretch">
											<FormControl>
												<FormLabel
													fontSize="14px"
													fontWeight="600">
													Tên cấu hình
												</FormLabel>
												<Input
													value={
														newRoleConfig.configName
													}
													onChange={(e) =>
														setNewRoleConfig({
															...newRoleConfig,
															configName:
																e.target.value,
														})
													}
													placeholder="VD: Cấu hình ca tiêu chuẩn"
													bg="white"
													size="sm"
												/>
											</FormControl>

											<HStack spacing={3}>
												<FormControl flex={1}>
													<FormLabel
														fontSize="14px"
														fontWeight="600">
														Số nhân viên kho
													</FormLabel>
													<NumberInput
														value={
															newRoleConfig.warehouseStaff
														}
														onChange={(_, value) =>
															setNewRoleConfig({
																...newRoleConfig,
																warehouseStaff:
																	value || 1,
															})
														}
														min={0}
														max={50}
														bg="white"
														size="sm">
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
														Số nhân viên bán hàng
													</FormLabel>
													<NumberInput
														value={
															newRoleConfig.salesStaff
														}
														onChange={(_, value) =>
															setNewRoleConfig({
																...newRoleConfig,
																salesStaff:
																	value || 2,
															})
														}
														min={0}
														max={50}
														bg="white"
														size="sm">
														<NumberInputField />
														<NumberInputStepper>
															<NumberIncrementStepper />
															<NumberDecrementStepper />
														</NumberInputStepper>
													</NumberInput>
												</FormControl>
											</HStack>

											<Button
												colorScheme="green"
												onClick={handleCreateRoleConfig}
												isLoading={isCreatingRoleConfig}
												loadingText="Đang tạo..."
												size="sm"
												alignSelf="flex-end">
												Tạo cấu hình
											</Button>
										</VStack>
									</Box>

									<Divider />

									{/* Role Configs List */}
									<Box>
										<Text
											fontSize="15px"
											fontWeight="600"
											color="purple.700"
											mb={3}>
											📋 Danh sách cấu hình role
										</Text>

										{roleConfigs.length === 0 ? (
											<Box
												p={4}
												bg="gray.50"
												borderRadius="md"
												textAlign="center">
												<Text
													fontSize="14px"
													color="gray.600">
													Chưa có cấu hình role nào
												</Text>
											</Box>
										) : (
											<VStack
												spacing={2}
												align="stretch">
												{roleConfigs.map((config) => (
													<Box
														key={config.id}
														p={3}
														border="2px solid"
														borderColor={
															editingRoleConfig?.id ===
															config.id
																? "blue.400"
																: "gray.200"
														}
														borderRadius="md"
														bg={
															editingRoleConfig?.id ===
															config.id
																? "blue.50"
																: "white"
														}
														_hover={{
															borderColor:
																editingRoleConfig?.id ===
																config.id
																	? "blue.400"
																	: "gray.300",
														}}>
														{editingRoleConfig?.id ===
														config.id ? (
															// Edit Mode
															<VStack
																spacing={2}
																align="stretch">
																<FormControl>
																	<FormLabel
																		fontSize="13px"
																		fontWeight="600">
																		Tên cấu
																		hình
																	</FormLabel>
																	<Input
																		value={
																			editingRoleConfig.configName
																		}
																		onChange={(
																			e,
																		) =>
																			setEditingRoleConfig(
																				{
																					...editingRoleConfig,
																					configName:
																						e
																							.target
																							.value,
																				},
																			)
																		}
																		bg="white"
																		size="sm"
																	/>
																</FormControl>

																<HStack
																	spacing={3}>
																	<FormControl
																		flex={
																			1
																		}>
																		<FormLabel
																			fontSize="13px"
																			fontWeight="600">
																			Nhân
																			viên
																			kho
																		</FormLabel>
																		<NumberInput
																			value={
																				editingRoleConfig.requirements.find(
																					(
																						req,
																					) =>
																						req.accountType ===
																						"WarehouseStaff",
																				)
																					?.quantity ||
																				0
																			}
																			onChange={(
																				_,
																				value,
																			) => {
																				const updatedReqs =
																					editingRoleConfig.requirements.map(
																						(
																							req,
																						) =>
																							req.accountType ===
																							"WarehouseStaff"
																								? {
																										...req,
																										quantity:
																											value ||
																											0,
																									}
																								: req,
																					);
																				setEditingRoleConfig(
																					{
																						...editingRoleConfig,
																						requirements:
																							updatedReqs,
																					},
																				);
																			}}
																			min={
																				0
																			}
																			max={
																				50
																			}
																			bg="white"
																			size="sm">
																			<NumberInputField />
																			<NumberInputStepper>
																				<NumberIncrementStepper />
																				<NumberDecrementStepper />
																			</NumberInputStepper>
																		</NumberInput>
																	</FormControl>

																	<FormControl
																		flex={
																			1
																		}>
																		<FormLabel
																			fontSize="13px"
																			fontWeight="600">
																			Nhân
																			viên
																			bán
																			hàng
																		</FormLabel>
																		<NumberInput
																			value={
																				editingRoleConfig.requirements.find(
																					(
																						req,
																					) =>
																						req.accountType ===
																						"SalesStaff",
																				)
																					?.quantity ||
																				0
																			}
																			onChange={(
																				_,
																				value,
																			) => {
																				const updatedReqs =
																					editingRoleConfig.requirements.map(
																						(
																							req,
																						) =>
																							req.accountType ===
																							"SalesStaff"
																								? {
																										...req,
																										quantity:
																											value ||
																											0,
																									}
																								: req,
																					);
																				setEditingRoleConfig(
																					{
																						...editingRoleConfig,
																						requirements:
																							updatedReqs,
																					},
																				);
																			}}
																			min={
																				0
																			}
																			max={
																				50
																			}
																			bg="white"
																			size="sm">
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
																		size="xs"
																		onClick={() =>
																			setEditingRoleConfig(
																				null,
																			)
																		}>
																		Hủy
																	</Button>
																	<Button
																		size="xs"
																		colorScheme="blue"
																		onClick={
																			handleUpdateRoleConfig
																		}
																		isLoading={
																			isUpdatingRoleConfig
																		}>
																		Lưu
																	</Button>
																</HStack>
															</VStack>
														) : (
															// View Mode
															<HStack
																justify="space-between"
																align="start">
																<VStack
																	align="start"
																	spacing={1}
																	flex={1}>
																	<HStack
																		justify="space-between"
																		w="full">
																		<Text
																			fontSize="14px"
																			fontWeight="600"
																			color="purple.700">
																			{
																				config.configName
																			}
																		</Text>
																		{config.isActive ? (
																			<Badge
																				colorScheme="green"
																				fontSize="10px">
																				Active
																			</Badge>
																		) : (
																			<Badge
																				colorScheme="gray"
																				fontSize="10px">
																				Inactive
																			</Badge>
																		)}
																	</HStack>

																	<HStack
																		spacing={
																			3
																		}
																		fontSize="13px"
																		color="gray.700">
																		{config.requirements.map(
																			(
																				req,
																				index,
																			) => (
																				<Text
																					key={
																						index
																					}>
																					<strong>
																						{req.accountType ===
																						"WarehouseStaff"
																							? "Kho"
																							: "Bán hàng"}

																						:
																					</strong>{" "}
																					{
																						req.quantity
																					}
																				</Text>
																			),
																		)}
																	</HStack>
																</VStack>

																<HStack
																	spacing={1}>
																	<IconButton
																		aria-label="Edit config"
																		icon={
																			<EditIcon />
																		}
																		size="xs"
																		colorScheme="blue"
																		variant="ghost"
																		onClick={() =>
																			setEditingRoleConfig(
																				config,
																			)
																		}
																		isDisabled={
																			editingRoleConfig !==
																			null
																		}
																	/>
																	<IconButton
																		aria-label="Delete config"
																		icon={
																			<DeleteIcon />
																		}
																		size="xs"
																		colorScheme="red"
																		variant="ghost"
																		onClick={() =>
																			handleDeleteRoleConfig(
																				config.id,
																				config.configName,
																			)
																		}
																		isDisabled={
																			editingRoleConfig !==
																			null
																		}
																	/>
																</HStack>
															</HStack>
														)}
													</Box>
												))}
											</VStack>
										)}
									</Box>
								</VStack>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default ShiftConfigModal;
