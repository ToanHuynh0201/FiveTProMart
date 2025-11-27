import {
	Box,
	Flex,
	Icon,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	StatArrow,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface MetricCardProps {
	title: string;
	value: string | number;
	icon: IconType;
	bgGradient: string;
	growth?: number;
	prefix?: string;
	suffix?: string;
	onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	icon,
	bgGradient,
	growth,
	prefix = "",
	suffix = "",
	onClick,
}) => {
	const isClickable = !!onClick;

	return (
		<Box
			bg="white"
			p={{ base: 4, md: 6 }}
			borderRadius="16px"
			boxShadow="sm"
			border="1px solid"
			borderColor="gray.100"
			transition="all 0.3s"
			cursor={isClickable ? "pointer" : "default"}
			_hover={
				isClickable
					? {
							transform: "translateY(-4px)",
							boxShadow: "lg",
							borderColor: "brand.200",
					  }
					: {
							transform: "translateY(-2px)",
							boxShadow: "md",
					  }
			}
			onClick={onClick}>
			<Flex
				justify="space-between"
				align="flex-start">
				<Stat>
					<StatLabel
						fontSize={{ base: "13px", md: "14px" }}
						fontWeight="500"
						color="gray.600"
						mb={2}>
						{title}
					</StatLabel>
					<StatNumber
						fontSize={{ base: "24px", md: "28px" }}
						fontWeight="700"
						color="gray.800">
						{prefix}
						{value}
						{suffix}
					</StatNumber>
					{growth !== undefined && (
						<StatHelpText
							mb={0}
							mt={2}>
							<StatArrow
								type={growth >= 0 ? "increase" : "decrease"}
							/>
							{Math.abs(growth).toFixed(1)}%
						</StatHelpText>
					)}
				</Stat>
				<Flex
					w={{ base: "44px", md: "50px" }}
					h={{ base: "44px", md: "50px" }}
					borderRadius="12px"
					bgGradient={bgGradient}
					align="center"
					justify="center"
					flexShrink={0}>
					<Icon
						as={icon}
						w={{ base: 5, md: 6 }}
						h={{ base: 5, md: 6 }}
						color="white"
					/>
				</Flex>
			</Flex>
		</Box>
	);
};
