import apiService from "@/lib/api";
import type { Purchase } from "@/types";
import type { PurchaseFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const purchaseService = {
	/**
	 * Fetch purchases with server-side filtering and pagination
	 */
	async getPurchases(
		filters: PurchaseFilters,
	): Promise<ApiResponse<Purchase>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<Purchase>>(
			`/purchases?${params.toString()}`,
		);
	},

	async getPurchaseById(id: string): Promise<Purchase> {
		return apiService.get<Purchase>(`/purchases/${id}`);
	},

	async createPurchase(data: Omit<Purchase, "id">): Promise<Purchase> {
		return apiService.post<Purchase>("/purchases", data);
	},

	async updatePurchase(
		id: string,
		data: Partial<Purchase>,
	): Promise<Purchase> {
		return apiService.put<Purchase>(`/purchases/${id}`, data);
	},

	async deletePurchase(id: string): Promise<void> {
		return apiService.delete(`/purchases/${id}`);
	},
};
