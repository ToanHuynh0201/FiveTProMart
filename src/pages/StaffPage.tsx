import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	StaffTable,
	StaffSearchBar,
	StaffFilterBar,
	AddStaffModal,
	StaffViewEditModal,
} from "@/components/staff";
import { SalaryConfigModal, CalculateSalaryModal } from "@/components/salary";
import { Pagination } from "@/components/common";
import type { Staff, CreateStaffDTO } from "@/types/staff";
import { staffService, salaryService } from "@/services";
import {
	Box,
	Text,
	Flex,
	Spinner,
	useDisclosure,
	useToast,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Button,
	HStack,
	Input,
	VStack,
	Card,
	CardBody,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Stat,
	StatLabel,
	StatNumber,
} from "@chakra-ui/react";
import { FiDollarSign, FiClock, FiUsers } from "react-icons/fi";
import { useFilters } from "@/hooks/useFilters";
import { usePagination } from "@/hooks/usePagination";
import type { SalaryReport } from "@/types";

const ITEMS_PER_PAGE = 10;

interface StaffPageFilters {
	page: number;
	size: number;
	search: string;
	accountType: string;
	sortBy: string;
	order: string;
}

const StaffPage = () => {
	const toast = useToast();

	// State for Staff tab
	const [staffList, setStaffList] = useState<Staff[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
	const [viewEditMode, setViewEditMode] = useState<"view" | "edit">("view");

	// State for Salary tab
	const [salaryStartDate, setSalaryStartDate] = useState("");
	const [salaryEndDate, setSalaryEndDate] = useState("");
	const [salaryLoading, setSalaryLoading] = useState(false);
	const [salaryData, setSalaryData] = useState<SalaryReport | null>(null);

	// Salary modals
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

	// Use custom hooks for filters and pagination SEPARATELY
	const { filters, debouncedFilters, handleFilterChange, resetFilters } =
		useFilters<StaffPageFilters>({
			page: 1,
			size: ITEMS_PER_PAGE,
			search: "",
			accountType: "",
			sortBy: "fullName",
			order: "asc",
		});

	const {
		currentPage,
		total,
		pagination,
		goToPage,
		setTotal,
		startItem,
		endItem,
	} = usePagination({
		initialPage: 1,
		pageSize: ITEMS_PER_PAGE,
		initialTotal: 0,
	});

	// Modal controls
	const {
		isOpen: isAddModalOpen,
		onOpen: onAddModalOpen,
		onClose: onAddModalClose,
	} = useDisclosure();
	const {
		isOpen: isViewEditModalOpen,
		onOpen: onViewEditModalOpen,
		onClose: onViewEditModalClose,
	} = useDisclosure();

	// Fetch staff with filters
	const fetchStaffs = async () => {
		setIsLoading(true);
		try {
			const result = await staffService.getStaffs({
				page: currentPage - 1, // CRITICAL: Convert to zero-based
				size: debouncedFilters.size,
				search: debouncedFilters.search,
				accountType: debouncedFilters.accountType,
				sortBy: debouncedFilters.sortBy,
				order: debouncedFilters.order,
			});

			if (result.success) {
				setStaffList(result.data || []);
				setTotal(result.pagination?.totalItems || 0);
			} else {
				toast({
					title: "Lỗi tải dữ liệu",
					description: result.error,
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top-right",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch when filters or page change
	useEffect(() => {
		fetchStaffs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedFilters, currentPage]);

	// Initialize salary date range to current month
	useEffect(() => {
		const now = new Date();
		const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

		const formatDate = (date: Date) => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		};

		setSalaryStartDate(formatDate(firstDay));
		setSalaryEndDate(formatDate(now));
	}, []);

	// Load salary report
	const loadSalaryReport = async () => {
		if (!salaryStartDate || !salaryEndDate) {
			toast({
				title: "Lỗi",
				description: "Vui lòng chọn ngày bắt đầu và kết thúc",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
			return;
		}

		setSalaryLoading(true);
		try {
			const formatForApi = (dateStr: string) => {
				const date = new Date(dateStr);
				const day = String(date.getDate()).padStart(2, "0");
				const month = String(date.getMonth() + 1).padStart(2, "0");
				const year = date.getFullYear();
				return `${day}-${month}-${year}`;
			};

			const result = await salaryService.getSalaryReport({
				startDate: formatForApi(salaryStartDate),
				endDate: formatForApi(salaryEndDate),
			});

			if (result.success) {
				setSalaryData(result.data);
				toast({
					title: "Thành công",
					description: "Tải báo cáo lương thành công",
					status: "success",
					duration: 2000,
					isClosable: true,
				});
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Tải báo cáo lương thất bại",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Lỗi khi tải báo cáo lương",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setSalaryLoading(false);
		}
	};

	// Format currency with K/M suffix
	const formatCurrency = (value: number) => {
		if (value >= 1000000) {
			return `${(value / 1000000).toFixed(1)}M`;
		}
		if (value >= 1000) {
			return `${(value / 1000).toFixed(1)}K`;
		}
		return value.toFixed(0);
	};

	// Event handlers
	const handleSearch = (searchQuery: string) => {
		handleFilterChange("search", searchQuery);
		goToPage(1); // Reset to first page when searching
	};

	const handlePageChange = (page: number) => {
		goToPage(page);
	};

	const handleAccountTypeFilter = (type: string) => {
		handleFilterChange("accountType", type);
		goToPage(1);
	};

	const handleSortByChange = (sortBy: string) => {
		handleFilterChange("sortBy", sortBy);
		goToPage(1);
	};

	const handleOrderChange = (order: string) => {
		handleFilterChange("order", order);
		goToPage(1);
	};

	const handleResetFilters = () => {
		resetFilters();
		goToPage(1);
	};

	const handleViewDetails = (id: string) => {
		setSelectedStaffId(id);
		setViewEditMode("view");
		onViewEditModalOpen();
	};

	const handleEdit = (id: string) => {
		setSelectedStaffId(id);
		setViewEditMode("edit");
		onViewEditModalOpen();
	};

	const handleDelete = async (id: string) => {
		const result = await staffService.deleteStaff(id);

		if (result.success) {
			toast({
				title: "Thành công",
				description: "Xóa nhân viên thành công!",
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
			fetchStaffs();
		} else {
			toast({
				title: "Lỗi",
				description: result.error,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top-right",
			});
		}
	};

	const handleAddStaff = async (staffData: CreateStaffDTO) => {
		const result = await staffService.createStaff(staffData);

		if (result.success) {
			toast({
				title: "Thành công",
				description: result.message || "Tạo nhân viên thành công!",
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
			onAddModalClose();
			fetchStaffs();
		} else {
			toast({
				title: "Lỗi",
				description: result.error,
				status: "error",
				duration: 5000,
				isClosable: true,
				position: "top-right",
			});
		}
	};

	const handleViewEditSuccess = () => {
		fetchStaffs();
	};

	return (
		<MainLayout>
			<Box
				p={{ base: 4, md: 8 }}
				bg="gray.50"
				minH="100vh">
				<Box
					bg="white"
					p={{ base: 4, md: 8 }}
					borderRadius="xl"
					boxShadow="sm">
					<Tabs>
						<TabList
							mb={6}
							borderBottomWidth="2px"
							borderBottomColor="gray.200">
							<Tab
								fontSize="16px"
								fontWeight="600"
								color="gray.600"
								_selected={{
									color: "#161f70",
									borderBottomColor: "#161f70",
								}}
								display="flex"
								alignItems="center"
								gap={2}>
								<FiUsers size={20} />
								Quản lý nhân viên
							</Tab>
							<Tab
								fontSize="16px"
								fontWeight="600"
								color="gray.600"
								_selected={{
									color: "#161f70",
									borderBottomColor: "#161f70",
								}}
								display="flex"
								alignItems="center"
								gap={2}>
								<FiDollarSign size={20} />
								Lương
							</Tab>
						</TabList>

						<TabPanels>
							{/* Tab 1: Quản lý nhân viên */}
							<TabPanel>
								{/* Header */}
								<Flex
									justify="space-between"
									align={{ base: "flex-start", md: "center" }}
									mb={6}
									gap={4}
									flexDirection={{ base: "column", md: "row" }}>
									<Text
										fontSize={{ base: "24px", md: "28px" }}
										fontWeight="700"
										color="#161f70">
										Quản lý nhân viên
									</Text>
								</Flex>

								{/* Search Bar */}
								<Box mb={4}>
									<StaffSearchBar
										searchQuery={filters.search}
										onSearchChange={handleSearch}
										onAddStaff={onAddModalOpen}
									/>
								</Box>

								{/* Filter Bar */}
								<Box mb={4}>
									<StaffFilterBar
										accountType={filters.accountType}
										sortBy={filters.sortBy}
										order={filters.order}
										onAccountTypeChange={handleAccountTypeFilter}
										onSortByChange={handleSortByChange}
										onOrderChange={handleOrderChange}
										onReset={handleResetFilters}
									/>
								</Box>

								{/* Loading State */}
								{isLoading && (
									<Flex
										justify="center"
										align="center"
										minH="400px">
										<Spinner
											size="xl"
											color="#161f70"
											thickness="4px"
										/>
									</Flex>
								)}

								{/* Table */}
								{!isLoading && staffList.length > 0 && (
									<>
										<StaffTable
											staffList={staffList}
											onViewDetails={handleViewDetails}
											onEdit={handleEdit}
											onDelete={handleDelete}
										/>

										{/* Pagination */}
										{total > 0 && (
											<Box mt={6}>
												<Pagination
													currentPage={currentPage}
													totalPages={pagination.totalPages}
													totalItems={total}
													pageSize={filters.size}
													onPageChange={handlePageChange}
													itemLabel="nhân viên"
												/>
											</Box>
										)}
									</>
								)}

								{/* Empty State */}
								{!isLoading && staffList.length === 0 && (
									<Flex
										direction="column"
										justify="center"
										align="center"
										minH="400px"
										gap={4}>
										<Text
											fontSize="20px"
											fontWeight="500"
											color="gray.500">
											{filters.search || filters.accountType
												? "Không tìm thấy nhân viên nào"
												: "Chưa có nhân viên"}
										</Text>
									</Flex>
								)}

								{/* Show result count */}
								{!isLoading && staffList.length > 0 && total > 0 && (
									<Text
										mt={4}
										fontSize="14px"
										color="gray.600"
										textAlign="center">
										Hiển thị <strong>{startItem}</strong> -{" "}
										<strong>{endItem}</strong> trong tổng số{" "}
										<strong>{total}</strong> nhân viên
									</Text>
								)}
							</TabPanel>

							{/* Tab 2: Lương */}
							<TabPanel>
								{/* Header */}
								<Flex
									justify="space-between"
									align={{ base: "flex-start", md: "center" }}
									mb={6}
									gap={4}
									flexDirection={{ base: "column", md: "row" }}>
									<Text
										fontSize={{ base: "24px", md: "28px" }}
										fontWeight="700"
										color="#161f70">
										Báo cáo lương
									</Text>
									<HStack gap={2}>
										<Button
											colorScheme="blue"
											size="sm"
											leftIcon={<FiClock />}
											onClick={onConfigOpen}>
											Cấu hình lương
										</Button>
										<Button
											colorScheme="green"
											size="sm"
											leftIcon={<FiClock />}
											onClick={onCalculateOpen}>
											Tính lương
										</Button>
									</HStack>
								</Flex>

								{/* Date Range Filter */}
								<Card mb={6}>
									<CardBody>
										<VStack align="stretch" gap={4}>
											<HStack gap={4}>
												<Box flex={1}>
													<Text
														fontSize="sm"
														fontWeight="600"
														mb={2}
														color="gray.700">
														Ngày bắt đầu
													</Text>
													<Input
														type="date"
														value={salaryStartDate}
														onChange={(e) =>
															setSalaryStartDate(e.target.value)
														}
													/>
												</Box>
												<Box flex={1}>
													<Text
														fontSize="sm"
														fontWeight="600"
														mb={2}
														color="gray.700">
														Ngày kết thúc
													</Text>
													<Input
														type="date"
														value={salaryEndDate}
														onChange={(e) =>
															setSalaryEndDate(e.target.value)
														}
													/>
												</Box>
												<Button
													colorScheme="blue"
													isLoading={salaryLoading}
													alignSelf="flex-end"
													onClick={loadSalaryReport}>
													Tìm kiếm
												</Button>
											</HStack>
										</VStack>
									</CardBody>
								</Card>

								{/* Summary Stats */}
								{salaryData && (
									<HStack
										gap={4}
										mb={6}
										flexWrap="wrap">
										<Card flex={{ base: "1 1 calc(50% - 8px)", md: "1" }}>
											<CardBody>
												<Stat>
													<StatLabel fontSize="sm">
														Tổng chi phí lương
													</StatLabel>
													<StatNumber color="#161f70">
														{formatCurrency(
															salaryData.summary?.totalSalaryCost || 0
														)}{" "}
														VND
													</StatNumber>
												</Stat>
											</CardBody>
										</Card>
										<Card flex={{ base: "1 1 calc(50% - 8px)", md: "1" }}>
											<CardBody>
												<Stat>
													<StatLabel fontSize="sm">
														Tổng giờ làm
													</StatLabel>
													<StatNumber color="#161f70">
														{salaryData.summary?.totalWorkHours || 0} giờ
													</StatNumber>
												</Stat>
											</CardBody>
										</Card>
										<Card flex={{ base: "1 1 calc(50% - 8px)", md: "1" }}>
											<CardBody>
												<Stat>
													<StatLabel fontSize="sm">
														Số nhân viên
													</StatLabel>
													<StatNumber color="#161f70">
														{salaryData.summary?.totalStaffs || 0}
													</StatNumber>
												</Stat>
											</CardBody>
										</Card>
									</HStack>
								)}

								{/* Salary Loading */}
								{salaryLoading && (
									<Flex
										justify="center"
										align="center"
										minH="400px">
										<Spinner
											size="xl"
											color="#161f70"
											thickness="4px"
										/>
									</Flex>
								)}

								{/* Salary Table */}
								{!salaryLoading && salaryData && (
									<Card>
										<CardBody>
											<TableContainer>
												<Table variant="simple" size="sm">
													<Thead>
														<Tr
															bg="gray.100"
															borderBottomWidth="2px"
															borderBottomColor="gray.300">
															<Th
																fontWeight="700"
																color="gray.700"
																fontSize="sm">
																Tên nhân viên
															</Th>
															<Th
																fontWeight="700"
																color="gray.700"
																fontSize="sm">
																Chức vụ
															</Th>
															<Th
																fontWeight="700"
																color="gray.700"
																fontSize="sm"
																isNumeric>
																Tổng giờ
															</Th>
															<Th
																fontWeight="700"
																color="gray.700"
																fontSize="sm"
																isNumeric>
																Lương
															</Th>
															<Th
																fontWeight="700"
																color="gray.700"
																fontSize="sm">
																Ngày tính lương
															</Th>
														</Tr>
													</Thead>
													<Tbody>
														{salaryData.staffSalaryDetails &&
															salaryData.staffSalaryDetails.map(
																(staff) => (
																	<Tr
																		key={staff.userId}
																		borderBottomWidth="1px"
																		borderBottomColor="gray.200"
																		_hover={{
																			bg: "gray.50",
																		}}>
																		<Td fontSize="sm">
																			{staff.fullName}
																		</Td>
																		<Td fontSize="sm">
																			{staff.role}
																		</Td>
																		<Td fontSize="sm">
																			{salaryData?.range
																				? `${salaryData.range.startDate} - ${salaryData.range.endDate}`
																				: "-"}
																		</Td>
																		<Td
																			fontSize="sm"
																			isNumeric>
																			{staff.summary
																				?.totalWorkHours || 0}{" "}
																			giờ
																		</Td>
																		<Td
																			fontSize="sm"
																			isNumeric
																			fontWeight="600"
																			color="#161f70">
																			{formatCurrency(
																				staff.summary
																					?.totalSalary || 0
																			)}{" "}
																			VND
																		</Td>
																		<Td fontSize="sm">
																			{salaryData?.range
																				? `${salaryData.range.startDate} - ${salaryData.range.endDate}`
																				: "-"}
																		</Td>
																	</Tr>
																)
															)}
													</Tbody>
												</Table>
											</TableContainer>
										</CardBody>
									</Card>
								)}

								{/* Empty State */}
								{!salaryLoading && !salaryData && (
									<Flex
										direction="column"
										justify="center"
										align="center"
										minH="400px"
										gap={4}>
										<Text
											fontSize="20px"
											fontWeight="500"
											color="gray.500">
											Vui lòng chọn khoảng thời gian và tìm kiếm
										</Text>
									</Flex>
								)}
							</TabPanel>
						</TabPanels>
					</Tabs>
				</Box>

				{/* Modals */}
				<AddStaffModal
					isOpen={isAddModalOpen}
					onClose={onAddModalClose}
					onAdd={handleAddStaff}
				/>

				<StaffViewEditModal
					isOpen={isViewEditModalOpen}
					onClose={onViewEditModalClose}
					staffId={selectedStaffId}
					mode={viewEditMode}
					onSuccess={handleViewEditSuccess}
				/>

				<SalaryConfigModal
					isOpen={isConfigOpen}
					onClose={onConfigClose}
					onSuccess={() => {
						onConfigClose();
						loadSalaryReport();
					}}
				/>

				<CalculateSalaryModal
					isOpen={isCalculateOpen}
					onClose={onCalculateClose}
					onSuccess={() => {
						onCalculateClose();
						loadSalaryReport();
					}}
				/>
			</Box>
		</MainLayout>
	);
};

export default StaffPage;
