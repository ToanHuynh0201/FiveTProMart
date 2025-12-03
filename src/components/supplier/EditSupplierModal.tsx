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
	Textarea,
	useToast,
	Text,
	Grid,
	GridItem,
	Spinner,
	Center,
} from "@chakra-ui/react";
import type { UpdateSupplierData } from "@/types/supplier";
import { supplierService } from "@/services/supplierService";

interface EditSupplierModalProps {
	isOpen: boolean;
	onClose: () => void;
	supplierId: string | null;
	onUpdate: (id: string, data: UpdateSupplierData) => Promise<void>;
}

export const EditSupplierModal: React.FC<EditSupplierModalProps> = ({
	isOpen,
	onClose,
	supplierId,
	onUpdate,
}) => {
	const toast = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [formData, setFormData] = useState({
		code: "",
		name: "",
		phone: "",
		email: "",
		address: "",
		taxCode: "",
		contactPerson: "",
		contactPhone: "",
		bankAccount: "",
		bankName: "",
		status: "active" as "active" | "inactive",
		notes: "",
	});

	const [errors, setErrors] = useState({
		code: "",
		name: "",
		phone: "",
		email: "",
	});

	useEffect(() => {
		if (isOpen && supplierId) {
			loadSupplierData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, supplierId]);

	const loadSupplierData = async () => {
		if (!supplierId) return;

		setIsFetching(true);
		try {
			const supplier = await supplierService.getSupplierById(supplierId);
			if (supplier) {
				setFormData({
					code: supplier.code,
					name: supplier.name,
					phone: supplier.phone,
					email: supplier.email || "",
					address: supplier.address || "",
					taxCode: supplier.taxCode || "",
					contactPerson: supplier.contactPerson || "",
					contactPhone: supplier.contactPhone || "",
					bankAccount: supplier.bankAccount || "",
					bankName: supplier.bankName || "",
					status: supplier.status,
					notes: supplier.notes || "",
				});
			}
		} catch (error) {
			console.error("Error loading supplier:", error);
			toast({
				title: "Lỗi",
				description: "Không thể tải thông tin nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsFetching(false);
		}
	};

	const validatePhone = (phone: string): boolean => {
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
			code: "",
			name: "",
			phone: "",
			email: "",
		};

		if (!formData.code.trim()) {
			newErrors.code = "Vui lòng nhập mã nhà cung cấp";
		}

		if (!formData.name.trim()) {
			newErrors.name = "Vui lòng nhập tên nhà cung cấp";
		} else if (formData.name.trim().length < 3) {
			newErrors.name = "Tên nhà cung cấp phải có ít nhất 3 ký tự";
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "Vui lòng nhập số điện thoại";
		} else if (!validatePhone(formData.phone)) {
			newErrors.phone =
				"Số điện thoại không hợp lệ (phải có 10 chữ số và bắt đầu bằng 0)";
		}

		if (formData.email && !validateEmail(formData.email)) {
			newErrors.email = "Email không hợp lệ";
		}

		setErrors(newErrors);

		if (
			newErrors.code ||
			newErrors.name ||
			newErrors.phone ||
			newErrors.email
		) {
			return;
		}

		if (!supplierId) return;

		setIsLoading(true);

		try {
			await onUpdate(supplierId, formData);
			toast({
				title: "Thành công",
				description: "Cập nhật nhà cung cấp thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});
			onClose();
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi cập nhật nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoading(false);
		}
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
					Chỉnh sửa nhà cung cấp
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					size="lg"
					color="gray.500"
					_hover={{ color: "gray.700", bg: "gray.100" }}
				/>

				<ModalBody
					px={6}
					py={4}>
					{isFetching ? (
						<Center py={10}>
							<Spinner
								size="xl"
								color="#161f70"
							/>
						</Center>
					) : (
						<VStack
							spacing={5}
							align="stretch">
							<Grid
								templateColumns={{
									base: "1fr",
									md: "repeat(2, 1fr)",
								}}
								gap={5}>
								<GridItem>
									<FormControl
										isRequired
										isInvalid={!!errors.code}>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Mã nhà cung cấp
										</FormLabel>
										<Input
											value={formData.code}
											onChange={(e) => {
												setFormData({
													...formData,
													code: e.target.value,
												});
												setErrors({
													...errors,
													code: "",
												});
											}}
											size="lg"
											borderColor={
												errors.code
													? "red.500"
													: "gray.300"
											}
										/>
										{errors.code && (
											<Text
												color="red.500"
												fontSize="sm"
												mt={1}>
												{errors.code}
											</Text>
										)}
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl
										isRequired
										isInvalid={!!errors.name}>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Tên nhà cung cấp
										</FormLabel>
										<Input
											value={formData.name}
											onChange={(e) => {
												setFormData({
													...formData,
													name: e.target.value,
												});
												setErrors({
													...errors,
													name: "",
												});
											}}
											size="lg"
											borderColor={
												errors.name
													? "red.500"
													: "gray.300"
											}
										/>
										{errors.name && (
											<Text
												color="red.500"
												fontSize="sm"
												mt={1}>
												{errors.name}
											</Text>
										)}
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl
										isRequired
										isInvalid={!!errors.phone}>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Số điện thoại
										</FormLabel>
										<Input
											value={formData.phone}
											onChange={(e) => {
												setFormData({
													...formData,
													phone: e.target.value,
												});
												setErrors({
													...errors,
													phone: "",
												});
											}}
											size="lg"
											borderColor={
												errors.phone
													? "red.500"
													: "gray.300"
											}
										/>
										{errors.phone && (
											<Text
												color="red.500"
												fontSize="sm"
												mt={1}>
												{errors.phone}
											</Text>
										)}
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl isInvalid={!!errors.email}>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Email
										</FormLabel>
										<Input
											value={formData.email}
											onChange={(e) => {
												setFormData({
													...formData,
													email: e.target.value,
												});
												setErrors({
													...errors,
													email: "",
												});
											}}
											size="lg"
											borderColor={
												errors.email
													? "red.500"
													: "gray.300"
											}
										/>
										{errors.email && (
											<Text
												color="red.500"
												fontSize="sm"
												mt={1}>
												{errors.email}
											</Text>
										)}
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Mã số thuế
										</FormLabel>
										<Input
											value={formData.taxCode}
											onChange={(e) =>
												setFormData({
													...formData,
													taxCode: e.target.value,
												})
											}
											size="lg"
										/>
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Người liên hệ
										</FormLabel>
										<Input
											value={formData.contactPerson}
											onChange={(e) =>
												setFormData({
													...formData,
													contactPerson:
														e.target.value,
												})
											}
											size="lg"
										/>
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											SĐT người liên hệ
										</FormLabel>
										<Input
											value={formData.contactPhone}
											onChange={(e) =>
												setFormData({
													...formData,
													contactPhone:
														e.target.value,
												})
											}
											size="lg"
										/>
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Trạng thái
										</FormLabel>
										<Select
											value={formData.status}
											onChange={(e) =>
												setFormData({
													...formData,
													status: e.target.value as
														| "active"
														| "inactive",
												})
											}
											size="lg">
											<option value="active">
												Hoạt động
											</option>
											<option value="inactive">
												Ngưng hoạt động
											</option>
										</Select>
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Số tài khoản
										</FormLabel>
										<Input
											value={formData.bankAccount}
											onChange={(e) =>
												setFormData({
													...formData,
													bankAccount: e.target.value,
												})
											}
											size="lg"
										/>
									</FormControl>
								</GridItem>

								<GridItem>
									<FormControl>
										<FormLabel
											fontSize="16px"
											fontWeight="600"
											color="gray.700">
											Tên ngân hàng
										</FormLabel>
										<Input
											value={formData.bankName}
											onChange={(e) =>
												setFormData({
													...formData,
													bankName: e.target.value,
												})
											}
											size="lg"
										/>
									</FormControl>
								</GridItem>
							</Grid>

							<FormControl>
								<FormLabel
									fontSize="16px"
									fontWeight="600"
									color="gray.700">
									Địa chỉ
								</FormLabel>
								<Input
									value={formData.address}
									onChange={(e) =>
										setFormData({
											...formData,
											address: e.target.value,
										})
									}
									size="lg"
								/>
							</FormControl>

							<FormControl>
								<FormLabel
									fontSize="16px"
									fontWeight="600"
									color="gray.700">
									Ghi chú
								</FormLabel>
								<Textarea
									value={formData.notes}
									onChange={(e) =>
										setFormData({
											...formData,
											notes: e.target.value,
										})
									}
									size="lg"
									rows={3}
									resize="vertical"
								/>
							</FormControl>
						</VStack>
					)}
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
							loadingText="Đang cập nhật..."
							bg="#161f70"
							_hover={{ bg: "#0f1654" }}
							isDisabled={isFetching}>
							Cập nhật
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default EditSupplierModal;
