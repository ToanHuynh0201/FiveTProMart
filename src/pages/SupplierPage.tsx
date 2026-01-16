import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import {
	SupplierTable,
	SupplierSearchBar,
	SupplierFilterBar,
	AddSupplierModal,
	SupplierViewEditModal,
} from "@/components/supplier";
import { Pagination } from "@/components/common";
import type {
	Supplier,
	SupplierDetail,
	SupplierProduct,
	CreateSupplierDTO,
} from "@/types/supplier";
import type { PurchaseListItem } from "@/types/purchase";
import { supplierService } from "@/services/supplierService";
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

// ============ MOCK DATA FOR TESTING ============
const MOCK_SUPPLIER_LIST: Supplier[] = [
	{
		supplierId: "sup-001",
		supplierName: "Công ty TNHH Thực phẩm ABC",
		address: "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
		phoneNumber: "0901234567",
		representName: "Trần Văn B",
		representPhoneNumber: "0912345678",
		supplierType: "Doanh nghiệp",
		currentDebt: 15000000,
	},
	{
		supplierId: "sup-002",
		supplierName: "Nhà phân phối XYZ",
		address: "456 Đường Lê Lợi, Quận 1, TP.HCM",
		phoneNumber: "0987654321",
		representName: "Nguyễn Thị C",
		representPhoneNumber: "0923456789",
		supplierType: "Tư nhân",
		currentDebt: 5000000,
	},
	{
		supplierId: "sup-003",
		supplierName: "Công ty CP Sữa Việt Nam",
		address: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM",
		phoneNumber: "0909123456",
		representName: "Lê Văn D",
		representPhoneNumber: "0934567890",
		supplierType: "Doanh nghiệp",
		currentDebt: 25000000,
	},
];

const MOCK_SUPPLIER_DETAIL: SupplierDetail = {
	supplierId: "sup-001",
	supplierName: "Công ty TNHH Thực phẩm ABC",
	address: "123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM",
	phoneNumber: "0901234567",
	email: "contact@abc-food.com",
	taxCode: "0123456789",
	bankAccount: "1234567890",
	bankName: "Vietcombank",
	representName: "Trần Văn B",
	representPhoneNumber: "0912345678",
	supplierType: "Doanh nghiệp",
	status: "HOẠT ĐỘNG",
	currentDebt: 15000000,
	suppliedProducts: [
		{ productId: "prod-001", lastImportPrice: 25000, lastImportDate: "2024-01-10" },
		{ productId: "prod-002", lastImportPrice: 8000, lastImportDate: "2024-01-08" },
	],
};

const MOCK_SUPPLIER_PRODUCTS: SupplierProduct[] = [
	{
		productId: "prod-001",
		productName: "Sữa tươi Vinamilk 1L",
		category: "Sữa",
		unitOfMeasure: "Hộp",
		totalStockQuantity: 150,
		lastImportPrice: 25000,
		lastImportDate: "2024-01-10",
	},
	{
		productId: "prod-002",
		productName: "Nước ngọt Coca Cola 330ml",
		category: "Nước giải khát",
		unitOfMeasure: "Lon",
		totalStockQuantity: 300,
		lastImportPrice: 8000,
		lastImportDate: "2024-01-08",
	},
	{
		productId: "prod-003",
		productName: "Mì gói Hảo Hảo tôm chua cay",
		category: "Mì gói",
		unitOfMeasure: "Gói",
		totalStockQuantity: 500,
		lastImportPrice: 4500,
		lastImportDate: "2024-01-05",
	},
];

const MOCK_PURCHASE_HISTORY: PurchaseListItem[] = [
	{
		id: "po-001",
		poCode: "PO-2024-001",
		supplierName: "Công ty TNHH Thực phẩm ABC",
		staffNameCreated: "Nguyễn Văn A",
		totalAmount: 15500000,
		status: "Completed",
		purchaseDate: "2024-01-15T10:30:00Z",
		checkDate: "2024-01-16T09:00:00Z",
	},
	{
		id: "po-002",
		poCode: "PO-2024-002",
		supplierName: "Công ty TNHH Thực phẩm ABC",
		staffNameCreated: "Trần Thị B",
		totalAmount: 8200000,
		status: "Draft",
		purchaseDate: "2024-01-18T14:00:00Z",
	},
	{
		id: "po-003",
		poCode: "PO-2024-003",
		supplierName: "Công ty TNHH Thực phẩm ABC",
		staffNameCreated: "Nguyễn Văn A",
		totalAmount: 5000000,
		status: "Cancelled",
		purchaseDate: "2024-01-10T08:30:00Z",
		checkDate: "2024-01-11T10:00:00Z",
	},
];

// Set this to true to use mock data, false to use real API
const USE_MOCK_DATA = true;
// ============ END MOCK DATA ============

interface SupplierFilters {
	page: number;
	size: number;
	search: string;
	supplierType: string;
	sortBy: string;
	order: string;
}

