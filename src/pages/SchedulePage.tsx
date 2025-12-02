import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	ScheduleGrid,
	EditScheduleModal,
	ViewShiftDetailModal,
	WeekSelector,
	MonthSelector,
	ShiftConfigModal,
} from "@/components/schedule";
import {
	Box,
	Text,
	HStack,
	Button,
	Flex,
	Spinner,
	IconButton,
} from "@chakra-ui/react";
import { EditIcon, SettingsIcon } from "@chakra-ui/icons";
import type {
	DaySchedule,
	ShiftAssignment,
	WeekRange,
	ShiftConfig,
} from "@/types";
import { scheduleService } from "@/services/scheduleService";

const SchedulePage = () => {
	const currentDate = new Date();
	const [selectedMonth, setSelectedMonth] = useState(
		currentDate.getMonth() + 1,
	);
	const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
	const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
	const [weeks, setWeeks] = useState<WeekRange[]>([]);
	const [weekData, setWeekData] = useState<DaySchedule[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditMode, setIsEditMode] = useState(false);
	const [shiftConfig, setShiftConfig] = useState<ShiftConfig | null>(null);
	const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
	const [editModalData, setEditModalData] = useState<{
		isOpen: boolean;
		date: string;
		shift: string;
		assignments: ShiftAssignment[];
	}>({
		isOpen: false,
		date: "",
		shift: "",
		assignments: [],
	});

	const [viewModalData, setViewModalData] = useState<{
		isOpen: boolean;
		date: string;
		shift: string;
		assignments: ShiftAssignment[];
	}>({
		isOpen: false,
		date: "",
		shift: "",
		assignments: [],
	});

	// Load weeks when month/year changes
	useEffect(() => {
		loadMonthData();
	}, [selectedMonth, selectedYear]);

	// Load schedule when week changes
	useEffect(() => {
		if (weeks.length > 0 && shiftConfig) {
			loadWeekSchedule();
		}
	}, [selectedWeekIndex, weeks, shiftConfig]);

	// Load shift config on mount
	useEffect(() => {
		loadShiftConfig();
	}, []);

	const loadShiftConfig = async () => {
		try {
			const config = await scheduleService.getShiftConfig();
			setShiftConfig(config);
		} catch (error) {
			console.error("Error loading shift config:", error);
		}
	};

	const loadMonthData = async () => {
		try {
			const monthData = await scheduleService.getMonthData(
				selectedMonth,
				selectedYear,
			);
			setWeeks(monthData.weeks);
			// Find the current week index
			const today = new Date();
			// Use local date to avoid timezone issues
			const year = today.getFullYear();
			const month = String(today.getMonth() + 1).padStart(2, "0");
			const day = String(today.getDate()).padStart(2, "0");
			const todayStr = `${year}-${month}-${day}`;

			console.log("Today:", todayStr);
			console.log("Weeks:", monthData.weeks);

			// Find which week contains today's date
			const currentWeekIndex = monthData.weeks.findIndex((week) => {
				console.log(
					`Checking week ${week.label}: ${week.start} <= ${todayStr} <= ${week.end}`,
					todayStr >= week.start && todayStr <= week.end,
				);
				return todayStr >= week.start && todayStr <= week.end;
			});

			console.log("Current week index:", currentWeekIndex);

			// If current week is found and we're viewing current month/year, select it
			// Otherwise, default to first week
			if (
				currentWeekIndex !== -1 &&
				selectedMonth === today.getMonth() + 1 &&
				selectedYear === today.getFullYear()
			) {
				setSelectedWeekIndex(currentWeekIndex);
			} else {
				setSelectedWeekIndex(0);
			}
		} catch (error) {
			console.error("Error loading month data:", error);
		}
	};

	const loadWeekSchedule = async () => {
		if (!shiftConfig) return;

		setIsLoading(true);
		try {
			const week = weeks[selectedWeekIndex];
			const schedule = await scheduleService.getWeekSchedule(
				week.start,
				week.end,
			);

			// Convert to DaySchedule format
			const days: DaySchedule[] = [];
			const startDate = new Date(week.start);

			for (let i = 0; i < 7; i++) {
				const currentDate = new Date(startDate);
				currentDate.setDate(startDate.getDate() + i);
				const dateStr = currentDate.toISOString().split("T")[0];

				const dayAssignments = schedule.assignments.filter(
					(a) => a.date === dateStr,
				);

				const dayNames = [
					"Chủ nhật",
					"Thứ 2",
					"Thứ 3",
					"Thứ 4",
					"Thứ 5",
					"Thứ 6",
					"Thứ 7",
				];

				// Group assignments by shift ID
				const shifts: { [shiftId: string]: ShiftAssignment[] } = {};
				shiftConfig.shifts.forEach((shift) => {
					shifts[shift.id] = dayAssignments.filter(
						(a) => a.shift === shift.id,
					);
				});

				days.push({
					date: dateStr,
					dayOfWeek: dayNames[currentDate.getDay()],
					shifts,
				});
			}

			setWeekData(days);
		} catch (error) {
			console.error("Error loading week schedule:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCellClick = (date: string, shiftId: string) => {
		const day = weekData.find((d) => d.date === date);
		if (!day) return;

		const assignments = day.shifts[shiftId] || [];

		if (isEditMode) {
			setEditModalData({
				isOpen: true,
				date,
				shift: shiftId,
				assignments,
			});
		} else {
			setViewModalData({
				isOpen: true,
				date,
				shift: shiftId,
				assignments,
			});
		}
	};

	const handleCloseEditModal = () => {
		setEditModalData({
			...editModalData,
			isOpen: false,
		});
	};

	const handleCloseViewModal = () => {
		setViewModalData({
			...viewModalData,
			isOpen: false,
		});
	};

	const handleScheduleUpdate = async () => {
		// Reload schedule after update
		await loadWeekSchedule();

		// Update modal data if edit modal is open
		if (editModalData.isOpen && shiftConfig) {
			try {
				const week = weeks[selectedWeekIndex];
				const schedule = await scheduleService.getWeekSchedule(
					week.start,
					week.end,
				);

				const dayAssignments = schedule.assignments.filter(
					(a) =>
						a.date === editModalData.date &&
						a.shift === editModalData.shift,
				);

				setEditModalData({
					...editModalData,
					assignments: dayAssignments,
				});
			} catch (error) {
				console.error("Error updating modal data:", error);
			}
		}
	};

	const handleSaveShiftConfig = async (config: ShiftConfig) => {
		try {
			await scheduleService.updateShiftConfig(config);
			setShiftConfig(config);
			// Reload schedule to reflect new shift configuration
			loadWeekSchedule();
		} catch (error) {
			console.error("Error saving shift config:", error);
		}
	};

	if (!shiftConfig) {
		return (
			<MainLayout>
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
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={6}>
				{/* Header */}
				<Flex
					justify="space-between"
					align="center"
					mb={6}
					flexWrap="wrap"
					gap={4}>
					<HStack spacing={4}>
						<MonthSelector
							selectedMonth={selectedMonth}
							selectedYear={selectedYear}
							onMonthChange={setSelectedMonth}
							onYearChange={setSelectedYear}
						/>
						{weeks.length > 0 && (
							<WeekSelector
								weeks={weeks}
								selectedWeekIndex={selectedWeekIndex}
								onChange={setSelectedWeekIndex}
							/>
						)}
					</HStack>

					<HStack spacing={2}>
						<IconButton
							aria-label="Cấu hình ca làm việc"
							icon={<SettingsIcon />}
							colorScheme="purple"
							onClick={() => setIsConfigModalOpen(true)}
							size="md"
						/>
						<Button
							leftIcon={<EditIcon />}
							colorScheme={isEditMode ? "green" : "blue"}
							onClick={() => setIsEditMode(!isEditMode)}
							size="md"
							px={6}>
							{isEditMode ? "Hoàn tất" : "Chỉnh sửa"}
						</Button>
					</HStack>
				</Flex>

				{/* Info message */}
				<Box
					mb={4}
					p={3}
					bg={isEditMode ? "blue.50" : "gray.50"}
					borderRadius="8px"
					borderLeft="4px solid"
					borderLeftColor={isEditMode ? "blue.500" : "gray.400"}>
					<Text
						fontSize="14px"
						color={isEditMode ? "blue.700" : "gray.700"}>
						{isEditMode
							? "💡 Nhấp vào ô ca làm để thêm hoặc xóa nhân viên"
							: "💡 Nhấp vào ô ca làm để xem thông tin chi tiết"}
					</Text>
				</Box>

				{/* Schedule Grid */}
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
				) : (
					<ScheduleGrid
						weekData={weekData}
						shifts={shiftConfig.shifts}
						onCellClick={handleCellClick}
					/>
				)}

				{/* Legend */}
				<Box
					mt={6}
					p={4}
					bg="gray.50"
					borderRadius="8px">
					<HStack
						spacing={6}
						align="center">
						<HStack spacing={2}>
							<Box
								w="3px"
								h="16px"
								bg="blue.500"
								borderRadius="1px"
							/>
							<Text
								fontSize="14px"
								fontWeight="600"
								color="blue.600">
								Nhân viên kho
							</Text>
						</HStack>
						<HStack spacing={2}>
							<Box
								w="3px"
								h="16px"
								bg="green.500"
								borderRadius="1px"
							/>
							<Text
								fontSize="14px"
								fontWeight="600"
								color="green.600">
								Nhân viên bán hàng
							</Text>
						</HStack>
					</HStack>
				</Box>
			</Box>

			{/* Edit Modal */}
			<EditScheduleModal
				isOpen={editModalData.isOpen}
				onClose={handleCloseEditModal}
				date={editModalData.date}
				shift={editModalData.shift}
				assignments={editModalData.assignments}
				onUpdate={handleScheduleUpdate}
			/>

			{/* View Modal */}
			<ViewShiftDetailModal
				isOpen={viewModalData.isOpen}
				onClose={handleCloseViewModal}
				date={viewModalData.date}
				shift={viewModalData.shift}
				assignments={viewModalData.assignments}
			/>

			{/* Shift Config Modal */}
			<ShiftConfigModal
				isOpen={isConfigModalOpen}
				onClose={() => setIsConfigModalOpen(false)}
				currentConfig={shiftConfig}
				onSave={handleSaveShiftConfig}
			/>
		</MainLayout>
	);
};

export default SchedulePage;
