/**
 * Account type enum - matches backend enum
 */
export type AccountType = "SalesStaff" | "WarehouseStaff" | "Admin";

/**
 * Staff model - matches backend response from GET /api/staffs/
 */
export interface Staff {
	profileId: string; // Primary identifier
	userId: string; // User account ID
	username: string; // Login username
	fullName: string; // Display name
	email: string;
	phoneNumber: string;
	dateOfBirth: string; // Format: "DD/MM/YYYY"
	accountType: AccountType; // "SalesStaff" or "WarehouseStaff"
	avatarUrl: string | null;
	location: string | null;
}

/**
 * Extended staff detail (for future expansion)
 */
export interface StaffDetail extends Staff {
	bio?: string;
}

/**
 * DTO for creating a new staff member
 * Note: username and password are required for account creation
 */
export interface CreateStaffDTO {
	username: string; // Required, Unique
	password: string; // Required
	fullName: string; // Required
	email: string; // Required, Unique
	phoneNumber: string; // Required
	accountType: AccountType; // "SalesStaff" or "WarehouseStaff"
	dateOfBirth?: string; // Format: "YYYY-MM-DD" (ISO 8601)
	location?: string;
	bio?: string;
}

/**
 * DTO for updating staff member
 * Note: username and password cannot be updated
 */
export interface UpdateStaffDTO {
	fullName?: string;
	email?: string;
	phoneNumber?: string;
	accountType?: AccountType;
	dateOfBirth?: string; // Format: "YYYY-MM-DD" (ISO 8601)
	location?: string;
	bio?: string;
}

/**
 * Helper to convert AccountType to display text (Vietnamese)
 */
export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
	SalesStaff: "Nhân viên bán hàng",
	WarehouseStaff: "Nhân viên kho",
	Admin: "Admin",
};

/**
 * Helper to get AccountType options for select dropdowns
 */
export const ACCOUNT_TYPE_OPTIONS: { value: AccountType; label: string }[] = [
	{ value: "SalesStaff", label: "Nhân viên bán hàng" },
	{ value: "WarehouseStaff", label: "Nhân viên kho" },
	{ value: "Admin", label: "Admin" },
];
