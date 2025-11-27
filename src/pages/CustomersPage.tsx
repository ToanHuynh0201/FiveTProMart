import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	CustomerCard,
	CustomerSearchBar,
	CustomerFilterBar,
	CustomerDetailModal,
} from "@/components/customer";
import { Pagination } from "@/components/common";
import { usePagination } from "@/hooks";
import { customerService } from "@/services/customerService";
import type { Customer } from "@/types";
import { Box, Text, SimpleGrid, Flex, Spinner } from "@chakra-ui/react";

const ITEMS_PER_PAGE = 8;

const CustomersPage = () => {
	const { currentPage, total, pageSize, pagination, goToPage, setTotal } =
		usePagination({
			initialPage: 1,
			pageSize: ITEMS_PER_PAGE,
			initialTotal: 0,
		});

	const [customerList, setCustomerList] = useState<Customer[]>([]);
	const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGender, setSelectedGender] = useState("all");
	const [selectedPointRange, setSelectedPointRange] = useState("all");
	const [isLoading, setIsLoading] = useState(true);
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Load customer data on mount
	useEffect(() => {
		const loadCustomers = async () => {
			setIsLoading(true);
			try {
				const data = await customerService.getAllCustomers();
				setCustomerList(data);
				setFilteredCustomers(data);
			} catch (error) {
				console.error("Error loading customers:", error);
			} finally {
				setIsLoading(false);
			}
		};
		loadCustomers();
	}, []);

	// Filter customers based on search query, gender, and points
	useEffect(() => {
		let filtered = customerList;

		// Filter by search query
		if (searchQuery.trim() !== "") {
			const lowerQuery = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(customer) =>
					customer.name.toLowerCase().includes(lowerQuery) ||
					customer.phone.includes(searchQuery),
			);
		}

		// Filter by gender
		if (selectedGender !== "all") {
			filtered = filtered.filter(
				(customer) => customer.gender === selectedGender,
			);
		}

		// Filter by points range
		if (selectedPointRange !== "all") {
			if (selectedPointRange === "0-500") {
				filtered = filtered.filter(
					(customer) =>
						customer.loyaltyPoints >= 0 &&
						customer.loyaltyPoints <= 500,
				);
			} else if (selectedPointRange === "501-1000") {
				filtered = filtered.filter(
					(customer) =>
						customer.loyaltyPoints >= 501 &&
						customer.loyaltyPoints <= 1000,
				);
			} else if (selectedPointRange === "1001-1500") {
				filtered = filtered.filter(
					(customer) =>
						customer.loyaltyPoints >= 1001 &&
						customer.loyaltyPoints <= 1500,
				);
			} else if (selectedPointRange === "1501-2000") {
				filtered = filtered.filter(
					(customer) =>
						customer.loyaltyPoints >= 1501 &&
						customer.loyaltyPoints <= 2000,
				);
			} else if (selectedPointRange === "2001+") {
				filtered = filtered.filter(
					(customer) => customer.loyaltyPoints > 2000,
				);
			}
		}

		setFilteredCustomers(filtered);
		setTotal(filtered.length);
		goToPage(1); // Reset to first page when filtering
	}, [
		searchQuery,
		selectedGender,
		selectedPointRange,
		customerList,
		setTotal,
		goToPage,
	]);

	// Pagination logic
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
	};

	const handleGenderChange = (gender: string) => {
		setSelectedGender(gender);
	};

	const handlePointRangeChange = (range: string) => {
		setSelectedPointRange(range);
	};

	const handleViewDetails = (id: string) => {
		setSelectedCustomerId(id);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedCustomerId(null);
	};

	const handleDeleteCustomer = async (id: string) => {
		try {
			const success = await customerService.deleteCustomer(id);
			if (success) {
				setCustomerList((prev) =>
					prev.filter((customer) => customer.id !== id),
				);
			}
		} catch (error) {
			console.error("Error deleting customer:", error);
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
					Danh sách khách hàng
				</Text>

				{/* Search Bar */}
				<CustomerSearchBar
					searchQuery={searchQuery}
					onSearchChange={handleSearchChange}
				/>

				{/* Filter Bar */}
				<CustomerFilterBar
					selectedGender={selectedGender}
					selectedPointRange={selectedPointRange}
					onGenderChange={handleGenderChange}
					onPointRangeChange={handlePointRangeChange}
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

				{/* Customer Grid */}
				{!isLoading && currentCustomers.length > 0 && (
					<>
						<SimpleGrid
							columns={{ base: 1, sm: 2, lg: 3, xl: 4 }}
							spacing={6}
							mb={8}>
							{currentCustomers.map((customer) => (
								<CustomerCard
									key={customer.id}
									customer={customer}
									onViewDetails={handleViewDetails}
									onDelete={handleDeleteCustomer}
								/>
							))}
						</SimpleGrid>

						{/* Pagination */}
						<Pagination
							currentPage={currentPage}
							totalPages={pagination.totalPages}
							totalItems={total}
							pageSize={pageSize}
							onPageChange={goToPage}
							showInfo={true}
							itemLabel="khách hàng"
						/>
					</>
				)}

				{/* Empty State */}
				{!isLoading && currentCustomers.length === 0 && (
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
							{searchQuery ||
							selectedGender !== "all" ||
							selectedPointRange !== "all"
								? "Không tìm thấy khách hàng nào"
								: "Chưa có khách hàng"}
						</Text>
					</Flex>
				)}
			</Box>

			{/* Customer Detail Modal */}
			<CustomerDetailModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				customerId={selectedCustomerId}
				onDelete={handleDeleteCustomer}
			/>
		</MainLayout>
	);
};

export default CustomersPage;
