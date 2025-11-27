import type { NavItem } from "@/types/layout";
import {
	FiUsers,
	FiCalendar,
	FiShoppingCart,
	FiPackage,
	FiTruck,
	FiDollarSign,
	FiBarChart2,
	FiUserCheck,
} from "react-icons/fi";

export const navItems: NavItem[] = [
	{
		label: "Nhân sự",
		path: "/staff",
		icon: FiUsers,
	},
	{
		label: "Ca làm",
		path: "/schedule",
		icon: FiCalendar,
	},
	{
		label: "Bán hàng",
		path: "/sales",
		icon: FiShoppingCart,
	},
	{
		label: "Hàng hóa",
		path: "/inventory",
		icon: FiPackage,
	},
	{
		label: "Nhập hàng",
		path: "/purchase",
		icon: FiTruck,
	},
	{
		label: "Tài chính",
		path: "/finance",
		icon: FiDollarSign,
	},
	{
		label: "Báo cáo",
		path: "/reports",
		icon: FiBarChart2,
	},
	{
		label: "Khách hàng",
		path: "/customers",
		icon: FiUserCheck,
	},
];
