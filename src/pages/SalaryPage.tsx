import {
	Box,
	Container,
	Flex,
	Grid,
	Heading,
	Text,
	useDisclosure,
	Button,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	VStack,
	HStack,
	Input,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	Card,
	CardBody,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiDollarSign, FiUsers, FiClock } from "react-icons/fi";
import { LoadingSpinner } from "@/components/common";
import { SalaryConfigModal, CalculateSalaryModal } from "@/components/salary";
import { salaryService } from "@/services";
import type { SalaryReport } from "@/types";
import MainLayout from "@/components/layout/MainLayout";

const formatCurrency = (value: number) => {
	if (value >= 1000000) {
		return `${(value / 1000000).toFixed(1)}M`;
	}
	if (value >= 1000) {
		return `${(value / 1000).toFixed(0)}K`;
	}
	return value.toString();
};

export const SalaryPage: React.FC = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [salaryData, setSalaryData] = useState<SalaryReport | null>(null);

	const {
		isOpen: isConfigOpen,
		onOpen: onConfigOpen,
		onClose: onConfigClose,
	} = useDisclosure();

	const {
		isOpen: isCalculateOpen,
		onOpen: onCalculateOpen,
		onClose: onCalculateClose,
	} = useDisclosure();

	// Set default date range (current month)
	useEffect(() => {
		const now = new Date();
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

		const formatDate = (date: Date) => {
			const day = String(date.getDate()).padStart(2, "0");
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const year = date.getFullYear();
			return `${year}-${month}-${day}`;
		};

		setStartDate(formatDate(firstDay));
		setEndDate(formatDate(lastDay));
	}, []);

	const loadSalaryReport = async () => {
		if (!startDate || !endDate) {
			return;
		}

		setLoading(true);
		try {
			// Convert to dd-MM-yyyy format
			const convertDate = (dateStr: string) => {
				const [year, month, day] = dateStr.split("-");
				return `${day}-${month}-${year}`;
			};

			const response = await salaryService.getSalaryReport({
				startDate: convertDate(startDate),
				endDate: convertDate(endDate),
			});

			setSalaryData(response.data);
		} catch (error) {
			console.error("Failed to load salary report:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = () => {
		loadSalaryReport();
	};

	return (
		<MainLayout>
			<Box minH="100vh" bg="gray.50" py={8}>
				<Container maxW="container.2xl">
					{/* Header */}
					<Flex
						direction={{ base: "column", md: "row" }}
						justify="space-between"
						align={{ base: "flex-start", md: "center" }}
						gap={{ base: 4, md: 0 }}
						mb={{ base: 6, md: 8 }}
					>
						<Box>
							<Heading
								size={{ base: "lg", md: "xl" }}
								fontWeight="800"
								color="gray.800"
								mb={2}
							>
								Quản lý lương
							</Heading>
							<Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
								Xem báo cáo lương và cấu hình mức lương
							</Text>
						</Box>
						<HStack gap={2}>
							<Button
								colorScheme="blue"
								onClick={onConfigOpen}
								variant="outline"
							>
								⚙️ Cấu hình lương
							</Button>
							<Button colorScheme="green" onClick={onCalculateOpen}>
								📊 Tính lương
							</Button>
						</HStack>
					</Flex>

					{/* Date Range Filter */}
					<Card mb={8}>
						<CardBody>
							<VStack spacing={4} align="stretch">
								<HStack spacing={4}>
									<Box flex={1}>
										<Text fontSize="sm" fontWeight="bold" mb={2}>
											Ngày bắt đầu
										</Text>
										<Input
											type="date"
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
										/>
									</Box>
									<Box flex={1}>
										<Text fontSize="sm" fontWeight="bold" mb={2}>
											Ngày kết thúc
										</Text>
										<Input
											type="date"
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
										/>
									</Box>
									<Button
										colorScheme="blue"
										onClick={handleSearch}
										mt={6}
										isLoading={loading}
									>
										Tìm kiếm
									</Button>
								</HStack>
							</VStack>
						</CardBody>
					</Card>

					{loading ? (
						<Box
							h="50vh"
							display="flex"
							alignItems="center"
							justifyContent="center"
						>
							<LoadingSpinner />
						</Box>
					) : salaryData ? (
						<>
							{/* Summary Stats */}
							<Grid
								templateColumns={{
									base: "1fr",
									sm: "repeat(2, 1fr)",
									lg: "repeat(3, 1fr)",
								}}
								gap={{ base: 4, md: 6 }}
								mb={8}
							>
								<Card>
									<CardBody>
										<Stat>
											<StatLabel display="flex" alignItems="center" gap={2}>
												<Box
													as={FiDollarSign}
													fontSize="20px"
													color="blue.500"
												/>
												Tổng lương
											</StatLabel>
											<StatNumber fontSize="2xl">
												{formatCurrency(
													salaryData.summary.totalSalaryCost,
												)}{" "}
												đ
											</StatNumber>
											<StatHelpText>
												{salaryData.range.startDate} →{" "}
												{salaryData.range.endDate}
											</StatHelpText>
										</Stat>
									</CardBody>
								</Card>

								<Card>
									<CardBody>
										<Stat>
											<StatLabel display="flex" alignItems="center" gap={2}>
												<Box
													as={FiClock}
													fontSize="20px"
													color="orange.500"
												/>
												Tổng giờ công
											</StatLabel>
											<StatNumber fontSize="2xl">
												{salaryData.summary.totalWorkHours.toFixed(1)}h
											</StatNumber>
										</Stat>
									</CardBody>
								</Card>

								<Card>
									<CardBody>
										<Stat>
											<StatLabel display="flex" alignItems="center" gap={2}>
												<Box
													as={FiUsers}
													fontSize="20px"
													color="green.500"
												/>
												Số nhân viên
											</StatLabel>
											<StatNumber fontSize="2xl">
												{salaryData.summary.totalStaffs}
											</StatNumber>
										</Stat>
									</CardBody>
								</Card>
							</Grid>

							{/* Staff Salary Table */}
							<Card>
								<CardBody>
									<Heading size="md" mb={6}>
										Chi tiết lương nhân viên
									</Heading>
									<TableContainer>
										<Table variant="simple">
											<Thead bg="gray.100">
												<Tr>
													<Th>Tên nhân viên</Th>
													<Th>Chức vụ</Th>
													<Th isNumeric>Giờ công</Th>
													<Th isNumeric>Tổng lương</Th>
												</Tr>
											</Thead>
											<Tbody>
												{salaryData.staffSalaryDetails.map((staff) => (
													<Tr key={staff.userId}>
														<Td fontWeight="500">
															{staff.fullName}
														</Td>
														<Td>
															{staff.role === "SalesStaff"
																? "Bán hàng"
																: "Kho"}
														</Td>
														<Td isNumeric>
															{staff.totalWorkHours.toFixed(1)}h
														</Td>
														<Td
															isNumeric
															fontWeight="bold"
															color="green.600"
														>
															{formatCurrency(staff.totalSalary)} đ
														</Td>
													</Tr>
												))}
											</Tbody>
										</Table>
									</TableContainer>
								</CardBody>
							</Card>
						</>
					) : (
						<Box
							textAlign="center"
							py={12}
							px={4}
							bg="white"
							borderRadius="lg"
						>
							<Text color="gray.500" fontSize="lg">
								Chọn khoảng ngày để xem báo cáo lương
							</Text>
						</Box>
					)}
				</Container>
			</Box>

			{/* Modals */}
			<SalaryConfigModal
				isOpen={isConfigOpen}
				onClose={onConfigClose}
				onSuccess={loadSalaryReport}
			/>
			<CalculateSalaryModal
				isOpen={isCalculateOpen}
				onClose={onCalculateClose}
				onSuccess={loadSalaryReport}
			/>
		</MainLayout>
	);
};
