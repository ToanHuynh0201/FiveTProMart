import { useState, useEffect } from "react";
import {
	Box,
	Button,
	VStack,
	HStack,
	Text,
	IconButton,
	FormControl,
	FormLabel,
	useToast,
	Select,
	Flex,
} from "@chakra-ui/react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { inventoryService } from "../../services/inventoryService";
import type { BuyXGetYProductPair } from "../../types/promotion";

interface Product {
	productId: string;
	productName: string;
	unitOfMeasure: string;
	sellingPrice: number | null;
}

interface BuyXGetYProductPairSelectorProps {
	productPairs: BuyXGetYProductPair[];
	onProductPairsChange: (pairs: BuyXGetYProductPair[]) => void;
}

export const BuyXGetYProductPairSelector: React.FC<
	BuyXGetYProductPairSelectorProps
> = ({ productPairs, onProductPairsChange }) => {
	const toast = useToast();
	const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Fetch available products
	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		setIsLoading(true);
		try {
			const result = await inventoryService.getProducts({
				page: 0,
				size: 1000, // Get all products for selection
			});

			if (result.success && result.data) {
				setAvailableProducts(result.data);
			}
		} catch (error) {
			console.error("Error fetching products:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải danh sách sản phẩm",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddPair = () => {
		const newPair: BuyXGetYProductPair = {
			productBuy: "",
			productGet: "",
		};
		onProductPairsChange([...productPairs, newPair]);
	};

	const handleRemovePair = (index: number) => {
		const updatedPairs = productPairs.filter((_, i) => i !== index);
		onProductPairsChange(updatedPairs);
	};

	const handlePairChange = (
		index: number,
		field: keyof BuyXGetYProductPair,
		value: string,
	) => {
		const updatedPairs = productPairs.map((pair, i) => {
			if (i === index) {
				return { ...pair, [field]: value };
			}
			return pair;
		});
		onProductPairsChange(updatedPairs);
	};

	const getProductName = (productId: string) => {
		const product = availableProducts.find((p) => p.productId === productId);
		return product?.productName || "";
	};

	return (
		<Box>
			<VStack
				spacing={3}
				align="stretch">
				{productPairs.length === 0 ? (
					<Box
						p={6}
						bg="gray.50"
						borderRadius="8px"
						borderWidth="1px"
						borderColor="gray.200"
						textAlign="center">
						<Text
							color="gray.500"
							fontSize="14px">
							Chưa có cặp sản phẩm nào. Nhấn "Thêm cặp sản phẩm" để bắt đầu.
						</Text>
					</Box>
				) : (
					productPairs.map((pair, index) => (
						<Box
							key={index}
							p={4}
							bg="white"
							borderRadius="8px"
							borderWidth="1px"
							borderColor="gray.200"
							position="relative">
							<Flex
								justify="space-between"
								align="center"
								mb={3}>
								<Text
									fontSize="14px"
									fontWeight="600"
									color="gray.700">
									Cặp sản phẩm #{index + 1}
								</Text>
								<IconButton
									aria-label="Xóa cặp sản phẩm"
									icon={<FiTrash2 />}
									size="sm"
									colorScheme="red"
									variant="ghost"
									onClick={() => handleRemovePair(index)}
								/>
							</Flex>

							<VStack
								spacing={3}
								align="stretch">
								{/* Product Buy */}
								<FormControl isRequired>
									<FormLabel
										fontSize="13px"
										fontWeight="600"
										color="gray.600">
										Sản phẩm khách mua
									</FormLabel>
									<Select
										placeholder="Chọn sản phẩm khách mua"
										value={pair.productBuy}
										onChange={(e) =>
											handlePairChange(index, "productBuy", e.target.value)
										}
										fontSize="14px"
										isDisabled={isLoading}>
										{availableProducts.map((product) => (
											<option
												key={product.productId}
												value={product.productId}>
												{product.productName} ({product.unitOfMeasure}) -{" "}
												{product.sellingPrice !== null
													? product.sellingPrice.toLocaleString("vi-VN")
													: "0"}
												đ
											</option>
										))}
									</Select>
								</FormControl>

								{/* Product Get */}
								<FormControl isRequired>
									<FormLabel
										fontSize="13px"
										fontWeight="600"
										color="gray.600">
										Sản phẩm được tặng
									</FormLabel>
									<Select
										placeholder="Chọn sản phẩm được tặng"
										value={pair.productGet}
										onChange={(e) =>
											handlePairChange(index, "productGet", e.target.value)
										}
										fontSize="14px"
										isDisabled={isLoading}>
										{availableProducts.map((product) => (
											<option
												key={product.productId}
												value={product.productId}>
												{product.productName} ({product.unitOfMeasure}) -{" "}
												{product.sellingPrice !== null
													? product.sellingPrice.toLocaleString("vi-VN")
													: "0"}
												đ
											</option>
										))}
									</Select>
								</FormControl>

								{/* Preview */}
								{pair.productBuy && pair.productGet && (
									<Box
										p={2}
										bg="purple.50"
										borderRadius="6px"
										borderWidth="1px"
										borderColor="purple.200">
										<Text
											fontSize="12px"
											color="purple.700"
											fontWeight="500">
											<strong>Quy tắc:</strong> Mua{" "}
											<strong>{getProductName(pair.productBuy)}</strong> → Tặng{" "}
											<strong>{getProductName(pair.productGet)}</strong>
										</Text>
									</Box>
								)}
							</VStack>
						</Box>
					))
				)}

				{/* Add Button */}
				<Button
					leftIcon={<FiPlus />}
					onClick={handleAddPair}
					colorScheme="purple"
					variant="outline"
					size="sm"
					isDisabled={isLoading}>
					Thêm cặp sản phẩm
				</Button>
			</VStack>

			{/* Summary */}
			{productPairs.length > 0 && (
				<Box
					mt={4}
					p={3}
					bg="purple.50"
					borderRadius="8px"
					borderWidth="1px"
					borderColor="purple.200">
					<HStack spacing={2}>
						<Text
							fontSize="13px"
							fontWeight="600"
							color="purple.700">
							Tổng số cặp sản phẩm:
						</Text>
						<Text
							fontSize="13px"
							fontWeight="700"
							color="purple.700">
							{productPairs.length}
						</Text>
					</HStack>
				</Box>
			)}
		</Box>
	);
};
