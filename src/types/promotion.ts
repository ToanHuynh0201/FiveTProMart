// Loại khuyến mãi
export type PromotionType = "discount" | "buyThisGetThat";

// Sản phẩm áp dụng khuyến mãi
export interface PromotionProduct {
	id: string;
	code: string;
	name: string;
	category?: string;
	unit?: string;
}

// Cấu hình cho từng loại khuyến mãi
export interface DiscountConfig {
	percentage: number; // Phần trăm giảm giá (0-100)
	products: PromotionProduct[]; // Danh sách sản phẩm áp dụng giảm giá
}

// Nhóm sản phẩm cần mua trong "Mua này tặng kia"
export interface PurchaseProductGroup {
	product: PromotionProduct; // Sản phẩm cần mua
	quantity: number; // Số lượng cần mua
}

export interface BuyThisGetThatConfig {
	purchaseGroups: PurchaseProductGroup[]; // Các nhóm sản phẩm cần mua
	giftProducts: {
		product: PromotionProduct; // Sản phẩm tặng
		quantity: number; // Số lượng tặng
	}[];
}

// Interface chính cho khuyến mãi
export interface Promotion {
	id: string;
	code: string; // Mã khuyến mãi
	name: string; // Tên chương trình khuyến mãi
	description?: string; // Mô tả
	type: PromotionType; // Loại khuyến mãi

	// Cấu hình theo loại khuyến mãi
	discountConfig?: DiscountConfig; // Cho loại "discount"
	buyThisGetThatConfig?: BuyThisGetThatConfig; // Cho loại "buyThisGetThat"

	startDate: Date; // Ngày bắt đầu
	endDate: Date; // Ngày kết thúc
	status: "active" | "inactive" | "expired"; // Trạng thái

	createdAt: Date;
	updatedAt: Date;
	createdBy?: string; // Người tạo
}

// Filter cho tìm kiếm khuyến mãi
export interface PromotionFilter {
	searchQuery: string; // Tìm theo tên, mã KM, tên sản phẩm
	type: string; // Loại khuyến mãi (all, discount, buy1getN, buyThisGetThat)
	status: string; // Trạng thái (all, active, inactive, expired)
	dateRange?: {
		start: Date;
		end: Date;
	};
}

// Thống kê khuyến mãi
export interface PromotionStats {
	totalPromotions: number;
	activePromotions: number;
	expiredPromotions: number;
	upcomingPromotions: number; // Sắp diễn ra
}

// Form data để tạo/sửa khuyến mãi
export type PromotionFormData = Omit<
	Promotion,
	"id" | "createdAt" | "updatedAt" | "status"
>;
