import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type {
	StockInventoryFilter,
	CreateStockInventoryRequest,
	UpdateStockInventoryRequest,
} from "@/types/stockInventory";

const BASE_URL = "/stock_inventories";

class StockInventoryService {
	/**
	 * Get stock inventories list with filtering
	 * GET /api/v1/stock_inventories
	 */
	getStockInventories = withErrorHandling(
		async (filters?: StockInventoryFilter) => {
			const params = new URLSearchParams();

			if (filters?.search) params.append("search", filters.search);
			if (filters?.productId)
				params.append("productId", filters.productId);
			if (filters?.status && filters.status !== "all")
				params.append("status", filters.status);
			if (filters?.sortBy) params.append("sortBy", filters.sortBy);
			if (filters?.order) params.append("order", filters.order);
			if (filters?.page !== undefined) params.append("page", filters.page.toString());
			if (filters?.size) params.append("size", filters.size.toString());

			const queryString = params.toString();
			const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

			return await apiService.get(url);
		},
	);

	/**
	 * Get stock inventory by ID
	 * GET /api/v1/stock_inventories/{id}
	 */
	getStockInventoryById = withErrorHandling(async (lotId: string) => {
		return await apiService.get(`${BASE_URL}/${lotId}`);
	});

	/**
	 * Create new stock inventory
	 * POST /api/v1/stock_inventories
	 */
	createStockInventory = withErrorHandling(
		async (data: CreateStockInventoryRequest) => {
			return await apiService.post(BASE_URL, data);
		},
	);

	/**
	 * Update stock inventory
	 * PUT /api/v1/stock_inventories/{lot_id}
	 */
	updateStockInventory = withErrorHandling(
		async (lotId: string, data: UpdateStockInventoryRequest) => {
			return await apiService.put(`${BASE_URL}/${lotId}`, data);
		},
	);
}

export const stockInventoryService = new StockInventoryService();
