import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	ScheduleGrid,
	EditScheduleModal,
	ViewShiftDetailModal,
	WeekSelector,
	MonthSelector,
} from "@/components/schedule";
import { Box, Text, HStack, Button, Flex, Spinner } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import type { DaySchedule, ShiftAssignment, WeekRange } from "@/types";
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
	const [editModalData, setEditModalData] = useState<{
		isOpen: boolean;
		date: string;
		shift: "morning" | "afternoon";
		assignments: ShiftAssignment[];
	}>({
		isOpen: false,
		date: "",
		shift: "morning",
		assignments: [],
	});

	const [viewModalData, setViewModalData] = useState<{
		isOpen: boolean;
		date: string;
		shift: "morning" | "afternoon";
		assignments: ShiftAssignment[];
	}>({
		isOpen: false,
		date: "",
		shift: "morning",
		assignments: [],
	});

	// Load weeks when month/year changes
	useEffect(() => {
		loadMonthData();
	}, [selectedMonth, selectedYear]);

	// Load schedule when week changes
	useEffect(() => {
		if (weeks.length > 0) {
			loadWeekSchedule();
		}
	}, [selectedWeekIndex, weeks]);

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

				days.push({
					date: dateStr,
					dayOfWeek: dayNames[currentDate.getDay()],
					morning: dayAssignments.filter(
						(a) => a.shift === "morning",
					),
					afternoon: dayAssignments.filter(
						(a) => a.shift === "afternoon",
					),
				});
			}

			setWeekData(days);
		} catch (error) {
			console.error("Error loading week schedule:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCellClick = (date: string, shift: "morning" | "afternoon") => {
		const day = weekData.find((d) => d.date === date);
		if (!day) return;

		const assignments = shift === "morning" ? day.morning : day.afternoon;

		if (isEditMode) {
			setEditModalData({
				isOpen: true,
				date,
				shift,
				assignments,
			});
		} else {
			setViewModalData({
				isOpen: true,
				date,
				shift,
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

	const handleScheduleUpdate = () => {
		loadWeekSchedule(); // Reload schedule after update
	};

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

					<Button
						leftIcon={<EditIcon />}
						colorScheme={isEditMode ? "green" : "blue"}
						onClick={() => setIsEditMode(!isEditMode)}
						size="md"
						px={6}>
						{isEditMode ? "Hoàn tất" : "Chỉnh sửa"}
					</Button>
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
		</MainLayout>
	);
};

export default SchedulePage;
