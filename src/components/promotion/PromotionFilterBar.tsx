import {
	Box,
	Flex,
	Select,
	Button,
	HStack,
	Text,
	Badge,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import type { PromotionFilter } from "../../types/promotion";

interface PromotionFilterBarProps {
	filters: PromotionFilter;
	onFiltersChange: (filters: PromotionFilter) => void;
	onReset: () => void;
}

export const PromotionFilterBar: React.FC<PromotionFilterBarProps> = ({
	filters,
	onFiltersChange,
	onReset,
}) => {
	const handleTypeChange = (type: string) => {
		onFiltersChange({ ...filters, type });
	};

	const handleStatusChange = (status: string) => {
		onFiltersChange({ ...filters, status });
	};

	const hasActiveFilters =
		filters.type !== "all" ||
		filters.status !== "all" ||
		filters.searchQuery !== "";

	const getTypeLabel = (type: string) => {
		switch (type) {
			case "Discount":
				return "Giảm giá";
			case "Buy X Get Y":
				return "Mua X tặng Y";
			default:
				return type;
		}
	};

	const getStatusLabel = (status: string) => {
		switch (status) {
			case "Active":
				return "Đang áp dụng";
			case "Upcoming":
				return "Sắp diễn ra";
			case "Expired":
				return "Đã hết hạn";
			case "Cancelled":
				return "Đã hủy";
			default:
				return status;
		}
	};

	return (
		<Box
			bg="white"
			p={4}
			borderRadius="12px"
			boxShadow="sm"
			mb={6}>
			<Flex
				direction={{ base: "column", md: "row" }}
				gap={4}
				align={{ base: "stretch", md: "center" }}
				justify="space-between">
				<HStack
					spacing={3}
					flex={1}
					flexWrap={{ base: "wrap", md: "nowrap" }}>
					<Box minW={{ base: "full", md: "200px" }}>
						<Select
							value={filters.type}
							onChange={(e) => handleTypeChange(e.target.value)}
							fontSize="14px"
							h="44px"
							borderRadius="8px">
							<option value="all">Tất cả loại KM</option>
							<option value="Discount">Giảm giá</option>
							<option value="Buy X Get Y">Mua X tặng Y</option>
						</Select>
					</Box>

					<Box minW={{ base: "full", md: "200px" }}>
						<Select
							value={filters.status}
							onChange={(e) => handleStatusChange(e.target.value)}
							fontSize="14px"
							h="44px"
							borderRadius="8px">
							<option value="all">Tất cả trạng thái</option>
							<option value="Active">Đang áp dụng</option>
							<option value="Upcoming">Sắp diễn ra</option>
							<option value="Expired">Đã hết hạn</option>
							<option value="Cancelled">Đã hủy</option>
						</Select>
					</Box>
				</HStack>

				{hasActiveFilters && (
					<Button
						leftIcon={<RepeatIcon />}
						variant="ghost"
						colorScheme="gray"
						onClick={onReset}
						fontSize="14px"
						fontWeight="600"
						h="44px"
						flexShrink={0}>
						Đặt lại
					</Button>
				)}
			</Flex>

			{hasActiveFilters && (
				<Flex
					mt={3}
					gap={2}
					flexWrap="wrap"
					align="center">
					<Text
						fontSize="13px"
						color="gray.600"
						fontWeight="500">
						Bộ lọc:
					</Text>
					{filters.type !== "all" && (
						<Badge
							colorScheme="blue"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="12px"
							fontWeight="600">
							{getTypeLabel(filters.type)}
						</Badge>
					)}
					{filters.status !== "all" && (
						<Badge
							colorScheme="purple"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="12px"
							fontWeight="600">
							{getStatusLabel(filters.status)}
						</Badge>
					)}
					{filters.searchQuery !== "" && (
						<Badge
							colorScheme="green"
							px={3}
							py={1}
							borderRadius="full"
							fontSize="12px"
							fontWeight="600">
							"{filters.searchQuery}"
						</Badge>
					)}
				</Flex>
			)}
		</Box>
	);
};
