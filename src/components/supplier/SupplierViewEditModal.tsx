import { useState, useEffect, useRef } from "react";
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
	Flex,
	Badge,
	Divider,
	Icon,
	Tooltip,
	Box,
	AlertDialog,
	AlertDialogBody,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogContent,
	AlertDialogOverlay,
	useDisclosure,
} from "@chakra-ui/react";
import type { Supplier, SupplierType } from "@/types/supplier";
import { supplierService } from "@/services/supplierService";
import {
	FiPhone,
	FiMapPin,
	FiUser,
	FiCopy,
	FiCheck,
	FiEdit2,
	FiTrash2,
} from "react-icons/fi";

interface SupplierViewEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	supplierId: string | null;
	mode: "view" | "edit";
	onSuccess?: () => void;
}

export const SupplierViewEditModal: React.FC<SupplierViewEditModalProps> = ({
	isOpen,
	onClose,
	supplierId,
	mode: initialMode,
	onSuccess,
}) => {
	const toast = useToast();
	const [mode, setMode] = useState<"view" | "edit">(initialMode);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [supplierData, setSupplierData] = useState<Supplier | null>(null);

	// Delete confirmation dialog
	const {
		isOpen: isDeleteDialogOpen,
		onOpen: onDeleteDialogOpen,
		onClose: onDeleteDialogClose,
	} = useDisclosure();
	const cancelRef = useRef<HTMLButtonElement>(null);

	// Form data for edit mode
	const [formData, setFormData] = useState({
		supplierName: "",
		address: "",
		phoneNumber: "",
		representName: "",
		representPhoneNumber: "",
		supplierType: "Doanh nghiệp" as SupplierType,
		suppliedProductType: "",
		currentDebt: 0,
	});

	const [errors, setErrors] = useState({
		supplierName: "",
		phoneNumber: "",
		representPhoneNumber: "",
	});

	// Copy states
	const [isPhoneCopied, setIsPhoneCopied] = useState(false);
	const [isRepresentPhoneCopied, setIsRepresentPhoneCopied] = useState(false);

	// Load supplier data when modal opens
	useEffect(() => {
		if (isOpen && supplierId) {
			loadSupplierData();
		}
		// Reset mode to initial mode when modal opens
		setMode(initialMode);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, supplierId, initialMode]);

	const loadSupplierData = async () => {
		if (!supplierId) return;

		setIsFetching(true);
		try {
			const result = await supplierService.getSupplierById(supplierId);

			if (result.success && result.data) {
				setSupplierData(result.data);
				// Populate form data for edit mode
				setFormData({
					supplierName: result.data.supplierName,
					address: result.data.address,
					phoneNumber: result.data.phoneNumber,
					representName: result.data.representName || "",
					representPhoneNumber: result.data.representPhoneNumber || "",
					supplierType: result.data.supplierType,
					suppliedProductType: result.data.suppliedProductType,
					currentDebt: result.data.currentDebt,
				});
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể tải thông tin nhà cung cấp",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error loading supplier:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tải thông tin nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsFetching(false);
		}
	};

	const validatePhone = (phone: string): boolean => {
		if (!phone) return true;
		const phoneRegex = /^0[0-9]{9}$/;
		return phoneRegex.test(phone);
	};

	const handleSubmit = async () => {
		// Validate form
		const newErrors = {
			supplierName: "",
			phoneNumber: "",
			representPhoneNumber: "",
		};

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
			newErrors.representPhoneNumber
		) {
			return;
		}

		if (!supplierId) return;

		setIsLoading(true);

		try {
			const result = await supplierService.updateSupplier(supplierId, {
				supplierName: formData.supplierName,
				address: formData.address,
				phoneNumber: formData.phoneNumber,
				representName: formData.representName || undefined,
				representPhoneNumber: formData.representPhoneNumber || undefined,
				supplierType: formData.supplierType,
				suppliedProductType: formData.suppliedProductType,
				currentDebt: formData.currentDebt,
			});

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Cập nhật nhà cung cấp thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onSuccess?.();
				onClose();
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Có lỗi xảy ra khi cập nhật nhà cung cấp",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error updating supplier:", error);
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

	const handleCopyPhone = async () => {
		if (!supplierData?.phoneNumber) return;

		try {
			await navigator.clipboard.writeText(supplierData.phoneNumber);
			setIsPhoneCopied(true);
			setTimeout(() => setIsPhoneCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const handleCopyRepresentPhone = async () => {
		if (!supplierData?.representPhoneNumber) return;

		try {
			await navigator.clipboard.writeText(
				supplierData.representPhoneNumber,
			);
			setIsRepresentPhoneCopied(true);
			setTimeout(() => setIsRepresentPhoneCopied(false), 2000);
		} catch (error) {
			console.error("Failed to copy:", error);
		}
	};

	const switchToEditMode = () => {
		setMode("edit");
	};

	const handleDelete = async () => {
		if (!supplierId) return;

		setIsDeleting(true);

		try {
			const result = await supplierService.deleteSupplier(supplierId);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã xóa nhà cung cấp thành công",
					status: "success",
					duration: 3000,
					isClosable: true,
				});
				onDeleteDialogClose();
				onSuccess?.();
				onClose();
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Có lỗi xảy ra khi xóa nhà cung cấp",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error deleting supplier:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi xóa nhà cung cấp",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsDeleting(false);
		}
	};

	const formatCurrency = (value: number) => {
		return value.toLocaleString("vi-VN") + "đ";
	};

	const InfoRow = ({
		icon,
		label,
		value,
		onCopy,
		isCopied,
	}: {
		icon: React.ElementType;
		label: string;
		value?: string | number;
		onCopy?: () => void;
		isCopied?: boolean;
	}) => (
		<Flex
			align="center"
			gap={2}
			py={2}
			px={3}
			bg="gray.50"
			borderRadius="10px"
			cursor={onCopy ? "pointer" : "default"}
			onClick={onCopy}
			_hover={onCopy ? { bg: "gray.100" } : {}}
			transition="background 0.2s">
			<Icon
				as={icon}
				w="16px"
				h="16px"
				color="#161f70"
			/>
			<Box flex={1}>
				<Text
					fontSize="11px"
					fontWeight="600"
					color="gray.600"
					mb={0.5}>
					{label}
				</Text>
				<Flex
					align="center"
					gap={2}>
					<Text
						fontSize="13px"
						fontWeight="500"
						color="#161f70">
						{value || "N/A"}
					</Text>
					{onCopy && value && (
						<Tooltip
							label={isCopied ? "Đã copy!" : "Click để copy"}
							placement="top"
							hasArrow>
							<Box>
								<Icon
									as={isCopied ? FiCheck : FiCopy}
									w="14px"
									h="14px"
									color={isCopied ? "green.500" : "gray.500"}
								/>
							</Box>
						</Tooltip>
					)}
				</Flex>
			</Box>
		</Flex>
	);

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
					px={6}
					borderBottom="1px solid"
					borderColor="gray.100">
					{mode === "view"
						? "Thông tin chi tiết nhà cung cấp"
						: "Chỉnh sửa nhà cung cấp"}
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
					) : supplierData ? (
						<VStack
							spacing={5}
							align="stretch"
							mt={4}>
							{mode === "view" ? (
								/* VIEW MODE */
								<>
									{/* Header Info */}
									<Flex
										justify="space-between"
										align="flex-start"
										flexWrap="wrap"
										gap={4}>
										<Box>
											<Text
												fontSize="28px"
												fontWeight="700"
												color="#161f70"
												mb={1}>
												{supplierData.supplierName}
											</Text>
											<Text
												fontSize="16px"
												color="gray.600"
												fontWeight="600">
												Mã: {supplierData.supplierId}
											</Text>
										</Box>
										<Badge
											colorScheme="blue"
											fontSize="14px"
											px={4}
											py={2}
											borderRadius="full">
											{supplierData.supplierType}
										</Badge>
									</Flex>

									<Divider />

									{/* Basic Info Grid */}
									<Grid
										templateColumns={{
											base: "1fr",
											md: "repeat(2, 1fr)",
										}}
										gap={4}>
										<GridItem>
											<InfoRow
												icon={FiPhone}
												label="Số điện thoại"
												value={supplierData.phoneNumber}
												onCopy={handleCopyPhone}
												isCopied={isPhoneCopied}
											/>
										</GridItem>
										<GridItem>
											<InfoRow
												icon={FiUser}
												label="Người đại diện"
												value={supplierData.representName || "N/A"}
											/>
										</GridItem>
										<GridItem>
											<InfoRow
												icon={FiPhone}
												label="SĐT người đại diện"
												value={supplierData.representPhoneNumber || "N/A"}
												onCopy={
													supplierData.representPhoneNumber
														? handleCopyRepresentPhone
														: undefined
												}
												isCopied={isRepresentPhoneCopied}
											/>
										</GridItem>
										<GridItem>
											<Flex
												align="center"
												gap={2}
												py={2}
												px={3}
												bg="gray.50"
												borderRadius="10px">
												<Icon
													as={FiMapPin}
													w="16px"
													h="16px"
													color="#161f70"
													flexShrink={0}
												/>
												<Box flex={1}>
													<Text
														fontSize="11px"
														fontWeight="600"
														color="gray.600"
														mb={0.5}>
														Loại sản phẩm cung cấp
													</Text>
													<Text
														fontSize="13px"
														fontWeight="500"
														color="#161f70">
														{supplierData.suppliedProductType}
													</Text>
												</Box>
											</Flex>
										</GridItem>
										<GridItem colSpan={{ base: 1, md: 2 }}>
											<Flex
												align="center"
												gap={2}
												py={2}
												px={3}
												bg="gray.50"
												borderRadius="10px">
												<Icon
													as={FiMapPin}
													w="16px"
													h="16px"
													color="#161f70"
													flexShrink={0}
												/>
												<Box flex={1}>
													<Text
														fontSize="11px"
														fontWeight="600"
														color="gray.600"
														mb={0.5}>
														Địa chỉ
													</Text>
													<Tooltip
														label={supplierData.address}
														placement="top"
														hasArrow>
														<Text
															fontSize="13px"
															fontWeight="500"
															color="#161f70"
															noOfLines={1}
															cursor="default">
															{supplierData.address}
														</Text>
													</Tooltip>
												</Box>
											</Flex>
										</GridItem>
									</Grid>

									<Divider />

									{/* Debt Info */}
									<Box
										p={4}
										bg="orange.50"
										borderRadius="12px"
										borderLeft="4px solid"
										borderColor="orange.500">
										<Text
											fontSize="14px"
											fontWeight="600"
											color="gray.700"
											mb={1}>
											Công nợ hiện tại
										</Text>
										<Text
											fontSize="24px"
											fontWeight="700"
											color="orange.600">
											{formatCurrency(supplierData.currentDebt)}
										</Text>
									</Box>
								</>
							) : (
								/* EDIT MODE */
								<>
									<Grid
										templateColumns={{
											base: "1fr",
											md: "repeat(2, 1fr)",
										}}
										gap={5}>
										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl
												isRequired
												isInvalid={!!errors.supplierName}>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Tên nhà cung cấp
												</FormLabel>
												<Input
													value={formData.supplierName}
													onChange={(e) => {
														setFormData({
															...formData,
															supplierName: e.target.value,
														});
														setErrors({
															...errors,
															supplierName: "",
														});
													}}
													size="lg"
													borderColor={
														errors.supplierName
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.supplierName && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{errors.supplierName}
													</Text>
												)}
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl isRequired>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Loại nhà cung cấp
												</FormLabel>
												<Select
													value={formData.supplierType}
													onChange={(e) =>
														setFormData({
															...formData,
															supplierType: e.target
																.value as SupplierType,
														})
													}
													size="lg">
													<option value="Doanh nghiệp">
														Doanh nghiệp
													</option>
													<option value="Tư nhân">Tư nhân</option>
												</Select>
											</FormControl>
										</GridItem>

										<GridItem>
											<FormControl
												isRequired
												isInvalid={!!errors.phoneNumber}>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Số điện thoại
												</FormLabel>
												<Input
													value={formData.phoneNumber}
													onChange={(e) => {
														setFormData({
															...formData,
															phoneNumber: e.target.value,
														});
														setErrors({
															...errors,
															phoneNumber: "",
														});
													}}
													size="lg"
													borderColor={
														errors.phoneNumber
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.phoneNumber && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{errors.phoneNumber}
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
													Người đại diện
												</FormLabel>
												<Input
													value={formData.representName}
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

										<GridItem>
											<FormControl
												isInvalid={!!errors.representPhoneNumber}>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													SĐT người đại diện
												</FormLabel>
												<Input
													value={formData.representPhoneNumber}
													onChange={(e) => {
														setFormData({
															...formData,
															representPhoneNumber:
																e.target.value,
														});
														setErrors({
															...errors,
															representPhoneNumber: "",
														});
													}}
													size="lg"
													borderColor={
														errors.representPhoneNumber
															? "red.500"
															: "gray.300"
													}
												/>
												{errors.representPhoneNumber && (
													<Text
														color="red.500"
														fontSize="sm"
														mt={1}>
														{errors.representPhoneNumber}
													</Text>
												)}
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl isRequired>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Loại sản phẩm cung cấp
												</FormLabel>
												<Input
													value={formData.suppliedProductType}
													onChange={(e) =>
														setFormData({
															...formData,
															suppliedProductType: e.target.value,
														})
													}
													size="lg"
													placeholder="VD: Thịt cá tươi, Rau củ quả"
												/>
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl isRequired>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Địa chỉ
												</FormLabel>
												<Textarea
													value={formData.address}
													onChange={(e) =>
														setFormData({
															...formData,
															address: e.target.value,
														})
													}
													size="lg"
													rows={2}
													resize="vertical"
												/>
											</FormControl>
										</GridItem>

										<GridItem colSpan={{ base: 1, md: 2 }}>
											<FormControl>
												<FormLabel
													fontSize="16px"
													fontWeight="600"
													color="gray.700">
													Công nợ hiện tại (VND)
												</FormLabel>
												<Input
													type="number"
													value={formData.currentDebt}
													onChange={(e) =>
														setFormData({
															...formData,
															currentDebt: Number(
																e.target.value,
															),
														})
													}
													size="lg"
												/>
											</FormControl>
										</GridItem>
									</Grid>
								</>
							)}
						</VStack>
					) : (
						<Text
							textAlign="center"
							color="gray.500"
							py={10}>
							Không tìm thấy thông tin nhà cung cấp
						</Text>
					)}
				</ModalBody>

				<ModalFooter
					px={6}
					py={4}
					borderTop="1px solid"
					borderColor="gray.200">
					<Flex
						justify="space-between"
						w="full">
						{/* Left side - Delete button (only in view mode) */}
						<Box>
							{mode === "view" && supplierData && (
								<Button
									leftIcon={<Icon as={FiTrash2} />}
									colorScheme="red"
									variant="ghost"
									size="lg"
									onClick={onDeleteDialogOpen}
									_hover={{ bg: "red.50" }}>
									Xóa
								</Button>
							)}
						</Box>

						{/* Right side - Action buttons */}
						<HStack spacing={3}>
							<Button
								variant="ghost"
								size="lg"
								onClick={() => {
									if (mode === "edit") {
										setMode("view");
										// Reset form data
										if (supplierData) {
											setFormData({
												supplierName: supplierData.supplierName,
												address: supplierData.address,
												phoneNumber: supplierData.phoneNumber,
												representName:
													supplierData.representName || "",
												representPhoneNumber:
													supplierData.representPhoneNumber ||
													"",
												supplierType: supplierData.supplierType,
												suppliedProductType:
													supplierData.suppliedProductType,
												currentDebt: supplierData.currentDebt,
											});
										}
										setErrors({
											supplierName: "",
											phoneNumber: "",
											representPhoneNumber: "",
										});
									} else {
										onClose();
									}
								}}
								isDisabled={isLoading}
								_hover={{ bg: "gray.100" }}
								px={8}>
								{mode === "edit" ? "Quay lại" : "Đóng"}
							</Button>
							{mode === "edit" ? (
								<Button
									colorScheme="blue"
									size="lg"
									onClick={handleSubmit}
									isLoading={isLoading}
									loadingText="Đang cập nhật..."
									bg="#161f70"
									_hover={{ bg: "#0f1654" }}
									isDisabled={isFetching}
									px={8}>
									Cập nhật
								</Button>
							) : (
								supplierData && (
									<Button
										leftIcon={<Icon as={FiEdit2} />}
										colorScheme="blue"
										bg="#161f70"
										_hover={{ bg: "#0f1654" }}
										size="lg"
										onClick={switchToEditMode}
										px={8}>
										Chỉnh sửa
									</Button>
								)
							)}
						</HStack>
					</Flex>
				</ModalFooter>
			</ModalContent>

			{/* Delete Confirmation Dialog */}
			<AlertDialog
				isOpen={isDeleteDialogOpen}
				leastDestructiveRef={cancelRef}
				onClose={onDeleteDialogClose}
				isCentered>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader
							fontSize="lg"
							fontWeight="bold">
							Xác nhận xóa nhà cung cấp
						</AlertDialogHeader>

						<AlertDialogBody>
							Bạn có chắc chắn muốn xóa nhà cung cấp{" "}
							<Text
								as="span"
								fontWeight="bold"
								color="#161f70">
								{supplierData?.supplierName}
							</Text>
							? Hành động này không thể hoàn tác.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={cancelRef}
								onClick={onDeleteDialogClose}
								isDisabled={isDeleting}>
								Hủy
							</Button>
							<Button
								colorScheme="red"
								onClick={handleDelete}
								ml={3}
								isLoading={isDeleting}
								loadingText="Đang xóa...">
								Xóa
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</Modal>
	);
};

export default SupplierViewEditModal;
