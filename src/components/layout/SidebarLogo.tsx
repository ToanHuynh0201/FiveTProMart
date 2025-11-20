import { Box, Flex, Image, Text } from "@chakra-ui/react";
import logoImg from "@/assets/logo/image.png";

export function SidebarLogo() {
	return (
		<Flex
			direction="column"
			align="center"
			pt={4}
			pb={2}
			px={4}>
			{/* Logo Image */}
			<Box
				w="64px"
				h="53px"
				mb={2}
				position="relative"
				overflow="hidden">
				<Image
					src={logoImg}
					alt="5T Mart Logo"
					w="100%"
					h="100%"
					objectFit="contain"
				/>
			</Box>

			{/* Brand Name */}
			<Text
				color="white"
				fontSize="17px"
				fontWeight="900"
				fontFamily="Kimberley, serif"
				lineHeight="1.21">
				5T Mart
			</Text>
		</Flex>
	);
}
