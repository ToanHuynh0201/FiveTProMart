import { Box, Flex, Select, Button, HStack } from "@chakra-ui/react";
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
							h="44px">
							<option value="all">Tất cả loại KM</option>
							<option value="discount">Giảm giá</option>
							<option value="buy1getN">Mua 1 tặng N</option>
							<option value="buyThisGetThat">
								Mua này tặng kia
							</option>
						</Select>
					</Box>

					<Box minW={{ base: "full", md: "200px" }}>
						<Select
							value={filters.status}
							onChange={(e) => handleStatusChange(e.target.value)}
							fontSize="14px"
							h="44px">
							<option value="all">Tất cả trạng thái</option>
							<option value="active">Đang áp dụng</option>
							<option value="inactive">Chưa áp dụng</option>
							<option value="expired">Đã hết hạn</option>
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
						h="44px">
						Đặt lại bộ lọc
					</Button>
				)}
			</Flex>
		</Box>
	);
};
