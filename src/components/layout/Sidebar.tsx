import { useMemo } from "react";
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
import { usePermissions } from "@/hooks/usePermissions";
import { useInventoryAlerts } from "@/hooks";
import {
	useSidebar,
	SIDEBAR_WIDTH_EXPANDED,
	SIDEBAR_WIDTH_COLLAPSED,
} from "@/contexts/SidebarContext";
import type { NavItem } from "@/types/layout";

function Sidebar() {
	const location = useLocation();
	const { user, logout } = useAuth();
	const { hasAccess } = usePermissions();
	const { criticalCount, warningCount } = useInventoryAlerts();
	const { isCollapsed, toggleSidebar } = useSidebar();

	const isActivePath = (path: string) => location.pathname === path;

	// Filter nav items based on permissions and inject dynamic badges
	const navItemsWithBadges: NavItem[] = useMemo(() => {
		return (
			navItems
				.filter((item) => {
					// If item has a module requirement, check permission
					if (item.module) {
						return hasAccess(item.module);
					}
					// Items without module requirement are always visible
					return true;
				})
				.map((item) => {
					// Add badge to inventory page for critical/warning alerts
					if (item.path === "/inventory") {
						const totalAlerts = criticalCount + warningCount;
						if (totalAlerts > 0) {
							return {
								...item,
								badge: {
									count: totalAlerts,
									// Red for critical, orange if only warnings
									colorScheme:
										criticalCount > 0 ? "red" : "orange",
								},
							};
						}
					}
				}
				return item;
			});
	}, [criticalCount, warningCount, hasAccess]);

	return (
		<Flex
			direction="column"
			w={
				isCollapsed
					? `${SIDEBAR_WIDTH_COLLAPSED}px`
					: `${SIDEBAR_WIDTH_EXPANDED}px`
			}
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
						onClick={toggleSidebar}
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
