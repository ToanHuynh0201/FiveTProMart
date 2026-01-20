import apiService from "@/lib/api";
import type { InventoryProduct, InventoryStats } from "@/types";
import type { InventoryFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

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

/**
 * Create product DTO matching product-api-spec.md §3.3
 * Note: categoryId is string (matches CategoryDTO.categoryId)
 */
export interface CreateProductDTO {
	productName: string;
	categoryId: string;
	unitOfMeasure: string;
	sellingPrice: number;
}

/**
 * Category DTO matching category-api-spec.md
 */
export interface CategoryDTO {
	categoryId: string;
	categoryName: string;
}

/**
 * Product DTO from API (product-api-spec.md §3.1)
 * Note: API returns categoryId (UUID string), not categoryName
 */
interface ProductApiResponse {
	productId: string;
	productName: string;
	categoryId: string;
	unitOfMeasure: string;
	sellingPrice: number;
	totalStockQuantity: number;
}

/**
 * Create/Update category request
 */
export interface CreateCategoryDTO {
	categoryName: string;
}

export interface UpdateCategoryDTO {
	categoryName: string;
}

export const inventoryService = {
	/**
	 * Fetch products with server-side filtering and pagination
	 */
	async getProducts(
		filters: InventoryFilters,
	): Promise<ApiResponse<InventoryProduct>> {
		const params = buildQueryParams(filters);
		const response = await apiService.get<ApiResponse<ProductApiResponse>>(
			`/products?${params.toString()}`,
		);
		console.log(response);

		// Fetch categories to create lookup map
		const categoriesResponse = await this.getCategories();
		const categoryMap = new Map<string, string>();
		categoriesResponse.data.forEach((cat) => {
			categoryMap.set(cat.categoryId, cat.categoryName);
		});

		// Map API response to frontend type with category names
		const mappedData: InventoryProduct[] = response.data.map((product) => ({
			id: product.productId,
			code: product.productId, // Use productId as code
			name: product.productName,
			category: categoryMap.get(product.categoryId) || product.categoryId,
			unit: product.unitOfMeasure,
			price: product.sellingPrice,
			costPrice: 0, // API doesn't return this
			stock: product.totalStockQuantity,
			minStock: 0, // API doesn't return this
			maxStock: 0, // API doesn't return this
			status: product.totalStockQuantity > 0 ? "active" : "out-of-stock" as const,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		return {
			...response,
			data: mappedData,
		};
	},

	async getProductById(id: string): Promise<InventoryProduct> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: ProductApiResponse;
		}>(`/products/${id}`);

		// Fetch category name using categoryId
		const product = response.data;
		let categoryName = product.categoryId;
		try {
			const categoryResponse = await this.getCategoryById(product.categoryId);
			categoryName = categoryResponse.data.categoryName;
		} catch (error) {
			console.warn('Failed to fetch category name, using categoryId instead');
		}

		return {
			id: product.productId,
			code: product.productId,
			name: product.productName,
			category: categoryName,
			unit: product.unitOfMeasure,
			price: product.sellingPrice,
			costPrice: 0,
			stock: product.totalStockQuantity,
			minStock: 0,
			maxStock: 0,
			status: product.totalStockQuantity > 0 ? "active" : "out-of-stock",
			createdAt: new Date(),
			updatedAt: new Date(),
		};
	},

	async createProduct(
		data: CreateProductDTO,
	): Promise<{ success: boolean; message: string; data: any }> {
		return apiService.post<{
			success: boolean;
			message: string;
			data: any;
		}>("/products", data);
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
	// Categories - category-api-spec.md
	// ===================================================================
	/**
	 * Get all categories - GET /api/product-categories
	 */
	async getCategories(search?: string): Promise<{
		success: boolean;
		message: string;
		data: CategoryDTO[];
	}> {
		const params = search ? `?search=${encodeURIComponent(search)}` : "";
		return apiService.get<{
			success: boolean;
			message: string;
			data: CategoryDTO[];
		}>(`/product-categories${params}`);
	},

	/**
	 * Get category by ID - GET /api/product-categories/{id}
	 */
	async getCategoryById(id: string): Promise<{
		success: boolean;
		message: string;
		data: CategoryDTO;
	}> {
		return apiService.get<{
			success: boolean;
			message: string;
			data: CategoryDTO;
		}>(`/product-categories/${id}`);
	},

	/**
	 * Create new category - POST /api/product-categories
	 */
	async createCategory(data: CreateCategoryDTO): Promise<{
		success: boolean;
		message: string;
		data: CategoryDTO;
	}> {
		return apiService.post<{
			success: boolean;
			message: string;
			data: CategoryDTO;
		}>("/product-categories", data);
	},

	/**
	 * Update category - PUT /api/product-categories/{id}
	 */
	async updateCategory(
		id: string,
		data: UpdateCategoryDTO,
	): Promise<{
		success: boolean;
		message: string;
		data: CategoryDTO;
	}> {
		return apiService.put<{
			success: boolean;
			message: string;
			data: CategoryDTO;
		}>(`/product-categories/${id}`, data);
	},

	/**
	 * Delete category - DELETE /api/product-categories/{id}
	 */
	async deleteCategory(id: string): Promise<{
		success: boolean;
		message: string;
		data: null;
	}> {
		return apiService.delete<{
			success: boolean;
			message: string;
			data: null;
		}>(`/product-categories/${id}`);
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
