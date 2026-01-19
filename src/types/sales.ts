export interface ProductBatch {
	id: string;
	batchNumber: string; // Số lô (cũng là mã vạch của lô)
	quantity: number; // Số lượng trong lô
	expiryDate: Date; // Hạn sử dụng
	importDate: Date; // Ngày nhập
}

export interface Product {
	id: string;
	code: string; // Mã hàng
	name: string; // Tên sản phẩm
	price: number; // Đơn giá
	stock: number; // Tồn kho
	category?: string;
	barcode?: string; // Mã vạch
	promotion?: string; // Khuyến mãi
	expiryDate?: Date; // Hạn sử dụng (deprecated - dùng batches)
	batches?: ProductBatch[]; // Danh sách lô hàng
}

export interface OrderItem {
	id: string;
	product: Product;
	quantity: number; // Số lượng
	unitPrice: number; // Đơn giá (original, before promotion)
	totalPrice: number; // Thành tiền (uses promotional price if available)
	batchId?: string; // ID của lô hàng được chọn (also known as lotId)
	batchNumber?: string; // Số lô (để hiển thị)
	reservationId?: string; // Stock reservation ID for preventing overselling
	// Promotional pricing (from checkProduct API)
	promotionalPrice?: number; // Unit price after promotion discount
	savings?: number; // Amount saved per unit
	promotionName?: string; // e.g., "Mua 2 tặng 1", "Giảm 10%"
	promotionType?: "Discount" | "Buy X Get Y";
}

export type PaymentMethod = "cash" | "card" | "transfer";

export interface SalesOrder {
	id: string; // Mã đơn hàng
	orderNumber: string; // #12345678
	items: OrderItem[];
	subtotal: number;
	discount: number;
	total: number; // Tổng tiền
	paymentMethod?: PaymentMethod;
	customer?: {
		id: string;
		name: string;
		phone?: string;
		points?: number; // Điểm tích lũy
	};
	staff?: {
		id: string;
		name: string;
	};
	createdAt: Date; // Thời gian tạo
	status: "draft" | "completed" | "cancelled";
}

export interface SalesStats {
	totalOrders: number;
	totalRevenue: number;
	averageOrderValue: number;
}

// Interface cho hóa đơn đang tạm dừng
export interface PendingOrder {
	id: string; // ID unique cho pending order
	orderNumber: string; // Số hóa đơn
	items: OrderItem[]; // Danh sách sản phẩm
	customer: {
		id: string;
		name: string;
		phone?: string;
		points?: number;
	} | null;
	paymentMethod?: PaymentMethod;
	createdAt: Date; // Thời gian tạo
	pausedAt: Date; // Thời gian tạm dừng
}

// =====================================================================
// API Types - Match backend exactly (OrderAPI.md)
// These are for API calls. UI types above are for display/state.
// =====================================================================

/**
 * Request: POST /api/v1/orders/check-product
 */
export interface CheckProductRequest {
	lotId: string; // Scanned barcode (which IS the lotId)
	quantity: number; // Default: 1
}

/**
 * Response: POST /api/v1/orders/check-product
 * Note: UI should merge items with same productId+unitPrice for display,
 * but keep individual lotIds for checkout.
 */
export interface CheckProductResponse {
	lotId: string;
	productId: string;
	productName: string;
	unitOfMeasure: string;
	unitPrice: number;
	quantity: number;
	subTotal: number;
	currentStock: number;
	status: string; // StockInventory.status
	/** Lot expiration date in dd-MM-yyyy format. Awaiting backend implementation. */
	expirationDate?: string;
	// Promotion info from backend (null if no active promotion)
	promotion?: {
		promotionId: string;
		promotionName: string;
		promotionType: "Discount" | "Buy X Get Y";
		discountPercent?: number; // For Discount type
		buyQuantity?: number; // For Buy X Get Y
		getQuantity?: number; // For Buy X Get Y
		promotionalPrice: number; // Unit price after discount
		savings: number; // Amount saved per unit
	} | null;
}

/**
 * Discount request for order creation
 * Supports: LOYALTY_POINTS, PERCENTAGE, FIXED_AMOUNT, NONE
 */
