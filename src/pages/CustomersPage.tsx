import { useState, useEffect } from "react";
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
import type { Customer } from "@/types";
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
	const fetchCustomers = async (filters: CustomerFilters) => {
		const response = await customerService.getCustomers(filters);
		setCustomerList(response.data);
		setTotalItems(response.pagination.totalItems);
	};

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

	const handleAddCustomer = async (customer: Omit<Customer, "customerId">) => {
		// Transform to match CustomerRequest - ensure required fields are not null
		// AddCustomerModal validates that these fields are never null before calling this
		if (!customer.dateOfBirth || !customer.gender) {
			throw new Error("Date of birth and gender are required");
		}
		const request = {
			fullName: customer.fullName,
			phoneNumber: customer.phoneNumber,
			gender: customer.gender,
			dateOfBirth: customer.dateOfBirth,
		};
		await customerService.createCustomer(request);
		// Refresh data after adding
		await fetchCustomers(filters);
		onAddModalClose();
	};

	const handleUpdateCustomer = async (
		id: string,
		updates: Partial<Customer>,
	) => {
		// Transform to match CustomerRequest
		// EditCustomerModal validates that required fields are not null before calling this
		if (!updates.dateOfBirth || !updates.gender) {
			throw new Error("Date of birth and gender are required");
		}
		const request = {
			fullName: updates.fullName ?? "",
			phoneNumber: updates.phoneNumber ?? "",
			gender: updates.gender,
			dateOfBirth: updates.dateOfBirth,
		};
		await customerService.updateCustomer(id, request);
		// Refresh data after updating
		await fetchCustomers(filters);
		onEditModalClose();
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
