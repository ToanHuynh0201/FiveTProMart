import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type {
	Promotion,
	PromotionDetail,
	CreatePromotionRequest,
	CreatePromotionResponse,
	CancelPromotionResponse,
} from "@/types/promotion";

// ============ MOCK DATA FOR TESTING ============
const USE_MOCK_DATA = true; // Set to false to use real API

const MOCK_PROMOTIONS: Promotion[] = [
	{
		promotionId: "PROMO-001",
		name: "Giảm giá mùa hè 2024",
		promotionType: "Discount",
		discountPercent: 20,
		products: [
			{ productId: "prod-001", productName: "Sữa tươi Vinamilk 1L" },
			{ productId: "prod-002", productName: "Nước ngọt Coca Cola 330ml" },
			{ productId: "prod-003", productName: "Nước suối Aquafina 500ml" },
		],
		startDate: "01-01-2024",
		endDate: "31-03-2024",
		status: "Active",
	},
	{
		promotionId: "PROMO-002",
		name: "Mua 2 tặng 1 - Mì gói",
		promotionType: "Buy X Get Y",
		buyQuantity: 2,
		getQuantity: 1,
		products: [
			{ productId: "prod-004", productName: "Mì gói Hảo Hảo tôm chua cay" },
			{ productId: "prod-005", productName: "Mì gói Omachi xốt bò hầm" },
		],
		startDate: "15-01-2024",
		endDate: "28-02-2024",
		status: "Active",
	},
	{
		promotionId: "PROMO-003",
		name: "Flash Sale cuối tuần",
		promotionType: "Discount",
		discountPercent: 30,
		products: [
			{ productId: "prod-006", productName: "Bánh Oreo 137g" },
			{ productId: "prod-007", productName: "Snack Poca khoai tây" },
		],
		startDate: "01-02-2024",
		endDate: "15-03-2024",
		status: "Upcoming",
	},
	{
		promotionId: "PROMO-004",
		name: "Khuyến mãi Tết 2024",
		promotionType: "Discount",
		discountPercent: 15,
		products: [
			{ productId: "prod-008", productName: "Bánh chưng truyền thống" },
			{ productId: "prod-009", productName: "Mứt dừa non" },
			{ productId: "prod-010", productName: "Hạt dưa đỏ" },
		],
		startDate: "01-12-2023",
		endDate: "15-01-2024",
		status: "Expired",
	},
	{
		promotionId: "PROMO-005",
		name: "Combo tiết kiệm",
		promotionType: "Buy X Get Y",
		buyQuantity: 3,
		getQuantity: 1,
		products: [
			{ productId: "prod-011", productName: "Sữa chua Vinamilk" },
		],
		startDate: "10-01-2024",
		endDate: "20-01-2024",
		status: "Cancelled",
	},
	{
		promotionId: "PROMO-006",
		name: "Giảm giá nước giải khát",
		promotionType: "Discount",
		discountPercent: 10,
		products: [
			{ productId: "prod-012", productName: "Pepsi 330ml" },
			{ productId: "prod-013", productName: "7Up 330ml" },
			{ productId: "prod-014", productName: "Mirinda cam 330ml" },
			{ productId: "prod-015", productName: "Sting dâu 330ml" },
		],
		startDate: "20-01-2024",
		endDate: "20-02-2024",
		status: "Active",
	},
	{
		promotionId: "PROMO-007",
		name: "Ưu đãi sữa tươi",
		promotionType: "Discount",
		discountPercent: 25,
		products: [
			{ productId: "prod-016", productName: "Sữa TH True Milk 1L" },
			{ productId: "prod-017", productName: "Sữa Mộc Châu 1L" },
		],
		startDate: "01-03-2024",
		endDate: "31-03-2024",
		status: "Upcoming",
	},
	{
		promotionId: "PROMO-008",
		name: "Mua 1 tặng 1 - Bánh ngọt",
		promotionType: "Buy X Get Y",
		buyQuantity: 1,
		getQuantity: 1,
		products: [
			{ productId: "prod-018", productName: "Bánh Chocopie 12 cái" },
		],
		startDate: "01-11-2023",
		endDate: "30-11-2023",
		status: "Expired",
	},
];

