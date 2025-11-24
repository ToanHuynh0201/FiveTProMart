import { Box, Flex, Text, Avatar, Tooltip } from "@chakra-ui/react";

interface SidebarUserProfileProps {
	user: {
		name?: string;
		email?: string;
		role?: string;
	};
	isCollapsed: boolean;
}

export function SidebarUserProfile({
	user,
	isCollapsed,
}: SidebarUserProfileProps) {
	if (isCollapsed) {
		return (
			<Tooltip
				label={`${user.name} - ${user.role}`}
				placement="right"
				hasArrow>
				<Flex
					justify="center"
					px={4}
					py={3}>
					<Avatar
						size="sm"
						name={user.name || "User"}
						bg="brand.100"
						color="brand.500"
						w="40px"
						h="40px"
						cursor="pointer"
						transition="all 0.2s"
						_hover={{
							transform: "scale(1.1)",
							shadow: "md",
						}}
					/>
				</Flex>
			</Tooltip>
		);
	}

	return (
		<Flex
			align="center"
			px={4}
			py={3}
			gap={3}
			bg="rgba(255, 255, 255, 0.05)"
			borderRadius="md"
			mx={2}
			transition="all 0.2s"
			_hover={{
				bg: "rgba(255, 255, 255, 0.1)",
			}}>
			{/* Avatar */}
			<Avatar
				size="md"
				name={user.name || "User"}
				bg="brand.100"
				color="brand.500"
				w="45px"
				h="45px"
			/>

			{/* User Info */}
			<Box flex="1">
				<Text
					color="whiteAlpha.800"
					fontSize="14px"
					fontWeight="400"
					lineHeight="1.21">
					Xin chào,
				</Text>
				<Text
					color="white"
					fontSize="18px"
					fontWeight="600"
					lineHeight="1.21"
					noOfLines={1}>
					{user.name || "Người dùng"}
				</Text>
				{/* Role với underline màu xanh */}
				{user.role && (
					<Box mt={1}>
						<Text
							color="brand.100"
							fontSize="14px"
							fontWeight="700"
							lineHeight="1.21"
							noOfLines={1}>
							{user.role}
						</Text>
					</Box>
				)}
			</Box>
		</Flex>
	);
}
