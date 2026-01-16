import { useState, useEffect, useCallback } from "react";
import {
	Box,
	Input,
	InputGroup,
	InputLeftElement,
	VStack,
	HStack,
	Text,
	Badge,
	IconButton,
	Spinner,
	Center,
	Flex,
	Icon,
	useToast,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
} from "@chakra-ui/react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { DeleteIcon } from "@chakra-ui/icons";
import { inventoryService } from "@/services/inventoryService";
import type { InventoryProduct } from "@/types/inventory";

// ============ MOCK DATA FOR TESTING ============
const MOCK_PRODUCTS: InventoryProduct[] = [
	{
		id: "prod-001",
		code: "VNM-001",
		name: "Sữa tươi Vinamilk 1L",
		category: "Sữa",
		unit: "Hộp",
		price: 32000,
		costPrice: 25000,
		stock: 150,
		minStock: 20,
		maxStock: 500,
		status: "active",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: "prod-002",
		code: "CC-330",
		name: "Nước ngọt Coca Cola 330ml",
		category: "Nước giải khát",
		unit: "Lon",
		price: 12000,
		costPrice: 8000,
		stock: 300,
		minStock: 50,
		maxStock: 1000,
		status: "active",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: "prod-003",
		code: "HH-001",
		name: "Mì gói Hảo Hảo tôm chua cay",
		category: "Mì gói",
		unit: "Gói",
		price: 6000,
		costPrice: 4500,
		stock: 500,
		minStock: 100,
		maxStock: 2000,
		status: "active",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: "prod-004",
		code: "NP-1L",
		name: "Dầu ăn Neptune 1L",
		category: "Dầu ăn",
		unit: "Chai",
		price: 55000,
		costPrice: 45000,
		stock: 80,
		minStock: 20,
		maxStock: 200,
		status: "active",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: "prod-005",
		code: "OMO-3KG",
		name: "Bột giặt OMO 3kg",
		category: "Hóa phẩm",
		unit: "Túi",
		price: 105000,
		costPrice: 85000,
		stock: 60,
		minStock: 15,
		maxStock: 150,
		status: "active",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
	{
		id: "prod-006",
		code: "TH-MILK",
		name: "Sữa tươi TH True Milk 1L",
		category: "Sữa",
		unit: "Hộp",
		price: 35000,
		costPrice: 28000,
		stock: 200,
		minStock: 30,
		maxStock: 600,
		status: "active",
		createdAt: new Date("2024-01-01"),
		updatedAt: new Date("2024-01-15"),
	},
];

// Set this to true to use mock data, false to use real API
const USE_MOCK_DATA = true;
// ============ END MOCK DATA ============

interface SelectedProduct {
	productId: string;
	productName: string;
}

interface ProductSelectorProps {
	selectedProducts: SelectedProduct[];
	onProductsChange: (products: SelectedProduct[]) => void;
	isDisabled?: boolean;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
	selectedProducts,
	onProductsChange,
	isDisabled = false,
}) => {
	const toast = useToast();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<InventoryProduct[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showResults, setShowResults] = useState(false);

	// Debounced search
	useEffect(() => {
		const timer = setTimeout(() => {
			if (searchQuery.trim().length >= 2) {
				searchProducts(searchQuery);
			} else {
				setSearchResults([]);
				setShowResults(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [searchQuery]);

	const searchProducts = async (query: string) => {
		setIsSearching(true);
		try {
			if (USE_MOCK_DATA) {
				// Use mock data for testing
				await new Promise((resolve) => setTimeout(resolve, 200));
				const queryLower = query.toLowerCase();
				const selectedIds = selectedProducts.map((p) => p.productId);
				const filtered = MOCK_PRODUCTS.filter(
					(p) =>
						(p.name.toLowerCase().includes(queryLower) ||
							p.code.toLowerCase().includes(queryLower)) &&
						!selectedIds.includes(p.id),
				);
				setSearchResults(filtered);
				setShowResults(true);
				setIsSearching(false);
				return;
			}

			const response = await inventoryService.getProducts({
				search: query,
				page: 0,
				size: 10,
			});

			if (response.data) {
				// Filter out already selected products
				const selectedIds = selectedProducts.map((p) => p.productId);
				const filtered = (response.data as unknown as InventoryProduct[]).filter(
					(p) => !selectedIds.includes(p.id),
				);
				setSearchResults(filtered);
				setShowResults(true);
			}
		} catch (error) {
			console.error("Error searching products:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tìm kiếm sản phẩm",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsSearching(false);
		}
	};

	const handleAddProduct = useCallback(
		(product: InventoryProduct) => {
			const newProduct: SelectedProduct = {
				productId: product.id,
				productName: product.name,
			};
			onProductsChange([...selectedProducts, newProduct]);
			setSearchQuery("");
			setSearchResults([]);
			setShowResults(false);
		},
		[selectedProducts, onProductsChange],
	);

	const handleRemoveProduct = useCallback(
		(productId: string) => {
			onProductsChange(selectedProducts.filter((p) => p.productId !== productId));
		},
		[selectedProducts, onProductsChange],
	);

	return (
		<Box position="relative">
			{/* Search Input */}
			<InputGroup size="md">
				<InputLeftElement pointerEvents="none">
					<Icon as={FiSearch} color="gray.400" />
				</InputLeftElement>
				<Input
					placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
					isDisabled={isDisabled}
					borderColor="gray.300"
					_focus={{ borderColor: "#161f70", boxShadow: "0 0 0 1px #161f70" }}
				/>
			</InputGroup>

			{/* Search Results Dropdown */}
			{showResults && (
				<Box
					position="absolute"
					top="100%"
					left={0}
					right={0}
					mt={1}
					bg="white"
					borderRadius="md"
					border="1px solid"
					borderColor="gray.200"
					boxShadow="lg"
					maxH="200px"
					overflowY="auto"
					zIndex={10}>
					{isSearching ? (
						<Center py={4}>
							<Spinner size="sm" color="#161f70" />
						</Center>
					) : searchResults.length > 0 ? (
						<VStack align="stretch" spacing={0}>
							{searchResults.map((product) => (
								<Flex
									key={product.id}
									px={3}
									py={2}
									align="center"
									justify="space-between"
									_hover={{ bg: "gray.50" }}
									cursor="pointer"
									onClick={() => handleAddProduct(product)}>
									<Box>
										<Text fontSize="13px" fontWeight="600" color="gray.800">
											{product.name}
										</Text>
										<HStack spacing={2}>
											<Text fontSize="11px" color="gray.500">
												{product.code}
											</Text>
											<Badge
												colorScheme="purple"
												fontSize="10px"
												px={1.5}
												borderRadius="sm">
												{product.category}
											</Badge>
										</HStack>
									</Box>
									<IconButton
										aria-label="Thêm sản phẩm"
										icon={<FiPlus />}
										size="xs"
										variant="ghost"
										color="#161f70"
										_hover={{ bg: "blue.50" }}
									/>
								</Flex>
							))}
						</VStack>
					) : (
						<Center py={4}>
							<Text fontSize="13px" color="gray.500">
								Không tìm thấy sản phẩm
							</Text>
						</Center>
					)}
				</Box>
			)}

			{/* Selected Products Table */}
			{selectedProducts.length > 0 && (
				<Box mt={3}>
					<Text fontSize="12px" fontWeight="600" color="gray.600" mb={2}>
						Sản phẩm đã chọn ({selectedProducts.length})
					</Text>
					<Box
						border="1px solid"
						borderColor="gray.200"
						borderRadius="8px"
						overflow="hidden">
						<Table size="sm">
							<Thead bg="gray.50">
								<Tr>
									<Th width="60px">STT</Th>
									<Th>Tên sản phẩm</Th>
									<Th width="50px"></Th>
								</Tr>
							</Thead>
							<Tbody>
								{selectedProducts.map((product, index) => (
									<Tr key={product.productId}>
										<Td fontSize="13px">{index + 1}</Td>
										<Td fontSize="13px">{product.productName}</Td>
										<Td>
											{!isDisabled && (
												<IconButton
													aria-label="Xóa sản phẩm"
													icon={<DeleteIcon />}
													size="xs"
													colorScheme="red"
													variant="ghost"
													onClick={() => handleRemoveProduct(product.productId)}
												/>
											)}
										</Td>
									</Tr>
								))}
							</Tbody>
						</Table>
					</Box>
				</Box>
			)}

			{/* Click outside to close */}
			{showResults && (
				<Box
					position="fixed"
					top={0}
					left={0}
					right={0}
					bottom={0}
					zIndex={5}
					onClick={() => setShowResults(false)}
				/>
			)}
		</Box>
	);
};

export default ProductSelector;
