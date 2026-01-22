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
		module: "sales",
	},
	{
		label: "Hàng hóa",
		path: "/inventory",
		icon: FiPackage,
		module: "inventory",
	},
	{
		label: "Danh mục",
		path: "/categories",
		icon: FiGrid,
		module: "categories",
	},
	{
		label: "Nhập hàng",
		path: "/purchase",
		icon: FiTruck,
		module: "purchase",
	},
	{
		label: "Nhà cung cấp",
		path: "/suppliers",
		icon: FiBox,
		module: "suppliers",
	},
	{
		label: "Khuyến mãi",
		path: "/promotions",
		icon: FiGift,
		module: "promotions",
	},
	{
		label: "Nhân sự",
		path: "/staff",
		icon: FiUsers,
		module: "staff",
	},
	{
		label: "Ca làm",
		path: "/schedule",
		icon: FiCalendar,
		module: "schedule",
	},
	{
		label: "Báo cáo",
		path: "/reports",
		icon: FiBarChart2,
		module: "reports",
	},
	{
		label: "Chi phí",
		path: "/expenses",
		icon: FiAlertCircle,
		module: "expenses",
	},
	{
		label: "Khách hàng",
		path: "/customers",
		icon: FiUserCheck,
		module: "customers",
	},
];
