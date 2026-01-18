import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	StaffTable,
	StaffSearchBar,
	StaffFilterBar,
	AddStaffModal,
	StaffViewEditModal,
} from "@/components/staff";
import { Pagination } from "@/components/common";
import type { Staff, CreateStaffDTO } from "@/types/staff";
import { staffService } from "@/services/staffService";
import {
	Box,
	Text,
	Flex,
	Spinner,
	Button,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useFilters } from "@/hooks/useFilters";
import { usePagination } from "@/hooks/usePagination";

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

	// State for data from API
	const [staffList, setStaffList] = useState<Staff[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
	const [viewEditMode, setViewEditMode] = useState<"view" | "edit">("view");

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
					{/* Header */}
					<Flex
						justify="space-between"
						align={{ base: "flex-start", md: "center" }}
						mb={6}
						gap={4}
						flexDirection={{ base: "column", md: "row" }}>
						<Text
							fontSize={{ base: "24px", md: "32px" }}
							fontWeight="700"
							color="#161f70">
							Quản lý nhân viên
						</Text>
						<Button
							leftIcon={<AddIcon />}
							colorScheme="blue"
							size={{ base: "md", md: "lg" }}
							onClick={onAddModalOpen}
							bg="#161f70"
							_hover={{ bg: "#0f1654" }}
							px={6}
							boxShadow="md">
							Thêm nhân viên
						</Button>
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
			</Box>
		</MainLayout>
	);
};

export default StaffPage;
