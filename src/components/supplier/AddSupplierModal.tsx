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
} from "@chakra-ui/react";
import type { CreateSupplierDTO, SupplierType } from "@/types/supplier";

interface AddSupplierModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (supplier: CreateSupplierDTO) => Promise<void>;
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
		suppliedProductType: "",
		currentDebt: 0,
		representName: "",
		representPhoneNumber: "",
	});

	const [errors, setErrors] = useState({
		supplierName: "",
		phoneNumber: "",
		address: "",
		suppliedProductType: "",
	});

	useEffect(() => {
		if (!isOpen) {
			// Reset form when modal closes
			setFormData({
				supplierName: "",
				supplierType: "Doanh nghiệp",
				phoneNumber: "",
				address: "",
				suppliedProductType: "",
				currentDebt: 0,
				representName: "",
				representPhoneNumber: "",
			});
			setErrors({
				supplierName: "",
				phoneNumber: "",
				address: "",
				suppliedProductType: "",
			});
		}
	}, [isOpen]);

	const validatePhone = (phone: string): boolean => {
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const handleSubmit = async () => {
		const newErrors = {
			supplierName: "",
			phoneNumber: "",
			address: "",
			suppliedProductType: "",
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

		if (!formData.suppliedProductType.trim()) {
			newErrors.suppliedProductType = "Vui lòng nhập loại sản phẩm cung cấp";
		}

		setErrors(newErrors);

		if (
			newErrors.supplierName ||
			newErrors.phoneNumber ||
			newErrors.address ||
			newErrors.suppliedProductType
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
							<GridItem>
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

							{/* Loại sản phẩm cung cấp */}
							<GridItem>
								<FormControl isRequired isInvalid={!!errors.suppliedProductType}>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Loại sản phẩm cung cấp
									</FormLabel>
									<Input
										placeholder="Rau củ quả tươi..."
										value={formData.suppliedProductType}
										onChange={(e) => {
											setFormData({
												...formData,
												suppliedProductType: e.target.value,
											});
											setErrors({ ...errors, suppliedProductType: "" });
										}}
										size="lg"
										borderColor={
											errors.suppliedProductType ? "red.500" : "gray.300"
										}
									/>
									{errors.suppliedProductType && (
										<Text color="red.500" fontSize="sm" mt={1}>
											{errors.suppliedProductType}
										</Text>
									)}
								</FormControl>
							</GridItem>

							{/* Tên người đại diện */}
							<GridItem>
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Người đại diện
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
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										SĐT người đại diện
									</FormLabel>
									<Input
										placeholder="0901234567"
										value={formData.representPhoneNumber || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												representPhoneNumber: e.target.value,
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>

							{/* Công nợ hiện tại */}
							<GridItem colSpan={{ base: 1, md: 2 }}>
								<FormControl>
									<FormLabel fontSize="16px" fontWeight="600" color="gray.700">
										Công nợ hiện tại (VNĐ)
									</FormLabel>
									<Input
										type="number"
										placeholder="0"
										value={formData.currentDebt}
										onChange={(e) =>
											setFormData({
												...formData,
												currentDebt: Number(e.target.value),
											})
										}
										size="lg"
									/>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Địa chỉ */}
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
