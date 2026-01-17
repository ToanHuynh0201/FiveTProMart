/**
 * Sales Service - Order Processing API
 * Spec: 5TProMart_be/document/API_Spec/OrderAPI.md
 *
 * IMPORTANT: Backend uses lotId (not batchId) and productId (not id)
 * Frontend must track lotId internally but display merged products to user
 */

import apiService from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type {
	CheckProductRequest,
	CheckProductResponse,
	CreateOrderRequest,
	CreateOrderResponse,
	OrderListItem,
	OrderDetail,
	OrderFilters,
	CancelOrderRequest,
	CancelOrderResponse,
} from "@/types/sales";
import { buildQueryParams } from "@/utils/queryParams";

export const salesService = {
	// ===================================================================
	// 1.3 Check Product (Scan barcode)
	// POST /api/v1/orders/check-product
	// ===================================================================
	/**
	 * Check product by lot barcode scan
	 * @param lotId - The scanned barcode (which is the lotId)
	 * @param quantity - Quantity to check (default 1)
	 * @returns Product info with stock and pricing
	 */
	async checkProduct(
		lotId: string,
		quantity: number = 1,
	): Promise<CheckProductResponse> {
		const response = await apiService.post<{
			success: boolean;
			message: string;
			data: CheckProductResponse;
		}>("/orders/check-product", {
			lotId,
			quantity,
		} as CheckProductRequest);

		return response.data;
	},

	// ===================================================================
	// 1.4 Create Order (Checkout)
	// POST /api/v1/orders
	// ===================================================================
	/**
	 * Create a new order (checkout)
	 * @param request - Order details with items as lotId+quantity pairs
	 * @returns Created order with change calculation
	 */
	async createOrder(
		request: CreateOrderRequest,
	): Promise<CreateOrderResponse> {
		const response = await apiService.post<{
			success: boolean;
			message: string;
			data: CreateOrderResponse;
		}>("/orders", request);

		return response.data;
	},

	// ===================================================================
	// 1.1 Get Orders (History)
	// GET /api/v1/orders
	// ===================================================================
	/**
	 * Get order list with filters and pagination
	 */
	async getOrders(filters: OrderFilters): Promise<ApiResponse<OrderListItem>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<OrderListItem>>(
			`/orders?${params.toString()}`,
		);
	},

	// ===================================================================
	// 1.2 Get Order Detail
	// GET /api/v1/orders/{id}
	// ===================================================================
	/**
	 * Get detailed order by ID
	 */
	async getOrderById(orderId: string): Promise<OrderDetail> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: OrderDetail;
		}>(`/orders/${orderId}`);

		return response.data;
	},

	// ===================================================================
	// Cancel Order (NEW - per FRONTEND_API_REQUIREMENTS.md)
	// POST /api/v1/orders/{id}/cancel
	// ===================================================================
	/**
	 * Cancel an unpaid order.
	 * Fails gracefully if backend endpoint doesn't exist yet.
	 *
	 * @param orderId - Order to cancel
	 * @param reason - Cancellation reason
	 * @param staffId - Staff performing cancellation
	 * @returns Cancellation result
	 */
	async cancelOrder(
		orderId: string,
		reason: string,
		staffId: string,
	): Promise<CancelOrderResponse> {
		const response = await apiService.post<{
			success: boolean;
			message: string;
			data: CancelOrderResponse;
		}>(`/orders/${orderId}/cancel`, { reason, staffId } as CancelOrderRequest);

		return response.data;
	},
};
