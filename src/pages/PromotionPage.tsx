import { useState, useEffect } from "react";
import {
	Box,
	Text,
	SimpleGrid,
	Flex,
	Spinner,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { FiPercent, FiShoppingBag, FiClock } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import {
	PromotionSearchBar,
	PromotionFilterBar,
	PromotionTable,
	StatsCard,
	AddPromotionModal,
	EditPromotionModal,
	PromotionDetailModal,
} from "@/components/promotion";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import type { Promotion, PromotionStats, PromotionFormData } from "@/types";
import type { PromotionFilters } from "@/types/filters";
import { promotionService } from "@/services/promotionService";
import apiService from "@/lib/api";

const ITEMS_PER_PAGE = 10;

const PromotionPage = () => {
	const toast = useToast();

	// State for data from API
	const [promotions, setPromotions] = useState<Promotion[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [stats, setStats] = useState<PromotionStats | null>(null);

	// Modal states
	const [selectedPromotionId, setSelectedPromotionId] = useState<
		string | null
	>(null);
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
	const fetchPromotions = async (filters: PromotionFilters) => {
		const response = await promotionService.getPromotions(filters);
		setPromotions(response.data);
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
	} = useFilters<PromotionFilters>(
		{
			page: 1,
			pageSize: ITEMS_PER_PAGE,
			searchQuery: "",
			type: "all",
			status: "all",
		},
		fetchPromotions,
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
				const response = await apiService.get<{ data: PromotionStats }>("/promotions/stats");
				setStats(response.data || null);
			} catch {
				// API not available - show empty stats
				setStats(null);
			}
		};
		loadStats();
	}, []);

	const loadStats = async () => {
		// TODO: Wire to stats endpoint when available
	};

	const handleAddPromotion = async (promotion: PromotionFormData) => {
		await promotionService.createPromotion(
			promotion as Omit<Promotion, "id">,
		);
		// Refresh data after adding
		await fetchPromotions(filters);
		onAddModalClose();
		// Reload stats after adding
		loadStats();
	};

	const handleUpdatePromotion = async (
		id: string,
		updates: Partial<Promotion>,
	) => {
		await promotionService.updatePromotion(id, updates);
		// Refresh data after updating
		await fetchPromotions(filters);
		onEditModalClose();
		// Reload stats after updating
		loadStats();
	};

	const handleDeletePromotion = async (id: string) => {
		await promotionService.deletePromotion(id);
		// Refresh data after deleting
		await fetchPromotions(filters);
		toast({
			title: "Thành công",
			description: "Đã xóa khuyến mãi",
			status: "success",
			duration: 3000,
		});
		// Reload stats after deletion
		loadStats();
	};

	const handleViewDetail = (id: string) => {
		setSelectedPromotionId(id);
		onDetailModalOpen();
	};

	const handleEdit = (id: string) => {
		setSelectedPromotionId(id);
		onEditModalOpen();
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
			await handleDeletePromotion(id);
		}
	};

	// Stats card click handlers
	const handleStatClick = (status: string) => {
		if (filters.status === status) {
			handleFilterChange("status", "all");
		} else {
			handleFilterChange("status", status);
		}
	};

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
					Quản lý khuyến mãi
				</Text>

				{/* Stats Cards */}
				{stats && (
					<SimpleGrid
						columns={{ base: 1, sm: 2, lg: 3 }}
						spacing={5}
						mb={6}>
						<StatsCard
							title="Đang áp dụng"
							value={stats.activePromotions}
							icon={FiPercent}
							bgGradient="linear(135deg, #48BB78 0%, #38A169 100%)"
							onClick={() => handleStatClick("active")}
						/>
						<StatsCard
							title="Sắp diễn ra"
							value={stats.upcomingPromotions}
							icon={FiClock}
							bgGradient="linear(135deg, #ED8936 0%, #DD6B20 100%)"
							onClick={() => handleStatClick("inactive")}
						/>
						<StatsCard
							title="Đã hết hạn"
							value={stats.expiredPromotions}
							icon={FiShoppingBag}
							bgGradient="linear(135deg, #F56565 0%, #E53E3E 100%)"
							onClick={() => handleStatClick("expired")}
						/>
					</SimpleGrid>
				)}

				{/* Search Bar */}
				<PromotionSearchBar
					searchQuery={filters.searchQuery || ""}
					onSearchChange={(value) =>
						handleFilterChange("searchQuery", value)
					}
					onAddPromotion={onAddModalOpen}
				/>

				{/* Filter Bar */}
				<PromotionFilterBar
					filters={{
						searchQuery: filters.searchQuery || "",
						type: filters.type || "all",
						status: filters.status || "all",
					}}
					onFiltersChange={(newFilters) => {
						handleFilterChange("type", newFilters.type);
						handleFilterChange("status", newFilters.status);
					}}
					onReset={resetFilters}
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

				{/* Promotion Table */}
				{!loading && !error && (
					<>
						<Box mb={6}>
							<Flex
								justify="space-between"
								align="center"
								mb={4}
								px={2}>
								<Text
									fontSize="18px"
									fontWeight="600"
									color="gray.700">
									Danh sách khuyến mãi ({totalItems})
								</Text>
							</Flex>

							<PromotionTable
								promotions={promotions}
								onViewDetail={handleViewDetail}
								onEdit={handleEdit}
								onDelete={handleDelete}
								searchQuery={filters.searchQuery || ""}
							/>
						</Box>

						{/* Pagination */}
						{promotions.length > 0 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={totalItems}
								pageSize={pageSize}
								onPageChange={handlePageChange}
								showInfo={true}
								itemLabel="khuyến mãi"
							/>
						)}
					</>
				)}

				{/* Empty State */}
				{!loading && !error && promotions.length === 0 && (
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
							filters.type !== "all" ||
							filters.status !== "all"
								? "Không tìm thấy khuyến mãi nào"
								: "Chưa có khuyến mãi"}
						</Text>
					</Flex>
				)}
			</Box>

			{/* Add Promotion Modal */}
			<AddPromotionModal
				isOpen={isAddModalOpen}
				onClose={onAddModalClose}
				onAdd={handleAddPromotion}
			/>

			{/* Edit Promotion Modal */}
			<EditPromotionModal
				isOpen={isEditModalOpen}
				onClose={onEditModalClose}
				promotionId={selectedPromotionId}
				onUpdate={handleUpdatePromotion}
			/>

			{/* Promotion Detail Modal */}
			<PromotionDetailModal
				isOpen={isDetailModalOpen}
				onClose={onDetailModalClose}
				promotionId={selectedPromotionId}
				onEdit={handleEdit}
				onDelete={handleDeletePromotion}
			/>
		</MainLayout>
	);
};

export default PromotionPage;
