export interface ShiftAssignment {
	id: string;
	staffId: string;
	staffName: string;
	staffPosition?: string; // "Nhân viên kho" or "Nhân viên bán hàng"
	date: string; // ISO date string (YYYY-MM-DD)
	shift: "morning" | "afternoon";
	employmentType: "Fulltime" | "Partime";
	status: "scheduled" | "completed" | "absent" | "late";
	notes?: string;
}

export interface WeekSchedule {
	weekStart: string; // ISO date string
	weekEnd: string; // ISO date string
	assignments: ShiftAssignment[];
}

export interface ScheduleFilter {
	month: number;
	year: number;
	weekIndex?: number;
}

export interface DaySchedule {
	date: string;
	dayOfWeek: string; // "Thứ 2", "Thứ 3", etc.
	morning: ShiftAssignment[];
	afternoon: ShiftAssignment[];
}

export interface CreateShiftAssignment {
	staffId: string;
	date: string;
	shift: "morning" | "afternoon";
	notes?: string;
}

export interface UpdateShiftAssignment {
	staffId?: string;
	status?: "scheduled" | "completed" | "absent" | "late";
	notes?: string;
}

export interface WeekRange {
	start: string;
	end: string;
	label: string; // "12/02 - 19/02"
}

export interface MonthData {
	month: number;
	year: number;
	weeks: WeekRange[];
}
