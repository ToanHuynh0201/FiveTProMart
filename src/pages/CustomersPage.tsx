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
import { usePagination } from "@/hooks";
import type { Customer } from "@/types";
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

	// Load customer data on mount
	useEffect(() => {
		// TODO: Implement API call to load customers
		setIsLoading(false);
		setCustomerList([]);
		setFilteredCustomers([]);
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

	const handleEdit = (id: string) => {
		setSelectedCustomerId(id);
		onEditModalOpen();
	};

	const handleDeleteCustomer = async (id: string) => {
		// TODO: Implement API call to delete customer
		setCustomerList((prev) =>
			prev.filter((customer) => customer.id !== id),
		);
	};

	const handleAddCustomer = async (customer: Omit<Customer, "id">) => {
		// TODO: Implement API call to add customer
		console.log("Add customer:", customer);
	};

	const handleUpdateCustomer = async (
		id: string,
		updates: Partial<Customer>,
	) => {
		// TODO: Implement API call to update customer
		setCustomerList((prev) =>
			prev.map((customer) =>
				customer.id === id
					? { ...customer, ...updates }
					: customer,
			),
		);
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
				</Flex>
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
				{/* Customer Table */}
				{!isLoading && currentCustomers.length > 0 && (
					<>
						<CustomerTable
							customerList={currentCustomers}
							onViewDetails={handleViewDetails}
							onEdit={handleEdit}
							onDelete={handleDeleteCustomer}
						/>

						{/* Pagination */}
						<Box mt={3}>
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={total}
								pageSize={pageSize}
								onPageChange={goToPage}
								showInfo={true}
								itemLabel="khách hàng"
							/>
						</Box>
					</>
				)}{" "}
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
