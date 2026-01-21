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
import { MdInventory, MdWarning, MdError, MdInfo, MdShoppingCart, MdRefresh, MdChevronRight } from "react-icons/md";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { analyticsService } from "@/services/analyticsService";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import type { ReorderAlert } from "@/types/analytics";

interface ReorderWidgetProps {
	maxAlerts?: number;
}

/**
 * ReorderAlertsWidget - Shows products that need restocking
 * FIXED: Uses correct Python schema (urgency: CRITICAL not critical)
 * FIXED: Removed reorderPoint field that doesn't exist
 * FIXED: Clickable cards navigate to product
 */
export const ReorderAlertsWidget: React.FC<ReorderWidgetProps> = ({ maxAlerts = 5 }) => {
	const [data, setData] = useState<ReorderAlert[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const navigate = useNavigate();

	const fetchData = useCallback(async () => {
		setIsLoading(true);
		try {
			const alerts = await analyticsService.getReorderAlerts();
			setData(alerts);
			setError(null);
			setLastUpdated(new Date());
		} catch (err) {
			console.error("Error fetching reorder alerts:", err);
			setError("Không thể tải cảnh báo tồn kho");
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

	const getUrgencyConfig = (urgency: string) => {
		switch (urgency) {
			case "CRITICAL":
				return { color: "red", icon: MdError, label: "Khẩn cấp" };
			case "HIGH":
				return { color: "orange", icon: MdWarning, label: "Cảnh báo" };
			case "MEDIUM":
				return { color: "yellow", icon: MdWarning, label: "Lưu ý" };
			case "LOW":
				return { color: "blue", icon: MdInfo, label: "Thông tin" };
			default:
				return { color: "gray", icon: MdInfo, label: "N/A" };
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
						<Skeleton height="20px" width="100px" />
					</HStack>
					<Divider />
					{[1, 2, 3].map((i) => (
						<Box key={i} p={3} borderRadius="md" bg="gray.50">
							<HStack justify="space-between" mb={2}>
								<Skeleton height="16px" width="60%" />
								<Skeleton height="20px" width="70px" />
							</HStack>
							<Skeleton height="6px" borderRadius="full" mb={2} />
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

	const alerts = data.slice(0, maxAlerts);
	const criticalCount = data.filter(a => a.urgency === "CRITICAL").length;
	const highCount = data.filter(a => a.urgency === "HIGH").length;

	return (
		<Box bg="white" p={5} borderRadius="xl" boxShadow="sm">
			<VStack spacing={4} align="stretch">
				{/* Header */}
				<HStack justify="space-between">
					<HStack spacing={2}>
						<Icon as={MdShoppingCart} boxSize={5} color="brand.500" />
						<Text fontWeight="semibold" color="gray.700">
							Cần nhập hàng
						</Text>
					</HStack>
					<HStack spacing={1}>
						{criticalCount > 0 && (
							<Badge colorScheme="red" variant="solid" fontSize="xs">
								{criticalCount} khẩn
							</Badge>
						)}
						{highCount > 0 && (
							<Badge colorScheme="orange" variant="subtle" fontSize="xs">
								{highCount} cảnh báo
							</Badge>
						)}
					</HStack>
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
						<Icon as={MdInventory} boxSize={8} color="green.400" />
						<Text color="green.600" fontWeight="medium">
							Tồn kho đầy đủ!
						</Text>
					</VStack>
				) : (
					<VStack spacing={3} align="stretch">
						{alerts.map((alert: ReorderAlert) => {
							const config = getUrgencyConfig(alert.urgency);

							return (
								<Box
									key={alert.productId}
									p={3}
									borderRadius="md"
									bg="gray.50"
									borderLeft="3px solid"
									borderLeftColor={`${config.color}.400`}
									cursor="pointer"
									transition="all 0.2s"
									_hover={{
										bg: "gray.100",
										transform: "translateX(4px)",
										boxShadow: "md"
									}}
									onClick={() => handleAlertClick(alert.productId)}
								>
									<HStack justify="space-between" mb={2}>
										<HStack spacing={2} flex={1}>
											<Text fontWeight="medium" fontSize="sm" noOfLines={1}>
												{alert.productName}
											</Text>
											<Icon as={MdChevronRight} boxSize={4} color="gray.400" />
										</HStack>
										<Badge colorScheme={config.color} size="sm">
											<HStack spacing={1}>
												<Icon as={config.icon} boxSize={3} />
												<Text>{config.label}</Text>
											</HStack>
										</Badge>
									</HStack>

									<HStack spacing={4} fontSize="xs" color="gray.600" flexWrap="wrap">
										<Text>
											Còn: <strong>{alert.currentStock}</strong>
										</Text>
										<Text>
											Đề xuất nhập: <strong>{alert.suggestedQuantity}</strong>
										</Text>
										{alert.daysUntilStockout >= 0 && (
											<Text color={alert.daysUntilStockout < 3 ? "red.600" : "gray.600"}>
												Hết sau: <strong>{alert.daysUntilStockout} ngày</strong>
											</Text>
										)}
									</HStack>
								</Box>
							);
						})}
					</VStack>
				)}
			</VStack>
		</Box>
	);
};

export default ReorderAlertsWidget;
