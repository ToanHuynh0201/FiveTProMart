export interface Staff {
	id: string;
	name: string;
	position: string;
	shift: string;
	avatar?: string;
	// Extended details
	phone?: string;
	email?: string;
	address?: string;
	dateOfBirth?: string;
	hireDate?: string;
	salary?: number;
	workDays?: string[];
	status?: "active" | "inactive" | "on-leave";
	employmentType?: "Fulltime" | "Partime";
}

export interface StaffDetail extends Staff {}

export interface WorkSchedule {
	date: string; // ISO date string (YYYY-MM-DD)
	shift: "morning" | "afternoon";
	startTime: string; // HH:MM
	endTime: string; // HH:MM
	status: "scheduled" | "completed" | "absent" | "late";
	notes?: string;
}

export interface UpdateStaffData {
	phone?: string;
	email?: string;
	address?: string;
	salary?: number;
	shift?: string;
	status?: "active" | "inactive" | "on-leave";
	position?: string;
	employmentType?: "Fulltime" | "Partime";
	dateOfBirth?: string;
	hireDate?: string;
}