export interface DiscountRequest {
	type: "NONE" | "PERCENTAGE" | "FIXED_AMOUNT" | "LOYALTY_POINTS";
	pointsToUse?: number; // For LOYALTY_POINTS: 1 point = 1 VND discount
	percentage?: number; // For PERCENTAGE: e.g., 10 = 10% off
	maxAmount?: number; // For PERCENTAGE: cap the discount
	amount?: number; // For FIXED_AMOUNT: exact VND discount
}

/**
 * Request: POST /api/v1/orders
 */
export interface CreateOrderRequest {
	staffId: string; // Staff processing the order
	customerId?: string | null; // Nullable = Khách lẻ (walk-in customer)
	paymentMethod: "CASH" | "BANK_TRANSFER"; // Backend uses uppercase
	amountGiven: number;
	items: Array<{
		lotId: string;
		quantity: number;
	}>;
	// Optional discount (loyalty points, percentage, or fixed amount)
	discount?: DiscountRequest;
}

/**
 * Response item from POST /api/v1/orders
 */
export interface CreateOrderResponseItem {
	productId: string;
	productName: string;
	lotId: string;
	quantity: number;
	subTotal: number;
}

/**
 * Response: POST /api/v1/orders
 */
export interface CreateOrderResponse {
	orderId: string;
	orderDate: string; // "dd-MM-yyyy hh-mm-ss"
	subTotal: number; // Sum of all items before discount
	discountAmount: number; // Amount deducted
	totalAmount: number; // After discount (and cash rounding)
	changeReturned: number;
	pointsEarned: number; // 1% of totalAmount
	pointsRedeemed?: number; // If loyalty points were used
	items: CreateOrderResponseItem[];
	// Cash rounding fields (Vietnam retail)
	originalAmount?: number; // Total before rounding
	roundingAdjustment?: number; // +/- rounding amount
}

/**
 * Filters for GET /api/v1/orders
 */
export interface OrderFilters {
	search?: string; // orderId, customerName, customerId
	staffId?: string;
	startDate?: string; // "dd-MM-yyyy"
	endDate?: string;
	paymentMethod?: "Tiền mặt" | "Chuyển khoản";
	status?: "Đã thanh toán" | "Chưa thanh toán" | "Đã huỷ";
	page?: number;
	size?: number;
	sort?: string; // e.g., "orderDate,desc"
}

/**
 * List item from GET /api/v1/orders
 */
export interface OrderListItem {
	orderId: string;
	orderDate: string;
	customerName: string; // "Khách lẻ" if no customerId
	staffName: string;
	totalAmount: number;
	paymentMethod: string;
	status: string;
	createdAt: string;
}

/**
 * Detail item from GET /api/v1/orders/{id}
 */
export interface OrderDetailItem {
	productId: string;
	productName: string;
	quantity: number;
	unitPrice: number;
	subTotal: number;
}

/**
 * Response: GET /api/v1/orders/{id}
 */
export interface OrderDetail {
	orderId: string;
	orderDate: string;
	status: string;
	paymentMethod: string;
	customer: {
		customerId: string;
		fullName: string;
		phoneNumber: string;
	} | null;
	staff: {
		profileId: string;
		fullName: string;
	};
	items: OrderDetailItem[];
	subTotal: number;
	discountAmount: number;
	totalAmount: number;
	amountGiven: number;
	changeReturned: number;
	pointsEarned: number;
	// Cash rounding fields (Vietnam retail)
	originalAmount?: number;
	roundingAdjustment?: number;
}

/**
 * Request: POST /api/v1/orders/{id}/cancel
 * Note: This endpoint is in FRONTEND_API_REQUIREMENTS.md, awaiting backend
 */
export interface CancelOrderRequest {
	reason: string;
	staffId: string;
}

/**
 * Response: POST /api/v1/orders/{id}/cancel
 */
export interface CancelOrderResponse {
	orderId: string;
	status: string;
	cancelledAt: string;
	cancelledBy: string;
	reason: string;
	stockRestored: boolean;
}
