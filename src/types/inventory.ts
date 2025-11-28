// Lô hàng - mỗi lô có hạn sử dụng riêng
export interface ProductBatch {
	id: string;
	productId: string; // ID sản phẩm
	batchNumber: string; // Số lô
	quantity: number; // Số lượng trong lô
	costPrice: number; // Giá vốn của lô này
	expiryDate?: Date; // Hạn sử dụng
	importDate: Date; // Ngày nhập
	supplier?: string; // Nhà cung cấp của lô này
	status: "active" | "expired" | "sold-out"; // Trạng thái lô
}

export interface InventoryProduct {
	id: string;
	code: string; // Mã hàng
	name: string; // Tên hàng hóa
	category: string; // Nhóm hàng
	unit: string; // Đơn vị tính (kg, gói, thùng, ...)
	price: number; // Giá bán
	costPrice: number; // Giá vốn trung bình
	stock: number; // Tổng tồn kho (tính từ tất cả các lô)
	minStock: number; // Tồn kho tối thiểu (cảnh báo hết hàng)
	maxStock: number; // Tồn kho tối đa
	supplier?: string; // Nhà cung cấp chính
	barcode?: string; // Mã vạch
	image?: string; // Hình ảnh sản phẩm
	description?: string; // Mô tả
	batches?: ProductBatch[]; // Danh sách các lô hàng
	status: "active" | "inactive" | "out-of-stock";
	createdAt: Date;
	updatedAt: Date;
}

export interface InventoryCategory {
	id: string;
	name: string;
	description?: string;
	productCount: number;
}

export interface InventoryStats {
	totalProducts: number;
	totalValue: number; // Tổng giá trị hàng tồn kho
	lowStockProducts: number; // Số sản phẩm sắp hết hàng
	outOfStockProducts: number; // Số sản phẩm hết hàng
	activeProducts: number;
	expiredBatches: number; // Số lô đã hết hạn
	expiringSoonBatches: number; // Số lô sắp hết hạn (trong 7 ngày)
}

export interface StockMovement {
	id: string;
	productId: string;
	productName: string;
	batchId?: string; // ID lô hàng (nếu có)
	batchNumber?: string; // Số lô
	type: "import" | "export" | "adjustment"; // Nhập, xuất, điều chỉnh
	quantity: number;
	beforeStock: number;
	afterStock: number;
	reason?: string;
	createdBy: string;
	createdAt: Date;
}

export interface ProductFilter {
	searchQuery: string;
	category: string;
	status: string;
	stockLevel: "all" | "low" | "out" | "normal" | "expiring-soon" | "expired"; // Mức tồn kho
}
