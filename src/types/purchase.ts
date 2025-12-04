export interface Supplier {
	id: string;
	name: string;
	phone?: string;
	email?: string;
	address?: string;
}

export interface PurchaseItem {
	id: string;
	productCode: string;
	productName: string;
	category?: string;
	unit: string; // Đơn vị tính
	quantity: number; // Số lượng nhập
	unitPrice: number; // Đơn giá nhập
	vat: number; // VAT (%)
	totalPrice: number; // Thành tiền
	expiryDate?: Date; // Hạn sử dụng (nếu có)
	manufactureDate?: Date; // Ngày sản xuất (nếu có)
}

export interface Purchase {
	id: string;
	purchaseNumber: string; // Mã phiếu nhập (PN-YYYYMMDD-XXXX)
	supplier: Supplier;
	items: PurchaseItem[];
	subtotal: number; // Tổng tiền hàng
	tax: number; // Thuế VAT
	shippingFee: number; // Phí vận chuyển
	discount: number; // Giảm giá
	total: number; // Tổng tiền thanh toán
	paymentStatus: "unpaid" | "paid"; // Trạng thái thanh toán
	paidAmount: number; // Số tiền đã trả
	notes?: string; // Ghi chú
	staff?: {
		id: string;
		name: string;
	};
	warehouseLocation?: string; // Kho hàng
	expectedDeliveryDate?: Date; // Ngày giao hàng dự kiến
	actualDeliveryDate?: Date; // Ngày giao hàng thực tế
	status: "draft" | "ordered" | "received" | "cancelled"; // Trạng thái đơn hàng
	createdAt: Date;
	updatedAt: Date;
}

export interface PurchaseStats {
	totalPurchases: number; // Tổng số phiếu nhập
	totalAmount: number; // Tổng tiền nhập hàng
	pendingOrders: number; // Đơn hàng chờ nhận
	totalItems: number; // Tổng số mặt hàng
}

export interface PurchaseFilter {
	searchQuery: string; // Tìm theo mã phiếu, nhà cung cấp
	status: string; // all, draft, ordered, received, cancelled
	paymentStatus: string; // all, unpaid, paid
	supplierId: string; // Lọc theo nhà cung cấp
	dateFrom?: Date; // Từ ngày
	dateTo?: Date; // Đến ngày
}

export interface ExcelPurchaseItem {
	"Mã sản phẩm": string;
	"Tên sản phẩm": string;
	"Nhóm hàng"?: string;
	"Đơn vị tính": string;
	"Số lượng": number;
	"Đơn giá": number;
	"VAT (%)"?: number;
	"Ngày sản xuất"?: string; // DD/MM/YYYY
	"Hạn sử dụng"?: string; // DD/MM/YYYY
}
