import type { IconType } from "react-icons";

export interface NavItem {
	label: string;
	path: string;
	icon?: IconType;
	children?: NavItem[];
}

export interface User {
	id?: string;
	name?: string;
	email?: string;
	role?: string;
	avatar?: string;
}
