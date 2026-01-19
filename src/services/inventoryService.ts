import apiService from "@/lib/api";
import type { InventoryProduct, InventoryCategory, InventoryStats } from "@/types";
import type { InventoryFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

/**
 * Category type from API
 */
interface CategoryApiResponse {
	categoryId: string;
	categoryName: string;
}

/**
 * Disposal request matching FRONTEND_API_REQUIREMENTS.md §4
 */
interface DisposeRequest {
	quantity: number;
	reason: "expired" | "damaged" | "lost" | "other";
	notes?: string;
	staffId: string;
}

/**
 * Disposal response matching FRONTEND_API_REQUIREMENTS.md §4
 */
interface DisposeResponse {
	disposalId: string;
	lotId: string;
	productId: string;
	productName: string;
	quantityDisposed: number;
	remainingLotQuantity: number;
	productTotalStock: number;
	disposedAt: string;
	disposedBy: string;
	reason: string;
	notes?: string;
}

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

	// ===================================================================
	// Categories - GET /api/product-categories (ProductCategoryAPI.md)
	// ===================================================================
	/**
	 * Fetch all product categories
	 */
	async getCategories(): Promise<InventoryCategory[]> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: CategoryApiResponse[];
		}>("/product-categories");

		// Map API response to frontend type
		return response.data.map((cat) => ({
			id: cat.categoryId,
			name: cat.categoryName,
			description: undefined,
			productCount: 0, // API doesn't return this, would need separate query
		}));
	},

	// ===================================================================
	// Stats - GET /api/products/stats (FRONTEND_API_REQUIREMENTS.md §5)
	// ===================================================================
	/**
	 * Get product statistics for dashboard.
	 * Fails gracefully if backend endpoint doesn't exist yet.
	 */
	async getStats(): Promise<InventoryStats> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: {
				totalProducts: number;
				activeProducts: number;
				inactiveProducts: number;
				totalInventoryValue: number;
				lowStockCount: number;
				outOfStockCount: number;
				expiringSoonCount: number;
				expiredCount: number;
			};
		}>("/products/stats");

		return {
			totalProducts: response.data.totalProducts,
			totalValue: response.data.totalInventoryValue,
			lowStockProducts: response.data.lowStockCount,
			outOfStockProducts: response.data.outOfStockCount,
			activeProducts: response.data.activeProducts,
			expiredBatches: response.data.expiredCount,
			expiringSoonBatches: response.data.expiringSoonCount,
		};
	},

	// ===================================================================
	// Dispose - POST /api/stock_inventories/{lotId}/dispose
	// (FRONTEND_API_REQUIREMENTS.md §4)
	// ===================================================================
	/**
	 * Dispose a lot of stock (expired/damaged).
	 * Fails gracefully if backend endpoint doesn't exist yet.
	 *
	 * @param lotId - The lot to dispose
	 * @param quantity - Quantity to dispose
	 * @param reason - Disposal reason
	 * @param staffId - Staff performing disposal
	 * @param notes - Optional notes
	 */
	async disposeLot(
		lotId: string,
		quantity: number,
		reason: DisposeRequest["reason"],
		staffId: string,
		notes?: string,
	): Promise<DisposeResponse> {
		const response = await apiService.post<{
			success: boolean;
			message: string;
			data: DisposeResponse;
		}>(`/stock_inventories/${lotId}/dispose`, {
			quantity,
			reason,
			notes,
			staffId,
		} as DisposeRequest);

		return response.data;
	},

	// ===================================================================
	// Update Lot - PUT /api/v1/stock_inventories/{lot_id}
	// (StockInventoryAPI.md §5.4)
	// ===================================================================
	/**
	 * Update a stock inventory lot (quantity and status)
	 *
	 * @param lotId - The lot to update
	 * @param stockQuantity - New stock quantity
	 * @param status - New status
	 */
	async updateLot(
		lotId: string,
		stockQuantity: number,
		status: string,
	): Promise<{ lotId: string; stockQuantity: number; status: string }> {
		const response = await apiService.put<{
			success: boolean;
			message: string;
			data: { lotId: string; stockQuantity: number; status: string };
		}>(`/stock_inventories/${lotId}`, {
			stockQuantity,
			status,
		});

		return response.data;
	},
};
