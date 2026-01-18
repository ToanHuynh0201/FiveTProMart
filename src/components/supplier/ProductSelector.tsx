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
