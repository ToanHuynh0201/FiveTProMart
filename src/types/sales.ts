export interface ProductBatch {
	id: string;
	batchNumber: string; // Số lô
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
	unitPrice: number; // Đơn giá
	totalPrice: number; // Thành tiền
	batchId?: string; // ID của lô hàng được chọn
	batchNumber?: string; // Số lô (để hiển thị)
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
