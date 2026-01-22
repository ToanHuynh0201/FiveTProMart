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
				const filtered = (
					response.data as unknown as InventoryProduct[]
				).filter((p) => !selectedIds.includes(p.productId));
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
				productId: product.productId,
				productName: product.productName,
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
			onProductsChange(
				selectedProducts.filter((p) => p.productId !== productId),
			);
		},
		[selectedProducts, onProductsChange],
	);

	return (
		<Box
			position="relative"
			marginBottom="20px">
			{/* Search Input */}
			<InputGroup size="lg">
				<InputLeftElement
					pointerEvents="none"
					h="52px">
					<Icon
						as={FiSearch}
						color="gray.400"
						boxSize={5}
					/>
				</InputLeftElement>
				<Input
					placeholder="Tìm kiếm sản phẩm theo tên hoặc mã..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					onFocus={() =>
						searchQuery.length >= 2 && setShowResults(true)
					}
					isDisabled={isDisabled}
					borderColor="gray.300"
					fontSize="16px"
					h="52px"
					bg="white"
					_hover={{ borderColor: "gray.400" }}
					_focus={{
						borderColor: "#161f70",
						boxShadow: "0 0 0 1px #161f70",
					}}
				/>
			</InputGroup>

			{/* Search Results Dropdown */}
			{showResults && (
				<Box
					position="absolute"
					top="100%"
					left={0}
					right={0}
					mt={2}
					bg="white"
					borderRadius="lg"
					border="1px solid"
					borderColor="gray.200"
					boxShadow="xl"
					maxH="320px"
					overflowY="auto"
					zIndex={1000}>
					{isSearching ? (
						<Center py={8}>
							<Spinner
								size="md"
								color="#161f70"
								thickness="3px"
							/>
						</Center>
					) : searchResults.length > 0 ? (
						<VStack
							align="stretch"
							spacing={0}
							p={2}>
							{searchResults.map((product) => (
								<Flex
									key={product.productId}
									px={4}
									py={3}
									align="center"
									justify="space-between"
									borderRadius="md"
									_hover={{ bg: "blue.50" }}
									cursor="pointer"
									onClick={() => handleAddProduct(product)}
									transition="all 0.2s">
									<Box flex="1">
										<Text
											fontSize="15px"
											fontWeight="600"
											color="gray.800"
											mb={1}>
											{product.productName}
										</Text>
										<HStack spacing={2}>
											<Text
												fontSize="13px"
												color="gray.500"
												fontWeight="500">
												Mã: {product.productId}
											</Text>
											<Badge
												colorScheme="purple"
												fontSize="11px"
												px={2}
												py={0.5}
												borderRadius="md">
												{product.categoryId}
											</Badge>
										</HStack>
									</Box>
									<IconButton
										aria-label="Thêm sản phẩm"
										icon={<FiPlus />}
										size="sm"
										variant="ghost"
										color="#161f70"
										_hover={{ bg: "blue.100" }}
									/>
								</Flex>
							))}
						</VStack>
					) : (
						<Center py={8}>
							<VStack spacing={2}>
								<Icon
									as={FiSearch}
									boxSize={8}
									color="gray.300"
								/>
								<Text
									fontSize="14px"
									color="gray.500"
									fontWeight="500">
									Không tìm thấy sản phẩm
								</Text>
							</VStack>
						</Center>
					)}
				</Box>
			)}

			{/* Selected Products Table */}
			{selectedProducts.length > 0 && (
				<Box mt={4}>
					<Text
						fontSize="14px"
						fontWeight="600"
						color="gray.700"
						mb={3}>
						Sản phẩm đã chọn ({selectedProducts.length})
					</Text>
					<Box
						border="1px solid"
						borderColor="gray.200"
						borderRadius="lg"
						overflow="hidden"
						boxShadow="sm">
						<Table size="md">
							<Thead bg="gray.50">
								<Tr>
									<Th
										width="70px"
										fontSize="13px">
										STT
									</Th>
									<Th fontSize="13px">Tên sản phẩm</Th>
									<Th width="60px"></Th>
								</Tr>
							</Thead>
							<Tbody>
								{selectedProducts.map((product, index) => (
									<Tr
										key={product.productId}
										_hover={{ bg: "gray.50" }}>
										<Td
											fontSize="14px"
											fontWeight="500">
											{index + 1}
										</Td>
										<Td
											fontSize="14px"
											fontWeight="500">
											{product.productName}
										</Td>
										<Td>
											{!isDisabled && (
												<IconButton
													aria-label="Xóa sản phẩm"
													icon={<DeleteIcon />}
													size="sm"
													colorScheme="red"
													variant="ghost"
													onClick={() =>
														handleRemoveProduct(
															product.productId,
														)
													}
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
					zIndex={999}
					onClick={() => setShowResults(false)}
				/>
			)}
		</Box>
	);
};

export default ProductSelector;
