export interface InventoryProduct {
	id: string;
	code: string; // Mã hàng
	name: string; // Tên hàng hóa
	category: string; // Nhóm hàng
	unit: string; // Đơn vị tính (kg, gói, thùng, ...)
	price: number; // Giá bán
	costPrice: number; // Giá vốn
	stock: number; // Tồn kho
	minStock: number; // Tồn kho tối thiểu (cảnh báo hết hàng)
	maxStock: number; // Tồn kho tối đa
	supplier?: string; // Nhà cung cấp
	barcode?: string; // Mã vạch
	image?: string; // Hình ảnh sản phẩm
	description?: string; // Mô tả
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
}

export interface StockMovement {
	id: string;
	productId: string;
	productName: string;
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
	stockLevel: "all" | "low" | "out" | "normal"; // Mức tồn kho
}
