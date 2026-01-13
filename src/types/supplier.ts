/**
 * Supplier type enum - matches backend enum
 */
export type SupplierType = "Doanh nghiệp" | "Tư nhân";

/**
 * Supplier model - matches backend response
 */
export interface Supplier {
	supplierId: string;
	supplierName: string;
	address: string;
	phoneNumber: string;
	representName: string | null;
	representPhoneNumber: string | null;
	supplierType: SupplierType;
	suppliedProductType: string;
	currentDebt: number;
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

/**
 * DTO for creating a new supplier
 */
export interface CreateSupplierDTO {
	supplierName: string;
	supplierType: SupplierType;
	phoneNumber: string;
	address: string;
	suppliedProductType: string;
	currentDebt?: number;
	representName?: string;
	representPhoneNumber?: string;
}

/**
 * DTO for updating supplier
 */
export interface UpdateSupplierDTO {
	supplierName?: string;
	supplierType?: SupplierType;
	phoneNumber?: string;
	address?: string;
	suppliedProductType?: string;
	currentDebt?: number;
	representName?: string;
	representPhoneNumber?: string;
}
