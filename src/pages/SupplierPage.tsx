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
import { usePagination } from "@/hooks";
import type {
	Supplier,
	SupplierStats,
	UpdateSupplierData,
} from "@/types/supplier";
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
	const { currentPage, total, pageSize, goToPage, setTotal } = usePagination({
		initialPage: 1,
		pageSize: ITEMS_PER_PAGE,
		initialTotal: 0,
	});

	const [supplierList, setSupplierList] = useState<Supplier[]>([]);
	const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [isLoading, setIsLoading] = useState(true);
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

	// Load supplier data on mount
	useEffect(() => {
		// TODO: Implement API call to load suppliers
		setSupplierList([]);
		setFilteredSuppliers([]);
		setIsLoading(false);

		// TODO: Implement API call to load supplier stats
		setStats(null);
	}, []);

	// Filter suppliers when search or filter changes
	useEffect(() => {
		applyFilters();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchQuery, statusFilter, supplierList]);

	const loadSuppliers = async () => {
		setIsLoading(true);
		try {
			// TODO: Implement API call to get all suppliers
			setSupplierList([]);
			setFilteredSuppliers([]);
		} catch (error) {
			console.error("Error loading suppliers:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const loadStats = async () => {
		try {
			// TODO: Implement API call to get supplier stats
			setStats(null);
		} catch (error) {
			console.error("Error loading stats:", error);
		}
	};

	const applyFilters = async () => {
		// TODO: Implement API call to filter suppliers
		setFilteredSuppliers([]);
		setTotal(0);
		goToPage(1);
	};

	const handleResetFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
	};

	const handleStatClick = (status: string) => {
		// Toggle filter: if already filtering by this status, reset to "all"
		if (statusFilter === status) {
			setStatusFilter("all");
		} else {
			setStatusFilter(status);
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
		try {
			// TODO: Implement API call to delete supplier
			// TODO: Reload suppliers and stats after deletion
		} catch (error) {
			console.error("Error deleting supplier:", error);
			throw error;
		}
	};

	const handleAddSupplier = async (
		supplierData: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
	) => {
		try {
			// TODO: Implement API call to add new supplier
			// TODO: Reload suppliers and stats after adding
		} catch (error) {
			console.error("Error adding supplier:", error);
			throw error;
		}
	};

	const handleUpdateSupplier = async (
		id: string,
		updates: UpdateSupplierData,
	) => {
		try {
			// TODO: Implement API call to update supplier
			// TODO: Reload suppliers and stats after updating
		} catch (error) {
			console.error("Error updating supplier:", error);
			throw error;
		}
	};

	// Pagination
	const paginatedSuppliers = filteredSuppliers.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

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
									{...(statusFilter === "active" && {
										boxShadow: "lg",
										borderColor: "green.400",
										borderWidth: "2px",
									})}>
									{statusFilter === "active" && (
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
									{...(statusFilter === "inactive" && {
										boxShadow: "lg",
										borderColor: "gray.400",
										borderWidth: "2px",
									})}>
									{statusFilter === "inactive" && (
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
							value={searchQuery}
							onChange={setSearchQuery}
						/>
					</Box>
					{/* Filter Bar */}
					<Box mb={6}>
						<SupplierFilterBar
							statusFilter={statusFilter}
							onStatusFilterChange={setStatusFilter}
							onReset={handleResetFilters}
						/>
					</Box>
					{/* Table */}
					{isLoading ? (
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
					) : (
						<>
							<SupplierTable
								supplierList={paginatedSuppliers}
								onViewDetails={handleViewDetails}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>

							{/* Pagination */}
							{filteredSuppliers.length > 0 && (
								<Box mt={6}>
									<Pagination
										currentPage={currentPage}
										totalPages={Math.ceil(total / pageSize)}
										totalItems={total}
										pageSize={pageSize}
										onPageChange={goToPage}
										itemLabel="nhà cung cấp"
									/>
								</Box>
							)}
						</>
					)}{" "}
					{/* Show result count */}
					{!isLoading && (
						<Text
							mt={4}
							fontSize="14px"
							color="gray.600"
							textAlign="center">
							Hiển thị{" "}
							<strong>
								{Math.min(
									(currentPage - 1) * pageSize + 1,
									total,
								)}
							</strong>{" "}
							-{" "}
							<strong>
								{Math.min(currentPage * pageSize, total)}
							</strong>{" "}
							trong tổng số <strong>{total}</strong> nhà cung cấp
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
