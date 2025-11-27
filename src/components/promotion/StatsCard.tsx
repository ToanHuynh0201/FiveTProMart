import { Box, Text, Flex, Icon } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface StatsCardProps {
	title: string;
	value: number | string;
	icon: IconType;
	bgGradient: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
	title,
	value,
	icon,
	bgGradient,
}) => {
	return (
		<Box
			bg="white"
			p={6}
			borderRadius="16px"
			boxShadow="md"
			position="relative"
			overflow="hidden"
			transition="all 0.3s"
			_hover={{
				transform: "translateY(-4px)",
				boxShadow: "xl",
			}}>
			{/* Background gradient circle */}
			<Box
				position="absolute"
				top="-20px"
				right="-20px"
				w="120px"
				h="120px"
				borderRadius="full"
				bgGradient={bgGradient}
				opacity={0.1}
			/>

			<Flex
				justify="space-between"
				align="flex-start">
				<Box flex={1}>
					<Text
						fontSize="14px"
						fontWeight="600"
						color="gray.600"
						mb={2}>
						{title}
					</Text>
					<Text
						fontSize="32px"
						fontWeight="700"
						color="gray.800"
						lineHeight="1.2">
						{value}
					</Text>
				</Box>

				<Flex
					w="56px"
					h="56px"
					borderRadius="14px"
					bgGradient={bgGradient}
					align="center"
					justify="center">
					<Icon
						as={icon}
						boxSize={6}
						color="white"
					/>
				</Flex>
			</Flex>
		</Box>
	);
};
