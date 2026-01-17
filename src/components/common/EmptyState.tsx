/**
 * EmptyState Component
 *
 * Empty state illustrations with actionable guidance.
 */
import React from "react";
import { Box, VStack, Text, Button, Icon } from "@chakra-ui/react";
import { FiShoppingCart, FiPackage, FiSearch, FiCamera } from "react-icons/fi";

export type EmptyStateVariant = 
	| "empty-cart" 
	| "no-products" 
	| "no-search-results"
	| "no-orders"
	| "no-data";

interface EmptyStateProps {
	variant: EmptyStateVariant;
	/** Optional custom title */
	title?: string;
	/** Optional custom description */
	description?: string;
	/** Optional action button */
	action?: {
		label: string;
		onClick: () => void;
		icon?: React.ElementType;
	};
	/** Optional secondary action */
	secondaryAction?: {
		label: string;
		onClick: () => void;
	};
	/** Size of the illustration */
	size?: "sm" | "md" | "lg";
}

// Config for each variant
const variantConfig: Record<EmptyStateVariant, {
	icon: React.ElementType;
	title: string;
	description: string;
	color: string;
	bgColor: string;
}> = {
	"empty-cart": {
		icon: FiShoppingCart,
		title: "Giỏ hàng trống",
		description: "Quét mã lô hàng hoặc tìm kiếm sản phẩm để bắt đầu bán hàng",
		color: "brand.500",
		bgColor: "brand.50",
	},
	"no-products": {
		icon: FiPackage,
		title: "Chưa có sản phẩm",
		description: "Thêm sản phẩm đầu tiên vào kho hàng của bạn",
		color: "purple.500",
		bgColor: "purple.50",
	},
	"no-search-results": {
		icon: FiSearch,
		title: "Không tìm thấy kết quả",
		description: "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc",
		color: "gray.500",
		bgColor: "gray.100",
	},
	"no-orders": {
		icon: FiShoppingCart,
		title: "Chưa có đơn hàng",
		description: "Các đơn hàng sẽ xuất hiện ở đây sau khi bạn hoàn tất bán hàng",
		color: "blue.500",
		bgColor: "blue.50",
	},
	"no-data": {
		icon: FiPackage,
		title: "Không có dữ liệu",
		description: "Chưa có dữ liệu để hiển thị",
		color: "gray.500",
		bgColor: "gray.100",
	},
};

const sizeConfig = {
	sm: { icon: 40, container: 80, text: "sm", desc: "xs", py: 6 },
	md: { icon: 56, container: 112, text: "lg", desc: "sm", py: 10 },
	lg: { icon: 72, container: 144, text: "xl", desc: "md", py: 16 },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
	variant,
	title,
	description,
	action,
	secondaryAction,
	size = "md",
}) => {
	const config = variantConfig[variant];
	const sizeStyles = sizeConfig[size];

	return (
		<VStack
			spacing={4}
			py={sizeStyles.py}
			px={6}
			textAlign="center">
			{/* Illustrated Icon Container */}
			<Box position="relative">
				{/* Background circle */}
				<Box
					w={`${sizeStyles.container}px`}
					h={`${sizeStyles.container}px`}
					borderRadius="full"
					bg={config.bgColor}
					display="flex"
					alignItems="center"
					justifyContent="center"
					position="relative"
					overflow="hidden">
					{/* Decorative dots */}
					<Box
						position="absolute"
						top="15%"
						right="20%"
						w={2}
						h={2}
						borderRadius="full"
						bg={config.color}
						opacity={0.3}
					/>
					<Box
						position="absolute"
						bottom="25%"
						left="15%"
						w={3}
						h={3}
						borderRadius="full"
						bg={config.color}
						opacity={0.2}
					/>
					
					{/* Main icon */}
					<Icon
						as={config.icon}
						boxSize={`${sizeStyles.icon}px`}
						color={config.color}
						opacity={0.8}
					/>
				</Box>
				
				{/* Floating accent for cart */}
				{variant === "empty-cart" && (
					<Box
						position="absolute"
						top={-1}
						right={-1}
						w={6}
						h={6}
						borderRadius="full"
						bg="orange.400"
						display="flex"
						alignItems="center"
						justifyContent="center"
						boxShadow="sm">
						<Icon as={FiCamera} color="white" boxSize={3} />
					</Box>
				)}
			</Box>

			{/* Text content */}
			<VStack spacing={1}>
				<Text
					fontSize={sizeStyles.text}
					fontWeight="700"
					color="gray.700">
					{title || config.title}
				</Text>
				<Text
					fontSize={sizeStyles.desc}
					color="gray.500"
					maxW="300px">
					{description || config.description}
				</Text>
			</VStack>

			{/* Action buttons */}
			{(action || secondaryAction) && (
				<VStack spacing={2} pt={2}>
					{action && (
						<Button
							colorScheme="brand"
							size={size === "sm" ? "sm" : "md"}
							leftIcon={action.icon ? <Icon as={action.icon} /> : undefined}
							onClick={action.onClick}
							_hover={{
								transform: "translateY(-2px)",
								boxShadow: "lg",
							}}
							transition="all 0.2s">
							{action.label}
						</Button>
					)}
					{secondaryAction && (
						<Button
							variant="ghost"
							size="sm"
							color="gray.500"
							onClick={secondaryAction.onClick}
							_hover={{ color: "gray.700" }}>
							{secondaryAction.label}
						</Button>
					)}
				</VStack>
			)}

			{/* Keyboard shortcut hint for cart */}
			{variant === "empty-cart" && (
				<Text
					fontSize="xs"
					color="gray.400"
					pt={2}>
					💡 Nhấn <Text as="kbd" bg="gray.100" px={1} borderRadius="md" fontWeight="600">Ctrl+B</Text> để quét mã vạch nhanh
				</Text>
			)}
		</VStack>
	);
};

export default EmptyState;
