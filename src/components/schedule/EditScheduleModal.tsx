import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Button,
	VStack,
	HStack,
	Text,
	Select,
	IconButton,
	Box,
	useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import type { ShiftAssignment, Staff } from "@/types";
import { scheduleService } from "@/services/scheduleService";
import { staffService } from "@/services/staffService";

interface EditScheduleModalProps {
	isOpen: boolean;
	onClose: () => void;
	date: string;
	shift: string; // Changed from "morning" | "afternoon" to string (shift ID)
	assignments: ShiftAssignment[];
	onUpdate: () => void;
}

const EditScheduleModal = ({
	isOpen,
	onClose,
	date,
	shift,
	assignments,
	onUpdate,
}: EditScheduleModalProps) => {
	const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
	const [selectedWarehouseStaffId, setSelectedWarehouseStaffId] =
		useState<string>("");
	const [selectedSalesStaffId, setSelectedSalesStaffId] =
		useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [shiftName, setShiftName] = useState<string>("");
	const [requiredWarehouseStaff, setRequiredWarehouseStaff] =
		useState<number>(0);
	const [requiredSalesStaff, setRequiredSalesStaff] = useState<number>(0);
	const [maxShiftsPerWeek] = useState<number>(6);
	const [staffShiftCounts, setStaffShiftCounts] = useState<{
		[staffId: string]: number;
	}>({});
	const toast = useToast();

	// Format date for display
	const formatDateDisplay = (dateStr: string) => {
		const date = new Date(dateStr);
		const days = [
			"Chủ nhật",
			"Thứ 2",
			"Thứ 3",
			"Thứ 4",
			"Thứ 5",
			"Thứ 6",
			"Thứ 7",
		];
		const dayOfWeek = days[date.getDay()];
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		return `${dayOfWeek}, ${day}/${month}`;
	};

	useEffect(() => {
		if (isOpen) {
			loadAvailableStaff();
			loadShiftDetails();
		}
	}, [isOpen, date, shift, assignments]);

	// Helper: Format date to dd-MM-yyyy
	const formatDateForAPI = (dateStr: string): string => {
		const date = new Date(dateStr);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	};

	// Helper: Get week start and end from date
	const getWeekRange = (dateStr: string) => {
		const date = new Date(dateStr);
		const dayOfWeek = date.getDay();
		const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

		const weekStart = new Date(date);
		weekStart.setDate(date.getDate() + daysToMonday);

		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekStart.getDate() + 6);

		return {
			start: formatDateForAPI(weekStart.toISOString().split("T")[0]),
			end: formatDateForAPI(weekEnd.toISOString().split("T")[0]),
		};
	};

	const loadShiftDetails = async () => {
		try {
			// Fetch shift details to get requirements and shift name
			const result = await scheduleService.getWorkShifts(true);

			if (result.success && result.data) {
				const shiftData = result.data.find((s: any) => s.id === shift);
				if (shiftData) {
					setShiftName(shiftData.shiftName);

					// Fetch role config to get requirements
					const roleConfigResult = await scheduleService.getRoleConfigs(
						true,
					);
					if (
						roleConfigResult.success &&
						roleConfigResult.data
					) {
						const roleConfig = roleConfigResult.data.find(
							(rc: any) => rc.id === shiftData.roleConfig.id,
						);
						if (roleConfig) {
							const warehouseReq = roleConfig.requirements.find(
								(req: any) => req.accountType === "WarehouseStaff",
							);
							const salesReq = roleConfig.requirements.find(
								(req: any) => req.accountType === "SalesStaff",
							);
							setRequiredWarehouseStaff(
								warehouseReq?.quantity || 0,
							);
							setRequiredSalesStaff(salesReq?.quantity || 0);
						}
					}
				}
			}
		} catch (error) {
			console.error("Error loading shift details:", error);
		}
	};

	const loadAvailableStaff = async () => {
		try {
			// Fetch all active staff
			const result = await staffService.getStaffs({
				page: 0,
				size: 1000, // Get all staff
			});

			if (result.success && result.data) {
				// Filter out already assigned staff
				const assignedStaffIds = new Set(
					assignments.map((a) => a.staffId),
				);
				const available = result.data.filter(
					(s: Staff) => !assignedStaffIds.has(s.profileId),
				);

				setAvailableStaff(available);

				// Load shift counts for available staff
				if (available.length > 0) {
					await loadStaffShiftCounts(
						available.map((s: Staff) => s.profileId),
					);
				}
			}
		} catch (error) {
			console.error("Error loading available staff:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải danh sách nhân viên",
				status: "error",
				duration: 3000,
			});
		}
	};

	const loadStaffShiftCounts = async (_staffIds: string[]) => {
		try {
			const weekRange = getWeekRange(date);

			// Fetch schedules for the week
			const result = await scheduleService.getWorkSchedules({
				startDate: weekRange.start,
				endDate: weekRange.end,
			});

			if (result.success && result.data) {
				// Count shifts per staff
				const counts: { [staffId: string]: number } = {};

				result.data.forEach((schedule: any) => {
					schedule.assignments.forEach((assignment: any) => {
						counts[assignment.profileId] =
							(counts[assignment.profileId] || 0) + 1;
					});
				});

				setStaffShiftCounts(counts);
			}
		} catch (error) {
			console.error("Error loading staff shift counts:", error);
		}
	};

	// Filter staff by accountType
	const warehouseStaff = availableStaff.filter(
		(staff) => staff.accountType === "WarehouseStaff",
	);
	const salesStaff = availableStaff.filter(
		(staff) => staff.accountType === "SalesStaff",
	);

	// Count current assignments by position
	const currentWarehouseCount = assignments.filter(
		(a) => a.staffPosition === "Nhân viên kho",
	).length;
	const currentSalesCount = assignments.filter(
		(a) => a.staffPosition === "Nhân viên bán hàng",
	).length;

	const handleAddWarehouseStaff = async () => {
		if (!selectedWarehouseStaffId) {
			toast({
				title: "Vui lòng chọn nhân viên kho",
				status: "warning",
				duration: 2000,
			});
			return;
		}

		// Check if already at capacity
		if (currentWarehouseCount >= requiredWarehouseStaff) {
			const confirmed = window.confirm(
				`Ca này chỉ cần ${requiredWarehouseStaff} nhân viên kho nhưng đã có ${currentWarehouseCount} người. Bạn có chắc muốn thêm?`,
			);
			if (!confirmed) return;
		}

		await assignStaff(selectedWarehouseStaffId);
	};

	const handleAddSalesStaff = async () => {
		if (!selectedSalesStaffId) {
			toast({
				title: "Vui lòng chọn nhân viên bán hàng",
				status: "warning",
				duration: 2000,
			});
			return;
		}

		// Check if already at capacity
		if (currentSalesCount >= requiredSalesStaff) {
			const confirmed = window.confirm(
				`Ca này chỉ cần ${requiredSalesStaff} nhân viên bán hàng nhưng đã có ${currentSalesCount} người. Bạn có chắc muốn thêm?`,
			);
			if (!confirmed) return;
		}

		await assignStaff(selectedSalesStaffId);
	};

	const assignStaff = async (staffId: string) => {
		setIsLoading(true);
		try {
			const result = await scheduleService.assignStaff({
				workDates: [formatDateForAPI(date)],
				workShiftId: shift,
				assignedStaffIds: [staffId],
			});

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã thêm nhân viên vào ca làm việc",
					status: "success",
					duration: 2000,
				});

				// Reset selections
				setSelectedWarehouseStaffId("");
				setSelectedSalesStaffId("");

				// Reload data
				await onUpdate();
				await loadAvailableStaff();
			} else {
				// Handle specific errors from API
				if (result.error) {
					toast({
						title: "Lỗi",
						description: result.error,
						status: "error",
						duration: 3000,
					});
				}
			}
		} catch (error) {
			console.error("Error assigning staff:", error);
			toast({
				title: "Lỗi",
				description: "Đã xảy ra lỗi khi thêm nhân viên",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveStaff = async (staffId: string) => {
		setIsLoading(true);
		try {
			const result = await scheduleService.removeStaff({
				workDates: [formatDateForAPI(date)],
				workShiftId: [shift],
				assignedStaffIds: [staffId],
			});

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã xóa nhân viên khỏi ca làm việc",
					status: "success",
					duration: 2000,
				});

				// Reload data
				await onUpdate();
				await loadAvailableStaff();
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể xóa nhân viên",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error removing staff:", error);
			toast({
				title: "Lỗi",
				description: "Đã xảy ra lỗi khi xóa nhân viên",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					<Text
						fontSize="24px"
						fontWeight="700"
						color="brand.600">
						Chỉnh sửa ca làm
					</Text>
					<Text
						fontSize="16px"
						fontWeight="400"
						color="gray.600"
						mt={1}>
						{formatDateDisplay(date)} - {shiftName}
					</Text>
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody pb={6}>
					<VStack
						spacing={4}
						align="stretch">
						{/* Current assignments */}
						<Box>
							{/* Warehouse Staff Section */}
							<Box mb={4}>
								<HStack
									mb={3}
									spacing={2}
									justify="space-between">
									<HStack spacing={2}>
										<Box
											w="4px"
											h="20px"
											bg="blue.500"
											borderRadius="2px"
										/>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="brand.600">
											Nhân viên kho
										</Text>
									</HStack>
									<HStack spacing={2}>
										<Text
											fontSize="14px"
											fontWeight="600"
											color={
												currentWarehouseCount <
												requiredWarehouseStaff
													? "red.500"
													: "green.600"
											}>
											{currentWarehouseCount}/
											{requiredWarehouseStaff}
										</Text>
										{currentWarehouseCount <
											requiredWarehouseStaff && (
											<Text
												fontSize="13px"
												color="red.500">
												(Thiếu{" "}
												{requiredWarehouseStaff -
													currentWarehouseCount}
												)
											</Text>
										)}
										{currentWarehouseCount >
											requiredWarehouseStaff && (
											<Text
												fontSize="13px"
												color="orange.500">
												(Thừa{" "}
												{currentWarehouseCount -
													requiredWarehouseStaff}
												)
											</Text>
										)}
									</HStack>
								</HStack>
								{assignments.filter(
									(a) => a.staffPosition === "Nhân viên kho",
								).length > 0 ? (
									<VStack
										spacing={2}
										align="stretch">
										{assignments
											.filter(
												(a) =>
													a.staffPosition ===
													"Nhân viên kho",
											)
											.map((assignment) => (
												<HStack
													key={assignment.id}
													justify="space-between"
													p={3}
													bg="blue.50"
													borderRadius="8px"
													borderLeft="3px solid"
													borderLeftColor="blue.500">
													<Text
														fontSize="14px"
														fontWeight="600"
														color="gray.800">
														{assignment.staffName}
													</Text>
													<IconButton
														aria-label="Xóa"
														icon={<DeleteIcon />}
														size="sm"
														colorScheme="red"
														variant="ghost"
														onClick={() =>
															handleRemoveStaff(
																assignment.staffId,
															)
														}
														isDisabled={isLoading}
													/>
												</HStack>
											))}
									</VStack>
								) : (
									<Text
										fontSize="14px"
										color="gray.500"
										pl={3}>
										Chưa có nhân viên
									</Text>
								)}
							</Box>

							{/* Sales Staff Section */}
							<Box>
								<HStack
									mb={3}
									spacing={2}
									justify="space-between">
									<HStack spacing={2}>
										<Box
											w="4px"
											h="20px"
											bg="green.500"
											borderRadius="2px"
										/>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="brand.600">
											Nhân viên bán hàng
										</Text>
									</HStack>
									<HStack spacing={2}>
										<Text
											fontSize="14px"
											fontWeight="600"
											color={
												currentSalesCount <
												requiredSalesStaff
													? "red.500"
													: "green.600"
											}>
											{currentSalesCount}/
											{requiredSalesStaff}
										</Text>
										{currentSalesCount <
											requiredSalesStaff && (
											<Text
												fontSize="13px"
												color="red.500">
												(Thiếu{" "}
												{requiredSalesStaff -
													currentSalesCount}
												)
											</Text>
										)}
										{currentSalesCount >
											requiredSalesStaff && (
											<Text
												fontSize="13px"
												color="orange.500">
												(Thừa{" "}
												{currentSalesCount -
													requiredSalesStaff}
												)
											</Text>
										)}
									</HStack>
								</HStack>
								{assignments.filter(
									(a) =>
										a.staffPosition ===
										"Nhân viên bán hàng",
								).length > 0 ? (
									<VStack
										spacing={2}
										align="stretch">
										{assignments
											.filter(
												(a) =>
													a.staffPosition ===
													"Nhân viên bán hàng",
											)
											.map((assignment) => (
												<HStack
													key={assignment.id}
													justify="space-between"
													p={3}
													bg="green.50"
													borderRadius="8px"
													borderLeft="3px solid"
													borderLeftColor="green.500">
													<Text
														fontSize="14px"
														fontWeight="600"
														color="gray.800">
														{assignment.staffName}
													</Text>
													<IconButton
														aria-label="Xóa"
														icon={<DeleteIcon />}
														size="sm"
														colorScheme="red"
														variant="ghost"
														onClick={() =>
															handleRemoveStaff(
																assignment.staffId,
															)
														}
														isDisabled={isLoading}
													/>
												</HStack>
											))}
									</VStack>
								) : (
									<Text
										fontSize="14px"
										color="gray.500"
										pl={3}>
										Chưa có nhân viên
									</Text>
								)}
							</Box>
						</Box>

						{/* Add new staff */}
						<Box>
							<VStack
								spacing={4}
								align="stretch">
								{/* Add Warehouse Staff */}
								<Box>
									<HStack
										mb={2}
										spacing={2}>
										<Box
											w="4px"
											h="18px"
											bg="blue.500"
											borderRadius="2px"
										/>
										<Text
											fontSize="15px"
											fontWeight="600"
											color="brand.600">
											Thêm nhân viên kho
										</Text>
									</HStack>
									<HStack>
										<Select
											placeholder="Chọn nhân viên kho"
											value={selectedWarehouseStaffId}
											onChange={(e) =>
												setSelectedWarehouseStaffId(
													e.target.value,
												)
											}
											isDisabled={
												isLoading ||
												warehouseStaff.length === 0 ||
												currentWarehouseCount >=
													requiredWarehouseStaff
											}>
											{warehouseStaff.map((staff) => {
												const shiftCount =
													staffShiftCounts[
														staff.profileId
													] || 0;
												return (
													<option
														key={staff.profileId}
														value={staff.profileId}>
														{staff.fullName} (
														{shiftCount}/
														{maxShiftsPerWeek} ca)
													</option>
												);
											})}
										</Select>
										<Button
											colorScheme="blue"
											onClick={handleAddWarehouseStaff}
											isLoading={isLoading}
											isDisabled={
												!selectedWarehouseStaffId ||
												currentWarehouseCount >=
													requiredWarehouseStaff
											}
											minW="80px">
											Thêm
										</Button>
									</HStack>
									{warehouseStaff.length === 0 && (
										<Text
											fontSize="13px"
											color="gray.500"
											mt={1}
											ml={1}>
											Không còn nhân viên kho khả dụng
										</Text>
									)}
									{currentWarehouseCount >=
										requiredWarehouseStaff &&
										warehouseStaff.length > 0 && (
											<Text
												fontSize="13px"
												color="green.600"
												mt={1}
												ml={1}
												fontWeight="600">
												✓ Đã đủ nhân viên kho
											</Text>
										)}
								</Box>

								{/* Add Sales Staff */}
								<Box>
									<HStack
										mb={2}
										spacing={2}>
										<Box
											w="4px"
											h="18px"
											bg="green.500"
											borderRadius="2px"
										/>
										<Text
											fontSize="15px"
											fontWeight="600"
											color="brand.600">
											Thêm nhân viên bán hàng
										</Text>
									</HStack>
									<HStack>
										<Select
											placeholder="Chọn nhân viên bán hàng"
											value={selectedSalesStaffId}
											onChange={(e) =>
												setSelectedSalesStaffId(
													e.target.value,
												)
											}
											isDisabled={
												isLoading ||
												salesStaff.length === 0 ||
												currentSalesCount >=
													requiredSalesStaff
											}>
											{salesStaff.map((staff) => {
												const shiftCount =
													staffShiftCounts[
														staff.profileId
													] || 0;
												return (
													<option
														key={staff.profileId}
														value={staff.profileId}>
														{staff.fullName} (
														{shiftCount}/
														{maxShiftsPerWeek} ca)
													</option>
												);
											})}
										</Select>
										<Button
											colorScheme="green"
											onClick={handleAddSalesStaff}
											isLoading={isLoading}
											isDisabled={
												!selectedSalesStaffId ||
												currentSalesCount >=
													requiredSalesStaff
											}
											minW="80px">
											Thêm
										</Button>
									</HStack>
									{salesStaff.length === 0 && (
										<Text
											fontSize="13px"
											color="gray.500"
											mt={1}
											ml={1}>
											Không còn nhân viên bán hàng khả
											dụng
										</Text>
									)}
									{currentSalesCount >= requiredSalesStaff &&
										salesStaff.length > 0 && (
											<Text
												fontSize="13px"
												color="green.600"
												mt={1}
												ml={1}
												fontWeight="600">
												✓ Đã đủ nhân viên bán hàng
											</Text>
										)}
								</Box>
							</VStack>
						</Box>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default EditScheduleModal;
