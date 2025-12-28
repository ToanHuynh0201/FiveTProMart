import { Flex, IconButton, Tooltip, Text } from "@chakra-ui/react";
import { IoMdExit } from "react-icons/io";

interface SidebarHeaderProps {
	onLogout: () => void;
	isCollapsed: boolean;
}

export function SidebarHeader({ onLogout, isCollapsed }: SidebarHeaderProps) {
	if (isCollapsed) {
		return (
			<Flex
				justify="center"
				align="center"
				px={2}
				py={3}
				borderColor="rgba(187, 214, 255, 0.2)">
				<Tooltip
					label="Đăng xuất"
					placement="right"
					hasArrow>
					<IconButton
						aria-label="Logout"
						icon={<IoMdExit size={20} />}
						size="md"
						variant="solid"
						bg="rgba(255, 99, 71, 0.2)"
						color="white"
						borderRadius="lg"
						border="1px solid"
						borderColor="rgba(255, 99, 71, 0.4)"
						_hover={{
							bg: "rgba(255, 99, 71, 0.4)",
							borderColor: "rgba(255, 99, 71, 0.6)",
							transform: "scale(1.1)",
							shadow: "0 0 15px rgba(255, 99, 71, 0.5)",
						}}
						_active={{
							transform: "scale(0.95)",
							bg: "rgba(255, 99, 71, 0.5)",
						}}
						transition="all 0.2s"
						onClick={onLogout}
					/>
				</Tooltip>
			</Flex>
		);
	}

	return (
		<Flex
			direction="column"
			gap={2}
			px={4}
			py={3}
			borderColor="rgba(187, 214, 255, 0.2)">
			<Tooltip
				label="Đăng xuất khỏi hệ thống"
				placement="right"
				hasArrow>
				<Flex
					as="button"
					align="center"
					justify="center"
					gap={2}
					w="full"
					py={2}
					px={3}
					bg="rgba(255, 99, 71, 0.2)"
					color="white"
					borderRadius="lg"
					border="1px solid"
					borderColor="rgba(255, 99, 71, 0.4)"
					cursor="pointer"
					_hover={{
						bg: "rgba(255, 99, 71, 0.4)",
						borderColor: "rgba(255, 99, 71, 0.6)",
						transform: "translateY(-2px)",
						shadow: "0 0 15px rgba(255, 99, 71, 0.5)",
					}}
					_active={{
						transform: "translateY(0)",
						bg: "rgba(255, 99, 71, 0.5)",
					}}
					transition="all 0.2s"
					onClick={onLogout}>
					<IoMdExit size={20} />
					<Text
						fontSize="sm"
						fontWeight="600">
						Đăng xuất
					</Text>
				</Flex>
			</Tooltip>
		</Flex>
	);
}
