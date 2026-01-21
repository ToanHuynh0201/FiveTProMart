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

// API DTOs
export interface RoleRequirement {
	accountType: string; // "SalesStaff" | "WarehouseStaff"
	quantity: number;
}

export interface ShiftRoleConfig {
	id: string;
	configName: string;
	description?: string;
	requirements: RoleRequirement[];
	isActive?: boolean;
}

export interface CreateShiftRoleConfigDTO {
	configName: string;
	requirements: RoleRequirement[];
}

export interface WorkShift {
	id: string;
	shiftName: string;
	startTime: string; // "HH:mm"
	endTime: string; // "HH:mm"
	isActive: boolean;
	roleConfig: {
		id: string;
		configName: string;
	};
}

export interface CreateWorkShiftDTO {
	shiftName: string;
	startTime: string; // "HH:mm"
	endTime: string; // "HH:mm"
	roleConfigId: string;
}

// API Response Types
export interface WorkScheduleAssignment {
	profileId: string;
	fullName: string;
	accountType: string;
	status: string; // "Assigned"
}

// API Response for work schedule (from GET /work-schedules)
export interface WorkScheduleResponse {
	id: string;
	workDate: string; // Date ISO string
	workShiftId: string;
	shiftName: string;
	startTime: string; // "HH:mm"
	endTime: string; // "HH:mm"
	isCompliant: boolean;
	missingRoles: RoleRequirement[];
	requirementsRoles: RoleRequirement[];
	assignments: WorkScheduleAssignment[];
}

export interface GetWorkSchedulesFilters {
	startDate: string; // "dd-MM-yyyy"
	endDate: string; // "dd-MM-yyyy"
	profileId?: string;
	workShiftId?: string;
}

export interface AssignStaffDTO {
	workDates: string[]; // ["20-01-2026", "21-01-2026"]
	workShiftId: string;
	assignedStaffIds: string[];
}

export interface ScheduleStatus {
	workDate: string;
	isCompliant: boolean;
	missingRoles: RoleRequirement[];
}

export interface AssignStaffResponse {
	assignedCount: number;
	scheduleStatus: ScheduleStatus[];
}

export interface RemoveStaffDTO {
	workDates: string[];
	workShiftId: string[];
	assignedStaffIds: string[];
}

export interface RemoveStaffResponse {
	workDate: string;
	isCompliant: boolean;
	missingRoles: RoleRequirement[];
}
