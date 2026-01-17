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
			const configs = await scheduleService.getShiftConfig();
			// Convert array to ShiftConfig object format
			const config: ShiftConfig = {
				shifts: configs.map((c) => ({
					id: c.id,
					name: c.name,
					startTime: c.startTime,
					endTime: c.endTime,
				})),
				requiredStaff: {
					warehouse: 2,
					sales: 3,
				},
				maxShiftsPerWeek: 6,
			};
			setShiftConfig(config);
		} catch {
			// Default config if API fails
			setShiftConfig({
				shifts: [
					{ id: "morning", name: "Ca Sáng", startTime: "08:00", endTime: "12:00" },
					{ id: "afternoon", name: "Ca Chiều", startTime: "13:00", endTime: "17:00" },
					{ id: "evening", name: "Ca Tối", startTime: "17:00", endTime: "21:00" },
				],
				requiredStaff: { warehouse: 2, sales: 3 },
				maxShiftsPerWeek: 6,
			});
		}
	};

	const loadMonthData = async () => {
		try {
			const monthData = await scheduleService.getMonthData(selectedMonth, selectedYear);
			// Generate weeks for the month
			const weeksInMonth = generateWeeksForMonth(selectedMonth, selectedYear);
			setWeeks(weeksInMonth);
			setSelectedWeekIndex(0);
		} catch {
			// Generate weeks locally if API fails
			const weeksInMonth = generateWeeksForMonth(selectedMonth, selectedYear);
			setWeeks(weeksInMonth);
			setSelectedWeekIndex(0);
		}
	};

	// Helper function to generate weeks for a month
	const generateWeeksForMonth = (month: number, year: number): WeekRange[] => {
		const weeks: WeekRange[] = [];
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 0);
		
		let currentStart = new Date(firstDay);
		// Adjust to start of week (Monday)
		const dayOfWeek = currentStart.getDay();
		const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		currentStart.setDate(currentStart.getDate() + diff);

		while (currentStart <= lastDay) {
			const weekEnd = new Date(currentStart);
			weekEnd.setDate(weekEnd.getDate() + 6);
			
			weeks.push({
				start: currentStart.toISOString().split('T')[0],
				end: weekEnd.toISOString().split('T')[0],
				label: `${currentStart.getDate()}/${currentStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
			});
			
			currentStart = new Date(weekEnd);
			currentStart.setDate(currentStart.getDate() + 1);
		}
		
		return weeks;
	};

	const loadWeekSchedule = async () => {
		if (!shiftConfig || weeks.length === 0) return;

		setIsLoading(true);
		try {
			const weekStart = weeks[selectedWeekIndex]?.start;
			if (!weekStart) {
				setWeekData([]);
				return;
			}

			const weekSchedule = await scheduleService.getWeekSchedule(weekStart);
			
			// Transform API response to DaySchedule format
			if (weekSchedule.days && weekSchedule.days.length > 0) {
				const transformedData: DaySchedule[] = weekSchedule.days.map(day => ({
					date: day.date,
					dayOfWeek: day.dayOfWeek,
					shifts: Object.fromEntries(
						day.shifts.map(s => [s.shiftId, [...s.warehouseStaff, ...s.salesStaff]])
					),
				}));
				setWeekData(transformedData);
			} else {
				// Generate empty week data
				const emptyWeekData = generateEmptyWeekData(weekStart);
				setWeekData(emptyWeekData);
			}
		} catch {
			// Generate empty week data on error
			const weekStart = weeks[selectedWeekIndex]?.start;
			if (weekStart) {
				setWeekData(generateEmptyWeekData(weekStart));
			} else {
				setWeekData([]);
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Helper to generate empty week data
	const generateEmptyWeekData = (weekStart: string): DaySchedule[] => {
		const days: DaySchedule[] = [];
		const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
		const startDate = new Date(weekStart);
		
		for (let i = 0; i < 7; i++) {
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + i);
			days.push({
				date: currentDate.toISOString().split('T')[0],
				dayOfWeek: dayNames[i],
				shifts: {},
			});
		}
		
		return days;
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
		// Update modal data with fresh data
		if (editModalData.isOpen) {
			const day = weekData.find(d => d.date === editModalData.date);
			if (day) {
				setEditModalData({
					...editModalData,
					assignments: day.shifts[editModalData.shift] || [],
				});
			}
		}
	};

	const handleSaveShiftConfig = async (config: ShiftConfig) => {
		try {
			// Save shift config via API
			await scheduleService.updateShiftConfig(
				config.shifts.map(s => ({
					id: s.id,
					name: s.name,
					startTime: s.startTime,
					endTime: s.endTime,
					type: s.id as "morning" | "afternoon" | "evening" | "night",
					color: s.id === "morning" ? "blue" : s.id === "afternoon" ? "orange" : "purple",
				}))
			);
			setShiftConfig(config);
			// Reload week schedule after config change
			await loadWeekSchedule();
		} catch {
			// Save locally even if API fails
			setShiftConfig(config);
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