const MOCK_PROMOTION_DETAILS: Record<string, PromotionDetail> = {
	"PROMO-001": {
		promotionId: "PROMO-001",
		promotionName: "Giảm giá mùa hè 2024",
		promotionDescription: "Chương trình giảm giá dành cho các sản phẩm nước giải khát trong mùa hè. Áp dụng cho tất cả khách hàng.",
		promotionType: "Discount",
		discountPercent: 20,
		buyQuantity: null,
		getQuantity: null,
		status: "Active",
		startDate: "01-01-2024",
		endDate: "31-03-2024",
		products: [
			{
				productId: "prod-001",
				productName: "Sữa tươi Vinamilk 1L",
				unitOfMeasure: "Hộp",
				sellingPrice: 32000,
				promotionPrice: 25600,
			},
			{
				productId: "prod-002",
				productName: "Nước ngọt Coca Cola 330ml",
				unitOfMeasure: "Lon",
				sellingPrice: 12000,
				promotionPrice: 9600,
			},
			{
				productId: "prod-003",
				productName: "Nước suối Aquafina 500ml",
				unitOfMeasure: "Chai",
				sellingPrice: 8000,
				promotionPrice: 6400,
			},
		],
	},
	"PROMO-002": {
		promotionId: "PROMO-002",
		promotionName: "Mua 2 tặng 1 - Mì gói",
		promotionDescription: "Mua 2 gói mì bất kỳ được tặng thêm 1 gói cùng loại.",
		promotionType: "Buy X Get Y",
		discountPercent: null,
		buyQuantity: 2,
		getQuantity: 1,
		status: "Active",
		startDate: "15-01-2024",
		endDate: "28-02-2024",
		products: [
			{
				productId: "prod-004",
				productName: "Mì gói Hảo Hảo tôm chua cay",
				unitOfMeasure: "Gói",
				sellingPrice: 5000,
				promotionPrice: null,
			},
			{
				productId: "prod-005",
				productName: "Mì gói Omachi xốt bò hầm",
				unitOfMeasure: "Gói",
				sellingPrice: 8000,
				promotionPrice: null,
			},
		],
	},
	"PROMO-003": {
		promotionId: "PROMO-003",
		promotionName: "Flash Sale cuối tuần",
		promotionDescription: "Giảm giá sốc 30% cho các loại bánh snack vào cuối tuần.",
		promotionType: "Discount",
		discountPercent: 30,
		buyQuantity: null,
		getQuantity: null,
		status: "Upcoming",
		startDate: "01-02-2024",
		endDate: "15-03-2024",
		products: [
			{
				productId: "prod-006",
				productName: "Bánh Oreo 137g",
				unitOfMeasure: "Gói",
				sellingPrice: 25000,
				promotionPrice: 17500,
			},
			{
				productId: "prod-007",
				productName: "Snack Poca khoai tây",
				unitOfMeasure: "Gói",
				sellingPrice: 15000,
				promotionPrice: 10500,
			},
		],
	},
	"PROMO-004": {
		promotionId: "PROMO-004",
		promotionName: "Khuyến mãi Tết 2024",
		promotionDescription: "Chương trình khuyến mãi đặc biệt dịp Tết Nguyên Đán.",
		promotionType: "Discount",
		discountPercent: 15,
		buyQuantity: null,
		getQuantity: null,
		status: "Expired",
		startDate: "01-12-2023",
		endDate: "15-01-2024",
		products: [
			{
				productId: "prod-008",
				productName: "Bánh chưng truyền thống",
				unitOfMeasure: "Cái",
				sellingPrice: 80000,
				promotionPrice: 68000,
			},
			{
				productId: "prod-009",
				productName: "Mứt dừa non",
				unitOfMeasure: "Hộp",
				sellingPrice: 45000,
				promotionPrice: 38250,
			},
			{
				productId: "prod-010",
				productName: "Hạt dưa đỏ",
				unitOfMeasure: "Gói",
				sellingPrice: 55000,
				promotionPrice: 46750,
			},
		],
	},
	"PROMO-005": {
		promotionId: "PROMO-005",
		promotionName: "Combo tiết kiệm",
		promotionDescription: "Mua 3 hộp sữa chua tặng 1 hộp.",
		promotionType: "Buy X Get Y",
		discountPercent: null,
		buyQuantity: 3,
		getQuantity: 1,
		status: "Cancelled",
		startDate: "10-01-2024",
		endDate: "20-01-2024",
		products: [
			{
				productId: "prod-011",
				productName: "Sữa chua Vinamilk",
				unitOfMeasure: "Hộp",
				sellingPrice: 7000,
				promotionPrice: null,
			},
		],
	},
	"PROMO-006": {
		promotionId: "PROMO-006",
		promotionName: "Giảm giá nước giải khát",
		promotionDescription: "Ưu đãi 10% cho tất cả các loại nước ngọt có gas.",
		promotionType: "Discount",
		discountPercent: 10,
		buyQuantity: null,
		getQuantity: null,
		status: "Active",
		startDate: "20-01-2024",
		endDate: "20-02-2024",
		products: [
			{
				productId: "prod-012",
				productName: "Pepsi 330ml",
				unitOfMeasure: "Lon",
				sellingPrice: 10000,
				promotionPrice: 9000,
			},
			{
				productId: "prod-013",
				productName: "7Up 330ml",
				unitOfMeasure: "Lon",
				sellingPrice: 10000,
				promotionPrice: 9000,
			},
			{
				productId: "prod-014",
				productName: "Mirinda cam 330ml",
				unitOfMeasure: "Lon",
				sellingPrice: 10000,
				promotionPrice: 9000,
			},
			{
				productId: "prod-015",
				productName: "Sting dâu 330ml",
				unitOfMeasure: "Lon",
				sellingPrice: 12000,
				promotionPrice: 10800,
			},
		],
	},
	"PROMO-007": {
		promotionId: "PROMO-007",
		promotionName: "Ưu đãi sữa tươi",
		promotionDescription: "Giảm 25% cho các sản phẩm sữa tươi cao cấp.",
		promotionType: "Discount",
		discountPercent: 25,
		buyQuantity: null,
		getQuantity: null,
		status: "Upcoming",
		startDate: "01-03-2024",
		endDate: "31-03-2024",
		products: [
			{
				productId: "prod-016",
				productName: "Sữa TH True Milk 1L",
				unitOfMeasure: "Hộp",
				sellingPrice: 35000,
				promotionPrice: 26250,
			},
			{
				productId: "prod-017",
				productName: "Sữa Mộc Châu 1L",
				unitOfMeasure: "Hộp",
				sellingPrice: 30000,
				promotionPrice: 22500,
			},
		],
	},
	"PROMO-008": {
		promotionId: "PROMO-008",
		promotionName: "Mua 1 tặng 1 - Bánh ngọt",
		promotionDescription: "Mua 1 hộp bánh Chocopie tặng ngay 1 hộp.",
		promotionType: "Buy X Get Y",
		discountPercent: null,
		buyQuantity: 1,
		getQuantity: 1,
		status: "Expired",
		startDate: "01-11-2023",
		endDate: "30-11-2023",
		products: [
			{
				productId: "prod-018",
				productName: "Bánh Chocopie 12 cái",
				unitOfMeasure: "Hộp",
				sellingPrice: 55000,
				promotionPrice: null,
			},
		],
	},
};
// ============ END MOCK DATA ============

