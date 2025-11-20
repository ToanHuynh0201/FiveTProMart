import { Box, Flex, Text, Avatar } from "@chakra-ui/react";

interface SidebarUserProfileProps {
	user: {
		name?: string;
		email?: string;
		role?: string;
	};
}

export function SidebarUserProfile({ user }: SidebarUserProfileProps) {
	return (
		<Flex
			align="center"
			px={4}
			py={3}
			gap={3}>
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
					color="white"
					fontSize="16px"
					fontWeight="400"
					lineHeight="1.21">
					Xin chào,
				</Text>
				<Text
					color="white"
					fontSize="21px"
					fontWeight="600"
					lineHeight="1.21"
					noOfLines={1}>
					{user.name || "Người dùng"}
				</Text>
				{/* Role với underline màu xanh */}
				{user.role && (
					<Box
						mt={1}
						pt={1}>
						<Text
							color="white"
							fontSize="24px"
							fontWeight="700"
							lineHeight="1.21"
							noOfLines={1}>
							{user.role}
						</Text>
						<Box
							w="60px"
							h="6px"
							bg="#BBD6FF"
							mt={1}
						/>
					</Box>
				)}
			</Box>
		</Flex>
	);
}
