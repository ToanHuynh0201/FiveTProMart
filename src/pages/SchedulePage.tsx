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
		// TODO: Replace with API call to scheduleService.getShiftConfig()
		setShiftConfig(null);
	};

	const loadMonthData = async () => {
		// TODO: Replace with API call to scheduleService.getMonthData()
		setWeeks([]);
		setSelectedWeekIndex(0);
	};

	const loadWeekSchedule = async () => {
		if (!shiftConfig) return;

		setIsLoading(true);
		// TODO: Replace with API call to scheduleService.getWeekSchedule()
		setWeekData([]);
		setIsLoading(false);
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
		// TODO: Replace with API call to scheduleService.getWeekSchedule() to reload schedule
		// TODO: Update modal data with API response
	};

	const handleSaveShiftConfig = async (config: ShiftConfig) => {
		// TODO: Replace with API call to scheduleService.updateShiftConfig()
		setShiftConfig(config);
		// TODO: Call loadWeekSchedule() after successful API response
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
