import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type {
	CreatePromotionRequest,
	UpdatePromotionRequest,
} from "@/types/promotion";

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
	getPromotions = withErrorHandling(async (params?: PromotionQueryParams) => {
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
		const url = queryString ? `/promotions?${queryString}` : "/promotions";

		return await apiService.get(url);
	});

	/**
	 * GET /api/v1/promotions/{id}
	 * Get promotion detail by ID
	 */
	getPromotionById = withErrorHandling(async (id: string) => {
		return await apiService.get(`/promotions/${id}`);
	});

	/**
	 * POST /api/v1/promotions
	 * Create new promotion
	 */
	createPromotion = withErrorHandling(
		async (data: CreatePromotionRequest) => {
			return await apiService.post("/promotions", data);
		},
	);

	/**
	 * PUT /api/v1/promotions/{id}
	 * Update promotion (only for Upcoming promotions)
	 */
	updatePromotion = withErrorHandling(
		async (id: string, data: UpdatePromotionRequest) => {
			return await apiService.put(`/promotions/${id}`, data);
		},
	);

	/**
	 * PUT /api/v1/promotions/{id}/cancel
	 * Cancel a promotion (only for Active or Upcoming promotions)
	 */
	cancelPromotion = withErrorHandling(async (id: string) => {
		return await apiService.put(`/promotions/${id}/cancel`, {});
	});
}

export const promotionService = new PromotionService();
