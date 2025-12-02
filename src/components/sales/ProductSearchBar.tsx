import { useState, useEffect, useRef } from "react";
import {
	Box,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
	Text,
	Flex,
	Badge,
	IconButton,
	Tooltip,
	useToast,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { FiCamera } from "react-icons/fi";
import type { Product } from "../../types/sales";
import { salesService } from "../../services/salesService";
import { getExpiryStatus, isExpired } from "../../utils/date";

interface ProductSearchBarProps {
	onProductSelect: (product: Product) => void;
	onOpenBarcodeScanner?: () => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
	onProductSelect,
	onOpenBarcodeScanner,
}) => {
	const toast = useToast();
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Product[]>([]);
	const [showResults, setShowResults] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const searchTimeoutRef = useRef<NodeJS.Timeout>();

	// Auto-detect barcode input (fast typing pattern)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Shortcut Ctrl+B to open barcode scanner
			if (e.ctrlKey && e.key === "b") {
				e.preventDefault();
				onOpenBarcodeScanner?.();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onOpenBarcodeScanner]);

	const handleSearch = async (query: string) => {
		setSearchQuery(query);

		// Clear previous timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		if (query.trim()) {
			// Debounce search for better performance
			searchTimeoutRef.current = setTimeout(async () => {
				const results = await salesService.searchProducts(query);
				setSearchResults(results);
				setShowResults(true);

				// Auto-select if exact barcode match
				const exactBarcodeMatch = results.find(
					(p) => p.barcode === query.trim(),
				);
				if (exactBarcodeMatch && results.length === 1) {
					handleSelectProduct(exactBarcodeMatch);
					toast({
						title: "Quét mã vạch thành công!",
						description: `Đã thêm: ${exactBarcodeMatch.name}`,
						status: "success",
						duration: 2000,
						position: "top",
					});
				}
			}, 300);
		} else {
			setSearchResults([]);
			setShowResults(false);
		}
	};

	const handleSelectProduct = (product: Product) => {
		onProductSelect(product);
		setSearchQuery("");
		setSearchResults([]);
		setShowResults(false);
	};

	return (
		<Box
			position="relative"
			flex="1"
			maxW="600px">
			<InputGroup>
				<InputLeftElement
					pointerEvents="none"
					h="48px">
					<SearchIcon color="gray.500" />
				</InputLeftElement>
				<Input
					ref={inputRef}
					h="48px"
					bg="gray.50"
					border="2px solid transparent"
					borderRadius="10px"
					fontSize="15px"
					placeholder="Tìm kiếm hoặc quét mã vạch (Ctrl+B)..."
					value={searchQuery}
					onChange={(e) => handleSearch(e.target.value)}
					onFocus={() =>
						searchResults.length > 0 && setShowResults(true)
					}
					onBlur={() => setTimeout(() => setShowResults(false), 200)}
					_placeholder={{ color: "gray.500" }}
					_focus={{
						bg: "white",
						borderColor: "#161f70",
						boxShadow: "0 0 0 3px rgba(22, 31, 112, 0.1)",
					}}
					pr="50px"
				/>
				<InputRightElement
					h="48px"
					w="50px">
					<Tooltip
						label="Quét mã vạch (Ctrl+B)"
						hasArrow
						placement="top">
						<IconButton
							aria-label="Scan barcode"
							icon={<FiCamera size={20} />}
							variant="ghost"
							colorScheme="brand"
							size="sm"
							onClick={onOpenBarcodeScanner}
							_hover={{
								bg: "brand.50",
								transform: "scale(1.1)",
							}}
							transition="all 0.2s"
						/>
					</Tooltip>
				</InputRightElement>
			</InputGroup>

			{showResults && searchResults.length > 0 && (
				<Box
					position="absolute"
					top="calc(100% + 8px)"
					left={0}
					right={0}
					bg="white"
					border="1px solid"
					borderColor="gray.200"
					borderRadius="10px"
					maxH="400px"
					overflowY="auto"
					boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
					zIndex={1000}
					animation="fadeIn 0.3s ease-out"
					sx={{
						"&::-webkit-scrollbar": {
							width: "8px",
						},
						"&::-webkit-scrollbar-track": {
							bg: "gray.50",
							borderRadius: "10px",
						},
						"&::-webkit-scrollbar-thumb": {
							bg: "gray.300",
							borderRadius: "10px",
							"&:hover": {
								bg: "gray.400",
							},
						},
					}}>
					{searchResults.map((product) => {
						const expiryStatus = getExpiryStatus(
							product.expiryDate,
						);
						const isProductExpired = isExpired(product.expiryDate);

						return (
							<Box
								key={product.id}
								p={3.5}
								cursor="pointer"
								borderBottom="1px solid"
								borderColor="gray.100"
								_hover={{ bg: "gray.50" }}
								_last={{ borderBottom: "none" }}
								onClick={() => handleSelectProduct(product)}
								transition="all 0.2s"
								bg={
									isProductExpired ? "red.50" : "transparent"
								}>
								<Flex
									justify="space-between"
									align="start"
									mb={1.5}>
									<Text
										fontSize="15px"
										fontWeight="600"
										color="gray.800">
										{product.name}
									</Text>
									{product.expiryDate && (
										<Badge
											colorScheme={
												isProductExpired
													? "red"
													: expiryStatus.status ===
													  "critical"
													? "red"
													: expiryStatus.status ===
													  "warning"
													? "orange"
													: "green"
											}
											fontSize="10px"
											px={1.5}
											py={0.5}
											borderRadius="md"
											ml={2}
											flexShrink={0}>
											{isProductExpired
												? "Hết hạn"
												: expiryStatus.text}
										</Badge>
									)}
								</Flex>
								<Flex
									fontSize="13px"
									color="gray.600"
									gap={4}
									flexWrap="wrap">
									<Text>Mã: {product.code}</Text>
									<Text>
										Giá:{" "}
										{product.price.toLocaleString("vi-VN")}đ
									</Text>
									<Text>Tồn: {product.stock}</Text>
								</Flex>
							</Box>
						);
					})}
				</Box>
			)}
		</Box>
	);
};
