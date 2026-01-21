import { useState, useEffect, useCallback } from "react";
import {
	Box,
	Text,
	Flex,
	Button,
	Spinner,
	useDisclosure,
	useToast,
	Icon,
	HStack,
} from "@chakra-ui/react";
import { AddIcon, RepeatIcon } from "@chakra-ui/icons";
import { BsExclamationTriangle } from "react-icons/bs";
import MainLayout from "@/components/layout/MainLayout";
import {
	PurchaseTable,
	PurchaseFilterBar,
	AddPurchaseModal,
	PurchaseDetailModal,
	ConfirmReceiptModal,
	CancelOrderModal,
} from "@/components/purchase";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import { useAuthStore } from "@/store/authStore";
import type {
	PurchaseListItem,
	PurchaseDetail,
	CreateDraftRequest,
	ConfirmReceiptRequest,
	CancelPurchaseOrderRequest,
	LotToPrint,
	PurchaseFilter,
} from "@/types/purchase";
import type { Supplier, SupplierProduct } from "@/types/supplier";
import type { PurchaseFilters } from "@/types/filters";
import { purchaseService } from "@/services/purchaseService";
import { supplierService } from "@/services/supplierService";
import { exportDraftPurchaseToExcel } from "@/utils/excelExport";

const ITEMS_PER_PAGE = 10;

