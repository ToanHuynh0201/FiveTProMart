import { useState } from "react";
import type { FormEvent } from "react";
import { Box, Container, VStack, Heading, Text, Link } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { LoadingSpinner } from "../components/common";
import { PersonIcon, LockIcon } from "../components/icons/AuthIcons";
import { ROUTES } from "../constants";

export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		// Mô phỏng loading delay
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// TODO: Handle login logic
		console.log({ username, password });

		// Navigate to home page
		navigate(ROUTES.DASHBOARD);
		setIsLoading(false);
	};

	// Hiển thị LoadingSpinner khi đang loading
	if (isLoading) {
		return (
			<LoadingSpinner
				size="xl"
				message="Đang đăng nhập..."
				minHeight="100vh"
				variant="primary"
			/>
		);
	}

	return (
		<Box
			h="100vh"
			w="100vw"
			display="flex"
			alignItems="center"
			justifyContent="center"
			bgGradient="linear(135deg, #E8F0FE 0%, #F8FBFF 50%, #FFF5F5 100%)"
			position="fixed"
			top={0}
			left={0}
			overflow="hidden"
			px={4}>
			<Container
				maxW={{ base: "100%", md: "480px", lg: "520px" }}
				py={{ base: 2, md: 3 }}
				maxH="100vh"
				overflow="hidden">
				<Box
					bg="rgba(255, 255, 255, 0.85)"
					backdropFilter="blur(20px)"
					borderRadius={{ base: "24px", md: "32px" }}
					boxShadow="0 8px 32px rgba(22, 31, 112, 0.08), 0 2px 8px rgba(22, 31, 112, 0.04)"
					p={{ base: 6, sm: 8, md: 10 }}
					border="1px solid"
					borderColor="rgba(255, 255, 255, 0.6)"
					transition="all 0.3s ease"
					_hover={{
						boxShadow:
							"0 12px 48px rgba(22, 31, 112, 0.12), 0 4px 12px rgba(22, 31, 112, 0.06)",
					}}>
					<VStack
						spacing={{ base: 4, sm: 5, md: 6 }}
						align="stretch">
						{/* Logo Section */}
						<VStack spacing={{ base: 2, md: 3 }}>
							<Box
								w={{ base: "80px", sm: "90px", md: "100px" }}
								h={{ base: "66px", sm: "75px", md: "83px" }}
								bgGradient="linear(135deg, brand.50 0%, #FFFFFF 100%)"
								borderRadius="xl"
								display="flex"
								alignItems="center"
								justifyContent="center"
								mx="auto"
								boxShadow="0 4px 16px rgba(22, 31, 112, 0.1)"
								border="2px solid"
								borderColor="rgba(22, 31, 112, 0.08)"
								transition="all 0.3s ease"
								_hover={{
									transform: "translateY(-2px)",
									boxShadow:
										"0 6px 24px rgba(22, 31, 112, 0.15)",
								}}>
								{/* Placeholder for logo image */}
								<Text
									fontSize={{
										base: "24px",
										sm: "28px",
										md: "32px",
									}}
									fontWeight="900"
									bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
									bgClip="text"
									lineHeight="1">
									5T
								</Text>
							</Box>
							<Text
								fontSize={{
									base: "22px",
									sm: "26px",
									md: "30px",
								}}
								fontWeight="800"
								bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
								bgClip="text"
								fontFamily="'Kimberley', 'Inter', sans-serif"
								textAlign="center"
								lineHeight="1.2"
								letterSpacing="tight">
								5T Mart
							</Text>
						</VStack>

						{/* Title */}
						<Heading
							fontSize={{
								base: "26px",
								sm: "30px",
								md: "34px",
								lg: "38px",
							}}
							fontWeight="700"
							color="brand.500"
							textAlign="center"
							lineHeight="1.2"
							mt={{ base: 1, md: 2 }}
							mb={{ base: 1, md: 2 }}>
							Đăng nhập
						</Heading>

						{/* Login Form */}
						<form onSubmit={handleSubmit}>
							<VStack
								spacing={{ base: 4, md: 5 }}
								align="stretch">
								{/* Username Input */}
								<Input
									label="Tên đăng nhập"
									placeholder="abc123"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value)
									}
									leftIcon={<PersonIcon />}
									required
								/>

								{/* Password Input */}
								<Box position="relative">
									<Input
										label="Mật khẩu"
										type="password"
										placeholder="••••••"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										leftIcon={<LockIcon />}
										showPasswordToggle
										required
									/>
								</Box>

								{/* Login Button */}
								<Button
									type="submit"
									variant="primary"
									size="xl"
									fullWidth
									style={{ marginTop: "12px" }}>
									Đăng nhập
								</Button>

								{/* Forgot Password Link */}
								<Link
									href="#"
									color="brand.400"
									fontSize={{ base: "14px", md: "15px" }}
									fontWeight="500"
									textAlign="center"
									_hover={{
										color: "brand.500",
										textDecoration: "underline",
									}}
									transition="all 0.2s ease"
									onClick={(e) => {
										e.preventDefault();
										// TODO: Handle forgot password
										console.log("Forgot password clicked");
									}}>
									Quên mật khẩu?
								</Link>
							</VStack>
						</form>
					</VStack>
				</Box>
			</Container>
		</Box>
	);
}
