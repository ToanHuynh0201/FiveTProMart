import { useState, useEffect, useCallback } from "react";
import {
	Box,
	Text,
	SimpleGrid,
	Flex,
	Spinner,
	useDisclosure,
	useToast,
} from "@chakra-ui/react";
import { FiPercent, FiClock, FiXCircle } from "react-icons/fi";
import MainLayout from "@/components/layout/MainLayout";
import {
	PromotionSearchBar,
	PromotionFilterBar,
	PromotionTable,
	StatsCard,
	AddPromotionModal,
	PromotionViewEditModal,
} from "@/components/promotion";
import { Pagination } from "@/components/common";
import { usePagination, useFilters } from "@/hooks";
import type {
	Promotion,
	PromotionStats,
	CreatePromotionRequest,
} from "@/types/promotion";
import type { PromotionFilters } from "@/types/filters";
import { promotionService } from "@/services/promotionService";

const ITEMS_PER_PAGE = 10;

const PromotionPage = () => {
	const toast = useToast();

	// State for data from API
	const [promotions, setPromotions] = useState<Promotion[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [stats, setStats] = useState<PromotionStats | null>(null);

	// Modal states
	const [selectedPromotionId, setSelectedPromotionId] = useState<
		string | null
	>(null);
	const [modalMode, setModalMode] = useState<"view" | "edit">("view");

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

	// useFilters for filtering (without page)
	const { filters, debouncedFilters, handleFilterChange, resetFilters } =
		useFilters<PromotionFilters>({
			size: ITEMS_PER_PAGE,
			search: "",
			type: "all",
			status: "all",
			sortBy: "startDate",
			order: "desc",
		});

	// usePagination for pagination metadata
	const { currentPage, total, pagination, goToPage, setTotal } =
		usePagination({
			initialPage: 1,
			pageSize: ITEMS_PER_PAGE,
			initialTotal: 0,
		});

	// Fetch promotions
	const fetchPromotions = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await promotionService.getPromotions({
				page: currentPage - 1, // Convert to zero-based
				size: debouncedFilters.size,
				search: debouncedFilters.search,
				type: debouncedFilters.type,
				status: debouncedFilters.status,
				sortBy: debouncedFilters.sortBy,
				order: debouncedFilters.order,
			});
			if (result.success) {
				setPromotions(result.data || []);
				setTotal(result.pagination?.totalItems || 0);

				// Calculate stats from response (or could be separate API)
				if (result.data) {
					const activeCount = result.data.filter(
						(p: any) => p.status === "Active",
					).length;
					const upcomingCount = result.data.filter(
						(p: any) => p.status === "Upcoming",
					).length;
					const expiredCount = result.data.filter(
						(p: any) => p.status === "Expired",
					).length;
					const cancelledCount = result.data.filter(
						(p: any) => p.status === "Cancelled",
					).length;

					setStats({
						totalPromotions: result.pagination?.totalItems || 0,
						activePromotions: activeCount,
						upcomingPromotions: upcomingCount,
						expiredPromotions: expiredCount,
						cancelledPromotions: cancelledCount,
					});
				}
			} else {
				toast({
					title: "Lỗi",
					description:
						result.error || "Không thể tải danh sách khuyến mãi",
					status: "error",
					duration: 3000,
				});
			}
		} catch (error) {
			console.error("Error fetching promotions:", error);
			toast({
				title: "Lỗi",
				description: "Có lỗi xảy ra khi tải danh sách khuyến mãi",
				status: "error",
				duration: 3000,
			});
		} finally {
			setIsLoading(false);
		}
	}, [currentPage, debouncedFilters, setTotal, toast]);

	// Fetch data when filters or page change
	useEffect(() => {
		fetchPromotions();
	}, [fetchPromotions]);

	// Event handlers
	const handleSearch = (value: string) => {
		handleFilterChange("search", value);
		goToPage(1);
	};

	const handleTypeFilter = (type: string) => {
		handleFilterChange("type", type);
		goToPage(1);
	};

	const handleStatusFilter = (status: string) => {
		handleFilterChange("status", status);
		goToPage(1);
	};

	const handleResetFilters = () => {
		resetFilters();
		goToPage(1);
	};

	const handleAddPromotion = async (data: CreatePromotionRequest) => {
		const result = await promotionService.createPromotion(data);

		if (result.success) {
			toast({
				title: "Thành công",
				description: "Thêm khuyến mãi thành công",
				status: "success",
				duration: 3000,
			});
			onAddModalClose();
			fetchPromotions();
		} else {
			toast({
				title: "Lỗi",
				description: result.error || "Không thể thêm khuyến mãi",
				status: "error",
				duration: 3000,
			});
		}
	};

	const handleViewDetail = (id: string) => {
		setSelectedPromotionId(id);
		setModalMode("view");
		onViewEditModalOpen();
	};

	const handleEdit = (id: string) => {
		setSelectedPromotionId(id);
		setModalMode("edit");
		onViewEditModalOpen();
	};

	const handleCancel = async (id: string) => {
		if (window.confirm("Bạn có chắc chắn muốn hủy khuyến mãi này?")) {
			const result = await promotionService.cancelPromotion(id);

			if (result.success) {
				toast({
					title: "Thành công",
					description: "Đã hủy khuyến mãi",
					status: "success",
					duration: 3000,
				});
				fetchPromotions();
			} else {
				toast({
					title: "Lỗi",
					description: result.error || "Không thể hủy khuyến mãi",
					status: "error",
					duration: 3000,
				});
			}
		}
	};

	// Stats card click handlers
	const handleStatClick = (status: string) => {
		if (filters.status === status) {
			handleFilterChange("status", "all");
		} else {
			handleFilterChange("status", status);
		}
		goToPage(1);
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
							onClick={() => handleStatClick("Active")}
							isActive={filters.status === "Active"}
						/>
						<StatsCard
							title="Sắp diễn ra"
							value={stats.upcomingPromotions}
							icon={FiClock}
							bgGradient="linear(135deg, #ED8936 0%, #DD6B20 100%)"
							onClick={() => handleStatClick("Upcoming")}
							isActive={filters.status === "Upcoming"}
						/>
						<StatsCard
							title="Đã hủy"
							value={stats.cancelledPromotions || 0}
							icon={FiXCircle}
							bgGradient="linear(135deg, #F56565 0%, #E53E3E 100%)"
							onClick={() => handleStatClick("Cancelled")}
							isActive={filters.status === "Cancelled"}
						/>
					</SimpleGrid>
				)}

				{/* Search Bar */}
				<PromotionSearchBar
					searchQuery={filters.search || ""}
					onSearchChange={handleSearch}
					onAddPromotion={onAddModalOpen}
				/>

				{/* Filter Bar */}
				<PromotionFilterBar
					filters={{
						searchQuery: filters.search || "",
						type: filters.type || "all",
						status: filters.status || "all",
					}}
					onFiltersChange={(newFilters) => {
						if (newFilters.type !== filters.type) {
							handleTypeFilter(newFilters.type);
						}
						if (newFilters.status !== filters.status) {
							handleStatusFilter(newFilters.status);
						}
					}}
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
									Danh sách khuyến mãi ({total})
								</Text>
							</Flex>

							<PromotionTable
								promotions={promotions}
								onViewDetail={handleViewDetail}
								onEdit={handleEdit}
								onCancel={handleCancel}
								searchQuery={filters.search || ""}
							/>
						</Box>

						{/* Pagination */}
						{promotions.length > 0 && (
							<Pagination
								currentPage={currentPage}
								totalPages={pagination.totalPages}
								totalItems={total}
								pageSize={ITEMS_PER_PAGE}
								onPageChange={goToPage}
								showInfo={true}
								itemLabel="khuyến mãi"
							/>
						)}
					</>
				)}

				{/* Empty State */}
				{!isLoading && promotions.length === 0 && (
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
							{filters.search ||
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

			{/* View/Edit Promotion Modal */}
			<PromotionViewEditModal
				isOpen={isViewEditModalOpen}
				onClose={onViewEditModalClose}
				promotionId={selectedPromotionId}
				mode={modalMode}
				onSuccess={fetchPromotions}
			/>
		</MainLayout>
	);
};

export default PromotionPage;
