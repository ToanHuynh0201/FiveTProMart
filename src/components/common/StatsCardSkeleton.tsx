/**
 * StatsCardSkeleton Component
 *
 * Skeleton loader that matches the shape of stats cards.
 * Used for inventory stats, dashboard cards, etc.
 *
 * Usage:
 *   <StatsCardSkeleton />
 *   <SimpleGrid columns={4}><StatsCardSkeleton /><StatsCardSkeleton />...</SimpleGrid>
 */
import { Box, VStack, HStack, Skeleton, SkeletonCircle } from "@chakra-ui/react";

interface StatsCardSkeletonProps {
	/** Whether to show the icon placeholder */
	showIcon?: boolean;
}

export const StatsCardSkeleton: React.FC<StatsCardSkeletonProps> = ({
	showIcon = true,
}) => {
	return (
		<Box
			bg="white"
			borderRadius="xl"
			p={4}
			boxShadow="sm"
			borderLeft="4px solid"
			borderLeftColor="gray.200"
			minH="100px">
			<VStack align="start" spacing={3}>
				<HStack spacing={3} width="100%">
					{showIcon && (
						<SkeletonCircle size="40px" />
					)}
					<Skeleton height="14px" width="100px" borderRadius="md" />
				</HStack>
				<Skeleton height="32px" width="80px" borderRadius="md" />
				<Skeleton height="12px" width="60px" borderRadius="md" />
			</VStack>
		</Box>
	);
};

/**
 * StatsGridSkeleton - Grid of 4 stats cards
 * Matches InventoryPage stats layout
 */
export const StatsGridSkeleton: React.FC = () => {
	return (
		<Box
			display="grid"
			gridTemplateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
			gap={5}
			mb={6}>
			<StatsCardSkeleton />
			<StatsCardSkeleton />
			<StatsCardSkeleton />
			<StatsCardSkeleton />
		</Box>
	);
};

export default StatsCardSkeleton;