// API Query Parameters theo spec
export interface PromotionQueryParams {
	search?: string; // Filter promotionId, promotionName, productName
	type?: string; // "Discount" | "Buy X Get Y"
	status?: string; // "Active" | "Expired" | "Upcoming" | "Cancelled"
	startDate?: string; // dd-MM-yyyy
	endDate?: string; // dd-MM-yyyy
	sortBy?: "startDate" | "endDate";
	order?: "asc" | "desc";
	page?: number; // Zero-based
	size?: number;
}

class PromotionService {
	/**
	 * GET /api/v1/promotions
	 * Fetch promotions with server-side filtering and pagination
	 */
	getPromotions = withErrorHandling(
		async (params?: PromotionQueryParams) => {
			if (USE_MOCK_DATA) {
				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 300));

				let filteredData = [...MOCK_PROMOTIONS];

				// Filter by search
				if (params?.search) {
					const searchLower = params.search.toLowerCase();
					filteredData = filteredData.filter(
						(p) =>
							p.promotionId.toLowerCase().includes(searchLower) ||
							p.name.toLowerCase().includes(searchLower) ||
							p.products.some((prod) =>
								prod.productName.toLowerCase().includes(searchLower)
							)
					);
				}

				// Filter by type
				if (params?.type && params.type !== "all") {
					filteredData = filteredData.filter(
						(p) => p.promotionType === params.type
					);
				}

				// Filter by status
				if (params?.status && params.status !== "all") {
					filteredData = filteredData.filter(
						(p) => p.status === params.status
					);
				}

				// Sort
				if (params?.sortBy) {
					filteredData.sort((a, b) => {
						const dateA = new Date(a[params.sortBy!].split("-").reverse().join("-"));
						const dateB = new Date(b[params.sortBy!].split("-").reverse().join("-"));
						return params.order === "asc"
							? dateA.getTime() - dateB.getTime()
							: dateB.getTime() - dateA.getTime();
					});
				}

				// Pagination
				const page = params?.page || 0;
				const size = params?.size || 10;
				const totalItems = filteredData.length;
				const totalPages = Math.ceil(totalItems / size);
				const paginatedData = filteredData.slice(
					page * size,
					(page + 1) * size
				);

				// Return mock response matching API format
				return {
					data: {
						data: paginatedData,
						pagination: {
							totalItems,
							totalPages,
							page,
							size,
						},
					},
				};
			}