const PurchasePage = () => {
	const toast = useToast();
	const user = useAuthStore((state) => state.user);

	// State for data from API
	const [purchases, setPurchases] = useState<PurchaseListItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>(
		[],
	);
	const [isLoadingProducts, setIsLoadingProducts] = useState(false);
	const [draftCount, setDraftCount] = useState(0);

	// Selected purchase for modals
	const [selectedPurchase, setSelectedPurchase] =
		useState<PurchaseDetail | null>(null);
	const [isLoadingDetail, setIsLoadingDetail] = useState(false);

	// Modal states
	const {
		isOpen: isAddModalOpen,
		onOpen: onAddModalOpen,
		onClose: onAddModalClose,
	} = useDisclosure();
	const {
		isOpen: isDetailModalOpen,
		onOpen: onDetailModalOpen,
		onClose: onDetailModalClose,
	} = useDisclosure();
	const {
		isOpen: isConfirmModalOpen,
		onOpen: onConfirmModalOpen,
		onClose: onConfirmModalClose,
	} = useDisclosure();
	const {
		isOpen: isCancelModalOpen,
		onOpen: onCancelModalOpen,
		onClose: onCancelModalClose,
	} = useDisclosure();

	// Filters without page (per CLAUDE.md guidelines)
	const { filters, debouncedFilters, handleFilterChange, resetFilters } =
		useFilters<PurchaseFilters>({
			size: ITEMS_PER_PAGE,
			search: "",
			status: "all",
			startDate: "",
			endDate: "",
			sortBy: "purchaseDate",
			order: "desc",
		});

	// Pagination
	const { currentPage, total, pagination, goToPage, setTotal } =
		usePagination({
			initialPage: 1,
			pageSize: ITEMS_PER_PAGE,
			initialTotal: 0,
		});

	// Fetch purchases
	const fetchPurchases = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await purchaseService.getPurchaseOrders({
				page: currentPage - 1, // Convert to zero-based
				size: debouncedFilters.size,
				search: debouncedFilters.search || undefined,
				status:
					debouncedFilters.status === "all"
						? undefined
						: debouncedFilters.status,
				startDate: debouncedFilters.startDate || undefined,
				endDate: debouncedFilters.endDate || undefined,
				sortBy: debouncedFilters.sortBy,
				order: debouncedFilters.order,
			});

			console.log(result);

			if (result.success) {
				setPurchases(result.data || []);
				setTotal(result.pagination?.totalItems || 0);

				// Count draft orders
				const drafts = (result.data || []).filter(
					(p: any) => p.status === "Draft",
				).length;
				setDraftCount(drafts);
			} else {
				toast({
					title: "Lỗi",
					description: result.error,
					status: "error",
					duration: 3000,
				});
			}
		} finally {
			setIsLoading(false);
		}
	}, [currentPage, debouncedFilters, setTotal, toast]);

	// Load purchases when filters or page change
	useEffect(() => {
		fetchPurchases();
	}, [fetchPurchases]);

	// Load suppliers on mount
	useEffect(() => {
		const loadSuppliers = async () => {
			const result = await supplierService.getSuppliers({ size: 100 });
			if (result.success) {
				setSuppliers(result.data || []);
			}
		};
		loadSuppliers();
	}, []);

	// Load supplier products when supplier changes in AddPurchaseModal
	const handleSupplierChange = async (supplierId: string) => {
		if (!supplierId) {
			setSupplierProducts([]);
			return;
		}

		setIsLoadingProducts(true);
		try {
			const result =
				await supplierService.getSupplierProducts(supplierId);
			if (result.success) {
				setSupplierProducts(result.data || []);
			} else {
				setSupplierProducts([]);
				toast({
					title: "Lỗi",
					description: "Không thể tải danh sách sản phẩm",
					status: "error",
					duration: 2000,
				});
			}
		} finally {
			setIsLoadingProducts(false);
		}
	};

	// Load purchase detail
	const loadPurchaseDetail = async (id: string) => {
		setIsLoadingDetail(true);
		try {
			const result = await purchaseService.getPurchaseOrderById(id);
			if (result.success) {
				setSelectedPurchase(result.data);
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải chi tiết đơn hàng",
					status: "error",
					duration: 3000,
				});
			}
		} finally {
			setIsLoadingDetail(false);
		}
	};

	// Handlers
	const handleViewDetail = async (id: string) => {
		await loadPurchaseDetail(id);
		onDetailModalOpen();
	};

	const handleConfirmReceipt = async (id: string) => {
		await loadPurchaseDetail(id);
		onConfirmModalOpen();
	};

	const handleCancelOrder = async (id: string) => {
		await loadPurchaseDetail(id);
		onCancelModalOpen();
	};

	const handleReprintLabels = async (id: string) => {
		const result = await purchaseService.getLabels(id);
		if (result.success) {
			// TODO: Show labels print modal
			toast({
				title: "Thông báo",
				description: `Có ${result.data?.length || 0} tem cần in`,
				status: "info",
				duration: 3000,
			});
		} else {
			toast({
				title: "Lỗi",
				description: result.error || "Không thể tải danh sách tem",
				status: "error",
				duration: 3000,
			});
		}
	};

	const handleExportExcel = async (id: string) => {
		try {
			const result = await purchaseService.getPurchaseOrderById(id);
			if (result.success && result.data) {
				// Xuất file Excel
				exportDraftPurchaseToExcel(result.data);

				toast({
					title: "Thành công",
					description: "Đã xuất file Excel thành công",
					status: "success",
					duration: 3000,
				});
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải chi tiết đơn hàng",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi xuất file Excel",
				status: "error",
				duration: 3000,
			});
		}
	};

	const handleSaveDraft = async (data: CreateDraftRequest) => {
		const result = await purchaseService.createDraftPurchase(data);
		if (result.success) {
			await fetchPurchases();
			onAddModalClose();
		} else {
			throw new Error(result.error);
		}
	};

	const handleConfirmOrder = async (
		id: string,
		data: ConfirmReceiptRequest,
	): Promise<{ lotsToPrint: LotToPrint[] } | null> => {
		const result = await purchaseService.confirmPurchaseOrder(id, data);
		if (result.success) {
			await fetchPurchases();
			return {
				lotsToPrint: result.data?.lotsToPrint || [],
			};
		} else {
			throw new Error(result.error);
		}
	};

	const handleCancelOrderSubmit = async (
		id: string,
		data: CancelPurchaseOrderRequest,
	) => {
		const result = await purchaseService.cancelPurchaseOrder(id, data);
		if (result.success) {
			await fetchPurchases();
			onCancelModalClose();
		} else {
			throw new Error(result.error);
		}
	};

	const handleFilterBarChange = (newFilters: PurchaseFilter) => {
		if (newFilters.status !== undefined) {
			handleFilterChange("status", newFilters.status);
		}
		if (newFilters.startDate !== undefined) {
			handleFilterChange("startDate", newFilters.startDate);
		}
		if (newFilters.endDate !== undefined) {
			handleFilterChange("endDate", newFilters.endDate);
		}
		goToPage(1); // Reset to first page when filters change
	};

	const handleSearch = (value: string) => {
		handleFilterChange("search", value);
		goToPage(1);
	};

	const handleResetFilters = () => {
		resetFilters();
		goToPage(1);
	};

	const hasActiveFilters =
		filters.search !== "" ||
		filters.status !== "all" ||
		filters.startDate !== "" ||
		filters.endDate !== "";

	return (
		<MainLayout>
			<Box
				p={{ base: 4, md: 6 }}
				maxW="100%"
				mx="auto">
				{/* Header */}
				<Flex
					justify="space-between"
					align="center"
					mb={4}
					flexWrap="wrap"
					gap={3}>
					<Box>
						<Text
							fontSize="24px"
							fontWeight="700"
							color="gray.800"
							mb={0}>
							Quản lý Nhập hàng
						</Text>
						<Text
							fontSize="14px"
							color="gray.600">
							Quản lý đơn nhập hàng từ nhà cung cấp
						</Text>
					</Box>
					<Button
						leftIcon={<AddIcon />}
						colorScheme="brand"
						size="md"
						px={4}
						fontSize="14px"
						fontWeight="600"
						onClick={onAddModalOpen}>
						Tạo đơn nhập
					</Button>
				</Flex>

				{/* Stats Card + Filters */}
				<HStack
					flex={1}
					gap={3}
					flexWrap={{ base: "wrap", lg: "nowrap" }}
					width="100%"
					maxWidth="100%"
					align="flex-start"
					mb={4}>
					{/* Draft Orders Card */}
					<Box flexShrink={0}>
						<Flex
							bg="white"
							borderRadius="lg"
							p={3}
							align="center"
							gap={3}
							boxShadow="sm"
							borderLeft="4px solid"
							borderColor="orange.500"
							cursor="pointer"
							transition="all 0.2s"
							_hover={{
								transform: "translateY(-2px)",
								boxShadow: "md",
								bg: "orange.50",
							}}
							onClick={() => {
								handleFilterChange(
									"status",
									filters.status === "Draft"
										? "all"
										: "Draft",
								);
								goToPage(1);
							}}>
							<Flex
								bg="orange.50"
								p={2}
								borderRadius="md">
								<Icon
									as={BsExclamationTriangle}
									boxSize={5}
									color="orange.500"
								/>
							</Flex>
							<Box>
								<Text
									fontSize="12px"
									color="gray.600"
									fontWeight="500">
									Đơn nháp
								</Text>
								<Text
									fontSize="20px"
									fontWeight="700"
									color="orange.500">
									{draftCount}
								</Text>
							</Box>
						</Flex>
					</Box>

					{/* Filters */}
					<Box
						flex={1}
						width="100%">
						<PurchaseFilterBar
							filters={{
								search: filters.search,
								status: filters.status,
								startDate: filters.startDate,
								endDate: filters.endDate,
							}}
							onFiltersChange={handleFilterBarChange}
						/>
					</Box>
				</HStack>

				{/* Search Bar */}
				<Flex
					mb={4}
					gap={3}
					align="stretch">
					<Box flex={1}>
						<input
							type="text"
							placeholder="Tìm kiếm theo mã đơn, nhà cung cấp..."
							value={filters.search || ""}
							onChange={(e) => handleSearch(e.target.value)}
							style={{
								width: "100%",
								padding: "10px 14px",
								fontSize: "15px",
								border: "1px solid #E2E8F0",
								borderRadius: "8px",
								outline: "none",
							}}
						/>
					</Box>
					{hasActiveFilters && (
						<Button
							leftIcon={<RepeatIcon />}
							variant="ghost"
							colorScheme="gray"
							onClick={handleResetFilters}
							fontSize="14px"
							fontWeight="600"
							px={4}
							flexShrink={0}>
							Đặt lại bộ lọc
						</Button>
					)}
				</Flex>

				{/* Content */}
				{isLoading ? (
					<Flex
						justify="center"
						py={6}>
						<Spinner
							size="xl"
							color="brand.500"
						/>
					</Flex>
				) : (
					<>
						{/* Purchase Table */}
						<PurchaseTable
							purchases={purchases}
							onViewDetail={handleViewDetail}
							onConfirmReceipt={handleConfirmReceipt}
							onCancelOrder={handleCancelOrder}
							onReprintLabels={handleReprintLabels}
							onExportExcel={handleExportExcel}
						/>

						{/* Pagination */}
						{purchases.length > 0 && (
							<Flex
								justify="center"
								mt={4}>
								<Pagination
									currentPage={currentPage}
									totalPages={pagination.totalPages}
									totalItems={total}
									pageSize={ITEMS_PER_PAGE}
									onPageChange={goToPage}
									itemLabel="đơn hàng"
								/>
							</Flex>
						)}
					</>
				)}

				{/* Modals */}
				<AddPurchaseModal
					isOpen={isAddModalOpen}
					onClose={onAddModalClose}
					onSaveDraft={handleSaveDraft}
					suppliers={suppliers}
					supplierProducts={supplierProducts}
					isLoadingProducts={isLoadingProducts}
					onSupplierChange={handleSupplierChange}
				/>

				<PurchaseDetailModal
					isOpen={isDetailModalOpen}
					onClose={() => {
						onDetailModalClose();
						setSelectedPurchase(null);
					}}
					purchase={selectedPurchase}
					isLoading={isLoadingDetail}
				/>

				<ConfirmReceiptModal
					isOpen={isConfirmModalOpen}
					onClose={() => {
						onConfirmModalClose();
						setSelectedPurchase(null);
					}}
					purchase={selectedPurchase}
					staffId={user?.id || ""}
					onConfirm={handleConfirmOrder}
					isLoading={isLoadingDetail}
				/>

				<CancelOrderModal
					isOpen={isCancelModalOpen}
					onClose={() => {
						onCancelModalClose();
						setSelectedPurchase(null);
					}}
					purchase={selectedPurchase}
					staffId={user?.id || ""}
					onCancel={handleCancelOrderSubmit}
				/>
			</Box>
		</MainLayout>
	);
};

export default PurchasePage;
