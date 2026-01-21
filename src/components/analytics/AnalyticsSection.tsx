import { Box, VStack, HStack, Text, Icon, Button, Spinner, Center } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { MdAutoAwesome, MdRefresh, MdCloudOff } from "react-icons/md";
import { analyticsService } from "@/services/analyticsService";
import { MarginAlertsWidget } from "./MarginAlertsWidget";
import { ReorderAlertsWidget } from "./ReorderAlertsWidget";
import { BundleInsightsWidget } from "./BundleInsightsWidget";

/**
 * AnalyticsSection - Smart wrapper for AI analytics widgets
 * Checks service health before rendering. Shows graceful degradation if unavailable.
 * EXTREME QUALITY: Single clean message instead of 3 error widgets
 */
export const AnalyticsSection: React.FC = () => {
	const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
	const [isChecking, setIsChecking] = useState(true);

	const checkHealth = async () => {
		setIsChecking(true);
		try {
			const health = await analyticsService.getHealth();
			setIsHealthy(health.status === "healthy");
		} catch (error) {
			console.warn("Analytics service health check failed:", error);
			setIsHealthy(false);
		} finally {
			setIsChecking(false);
		}
	};

	useEffect(() => {
		checkHealth();
	}, []);

	// Loading state
	if (isChecking) {
		return (
			<Box bg="purple.50" p={8} borderRadius="xl" border="1px solid" borderColor="purple.100">
				<Center>
					<VStack spacing={3}>
						<Spinner size="lg" color="brand.500" thickness="3px" />
						<Text color="gray.600" fontSize="sm">
							Đang kiểm tra dịch vụ AI...
						</Text>
					</VStack>
				</Center>
			</Box>
		);
	}

	// Service unavailable - GRACEFUL DEGRADATION
	if (isHealthy === false) {
		return (
			<Box bg="gray.50" p={8} borderRadius="xl" border="1px dashed" borderColor="gray.300">
				<VStack spacing={4}>
					<Icon as={MdCloudOff} boxSize={12} color="gray.400" />
					<VStack spacing={2}>
						<Text fontWeight="semibold" color="gray.700" fontSize="lg">
							Phân tích AI tạm thời không khả dụng
						</Text>
						<Text color="gray.500" textAlign="center" fontSize="sm">
							Dịch vụ AI đang bảo trì hoặc chưa khởi động.
							<br />
							Các tính năng cơ bản vẫn hoạt động bình thường.
						</Text>
					</VStack>
					<Button
						size="sm"
						leftIcon={<MdRefresh />}
						onClick={checkHealth}
						colorScheme="brand"
						variant="outline"
					>
						Thử lại
					</Button>
				</VStack>
			</Box>
		);
	}

	// Service healthy - SHOW WIDGETS
	return (
		<VStack spacing={6} align="stretch">
			{/* Header */}
			<HStack spacing={2}>
				<Icon as={MdAutoAwesome} boxSize={6} color="brand.500" />
				<Text fontWeight="semibold" fontSize="xl" color="gray.700">
					Phân tích AI
				</Text>
				<Box
					px={2}
					py={0.5}
					bg="green.100"
					borderRadius="full"
					ml={2}
				>
					<Text fontSize="xs" fontWeight="medium" color="green.700">
						Hoạt động
					</Text>
				</Box>
			</HStack>

			{/* Widgets Grid */}
			<Box
				display="grid"
				gridTemplateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }}
				gap={6}
			>
				<MarginAlertsWidget maxAlerts={4} />
				<ReorderAlertsWidget maxAlerts={4} />
				<BundleInsightsWidget />
			</Box>
		</VStack>
	);
};

export default AnalyticsSection;