const SupplierPage = () => {
	const toast = useToast();

	// State for data from API
	const [supplierList, setSupplierList] = useState<Supplier[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
		null,
	);
	const [viewEditMode, setViewEditMode] = useState<"view" | "edit">("view");

	// Use custom hooks for filters and pagination
	const { filters, debouncedFilters, handleFilterChange, resetFilters } =
		useFilters<SupplierFilters>({
			page: 1,
			size: ITEMS_PER_PAGE,
			search: "",
			supplierType: "",
			sortBy: "supplierName",
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

	// Fetch suppliers with filters
	const fetchSuppliers = useCallback(async () => {
		setIsLoading(true);
		try {
			if (USE_MOCK_DATA) {
				// Use mock data for testing
				await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay

				// Filter mock data based on search and type
				let filteredData = [...MOCK_SUPPLIER_LIST];

				if (debouncedFilters.search) {
					const searchLower = debouncedFilters.search.toLowerCase();
					filteredData = filteredData.filter(
						(s) =>
							s.supplierName.toLowerCase().includes(searchLower) ||
							s.phoneNumber.includes(debouncedFilters.search),
					);
				}

				if (debouncedFilters.supplierType) {
					filteredData = filteredData.filter(
						(s) => s.supplierType === debouncedFilters.supplierType,
					);
				}

				setSupplierList(filteredData);
				setTotal(filteredData.length);
				return;
			}

			const result = await supplierService.getSuppliers({
				page: currentPage - 1, // Backend uses zero-based indexing
				size: debouncedFilters.size,
				search: debouncedFilters.search,
				supplierType: debouncedFilters.supplierType,
				sortBy: debouncedFilters.sortBy,
				order: debouncedFilters.order,
			});

			if (result.success) {
				setSupplierList(result.data || []);
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
	}, [currentPage, debouncedFilters, setTotal, toast]);

	// Fetch suppliers when filters or page change
	useEffect(() => {
		fetchSuppliers();
	}, [debouncedFilters, currentPage]);

	const handleSearch = (searchQuery: string) => {
		handleFilterChange("search", searchQuery);
		goToPage(1);
	};

	const handlePageChange = (page: number) => {
		goToPage(page);
	};

	const handleSupplierTypeFilter = (type: string) => {
		handleFilterChange("supplierType", type);
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
		setSelectedSupplierId(id);
		setViewEditMode("view");
		onViewEditModalOpen();
	};

	const handleEdit = (id: string) => {
		setSelectedSupplierId(id);
		setViewEditMode("edit");
		onViewEditModalOpen();
	};

	const handleDelete = async (id: string) => {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			console.log("Mock: Delete supplier", id);
			toast({
				title: "Mock: Xóa thành công",
				description: `Đã xóa nhà cung cấp ID: ${id}`,
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
			return;
		}

		const result = await supplierService.deleteSupplier(id);

		if (result.success) {
			toast({
				title: "Thành công",
				description: "Xóa nhà cung cấp thành công!",
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
			fetchSuppliers();
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

	const handleAddSupplier = async (supplierData: CreateSupplierDTO) => {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			console.log("Mock: Create supplier", supplierData);
			toast({
				title: "Mock: Tạo nhà cung cấp thành công",
				description: `Tên: ${supplierData.supplierName}`,
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
			onAddModalClose();
			return;
		}

		const result = await supplierService.createSupplier(supplierData);

		if (result.success) {
			toast({
				title: "Thành công",
				description: result.message || "Tạo nhà cung cấp thành công!",
				status: "success",
				duration: 3000,
				isClosable: true,
				position: "top-right",
			});
			onAddModalClose();
			fetchSuppliers();
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
		fetchSuppliers();
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

					{/* Search Bar */}
					<Box mb={4}>
						<SupplierSearchBar
							value={filters.search}
							onChange={handleSearch}
						/>
					</Box>

					{/* Filter Bar */}
					<Box mb={4}>
						<SupplierFilterBar
							supplierType={filters.supplierType}
							sortBy={filters.sortBy}
							order={filters.order}
							onSupplierTypeChange={handleSupplierTypeFilter}
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
					{!isLoading && supplierList.length > 0 && (
						<>
							<SupplierTable
								supplierList={supplierList}
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
										itemLabel="nhà cung cấp"
									/>
								</Box>
							)}
						</>
					)}

					{/* Show result count */}
					{!isLoading && supplierList.length > 0 && total > 0 && (
						<Text
							mt={4}
							fontSize="14px"
							color="gray.600"
							textAlign="center">
							Hiển thị <strong>{startItem}</strong> -{" "}
							<strong>{endItem}</strong> trong tổng số{" "}
							<strong>{total}</strong> nhà cung cấp
						</Text>
					)}
				</Box>

				{/* Modals */}
				<AddSupplierModal
					isOpen={isAddModalOpen}
					onClose={onAddModalClose}
					onAdd={handleAddSupplier}
				/>

				<SupplierViewEditModal
					isOpen={isViewEditModalOpen}
					onClose={onViewEditModalClose}
					supplierId={selectedSupplierId}
					mode={viewEditMode}
					onSuccess={handleViewEditSuccess}
				/>
			</Box>
		</MainLayout>
	);
};

export default SupplierPage;
