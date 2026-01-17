import { useState, useEffect } from "react";
import {
	Box,
	Text,
	SimpleGrid,
	Flex,
	Spinner,
	useDisclosure,
	useToast,
	Button,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { BsExclamationTriangle, BsTrash } from "react-icons/bs";
import { FiPackage } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import {
	ProductSearchBar,
	ProductTable,
	StatsCard,
	EditProductModal,
	ProductDetailModal,
	BatchListModal,
	DisposalModal,
	CriticalAlertsBanner,
} from "@/components/inventory";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import type {
	InventoryProduct,
	InventoryCategory,
	InventoryStats,
	ProductBatch,
	DisposalItem,
} from "@/types";
import type { InventoryFilters } from "@/types/filters";
import { inventoryService } from "@/services/inventoryService";
import { useAuthStore } from "@/store/authStore";

const ITEMS_PER_PAGE = 10;

const InventoryPage = () => {
	const toast = useToast();
	const { user } = useAuthStore();

	// State for data from API
	const [products, setProducts] = useState<InventoryProduct[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [categories, setCategories] = useState<InventoryCategory[]>([]);
	const [stats, setStats] = useState<InventoryStats | null>(null);

	// Modal states
	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null,
	);
	const [selectedProduct, setSelectedProduct] =
		useState<InventoryProduct | null>(null);
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
	const {
		isOpen: isBatchModalOpen,
		onOpen: onBatchModalOpen,
		onClose: onBatchModalClose,
	} = useDisclosure();
	const {
		isOpen: isDisposalModalOpen,
		onOpen: onDisposalModalOpen,
		onClose: onDisposalModalClose,
	} = useDisclosure();

	// Fetch function for API call
	const fetchProducts = async (filters: InventoryFilters) => {
		const response = await inventoryService.getProducts(filters);
		setProducts(response.data);
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
	} = useFilters<InventoryFilters>(
		{
			page: 1,
			pageSize: ITEMS_PER_PAGE,
			searchQuery: "",
			category: "all",
			status: "all",
			stockLevel: "all",
		},
		fetchProducts,
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

	// Load categories and stats on mount
	useEffect(() => {
		const loadInitialData = async () => {
			try {
				// Load categories from API
				const categoriesData = await inventoryService.getCategories();
				setCategories(categoriesData);
			} catch (error) {
				console.error("Error loading categories:", error);
				setCategories([]);
			}

			try {
				// Load stats from API
				const statsData = await inventoryService.getStats();
				setStats(statsData);
			} catch (error) {
				console.error("Error loading stats:", error);
				setStats(null);
			}
		};

		loadInitialData();
	}, []);

	const handleUpdateProduct = async (
		id: string,
		updates: Partial<InventoryProduct>,
	) => {
		await inventoryService.updateProduct(id, updates);
		// Refresh data after updating
		await fetchProducts(filters);
		onEditModalClose();
		// Reload stats after updating
		try {
			const statsData = await inventoryService.getStats();
			setStats(statsData);
		} catch (error) {
			console.error("Error reloading stats:", error);
		}
	};

	const handleDeleteProduct = async (id: string) => {
		await inventoryService.deleteProduct(id);
		// Refresh data after deleting
		await fetchProducts(filters);
		toast({
			title: "Thành công",
			description: "Đã xóa sản phẩm",
			status: "success",
			duration: 3000,
		});
		// Reload stats after deletion
		try {
			const statsData = await inventoryService.getStats();
			setStats(statsData);
		} catch (error) {
			console.error("Error reloading stats:", error);
		}
	};

	const handleViewDetail = (id: string) => {
		setSelectedProductId(id);
		onDetailModalOpen();
	};

	const handleEdit = (id: string) => {
		setSelectedProductId(id);
		onEditModalOpen();
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
			await handleDeleteProduct(id);
		}
	};

	const handleManageBatches = (id: string) => {
		const product = products.find((p) => p.id === id);
		if (product) {
			setSelectedProduct(product);
			onBatchModalOpen();
		}
	};

	const handleUpdateBatch = async (
		batchId: string,
		updates: Partial<ProductBatch>,
	) => {
		if (!selectedProduct) return;

		try {
			// Call API to update lot
			if (updates.quantity !== undefined) {
				await inventoryService.updateLot(
					batchId,
					updates.quantity ?? 0,
					"active",
				);
			}

			await fetchProducts(filters);

			// Update selected product for the modal
			const updatedProduct = products.find(
				(p) => p.id === selectedProduct.id,
			);
			if (updatedProduct) {
				setSelectedProduct(updatedProduct);
			}

			toast({
				title: "Thành công",
				description: "Đã cập nhật lô hàng",
				status: "success",
				duration: 3000,
			});

			// Reload stats after updating
			try {
				const statsData = await inventoryService.getStats();
				setStats(statsData);
			} catch (statsError) {
				console.error("Error reloading stats:", statsError);
			}
		} catch (error) {
			console.error("Error updating batch:", error);
			toast({
				title: "Lỗi",
				description: "Không thể cập nhật lô hàng",
				status: "error",
				duration: 3000,
			});
			throw error;
		}
	};

	// Stats card click handlers
	const handleStatClick = (stockLevel: string) => {
		if (filters.stockLevel === stockLevel) {
			handleFilterChange("stockLevel", "all");
		} else {
			handleFilterChange("stockLevel", stockLevel);
		}
	};

	const handleDisposal = () => {
		onDisposalModalOpen();
	};

	const handleSubmitDisposal = async (
		items: DisposalItem[],
		note: string,
	) => {
		try {
			// Process each disposal item
			const staffId = user?.id ?? "guest_staff";

			for (const item of items) {
				await inventoryService.disposeLot(
					item.batchId,
					item.quantity,
					item.reason as "expired" | "damaged" | "lost" | "other",
					staffId,
					note,
				);
			}

			// Reload data to update stats and inventory
			await fetchProducts(filters);

			// Reload stats
			try {
				const statsData = await inventoryService.getStats();
				setStats(statsData);
			} catch (error) {
				console.error("Error reloading stats:", error);
			}

			toast({
				title: "Thành công",
				description: `Đã hủy ${items.length} lô hàng`,
				status: "success",
				duration: 3000,
			});
		} catch (error) {
			console.error("Error creating disposal:", error);
			throw error;
		}
	};

	return (
		<MainLayout>
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={6}>
				{/* Page Title */}
				<Flex
					justify="space-between"
					align="center"
					mb={6}>
					<Text
						fontSize={{ base: "28px", md: "36px" }}
						fontWeight="600"
						color="brand.600">
						Quản lý hàng hóa
					</Text>
					<Button
						leftIcon={<BsTrash />}
						colorScheme="red"
						variant="outline"
						onClick={handleDisposal}
						size="md"
						fontWeight="600">
						Hủy hàng
					</Button>
				</Flex>

				{/* Critical Alerts Banner - Shows when there are urgent issues */}
				{stats && (stats.expiredBatches > 0 || stats.outOfStockProducts > 0 || stats.expiringSoonBatches > 0 || stats.lowStockProducts > 0) && (
					<CriticalAlertsBanner
						expiredBatches={stats.expiredBatches}
						expiringSoonBatches={stats.expiringSoonBatches}
						outOfStockProducts={stats.outOfStockProducts}
						lowStockProducts={stats.lowStockProducts}
						onFilterByIssue={(issue) => handleFilterChange("stockLevel", issue)}
					/>
				)}

				{/* Stats Cards */}
				{stats && (
					<SimpleGrid
						columns={{ base: 1, sm: 2, lg: 4 }}
						spacing={5}
						mb={6}>
						<StatsCard
							title="Sắp hết hàng"
							value={stats.lowStockProducts}
							icon={BsExclamationTriangle}
							color="orange.500"
							bgGradient="linear(135deg, #ED8936 0%, #DD6B20 100%)"
							onClick={() => handleStatClick("low")}
							severity="warning"
						/>
						<StatsCard
							title="Hết hàng"
							value={stats.outOfStockProducts}
							icon={FiPackage}
							color="red.500"
							bgGradient="linear(135deg, #F56565 0%, #E53E3E 100%)"
							onClick={() => handleStatClick("out")}
							severity="critical"
						/>
						<StatsCard
							title="Lô sắp hết hạn"
							value={stats.expiringSoonBatches}
							icon={BsExclamationTriangle}
							color="orange.500"
							bgGradient="linear(135deg, #F6AD55 0%, #ED8936 100%)"
							onClick={() => handleStatClick("expiring-soon")}
							severity="warning"
						/>
						<StatsCard
							title="Lô đã hết hạn"
							value={stats.expiredBatches}
							icon={FiPackage}
							color="red.500"
							bgGradient="linear(135deg, #FC8181 0%, #F56565 100%)"
							onClick={() => handleStatClick("expired")}
							severity="critical"
						/>
					</SimpleGrid>
				)}

				{/* Search & Filter Bar */}
				<ProductSearchBar
					filters={{
						searchQuery: filters.searchQuery || "",
						category: (filters.category || "all") as "all" | string,
						status: (filters.status || "all") as
							| "all"
							| "active"
							| "inactive",
						stockLevel: (filters.stockLevel || "all") as
							| "all"
							| "normal"
							| "low"
							| "out"
							| "expiring-soon"
							| "expired",
					}}
					categories={categories}
					onFiltersChange={(newFilters) => {
						handleFilterChange(
							"searchQuery",
							newFilters.searchQuery,
						);
						handleFilterChange("category", newFilters.category);
						handleFilterChange("status", newFilters.status);
						handleFilterChange("stockLevel", newFilters.stockLevel);
					}}
				/>
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
				{/* Product Table */}
				{!loading && !error && (
					<>
						<Box mb={6}>
							<Flex
								justify="space-between"
								align="center"
								mb={4}
								px={2}
								minH="40px">
								<Text
									fontSize="18px"
									fontWeight="600"
									color="gray.700">
									Danh sách hàng hóa ({totalItems})
								</Text>
								{(filters.category !== "all" ||
									filters.status !== "all" ||
									filters.stockLevel !== "all" ||
									filters.searchQuery !== "") && (
									<Button
										leftIcon={<RepeatIcon />}
										variant="ghost"
										colorScheme="gray"
										onClick={resetFilters}
										fontSize="14px"
										fontWeight="600">
										Đặt lại bộ lọc
									</Button>
								)}
							</Flex>

							<ProductTable
								products={products}
								onViewDetail={handleViewDetail}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						</Box>

						{/* Pagination */}
						{products.length > 0 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={totalItems}
								pageSize={pageSize}
								onPageChange={handlePageChange}
								showInfo={true}
								itemLabel="sản phẩm"
							/>
						)}
					</>
				)}
				{/* Empty State */}
				{!loading && !error && products.length === 0 && (
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
							filters.category !== "all" ||
							filters.status !== "all" ||
							filters.stockLevel !== "all"
								? "Không tìm thấy sản phẩm nào"
								: "Chưa có sản phẩm"}
						</Text>
					</Flex>
				)}
			</Box>

			{/* Edit Product Modal */}
			<EditProductModal
				isOpen={isEditModalOpen}
				onClose={onEditModalClose}
				productId={selectedProductId}
				onUpdate={handleUpdateProduct}
				categories={categories}
			/>

			{/* Product Detail Modal */}
			<ProductDetailModal
				isOpen={isDetailModalOpen}
				onClose={onDetailModalClose}
				productId={selectedProductId}
				onEdit={handleEdit}
				onDelete={handleDeleteProduct}
				onManageBatches={handleManageBatches}
			/>

			{/* Batch List Modal */}
			<BatchListModal
				isOpen={isBatchModalOpen}
				onClose={onBatchModalClose}
				product={selectedProduct}
				onUpdateBatch={handleUpdateBatch}
			/>

			{/* Disposal Modal */}
			<DisposalModal
				isOpen={isDisposalModalOpen}
				onClose={onDisposalModalClose}
				products={products}
				onSubmit={handleSubmitDisposal}
			/>
		</MainLayout>
	);
};

export default InventoryPage;
