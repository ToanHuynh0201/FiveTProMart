import apiService from "@/lib/api";
import type { InventoryProduct } from "@/types";
import type { InventoryFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const inventoryService = {
	/**
	 * Fetch products with server-side filtering and pagination
	 */
	async getProducts(
		filters: InventoryFilters,
	): Promise<ApiResponse<InventoryProduct>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<InventoryProduct>>(
			`/products?${params.toString()}`,
		);
	},

	async getProductById(id: string): Promise<InventoryProduct> {
		return apiService.get<InventoryProduct>(`/products/${id}`);
	},

	async createProduct(
		data: Omit<InventoryProduct, "id">,
	): Promise<InventoryProduct> {
		return apiService.post<InventoryProduct>("/products", data);
	},

	async updateProduct(
		id: string,
		data: Partial<InventoryProduct>,
	): Promise<InventoryProduct> {
		return apiService.put<InventoryProduct>(`/products/${id}`, data);
	},

	async deleteProduct(id: string): Promise<void> {
		return apiService.delete(`/products/${id}`);
	},
};
