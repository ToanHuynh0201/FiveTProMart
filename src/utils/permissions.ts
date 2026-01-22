import type { User } from "@/types/auth";
import type {
	AccountType,
	PermissionModule,
	UserPermissions,
} from "@/types/permissions";

/**
 * Permission configuration based on account types
 *
 * Rules:
 * - Admin: Full access to all modules
 * - SalesStaff: Sales and Customers modules only
 * - WarehouseStaff: Inventory, Categories, Purchase, and Suppliers modules only
 * - null/undefined user: Treated as Admin (fallback for backward compatibility)
 */
const PERMISSION_MAP: Record<PermissionModule, AccountType[]> = {
	dashboard: ["Admin", "SalesStaff", "WarehouseStaff"],
	staff: ["Admin"],
	schedule: ["Admin"],
	sales: ["Admin", "SalesStaff"],
	customers: ["Admin", "SalesStaff"],
	inventory: ["Admin", "WarehouseStaff"],
	categories: ["Admin", "WarehouseStaff"],
	purchase: ["Admin", "WarehouseStaff"],
	suppliers: ["Admin", "WarehouseStaff"],
	promotions: ["Admin"],
	reports: ["Admin"],
	expenses: ["Admin"],
};

/**
 * Get effective account type (null/undefined treated as Admin)
 */
const getEffectiveAccountType = (user: User | null): AccountType => {
	if (!user || !user.accountType) {
		console.log(
			"[Permissions] User is null or has no accountType, defaulting to Admin",
		);
		return "Admin";
	}

	const accountType = user.accountType.trim();
	// Map common variations to our standard types
	const normalizedType =
		accountType === "Admin" || accountType === "ADMIN"
			? "Admin"
			: accountType === "SalesStaff" || accountType === "SALESSTAFF"
				? "SalesStaff"
				: accountType === "WarehouseStaff" ||
					  accountType === "WARESTAFF" ||
					  accountType === "WAREHOUSE_STAFF"
					? "WarehouseStaff"
					: "Admin"; // Default to Admin for unknown types

	console.log("[Permissions] Normalized accountType:", normalizedType);
	return normalizedType as AccountType;
};

/**
 * Check if user has access to a specific module
 */
export const hasModuleAccess = (
	user: User | null,
	module: PermissionModule,
): boolean => {
	const accountType = getEffectiveAccountType(user);
	const allowedRoles = PERMISSION_MAP[module];
	const hasAccess = allowedRoles.includes(accountType);

	console.log(`[Permissions] Checking access for ${module}:`, {
		accountType,
		allowedRoles,
		hasAccess,
	});

	return hasAccess;
};

/**
 * Get all permissions for a user
 */
export const getUserPermissions = (user: User | null): UserPermissions => {
	return {
		canAccessDashboard: hasModuleAccess(user, "dashboard"),
		canAccessStaff: hasModuleAccess(user, "staff"),
		canAccessSchedule: hasModuleAccess(user, "schedule"),
		canAccessSales: hasModuleAccess(user, "sales"),
		canAccessCustomers: hasModuleAccess(user, "customers"),
		canAccessInventory: hasModuleAccess(user, "inventory"),
		canAccessCategories: hasModuleAccess(user, "categories"),
		canAccessPurchase: hasModuleAccess(user, "purchase"),
		canAccessSuppliers: hasModuleAccess(user, "suppliers"),
		canAccessPromotions: hasModuleAccess(user, "promotions"),
		canAccessReports: hasModuleAccess(user, "reports"),
		canAccessExpenses: hasModuleAccess(user, "expenses"),
	};
};

/**
 * Check if user is admin (or treated as admin)
 */
export const isAdmin = (user: User | null): boolean => {
	return getEffectiveAccountType(user) === "Admin";
};

/**
 * Check if user is sales staff
 */
export const isSalesStaff = (user: User | null): boolean => {
	return getEffectiveAccountType(user) === "SalesStaff";
};

/**
 * Check if user is warehouse staff
 */
export const isWarehouseStaff = (user: User | null): boolean => {
	return getEffectiveAccountType(user) === "WarehouseStaff";
};
