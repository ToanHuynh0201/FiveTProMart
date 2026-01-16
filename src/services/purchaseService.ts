import apiService from "@/lib/api";
import type {
	CreateDraftRequest,
	ConfirmReceiptRequest,
	CancelOrderRequest,
} from "@/types/purchase";
import { withErrorHandling } from "@/utils/error";

const BASE_URL = "/purchase_orders";

class PurchaseService {
	/**
	 * Get purchase orders list with filtering and pagination
	 * GET /api/v1/purchase_orders
	 */
	getPurchaseOrders = withErrorHandling(
		async (filters?: {
			search?: string;
			status?: string;
			startDate?: string;
			endDate?: string;
			supplierId?: string;
			page?: number;
			size?: number;
			sortBy?: string;
			order?: string;
		}) => {
			const params = new URLSearchParams();

			if (filters?.search) params.append("search", filters.search);
			if (filters?.status && filters.status !== "all")
				params.append("status", filters.status);
			if (filters?.startDate)
				params.append("startDate", filters.startDate);
			if (filters?.endDate) params.append("endDate", filters.endDate);
			if (filters?.supplierId)
				params.append("supplierId", filters.supplierId);
			if (filters?.page !== undefined)
				params.append("page", filters.page.toString());
			if (filters?.size) params.append("size", filters.size.toString());
			if (filters?.sortBy) params.append("sortBy", filters.sortBy);
			if (filters?.order) params.append("order", filters.order);

			const queryString = params.toString();
			const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;

			return await apiService.get(url);
		},
	);

	/**
	 * Get purchase order detail
	 * GET /api/v1/purchase_orders/{id}
	 */
	getPurchaseOrderById = withErrorHandling(async (id: string) => {
		return await apiService.get(`${BASE_URL}/${id}`);
	});

	/**
	 * Create draft purchase order
	 * POST /api/v1/purchase_orders
	 */
	createDraftPurchase = withErrorHandling(
		async (data: CreateDraftRequest) => {
			return await apiService.post(BASE_URL, data);
		},
	);

	/**
	 * Confirm purchase order and generate lots
	 * POST /api/v1/purchase_orders/{id}/confirm
	 */
	confirmPurchaseOrder = withErrorHandling(
		async (id: string, data: ConfirmReceiptRequest) => {
			return await apiService.post(`${BASE_URL}/${id}/confirm`, data);
		},
	);

	/**
	 * Cancel purchase order
	 * POST /api/v1/purchase_orders/{id}/cancel
	 */
	cancelPurchaseOrder = withErrorHandling(
		async (id: string, data: CancelOrderRequest) => {
			return await apiService.post(`${BASE_URL}/${id}/cancel`, data);
		},
	);

	/**
	 * Get labels for reprint
	 * GET /api/v1/purchase_orders/{id}/labels
	 */
	getLabels = withErrorHandling(async (id: string) => {
		return await apiService.get(`${BASE_URL}/${id}/labels`);
	});
}

export const purchaseService = new PurchaseService();
