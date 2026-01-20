import {
	Box,
	HStack,
	IconButton,
	Tooltip,
	Text,
	Badge,
	Kbd,
	Divider,
} from "@chakra-ui/react";
import {
	FaBarcode,
	FaSearch,
	FaPause,
	FaTrash,
	FaKeyboard,
	FaShoppingCart,
} from "react-icons/fa";

// Quick Actions Bar - Fixed action bar for common sales operations

interface QuickActionsBarProps {
	// Cart state
	itemCount: number;
	totalAmount: number;

	// Action handlers
	onOpenBarcodeScanner: () => void;
	onFocusSearch: () => void;
	onPauseOrder: () => void;
	onClearCart: () => void;
	onShowShortcuts: () => void;

	// Disable states
	isCartEmpty?: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
	itemCount,
	totalAmount,
	onOpenBarcodeScanner,
	onFocusSearch,
	onPauseOrder,
	onClearCart,
	onShowShortcuts,
	isCartEmpty = true,
}) => {
	const isMac =
		typeof navigator !== "undefined" && navigator.platform?.includes("Mac");
	const modKey = isMac ? "⌘" : "Ctrl";

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN").format(amount);
	};

	return (
		<Box
			position="fixed"
			bottom="200px"
			left="50%"
			transform="translateX(-50%)"
			zIndex={1000}
		>
			<HStack
				bg="white"
				borderRadius="xl"
				shadow="lg"
				px={4}
				py={3}
				spacing={3}
				border="1px solid"
				borderColor="gray.200"
				_hover={{
					shadow: "xl",
					borderColor: "brand.200",
				}}
				transition="all 0.2s"
			>
				{/* Cart summary - left side */}
				<HStack spacing={2} pr={2} borderRight="1px solid" borderColor="gray.200">
					<Box
						bg={isCartEmpty ? "gray.100" : "brand.500"}
						borderRadius="lg"
						p={2}
						color={isCartEmpty ? "gray.400" : "white"}
						transition="all 0.2s"
					>
						<FaShoppingCart size={16} />
					</Box>
					<Box>
						<Text
							fontSize="xs"
							color="gray.600"
							lineHeight="1"
							fontWeight="medium"
						>
							Giỏ hàng
						</Text>
						<HStack spacing={2} mt={0.5}>
							<Badge
								colorScheme={isCartEmpty ? "gray" : "brand"}
								borderRadius="full"
								fontSize="xs"
							>
								{itemCount} SP
							</Badge>
							<Text
								fontSize="sm"
								fontWeight="bold"
								color={isCartEmpty ? "gray.400" : "brand.500"}
							>
								{formatCurrency(totalAmount)}đ
							</Text>
						</HStack>
					</Box>
				</HStack>

				{/* Quick action buttons */}
				<HStack spacing={1}>
					{/* Barcode Scanner */}
					<Tooltip
						label={
							<HStack spacing={2}>
								<Text>Quét mã vạch</Text>
								<Kbd size="sm">{modKey}+B</Kbd>
							</HStack>
						}
						hasArrow
						placement="top"
					>
						<IconButton
							aria-label="Quét mã vạch"
							icon={<FaBarcode />}
							variant="ghost"
							colorScheme="brand"
							size="md"
							onClick={onOpenBarcodeScanner}
							_hover={{ bg: "brand.50" }}
						/>
					</Tooltip>

					{/* Search */}
					<Tooltip
						label={
							<HStack spacing={2}>
								<Text>Tìm sản phẩm</Text>
								<Kbd size="sm">F</Kbd>
							</HStack>
						}
						hasArrow
						placement="top"
					>
						<IconButton
							aria-label="Tìm sản phẩm"
							icon={<FaSearch />}
							variant="ghost"
							colorScheme="brand"
							size="md"
							onClick={onFocusSearch}
							_hover={{ bg: "brand.50" }}
						/>
					</Tooltip>

					<Divider orientation="vertical" h="32px" />

					{/* Pause Order */}
					<Tooltip
						label={
							<HStack spacing={2}>
								<Text>Tạm dừng đơn</Text>
								<Kbd size="sm">{modKey}+P</Kbd>
							</HStack>
						}
						hasArrow
						placement="top"
					>
						<IconButton
							aria-label="Tạm dừng đơn"
							icon={<FaPause />}
							variant="ghost"
							colorScheme="orange"
							size="md"
							onClick={onPauseOrder}
							isDisabled={isCartEmpty}
							_hover={!isCartEmpty ? { bg: "orange.50" } : {}}
						/>
					</Tooltip>

					{/* Clear cart */}
					<Tooltip
						label={
							<HStack spacing={2}>
								<Text>Xóa giỏ hàng</Text>
							</HStack>
						}
						hasArrow
						placement="top"
					>
						<IconButton
							aria-label="Xóa giỏ hàng"
							icon={<FaTrash />}
							variant="ghost"
							colorScheme="red"
							size="md"
							onClick={onClearCart}
							isDisabled={isCartEmpty}
							_hover={!isCartEmpty ? { bg: "red.50" } : {}}
						/>
					</Tooltip>

					<Divider orientation="vertical" h="32px" />

					{/* Shortcuts help */}
					<Tooltip
						label={
							<HStack spacing={2}>
								<Text>Phím tắt</Text>
								<Kbd size="sm">Shift+?</Kbd>
							</HStack>
						}
						hasArrow
						placement="top"
					>
						<IconButton
							aria-label="Phím tắt"
							icon={<FaKeyboard />}
							variant="ghost"
							colorScheme="gray"
							size="md"
							onClick={onShowShortcuts}
							_hover={{ bg: "gray.100" }}
						/>
					</Tooltip>
				</HStack>
			</HStack>
		</Box>
	);
};

export default QuickActionsBar;
