import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Button,
	VStack,
	HStack,
	Text,
	Select,
	IconButton,
	Box,
	useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import type { ShiftAssignment, Staff } from "@/types";
import { scheduleService } from "@/services/scheduleService";

interface EditScheduleModalProps {
	isOpen: boolean;
	onClose: () => void;
	date: string;
	shift: "morning" | "afternoon";
	assignments: ShiftAssignment[];
	onUpdate: () => void;
}

const EditScheduleModal = ({
	isOpen,
	onClose,
	date,
	shift,
	assignments,
	onUpdate,
}: EditScheduleModalProps) => {
	const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
	const [selectedStaffId, setSelectedStaffId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const toast = useToast();

	// Format date for display
	const formatDateDisplay = (dateStr: string) => {
		const date = new Date(dateStr);
		const days = [
			"Chủ nhật",
			"Thứ 2",
			"Thứ 3",
			"Thứ 4",
			"Thứ 5",
			"Thứ 6",
			"Thứ 7",
		];
		const dayOfWeek = days[date.getDay()];
		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		return `${dayOfWeek}, ${day}/${month}`;
	};

	useEffect(() => {
		if (isOpen) {
			loadAvailableStaff();
		}
	}, [isOpen, date, shift]);

	const loadAvailableStaff = async () => {
		try {
			const staff = await scheduleService.getAvailableStaff(date, shift);
			setAvailableStaff(staff);
		} catch (error) {
			console.error("Error loading available staff:", error);
		}
	};

	const handleAddStaff = async () => {
		if (!selectedStaffId) {
			toast({
				title: "Vui lòng chọn nhân viên",
				status: "warning",
				duration: 2000,
			});
			return;
		}

		setIsLoading(true);
		try {
			await scheduleService.createAssignment({
				staffId: selectedStaffId,
				date,
				shift,
			});

			toast({
				title: "Đã thêm nhân viên vào ca làm",
				status: "success",
				duration: 2000,
			});

			setSelectedStaffId("");
			loadAvailableStaff();
			onUpdate();
		} catch (error) {
			toast({
				title: "Lỗi khi thêm nhân viên",
				status: "error",
				duration: 2000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRemoveStaff = async (assignmentId: string) => {
		setIsLoading(true);
		try {
			await scheduleService.deleteAssignment(assignmentId);

			toast({
				title: "Đã xóa nhân viên khỏi ca làm",
				status: "success",
				duration: 2000,
			});

			loadAvailableStaff();
			onUpdate();
		} catch (error) {
			toast({
				title: "Lỗi khi xóa nhân viên",
				status: "error",
				duration: 2000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="lg">
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					<Text
						fontSize="24px"
						fontWeight="700"
						color="brand.600">
						Chỉnh sửa ca làm
					</Text>
					<Text
						fontSize="16px"
						fontWeight="400"
						color="gray.600"
						mt={1}>
						{formatDateDisplay(date)} - Ca{" "}
						{shift === "morning" ? "sáng" : "chiều"}
					</Text>
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody pb={6}>
					<VStack
						spacing={4}
						align="stretch">
						{/* Current assignments */}
						{assignments.length === 0 ? (
							<Box
								py={8}
								textAlign="center">
								<Text
									fontSize="16px"
									color="gray.500">
									Chưa có nhân viên được phân công
								</Text>
							</Box>
						) : (
							<>
								{/* Warehouse Staff Section */}
								<Box>
									<HStack
										mb={3}
										spacing={2}>
										<Box
											w="4px"
											h="20px"
											bg="blue.500"
											borderRadius="2px"
										/>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="brand.600">
											Nhân viên kho
										</Text>
									</HStack>
									{assignments.filter(
										(a) =>
											a.staffPosition === "Nhân viên kho",
									).length > 0 ? (
										<VStack
											spacing={2}
											align="stretch">
											{assignments
												.filter(
													(a) =>
														a.staffPosition ===
														"Nhân viên kho",
												)
												.map((assignment) => (
													<HStack
														key={assignment.id}
														justify="space-between"
														p={3}
														bg="blue.50"
														borderRadius="8px"
														borderLeft="3px solid"
														borderLeftColor="blue.500">
														<Text
															fontSize="14px"
															fontWeight="600"
															color="gray.800">
															{
																assignment.staffName
															}
														</Text>
														<IconButton
															aria-label="Xóa"
															icon={
																<DeleteIcon />
															}
															size="sm"
															colorScheme="red"
															variant="ghost"
															onClick={() =>
																handleRemoveStaff(
																	assignment.id,
																)
															}
															isDisabled={
																isLoading
															}
														/>
													</HStack>
												))}
										</VStack>
									) : (
										<Text
											fontSize="14px"
											color="gray.500"
											pl={3}>
											Chưa có nhân viên
										</Text>
									)}
								</Box>

								{/* Sales Staff Section */}
								<Box>
									<HStack
										mb={3}
										spacing={2}>
										<Box
											w="4px"
											h="20px"
											bg="green.500"
											borderRadius="2px"
										/>
										<Text
											fontSize="16px"
											fontWeight="700"
											color="brand.600">
											Nhân viên bán hàng
										</Text>
									</HStack>
									{assignments.filter(
										(a) =>
											a.staffPosition ===
											"Nhân viên bán hàng",
									).length > 0 ? (
										<VStack
											spacing={2}
											align="stretch">
											{assignments
												.filter(
													(a) =>
														a.staffPosition ===
														"Nhân viên bán hàng",
												)
												.map((assignment) => (
													<HStack
														key={assignment.id}
														justify="space-between"
														p={3}
														bg="green.50"
														borderRadius="8px"
														borderLeft="3px solid"
														borderLeftColor="green.500">
														<Text
															fontSize="14px"
															fontWeight="600"
															color="gray.800">
															{
																assignment.staffName
															}
														</Text>
														<IconButton
															aria-label="Xóa"
															icon={
																<DeleteIcon />
															}
															size="sm"
															colorScheme="red"
															variant="ghost"
															onClick={() =>
																handleRemoveStaff(
																	assignment.id,
																)
															}
															isDisabled={
																isLoading
															}
														/>
													</HStack>
												))}
										</VStack>
									) : (
										<Text
											fontSize="14px"
											color="gray.500"
											pl={3}>
											Chưa có nhân viên
										</Text>
									)}
								</Box>
							</>
						)}

						{/* Add new staff */}
						<Box>
							<Text
								fontSize="16px"
								fontWeight="600"
								mb={2}>
								Thêm nhân viên
							</Text>
							<HStack>
								<Select
									placeholder="Chọn nhân viên"
									value={selectedStaffId}
									onChange={(e) =>
										setSelectedStaffId(e.target.value)
									}
									isDisabled={isLoading}>
									{availableStaff.map((staff) => (
										<option
											key={staff.id}
											value={staff.id}>
											{staff.name} - {staff.position}
										</option>
									))}
								</Select>
								<Button
									colorScheme="blue"
									onClick={handleAddStaff}
									isLoading={isLoading}
									isDisabled={!selectedStaffId}>
									Thêm
								</Button>
							</HStack>
						</Box>
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default EditScheduleModal;
