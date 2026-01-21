import type { NavItem } from "@/types/layout";
import {
	FiUsers,
	FiCalendar,
	FiShoppingCart,
	FiPackage,
	FiTruck,
	FiBarChart2,
	FiUserCheck,
	FiGift,
	FiBox,
	FiAlertCircle,
	FiGrid,
} from "react-icons/fi";

export const navItems: NavItem[] = [
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
		label: "Danh mục",
		path: "/categories",
		icon: FiGrid,
	},
	{
		label: "Nhập hàng",
		path: "/purchase",
		icon: FiTruck,
	},
	{
		label: "Nhà cung cấp",
		path: "/suppliers",
		icon: FiBox,
	},
	{
		label: "Khuyến mãi",
		path: "/promotions",
		icon: FiGift,
	},
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
		label: "Báo cáo",
		path: "/reports",
		icon: FiBarChart2,
	},
	{
		label: "Chi phí",
		path: "/expenses",
		icon: FiAlertCircle,
	},
	{
		label: "Khách hàng",
		path: "/customers",
		icon: FiUserCheck,
	},
];
