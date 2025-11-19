import { Box, Flex, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import type { NavItem } from "@/types/layout";

interface SidebarItemProps {
	item: NavItem;
	isActive: boolean;
}

export function SidebarItem({ item, isActive }: SidebarItemProps) {
	return (
		<Box
			as={Link}
			to={item.path}
			position="relative"
			py={3}
			px={0}
			_hover={{
				textDecoration: "none",
			}}>
			<Flex
				align="center"
				gap={3}
				position="relative">
				{/* Label */}
				<Text
					color="white"
					fontSize="24px"
					fontWeight={isActive ? "700" : "400"}
					lineHeight="1.21"
					transition="all 0.2s">
					{item.label}
				</Text>
			</Flex>

			{/* Active Indicator - Underline */}
			{isActive && (
				<Box
					position="absolute"
					bottom={0}
					left={0}
					width="60px"
					height="6px"
					bg="brand.100"
					borderRadius="3px"
					transition="all 0.3s"
				/>
			)}
		</Box>
	);
}
