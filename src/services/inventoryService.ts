import apiService from "@/lib/api";
import type { InventoryProduct, InventoryCategory, InventoryStats } from "@/types";
import type { ProductBatch } from "@/types/inventory";
import type { InventoryFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

/**
 * Request type for creating/updating products
 * Matches backend ProductRequest.java exactly
 */
interface ProductRequest {
	categoryId: string;
	productName: string;
	unitOfMeasure: string;
	sellingPrice: number;
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
	 * Returns InventoryProduct[] matching backend ProductResponse.java exactly
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
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: InventoryProduct;
		}>(`/products/${id}`);
		return response.data;
	},

	async createProduct(data: ProductRequest): Promise<InventoryProduct> {
		const response = await apiService.post<{
			success: boolean;
			message: string;
			data: InventoryProduct;
		}>("/products", data);
		return response.data;
	},

	async updateProduct(
		id: string,
		data: Partial<ProductRequest>,
	): Promise<InventoryProduct> {
		const response = await apiService.put<{
			success: boolean;
			message: string;
			data: InventoryProduct;
		}>(`/products/${id}`, data);
		return response.data;
	},

	async deleteProduct(id: string): Promise<void> {
		return apiService.delete(`/products/${id}`);
	},

	// ===================================================================
	// Categories - GET /api/product-categories (ProductCategoryAPI.md)
	// ===================================================================
	/**
	 * Fetch all product categories
	 * Returns InventoryCategory[] matching backend CategoryResponse.java exactly
	 */
	async getCategories(): Promise<InventoryCategory[]> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: InventoryCategory[];
		}>("/product-categories");
		return response.data;
	},

	// ===================================================================
	// Stats - GET /api/products/stats (FRONTEND_API_REQUIREMENTS.md §5)
	// ===================================================================
	/**
	 * Get product statistics for dashboard.
	 * Returns InventoryStats matching backend ProductStatsResponse.java exactly
	 */
	async getStats(): Promise<InventoryStats> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: InventoryStats;
		}>("/products/stats");
		return response.data;
	},

	// ===================================================================
	// Batches/Lots - GET /api/stock_inventories?productId={id}
	// (StockInventoryAPI.md §5.1)
	// ===================================================================
	/**
	 * Fetch stock inventory batches for a specific product.
	 * Returns ProductBatch[] matching backend StockInventoryResponse.java exactly
	 */
	async getBatchesByProductId(productId: string): Promise<ProductBatch[]> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: ProductBatch[];
		}>(`/stock_inventories?productId=${encodeURIComponent(productId)}`);
		return response.data;
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
