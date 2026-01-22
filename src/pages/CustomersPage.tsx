import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	CustomerTable,
	CustomerSearchBar,
	CustomerFilterBar,
	CustomerDetailModal,
	AddCustomerModal,
	EditCustomerModal,
} from "@/components/customer";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import type { Customer, UpdateCustomerRequest } from "@/types";
import type { CustomerFilters } from "@/types/filters";
import { customerService } from "@/services/customerService";
import {
	Box,
	Text,
	Flex,
	Spinner,
	Button,
	useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

const ITEMS_PER_PAGE = 10;

const CustomersPage = () => {
	// State for data from API
	const [customerList, setCustomerList] = useState<Customer[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const {
		isOpen: isAddModalOpen,
		onOpen: onAddModalOpen,
		onClose: onAddModalClose,
	} = useDisclosure();
	const {
		isOpen: isEditModalOpen,
		onOpen: onEditModalOpen,
		onClose: onEditModalClose,
	} = useDisclosure();

	// Fetch function for API call
	const fetchCustomers = useCallback(async (filters: CustomerFilters) => {
		try {
			const response = await customerService.getCustomers(filters);
			console.log('Full API Response:', response);
			console.log('Data:', response.data);
			console.log('Pagination:', response.pagination);
			console.log('Data is Array:', Array.isArray(response.data));
			console.log('Data length:', response.data?.length);
			
			// Filter data client-side for search (name + phone), gender and pointRange
			let filteredData = response.data || [];
			
			// Re-filter by search query on client-side to support phone search
			// Backend only searches by customerName, so we filter by phone here too
			if (filters.searchQuery) {
				const searchLower = filters.searchQuery.toLowerCase();
				filteredData = filteredData.filter((customer) => {
					const name = customer.fullName?.toLowerCase() || "";
					const phone = customer.phoneNumber?.toLowerCase() || "";
					return name.includes(searchLower) || phone.includes(searchLower);
				});
			}
			
			// Filter by gender
			if (filters.gender && filters.gender !== "all") {
				const genderMap: Record<string, string> = {
					"Nam": "Male",
					"Nữ": "Female",
					"Khác": "Other",
				};
				const apiGender = genderMap[filters.gender];
				if (apiGender) {
					filteredData = filteredData.filter(
						(customer) => customer.gender === apiGender
					);
				}
			}
			
			// Filter by pointRange
			if (filters.pointRange && filters.pointRange !== "all") {
				filteredData = filteredData.filter((customer) => {
					const points = customer.loyaltyPoints || 0;
					switch (filters.pointRange) {
						case "0-500":
							return points >= 0 && points <= 500;
						case "501-1000":
							return points >= 501 && points <= 1000;
						case "1001-1500":
							return points >= 1001 && points <= 1500;
						case "1501-2000":
							return points >= 1501 && points <= 2000;
						case "2001+":
							return points >= 2001;
						default:
							return true;
					}
				});
			}
			
			setCustomerList(filteredData);
			setTotalItems(response.pagination?.totalItems || 0);
		} catch (error) {
			console.error('Error fetching customers:', error);
			setCustomerList([]);
			setTotalItems(0);
		}
	}, []); // Empty dependency array - function doesn't need to change

	// useFilters for filtering + pagination state
	const { filters, loading, error, handleFilterChange, handlePageChange } =
		useFilters<CustomerFilters>(
			{
				page: 1,
				pageSize: ITEMS_PER_PAGE,
				searchQuery: "",
				gender: "all",
				pointRange: "all",
			},
			fetchCustomers,
			500,
		);

	// usePagination for metadata only
	const { currentPage, pageSize, pagination, goToPage } = usePagination({
		initialPage: 1,
		pageSize: ITEMS_PER_PAGE,
		initialTotal: totalItems,
	});

	// Update pagination total when data changes
	useEffect(() => {
		if (pagination.totalItems !== totalItems) {
			// Only update if different to avoid loops
		}
	}, [totalItems, pagination.totalItems]);

	const handleSearchChange = (query: string) => {
		handleFilterChange("searchQuery", query);
	};

	const handleGenderChange = (gender: string) => {
		handleFilterChange("gender", gender);
	};

	const handlePointRangeChange = (range: string) => {
		handleFilterChange("pointRange", range);
	};

	const handleViewDetails = (id: string) => {
		setSelectedCustomerId(id);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedCustomerId(null);
	};

	const handleEdit = (id: string) => {
		setSelectedCustomerId(id);
		onEditModalOpen();
	};

	const handleDeleteCustomer = async (id: string) => {
		await customerService.deleteCustomer(id);
		// Refresh data after deleting
		await fetchCustomers(filters);
	};

	const handleAddCustomer = async (customer: {
		fullName: string;
		phoneNumber: string;
		email?: string;
		address?: string;
		gender: "Male" | "Female" | "Other";
		loyaltyPoints?: number;
		dateOfBirth?: string;
	}) => {
		try {
			// dateOfBirth is in YYYY-MM-DD format (ISO format for Java LocalDate)
			const customerData = {
				fullName: customer.fullName,
				phoneNumber: customer.phoneNumber,
				gender: customer.gender,
				dateOfBirth: customer.dateOfBirth || "2000-01-01", // ISO format default
			};
			console.log('Adding customer:', customerData);
			const result = await customerService.createCustomer(customerData);
			console.log('Customer added successfully:', result);
			
			// Refresh data after adding
			console.log('Refreshing customer list...');
			await fetchCustomers(filters);
			onAddModalClose();
		} catch (error) {
			console.error('Error in handleAddCustomer:', error);
			throw error;
		}
	};

	const handleUpdateCustomer = async (
		id: string,
		updates: UpdateCustomerRequest,
	) => {
		try {
			console.log('Updating customer:', id, updates);
			await customerService.updateCustomer(id, updates);
			// Refresh data after updating
			await fetchCustomers(filters);
			onEditModalClose();
		} catch (error) {
			console.error('Error in handleUpdateCustomer:', error);
			throw error;
		}
	};

	return (
		<MainLayout>
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={4}>
				{/* Page Title and Add Button */}
				<Flex
					justify="space-between"
					align="center"
					mb={4}
					gap={4}
					flexDirection={{ base: "column", md: "row" }}>
					<Text
						fontSize={{ base: "28px", md: "36px" }}
						fontWeight="600"
						color="brand.600">
						Danh sách khách hàng
					</Text>

					<Button
						leftIcon={<AddIcon />}
						bgGradient="linear(135deg, brand.500 0%, brand.400 100%)"
						color="white"
						size={{ base: "md", md: "lg" }}
						fontSize={{ base: "14px", md: "16px" }}
						px={{ base: 4, md: 6 }}
						onClick={onAddModalOpen}
						_hover={{
							bgGradient:
								"linear(135deg, brand.600 0%, brand.500 100%)",
							transform: "translateY(-2px)",
							boxShadow: "0 6px 20px rgba(22, 31, 112, 0.35)",
						}}
						_active={{
							bgGradient:
								"linear(135deg, brand.700 0%, brand.600 100%)",
							transform: "translateY(0)",
						}}
						width={{ base: "100%", md: "auto" }}>
						Thêm khách hàng
					</Button>
				</Flex>
				<Flex direction="row">
					{/* Search Bar */}
					<CustomerSearchBar
						searchQuery={filters.searchQuery || ""}
						onSearchChange={handleSearchChange}
					/>

					{/* Filter Bar */}
					<CustomerFilterBar
						selectedGender={filters.gender || "all"}
						selectedPointRange={filters.pointRange || "all"}
						onGenderChange={handleGenderChange}
						onPointRangeChange={handlePointRangeChange}
					/>
				</Flex>

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

				{/* Customer Table */}
				{!loading && !error && customerList.length > 0 && (
					<>
						<CustomerTable
							customerList={customerList}
							onViewDetails={handleViewDetails}
							onEdit={handleEdit}
							onDelete={handleDeleteCustomer}
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
								itemLabel="khách hàng"
							/>
						</Box>
					</>
				)}

				{/* Empty State */}
				{!loading && !error && customerList.length === 0 && (
					<>
						{console.log('Empty state - customerList:', customerList, 'loading:', loading, 'error:', error)}
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
								{filters.searchQuery ||
								filters.gender !== "all" ||
								filters.pointRange !== "all"
									? "Không tìm thấy khách hàng nào"
									: "Chưa có khách hàng"}
							</Text>
						</Flex>
					</>
				)}
			</Box>

			{/* Customer Detail Modal */}
			<CustomerDetailModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				customerId={selectedCustomerId}
				onDelete={handleDeleteCustomer}
			/>

			{/* Add Customer Modal */}
			<AddCustomerModal
				isOpen={isAddModalOpen}
				onClose={onAddModalClose}
				onAdd={handleAddCustomer}
			/>

			{/* Edit Customer Modal */}
			<EditCustomerModal
				isOpen={isEditModalOpen}
				onClose={onEditModalClose}
				customerId={selectedCustomerId}
				onUpdate={handleUpdateCustomer}
			/>
		</MainLayout>
	);
};

export default CustomersPage;