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
	HStack,
	Text,
	Grid,
	GridItem,
	Box,
} from "@chakra-ui/react";
import type { CreateSupplierDTO, SupplierType } from "@/types/supplier";
import { ProductSelector } from "./ProductSelector";

interface AddSupplierModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (supplier: CreateSupplierDTO) => Promise<void>;
}

interface SelectedProduct {
	productId: string;
	productName: string;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
	isOpen,
	onClose,
	onAdd,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<CreateSupplierDTO>({
		supplierName: "",
		supplierType: "Doanh nghiệp",
		phoneNumber: "",
		address: "",
		email: "",
		taxCode: "",
		bankAccount: "",
		bankName: "",
		representName: "",
		representPhoneNumber: "",
		suppliedProductType: [],
	});

	const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

	const [errors, setErrors] = useState({
		supplierName: "",
		phoneNumber: "",
		address: "",
		email: "",
		representPhoneNumber: "",
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				supplierName: "",
				supplierType: "Doanh nghiệp",
				phoneNumber: "",
				address: "",
				email: "",
				taxCode: "",
				bankAccount: "",
				bankName: "",
				representName: "",
				representPhoneNumber: "",
				suppliedProductType: [],
			});
			setSelectedProducts([]);
			setErrors({
				supplierName: "",
				phoneNumber: "",
				address: "",
				email: "",
				representPhoneNumber: "",
			});
		}
	}, [isOpen]);

	const handleProductsChange = (products: SelectedProduct[]) => {
		setSelectedProducts(products);
		setFormData({
			...formData,
			suppliedProductType: products.map((p) => p.productId),
		});
	};

	const validatePhone = (phone: string): boolean => {
		if (!phone) return true;
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const validateEmail = (email: string): boolean => {
		if (!email) return true;
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async () => {
		const newErrors = {
			supplierName: "",
			phoneNumber: "",
			address: "",
			email: "",
			representPhoneNumber: "",
		};

		// Validation
		if (!formData.supplierName.trim()) {
			newErrors.supplierName = "Vui lòng nhập tên nhà cung cấp";
		} else if (formData.supplierName.trim().length < 3) {
			newErrors.supplierName = "Tên nhà cung cấp phải có ít nhất 3 ký tự";
		}

		if (!formData.phoneNumber.trim()) {
			newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
		} else if (!validatePhone(formData.phoneNumber)) {
			newErrors.phoneNumber =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		if (!formData.address.trim()) {
			newErrors.address = "Vui lòng nhập địa chỉ";
		}

		if (formData.email && !validateEmail(formData.email)) {
			newErrors.email = "Email không hợp lệ";
		}

		if (
			formData.representPhoneNumber &&
			!validatePhone(formData.representPhoneNumber)
		) {
			newErrors.representPhoneNumber =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		setErrors(newErrors);

		if (
			newErrors.supplierName ||
			newErrors.phoneNumber ||
			newErrors.address ||
			newErrors.email ||
			newErrors.representPhoneNumber
		) {
			return;
		}

		setIsLoading(true);
		await onAdd(formData);
		setIsLoading(false);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={{ base: "full", md: "4xl" }}
			isCentered
			motionPreset="slideInBottom"
			scrollBehavior="inside">
			<ModalOverlay bg="blackAlpha.600" />
			<ModalContent
				borderRadius={{ base: 0, md: "2xl" }}
				mx={{ base: 0, md: 4 }}
				my={{ base: 0, md: 4 }}
				maxH={{ base: "100vh", md: "90vh" }}>
				<ModalHeader
					fontSize={{ base: "24px", md: "28px" }}
					fontWeight="700"
					color="#161f70"
					pt={6}
					px={6}>
					Thêm nhà cung cấp mới
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					size="lg"
					color="gray.500"
					_hover={{ color: "gray.700", bg: "gray.100" }}
				/>

				<ModalBody px={6} py={4}>
					<VStack spacing={5} align="stretch">
						<Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={5}>
							{/* Tên nhà cung cấp */}
							<GridItem colSpan={{ base: 1, md: 2 }}>
								<FormControl isRequired isInvalid={!!errors.supplierName}>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Tên nhà cung cấp
									</FormLabel>
									<Input
										placeholder="Công ty TNHH..."
										value={formData.supplierName}
										onChange={(e) => {
											setFormData({ ...formData, supplierName: e.target.value });
											setErrors({ ...errors, supplierName: "" });
										}}
										size="lg"
										borderColor={errors.supplierName ? "red.500" : "gray.300"}
									/>
									{errors.supplierName && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{errors.supplierName}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Loại nhà cung cấp */}
							<GridItem>
								<FormControl isRequired>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Loại nhà cung cấp
									</FormLabel>
									<Select
										value={formData.supplierType}
										onChange={(e) =>
											setFormData({
												...formData,
												supplierType: e.target.value as SupplierType,
											})
										}
										size="lg">
										<option value="Doanh nghiệp">Doanh nghiệp</option>
										<option value="Tư nhân">Tư nhân</option>
									</Select>
								</FormControl>
							</GridItem>

							{/* Số điện thoại */}
							<GridItem>
								<FormControl isRequired isInvalid={!!errors.phoneNumber}>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Số điện thoại
									</FormLabel>
									<Input
										placeholder="0909123456"
										value={formData.phoneNumber}
										onChange={(e) => {
											setFormData({ ...formData, phoneNumber: e.target.value });
											setErrors({ ...errors, phoneNumber: "" });
										}}
										size="lg"
										borderColor={errors.phoneNumber ? "red.500" : "gray.300"}
									/>
									{errors.phoneNumber && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{errors.phoneNumber}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Email */}
							<GridItem>
								<FormControl isInvalid={!!errors.email}>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Email
									</FormLabel>
									<Input
										type="email"
										placeholder="contact@example.com"
										value={formData.email || ""}
										onChange={(e) => {
											setFormData({ ...formData, email: e.target.value });
											setErrors({ ...errors, email: "" });
										}}
										size="lg"
										borderColor={errors.email ? "red.500" : "gray.300"}
									/>
									{errors.email && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{errors.email}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Mã số thuế */}
							<GridItem>
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Mã số thuế
									</FormLabel>
									<Input
										placeholder="0123456789"
										value={formData.taxCode || ""}
										onChange={(e) =>
											setFormData({ ...formData, taxCode: e.target.value })
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* Tên người đại diện */}
							<GridItem>
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Người liên hệ
									</FormLabel>
									<Input
										placeholder="Nguyễn Văn A"
										value={formData.representName || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												representName: e.target.value,
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* SĐT người đại diện */}
							<GridItem>
								<FormControl isInvalid={!!errors.representPhoneNumber}>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										SĐT người liên hệ
									</FormLabel>
									<Input
										placeholder="0901234567"
										value={formData.representPhoneNumber || ""}
										onChange={(e) => {
											setFormData({
												...formData,
												representPhoneNumber: e.target.value,
											});
											setErrors({ ...errors, representPhoneNumber: "" });
										}}
										size="lg"
										borderColor={
											errors.representPhoneNumber ? "red.500" : "gray.300"
										}
									/>
									{errors.representPhoneNumber && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{errors.representPhoneNumber}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Số tài khoản */}
							<GridItem>
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Số tài khoản
									</FormLabel>
									<Input
										placeholder="1234567890"
										value={formData.bankAccount || ""}
										onChange={(e) =>
											setFormData({ ...formData, bankAccount: e.target.value })
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* Ngân hàng */}
							<GridItem>
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Ngân hàng
									</FormLabel>
									<Input
										placeholder="Vietcombank"
										value={formData.bankName || ""}
										onChange={(e) =>
											setFormData({ ...formData, bankName: e.target.value })
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* Địa chỉ */}
							<GridItem colSpan={{ base: 1, md: 2 }}>
								<FormControl isRequired isInvalid={!!errors.address}>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Địa chỉ
									</FormLabel>
									<Input
										placeholder="123 Đường Nguyễn Văn Linh, Quận 7, TP. HCM"
										value={formData.address}
										onChange={(e) => {
											setFormData({ ...formData, address: e.target.value });
											setErrors({ ...errors, address: "" });
										}}
										size="lg"
										borderColor={errors.address ? "red.500" : "gray.300"}
									/>
									{errors.address && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{errors.address}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Sản phẩm cung cấp */}
							<GridItem colSpan={{ base: 1, md: 2 }}>
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Sản phẩm cung cấp
									</FormLabel>
									<Box
										p={4}
										border="1px solid"
										borderColor="gray.200"
										borderRadius="lg"
										bg="gray.50">
										<ProductSelector
											selectedProducts={selectedProducts}
											onProductsChange={handleProductsChange}
										/>
									</Box>
								</FormControl>
							</GridItem>
						</Grid>
					</VStack>
				</ModalBody>

				<ModalFooter
					px={6}
					py={4}
					borderTop="1px solid"
					borderColor="gray.200">
					<HStack spacing={3}>
						<Button
							variant="ghost"
							size="lg"
							onClick={onClose}
							isDisabled={isLoading}
							_hover={{ bg: "gray.100" }}>
							Hủy
						</Button>
						<Button
							colorScheme="blue"
							size="lg"
							onClick={handleSubmit}
							isLoading={isLoading}
							loadingText="Đang thêm..."
							bg="#161f70"
							_hover={{ bg: "#0f1654" }}>
							Thêm nhà cung cấp
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddSupplierModal;
