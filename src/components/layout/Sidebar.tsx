import { Flex, VStack } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarItem } from "./SidebarItem";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarUserProfile } from "./SidebarUserProfile";
import { navItems } from "./sidebarConfig";
import { useAuth } from "@/hooks/useAuth";

function Sidebar() {
	const location = useLocation();
	const { user, logout } = useAuth();

	const isActivePath = (path: string) => location.pathname === path;

	return (
		<Flex
			direction="column"
			w="254px"
			h="100vh"
			bg="brand.500"
			position="sticky"
			top={0}
			overflow="hidden">
			{/* Logo Section */}
			<SidebarLogo />

			{/* User Profile */}
			{user && <SidebarUserProfile user={user} />}

			{/* Header Icons */}
			<SidebarHeader onLogout={logout} />

			{/* Navigation Sections */}
			<VStack
				flex={1}
				spacing={0}
				px={4}
				py={6}
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
				{navItems.map((item) => (
					<SidebarItem
						key={item.path}
						item={item}
						isActive={isActivePath(item.path)}
					/>
				))}
			</VStack>
		</Flex>
	);
}

export default Sidebar;
