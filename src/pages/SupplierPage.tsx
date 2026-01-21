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
import { PurchaseDetailModal } from "@/components/purchase/PurchaseDetailModal";
import type { Supplier, CreateSupplierDTO } from "@/types/supplier";
import type { PurchaseDetail } from "@/types/purchase";
import { purchaseService } from "@/services/purchaseService";
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
	const [purchaseDetail, setPurchaseDetail] = useState<PurchaseDetail | null>(
		null,
	);
	const [isLoadingPurchaseDetail, setIsLoadingPurchaseDetail] =
		useState(false);
	const [returnToSupplier, setReturnToSupplier] = useState<{
		supplierId: string;
		mode: "view" | "edit";
	} | null>(null);

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
	const {
		isOpen: isPurchaseDetailModalOpen,
		onOpen: onPurchaseDetailModalOpen,
		onClose: onPurchaseDetailModalClose,
	} = useDisclosure();

	// Fetch suppliers with filters
	const fetchSuppliers = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await supplierService.getSuppliers({
				page: currentPage - 1, // Backend uses zero-based indexing
				size: debouncedFilters.size,
				search: debouncedFilters.search,
				supplierType: debouncedFilters.supplierType,
				sortBy: debouncedFilters.sortBy,
				order: debouncedFilters.order,
			});

			console.log(result);

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

	const handleViewPurchaseDetail = async (
		purchaseId: string,
		supplierData: { supplierId: string; mode: "view" | "edit" },
	) => {
		// Save supplier info to return to later
		setReturnToSupplier(supplierData);

		// Close supplier modal
		onViewEditModalClose();

		// Load and open purchase detail modal
		setIsLoadingPurchaseDetail(true);
		onPurchaseDetailModalOpen();

		try {
			const result =
				await purchaseService.getPurchaseOrderById(purchaseId);
			if (result.success && result.data) {
				setPurchaseDetail(result.data);
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải chi tiết đơn nhập hàng",
					status: "error",
					duration: 3000,
					isClosable: true,
				});
			}
		} catch (error) {
			console.error("Error loading purchase detail:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tải chi tiết đơn nhập hàng",
				status: "error",
				duration: 3000,
				isClosable: true,
			});
		} finally {
			setIsLoadingPurchaseDetail(false);
		}
	};

	const handleClosePurchaseDetail = () => {
		onPurchaseDetailModalClose();
		setPurchaseDetail(null);

		// Reopen supplier modal if we came from there
		if (returnToSupplier) {
			setSelectedSupplierId(returnToSupplier.supplierId);
			setViewEditMode(returnToSupplier.mode);
			onViewEditModalOpen();
			setReturnToSupplier(null);
		}
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
					onViewPurchaseDetail={handleViewPurchaseDetail}
				/>

				<PurchaseDetailModal
					isOpen={isPurchaseDetailModalOpen}
					onClose={handleClosePurchaseDetail}
					purchase={purchaseDetail}
					isLoading={isLoadingPurchaseDetail}
				/>
			</Box>
		</MainLayout>
	);
};

export default SupplierPage;
