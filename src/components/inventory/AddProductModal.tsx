import { useState, useEffect } from "react";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Button,
	FormControl,
	FormLabel,
	Input,
	Select,
	VStack,
	useToast,
	FormHelperText,
} from "@chakra-ui/react";
import type { InventoryCategory } from "@/types/inventory";

interface AddProductModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (product: any) => Promise<void>;
	categories: InventoryCategory[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
	isOpen,
	onClose,
	onAdd,
	categories,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		productName: "",
		categoryId: "",
		unitOfMeasure: "",
		sellingPrice: 0,
	});

	const [displayPrice, setDisplayPrice] = useState("");

	// Format number with thousand separator
	const formatCurrency = (value: number | string) => {
		if (!value && value !== 0) return "";
		const numValue = typeof value === "string" ? parseFloat(value) : value;
		if (isNaN(numValue)) return "";
		return numValue.toLocaleString("vi-VN");
	};

	// Handle price input change
	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		// Remove all non-digit characters
		const numericValue = inputValue.replace(/\D/g, "");

		if (numericValue === "") {
			setDisplayPrice("");
			setFormData({ ...formData, sellingPrice: 0 });
			return;
		}

		const parsedValue = parseInt(numericValue, 10);
		setFormData({ ...formData, sellingPrice: parsedValue });
		setDisplayPrice(formatCurrency(parsedValue));
	};

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				productName: "",
				categoryId: "",
				unitOfMeasure: "",
				sellingPrice: 0,
			});
			setDisplayPrice("");
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		// Validation
		if (!formData.productName.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên sản phẩm",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!formData.categoryId || formData.categoryId === "") {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn danh mục",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (!formData.unitOfMeasure.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập đơn vị tính",
				status: "error",
				duration: 3000,
			});
			return;
		}

		if (formData.sellingPrice < 1000) {
			toast({
				title: "Lỗi",
				description: "Giá bán phải lớn hơn hoặc bằng 1,000đ",
				status: "error",
				duration: 3000,
			});
			return;
		}

		setIsLoading(true);

		try {
			await onAdd(formData);
			toast({
				title: "Thành công",
				description: "Thêm sản phẩm thành công",
				status: "success",
				duration: 3000,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi thêm sản phẩm",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent>
				<ModalHeader
					fontSize="24px"
					fontWeight="700"
					color="brand.600">
					Thêm sản phẩm mới
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody pb={6}>
					<VStack
						spacing={4}
						align="stretch">
						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Tên sản phẩm
							</FormLabel>
							<Input
								placeholder="Nhập tên sản phẩm"
								value={formData.productName}
								onChange={(e) =>
									setFormData({
										...formData,
										productName: e.target.value,
									})
								}
								fontSize="15px"
								h="48px"
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Danh mục
							</FormLabel>
							<Select
								placeholder="Chọn danh mục"
								value={formData.categoryId || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										categoryId: e.target.value,
									})
								}
								fontSize="15px"
								h="48px">
								{categories.map((cat) => (
									<option
										key={cat.categoryId}
										value={cat.categoryId}>
										{cat.categoryName}
									</option>
								))}
							</Select>
						</FormControl>

						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Đơn vị tính
							</FormLabel>
							<Input
								placeholder="VD: kg, gói, thùng, chai, lon"
								value={formData.unitOfMeasure}
								onChange={(e) =>
									setFormData({
										...formData,
										unitOfMeasure: e.target.value,
									})
								}
								fontSize="15px"
								h="48px"
							/>
						</FormControl>

						<FormControl isRequired>
							<FormLabel
								fontSize="15px"
								fontWeight="600"
								color="gray.700">
								Giá bán (đ)
							</FormLabel>
							<Input
								placeholder="1,000"
								value={displayPrice}
								onChange={handlePriceChange}
								fontSize="15px"
								h="48px"
							/>
							<FormHelperText>
								Giá bán tối thiểu là 1.000đ
							</FormHelperText>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter gap={3}>
					<Button
						variant="ghost"
						onClick={onClose}
						isDisabled={isLoading}>
						Hủy
					</Button>
					<Button
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						onClick={handleSubmit}
						isLoading={isLoading}
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
						}}>
						Thêm sản phẩm
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
