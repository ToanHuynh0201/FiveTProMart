import { Box, Flex, Text } from "@chakra-ui/react";

export function SidebarLogo() {
	return (
		<Flex
			direction="column"
			align="center"
			pt={4}
			pb={2}
			px={4}>
			{/* Logo Image placeholder - replace with actual logo */}
			<Box
				w="64px"
				h="53px"
				bg="white"
				borderRadius="md"
				mb={2}
				position="relative"
				overflow="hidden">
				{/* Add your logo image here */}
				{/* <Image src="/logo.png" alt="5T Mart Logo" /> */}
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
