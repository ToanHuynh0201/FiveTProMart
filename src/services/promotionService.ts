import apiService from "@/lib/api";
import type { Promotion } from "@/types";
import type { PromotionFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const promotionService = {
	/**
	 * Fetch promotions with server-side filtering and pagination
	 */
	async getPromotions(
		filters: PromotionFilters,
	): Promise<ApiResponse<Promotion>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<Promotion>>(
			`/promotions?${params.toString()}`,
		);
	},

	async getPromotionById(id: string): Promise<Promotion> {
		return apiService.get<Promotion>(`/promotions/${id}`);
	},

	async createPromotion(data: Omit<Promotion, "id">): Promise<Promotion> {
		return apiService.post<Promotion>("/promotions", data);
	},

	async updatePromotion(
		id: string,
		data: Partial<Promotion>,
	): Promise<Promotion> {
		return apiService.put<Promotion>(`/promotions/${id}`, data);
	},

	async deletePromotion(id: string): Promise<void> {
		return apiService.delete(`/promotions/${id}`);
	},
};
