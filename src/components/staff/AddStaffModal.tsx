import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	ModalFooter,
	Button,
	FormControl,
	FormLabel,
	Input,
	Select,
	VStack,
	Grid,
	GridItem,
	useToast,
	Checkbox,
	HStack,
	Text,
} from "@chakra-ui/react";
import { useState } from "react";
import type { Staff } from "@/types";

interface AddStaffModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (staff: Omit<Staff, "id">) => void;
}

const AddStaffModal = ({ isOpen, onClose, onAdd }: AddStaffModalProps) => {
	const toast = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		position: "",
		shift: "",
		phone: "",
		email: "",
		address: "",
		dateOfBirth: "",
		hireDate: "",
		salary: "",
		status: "active" as "active" | "inactive" | "on-leave",
		workDays: [] as string[],
	});
	const workDayOptions = [
		"Thứ 2",
		"Thứ 3",
		"Thứ 4",
		"Thứ 5",
		"Thứ 6",
		"Thứ 7",
		"Chủ nhật",
	];

	const handleWorkDayToggle = (day: string) => {
		setFormData((prev) => ({
			...prev,
			workDays: prev.workDays.includes(day)
				? prev.workDays.filter((d) => d !== day)
				: [...prev.workDays, day],
		}));
	};

	const handleSubmit = async () => {
		// Validation
		if (!formData.name.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập tên nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!formData.position.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập vị trí công việc",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!formData.shift.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập ca làm việc",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!formData.phone.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập số điện thoại",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		if (!formData.email.trim()) {
			toast({
				title: "Lỗi",
				description: "Vui lòng nhập email",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const newStaff: Omit<Staff, "id"> = {
				name: formData.name.trim(),
				position: formData.position.trim(),
				shift: formData.shift.trim(),
				phone: formData.phone.trim(),
				email: formData.email.trim(),
				address: formData.address.trim() || undefined,
				dateOfBirth: formData.dateOfBirth || undefined,
				hireDate: formData.hireDate || undefined,
				salary: formData.salary ? Number(formData.salary) : undefined,
				status: formData.status,
				workDays:
					formData.workDays.length > 0
						? formData.workDays
						: undefined,
			};

			onAdd(newStaff);

			toast({
				title: "Thành công",
				description: "Thêm nhân viên mới thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			// Reset form
			setFormData({
				name: "",
				position: "",
				shift: "",
				phone: "",
				email: "",
				address: "",
				dateOfBirth: "",
				hireDate: "",
				salary: "",
				status: "active",
				workDays: [],
			});
			onClose();
		} catch (error) {
			console.error("Error adding staff:", error);
			toast({
				title: "Lỗi",
				description: "Không thể thêm nhân viên",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setFormData({
			name: "",
			position: "",
			shift: "",
			phone: "",
			email: "",
			address: "",
			dateOfBirth: "",
			hireDate: "",
			salary: "",
			status: "active",
			workDays: [],
		});
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="3xl"
			isCentered
			scrollBehavior="inside">
			<ModalOverlay
				bg="blackAlpha.600"
				backdropFilter="blur(4px)"
			/>
			<ModalContent
				borderRadius="24px"
				maxH="90vh"
				bg="white"
				boxShadow="0 20px 60px rgba(22, 31, 112, 0.3)">
				<ModalHeader
					borderBottom="1px solid"
					borderColor="gray.100"
					pb={4}
					pt={6}
					px={8}>
					<Text
						fontSize="24px"
						fontWeight="700"
						color="brand.600">
						Thêm nhân viên mới
					</Text>
				</ModalHeader>
				<ModalCloseButton
					top={6}
					right={6}
					color="gray.500"
					_hover={{ color: "brand.500", bg: "brand.50" }}
					borderRadius="full"
				/>

				<ModalBody
					px={8}
					py={6}>
					<VStack
						spacing={5}
						align="stretch">
						{/* Basic Information */}
						<Grid
							templateColumns="repeat(2, 1fr)"
							gap={4}>
							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Họ và tên
									</FormLabel>
									<Input
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										placeholder="Nguyễn Văn A"
										size="md"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Vị trí
									</FormLabel>
									<Select
										value={formData.position}
										onChange={(e) =>
											setFormData({
												...formData,
												position: e.target.value,
											})
										}
										placeholder="Chọn vị trí"
										size="md">
										<option value="Nhân viên bán hàng">
											Nhân viên bán hàng
										</option>
										<option value="Nhân viên kho">
											Nhân viên kho
										</option>
									</Select>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Contact Information */}
						<Grid
							templateColumns="repeat(2, 1fr)"
							gap={4}>
							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Số điện thoại
									</FormLabel>
									<Input
										value={formData.phone}
										onChange={(e) =>
											setFormData({
												...formData,
												phone: e.target.value,
											})
										}
										placeholder="0901234567"
										size="md"
										type="tel"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Email
									</FormLabel>
									<Input
										value={formData.email}
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
										placeholder="example@email.com"
										size="md"
										type="email"
									/>
								</FormControl>
							</GridItem>

							<GridItem colSpan={2}>
								<FormControl>
									<FormLabel
										fontSize="14px"
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
										placeholder="123 Đường ABC, Quận 1, TP.HCM"
										size="md"
									/>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Work Information */}
						<Grid
							templateColumns="repeat(2, 1fr)"
							gap={4}>
							<GridItem>
								<FormControl isRequired>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Ca làm việc
									</FormLabel>
									<Select
										value={formData.shift}
										onChange={(e) =>
											setFormData({
												...formData,
												shift: e.target.value,
											})
										}
										placeholder="Chọn ca làm việc"
										size="md">
										<option value="Sáng (6:00 - 12:00)">
											Sáng (6:00 - 12:00)
										</option>
										<option value="Chiều (12:00 - 18:00)">
											Chiều (12:00 - 18:00)
										</option>
									</Select>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Ngày sinh
									</FormLabel>
									<Input
										value={formData.dateOfBirth}
										onChange={(e) =>
											setFormData({
												...formData,
												dateOfBirth: e.target.value,
											})
										}
										placeholder="dd/mm/yyyy"
										size="md"
										type="date"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Ngày vào làm
									</FormLabel>
									<Input
										value={formData.hireDate}
										onChange={(e) =>
											setFormData({
												...formData,
												hireDate: e.target.value,
											})
										}
										size="md"
										type="date"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="14px"
										fontWeight="600"
										color="gray.700">
										Lương (VNĐ)
									</FormLabel>
									<Input
										value={formData.salary}
										onChange={(e) =>
											setFormData({
												...formData,
												salary: e.target.value,
											})
										}
										placeholder="8000000"
										size="md"
										type="number"
									/>
								</FormControl>
							</GridItem>

							<GridItem>
								<FormControl>
									<FormLabel
										fontSize="14px"
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
													| "inactive"
													| "on-leave",
											})
										}
										size="md">
										<option value="active">
											Đang làm việc
										</option>
										<option value="on-leave">
											Nghỉ phép
										</option>
										<option value="inactive">
											Không hoạt động
										</option>
									</Select>
								</FormControl>
							</GridItem>
						</Grid>

						{/* Work Days */}
						<FormControl>
							<FormLabel
								fontSize="14px"
								fontWeight="600"
								color="gray.700"
								mb={3}>
								Ngày làm việc trong tuần
							</FormLabel>
							<HStack
								spacing={3}
								flexWrap="wrap">
								{workDayOptions.map((day) => (
									<Checkbox
										key={day}
										isChecked={formData.workDays.includes(
											day,
										)}
										onChange={() =>
											handleWorkDayToggle(day)
										}
										colorScheme="brand"
										size="md">
										{day}
									</Checkbox>
								))}
							</HStack>
						</FormControl>
					</VStack>
				</ModalBody>

				<ModalFooter
					borderTop="1px solid"
					borderColor="gray.100"
					px={8}
					py={4}>
					<HStack spacing={3}>
						<Button
							variant="outline"
							onClick={handleCancel}
							isDisabled={isSubmitting}
							size="md">
							Hủy
						</Button>
						<Button
							colorScheme="brand"
							onClick={handleSubmit}
							isLoading={isSubmitting}
							loadingText="Đang thêm..."
							size="md">
							Thêm nhân viên
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default AddStaffModal;