			const queryParams = new URLSearchParams();

			if (params?.search) queryParams.append("search", params.search);
			if (params?.type && params.type !== "all")
				queryParams.append("type", params.type);
			if (params?.status && params.status !== "all")
				queryParams.append("status", params.status);
			if (params?.startDate)
				queryParams.append("startDate", params.startDate);
			if (params?.endDate) queryParams.append("endDate", params.endDate);
			if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
			if (params?.order) queryParams.append("order", params.order);
			if (params?.page !== undefined)
				queryParams.append("page", params.page.toString());
			if (params?.size) queryParams.append("size", params.size.toString());

			const queryString = queryParams.toString();
			const url = queryString
				? `/promotions?${queryString}`
				: "/promotions";

			return await apiService.get(url);
		},
	);

	/**
	 * GET /api/v1/promotions/{id}
	 * Get promotion detail by ID
	 */
	getPromotionById = withErrorHandling(async (id: string) => {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 200));

			const detail = MOCK_PROMOTION_DETAILS[id];
			if (detail) {
				return {
					data: {
						data: detail,
					},
				};
			}
			throw new Error("Promotion not found");
		}

		return await apiService.get(`/promotions/${id}`);
	});

	/**
	 * POST /api/v1/promotions
	 * Create new promotion
	 */
	createPromotion = withErrorHandling(
		async (data: CreatePromotionRequest) => {
			if (USE_MOCK_DATA) {
				await new Promise((resolve) => setTimeout(resolve, 500));
				console.log("Mock: Create promotion", data);

				// Generate new ID
				const newId = `PROMO-${String(MOCK_PROMOTIONS.length + 1).padStart(3, "0")}`;

				return {
					data: {
						data: {
							promotionId: newId,
							promotionName: data.promotionName,
							promotionDescription: data.promotionDescription || "",
							status: "Upcoming",
							startDate: data.startDate,
							endDate: data.endDate,
						},
					},
				};
			}

			return await apiService.post("/promotions", data);
		},
	);

	/**
	 * PUT /api/v1/promotions/{id}/cancel
	 * Cancel a promotion
	 */
	cancelPromotion = withErrorHandling(async (id: string) => {
		if (USE_MOCK_DATA) {
			await new Promise((resolve) => setTimeout(resolve, 300));
			console.log("Mock: Cancel promotion", id);

			// Update mock data
			const promotion = MOCK_PROMOTIONS.find((p) => p.promotionId === id);
			if (promotion) {
				promotion.status = "Cancelled";
			}

			return {
				data: {
					data: {
						promotionId: id,
						status: "Cancelled",
					},
				},
			};
		}

		return await apiService.put(`/promotions/${id}/cancel`, {});
	});
}

export const promotionService = new PromotionService();
