import {
	HStack,
	Text,
	Icon,
	Tooltip,
	Badge,
	Spinner,
} from "@chakra-ui/react";
import { MdAutoAwesome, MdCloudOff, MdCheckCircle } from "react-icons/md";
import { useState, useEffect } from "react";
import { analyticsService } from "@/services/analyticsService";

/**
 * AnalyticsStatusBadge - Shows AI analytics service status
 * Compact indicator for headers/nav bars
 */
export const AnalyticsStatusBadge: React.FC = () => {
	const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const checkStatus = async () => {
			setIsLoading(true);
			try {
				const available = await analyticsService.isAvailable();
				setIsAvailable(available);
			} catch {
				setIsAvailable(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkStatus();

		// Re-check every 30 seconds
		const interval = setInterval(checkStatus, 30000);
		return () => clearInterval(interval);
	}, []);

	if (isLoading) {
		return (
			<Tooltip label="Đang kiểm tra AI Analytics...">
				<Badge colorScheme="gray" variant="subtle">
					<HStack spacing={1}>
						<Spinner size="xs" />
						<Text>AI</Text>
					</HStack>
				</Badge>
			</Tooltip>
		);
	}

	if (isAvailable) {
		return (
			<Tooltip label="AI Analytics đang hoạt động">
				<Badge colorScheme="green" variant="subtle">
					<HStack spacing={1}>
						<Icon as={MdCheckCircle} boxSize={3} />
						<Text>AI</Text>
					</HStack>
				</Badge>
			</Tooltip>
		);
	}

	return (
		<Tooltip label="AI Analytics không khả dụng">
			<Badge colorScheme="gray" variant="outline">
				<HStack spacing={1}>
					<Icon as={MdCloudOff} boxSize={3} />
					<Text>AI</Text>
				</HStack>
			</Badge>
		</Tooltip>
	);
};

/**
 * AnalyticsBanner - Promotional banner for AI features
 * Shows in dashboard when AI is available
 */
export const AnalyticsBanner: React.FC = () => {
	const [isAvailable, setIsAvailable] = useState(false);

	useEffect(() => {
		const checkStatus = async () => {
			try {
				const available = await analyticsService.isAvailable();
				setIsAvailable(available);
			} catch {
				setIsAvailable(false);
			}
		};
		checkStatus();
	}, []);

	if (!isAvailable) return null;

	return (
		<HStack
			bg="brand.500"
			color="white"
			px={4}
			py={2}
			borderRadius="lg"
			spacing={2}
		>
			<Icon as={MdAutoAwesome} boxSize={5} />
			<Text fontSize="sm" fontWeight="medium">
				Phân tích AI đang hoạt động - Xem thông tin thông minh bên dưới
			</Text>
		</HStack>
	);
};

export default AnalyticsStatusBadge;
