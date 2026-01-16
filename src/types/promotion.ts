// Loại khuyến mãi theo API spec
export type PromotionType = "Discount" | "Buy X Get Y";

// Trạng thái khuyến mãi theo API spec
export type PromotionStatus = "Active" | "Expired" | "Upcoming" | "Cancelled";

// Sản phẩm trong danh sách khuyến mãi (list response)
export interface PromotionProductSummary {
	productId: string;
	productName: string;
}

// Sản phẩm chi tiết trong promotion detail
export interface PromotionProductDetail {
	productId: string;
	productName: string;
	unitOfMeasure: string;
	sellingPrice: number;
	promotionPrice: number | null; // null nếu là Buy X Get Y
}

// Interface cho list promotions (GET /promotions)
export interface Promotion {
	promotionId: string;
	name: string;
	promotionType: PromotionType;
	products: PromotionProductSummary[];
	// Cho loại Discount
	discountPercent?: number;
	// Cho loại Buy X Get Y
	buyQuantity?: number;
	getQuantity?: number;
	// Thời gian
	startDate: string; // Format: dd-MM-yyyy
	endDate: string; // Format: dd-MM-yyyy
	status: PromotionStatus;
}

// Interface cho promotion detail (GET /promotions/{id})
export interface PromotionDetail {
	promotionId: string;
	promotionName: string;
	promotionDescription: string;
	promotionType: PromotionType;
	// Cho loại Discount
	discountPercent: number | null;
	// Cho loại Buy X Get Y
	buyQuantity: number | null;
	getQuantity: number | null;
	// Thông tin khác
	status: PromotionStatus;
	startDate: string; // Format: dd-MM-yyyy
	endDate: string; // Format: dd-MM-yyyy
	products: PromotionProductDetail[];
}

// Interface cho tạo promotion mới - Discount type
export interface CreateDiscountPromotion {
	promotionName: string;
	promotionDescription?: string;
	products: string[]; // Array of productId
	promotionType: "Discount";
	discountPercent: number; // 1-100
	startDate: string; // Format: dd-MM-yyyy
	endDate: string; // Format: dd-MM-yyyy
}

// Interface cho tạo promotion mới - Buy X Get Y type
export interface CreateBuyXGetYPromotion {
	promotionName: string;
	promotionDescription?: string;
	products: string[]; // Array of productId
	promotionType: "Buy X Get Y";
	buyQuantity: number; // > 0
	getQuantity: number; // > 0
	startDate: string; // Format: dd-MM-yyyy
	endDate: string; // Format: dd-MM-yyyy
}

// Union type cho tạo promotion
export type CreatePromotionRequest =
	| CreateDiscountPromotion
	| CreateBuyXGetYPromotion;

// Response khi tạo promotion thành công
export interface CreatePromotionResponse {
	promotionId: string;
	promotionName: string;
	promotionDescription: string;
	status: PromotionStatus;
	startDate: string;
	endDate: string;
}

// Response khi hủy promotion
export interface CancelPromotionResponse {
	promotionId: string;
	status: "Cancelled";
}

// Thống kê khuyến mãi (cho stats cards)
export interface PromotionStats {
	totalPromotions: number;
	activePromotions: number;
	expiredPromotions: number;
	upcomingPromotions: number;
	cancelledPromotions?: number;
}

// Filter cho tìm kiếm khuyến mãi (UI)
export interface PromotionFilter {
	searchQuery: string;
	type: string; // "all" | "Discount" | "Buy X Get Y"
	status: string; // "all" | "Active" | "Expired" | "Upcoming" | "Cancelled"
}
