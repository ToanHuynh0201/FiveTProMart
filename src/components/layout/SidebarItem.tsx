import { Box, Flex, Text, Icon, Tooltip } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { NavItem } from "@/types/layout";

interface SidebarItemProps {
	item: NavItem;
	isActive: boolean;
	isCollapsed: boolean;
}

export function SidebarItem({ item, isActive, isCollapsed }: SidebarItemProps) {
	const content = (
		<Box
			as={Link}
			to={item.path}
			position="relative"
			py={isCollapsed ? 2 : 3}
			px={isCollapsed ? 2 : 3}
			borderRadius="lg"
			bg={isActive ? "rgba(255, 255, 255, 0.15)" : "transparent"}
			_hover={{
				textDecoration: "none",
				bg: isActive
					? "rgba(255, 255, 255, 0.2)"
					: "rgba(255, 255, 255, 0.1)",
				transform: "translateX(4px)",
			}}
			transition="all 0.2s"
			cursor="pointer">
			<Flex
				align="center"
				gap={3}
				justify={isCollapsed ? "center" : "flex-start"}
				position="relative">
				{/* Icon */}
				{item.icon && (
					<Icon
						as={item.icon}
						boxSize={isCollapsed ? 6 : 5}
						color={isActive ? "brand.100" : "white"}
						transition="all 0.2s"
					/>
				)}

				{/* Label */}
				{!isCollapsed && (
					<Text
						color={isActive ? "white" : "whiteAlpha.900"}
						fontSize="18px"
						fontWeight={isActive ? "700" : "500"}
						lineHeight="1.21"
						transition="all 0.2s"
						whiteSpace="nowrap">
						{item.label}
					</Text>
				)}
			</Flex>

			{/* Active Indicator - Left Border */}
			{isActive && !isCollapsed && (
				<Box
					position="absolute"
					left={0}
					top="50%"
					transform="translateY(-50%)"
					width="4px"
					height="60%"
					bg="brand.100"
					borderRadius="0 4px 4px 0"
					transition="all 0.3s"
				/>
			)}

			{/* Active Indicator Dot for Collapsed */}
			{isActive && isCollapsed && (
				<Box
					position="absolute"
					bottom="2px"
					left="50%"
					transform="translateX(-50%)"
					width="4px"
					height="4px"
					bg="brand.100"
					borderRadius="full"
					transition="all 0.3s"
				/>
			)}
		</Box>
	);

	if (isCollapsed) {
		return (
			<Tooltip
				label={item.label}
				placement="right"
				hasArrow>
				{content}
			</Tooltip>
		);
	}

	return content;
}
