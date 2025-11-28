import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	StaffTable,
	StaffSearchBar,
	StaffDetailModal,
	AddStaffModal,
} from "@/components/staff";
import { Pagination } from "@/components/common";
import { usePagination } from "@/hooks";
import { staffService } from "@/services/staffService";
import type { Staff } from "@/types";
import { Box, Text, Flex, Spinner } from "@chakra-ui/react";

const ITEMS_PER_PAGE = 10;

const StaffPage = () => {
	const { currentPage, total, pageSize, pagination, goToPage, setTotal } =
		usePagination({
			initialPage: 1,
			pageSize: ITEMS_PER_PAGE,
			initialTotal: 0,
		});

	const [staffList, setStaffList] = useState<Staff[]>([]);
	const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);

	// Load staff data on mount
	useEffect(() => {
		const loadStaff = async () => {
			setIsLoading(true);
			try {
				const data = await staffService.getAllStaff();
				setStaffList(data);
				setFilteredStaff(data);
			} catch (error) {
				console.error("Error loading staff:", error);
			} finally {
				setIsLoading(false);
			}
		};
		loadStaff();
	}, []);

	// Filter staff based on search query
	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredStaff(staffList);
			setTotal(staffList.length);
		} else {
			const filtered = staffList.filter((staff) =>
				staff.name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
			setFilteredStaff(filtered);
			setTotal(filtered.length);
		}
		goToPage(1); // Reset to first page when searching
	}, [searchQuery, staffList, setTotal, goToPage]);

	// Pagination logic
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const currentStaff = filteredStaff.slice(startIndex, endIndex);

	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
	};

	const handleAddStaff = () => {
		setIsAddModalOpen(true);
	};

	const handleAddStaffSubmit = async (newStaff: Omit<Staff, "id">) => {
		try {
			const addedStaff = await staffService.addStaff(newStaff);
			setStaffList((prev) => [...prev, addedStaff]);
		} catch (error) {
			console.error("Error adding staff:", error);
		}
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
		try {
			const success = await staffService.deleteStaff(id);
			if (success) {
				setStaffList((prev) => prev.filter((staff) => staff.id !== id));
			}
		} catch (error) {
			console.error("Error deleting staff:", error);
			throw error;
		}
	};

	return (
		<MainLayout>
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={6}>
				{/* Page Title */}
				<Text
					fontSize={{ base: "28px", md: "36px" }}
					fontWeight="600"
					color="brand.600"
					mb={6}>
					Danh sách nhân sự
				</Text>

				{/* Search Bar */}
				<StaffSearchBar
					searchQuery={searchQuery}
					onSearchChange={handleSearchChange}
					onAddStaff={handleAddStaff}
				/>

				{/* Loading State */}
				{isLoading && (
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

				{/* Staff Table */}
				{!isLoading && currentStaff.length > 0 && (
					<>
						<StaffTable
							staffList={currentStaff}
							onViewDetails={handleViewDetails}
							onDelete={handleDeleteStaff}
						/>

						{/* Pagination */}
						<Box mt={6}>
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={total}
								pageSize={pageSize}
								onPageChange={goToPage}
								showInfo={true}
								itemLabel="nhân viên"
							/>
						</Box>
					</>
				)}

				{/* Empty State */}
				{!isLoading && currentStaff.length === 0 && (
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
							{searchQuery
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
