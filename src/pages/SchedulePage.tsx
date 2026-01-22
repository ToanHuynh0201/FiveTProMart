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
	useToast,
} from "@chakra-ui/react";
import { EditIcon, SettingsIcon } from "@chakra-ui/icons";
import type {
	DaySchedule,
	ShiftAssignment,
	WeekRange,
	ShiftConfig,
	WorkScheduleResponse,
	WorkShift,
	ShiftRoleConfig,
} from "@/types";
import { scheduleService } from "@/services/scheduleService";

const SchedulePage = () => {
	const toast = useToast();
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
	const [, setWorkShifts] = useState<WorkShift[]>([]);
	const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
	const [editModalData, setEditModalData] = useState<{
		isOpen: boolean;
		date: string;
		shift: string;
		assignments: ShiftAssignment[];
		workScheduleId?: string;
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

	// Helper: Generate weeks for a month
	const generateWeeksForMonth = (
		month: number,
		year: number,
	): WeekRange[] => {
		const weeks: WeekRange[] = [];
		const firstDay = new Date(year, month - 1, 1);
		const lastDay = new Date(year, month, 0);

		// Find the Monday of the week containing the first day
		let currentWeekStart = new Date(firstDay);
		const dayOfWeek = currentWeekStart.getDay();
		const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		currentWeekStart.setDate(currentWeekStart.getDate() + daysToMonday);

		while (currentWeekStart <= lastDay) {
			const weekEnd = new Date(currentWeekStart);
			weekEnd.setDate(weekEnd.getDate() + 6);

			const startLabel = `${currentWeekStart.getDate().toString().padStart(2, "0")}/${(currentWeekStart.getMonth() + 1).toString().padStart(2, "0")}`;
			const endLabel = `${weekEnd.getDate().toString().padStart(2, "0")}/${(weekEnd.getMonth() + 1).toString().padStart(2, "0")}`;

			weeks.push({
				start: currentWeekStart.toISOString().split("T")[0],
				end: weekEnd.toISOString().split("T")[0],
				label: `${startLabel} - ${endLabel}`,
			});

			currentWeekStart = new Date(weekEnd);
			currentWeekStart.setDate(currentWeekStart.getDate() + 1);
		}

		return weeks;
	};

	// Helper: Format date to dd-MM-yyyy
	const formatDateForAPI = (dateStr: string): string => {
		const date = new Date(dateStr);
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	};

	// Helper: Parse dd-MM-yyyy to yyyy-MM-dd
	const parseDateFromAPI = (dateStr: string): string => {
		// Check if already in ISO format (yyyy-MM-dd)
		if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
			return dateStr;
		}

		// Parse dd-MM-yyyy format
		const parts = dateStr.split("-");
		if (parts.length === 3) {
			const [day, month, year] = parts;
			return `${year}-${month}-${day}`;
		}

		// Fallback: return as is
		return dateStr;
	};

	// Helper: Convert WorkScheduleResponse[] to DaySchedule[]
	const convertToWeekData = (
		schedules: WorkScheduleResponse[],
		weekRange: WeekRange,
	): DaySchedule[] => {
		const daySchedules: DaySchedule[] = [];
		const startDate = new Date(weekRange.start);

		// Generate 7 days
		for (let i = 0; i < 7; i++) {
			const currentDate = new Date(startDate);
			currentDate.setDate(startDate.getDate() + i);
			const dateStr = currentDate.toISOString().split("T")[0];

			const daySchedule: DaySchedule = {
				date: dateStr,
				dayOfWeek: "",
				shifts: {},
			};

			// Group schedules by shift for this date
			const daySchedules_api = schedules.filter((schedule) => {
				const scheduleDate = parseDateFromAPI(schedule.workDate);
				return scheduleDate === dateStr;
			});

			daySchedules_api.forEach((schedule) => {
				const shiftAssignments: ShiftAssignment[] =
					schedule.assignments.map((assignment) => ({
						id: assignment.profileId,
						staffId: assignment.profileId,
						staffName: assignment.fullName,
						staffPosition: mapAccountTypeToPosition(
							assignment.accountType,
						),
						date: dateStr,
						shift: schedule.workShiftId,
						shiftName: schedule.shiftName,
						employmentType: "Fulltime",
						status: assignment.status as
							| "scheduled"
							| "completed"
							| "absent"
							| "late",
						notes: "",
					}));

				daySchedule.shifts[schedule.workShiftId] = shiftAssignments;
			});

			daySchedules.push(daySchedule);
		}

		return daySchedules;
	};

	// Helper: Map accountType to Vietnamese position
	const mapAccountTypeToPosition = (accountType: string): string => {
		if (accountType === "WarehouseStaff") {
			return "Nhân viên kho";
		} else if (accountType === "SalesStaff") {
			return "Nhân viên bán hàng";
		}
		return accountType;
	};

	// Helper: Convert WorkShift[] to ShiftTemplate[] (with role configs)
	const convertWorkShiftsToTemplates = async (
		shifts: WorkShift[],
	): Promise<ShiftConfig> => {
		// Fetch all role configs first
		const roleConfigsResult = await scheduleService.getRoleConfigs(true);
		console.log(roleConfigsResult);

		const roleConfigsMap = new Map();

		if (roleConfigsResult.success && roleConfigsResult.data) {
			roleConfigsResult.data.forEach((config: ShiftRoleConfig) => {
				roleConfigsMap.set(config.id, config);
			});
		}

		const templates = shifts.map((shift, index) => {
			// Calculate working hours
			const [startHour, startMinute] = shift.startTime
				.split(":")
				.map(Number);
			const [endHour, endMinute] = shift.endTime.split(":").map(Number);
			const startInMinutes = startHour * 60 + startMinute;
			const endInMinutes = endHour * 60 + endMinute;
			const durationInMinutes = endInMinutes - startInMinutes;
			const workingHours = parseFloat(
				(durationInMinutes / 60).toFixed(2),
			);

			// Get requirements from role config
			const roleConfig = roleConfigsMap.get(shift.roleConfig.id);
			const warehouseReq =
				roleConfig?.requirements?.find(
					(req: any) => req.accountType === "WarehouseStaff",
				)?.quantity || 0;
			const salesReq =
				roleConfig?.requirements?.find(
					(req: any) => req.accountType === "SalesStaff",
				)?.quantity || 0;

			return {
				id: shift.id,
				name: shift.shiftName,
				startTime: shift.startTime,
				endTime: shift.endTime,
				requiredWarehouseStaff: warehouseReq,
				requiredSalesStaff: salesReq,
				workingHours,
				order: index,
			};
		});

		return {
			shifts: templates,
			maxShiftsPerWeek: 6, // Default value
			updatedAt: new Date().toISOString(),
		};
	};

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
		setIsLoading(true);
		try {
			const result = await scheduleService.getWorkShifts(true);
			if (result.success && result.data) {
				setWorkShifts(result.data);
				const config = await convertWorkShiftsToTemplates(result.data);
				setShiftConfig(config);
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải cấu hình ca làm việc",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error loading shift config:", error);
			toast({
				title: "Lỗi",
				description: "Đã xảy ra lỗi khi tải cấu hình ca làm việc",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const loadMonthData = () => {
		const generatedWeeks = generateWeeksForMonth(
			selectedMonth,
			selectedYear,
		);
		setWeeks(generatedWeeks);
		setSelectedWeekIndex(0);
	};

	const loadWeekSchedule = async () => {
		if (!shiftConfig || weeks.length === 0) return;

		setIsLoading(true);
		try {
			const currentWeek = weeks[selectedWeekIndex];
			const startDate = formatDateForAPI(currentWeek.start);
			const endDate = formatDateForAPI(currentWeek.end);

			const result = await scheduleService.getWorkSchedules({
				startDate,
				endDate,
			});

			if (result.success && result.data) {
				const weekData = convertToWeekData(result.data, currentWeek);
				setWeekData(weekData);
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể tải lịch làm việc",
					status: "error",
					duration: 3000,
				});
				setWeekData([]);
			}
		} catch (error) {
			console.error("Error loading week schedule:", error);
			toast({
				title: "Lỗi",
				description: "Đã xảy ra lỗi khi tải lịch làm việc",
				status: "error",
				duration: 3000,
			});
			setWeekData([]);
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
		// Reload the week schedule after assignment/removal
		await loadWeekSchedule();

		// Update modal data with fresh data
		if (editModalData.isOpen && editModalData.date && editModalData.shift) {
			const day = weekData.find((d) => d.date === editModalData.date);
			if (day) {
				const assignments = day.shifts[editModalData.shift] || [];
				setEditModalData({
					...editModalData,
					assignments,
				});
			}
		}
	};

	const handleSaveShiftConfig = async (config: ShiftConfig) => {
		// Note: The API doesn't have an update endpoint for shift config
		// ShiftConfigModal handles creating new shifts via createWorkShift
		// For now, just update local state
		setShiftConfig(config);
		await loadWeekSchedule();

		toast({
			title: "Thành công",
			description: "Đã cập nhật cấu hình ca làm việc",
			status: "success",
			duration: 3000,
		});
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
