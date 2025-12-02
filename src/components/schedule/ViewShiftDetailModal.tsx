import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Text,
	VStack,
	HStack,
	Box,
	Divider,
	Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import type { ShiftAssignment } from "@/types";
import { scheduleService } from "@/services/scheduleService";

interface ViewShiftDetailModalProps {
	isOpen: boolean;
	onClose: () => void;
	date: string;
	shift: string; // Changed from "morning" | "afternoon" to string (shift ID)
	assignments: ShiftAssignment[];
}

const ViewShiftDetailModal = ({
	isOpen,
	onClose,
	date,
	shift,
	assignments,
}: ViewShiftDetailModalProps) => {
	const [shiftName, setShiftName] = useState<string>("");

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
		const year = date.getFullYear();
		return `${dayOfWeek}, ${day}/${month}/${year}`;
	};

	useEffect(() => {
		if (isOpen) {
			loadShiftName();
		}
	}, [isOpen, shift]);

	const loadShiftName = async () => {
		try {
			const config = await scheduleService.getShiftConfig();
			const shiftTemplate = config.shifts.find((s) => s.id === shift);
			setShiftName(shiftTemplate?.name || "");
		} catch (error) {
			console.error("Error loading shift name:", error);
		}
	};

	// Separate assignments by position
	const warehouseStaff = assignments.filter(
		(a) => a.staffPosition === "Nhân viên kho",
	);
	const salesStaff = assignments.filter(
		(a) => a.staffPosition === "Nhân viên bán hàng",
	);

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="md">
			<ModalOverlay />
			<ModalContent borderRadius="16px">
				<ModalHeader>
					<Text
						fontSize="24px"
						fontWeight="700"
						color="brand.600">
						Chi tiết ca làm
					</Text>
					<Text
						fontSize="16px"
						fontWeight="400"
						color="gray.600"
						mt={1}>
						{formatDateDisplay(date)} - {shiftName}
					</Text>
				</ModalHeader>
				<ModalCloseButton />

				<ModalBody pb={6}>
					<VStack
						spacing={4}
						align="stretch">
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
									{warehouseStaff.length > 0 ? (
										<VStack
											spacing={2}
											align="stretch">
											{warehouseStaff.map(
												(assignment) => (
													<Box
														key={assignment.id}
														p={3}
														bg="blue.50"
														borderRadius="8px"
														borderLeft="3px solid"
														borderLeftColor="blue.500">
														<HStack
															justify="space-between"
															align="start">
															<VStack
																align="start"
																spacing={1}>
																<Text
																	fontSize="16px"
																	fontWeight="600"
																	color="gray.800">
																	{
																		assignment.staffName
																	}
																</Text>
																{assignment.notes && (
																	<Text
																		fontSize="13px"
																		color="gray.600">
																		{
																			assignment.notes
																		}
																	</Text>
																)}
															</VStack>
															<Badge
																colorScheme={
																	assignment.status ===
																	"completed"
																		? "green"
																		: assignment.status ===
																		  "absent"
																		? "red"
																		: assignment.status ===
																		  "late"
																		? "orange"
																		: "blue"
																}
																fontSize="11px"
																px={2}
																py={1}>
																{assignment.status ===
																"completed"
																	? "Hoàn thành"
																	: assignment.status ===
																	  "absent"
																	? "Vắng mặt"
																	: assignment.status ===
																	  "late"
																	? "Đi muộn"
																	: "Đã lên lịch"}
															</Badge>
														</HStack>
													</Box>
												),
											)}
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

								<Divider />

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
									{salesStaff.length > 0 ? (
										<VStack
											spacing={2}
											align="stretch">
											{salesStaff.map((assignment) => (
												<Box
													key={assignment.id}
													p={3}
													bg="green.50"
													borderRadius="8px"
													borderLeft="3px solid"
													borderLeftColor="green.500">
													<HStack
														justify="space-between"
														align="start">
														<VStack
															align="start"
															spacing={1}>
															<Text
																fontSize="16px"
																fontWeight="600"
																color="gray.800">
																{
																	assignment.staffName
																}
															</Text>
															{assignment.notes && (
																<Text
																	fontSize="13px"
																	color="gray.600">
																	{
																		assignment.notes
																	}
																</Text>
															)}
														</VStack>
														<Badge
															colorScheme={
																assignment.status ===
																"completed"
																	? "green"
																	: assignment.status ===
																	  "absent"
																	? "red"
																	: assignment.status ===
																	  "late"
																	? "orange"
																	: "blue"
															}
															fontSize="11px"
															px={2}
															py={1}>
															{assignment.status ===
															"completed"
																? "Hoàn thành"
																: assignment.status ===
																  "absent"
																? "Vắng mặt"
																: assignment.status ===
																  "late"
																? "Đi muộn"
																: "Đã lên lịch"}
														</Badge>
													</HStack>
												</Box>
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
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

export default ViewShiftDetailModal;
