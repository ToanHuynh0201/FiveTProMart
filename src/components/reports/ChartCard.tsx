import { Box, Flex, Text, IconButton } from "@chakra-ui/react";
import { FiMaximize2 } from "react-icons/fi";
import type { ReactNode } from "react";

interface ChartCardProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
	onExpand?: () => void;
	actions?: ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({
	title,
	subtitle,
	children,
	onExpand,
	actions,
}) => {
	return (
		<Box
			bg="white"
			borderRadius="16px"
			boxShadow="sm"
			border="1px solid"
			borderColor="gray.100"
			p={{ base: 4, md: 6 }}
			transition="all 0.3s"
			_hover={{
				boxShadow: "md",
			}}>
			<Flex
				justify="space-between"
				align="center"
				mb={4}
				direction={{ base: "column", sm: "row" }}
				gap={{ base: 2, sm: 0 }}>
				<Box w="full">
					<Text
						fontSize={{ base: "16px", md: "18px" }}
						fontWeight="700"
						color="gray.800">
						{title}
					</Text>
					{subtitle && (
						<Text
							fontSize={{ base: "13px", md: "14px" }}
							color="gray.500"
							mt={1}>
							{subtitle}
						</Text>
					)}
				</Box>
				<Flex
					gap={2}
					w={{ base: "full", sm: "auto" }}
					justify={{ base: "flex-end", sm: "flex-start" }}>
					{actions}
					{onExpand && (
						<IconButton
							aria-label="Expand chart"
							icon={<FiMaximize2 />}
							size="sm"
							variant="ghost"
							onClick={onExpand}
						/>
					)}
				</Flex>
			</Flex>
			<Box>{children}</Box>
		</Box>
	);
};
