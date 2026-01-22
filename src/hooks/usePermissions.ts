import { useMemo } from "react";
import { useAuth } from "./useAuth";
import {
	getUserPermissions,
	hasModuleAccess,
	isAdmin,
	isSalesStaff,
	isWarehouseStaff,
} from "@/utils/permissions";
import type { PermissionModule } from "@/types/permissions";

/**
 * Custom hook for accessing user permissions
 *
 * Usage:
 * ```tsx
 * const { canAccessSales, hasAccess, isAdmin } = usePermissions();
 *
 * if (canAccessSales) {
 *   // Render sales-related UI
 * }
 *
 * if (hasAccess("inventory")) {
 *   // Dynamic permission check
 * }
 * ```
 */
export const usePermissions = () => {
	const { user } = useAuth();

	const permissions = useMemo(() => getUserPermissions(user), [user]);

	const hasAccess = (module: PermissionModule): boolean => {
		return hasModuleAccess(user, module);
	};

	return {
		// Individual permission flags
		...permissions,

		// Dynamic permission check
		hasAccess,

		// Role checks
		isAdmin: isAdmin(user),
		isSalesStaff: isSalesStaff(user),
		isWarehouseStaff: isWarehouseStaff(user),
	};
};
