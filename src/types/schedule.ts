export interface ShiftTemplate {
	id: string;
	name: string; // "Ca Sáng", "Ca Chiều", "Ca Tối", etc.
	startTime: string; // "08:00"
	endTime: string; // "12:00"
	requiredWarehouseStaff: number; // Số lượng nhân viên kho cần thiết
	requiredSalesStaff: number; // Số lượng nhân viên bán hàng cần thiết
	workingHours?: number; // Số giờ làm việc (tự động tính từ startTime và endTime)
	color?: string; // Màu sắc hiển thị trên lịch
	order: number; // Thứ tự hiển thị
}

export interface ShiftConfig {
	shifts: ShiftTemplate[];
	maxShiftsPerWeek: number; // Số ca tối đa mỗi nhân viên có thể làm trong 1 tuần
	updatedAt: string;
}

export interface ShiftAssignment {
	id: string;
	staffId: string;
	staffName: string;
	staffPosition?: string; // "Nhân viên kho" or "Nhân viên bán hàng"
	date: string; // ISO date string (YYYY-MM-DD)
	shift: string; // Shift template ID
	shiftName?: string; // Display name
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
	shifts: { [shiftId: string]: ShiftAssignment[] }; // Dynamic shifts
}

export interface CreateShiftAssignment {
	staffId: string;
	date: string;
	shift: string; // Shift template ID
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
