import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	SupplierTable,
	SupplierSearchBar,
	SupplierFilterBar,
	SupplierDetailModal,
	AddSupplierModal,
	EditSupplierModal,
} from "@/components/supplier";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import type {
	Supplier,
	SupplierStats,
	UpdateSupplierData,
} from "@/types/supplier";
import type { SupplierFilters } from "@/types/filters";
import { supplierService } from "@/services/supplierService";
import apiService from "@/lib/api";
import {
	Box,
	Text,
	Flex,
	Spinner,
	Button,
	useDisclosure,
	Grid,
	GridItem,
	Stat,
	StatLabel,
	StatNumber,
	Icon,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

const SupplierPage = () => {
	// State for data from API
	const [supplierList, setSupplierList] = useState<Supplier[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [stats, setStats] = useState<SupplierStats | null>(null);
	const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
		null,
	);

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
	const {
		isOpen: isDetailModalOpen,
		onOpen: onDetailModalOpen,
		onClose: onDetailModalClose,
	} = useDisclosure();

	// Fetch function for API call
	const fetchSuppliers = async (filters: SupplierFilters) => {
		const response = await supplierService.getSuppliers(filters);
		setSupplierList(response.data);
		setTotalItems(response.pagination.totalItems);
	};

	// useFilters for filtering + pagination state
	const {
		filters,
		loading,
		error,
		handleFilterChange,
		handlePageChange,
		resetFilters,
	} = useFilters<SupplierFilters>(
		{
			page: 1,
			pageSize: ITEMS_PER_PAGE,
			searchQuery: "",
			status: "all",
		},
		fetchSuppliers,
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

	// Load stats on mount
	useEffect(() => {
		const loadStats = async () => {
			try {
				// Stats endpoint - will fail gracefully if not implemented
				const response = await apiService.get<{ data: SupplierStats }>("/suppliers/stats");
				setStats(response.data || null);
			} catch {
				// API not available - show empty stats
				setStats(null);
			}
		};
		loadStats();
	}, []);

	const handleResetFilters = () => {
		resetFilters();
	};

	const handleStatClick = (status: string) => {
		// Toggle filter: if already filtering by this status, reset to "all"
		if (filters.status === status) {
			handleFilterChange("status", "all");
		} else {
			handleFilterChange("status", status);
		}
	};

	const handleViewDetails = (id: string) => {
		setSelectedSupplierId(id);
		onDetailModalOpen();
	};

	const handleEdit = (id: string) => {
		setSelectedSupplierId(id);
		onEditModalOpen();
	};

	const handleDelete = async (id: string) => {
		await supplierService.deleteSupplier(id);
		// Refresh data after deleting
		await fetchSuppliers(filters);
		// Reload stats after deletion
		loadStats();
	};

	const handleAddSupplier = async (
		supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
	) => {
		await supplierService.createSupplier(supplierData);
		// Refresh data after adding
		await fetchSuppliers(filters);
		onAddModalClose();
		// Reload stats after adding
		loadStats();
	};

	const handleUpdateSupplier = async (
		id: string,
		updates: UpdateSupplierData,
	) => {
		await supplierService.updateSupplier(id, updates);
		// Refresh data after updating
		await fetchSuppliers(filters);
		onEditModalClose();
		// Reload stats after updating
		loadStats();
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
							Quản lý nhà cung cấp
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
							Thêm nhà cung cấp
						</Button>
					</Flex>
					{/* Statistics Cards */}
					{stats && (
						<Grid
							templateColumns={{
								base: "1fr",
								sm: "repeat(2, 1fr)",
								lg: "repeat(2, 1fr)",
							}}
							gap={4}
							mb={6}>
							<GridItem>
								<Box
									bg="gradient-to-br from-green-50 to-green-100"
									p={5}
									borderRadius="xl"
									boxShadow="sm"
									border="1px solid"
									borderColor="green.200"
									cursor="pointer"
									onClick={() => handleStatClick("active")}
									transition="all 0.2s"
									_hover={{
										transform: "translateY(-2px)",
										boxShadow: "md",
										borderColor: "green.300",
									}}
									_active={{
										transform: "translateY(0)",
									}}
									position="relative"
									overflow="hidden"
									{...(filters.status === "active" && {
										boxShadow: "lg",
										borderColor: "green.400",
										borderWidth: "2px",
									})}>
									{filters.status === "active" && (
										<Box
											position="absolute"
											top={2}
											right={2}
											bg="green.500"
											color="white"
											fontSize="10px"
											fontWeight="700"
											px={2}
											py={1}
											borderRadius="full">
											Đang lọc
										</Box>
									)}
									<Flex
										align="center"
										gap={3}>
										<Box
											bg="green.500"
											p={3}
											borderRadius="lg">
											<Icon
												as={FiCheckCircle}
												w="24px"
												h="24px"
												color="white"
											/>
										</Box>
										<Stat>
											<StatLabel
												fontSize="13px"
												color="gray.600"
												fontWeight="600">
												Đang hoạt động
											</StatLabel>
											<StatNumber
												fontSize="28px"
												fontWeight="700"
												color="green.600">
												{stats.activeSuppliers}
											</StatNumber>
										</Stat>
									</Flex>
								</Box>
							</GridItem>

							<GridItem>
								<Box
									bg="gradient-to-br from-gray-50 to-gray-100"
									p={5}
									borderRadius="xl"
									boxShadow="sm"
									border="1px solid"
									borderColor="gray.200"
									cursor="pointer"
									onClick={() => handleStatClick("inactive")}
									transition="all 0.2s"
									_hover={{
										transform: "translateY(-2px)",
										boxShadow: "md",
										borderColor: "gray.300",
									}}
									_active={{
										transform: "translateY(0)",
									}}
									position="relative"
									overflow="hidden"
									{...(filters.status === "inactive" && {
										boxShadow: "lg",
										borderColor: "gray.400",
										borderWidth: "2px",
									})}>
									{filters.status === "inactive" && (
										<Box
											position="absolute"
											top={2}
											right={2}
											bg="gray.500"
											color="white"
											fontSize="10px"
											fontWeight="700"
											px={2}
											py={1}
											borderRadius="full">
											Đang lọc
										</Box>
									)}
									<Flex
										align="center"
										gap={3}>
										<Box
											bg="gray.500"
											p={3}
											borderRadius="lg">
											<Icon
												as={FiXCircle}
												w="24px"
												h="24px"
												color="white"
											/>
										</Box>
										<Stat>
											<StatLabel
												fontSize="13px"
												color="gray.600"
												fontWeight="600">
												Ngưng hoạt động
											</StatLabel>
											<StatNumber
												fontSize="28px"
												fontWeight="700"
												color="gray.600">
												{stats.inactiveSuppliers}
											</StatNumber>
										</Stat>
									</Flex>
								</Box>
							</GridItem>
						</Grid>
					)}
					{/* Search Bar */}
					<Box mb={4}>
						<SupplierSearchBar
							value={filters.searchQuery || ""}
							onChange={(value) =>
								handleFilterChange("searchQuery", value)
							}
						/>
					</Box>
					{/* Filter Bar */}
					<Box mb={6}>
						<SupplierFilterBar
							statusFilter={filters.status || "all"}
							onStatusFilterChange={(value) =>
								handleFilterChange("status", value)
							}
							onReset={handleResetFilters}
						/>
					</Box>

					{/* Loading State */}
					{loading && (
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

					{/* Table */}
					{!loading && !error && (
						<>
							<SupplierTable
								supplierList={supplierList}
								onViewDetails={handleViewDetails}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>

							{/* Pagination */}
							{supplierList.length > 0 && (
								<Box mt={6}>
									<Pagination
										currentPage={currentPage}
										totalPages={pagination.totalPages}
										totalItems={totalItems}
										pageSize={pageSize}
										onPageChange={handlePageChange}
										itemLabel="nhà cung cấp"
									/>
								</Box>
							)}
						</>
					)}

					{/* Show result count */}
					{!loading && !error && supplierList.length > 0 && (
						<Text
							mt={4}
							fontSize="14px"
							color="gray.600"
							textAlign="center">
							Hiển thị{" "}
							<strong>
								{Math.min(
									(currentPage - 1) * pageSize + 1,
									totalItems,
								)}
							</strong>{" "}
							-{" "}
							<strong>
								{Math.min(currentPage * pageSize, totalItems)}
							</strong>{" "}
							trong tổng số <strong>{totalItems}</strong> nhà cung
							cấp
						</Text>
					)}
				</Box>

				{/* Modals */}
				<AddSupplierModal
					isOpen={isAddModalOpen}
					onClose={onAddModalClose}
					onAdd={handleAddSupplier}
				/>

				<EditSupplierModal
					isOpen={isEditModalOpen}
					onClose={onEditModalClose}
					supplierId={selectedSupplierId}
					onUpdate={handleUpdateSupplier}
				/>

				<SupplierDetailModal
					isOpen={isDetailModalOpen}
					onClose={onDetailModalClose}
					supplierId={selectedSupplierId}
				/>
			</Box>
		</MainLayout>
	);
};

export default SupplierPage;
