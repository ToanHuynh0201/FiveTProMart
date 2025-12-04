import type {
	ShiftAssignment,
	WeekSchedule,
	CreateShiftAssignment,
	UpdateShiftAssignment,
	WeekRange,
	MonthData,
	ShiftConfig,
} from "@/types";
import { staffService } from "./staffService";

// Helper function to calculate working hours from time range
const calculateWorkingHours = (startTime: string, endTime: string): number => {
	const [startHour, startMinute] = startTime.split(":").map(Number);
	const [endHour, endMinute] = endTime.split(":").map(Number);

	const startInMinutes = startHour * 60 + startMinute;
	const endInMinutes = endHour * 60 + endMinute;

	const durationInMinutes = endInMinutes - startInMinutes;
	const hours = durationInMinutes / 60;

	return parseFloat(hours.toFixed(2));
};

// Default shift configuration
const defaultShiftConfig: ShiftConfig = {
	shifts: [
		{
			id: "shift-morning",
			name: "Ca Sáng",
			startTime: "08:00",
			endTime: "12:00",
			requiredWarehouseStaff: 1,
			requiredSalesStaff: 2,
			workingHours: 4,
			order: 0,
		},
		{
			id: "shift-afternoon",
			name: "Ca Chiều",
			startTime: "13:00",
			endTime: "17:00",
			requiredWarehouseStaff: 1,
			requiredSalesStaff: 2,
			workingHours: 4,
			order: 1,
		},
	],
	maxShiftsPerWeek: 6, // Mặc định mỗi nhân viên làm tối đa 6 ca/tuần
	updatedAt: new Date().toISOString(),
};

// Store shift configuration in localStorage
let currentShiftConfig: ShiftConfig = defaultShiftConfig;

// Load shift config from localStorage on initialization
const loadShiftConfig = (): ShiftConfig => {
	try {
		const stored = localStorage.getItem("shiftConfig");
		if (stored) {
			const config = JSON.parse(stored) as ShiftConfig;

			// Migration: Add workingHours if missing
			let needsMigration = false;
			const migratedShifts = config.shifts.map((shift) => {
				if (
					shift.workingHours === undefined ||
					shift.workingHours === 0
				) {
					needsMigration = true;
					const hours = calculateWorkingHours(
						shift.startTime,
						shift.endTime,
					);
					return {
						...shift,
						workingHours: hours,
					};
				}
				return shift;
			});

			const migratedConfig: ShiftConfig = {
				...config,
				shifts: migratedShifts,
			};

			// Save migrated config back to localStorage
			if (needsMigration) {
				localStorage.setItem(
					"shiftConfig",
					JSON.stringify(migratedConfig),
				);
			}

			return migratedConfig;
		}
	} catch (error) {
		console.error("Failed to load shift config:", error);
	}
	return defaultShiftConfig;
};

// Save shift config to localStorage
const saveShiftConfig = (config: ShiftConfig): void => {
	try {
		localStorage.setItem("shiftConfig", JSON.stringify(config));
		currentShiftConfig = config;
	} catch (error) {
		console.error("Failed to save shift config:", error);
	}
};

// Initialize shift config
currentShiftConfig = loadShiftConfig();

// Helper function to format date as YYYY-MM-DD (using local time)
const formatDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

// Get week ranges for a given month
const getWeeksInMonth = (month: number, year: number): WeekRange[] => {
	const weeks: WeekRange[] = [];
	const firstDay = new Date(year, month - 1, 1);
	const lastDay = new Date(year, month, 0);

	// Find the first Monday of the month (or the Monday before if month doesn't start on Monday)
	let currentMonday = new Date(firstDay);
	const dayOfWeek = firstDay.getDay();
	const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
	currentMonday.setDate(firstDay.getDate() + daysToMonday);

	while (currentMonday <= lastDay) {
		const weekStart = new Date(currentMonday);
		const weekEnd = new Date(currentMonday);
		weekEnd.setDate(weekEnd.getDate() + 6); // Sunday

		const startStr = formatDate(weekStart);
		const endStr = formatDate(weekEnd);

		const label = `${weekStart.getDate().toString().padStart(2, "0")}/${(
			weekStart.getMonth() + 1
		)
			.toString()
			.padStart(2, "0")} - ${weekEnd
			.getDate()
			.toString()
			.padStart(2, "0")}/${(weekEnd.getMonth() + 1)
			.toString()
			.padStart(2, "0")}`;

		weeks.push({
			start: startStr,
			end: endStr,
			label,
		});

		currentMonday.setDate(currentMonday.getDate() + 7);
	}

	return weeks;
};

