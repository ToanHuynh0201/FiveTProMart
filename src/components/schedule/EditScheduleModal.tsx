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
	Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import type { ShiftAssignment, Staff } from "@/types";
import { scheduleService, type ShiftConfig, type StaffShiftCount } from "@/services/scheduleService";
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
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [shiftName, setShiftName] = useState<string>("");
	const [shiftConfig, setShiftConfig] = useState<ShiftConfig | null>(null);
	// Default staffing requirements - can be configured per shift via API
	const [requiredWarehouseStaff, setRequiredWarehouseStaff] =
		useState<number>(2);
	const [requiredSalesStaff, setRequiredSalesStaff] = useState<number>(3);
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
			loadAllData();
		}
	}, [isOpen, date, shift, assignments]);

	const loadAllData = async () => {
		setIsLoadingData(true);
		try {
			await Promise.all([
				loadShiftConfig(),
				loadAvailableStaff(),
				loadStaffShiftCounts(),
			]);
		} finally {
			setIsLoadingData(false);
		}
	};

	const loadShiftConfig = async () => {
		const configs = await scheduleService.getShiftConfig();
		const config = configs.find(c => c.id === shift);
		if (config) {
			setShiftConfig(config);
			setShiftName(`${config.name} (${config.startTime} - ${config.endTime})`);
		} else {
			// Fallback to synchronous getter
			setShiftName(scheduleService.getShiftName(shift));
		}
	};

	const loadAvailableStaff = async () => {
		try {
			// Try to get available staff from schedule API
			const available = await scheduleService.getAvailableStaff(date, shift);
			if (available.length > 0) {
				// Filter out staff already assigned to this shift
				const assignedIds = new Set(assignments.map(a => a.staffId));
				setAvailableStaff(available.filter(s => !assignedIds.has(s.id)));
			} else {
				// Fallback: get all active staff from staffService
				const response = await staffService.getStaff({ status: "active" });
				const allStaff = response.data || [];
				const assignedIds = new Set(assignments.map(a => a.staffId));
				setAvailableStaff(allStaff.filter(s => !assignedIds.has(s.id)));
			}
		} catch {
			setAvailableStaff([]);
		}
	};

	const loadStaffShiftCounts = async () => {
		try {
			const counts = await scheduleService.getStaffShiftCounts();
			const countsMap: { [staffId: string]: number } = {};
			counts.forEach((c: StaffShiftCount) => {
				countsMap[c.staffId] = c.shiftsThisWeek;
			});
			setStaffShiftCounts(countsMap);
		} catch {
			setStaffShiftCounts({});
		}
	};

	// Filter staff by position
	const warehouseStaff = availableStaff.filter(
		(staff) => staff.position === "Nhân viên kho",
	);
	const salesStaff = availableStaff.filter(
		(staff) => staff.position === "Nhân viên bán hàng",
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

		setIsLoading(true);
		try {
			await scheduleService.createAssignment({
				staffId: selectedWarehouseStaffId,
				shiftId: shift,
				date,
				role: "warehouse",
			});
			toast({
				title: "Đã thêm nhân viên",
				status: "success",
				duration: 2000,
			});
			setSelectedWarehouseStaffId("");
			onUpdate();
		} catch {
			toast({
				title: "Không thể thêm nhân viên",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
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

		setIsLoading(true);
		try {
			await scheduleService.createAssignment({
				staffId: selectedSalesStaffId,
				shiftId: shift,
				date,
				role: "sales",
			});
			toast({
				title: "Đã thêm nhân viên",
				status: "success",
				duration: 2000,
			});
			setSelectedSalesStaffId("");
			onUpdate();
		} catch {
			toast({
				title: "Không thể thêm nhân viên",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveStaff = async (assignmentId: string) => {
		setIsLoading(true);
		try {
			await scheduleService.deleteAssignment(assignmentId);
			toast({
				title: "Đã xóa phân công",
				status: "success",
				duration: 2000,
			});
			onUpdate();
		} catch {
			toast({
				title: "Không thể xóa phân công",
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
																assignment.id,
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
																assignment.id,
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
														staff.id
													] || 0;
												return (
													<option
														key={staff.id}
														value={staff.id}>
														{staff.name} (
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
														staff.id
													] || 0;
												return (
													<option
														key={staff.id}
														value={staff.id}>
														{staff.name} (
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
