export type AccountType = "Admin" | "SalesStaff" | "WarehouseStaff";

export type PermissionModule =
	| "dashboard"
	| "staff"
	| "schedule"
	| "sales"
	| "customers"
	| "inventory"
	| "categories"
	| "purchase"
	| "suppliers"
	| "promotions"
	| "reports"
	| "expenses";

export interface PermissionConfig {
	module: PermissionModule;
	allowedRoles: AccountType[];
}

export interface UserPermissions {
	canAccessDashboard: boolean;
	canAccessStaff: boolean;
	canAccessSchedule: boolean;
	canAccessSales: boolean;
	canAccessCustomers: boolean;
	canAccessInventory: boolean;
	canAccessCategories: boolean;
	canAccessPurchase: boolean;
	canAccessSuppliers: boolean;
	canAccessPromotions: boolean;
	canAccessReports: boolean;
	canAccessExpenses: boolean;
}
