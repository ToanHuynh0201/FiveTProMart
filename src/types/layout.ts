import type { IconType } from "react-icons";
import type { PermissionModule } from "./permissions";

export interface NavItemBadge {
	count: number;
	/** Badge color scheme: 'red' for critical, 'orange' for warning */
	colorScheme?: "red" | "orange" | "green" | "blue";
}

export interface NavItem {
	label: string;
	path: string;
	icon?: IconType;
	children?: NavItem[];
	/** Optional badge to display alert counts */
	badge?: NavItemBadge;
	/** Required permission module to access this nav item */
	module?: PermissionModule;
}

export interface User {
	id?: string;
	name?: string;
	email?: string;
	role?: string;
	avatar?: string;
}