// Mock data storage - Updated for new shift system
let mockScheduleData: ShiftAssignment[] = [
	// Week 17/11 - 23/11/2025
	// Monday 17/11
	{
		id: "sch-1",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-17",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-2",
		staffId: "1",
		staffName: "Trần Thị Bé",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-17",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-3",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-17",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-4",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-17",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	// Tuesday 18/11
	{
		id: "sch-5",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-18",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-6",
		staffId: "4",
		staffName: "Phạm Minh Tuấn",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-18",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-7",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-18",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-8",
		staffId: "5",
		staffName: "Hoàng Thu Hà",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-18",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	// Wednesday 19/11
	{
		id: "sch-9",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-19",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-10",
		staffId: "9",
		staffName: "Ngô Thị Lan",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-19",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-11",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-19",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-12",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-19",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	// Thursday 20/11
	{
		id: "sch-13",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-20",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-14",
		staffId: "12",
		staffName: "Lý Văn Minh",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-20",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-15",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-20",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-16",
		staffId: "5",
		staffName: "Hoàng Thu Hà",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-20",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	// Friday 21/11
	{
		id: "sch-17",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-21",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-18",
		staffId: "1",
		staffName: "Trần Thị Bé",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-21",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-19",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-21",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-20",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-21",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "completed",
	},
	// Saturday 22/11
	{
		id: "sch-21",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-22",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-22",
		staffId: "15",
		staffName: "Dương Thị Kim",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-22",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-23",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-22",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "late",
		notes: "Đến muộn 15 phút",
	},
	{
		id: "sch-24",
		staffId: "8",
		staffName: "Bùi Văn Đức",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-22",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Partime",
		status: "completed",
	},
	// Sunday 23/11 (Today)
	{
		id: "sch-25",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-23",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-26",
		staffId: "1",
		staffName: "Trần Thị Bé",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-23",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-27",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-23",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-28",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-23",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	// Week 24/11 - 30/11/2025 (Next week)
	// Monday 24/11
	{
		id: "sch-29",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-24",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-30",
		staffId: "4",
		staffName: "Phạm Minh Tuấn",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-24",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-31",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-24",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-32",
		staffId: "5",
		staffName: "Hoàng Thu Hà",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-24",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	// Tuesday 25/11
	{
		id: "sch-33",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-25",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-34",
		staffId: "9",
		staffName: "Ngô Thị Lan",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-25",
		shift: "shift-morning",
		shiftName: "Ca Sáng",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-35",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-25",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-36",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-25",
		shift: "shift-afternoon",
		shiftName: "Ca Chiều",
		employmentType: "Fulltime",
		status: "scheduled",
	},
];

const scheduleService = {
	// Get all shift assignments for a specific week
	getWeekSchedule: async (
		weekStart: string,
		weekEnd: string,
	): Promise<WeekSchedule> => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		const assignments = mockScheduleData.filter((assignment) => {
			return assignment.date >= weekStart && assignment.date <= weekEnd;
		});

		return {
			weekStart,
			weekEnd,
			assignments,
		};
	},

	// Get all assignments for a specific date
	getDayAssignments: async (date: string): Promise<ShiftAssignment[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockScheduleData.filter(
			(assignment) => assignment.date === date,
		);
	},

	// Create a new shift assignment
	createAssignment: async (
		data: CreateShiftAssignment,
	): Promise<ShiftAssignment> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Get staff info
		const staff = await staffService.getStaffById(data.staffId);
		if (!staff) {
			throw new Error("Không tìm thấy nhân viên");
		}

		// Get shift template info
		const shiftTemplate = currentShiftConfig.shifts.find(
			(s) => s.id === data.shift,
		);

		if (!shiftTemplate) {
			throw new Error("Không tìm thấy ca làm việc");
		}

		// Check if staff is already assigned to this shift on this date
		const existingAssignment = mockScheduleData.find(
			(a) =>
				a.staffId === data.staffId &&
				a.date === data.date &&
				a.shift === data.shift,
		);

		if (existingAssignment) {
			throw new Error(
				`${staff.name} đã được xếp vào ca ${shiftTemplate.name} trong ngày này`,
			);
		}

		const newAssignment: ShiftAssignment = {
			id: `sch-${Date.now()}`,
			staffId: data.staffId,
			staffName: staff.name,
			staffPosition: staff.position,
			date: data.date,
			shift: data.shift,
			shiftName: shiftTemplate?.name,
			employmentType: staff.employmentType,
			status: "scheduled",
			notes: data.notes,
		};

		mockScheduleData.push(newAssignment);
		return newAssignment;
	},

	// Update an existing shift assignment
	updateAssignment: async (
		id: string,
		updates: UpdateShiftAssignment,
	): Promise<ShiftAssignment> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const index = mockScheduleData.findIndex((a) => a.id === id);
		if (index === -1) {
			throw new Error("Assignment not found");
		}

		const assignment = mockScheduleData[index];

		// If staffId is being updated, get new staff info
		if (updates.staffId && updates.staffId !== assignment.staffId) {
			const staff = await staffService.getStaffById(updates.staffId);
			if (!staff) {
				throw new Error("Staff not found");
			}
			assignment.staffId = updates.staffId;
			assignment.staffName = staff.name;
			assignment.staffPosition = staff.position;
			assignment.employmentType = staff.employmentType;
		}

		if (updates.status) assignment.status = updates.status;
		if (updates.notes !== undefined) assignment.notes = updates.notes;

		mockScheduleData[index] = assignment;
		return assignment;
	},

	// Delete a shift assignment
	deleteAssignment: async (id: string): Promise<void> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const index = mockScheduleData.findIndex((a) => a.id === id);
		if (index === -1) {
			throw new Error("Assignment not found");
		}

		mockScheduleData.splice(index, 1);
	},

	// Get month data with weeks
	getMonthData: async (month: number, year: number): Promise<MonthData> => {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const weeks = getWeeksInMonth(month, year);
		return {
			month,
			year,
			weeks,
		};
	},

	// Get available staff for a specific date and shift
	getAvailableStaff: async (date: string, shiftId: string) => {
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Get all staff
		const allStaff = await staffService.getAllStaff();

		// Get existing assignments for this date and shift
		const existingAssignments = mockScheduleData.filter(
			(a) => a.date === date && a.shift === shiftId,
		);
		const assignedStaffIds = existingAssignments.map((a) => a.staffId);

		// Calculate week range for the given date
		const currentDate = new Date(date);
		const dayOfWeek = currentDate.getDay();
		const monday = new Date(currentDate);
		monday.setDate(
			currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
		);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);

		const weekStart = formatDate(monday);
		const weekEnd = formatDate(sunday);

		// Count shifts per staff in this week
		const staffShiftCounts: { [staffId: string]: number } = {};
		mockScheduleData.forEach((assignment) => {
			if (assignment.date >= weekStart && assignment.date <= weekEnd) {
				staffShiftCounts[assignment.staffId] =
					(staffShiftCounts[assignment.staffId] || 0) + 1;
			}
		});

		// Filter staff: not assigned to this shift AND not exceeded max shifts per week
		return allStaff.filter((staff) => {
			const isAssigned = assignedStaffIds.includes(staff.id);
			const currentShifts = staffShiftCounts[staff.id] || 0;
			const maxShifts = currentShiftConfig.maxShiftsPerWeek;
			return !isAssigned && currentShifts < maxShifts;
		});
	},

	// Get staff shift count for a specific week
	getStaffShiftCount: async (
		staffId: string,
		weekStart: string,
		weekEnd: string,
	): Promise<number> => {
		await new Promise((resolve) => setTimeout(resolve, 100));

		const count = mockScheduleData.filter(
			(a) =>
				a.staffId === staffId &&
				a.date >= weekStart &&
				a.date <= weekEnd,
		).length;

		return count;
	},

	// Bulk create assignments (for copying schedules)
	bulkCreateAssignments: async (
		assignments: CreateShiftAssignment[],
	): Promise<ShiftAssignment[]> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const newAssignments: ShiftAssignment[] = [];
		const errors: string[] = [];

		for (const data of assignments) {
			const staff = await staffService.getStaffById(data.staffId);
			if (!staff) {
				errors.push(`Không tìm thấy nhân viên với ID: ${data.staffId}`);
				continue;
			}

			const shiftTemplate = currentShiftConfig.shifts.find(
				(s) => s.id === data.shift,
			);

			if (!shiftTemplate) {
				errors.push(
					`Không tìm thấy ca làm việc với ID: ${data.shift} cho nhân viên ${staff.name}`,
				);
				continue;
			}

			// Check if staff is already assigned to this shift on this date
			const existingAssignment = mockScheduleData.find(
				(a) =>
					a.staffId === data.staffId &&
					a.date === data.date &&
					a.shift === data.shift,
			);

			if (existingAssignment) {
				errors.push(
					`${staff.name} đã được xếp vào ca ${shiftTemplate.name} vào ngày ${data.date}`,
				);
				continue;
			}

			const newAssignment: ShiftAssignment = {
				id: `sch-${Date.now()}-${Math.random()}`,
				staffId: data.staffId,
				staffName: staff.name,
				staffPosition: staff.position,
				date: data.date,
				shift: data.shift,
				shiftName: shiftTemplate?.name,
				employmentType: staff.employmentType,
				status: "scheduled",
				notes: data.notes,
			};
			newAssignments.push(newAssignment);
			mockScheduleData.push(newAssignment);
		}

		// If there were errors, throw them as a single error
		if (errors.length > 0) {
			throw new Error(
				`Một số ca không thể được tạo:\n${errors.join("\n")}`,
			);
		}

		return newAssignments;
	},

	// Get shift configuration
	getShiftConfig: async (): Promise<ShiftConfig> => {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return currentShiftConfig;
	},

	// Update shift configuration
	updateShiftConfig: async (config: ShiftConfig): Promise<ShiftConfig> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		saveShiftConfig(config);
		return currentShiftConfig;
	},

	// Reset shift configuration to default
	resetShiftConfig: async (): Promise<ShiftConfig> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		saveShiftConfig(defaultShiftConfig);
		return defaultShiftConfig;
	},
};

export { scheduleService };
