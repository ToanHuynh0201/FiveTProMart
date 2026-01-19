import { useState, useEffect, useMemo } from "react";
import { Flex, VStack, IconButton, Tooltip } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarItem } from "./SidebarItem";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { UpcomingShifts } from "./UpcomingShifts";
import { navItems } from "./sidebarConfig";
import { useAuth } from "@/hooks/useAuth";
import { useInventoryAlerts } from "@/hooks";
import type { NavItem } from "@/types/layout";

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

function Sidebar() {
	const location = useLocation();
	const { user, logout } = useAuth();
	const { criticalCount, warningCount } = useInventoryAlerts();
	const [isCollapsed, setIsCollapsed] = useState(() => {
		const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
		return saved ? JSON.parse(saved) : false;
	});

	useEffect(() => {
		localStorage.setItem(
			SIDEBAR_COLLAPSED_KEY,
			JSON.stringify(isCollapsed),
		);
	}, [isCollapsed]);

	const isActivePath = (path: string) => location.pathname === path;

	// Inject dynamic badges into nav items
	const navItemsWithBadges: NavItem[] = useMemo(() => {
		return navItems.map((item) => {
			// Add badge to inventory page for critical/warning alerts
			if (item.path === "/inventory") {
				const totalAlerts = criticalCount + warningCount;
				if (totalAlerts > 0) {
					return {
						...item,
						badge: {
							count: totalAlerts,
							// Red for critical, orange if only warnings
							colorScheme: criticalCount > 0 ? "red" : "orange",
						},
					};
				}
			}
			return item;
		});
	}, [criticalCount, warningCount]);

	return (
		<Flex
			direction="column"
			w={isCollapsed ? "80px" : "254px"}
			h="100vh"
			bg="brand.500"
			position="relative"
			top={0}
			overflow="hidden"
			transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
			shadow="xl"
			borderRight="1px solid"
			borderColor="rgba(187, 214, 255, 0.1)">
			{/* Logo Section */}
			<SidebarLogo isCollapsed={isCollapsed} />

			{/* User Profile */}
			{user && (
				<SidebarUserProfile
					user={user}
					isCollapsed={isCollapsed}
				/>
			)}

			{/* Header Icons */}
			<SidebarHeader
				onLogout={logout}
				isCollapsed={isCollapsed}
			/>

			{/* Toggle Button - Below Header */}
			<Flex
				justify={isCollapsed ? "center" : "flex-end"}
				px={isCollapsed ? 2 : 4}
				py={1}
				borderColor="rgba(187, 214, 255, 0.1)">
				<Tooltip
					label={isCollapsed ? "Mở rộng" : "Thu gọn"}
					placement="right"
					hasArrow>
					<IconButton
						aria-label="Toggle sidebar"
						icon={
							isCollapsed ? (
								<ChevronRightIcon boxSize={5} />
							) : (
								<ChevronLeftIcon boxSize={5} />
							)
						}
						size="sm"
						variant="ghost"
						color="whiteAlpha.700"
						bg="rgba(255, 255, 255, 0.08)"
						borderRadius="md"
						_hover={{
							color: "white",
							bg: "rgba(255, 255, 255, 0.15)",
							transform: "scale(1.05)",
						}}
						_active={{
							bg: "rgba(255, 255, 255, 0.2)",
						}}
						transition="all 0.2s ease"
						onClick={() => setIsCollapsed(!isCollapsed)}
					/>
				</Tooltip>
			</Flex>

			{/* Navigation Sections */}
			<VStack
				flex={1}
				spacing={1}
				px={isCollapsed ? 2 : 4}
				py={3}
				align="stretch"
				overflowY="auto"
				css={{
					"&::-webkit-scrollbar": {
						width: "4px",
					},
					"&::-webkit-scrollbar-track": {
						background: "transparent",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "rgba(187, 214, 255, 0.3)",
						borderRadius: "20px",
					},
				}}>
				{/* Navigation Items */}
				{navItemsWithBadges.map((item) => (
					<SidebarItem
						key={item.path}
						item={item}
						isActive={isActivePath(item.path)}
						isCollapsed={isCollapsed}
					/>
				))}
			</VStack>

			{/* Upcoming Shifts Section */}
			<UpcomingShifts isCollapsed={isCollapsed} />
		</Flex>
	);
}

export default Sidebar;
