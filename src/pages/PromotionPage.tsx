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
import { usePagination } from "@/hooks";
import type {
	Promotion,
	PromotionFilter,
	PromotionStats,
	PromotionFormData,
} from "@/types";

const ITEMS_PER_PAGE = 10;

const PromotionPage = () => {
	const toast = useToast();
	const { currentPage, total, pageSize, pagination, goToPage, setTotal } =
		usePagination({
			initialPage: 1,
			pageSize: ITEMS_PER_PAGE,
			initialTotal: 0,
		});

	// Data states
	const [promotions, setPromotions] = useState<Promotion[]>([]);
	const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>(
		[],
	);
	const [stats, setStats] = useState<PromotionStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Filter states
	const [filters, setFilters] = useState<PromotionFilter>({
		searchQuery: "",
		type: "all",
		status: "all",
	});

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

	// Load initial data
	useEffect(() => {
		loadData();
	}, []);

	// Apply filters when filters or promotions change
	useEffect(() => {
		applyFilters();
	}, [filters, promotions]);

	const loadData = async () => {
		setIsLoading(true);
		try {
			// TODO: Replace with promotionService.getAllPromotions()
			const promotionsData: Promotion[] = [];

			// TODO: Replace with promotionService.getStats()
			const statsData: PromotionStats = {
				activePromotions: 0,
				upcomingPromotions: 0,
				expiredPromotions: 0,
			};

			setPromotions(promotionsData);
			setStats(statsData);
			setFilteredPromotions(promotionsData);
			setTotal(promotionsData.length);
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
			// TODO: Replace with promotionService.filterPromotions(filters)
			const filtered: Promotion[] = [];
			setFilteredPromotions(filtered);
			setTotal(filtered.length);
			goToPage(1); // Reset to first page when filtering
		} catch (error) {
			console.error("Error filtering promotions:", error);
		}
	};

	const handleFiltersChange = (newFilters: PromotionFilter) => {
		setFilters(newFilters);
	};

	const handleResetFilters = () => {
		setFilters({
			searchQuery: "",
			type: "all",
			status: "all",
		});
	};

	const handleSearchChange = (query: string) => {
		setFilters({ ...filters, searchQuery: query });
	};

	const handleAddPromotion = async (promotion: PromotionFormData) => {
		try {
			// TODO: Replace with promotionService.addPromotion(promotion)
			await loadData(); // Reload all data to update stats
		} catch (error) {
			console.error("Error adding promotion:", error);
			throw error;
		}
	};

	const handleUpdatePromotion = async (
		id: string,
		updates: Partial<Promotion>,
	) => {
		try {
			// TODO: Replace with promotionService.updatePromotion(id, updates)
			await loadData(); // Reload all data to update stats
		} catch (error) {
			console.error("Error updating promotion:", error);
			throw error;
		}
	};

	const handleDeletePromotion = async (id: string) => {
		try {
			// TODO: Replace with promotionService.deletePromotion(id)
			const success = true;
			if (success) {
				await loadData(); // Reload all data to update stats
				toast({
					title: "Thành công",
					description: "Đã xóa khuyến mãi",
					status: "success",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error deleting promotion:", error);
			throw error;
		}
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
	const handleActiveClick = () => {
		if (filters.status === "active") {
			handleResetFilters();
		} else {
			setFilters({
				...filters,
				status: "active",
				searchQuery: "",
			});
		}
	};

	const handleUpcomingClick = () => {
		if (filters.status === "inactive") {
			handleResetFilters();
		} else {
			setFilters({
				...filters,
				status: "inactive",
				searchQuery: "",
			});
		}
	};

	const handleExpiredClick = () => {
		if (filters.status === "expired") {
			handleResetFilters();
		} else {
			setFilters({
				...filters,
				status: "expired",
				searchQuery: "",
			});
		}
	};

	// Pagination
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = startIndex + pageSize;
	const currentPromotions = filteredPromotions.slice(startIndex, endIndex);

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
							onClick={handleActiveClick}
						/>
						<StatsCard
							title="Sắp diễn ra"
							value={stats.upcomingPromotions}
							icon={FiClock}
							bgGradient="linear(135deg, #ED8936 0%, #DD6B20 100%)"
							onClick={handleUpcomingClick}
						/>
						<StatsCard
							title="Đã hết hạn"
							value={stats.expiredPromotions}
							icon={FiShoppingBag}
							bgGradient="linear(135deg, #F56565 0%, #E53E3E 100%)"
							onClick={handleExpiredClick}
						/>
					</SimpleGrid>
				)}

				{/* Search Bar */}
				<PromotionSearchBar
					searchQuery={filters.searchQuery}
					onSearchChange={handleSearchChange}
					onAddPromotion={onAddModalOpen}
				/>

				{/* Filter Bar */}
				<PromotionFilterBar
					filters={filters}
					onFiltersChange={handleFiltersChange}
					onReset={handleResetFilters}
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

				{/* Promotion Table */}
				{!isLoading && (
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
									Danh sách khuyến mãi (
									{filteredPromotions.length})
								</Text>
							</Flex>

							<PromotionTable
								promotions={currentPromotions}
								onViewDetail={handleViewDetail}
								onEdit={handleEdit}
								onDelete={handleDelete}
								searchQuery={filters.searchQuery}
							/>
						</Box>

						{/* Pagination */}
						{filteredPromotions.length > 0 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={total}
								pageSize={pageSize}
								onPageChange={goToPage}
								showInfo={true}
								itemLabel="khuyến mãi"
							/>
						)}
					</>
				)}

				{/* Empty State */}
				{!isLoading && filteredPromotions.length === 0 && (
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
