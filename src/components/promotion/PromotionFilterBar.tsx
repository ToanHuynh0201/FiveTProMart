import {
	Box,
	Flex,
	Select,
	Button,
	HStack,
	Text,
	Badge,
	useDisclosure,
	Input,
	InputGroup,
	InputLeftElement,
} from "@chakra-ui/react";
import { RepeatIcon, SearchIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import type { PromotionFilter } from "../../types/promotion";
// TODO: Import promotionService
import type { PromotionProduct } from "../../types/promotion";

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
	const [products, setProducts] = useState<PromotionProduct[]>([]);
	const [productSearchQuery, setProductSearchQuery] = useState("");
	const { isOpen, onToggle } = useDisclosure();

	useEffect(() => {
		loadProducts();
	}, []);

	const loadProducts = async () => {
		try {
			// TODO: Fetch available products from API
			setProducts([]);
		} catch (error) {
			console.error("Error loading products:", error);
		}
	};

	const handleTypeChange = (type: string) => {
		onFiltersChange({ ...filters, type });
	};

	const handleStatusChange = (status: string) => {
		onFiltersChange({ ...filters, status });
	};

	const handleProductFilter = (productCode: string) => {
		if (productCode === "all") {
			onFiltersChange({ ...filters, searchQuery: "" });
		} else {
			onFiltersChange({ ...filters, searchQuery: productCode });
		}
	};

	const hasActiveFilters =
		filters.type !== "all" ||
		filters.status !== "all" ||
		filters.searchQuery !== "";

	const filteredProducts = products.filter(
		(p) =>
			p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
			p.code.toLowerCase().includes(productSearchQuery.toLowerCase()),
	);

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
							<option value="discount">Giảm giá</option>
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
							h="44px"
							borderRadius="8px">
							<option value="all">Tất cả trạng thái</option>
							<option value="active">Đang áp dụng</option>
							<option value="inactive">Chưa áp dụng</option>
							<option value="expired">Đã hết hạn</option>
						</Select>
					</Box>

					<Box
						minW={{ base: "full", md: "250px" }}
						position="relative">
						<Select
							placeholder="Lọc theo sản phẩm"
							onChange={(e) => handleProductFilter(e.target.value)}
							fontSize="14px"
							h="44px"
							borderRadius="8px"
							icon={<SearchIcon />}>
							<option value="all">Tất cả sản phẩm</option>
							{products.map((product) => (
								<option
									key={product.id}
									value={product.code}>
									{product.code} - {product.name}
								</option>
							))}
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
							{filters.type === "discount"
								? "Giảm giá"
								: "Mua này tặng kia"}
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
							{filters.status === "active"
								? "Đang áp dụng"
								: filters.status === "inactive"
									? "Chưa áp dụng"
									: "Đã hết hạn"}
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
