import { Flex, IconButton, Tooltip } from "@chakra-ui/react";
import { BellIcon, CalendarIcon, ChatIcon } from "@chakra-ui/icons";
import { SmallCloseIcon } from "@chakra-ui/icons";

interface SidebarHeaderProps {
	onLogout: () => void;
}

export function SidebarHeader({ onLogout }: SidebarHeaderProps) {
	return (
		<Flex
			justify="flex-end"
			align="center"
			gap={2}
			px={4}
			py={2}
			borderBottom="1px solid"
			borderColor="rgba(187, 214, 255, 0.2)">
			{/* Notification Bell */}
			<Tooltip
				label="Thông báo"
				placement="bottom">
				<IconButton
					aria-label="Notifications"
					icon={<BellIcon boxSize={5} />}
					size="sm"
					variant="ghost"
					color="white"
					_hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
				/>
			</Tooltip>

			{/* Calendar */}
			<Tooltip
				label="Lịch"
				placement="bottom">
				<IconButton
					aria-label="Calendar"
					icon={<CalendarIcon boxSize={5} />}
					size="sm"
					variant="ghost"
					color="white"
					_hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
				/>
			</Tooltip>

			{/* Chat */}
			<Tooltip
				label="Tin nhắn"
				placement="bottom">
				<IconButton
					aria-label="Messages"
					icon={<ChatIcon boxSize={5} />}
					size="sm"
					variant="ghost"
					color="white"
					_hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
				/>
			</Tooltip>

			{/* Logout */}
			<Tooltip
				label="Đăng xuất"
				placement="bottom">
				<IconButton
					aria-label="Logout"
					icon={<SmallCloseIcon boxSize={6} />}
					size="sm"
					variant="ghost"
					color="white"
					_hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
					onClick={onLogout}
				/>
			</Tooltip>
		</Flex>
	);
}
