export interface Supplier {
	id: string;
	code: string; // Mã nhà cung cấp
	name: string;
	phone: string;
	email?: string;
	address?: string;
	taxCode?: string; // Mã số thuế
	contactPerson?: string; // Người liên hệ
	contactPhone?: string; // SĐT người liên hệ
	bankAccount?: string; // Số tài khoản
	bankName?: string; // Tên ngân hàng
	totalProducts?: number; // Tổng số sản phẩm cung cấp
	totalPurchases?: number; // Tổng số đơn nhập hàng
	totalValue?: number; // Tổng giá trị nhập hàng
	lastPurchaseDate?: Date; // Ngày nhập hàng gần nhất
	status: "active" | "inactive";
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface SupplierDetail extends Supplier {
	products?: SupplierProduct[]; // Danh sách sản phẩm cung cấp
	purchaseHistory?: PurchaseHistory[]; // Lịch sử nhập hàng
}

export interface SupplierProduct {
	id: string;
	productId: string;
	productCode: string;
	productName: string;
	category: string;
	unit: string;
	lastPurchasePrice?: number; // Giá nhập gần nhất
	lastPurchaseDate?: Date;
	totalQuantityPurchased?: number; // Tổng số lượng đã nhập
}

export interface PurchaseHistory {
	id: string;
	purchaseNumber: string;
	date: Date;
	totalAmount: number;
	itemCount: number;
	status: "draft" | "ordered" | "received" | "cancelled";
}

export interface SupplierStats {
	totalSuppliers: number;
	activeSuppliers: number;
	inactiveSuppliers: number;
	totalPurchaseValue: number; // Tổng giá trị nhập hàng
	topSupplier?: {
		name: string;
		value: number;
	};
}

export interface SupplierFilter {
	searchQuery: string; // Tìm theo mã, tên, SĐT
	status: string; // all, active, inactive
}

export interface UpdateSupplierData {
	code?: string;
	name?: string;
	phone?: string;
	email?: string;
	address?: string;
	taxCode?: string;
	contactPerson?: string;
	contactPhone?: string;
	bankAccount?: string;
	bankName?: string;
	status?: "active" | "inactive";
	notes?: string;
}
