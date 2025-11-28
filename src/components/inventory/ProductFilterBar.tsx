import { Box, Flex, Select, Button, Text } from "@chakra-ui/react";
import type { ProductFilter } from "../../types/inventory";
import type { InventoryCategory } from "../../types/inventory";

interface ProductFilterBarProps {
	filters: ProductFilter;
	categories: InventoryCategory[];
	onFiltersChange: (filters: ProductFilter) => void;
	onReset: () => void;
}

export const ProductFilterBar: React.FC<ProductFilterBarProps> = ({
	filters,
	categories,
	onFiltersChange,
	onReset,
}) => {
	const handleFilterChange = (key: keyof ProductFilter, value: string) => {
		onFiltersChange({
			...filters,
			[key]: value,
		});
	};

	const hasActiveFilters =
		filters.category !== "all" ||
		filters.status !== "all" ||
		filters.stockLevel !== "all";

	return (
		<Box
			bg="white"
			p={5}
			borderRadius="12px"
			boxShadow="sm"
			mb={6}>
			<Flex
				gap={4}
				flexWrap={{ base: "wrap", lg: "nowrap" }}
				align="center">
				<Text
					fontSize="16px"
					fontWeight="600"
					color="gray.700"
					minW="80px">
					Lọc theo:
				</Text>

				<Select
					value={filters.category}
					onChange={(e) =>
						handleFilterChange("category", e.target.value)
					}
					bg="gray.50"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="10px"
					fontSize="15px"
					h="48px"
					flex={{ base: "1 1 100%", sm: "1 1 45%", lg: "1" }}
					_hover={{ bg: "gray.100" }}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					}}>
					<option value="all">Tất cả danh mục</option>
					{categories.map((cat) => (
						<option
							key={cat.id}
							value={cat.name}>
							{cat.name} ({cat.productCount})
						</option>
					))}
				</Select>

				<Select
					value={filters.status}
					onChange={(e) =>
						handleFilterChange("status", e.target.value)
					}
					bg="gray.50"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="10px"
					fontSize="15px"
					h="48px"
					flex={{ base: "1 1 100%", sm: "1 1 45%", lg: "1" }}
					_hover={{ bg: "gray.100" }}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					}}>
					<option value="all">Tất cả trạng thái</option>
					<option value="active">Đang kinh doanh</option>
					<option value="inactive">Ngừng kinh doanh</option>
					<option value="out-of-stock">Hết hàng</option>
				</Select>

				<Select
					value={filters.stockLevel}
					onChange={(e) =>
						handleFilterChange("stockLevel", e.target.value as any)
					}
					bg="gray.50"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="10px"
					fontSize="15px"
					h="48px"
					flex={{ base: "1 1 100%", sm: "1 1 45%", lg: "1" }}
					_hover={{ bg: "gray.100" }}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
					}}>
					<option value="all">Tất cả tồn kho</option>
					<option value="normal">Tồn kho bình thường</option>
					<option value="low">Sắp hết hàng</option>
					<option value="out">Hết hàng</option>
					<option value="expiring-soon">Lô sắp hết hạn</option>
					<option value="expired">Lô đã hết hạn</option>
				</Select>

				{hasActiveFilters && (
					<Button
						variant="ghost"
						colorScheme="blue"
						h="48px"
						px={4}
						fontSize="15px"
						fontWeight="600"
						onClick={onReset}
						flexShrink={0}
						_hover={{
							bg: "blue.50",
						}}>
						Xóa lọc
					</Button>
				)}
			</Flex>
		</Box>
	);
};
