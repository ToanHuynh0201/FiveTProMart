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
import { getExpiryStatus, isExpired } from "../../utils/date";

interface ProductSearchBarProps {
	onProductSelect: (
		product: Product,
		batchId?: string,
		batchNumber?: string,
	) => void;
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
	const searchTimeoutRef = useRef<number>(0);

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
				// TODO: Implement searchProducts API call from salesService
				// const results = await salesService.searchProducts(query);
				const results: Product[] = [];
				setSearchResults(results);
				setShowResults(true);
			}, 300);
		} else {
			setSearchResults([]);
			setShowResults(false);
		}
	};

	const handleSelectBatch = (
		product: Product,
		batchId: string,
		batchNumber: string,
	) => {
		// Thêm sản phẩm với lô đã chọn vào giỏ
		onProductSelect(product, batchId, batchNumber);
		setSearchQuery("");
		setSearchResults([]);
		setShowResults(false);
		toast({
			title: "Đã thêm vào giỏ hàng",
			description: `${product.name} - Lô ${batchNumber}`,
			status: "success",
			duration: 2000,
			position: "top",
		});
	};

	return (
		<Box
			position="relative"
			flex="1"
			maxW="100%">
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
					placeholder="Tìm theo tên sản phẩm hoặc mã lô (VD: Bánh, LOT001)..."
					value={searchQuery}
					onChange={(e) => handleSearch(e.target.value)}
					onFocus={() =>
						searchResults.length > 0 && setShowResults(true)
					}
					onBlur={() => setTimeout(() => setShowResults(false), 300)}
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
					maxH="500px"
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
					{searchResults.map((product) => (
						<Box
							key={product.id}
							borderBottom="1px solid"
							borderColor="gray.100"
							_last={{ borderBottom: "none" }}>
							{/* Thông tin sản phẩm */}
							<Box
								p={3.5}
								bg="gray.50"
								borderBottom="1px solid"
								borderColor="gray.200">
								<Flex
									justify="space-between"
									align="start"
									mb={1.5}>
									<Text
										fontSize="15px"
										fontWeight="700"
										color="gray.800">
										{product.name}
									</Text>
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

							{/* Danh sách lô hàng */}
							{product.batches && product.batches.length > 0 ? (
								<Box bg="white">
									<Text
										px={3.5}
										pt={2}
										pb={1}
										fontSize="12px"
										fontWeight="600"
										color="gray.500"
										textTransform="uppercase">
										Chọn lô hàng:
									</Text>
									{product.batches.map((batch) => {
										const batchExpired = isExpired(
											batch.expiryDate,
										);
										const expiryStatus = getExpiryStatus(
											batch.expiryDate,
										);

										return (
											<Box
												key={batch.id}
												px={3.5}
												py={2.5}
												cursor="pointer"
												borderTop="1px solid"
												borderColor="gray.100"
												_hover={{
													bg: "blue.50",
												}}
												transition="all 0.2s"
												onMouseDown={(e) => {
													e.preventDefault();
													handleSelectBatch(
														product,
														batch.id,
														batch.batchNumber,
													);
												}}>
												<Flex
													justify="space-between"
													align="center"
													gap={3}>
													<Box flex={1}>
														<Flex
															align="center"
															gap={2}
															mb={1}>
															<Text
																fontSize="14px"
																fontWeight="600"
																color="gray.800">
																Lô{" "}
																{
																	batch.batchNumber
																}
															</Text>
															{batchExpired && (
																<Badge
																	colorScheme="red"
																	fontSize="10px">
																	Hết hạn
																</Badge>
															)}
														</Flex>
														<Flex
															fontSize="12px"
															color="gray.600"
															gap={3}
															flexWrap="wrap">
															<Text>
																Tồn:{" "}
																{batch.quantity}
															</Text>
															<Text>
																HSD:{" "}
																{new Date(
																	batch.expiryDate,
																).toLocaleDateString(
																	"vi-VN",
																)}
															</Text>
														</Flex>
													</Box>
													<Badge
														colorScheme={
															batchExpired
																? "red"
																: expiryStatus.status ===
																  "critical"
																? "red"
																: expiryStatus.status ===
																  "warning"
																? "orange"
																: "green"
														}
														fontSize="11px"
														px={2}
														py={1}
														borderRadius="md"
														flexShrink={0}>
														{batchExpired
															? "Hết hạn"
															: expiryStatus.text}
													</Badge>
												</Flex>
											</Box>
										);
									})}
								</Box>
							) : (
								<Box
									px={3.5}
									py={2}
									fontSize="13px"
									color="gray.500"
									fontStyle="italic">
									Không có lô hàng
								</Box>
							)}
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
};
