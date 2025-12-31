import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	StaffTable,
	StaffSearchBar,
	StaffDetailModal,
	AddStaffModal,
} from "@/components/staff";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import type { Staff } from "@/types";
import type { StaffFilters } from "@/types/filters";
import { staffService } from "@/services/staffService";
import { Box, Text, Flex, Spinner } from "@chakra-ui/react";

const ITEMS_PER_PAGE = 10;

const StaffPage = () => {
	// State for data from API
	const [staffList, setStaffList] = useState<Staff[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	// Fetch function for API call
	const fetchStaff = async (filters: StaffFilters) => {
		const response = await staffService.getStaff(filters);
		setStaffList(response.data);
		setTotalItems(response.pagination.totalItems);
	};

	// useFilters for filtering + pagination state
	const { filters, loading, error, handleFilterChange, handlePageChange } =
		useFilters<StaffFilters>(
			{
				page: 1,
				pageSize: ITEMS_PER_PAGE,
				searchQuery: "",
			},
			fetchStaff,
			500,
		);

	// usePagination for metadata only
	const { currentPage, pageSize, pagination, goToPage } = usePagination({
		initialPage: filters.page,
		pageSize: filters.pageSize,
		initialTotal: totalItems,
	});

	// Sync pagination with filters
	useEffect(() => {
		if (currentPage !== filters.page) {
			goToPage(filters.page);
		}
	}, [filters.page, currentPage, goToPage]);

	const handleSearchChange = (query: string) => {
		handleFilterChange("searchQuery", query);
	};

	const handleAddStaff = () => {
		setIsAddModalOpen(true);
	};

	const handleAddStaffSubmit = async (newStaff: Omit<Staff, "id">) => {
		await staffService.createStaff(newStaff);
		// Refresh data after adding
		await fetchStaff(filters);
		setIsAddModalOpen(false);
	};

	const handleViewDetails = (id: string) => {
		setSelectedStaffId(id);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedStaffId(null);
	};

	const handleCloseAddModal = () => {
		setIsAddModalOpen(false);
	};

	const handleDeleteStaff = async (id: string) => {
		await staffService.deleteStaff(id);
		// Refresh data after deleting
		await fetchStaff(filters);
	};

	return (
		<MainLayout>
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={3}>
				{/* Page Title */}
				<Text
					fontSize={{ base: "24px", md: "28px" }}
					fontWeight="600"
					color="brand.600"
					mb={4}>
					Danh sách nhân sự
				</Text>

				{/* Search Bar */}
				<StaffSearchBar
					searchQuery={filters.searchQuery || ""}
					onSearchChange={handleSearchChange}
					onAddStaff={handleAddStaff}
				/>

				{/* Loading State */}
				{loading && (
					<Flex
						justify="center"
						align="center"
						minH="400px">
						<Spinner
							size="xl"
							color="brand.500"
							thickness="4px"
						/>
					</Flex>
				)}

				{/* Error State */}
				{error && (
					<Flex
						justify="center"
						align="center"
						minH="400px">
						<Text
							fontSize="18px"
							color="red.500">
							{error}
						</Text>
					</Flex>
				)}

				{/* Staff Table */}
				{!loading && !error && staffList.length > 0 && (
					<>
						<StaffTable
							staffList={staffList}
							onViewDetails={handleViewDetails}
							onDelete={handleDeleteStaff}
						/>

						{/* Pagination */}
						<Box mt={3}>
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={totalItems}
								pageSize={pageSize}
								onPageChange={handlePageChange}
								showInfo={true}
								itemLabel="nhân viên"
							/>
						</Box>
					</>
				)}

				{/* Empty State */}
				{!loading && !error && staffList.length === 0 && (
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
							{filters.searchQuery
								? "Không tìm thấy nhân viên nào"
								: "Chưa có nhân viên"}
						</Text>
					</Flex>
				)}
			</Box>

			{/* Staff Detail Modal */}
			<StaffDetailModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				staffId={selectedStaffId}
				onDelete={handleDeleteStaff}
			/>

			{/* Add Staff Modal */}
			<AddStaffModal
				isOpen={isAddModalOpen}
				onClose={handleCloseAddModal}
				onAdd={handleAddStaffSubmit}
			/>
		</MainLayout>
	);
};

export default StaffPage;
