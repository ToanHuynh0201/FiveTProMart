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
	const [maxShiftsPerWeek, setMaxShiftsPerWeek] = useState<number>(6);
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
			loadShiftName();
		}
	}, [isOpen, date, shift, assignments]);

	const loadShiftName = async () => {
		try {
			const config = await scheduleService.getShiftConfig();
			const shiftTemplate = config.shifts.find((s) => s.id === shift);
			setShiftName(shiftTemplate?.name || "");
			setRequiredWarehouseStaff(
				shiftTemplate?.requiredWarehouseStaff || 0,
			);
			setRequiredSalesStaff(shiftTemplate?.requiredSalesStaff || 0);
			setMaxShiftsPerWeek(config.maxShiftsPerWeek || 6);
		} catch (error) {
			console.error("Error loading shift name:", error);
		}
	};

	const loadAvailableStaff = async () => {
		try {
			const staff = await scheduleService.getAvailableStaff(date, shift);
			setAvailableStaff(staff);

			// Load shift counts for available staff
			await loadStaffShiftCounts(staff.map((s) => s.id));
		} catch (error) {
			console.error("Error loading available staff:", error);
		}
	};

	const loadStaffShiftCounts = async (staffIds: string[]) => {
		try {
			// Calculate week range
			const currentDate = new Date(date);
			const dayOfWeek = currentDate.getDay();
			const monday = new Date(currentDate);
			monday.setDate(
				currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
			);
			const sunday = new Date(monday);
			sunday.setDate(monday.getDate() + 6);

			const weekStart = `${monday.getFullYear()}-${String(
				monday.getMonth() + 1,
			).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
			const weekEnd = `${sunday.getFullYear()}-${String(
				sunday.getMonth() + 1,
			).padStart(2, "0")}-${String(sunday.getDate()).padStart(2, "0")}`;

			const counts: { [staffId: string]: number } = {};
			for (const staffId of staffIds) {
				const count = await scheduleService.getStaffShiftCount(
					staffId,
					weekStart,
					weekEnd,
				);
				counts[staffId] = count;
			}
			setStaffShiftCounts(counts);
		} catch (error) {
			console.error("Error loading staff shift counts:", error);
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
				date,
				shift,
			});

			toast({
				title: "Đã thêm nhân viên kho vào ca làm",
				status: "success",
				duration: 2000,
			});

			setSelectedWarehouseStaffId("");
			loadAvailableStaff();
			onUpdate();
		} catch (error) {
			toast({
				title: "Lỗi khi thêm nhân viên",
				status: "error",
				duration: 2000,
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
				date,
				shift,
			});

			toast({
				title: "Đã thêm nhân viên bán hàng vào ca làm",
				status: "success",
				duration: 2000,
			});

			setSelectedSalesStaffId("");
			loadAvailableStaff();
			onUpdate();
		} catch (error) {
			toast({
				title: "Lỗi khi thêm nhân viên",
				status: "error",
				duration: 2000,
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
				title: "Đã xóa nhân viên khỏi ca làm",
				status: "success",
				duration: 2000,
			});

			loadAvailableStaff();
			onUpdate();
		} catch (error) {
			toast({
				title: "Lỗi khi xóa nhân viên",
				status: "error",
				duration: 2000,
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
