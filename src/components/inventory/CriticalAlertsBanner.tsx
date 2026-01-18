/**
 * Critical Alerts Banner for Inventory
 *
 * A prominent banner that appears at the top of the Inventory page when there
 * are urgent issues that need immediate attention.
 */
import React from "react";
import {
	Box,
	Flex,
	Text,
	HStack,
	Icon,
	Button,
	Collapse,
	useDisclosure,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { FiAlertTriangle, FiAlertCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { BsExclamationOctagon } from "react-icons/bs";

interface CriticalAlertsProps {
	/** Number of expired batches - CRITICAL */
	expiredBatches: number;
	/** Number of batches expiring within 7 days - WARNING */
	expiringSoonBatches: number;
	/** Number of products with zero stock - CRITICAL */
	outOfStockProducts: number;
	/** Number of products with low stock - WARNING */
	lowStockProducts: number;
	/** Callback when user clicks on an alert to filter */
	onFilterByIssue: (issue: "expired" | "expiring-soon" | "out" | "low") => void;
	/** Callback when user clicks to navigate to purchase page */
	onNavigateToPurchase?: () => void;
}

// Pulse animation for critical alerts
const pulseAnimation = keyframes`
	0% {
		box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.4);
	}
	70% {
		box-shadow: 0 0 0 10px rgba(229, 62, 62, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
	}
`;

const alertGlow = keyframes`
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.7;
	}
`;

export const CriticalAlertsBanner: React.FC<CriticalAlertsProps> = ({
	expiredBatches,
	expiringSoonBatches,
	outOfStockProducts,
	lowStockProducts,
	onFilterByIssue,
	onNavigateToPurchase,
}) => {
	const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

	// Calculate totals
	const criticalCount = expiredBatches + outOfStockProducts;
	const warningCount = expiringSoonBatches + lowStockProducts;
	const totalIssues = criticalCount + warningCount;

	// Don't render if no issues
	if (totalIssues === 0) {
		return null;
	}

	const hasCritical = criticalCount > 0;

	return (
		<Box
			mb={6}
			borderRadius="xl"
			overflow="hidden"
			border="2px solid"
			borderColor={hasCritical ? "red.400" : "orange.400"}
			bg={hasCritical ? "red.50" : "orange.50"}
			animation={hasCritical ? `${alertGlow} 2s ease-in-out infinite` : undefined}
			transition="all 0.3s ease">
			{/* Header - Always visible */}
			<Flex
				px={5}
				py={3}
				bg={hasCritical ? "red.100" : "orange.100"}
				align="center"
				justify="space-between"
				cursor="pointer"
				onClick={onToggle}
				_hover={{
					bg: hasCritical ? "red.200" : "orange.200",
				}}
				transition="all 0.2s">
				<HStack spacing={3}>
					<Flex
						w={10}
						h={10}
						borderRadius="full"
						bg={hasCritical ? "red.500" : "orange.500"}
						align="center"
						justify="center"
						animation={hasCritical ? `${pulseAnimation} 2s infinite` : undefined}>
						<Icon
							as={hasCritical ? BsExclamationOctagon : FiAlertTriangle}
							color="white"
							boxSize={5}
						/>
					</Flex>
					<Box>
						<Text
							fontWeight="700"
							fontSize="md"
							color={hasCritical ? "red.800" : "orange.800"}>
							{hasCritical ? "🚨 CẦN XỬ LÝ NGAY" : "⚠️ Cảnh báo kho hàng"}
						</Text>
						<Text
							fontSize="sm"
							color={hasCritical ? "red.600" : "orange.600"}>
							{totalIssues} vấn đề cần chú ý
							{criticalCount > 0 && ` (${criticalCount} nghiêm trọng)`}
						</Text>
					</Box>
				</HStack>

				<HStack spacing={4}>
					{/* Quick stats badges */}
					{expiredBatches > 0 && (
						<Flex
							bg="red.500"
							color="white"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="sm"
							fontWeight="700"
							align="center"
							gap={1}>
							<Icon as={FiAlertCircle} />
							{expiredBatches} hết hạn
						</Flex>
					)}
					{outOfStockProducts > 0 && (
						<Flex
							bg="red.400"
							color="white"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="sm"
							fontWeight="600"
							align="center"
							gap={1}>
							{outOfStockProducts} hết hàng
						</Flex>
					)}
					<Icon
						as={isOpen ? FiChevronUp : FiChevronDown}
						color={hasCritical ? "red.600" : "orange.600"}
						boxSize={5}
					/>
				</HStack>
			</Flex>

			{/* Collapsible details */}
			<Collapse in={isOpen}>
				<Box px={5} py={4}>
					<Flex
						gap={4}
						wrap="wrap">
						{/* Critical: Expired batches */}
						{expiredBatches > 0 && (
							<AlertCard
								icon={FiAlertCircle}
								title="Lô hàng hết hạn"
								count={expiredBatches}
								description="Cần hủy hoặc xử lý ngay"
								severity="critical"
								onClick={() => onFilterByIssue("expired")}
							/>
						)}

						{/* Critical: Out of stock */}
						{outOfStockProducts > 0 && (
							<AlertCard
								icon={FiAlertTriangle}
								title="Sản phẩm hết hàng"
								count={outOfStockProducts}
								description="Cần nhập hàng bổ sung"
								severity="critical"
								onClick={() => onFilterByIssue("out")}
							/>
						)}

						{/* Warning: Expiring soon */}
						{expiringSoonBatches > 0 && (
							<AlertCard
								icon={FiAlertTriangle}
								title="Sắp hết hạn"
								count={expiringSoonBatches}
								description="Trong 7 ngày tới"
								severity="warning"
								onClick={() => onFilterByIssue("expiring-soon")}
							/>
						)}

						{/* Warning: Low stock */}
						{lowStockProducts > 0 && (
							<AlertCard
								icon={FiAlertTriangle}
								title="Sắp hết hàng"
								count={lowStockProducts}
								description="Dưới mức tồn kho tối thiểu"
								severity="warning"
								onClick={() => onFilterByIssue("low")}
							/>
						)}
					</Flex>

					{/* Quick Action: Navigate to Purchase when stock issues exist */}
					{(outOfStockProducts > 0 || lowStockProducts > 0) && onNavigateToPurchase && (
						<Flex mt={4} pt={4} borderTop="1px dashed" borderColor="gray.300">
							<Button
								colorScheme="brand"
								size="md"
								leftIcon={<Icon as={FiAlertTriangle} />}
								onClick={onNavigateToPurchase}
								_hover={{
									transform: "translateY(-1px)",
									boxShadow: "md",
								}}
								transition="all 0.2s">
								📦 Đi tới Đặt hàng nhập kho
							</Button>
						</Flex>
					)}
				</Box>
			</Collapse>
		</Box>
	);
};

interface AlertCardProps {
	icon: React.ElementType;
	title: string;
	count: number;
	description: string;
	severity: "critical" | "warning";
	onClick: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
	icon,
	title,
	count,
	description,
	severity,
	onClick,
}) => {
	const isCritical = severity === "critical";

	return (
		<Button
			variant="ghost"
			h="auto"
			p={4}
			bg={isCritical ? "red.100" : "orange.100"}
			borderRadius="lg"
			border="1px solid"
			borderColor={isCritical ? "red.200" : "orange.200"}
			_hover={{
				bg: isCritical ? "red.200" : "orange.200",
				transform: "translateY(-2px)",
				boxShadow: "md",
			}}
			onClick={onClick}
			transition="all 0.2s">
			<HStack spacing={3} align="flex-start">
				<Flex
					w={8}
					h={8}
					borderRadius="md"
					bg={isCritical ? "red.500" : "orange.500"}
					align="center"
					justify="center"
					flexShrink={0}>
					<Icon as={icon} color="white" boxSize={4} />
				</Flex>
				<Box textAlign="left">
					<Text
						fontSize="2xl"
						fontWeight="800"
						color={isCritical ? "red.700" : "orange.700"}
						lineHeight="1">
						{count}
					</Text>
					<Text
						fontSize="sm"
						fontWeight="600"
						color={isCritical ? "red.800" : "orange.800"}>
						{title}
					</Text>
					<Text
						fontSize="xs"
						color={isCritical ? "red.600" : "orange.600"}>
						{description}
					</Text>
				</Box>
			</HStack>
		</Button>
	);
};

export default CriticalAlertsBanner;
