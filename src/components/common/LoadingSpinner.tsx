import { Box, Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { animationPresets } from "../../styles/animation";

interface LoadingSpinnerProps {
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	message?: string;
	minHeight?: string;
	variant?: "default" | "primary" | "success" | "warning" | "error";
}

export default function LoadingSpinner({
	size = "xl",
	message = "Đang tải...",
	minHeight = "200px",
	variant = "default",
}: LoadingSpinnerProps) {
	const getSpinnerColor = () => {
		switch (variant) {
			case "primary":
				return "brand.500";
			case "success":
				return "success.500";
			case "warning":
				return "orange.500";
			case "error":
				return "error.500";
			default:
				return "brand.500";
		}
	};

	const getGlowColor = () => {
		switch (variant) {
			case "primary":
				return "rgba(22, 31, 112, 0.15)";
			case "success":
				return "rgba(0, 151, 129, 0.15)";
			case "warning":
				return "rgba(237, 137, 54, 0.15)";
			case "error":
				return "rgba(201, 0, 3, 0.15)";
			default:
				return "rgba(22, 31, 112, 0.15)";
		}
	};

	return (
		<Center
			minH={minHeight}
			bgGradient="linear(135deg, #E8F0FE 0%, #F8FBFF 50%, #FFF5F5 100%)"
			animation={animationPresets.fadeIn}
			position="relative">
			{/* Decorative circles */}
			<Box
				position="absolute"
				top="20%"
				left="15%"
				w="100px"
				h="100px"
				borderRadius="full"
				bg="rgba(211, 229, 255, 0.3)"
				filter="blur(40px)"
				animation={animationPresets.float}
			/>
			<Box
				position="absolute"
				bottom="25%"
				right="20%"
				w="120px"
				h="120px"
				borderRadius="full"
				bg="rgba(255, 245, 245, 0.4)"
				filter="blur(50px)"
				animation={`${animationPresets.float} 4s ease-in-out infinite`}
			/>

			<VStack
				spacing={6}
				textAlign="center"
				position="relative"
				zIndex={1}>
				{/* Spinner container with glass effect */}
				<Box
					position="relative"
					display="inline-flex"
					alignItems="center"
					justifyContent="center">
					{/* Glow effect */}
					<Box
						position="absolute"
						w="140px"
						h="140px"
						borderRadius="full"
						bg={getGlowColor()}
						filter="blur(30px)"
						animation={animationPresets.pulse}
					/>

					{/* Glass container */}
					<Box
						position="relative"
						p={8}
						bg="rgba(255, 255, 255, 0.7)"
						backdropFilter="blur(20px)"
						borderRadius="full"
						border="1px solid"
						borderColor="rgba(255, 255, 255, 0.8)"
						boxShadow={`0 8px 32px ${getGlowColor()}, 0 2px 8px rgba(22, 31, 112, 0.05)`}>
						<Spinner
							size={size}
							thickness="3px"
							speed="0.8s"
							color={getSpinnerColor()}
							emptyColor="rgba(22, 31, 112, 0.1)"
						/>
					</Box>
				</Box>

				{/* Loading message */}
				{message && (
					<VStack spacing={2}>
						<Text
							fontSize={{ base: "16px", md: "18px" }}
							fontWeight="600"
							bgGradient={`linear(135deg, ${getSpinnerColor()} 0%, ${getSpinnerColor()} 100%)`}
							bgClip="text"
							letterSpacing="tight">
							{message}
						</Text>
						{/* Loading dots animation */}
						<Box
							display="flex"
							gap={1.5}
							justifyContent="center">
							{[0, 1, 2].map((i) => (
								<Box
									key={i}
									w="6px"
									h="6px"
									borderRadius="full"
									bg={getSpinnerColor()}
									opacity={0.6}
									animation={`${animationPresets.pulse} 1.5s ease-in-out infinite`}
									style={{
										animationDelay: `${i * 0.2}s`,
									}}
								/>
							))}
						</Box>
					</VStack>
				)}
			</VStack>
		</Center>
	);
}
