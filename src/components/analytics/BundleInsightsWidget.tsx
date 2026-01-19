import {
	Box,
	VStack,
	HStack,
	Text,
	Badge,
	Icon,
	Skeleton,
	SkeletonText,
	Alert,
	AlertIcon,
	Button,
	Divider,
	CircularProgress,
	CircularProgressLabel,
} from "@chakra-ui/react";
import { MdBubbleChart, MdAutoAwesome, MdDataUsage, MdRefresh } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import { analyticsService } from "@/services/analyticsService";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import type { BundleInsightResponse, BundleDataStatus, AssociationRule } from "@/types/analytics";

/**
 * BundleInsightsWidget - Shows product association patterns
 * FIXED: Uses correct Python schema (dataQuality, readyForAnalysis, etc.)
 */
export const BundleInsightsWidget: React.FC = () => {
	const [data, setData] = useState<BundleInsightResponse | null>(null);
	const [dataStatus, setDataStatus] = useState<BundleDataStatus | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

	const fetchData = useCallback(async () => {
const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			// First check data status
			const status = await analyticsService.getBundleDataStatus();
			setDataStatus(status);

			// Only fetch full insights if ready
			if (status.readyForAnalysis) {
				const insights = await analyticsService.getBundleInsights();
				setData(insights);
			}
			setError(null);
			setLastUpdated(new Date());
		} catch (err) {
			console.error("Error fetching bundle insights:", err);
			setError("Không thể tải phân tích gói sản phẩm");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Auto-refresh every 5 minutes
	useAutoRefresh({
		onRefresh: fetchData,
		intervalMs: 5 * 60 * 1000,
		enabled: !isLoading && !error,
	});

	const formatConfidence = (confidence: number) => {
		return `${(confidence * 100).toFixed(0)}%`;
	};

	if (isLoading) {
		return (
			<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
				<VStack spacing={4} align="stretch">
					<HStack justify="space-between">
						<Skeleton height="20px" width="50%" />
						<Skeleton height="20px" width="60px" />
					</HStack>
					<Divider />
					<Box p={3} borderRadius="md" bg="gray.50">
						<Skeleton height="20px" width="40%" mb={2} />
						<SkeletonText noOfLines={2} />
					</Box>
					<Box p={3} borderRadius="md" bg="gray.50">
						<Skeleton height="20px" width="40%" mb={2} />
						<SkeletonText noOfLines={2} />
					</Box>
				</VStack>
			</Box>
		);
	}

	if (error) {
		return (
			<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
				<Alert status="warning" borderRadius="md" mb={3}>
					<AlertIcon />
					{error}
				</Alert>
				<Button
					size="sm"
					leftIcon={<MdRefresh />}
					onClick={fetchData}
					colorScheme="brand"
					variant="outline"
					width="full"
				>
					Thử lại
				</Button>
			</Box>
		);
	}

	// Show data collection status if not ready
	if (dataStatus && !dataStatus.readyForAnalysis) {
		const progress = dataStatus.progressPercent;

		return (
			<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
				<VStack spacing={4} align="stretch">
					<HStack spacing={2}>
						<Icon as={MdBubbleChart} boxSize={5} color="brand.500" />
						<Text fontWeight="semibold" color="gray.700">
							Phân tích gói sản phẩm
						</Text>
					</HStack>

					{lastUpdated && (
						<Text 
							fontSize="xs" 
							color="gray.400"
							_before={{
								content: '""',
								display: "inline-block",
								width: "6px",
								height: "6px",
								borderRadius: "full",
								bg: "green.500",
								marginRight: "6px",
								animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
							}}
						>
							Cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN")}
						</Text>
					)}

					<Divider />

					<VStack spacing={4} py={4}>
						<CircularProgress
							value={progress}
							size="100px"
							thickness="8px"
							color="brand.500"
						>
							<CircularProgressLabel fontSize="lg" fontWeight="bold">
								{progress.toFixed(0)}%
							</CircularProgressLabel>
						</CircularProgress>

						<VStack spacing={1}>
							<Text fontWeight="medium" color="gray.700">
								Đang thu thập dữ liệu
							</Text>
							<Text fontSize="sm" color="gray.500" textAlign="center">
								{dataStatus.multiItemOrders} / {dataStatus.requiredOrders} đơn nhiều SP
							</Text>
							<Text fontSize="xs" color="gray.400" textAlign="center">
								Cần thêm đơn hàng để phân tích xu hướng mua chung
							</Text>
						</VStack>
					</VStack>
				</VStack>
			</Box>
		);
	}

	// Show insights if we have enough data
	if (!data || data.rules.length === 0) {
		return (
			<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
				<VStack spacing={3} align="center" py={4}>
					<Icon as={MdDataUsage} boxSize={10} color="gray.300" />
					<Text color="gray.500" textAlign="center">
						Chưa phát hiện xu hướng mua chung
					</Text>
				</VStack>
			</Box>
		);
	}

	const topRules = data.rules.slice(0, 3);

	return (
		<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
			<VStack spacing={4} align="stretch">
				{/* Header */}
				<HStack justify="space-between">
					<HStack spacing={2}>
						<Icon as={MdBubbleChart} boxSize={5} color="brand.500" />
						<Text fontWeight="semibold" color="gray.700">
							Sản phẩm hay mua chung
						</Text>
					</HStack>
					<Badge colorScheme="purple" variant="subtle">
						<HStack spacing={1}>
							<Icon as={MdAutoAwesome} boxSize={3} />
							<Text>AI</Text>
						</HStack>
					</Badge>
				</HStack>

				{lastUpdated && (
					<Text fontSize="xs" color="gray.400">
						Cập nhật lúc {lastUpdated.toLocaleTimeString("vi-VN")}
					</Text>
				)}

				<Divider />

				{/* Association Rules */}
				<VStack spacing={3} align="stretch">
					{topRules.map((rule: AssociationRule, index: number) => (
						<Box
							key={index}
							p={3}
							borderRadius="md"
							bg="purple.50"
							border="1px solid"
							borderColor="purple.100"
							opacity={0}
							animation={`fadeIn 0.3s ease-out ${index * 0.1}s forwards`}
							sx={{
								"@keyframes fadeIn": {
									from: { opacity: 0, transform: "translateY(-10px)" },
									to: { opacity: 1, transform: "translateY(0)" },
								},
							}}
						>
							<HStack justify="space-between" mb={2}>
								<Badge colorScheme="purple" variant="solid" fontSize="xs">
									{formatConfidence(rule.confidence)} khả năng
								</Badge>
								<Text fontSize="xs" color="gray.500">
									Lift: {rule.lift.toFixed(2)}x
								</Text>
							</HStack>
							<Text fontSize="sm">
								Khách mua{" "}
								<Text as="span" fontWeight="bold" color="purple.700">
									{rule.antecedent.join(", ")}
								</Text>{" "}
								thường mua thêm{" "}
								<Text as="span" fontWeight="bold" color="purple.700">
									{rule.consequent.join(", ")}
								</Text>
							</Text>
						</Box>
					))}
				</VStack>

				{/* Summary */}
				<Box bg="gray.50" p={3} borderRadius="md">
					<HStack spacing={4} fontSize="xs" color="gray.600" justify="center">
						<Text>
							Phân tích: <strong>{data.totalOrdersAnalyzed}</strong> đơn
						</Text>
						<Text>
							<strong>{data.totalPairsFound}</strong> cặp SP
						</Text>
					</HStack>
				</Box>
			</VStack>
		</Box>
	);
};

export default BundleInsightsWidget;
