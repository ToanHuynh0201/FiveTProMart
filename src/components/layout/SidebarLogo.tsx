import { Box, Flex, Image, Text } from "@chakra-ui/react";
import logoImg from "@/assets/logo/image.png";

interface SidebarLogoProps {
	isCollapsed: boolean;
}

export function SidebarLogo({ isCollapsed }: SidebarLogoProps) {
	return (
		<Flex
			direction="column"
			align="center"
			pt={4}
			pb={2}
			px={4}
			position="relative">
			{/* Logo Image */}
			<Box
				w={isCollapsed ? "40px" : "64px"}
				h={isCollapsed ? "33px" : "53px"}
				mb={isCollapsed ? 0 : 2}
				position="relative"
				overflow="hidden"
				transition="all 0.3s">
				<Image
					src={logoImg}
					alt="5T Mart Logo"
					w="100%"
					h="100%"
					objectFit="contain"
				/>
			</Box>

			{/* Brand Name */}
			{!isCollapsed && (
				<Text
					color="white"
					fontSize="17px"
					fontWeight="900"
					fontFamily="Kimberley, serif"
					lineHeight="1.21"
					whiteSpace="nowrap"
					opacity={isCollapsed ? 0 : 1}
					transition="opacity 0.2s">
					5T Mart
				</Text>
			)}
		</Flex>
	);
}
