import { useState, useEffect } from "react";
import {
	Box,
	Text,
	Flex,
	Button,
	Spinner,
	useDisclosure,
	useToast,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Icon,
	HStack,
} from "@chakra-ui/react";
import {
	AddIcon,
	DownloadIcon,
	ChevronDownIcon,
	RepeatIcon,
} from "@chakra-ui/icons";
import { BsExclamationTriangle, BsFileEarmarkExcel } from "react-icons/bs";
import MainLayout from "@/components/layout/MainLayout";
import {
	PurchaseTable,
	PurchaseFilterBar,
	AddPurchaseModal,
	PurchaseDetailModal,
	ImportExcelModal,
} from "@/components/purchase";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import type {
	Purchase,
	PurchaseStats,
	Supplier,
	PurchaseItem,
} from "@/types";
import type { PurchaseFilters } from "@/types/filters";
import { purchaseService } from "@/services/purchaseService";
import { supplierService } from "@/services/supplierService";
import apiService from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const PurchasePage = () => {
	const toast = useToast();

	const loadStats = async () => {
		// TODO: Wire to stats endpoint when available
	};

	// State for data from API
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [stats, setStats] = useState<PurchaseStats | null>(null);

	// Modal states
	const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
		null,
	);
	const [importedItems, setImportedItems] = useState<PurchaseItem[]>([]);
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
		isOpen: isImportModalOpen,
		onOpen: onImportModalOpen,
		onClose: onImportModalClose,
	} = useDisclosure();

	// Fetch function for API call
	const fetchPurchases = async (filters: PurchaseFilters) => {
		const response = await purchaseService.getPurchases(filters);
		setPurchases(response.data);
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
	} = useFilters<PurchaseFilters>(
		{
			page: 1,
			pageSize: ITEMS_PER_PAGE,
			searchQuery: "",
			status: "all",
			paymentStatus: "all",
			supplierId: "all",
		},
		fetchPurchases,
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

	// Load suppliers and stats on mount
	useEffect(() => {
		const loadData = async () => {
			// Load suppliers
			try {
    const suppliersResponse = await supplierService.getSuppliers({ page: 1, pageSize: 100 });
				const supplierData = Array.isArray(suppliersResponse.data) ? suppliersResponse.data : [];
				setSuppliers(supplierData as unknown as Supplier[]);
			} catch {
				setSuppliers([]);
			}

			// Load stats - will fail gracefully if not implemented
			try {
				const statsResponse = await apiService.get<{ data: PurchaseStats }>("/purchases/stats");
				setStats(statsResponse.data || null);
			} catch {
				setStats(null);
			}
		};
		loadData();
	}, []);

	const handleAddPurchase = async (
		purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt">,
	) => {
		await purchaseService.createPurchase(purchase as Omit<Purchase, 'id'>);
		// Refresh data after adding
		await fetchPurchases(filters);
		onAddModalClose();
		// Reset imported items after successfully creating purchase
		setImportedItems([]);
		// Reload stats after adding
		loadStats();
	};

	const handleViewDetail = (id: string) => {
		const purchase = purchases.find((p) => p.id === id);
		if (purchase) {
			setSelectedPurchase(purchase);
			onDetailModalOpen();
		}
	};

	const handleEdit = (_id: string) => {
		// Edit functionality: Open edit modal with purchase data
		const purchase = purchases.find((p) => p.id === _id);
		if (purchase) {
			setSelectedPurchase(purchase);
			// Note: Edit modal can be added when needed - for now show detail
			onDetailModalOpen();
		}
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập này?")) {
			try {
				await purchaseService.deletePurchase(id);
				// Refresh data after deleting
				await fetchPurchases(filters);
				toast({
					title: "Thành công",
					description: "Đã xóa phiếu nhập",
					status: "success",
					duration: 2000,
				});
				// Reload stats after deletion
				loadStats();
			} catch (error) {
				toast({
					title: "Lỗi",
					description: "Không thể xóa phiếu nhập",
					status: "error",
					duration: 3000,
				});
			}
		}
	};

	const handleImportFromExcel = (items: PurchaseItem[]) => {
		// Lưu các items từ Excel
		setImportedItems(items);
		// Đóng ImportExcelModal
		onImportModalClose();
		// Mở AddPurchaseModal với items đã import
		onAddModalOpen();
	};

	const handleExportToExcel = async () => {
		if (purchases.length === 0) {
			toast({
				title: "Thông báo",
				description: "Không có dữ liệu để xuất",
				status: "warning",
				duration: 2000,
			});
			return;
		}

		try {
			// Export purchases to Excel via API
			const blob = await purchaseService.exportToExcel(purchases.map(p => p.id));
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `purchases_${new Date().toISOString().split("T")[0]}.xlsx`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
			
			toast({
				title: "Thành công",
				description: "Đã xuất file Excel",
				status: "success",
				duration: 2000,
			});
		} catch {
			toast({
				title: "Lỗi",
				description: "Không thể xuất file Excel",
				status: "error",
				duration: 3000,
			});
		}
	};

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
							Quản lý phiếu nhập hàng
						</Text>
					</Box>
					<Flex gap={2}>
						<Menu>
							<MenuButton
								as={Button}
								leftIcon={<Icon as={BsFileEarmarkExcel} />}
								rightIcon={<ChevronDownIcon />}
								colorScheme="green"
								size="md"
								variant="outline">
								Excel
							</MenuButton>
							<MenuList>
								<MenuItem
									icon={<Icon as={BsFileEarmarkExcel} />}
									onClick={onImportModalOpen}>
									Nhập từ Excel
								</MenuItem>
								<MenuItem
									icon={<DownloadIcon />}
									onClick={handleExportToExcel}>
									Xuất ra Excel
								</MenuItem>
							</MenuList>
						</Menu>
						<Button
							leftIcon={<AddIcon />}
							colorScheme="brand"
							size="md"
							px={4}
							fontSize="14px"
							fontWeight="600"
							onClick={onAddModalOpen}>
							Tạo phiếu nhập
						</Button>
					</Flex>
				</Flex>

				{loading ? (
					<Flex
						justify="center"
						py={6}>
						<Spinner
							size="xl"
							color="brand.500"
						/>
					</Flex>
				) : error ? (
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
				) : (
					<>
						<HStack
							flex={1}
							gap={3}
							flexWrap={{ base: "wrap", lg: "nowrap" }}
							width="100%"
							maxWidth="100%"
							align="center">
							<Box
								mb={3}
								flexShrink={0}>
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
											filters.status === "ordered"
												? "all"
												: "ordered",
										);
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
											Đơn chờ nhận
										</Text>
										<Text
											fontSize="20px"
											fontWeight="700"
											color="orange.500">
											{stats?.pendingOrders || 0}
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
										searchQuery: filters.searchQuery || "",
										status: filters.status || "all",
										paymentStatus: filters.paymentStatus || "all",
										supplierId: filters.supplierId || "all",
									}}
									suppliers={suppliers}
									onFiltersChange={(newFilters) => {
										handleFilterChange("status", newFilters.status);
										handleFilterChange("paymentStatus", newFilters.paymentStatus);
										handleFilterChange("supplierId", newFilters.supplierId);
									}}
								/>
							</Box>
						</HStack>
						{/* Stats Card - Đơn chờ nhận */}

						{/* Search Bar */}
						<Flex
							mb={4}
							gap={3}
							align="stretch">
							<Box flex={1}>
								<input
									type="text"
									placeholder="Tìm kiếm theo mã phiếu nhập, nhà cung cấp..."
									value={filters.searchQuery || ""}
									onChange={(e) =>
										handleFilterChange("searchQuery", e.target.value)
									}
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
							{(filters.searchQuery !== "" ||
								filters.status !== "all" ||
								filters.paymentStatus !== "all" ||
								filters.supplierId !== "all") && (
								<Button
									leftIcon={<RepeatIcon />}
									variant="ghost"
									colorScheme="gray"
									onClick={resetFilters}
									fontSize="14px"
									fontWeight="600"
									px={4}
									flexShrink={0}>
									Đặt lại bộ lọc
								</Button>
							)}
						</Flex>

						{/* Purchase Table */}
						<PurchaseTable
							purchases={purchases}
							onViewDetail={handleViewDetail}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>

						{/* Pagination */}
						{purchases.length > 0 && (
							<Flex
								justify="center"
								mt={4}>
								<Pagination
									currentPage={currentPage}
									totalPages={pagination.totalPages}
									totalItems={totalItems}
									pageSize={pageSize}
									onPageChange={handlePageChange}
									itemLabel="phiếu nhập"
								/>
							</Flex>
						)}
					</>
				)}

				{/* Modals */}
				<AddPurchaseModal
					isOpen={isAddModalOpen}
					onClose={() => {
						onAddModalClose();
						setImportedItems([]);
					}}
					onAdd={handleAddPurchase}
					suppliers={suppliers}
					initialItems={importedItems}
				/>

				<PurchaseDetailModal
					isOpen={isDetailModalOpen}
					onClose={onDetailModalClose}
					purchase={selectedPurchase}
				/>

				<ImportExcelModal
					isOpen={isImportModalOpen}
					onClose={onImportModalClose}
					onImport={handleImportFromExcel}
				/>
			</Box>
		</MainLayout>
	);
};

export default PurchasePage;
