import type {
	ShiftAssignment,
	WeekSchedule,
	CreateShiftAssignment,
	UpdateShiftAssignment,
	WeekRange,
	MonthData,
} from "@/types";
import { staffService } from "./staffService";

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

// Mock data storage
let mockScheduleData: ShiftAssignment[] = [
	// Week 17/11 - 23/11/2025
	// Monday 17/11
	{
		id: "sch-1",
		staffId: "26",
		staffName: "Nguyễn Văn Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-17",
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-2",
		staffId: "1",
		staffName: "Trần Thị Bé",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-17",
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-3",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-17",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-4",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-17",
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-6",
		staffId: "4",
		staffName: "Phạm Minh Tuấn",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-18",
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-7",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-18",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-8",
		staffId: "5",
		staffName: "Hoàng Thu Hà",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-18",
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-10",
		staffId: "9",
		staffName: "Ngô Thị Lan",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-19",
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-11",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-19",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-12",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-19",
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-14",
		staffId: "12",
		staffName: "Lý Văn Minh",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-20",
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-15",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-20",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-16",
		staffId: "5",
		staffName: "Hoàng Thu Hà",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-20",
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-18",
		staffId: "1",
		staffName: "Trần Thị Bé",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-21",
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-19",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-21",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-20",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-21",
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-22",
		staffId: "15",
		staffName: "Dương Thị Kim",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-22",
		shift: "morning",
		employmentType: "Fulltime",
		status: "completed",
	},
	{
		id: "sch-23",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-22",
		shift: "afternoon",
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
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-26",
		staffId: "1",
		staffName: "Trần Thị Bé",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-23",
		shift: "morning",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-27",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-23",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-28",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-23",
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-30",
		staffId: "4",
		staffName: "Phạm Minh Tuấn",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-24",
		shift: "morning",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-31",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-24",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-32",
		staffId: "5",
		staffName: "Hoàng Thu Hà",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-24",
		shift: "afternoon",
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
		shift: "morning",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-34",
		staffId: "9",
		staffName: "Ngô Thị Lan",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-25",
		shift: "morning",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-35",
		staffId: "27",
		staffName: "Phạm Thị Kho",
		staffPosition: "Nhân viên kho",
		date: "2025-11-25",
		shift: "afternoon",
		employmentType: "Fulltime",
		status: "scheduled",
	},
	{
		id: "sch-36",
		staffId: "2",
		staffName: "Nguyễn Văn An",
		staffPosition: "Nhân viên bán hàng",
		date: "2025-11-25",
		shift: "afternoon",
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
			throw new Error("Staff not found");
		}

		const newAssignment: ShiftAssignment = {
			id: `sch-${Date.now()}`,
			staffId: data.staffId,
			staffName: staff.name,
			staffPosition: staff.position,
			date: data.date,
			shift: data.shift,
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
	getAvailableStaff: async (date: string, shift: "morning" | "afternoon") => {
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Get all staff
		const allStaff = await staffService.getAllStaff();

		// Get existing assignments for this date and shift
		const existingAssignments = mockScheduleData.filter(
			(a) => a.date === date && a.shift === shift,
		);
		const assignedStaffIds = existingAssignments.map((a) => a.staffId);

		// Return staff not yet assigned
		return allStaff.filter((staff) => !assignedStaffIds.includes(staff.id));
	},

	// Bulk create assignments (for copying schedules)
	bulkCreateAssignments: async (
		assignments: CreateShiftAssignment[],
	): Promise<ShiftAssignment[]> => {
		await new Promise((resolve) => setTimeout(resolve, 500));

		const newAssignments: ShiftAssignment[] = [];

		for (const data of assignments) {
			const staff = await staffService.getStaffById(data.staffId);
			if (staff) {
				const newAssignment: ShiftAssignment = {
					id: `sch-${Date.now()}-${Math.random()}`,
					staffId: data.staffId,
					staffName: staff.name,
					staffPosition: staff.position,
					date: data.date,
					shift: data.shift,
					employmentType: staff.employmentType,
					status: "scheduled",
					notes: data.notes,
				};
				newAssignments.push(newAssignment);
				mockScheduleData.push(newAssignment);
			}
		}

		return newAssignments;
	},
};

export { scheduleService };
