import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: IconType;
	color: string;
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
			boxShadow="sm"
			border="1px solid"
			borderColor="gray.100"
			transition="all 0.3s"
			_hover={{
				transform: "translateY(-4px)",
				boxShadow: "lg",
			}}>
			<Flex
				justify="space-between"
				align="flex-start"
				mb={3}>
				<Box>
					<Text
						fontSize="14px"
						fontWeight="500"
						color="gray.600"
						mb={2}>
						{title}
					</Text>
					<Text
						fontSize="28px"
						fontWeight="700"
						color="gray.800">
						{value}
					</Text>
				</Box>
				<Flex
					w="50px"
					h="50px"
					borderRadius="12px"
					bgGradient={bgGradient}
					align="center"
					justify="center">
					<Icon
						as={icon}
						w={6}
						h={6}
						color="white"
					/>
				</Flex>
			</Flex>
		</Box>
	);
};
