import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import type { IconType } from "react-icons";

/** Severity level for visual styling */
export type StatsSeverity = "normal" | "warning" | "critical";

interface StatsCardProps {
	title: string;
	value: string | number;
	icon: IconType;
	color: string;
	bgGradient: string;
	onClick?: () => void;
	/** Severity level - affects border color and animations */
	severity?: StatsSeverity;
}

// Pulse animation for critical alerts
const pulseAnimation = keyframes`
	0% {
		box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.4);
	}
	70% {
		box-shadow: 0 0 0 8px rgba(229, 62, 62, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
	}
`;

// Subtle glow for warning
const warningGlow = keyframes`
	0%, 100% {
		border-color: #ED8936;
	}
	50% {
		border-color: #F6AD55;
	}
`;

export const StatsCard: React.FC<StatsCardProps> = ({
	title,
	value,
	icon,
	bgGradient,
	onClick,
	severity = "normal",
}) => {
	// Only show severity styling when value > 0
	const showSeverityStyle = typeof value === "number" ? value > 0 : value !== "0";
	const effectiveSeverity = showSeverityStyle ? severity : "normal";

	const getSeverityStyles = () => {
		switch (effectiveSeverity) {
			case "critical":
				return {
					borderColor: "red.400",
					borderWidth: "2px",
					bg: "red.50",
					animation: `${pulseAnimation} 2s infinite`,
				};
			case "warning":
				return {
					borderColor: "orange.300",
					borderWidth: "2px",
					bg: "orange.50",
					animation: `${warningGlow} 2s ease-in-out infinite`,
				};
			default:
				return {
					borderColor: "gray.100",
					borderWidth: "1px",
					bg: "white",
					animation: undefined,
				};
		}
	};

	const severityStyles = getSeverityStyles();

	return (
		<Box
			bg={severityStyles.bg}
			p={6}
			borderRadius="16px"
			boxShadow="sm"
			border={`${severityStyles.borderWidth} solid`}
			borderColor={severityStyles.borderColor}
			transition="all 0.3s"
			cursor={onClick ? "pointer" : "default"}
			onClick={onClick}
			animation={severityStyles.animation}
			_hover={{
				transform: "translateY(-4px)",
				boxShadow: "lg",
				bg: onClick ? (effectiveSeverity === "normal" ? "gray.50" : severityStyles.bg) : severityStyles.bg,
			}}>
			<Flex
				justify="space-between"
				align="flex-start"
				mb={3}>
				<Box>
					<Text
						fontSize="14px"
						fontWeight="500"
						color={effectiveSeverity === "critical" ? "red.600" : effectiveSeverity === "warning" ? "orange.600" : "gray.600"}
						mb={2}>
						{title}
					</Text>
					<Text
						fontSize="28px"
						fontWeight="700"
						color={effectiveSeverity === "critical" ? "red.700" : effectiveSeverity === "warning" ? "orange.700" : "gray.800"}>
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
