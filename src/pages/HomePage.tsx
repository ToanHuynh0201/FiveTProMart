import {
	Box,
	Container,
	Heading,
	Text,
	VStack,
	Button as ChakraButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";

const HomePage = () => {
	const navigate = useNavigate();

	return (
		<Box
			minH="100vh"
			bgGradient="linear(135deg, #E8F0FE 0%, #F8FBFF 50%, #FFF5F5 100%)"
			display="flex"
			alignItems="center"
			justifyContent="center"
			px={4}>
			<Container maxW="container.md">
				<Box
					bg="rgba(255, 255, 255, 0.85)"
					backdropFilter="blur(20px)"
					borderRadius="32px"
					boxShadow="0 8px 32px rgba(22, 31, 112, 0.08), 0 2px 8px rgba(22, 31, 112, 0.04)"
					p={{ base: 8, md: 12 }}
					border="1px solid"
					borderColor="rgba(255, 255, 255, 0.6)"
					textAlign="center">
					<VStack spacing={6}>
						<Heading
							fontSize={{ base: "32px", md: "42px" }}
							fontWeight="700"
							bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
							bgClip="text"
							letterSpacing="tight">
							Chào mừng đến với 5T Mart! 🎉
						</Heading>
						<Text
							fontSize={{ base: "16px", md: "18px" }}
							color="gray.600"
							fontWeight="500">
							Bạn đã đăng nhập thành công!
						</Text>
						<ChakraButton
							colorScheme="brand"
							size="lg"
							borderRadius="18px"
							mt={4}
							fontWeight="600"
							boxShadow="0 4px 14px rgba(22, 31, 112, 0.25)"
							_hover={{
								transform: "translateY(-2px)",
								boxShadow: "0 6px 20px rgba(22, 31, 112, 0.35)",
							}}
							transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
							onClick={() => navigate(ROUTES.LOGIN)}>
							Quay lại trang đăng nhập
						</ChakraButton>
					</VStack>
				</Box>
			</Container>
		</Box>
	);
};

export default HomePage;
