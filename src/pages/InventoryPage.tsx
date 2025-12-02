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
import { BsExclamationTriangle } from "react-icons/bs";
import { FiPackage } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import {
	ProductSearchBar,
	ProductTable,
	StatsCard,
	EditProductModal,
	ProductDetailModal,
} from "@/components/inventory";
import { Pagination } from "@/components/common";
import { usePagination } from "@/hooks";
import { inventoryService } from "@/services/inventoryService";
import type {
	InventoryProduct,
	ProductFilter,
	InventoryCategory,
	InventoryStats,
} from "@/types";

const ITEMS_PER_PAGE = 10;

const InventoryPage = () => {
	const toast = useToast();
	const { currentPage, total, pageSize, pagination, goToPage, setTotal } =
		usePagination({
			initialPage: 1,
			pageSize: ITEMS_PER_PAGE,
			initialTotal: 0,
		});

	// Data states
	const [products, setProducts] = useState<InventoryProduct[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<
		InventoryProduct[]
	>([]);
	const [categories, setCategories] = useState<InventoryCategory[]>([]);
	const [stats, setStats] = useState<InventoryStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Filter states
	const [filters, setFilters] = useState<ProductFilter>({
		searchQuery: "",
		category: "all",
		status: "all",
		stockLevel: "all",
	});

	// Modal states
	const [selectedProductId, setSelectedProductId] = useState<string | null>(
		null,
	);
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

	// Load initial data
	useEffect(() => {
		loadData();
	}, []);

	// Apply filters when filters or products change
	useEffect(() => {
		applyFilters();
	}, [filters, products]);

	const loadData = async () => {
		setIsLoading(true);
		try {
			const [productsData, categoriesData, statsData] = await Promise.all(
				[
					inventoryService.getAllProducts(),
					inventoryService.getCategories(),
					inventoryService.getStats(),
				],
			);

			setProducts(productsData);
			setCategories(categoriesData);
			setStats(statsData);
			setFilteredProducts(productsData);
			setTotal(productsData.length);
		} catch (error) {
			console.error("Error loading data:", error);
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
			const filtered = await inventoryService.filterProducts(filters);
			setFilteredProducts(filtered);
			setTotal(filtered.length);
			goToPage(1); // Reset to first page when filtering
		} catch (error) {
			console.error("Error filtering products:", error);
		}
	};

	const handleFiltersChange = (newFilters: ProductFilter) => {
		setFilters(newFilters);
	};

	const handleResetFilters = () => {
		setFilters({
			searchQuery: "",
			category: "all",
			status: "all",
			stockLevel: "all",
		});
	};

	const handleUpdateProduct = async (
		id: string,
		updates: Partial<InventoryProduct>,
	) => {
		try {
			await inventoryService.updateProduct(id, updates);
			await loadData(); // Reload all data to update stats
		} catch (error) {
			console.error("Error updating product:", error);
			throw error;
		}
	};

	const handleDeleteProduct = async (id: string) => {
		try {
			const success = await inventoryService.deleteProduct(id);
			if (success) {
				await loadData(); // Reload all data to update stats
				toast({
					title: "Thành công",
					description: "Đã xóa sản phẩm",
					status: "success",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error deleting product:", error);
			throw error;
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

	// Stats card click handlers
	const handleLowStockClick = () => {
		if (filters.stockLevel === "low") {
			handleResetFilters();
		} else {
			setFilters({
				...filters,
				stockLevel: "low",
				searchQuery: "",
			});
		}
	};

	const handleOutOfStockClick = () => {
		if (filters.stockLevel === "out") {
			handleResetFilters();
		} else {
			setFilters({
				...filters,
				stockLevel: "out",
				searchQuery: "",
			});
		}
	};

	const handleExpiringSoonClick = () => {
		if (filters.stockLevel === "expiring-soon") {
			handleResetFilters();
		} else {
			setFilters({
				...filters,
				stockLevel: "expiring-soon",
				searchQuery: "",
			});
		}
	};

	const handleExpiredClick = () => {
		if (filters.stockLevel === "expired") {
			handleResetFilters();
		} else {
			setFilters({
				...filters,
				stockLevel: "expired",
				searchQuery: "",
			});
		}
	};

	// Pagination
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const currentProducts = filteredProducts.slice(startIndex, endIndex);

	return (
		<MainLayout>
			<Box
				px={{ base: 4, md: 6, lg: 8 }}
				py={6}>
				{/* Page Title */}
				<Text
					fontSize={{ base: "28px", md: "36px" }}
					fontWeight="600"
					color="brand.600"
					mb={6}>
					Quản lý hàng hóa
				</Text>
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
							onClick={handleLowStockClick}
						/>
						<StatsCard
							title="Hết hàng"
							value={stats.outOfStockProducts}
							icon={FiPackage}
							color="red.500"
							bgGradient="linear(135deg, #F56565 0%, #E53E3E 100%)"
							onClick={handleOutOfStockClick}
						/>
						<StatsCard
							title="Lô sắp hết hạn"
							value={stats.expiringSoonBatches}
							icon={BsExclamationTriangle}
							color="orange.500"
							bgGradient="linear(135deg, #F6AD55 0%, #ED8936 100%)"
							onClick={handleExpiringSoonClick}
						/>
						<StatsCard
							title="Lô đã hết hạn"
							value={stats.expiredBatches}
							icon={FiPackage}
							color="red.500"
							bgGradient="linear(135deg, #FC8181 0%, #F56565 100%)"
							onClick={handleExpiredClick}
						/>
					</SimpleGrid>
				)}
				{/* Search & Filter Bar */}
				<ProductSearchBar
					filters={filters}
					categories={categories}
					onFiltersChange={handleFiltersChange}
				/>
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
				{/* Product Table */}
				{!isLoading && (
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
									Danh sách hàng hóa (
									{filteredProducts.length})
								</Text>
								{(filters.category !== "all" ||
									filters.status !== "all" ||
									filters.stockLevel !== "all" ||
									filters.searchQuery !== "") && (
									<Button
										leftIcon={<RepeatIcon />}
										variant="ghost"
										colorScheme="gray"
										onClick={handleResetFilters}
										fontSize="14px"
										fontWeight="600">
										Đặt lại bộ lọc
									</Button>
								)}
							</Flex>

							<ProductTable
								products={currentProducts}
								onViewDetail={handleViewDetail}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						</Box>

						{/* Pagination */}
						{filteredProducts.length > 0 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={total}
								pageSize={pageSize}
								onPageChange={goToPage}
								showInfo={true}
								itemLabel="sản phẩm"
							/>
						)}
					</>
				)}
				{/* Empty State */}
				{!isLoading && filteredProducts.length === 0 && (
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
			/>
		</MainLayout>
	);
};

export default InventoryPage;
