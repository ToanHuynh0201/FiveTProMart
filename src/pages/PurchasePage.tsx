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
	Supplier,
	SupplierProduct,
	CreateDraftRequest,
	ConfirmReceiptRequest,
	CancelOrderRequest,
	LotToPrint,
	PurchaseFilter,
} from "@/types/purchase";
import type { PurchaseFilters } from "@/types/filters";
import { purchaseService } from "@/services/purchaseService";
import { supplierService } from "@/services/supplierService";

const ITEMS_PER_PAGE = 10;

// ============ MOCK DATA FOR TESTING ============
const MOCK_PURCHASE_LIST: PurchaseListItem[] = [
	{
		id: "po-001",
		poCode: "PO-2024-001",
		supplierName: "Công ty TNHH Thực phẩm ABC",
		staffNameCreated: "Nguyễn Văn A",
		totalAmount: 15500000,
		status: "Draft",
		purchaseDate: "2024-01-15T10:30:00Z",
	},
];

const MOCK_PURCHASE_DETAIL: PurchaseDetail = {
	_id: "po-001",
	poCode: "PO-2024-001",
	status: "Draft",
	notes: "Đơn hàng tháng 1",
	supplier: {
		supplierId: "sup-001",
		supplierName: "Công ty TNHH Thực phẩm ABC",
		phone: "0901234567",
		representName: "Trần Văn B",
		representPhoneNumber: "0912345678",
	},
	staffIdCreated: "staff-001",
	purchaseDate: "2024-01-15T10:30:00Z",
	items: [
		{
			productId: "prod-001",
			productName: "Sữa tươi Vinamilk 1L",
			importPrice: 25000,
			quantityOrdered: 100,
			quantityReceived: 0,
			subTotal: 2500000,
		},
		{
			productId: "prod-002",
			productName: "Nước ngọt Coca Cola 330ml",
			importPrice: 8000,
			quantityOrdered: 200,
			quantityReceived: 0,
			subTotal: 1600000,
		},
		{
			productId: "prod-003",
			productName: "Mì gói Hảo Hảo tôm chua cay",
			importPrice: 4500,
			quantityOrdered: 500,
			quantityReceived: 0,
			subTotal: 2250000,
		},
	],
	totalAmount: 15500000,
};

const MOCK_SUPPLIERS: Supplier[] = [
	{
		id: "sup-001",
		name: "Công ty TNHH Thực phẩm ABC",
		phone: "0901234567",
		email: "abc@company.com",
		address: "123 Đường ABC, Q.1, TP.HCM",
	},
	{
		id: "sup-002",
		name: "Nhà phân phối XYZ",
		phone: "0987654321",
		email: "xyz@distributor.com",
	},
];

const MOCK_SUPPLIER_PRODUCTS: SupplierProduct[] = [
	{
		productId: "prod-001",
		productName: "Sữa tươi Vinamilk 1L",
		productCode: "VNM-001",
		unit: "Hộp",
		category: "Sữa",
	},
	{
		productId: "prod-002",
		productName: "Nước ngọt Coca Cola 330ml",
		productCode: "CC-330",
		unit: "Lon",
		category: "Nước giải khát",
	},
	{
		productId: "prod-003",
		productName: "Mì gói Hảo Hảo tôm chua cay",
		productCode: "HH-001",
		unit: "Gói",
		category: "Mì gói",
	},
	{
		productId: "prod-004",
		productName: "Dầu ăn Neptune 1L",
		productCode: "NP-1L",
		unit: "Chai",
		category: "Dầu ăn",
	},
];

// Set this to true to use mock data, false to use real API
const USE_MOCK_DATA = true;
// ============ END MOCK DATA ============

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
	const { currentPage, total, pagination, goToPage, setTotal } = usePagination({
		initialPage: 1,
		pageSize: ITEMS_PER_PAGE,
		initialTotal: 0,
	});

	// Fetch purchases
	const fetchPurchases = useCallback(async () => {
		setIsLoading(true);
		try {
			if (USE_MOCK_DATA) {
				// Use mock data for testing
				await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate API delay
				setPurchases(MOCK_PURCHASE_LIST);
				setTotal(MOCK_PURCHASE_LIST.length);
				setDraftCount(
					MOCK_PURCHASE_LIST.filter((p) => p.status === "Draft").length,
				);
				return;
			}

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

			if (result.success) {
				setPurchases(result.data || []);
				setTotal(result.pagination?.totalItems || 0);

				// Count draft orders
				const drafts = (result.data || []).filter(
					(p) => p.status === "Draft",
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
			if (USE_MOCK_DATA) {
				setSuppliers(MOCK_SUPPLIERS);
				return;
			}
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
			if (USE_MOCK_DATA) {
				await new Promise((resolve) => setTimeout(resolve, 200));
				setSupplierProducts(MOCK_SUPPLIER_PRODUCTS);
				setIsLoadingProducts(false);
				return;
			}
			const result = await supplierService.getSupplierProducts(supplierId);
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
			if (USE_MOCK_DATA) {
				await new Promise((resolve) => setTimeout(resolve, 200));
				setSelectedPurchase(MOCK_PURCHASE_DETAIL);
				setIsLoadingDetail(false);
				return;
			}
			const result = await purchaseService.getPurchaseOrderById(id);
			if (result.success) {
				setSelectedPurchase(result.data);
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể tải chi tiết đơn hàng",
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

	const handleSaveDraft = async (data: CreateDraftRequest) => {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			console.log("Mock: Create draft", data);
			toast({
				title: "Mock: Tạo đơn nháp thành công",
				description: "Dữ liệu: " + JSON.stringify(data).slice(0, 100),
				status: "success",
				duration: 3000,
			});
			onAddModalClose();
			return;
		}
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
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 800));
			console.log("Mock: Confirm order", id, data);
			// Return mock lots to print
			return {
				lotsToPrint: data.actualItems.map((item, idx) => ({
					lotId: `LOT-2024-${String(idx + 1).padStart(3, "0")}`,
					productName:
						MOCK_PURCHASE_DETAIL.items.find(
							(p) => p.productId === item.productId,
						)?.productName || "Sản phẩm",
					quantity: item.quantityReceived,
					expirationDate: item.expirationDate,
				})),
			};
		}
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
		data: CancelOrderRequest,
	) => {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 500));
			console.log("Mock: Cancel order", id, data);
			toast({
				title: "Mock: Hủy đơn thành công",
				description: "Lý do: " + data.cancelNotesReason,
				status: "info",
				duration: 3000,
			});
			onCancelModalClose();
			return;
		}
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
									filters.status === "Draft" ? "all" : "Draft",
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
