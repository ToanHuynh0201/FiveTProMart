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
} from "@chakra-ui/react";
import { MdTrendingUp, MdTrendingDown, MdWarning, MdAttachMoney, MdRefresh, MdChevronRight } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsService } from "@/services/analyticsService";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import type { MarginInsightResponse, MarginAlert } from "@/types/analytics";

interface MarginWidgetProps {
	maxAlerts?: number;
}

/**
 * MarginAlertsWidget - Shows products with margins below target
 * FIXED: Uses correct Python schema (marginPercent, type, suggestion, CRITICAL severity)
 * FIXED: Clickable cards navigate to product
 * FIXED: Retry button on error
 */
export const MarginAlertsWidget: React.FC<MarginWidgetProps> = ({ maxAlerts = 5 }) => {
	const [data, setData] = useState<MarginInsightResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const insights = await analyticsService.getMarginInsights();
			setData(insights);
			setError(null);
			setLastUpdated(new Date());
		} catch (err) {
			console.error("Error fetching margin insights:", err);
			setError("Không thể tải dữ liệu biên lợi nhuận");
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

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "CRITICAL":
				return "red";
			case "HIGH":
				return "orange";
			case "MEDIUM":
				return "yellow";
			case "LOW":
				return "blue";
			default:
				return "gray";
		}
	};

	const handleAlertClick = (productId: string) => {
		navigate(`/inventory?product=${productId}`);
	};

	if (isLoading) {
		return (
			<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
				<VStack spacing={4} align="stretch">
					<HStack justify="space-between">
						<Skeleton height="20px" width="50%" />
						<Skeleton height="20px" width="80px" />
					</HStack>
					<Divider />
					{[1, 2, 3].map((i) => (
						<Box key={i} p={3} borderRadius="md" bg="gray.50">
							<HStack justify="space-between" mb={2}>
								<Skeleton height="16px" width="60%" />
								<Skeleton height="20px" width="60px" />
							</HStack>
							<SkeletonText noOfLines={1} />
						</Box>
					))}
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

	if (!data || data.dataQuality === "INSUFFICIENT") {
		return (
			<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
				<VStack spacing={3} align="center" py={4}>
					<Icon as={MdAttachMoney} boxSize={10} color="gray.300" />
					<Text color="gray.500" textAlign="center">
						Chưa đủ dữ liệu để phân tích biên lợi nhuận
					</Text>
					<Text fontSize="sm" color="gray.400">
						Cần thêm dữ liệu sản phẩm và doanh số
					</Text>
				</VStack>
			</Box>
		);
	}

	const alerts = data.alerts.slice(0, maxAlerts);

	return (
		<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
			<VStack spacing={4} align="stretch">
				{/* Header */}
				<HStack justify="space-between">
					<HStack spacing={2}>
						<Icon as={MdAttachMoney} boxSize={5} color="brand.500" />
						<Text fontWeight="semibold" color="gray.700">
							Cảnh báo biên lợi nhuận
						</Text>
					</HStack>
					{data.summary && (
						<Badge colorScheme="blue" variant="subtle">
							{data.summary.thinMargins + data.summary.negativeMargins} vấn đề
						</Badge>
					)}
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

				{/* Alert List */}
				{alerts.length === 0 ? (
					<VStack py={4}>
						<Icon as={MdTrendingUp} boxSize={8} color="green.400" />
						<Text color="green.600" fontWeight="medium">
							Tất cả sản phẩm đều có biên lợi nhuận tốt!
						</Text>
					</VStack>
				) : (
					<VStack spacing={3} align="stretch">
						{alerts.map((alert: MarginAlert, index: number) => (
							<Box
								key={alert.productId}
								p={3}
								borderRadius="md"
								bg="gray.50"
								borderLeft="3px solid"
								borderLeftColor={`${getSeverityColor(alert.severity)}.400`}
								cursor="pointer"
								transition="all 0.2s"
								opacity={0}
								animation={`fadeIn 0.3s ease-out ${index * 0.1}s forwards`}
								_hover={{
									bg: "gray.100",
									transform: "translateX(4px)",
									boxShadow: "md"
								}}
								onClick={() => handleAlertClick(alert.productId)}
								sx={{
									"@keyframes fadeIn": {
										from: { opacity: 0, transform: "translateY(-10px)" },
										to: { opacity: 1, transform: "translateY(0)" },
									},
								}}
							>
								<HStack justify="space-between" mb={1}>
									<HStack spacing={2} flex={1}>
										<Text fontWeight="medium" fontSize="sm" noOfLines={1}>
											{alert.productName}
										</Text>
										<Icon as={MdChevronRight} boxSize={4} color="gray.400" />
									</HStack>
									<Badge
										colorScheme={getSeverityColor(alert.severity)}
										size="sm"
									>
										{alert.severity === "CRITICAL" ? "Khẩn" : 
										 alert.severity === "HIGH" ? "Cao" : 
										 alert.severity === "MEDIUM" ? "TB" : "Thấp"}
									</Badge>
								</HStack>
								
								<HStack spacing={4} fontSize="xs" color="gray.600" mb={1}>
									{alert.marginPercent !== undefined && (
										<HStack>
											<Icon
												as={alert.marginPercent < 0 ? MdTrendingDown : MdTrendingUp}
												color={alert.marginPercent < 0 ? "red.500" : "orange.500"}
											/>
											<Text>
												Biên: {alert.marginPercent.toFixed(1)}%
											</Text>
										</HStack>
									)}
									{alert.currentPrice && (
										<Text>
											Giá: {new Intl.NumberFormat("vi-VN").format(alert.currentPrice)}đ
										</Text>
									)}
									{alert.daysRemaining !== undefined && alert.daysRemaining !== null && (
										<Text color={alert.daysRemaining < 7 ? "red.600" : "gray.600"}>
											{alert.daysRemaining} ngày
										</Text>
									)}
								</HStack>
								
								<Text fontSize="xs" color="gray.500" fontStyle="italic">
									💡 {alert.suggestion}
								</Text>
							</Box>
						))}
					</VStack>
				)}

				{/* Summary Footer */}
				{data.summary && data.summary.totalPotentialWasteValue > 0 && (
					<Box bg="red.50" p={3} borderRadius="md">
						<HStack>
							<Icon as={MdWarning} color="red.500" />
							<Text fontSize="sm" color="red.700">
								Giá trị có rủi ro:{" "}
								<Text as="span" fontWeight="bold">
									{new Intl.NumberFormat("vi-VN").format(data.summary.totalPotentialWasteValue)}đ
								</Text>
							</Text>
						</HStack>
					</Box>
				)}
			</VStack>
		</Box>
	);
};

export default MarginAlertsWidget;
