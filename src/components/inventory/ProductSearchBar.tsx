import {
	Input,
	InputGroup,
	InputLeftElement,
	Flex,
	Button,
	Select,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import type { ProductFilter, InventoryCategory } from "../../types/inventory";

interface ProductSearchBarProps {
	filters: ProductFilter;
	categories: InventoryCategory[];
	onFiltersChange: (filters: ProductFilter) => void;
	onReset: () => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
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
		<Flex
			gap={4}
			mb={6}
			flexWrap={{ base: "wrap", lg: "nowrap" }}
			align="stretch">
			{/* Search Input */}
			<InputGroup flex={{ base: "1 1 100%", lg: "2" }}>
				<InputLeftElement
					pointerEvents="none"
					h="56px">
					<SearchIcon color="gray.500" />
				</InputLeftElement>
				<Input
					h="56px"
					bg="white"
					border="2px solid"
					borderColor="gray.200"
					borderRadius="12px"
					fontSize="16px"
					placeholder="Tìm kiếm theo tên, mã hàng hoặc mã vạch..."
					value={filters.searchQuery}
					onChange={(e) =>
						handleFilterChange("searchQuery", e.target.value)
					}
					_placeholder={{ color: "gray.500" }}
					_hover={{
						borderColor: "gray.300",
					}}
					_focus={{
						bg: "white",
						borderColor: "brand.500",
						boxShadow: "0 0 0 3px rgba(22, 31, 112, 0.1)",
					}}
				/>
			</InputGroup>

			{/* Category Filter */}
			<Select
				value={filters.category}
				onChange={(e) => handleFilterChange("category", e.target.value)}
				bg="white"
				border="2px solid"
				borderColor="gray.200"
				borderRadius="12px"
				fontSize="16px"
				h="56px"
				flex={{ base: "1 1 48%", sm: "1 1 32%", lg: "1" }}
				_hover={{ borderColor: "gray.300" }}
				_focus={{
					bg: "white",
					borderColor: "brand.500",
					boxShadow: "0 0 0 3px rgba(22, 31, 112, 0.1)",
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

			{/* Status Filter */}
			<Select
				value={filters.status}
				onChange={(e) => handleFilterChange("status", e.target.value)}
				bg="white"
				border="2px solid"
				borderColor="gray.200"
				borderRadius="12px"
				fontSize="16px"
				h="56px"
				flex={{ base: "1 1 48%", sm: "1 1 32%", lg: "1" }}
				_hover={{ borderColor: "gray.300" }}
				_focus={{
					bg: "white",
					borderColor: "brand.500",
					boxShadow: "0 0 0 3px rgba(22, 31, 112, 0.1)",
				}}>
				<option value="all">Tất cả trạng thái</option>
				<option value="active">Đang kinh doanh</option>
				<option value="inactive">Ngừng kinh doanh</option>
				<option value="out-of-stock">Hết hàng</option>
			</Select>

			{/* Stock Level Filter */}
			<Select
				value={filters.stockLevel}
				onChange={(e) =>
					handleFilterChange("stockLevel", e.target.value)
				}
				bg="white"
				border="2px solid"
				borderColor="gray.200"
				borderRadius="12px"
				fontSize="16px"
				h="56px"
				flex={{ base: "1 1 100%", sm: "1 1 32%", lg: "1" }}
				_hover={{ borderColor: "gray.300" }}
				_focus={{
					bg: "white",
					borderColor: "brand.500",
					boxShadow: "0 0 0 3px rgba(22, 31, 112, 0.1)",
				}}>
				<option value="all">Tất cả tồn kho</option>
				<option value="normal">Tồn kho bình thường</option>
				<option value="low">Sắp hết hàng</option>
				<option value="out">Hết hàng</option>
				<option value="expiring-soon">Lô sắp hết hạn</option>
				<option value="expired">Lô đã hết hạn</option>
			</Select>

			{/* Reset Button */}
			{hasActiveFilters && (
				<Button
					variant="ghost"
					colorScheme="blue"
					h="56px"
					px={5}
					fontSize="16px"
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
	);
};
