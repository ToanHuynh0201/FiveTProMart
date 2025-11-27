import { useState, useEffect } from "react";
import {
	Box,
	Text,
	SimpleGrid,
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
} from "@chakra-ui/react";
import { AddIcon, DownloadIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
	BsBoxSeam,
	BsExclamationTriangle,
	BsFileEarmarkExcel,
} from "react-icons/bs";
import { FiPackage, FiTrendingUp } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import {
	PurchaseTable,
	PurchaseFilterBar,
	AddPurchaseModal,
	PurchaseDetailModal,
	ImportExcelModal,
} from "@/components/purchase";
import { StatsCard } from "@/components/inventory";
import { Pagination } from "@/components/common";
import { usePagination } from "@/hooks";
import { purchaseService } from "@/services/purchaseService";
import type {
	Purchase,
	PurchaseFilter,
	PurchaseStats,
	Supplier,
	PurchaseItem,
} from "@/types";

const ITEMS_PER_PAGE = 10;

const PurchasePage = () => {
	const toast = useToast();
	const { currentPage, total, pageSize, goToPage, setTotal } = usePagination({
		initialPage: 1,
		pageSize: ITEMS_PER_PAGE,
		initialTotal: 0,
	});

	// Data states
	const [purchases, setPurchases] = useState<Purchase[]>([]);
	const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	const [stats, setStats] = useState<PurchaseStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Filter states
	const [filters, setFilters] = useState<PurchaseFilter>({
		searchQuery: "",
		status: "all",
		paymentStatus: "all",
		supplierId: "all",
	});

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

	// Load initial data
	useEffect(() => {
		loadData();
	}, []);

	// Apply filters when filters or purchases change
	useEffect(() => {
		applyFilters();
	}, [filters, purchases]);

	const loadData = async () => {
		setIsLoading(true);
		try {
			const [purchasesData, suppliersData, statsData] = await Promise.all(
				[
					purchaseService.getAllPurchases(),
					purchaseService.getSuppliers(),
					purchaseService.getStats(),
				],
			);

			setPurchases(purchasesData);
			setSuppliers(suppliersData);
			setStats(statsData);
		} catch (error) {
			toast({
				title: "Lỗi",
				description: "Không thể tải dữ liệu",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	};

	const applyFilters = async () => {
		try {
			const filtered = await purchaseService.filterPurchases(filters);
			setFilteredPurchases(filtered);
			setTotal(filtered.length);
			goToPage(1);
		} catch (error) {
			console.error("Error applying filters:", error);
		}
	};

	const handleResetFilters = () => {
		setFilters({
			searchQuery: "",
			status: "all",
			paymentStatus: "all",
			supplierId: "all",
		});
	};

	const handleAddPurchase = async (
		purchase: Omit<Purchase, "id" | "createdAt" | "updatedAt">,
	) => {
		await purchaseService.createPurchase(purchase);
		await loadData();
		// Reset imported items after successfully creating purchase
		setImportedItems([]);
	};

	const handleViewDetail = (id: string) => {
		const purchase = purchases.find((p) => p.id === id);
		if (purchase) {
			setSelectedPurchase(purchase);
			onDetailModalOpen();
		}
	};

	const handleEdit = (_id: string) => {
		// TODO: Implement edit functionality
		toast({
			title: "Thông báo",
			description: "Tính năng đang phát triển",
			status: "info",
			duration: 2000,
		});
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Bạn có chắc chắn muốn xóa phiếu nhập này?")) {
			try {
				await purchaseService.deletePurchase(id);
				toast({
					title: "Thành công",
					description: "Đã xóa phiếu nhập",
					status: "success",
					duration: 2000,
				});
				await loadData();
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

	const handleExportToExcel = () => {
		if (filteredPurchases.length === 0) {
			toast({
				title: "Thông báo",
				description: "Không có dữ liệu để xuất",
				status: "warning",
				duration: 2000,
			});
			return;
		}

		purchaseService.exportPurchasesToExcel(filteredPurchases);
		toast({
			title: "Thành công",
			description: "Đã xuất file Excel",
			status: "success",
			duration: 2000,
		});
	};

	// Paginated purchases
	const paginatedPurchases = filteredPurchases.slice(
		(currentPage - 1) * pageSize,
		currentPage * pageSize,
	);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("vi-VN", {
			style: "currency",
			currency: "VND",
		}).format(amount);
	};

	return (
		<MainLayout>
			<Box
				p={{ base: 4, md: 8 }}
				maxW="1400px"
				mx="auto">
				{/* Header */}
				<Flex
					justify="space-between"
					align="center"
					mb={8}
					flexWrap="wrap"
					gap={4}>
					<Box>
						<Text
							fontSize="28px"
							fontWeight="700"
							color="gray.800"
							mb={1}>
							Quản lý Nhập hàng
						</Text>
						<Text
							fontSize="15px"
							color="gray.600">
							Quản lý phiếu nhập hàng và nhà cung cấp
						</Text>
					</Box>
					<Flex gap={3}>
						<Menu>
							<MenuButton
								as={Button}
								leftIcon={<Icon as={BsFileEarmarkExcel} />}
								rightIcon={<ChevronDownIcon />}
								colorScheme="green"
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
							size="lg"
							px={6}
							fontSize="15px"
							fontWeight="600"
							onClick={onAddModalOpen}>
							Tạo phiếu nhập
						</Button>
					</Flex>
				</Flex>

				{/* Stats Cards */}
				{isLoading ? (
					<Flex
						justify="center"
						py={10}>
						<Spinner
							size="xl"
							color="brand.500"
						/>
					</Flex>
				) : (
					<>
						<SimpleGrid
							columns={{ base: 1, sm: 2, lg: 4 }}
							spacing={6}
							mb={8}>
							<StatsCard
								title="Tổng phiếu nhập"
								value={stats?.totalPurchases || 0}
								icon={BsBoxSeam}
								color="blue.500"
								bgGradient="linear(to-br, blue.400, blue.600)"
							/>
							<StatsCard
								title="Tổng tiền nhập"
								value={formatCurrency(stats?.totalAmount || 0)}
								icon={FiTrendingUp}
								color="green.500"
								bgGradient="linear(to-br, green.400, green.600)"
							/>
							<StatsCard
								title="Đơn chờ nhận"
								value={stats?.pendingOrders || 0}
								icon={BsExclamationTriangle}
								color="orange.500"
								bgGradient="linear(to-br, orange.400, orange.600)"
							/>
							<StatsCard
								title="Tổng mặt hàng"
								value={stats?.totalItems || 0}
								icon={FiPackage}
								color="purple.500"
								bgGradient="linear(to-br, purple.400, purple.600)"
							/>
						</SimpleGrid>

						{/* Filters */}
						<PurchaseFilterBar
							filters={filters}
							suppliers={suppliers}
							onFiltersChange={setFilters}
							onReset={handleResetFilters}
						/>

						{/* Search Bar */}
						<Box mb={6}>
							<input
								type="text"
								placeholder="Tìm kiếm theo mã phiếu nhập, nhà cung cấp..."
								value={filters.searchQuery}
								onChange={(e) =>
									setFilters({
										...filters,
										searchQuery: e.target.value,
									})
								}
								style={{
									width: "100%",
									padding: "12px 16px",
									fontSize: "15px",
									border: "1px solid #E2E8F0",
									borderRadius: "10px",
									outline: "none",
								}}
							/>
						</Box>

						{/* Purchase Table */}
						<PurchaseTable
							purchases={paginatedPurchases}
							onViewDetail={handleViewDetail}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>

						{/* Pagination */}
						{total > pageSize && (
							<Flex
								justify="center"
								mt={6}>
								<Pagination
									currentPage={currentPage}
									totalPages={Math.ceil(total / pageSize)}
									totalItems={total}
									pageSize={pageSize}
									onPageChange={goToPage}
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
