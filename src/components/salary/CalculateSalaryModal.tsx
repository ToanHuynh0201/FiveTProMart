import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalCloseButton,
	ModalBody,
	ModalFooter,
	Button,
	FormControl,
	FormLabel,
	Input,
	useToast,
	Box,
	Text,
	VStack,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { salaryService } from "@/services";
import type { StaffSalaryDetail } from "@/types";

interface CalculateSalaryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: (date: string) => void; // Pass calculated date back
}

export const CalculateSalaryModal: React.FC<CalculateSalaryModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
}) => {
	const toast = useToast();
	const [selectedDate, setSelectedDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<any>(null);
	const [staffDetails, setStaffDetails] = useState<StaffSalaryDetail[]>([]);
	const [loadingDetails, setLoadingDetails] = useState(false);

	const handleCalculate = async () => {
		if (!selectedDate) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn ngày",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setLoading(true);
		try {
			// Convert date format to dd-MM-yyyy
			const [year, month, day] = selectedDate.split("-");
			const dateStr = `${day}-${month}-${year}`;

			const response = await salaryService.calculateDailySalary({
				date: dateStr,
			});

			if (!response.success) {
				throw new Error(response.message || "Tính lương thất bại");
			}

			setResult(response.data);

			// Load salary details for the calculated date
			setLoadingDetails(true);
			try {
				const reportResponse = await salaryService.getSalaryReport({
					startDate: dateStr,
					endDate: dateStr,
				});

				if (reportResponse.success && reportResponse.data) {
					const details = reportResponse.data.staffSalaryDetails || [];
					console.log("Salary details from API:", details);
					
					// Backend returns "Staff {userId}" format, fetch real names
					if (details.length > 0) {
						try {
							const { staffService: staffSvc } = await import("@/services");
							const enrichedDetails = await Promise.all(
								details.map(async (detail) => {
									try {
										const staffInfo = await staffSvc.getStaffById(detail.userId);
										if (staffInfo.success && staffInfo.data) {
											return {
												...detail,
												fullName: staffInfo.data.fullName,
											};
										}
									} catch (err) {
										// Staff might be deleted, keep original fullName
										console.warn(`Staff ${detail.userId} not found, using fallback name`);
									}
									// Fallback: extract just the userId or keep original
									return {
										...detail,
										fullName: detail.userId, // Show userId instead of "Staff {uuid}"
									};
								})
							);
							setStaffDetails(enrichedDetails);
						} catch (err) {
							console.error("Failed to enrich staff details:", err);
							setStaffDetails(details);
						}
					} else {
						setStaffDetails(details);
					}
				}
			} catch (err) {
				console.error("Failed to load salary details:", err);
			} finally {
				setLoadingDetails(false);
			}

			toast({
				title: "Thành công",
				description: "Tính lương hàng ngày thành công",
				status: "success",
				duration: 3000,
				isClosable: true,
			});

			// Pass calculated date back to parent
			onSuccess?.(dateStr);
		} catch (error: any) {
			console.error("Calculate salary error:", error);
			toast({
				title: "Lỗi",
				description:
					error?.message ||
					"Không thể tính lương. Ngày phải trước hôm nay.",
				status: "error",
				duration: 4000,
				isClosable: true,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setSelectedDate("");
		setResult(null);
		setStaffDetails([]);
		onClose();
	};

	const formatCurrency = (value: number) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}
		return value.toFixed(0);
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} size="xl">
			<ModalOverlay />
			<ModalContent maxH="90vh">
				<ModalHeader>Tính lương hàng ngày</ModalHeader>
				<ModalCloseButton isDisabled={loading} />
				<ModalBody overflowY="auto">
					{!result ? (
						<VStack spacing={4}>
							<FormControl>
								<FormLabel>Chọn ngày tính lương</FormLabel>
								<Input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									isDisabled={loading}
									max={
										new Date(Date.now() - 86400000)
											.toISOString()
											.split("T")[0]
									}
								/>
								<Text fontSize="xs" color="gray.600" mt={2}>
									Ngày phải trước hôm nay
								</Text>
							</FormControl>
						</VStack>
					) : (
						<VStack spacing={4} align="stretch">
							<Box
								p={4}
								bg="green.50"
								borderRadius="md"
								borderLeft="4px"
								borderColor="green.500"
								w="full"
							>
								<Text fontWeight="bold" color="green.800" mb={2}>
									Tính lương thành công
								</Text>
								<Text color="green.700">
									Ngày: {result.processedDate}
								</Text>
								<Text color="green.700">Trạng thái: {result.status}</Text>
							</Box>

							{/* Staff Salary Details */}
							<Box>
								<Text fontSize="md" fontWeight="600" mb={3} color="gray.700">
									Danh sách nhân viên đã tính lương
								</Text>

								{loadingDetails ? (
									<Box display="flex" justifyContent="center" py={4}>
										<Spinner color="blue.500" />
									</Box>
								) : staffDetails.length > 0 ? (
									<TableContainer
										borderWidth="1px"
										borderColor="gray.200"
										borderRadius="md"
									>
										<Table size="sm" variant="simple">
											<Thead bg="gray.50">
												<Tr>
													<Th fontSize="xs">Tên nhân viên</Th>
													<Th fontSize="xs">Chức vụ</Th>
													<Th fontSize="xs" isNumeric>
														Giờ công
													</Th>
													<Th fontSize="xs" isNumeric>
														Lương
													</Th>
												</Tr>
											</Thead>
											<Tbody>
												{staffDetails.map((staff) => (
													<Tr key={staff.userId}>
														<Td fontSize="sm">{staff.fullName}</Td>
														<Td fontSize="sm">{staff.role}</Td>
														<Td fontSize="sm" isNumeric>
															{staff.totalWorkHours} giờ
														</Td>
														<Td
															fontSize="sm"
															isNumeric
															fontWeight="600"
															color="blue.600"
														>
															{formatCurrency(staff.totalSalary)} VND
														</Td>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								) : (
									<Box
										p={4}
										bg="gray.50"
										borderRadius="md"
										textAlign="center"
									>
										<Text fontSize="sm" color="gray.600">
											Không có nhân viên nào được tính lương trong ngày này
										</Text>
									</Box>
								)}
							</Box>
						</VStack>
					)}
				</ModalBody>
				<ModalFooter gap={3}>
					<Button variant="ghost" onClick={handleClose} isDisabled={loading}>
						{result ? "Đóng" : "Hủy"}
					</Button>
					{!result && (
						<Button
							colorScheme="blue"
							onClick={handleCalculate}
							isLoading={loading}
						>
							Tính lương
						</Button>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};
