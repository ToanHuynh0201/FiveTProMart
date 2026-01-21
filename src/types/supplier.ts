/**
 * Supplier type enum - matches backend enum
 */
export type SupplierType = "Doanh nghiệp" | "Tư nhân";

/**
 * Supplier status enum
 */
export type SupplierStatus = "HOẠT ĐỘNG" | "NGỪNG HOẠT ĐỘNG";

/**
 * Supplier model - matches backend response from GET /suppliers
 */
export interface Supplier {
	supplierId: string;
	supplierName: string;
	address: string;
	phoneNumber: string;
	representName: string | null;
	representPhoneNumber: string | null;
	supplierType: SupplierType;
	currentDebt: number;
}

/**
 * Supplier detail model - matches backend response from GET /suppliers/{id}
 */
export interface SupplierDetail {
	supplierId: string;
	supplierName: string;
	address: string;
	phoneNumber: string;
	representName: string | null;
	representPhoneNumber: string | null;
	supplierType: SupplierType;
	status: SupplierStatus;
	currentDebt: number;
	suppliedProducts: SuppliedProductInfo[];
}

/**
 * Supplied product info in supplier detail
 */
export interface SuppliedProductInfo {
	productId: string;
	lastImportPrice: number;
	lastImportDate: string | null;
}

/**
 * Product details for supplier products tab
 */
export interface SupplierProduct {
	productId: string;
	productName: string;
	category: string;
	unitOfMeasure: string;
	totalStockQuantity: number;
	lastImportPrice: number;
	lastImportDate: string | null;
}

export interface SupplierStats {
	totalSuppliers: number;
	activeSuppliers: number;
	inactiveSuppliers: number;
	totalPurchaseValue: number;
	topSupplier?: {
		name: string;
		value: number;
	};
}

export interface SupplierFilter {
	searchQuery: string;
	status: string;
}

/**
 * DTO for creating a new supplier
 */
export interface CreateSupplierDTO {
	supplierName: string;
	supplierType: SupplierType;
	phoneNumber: string;
	address: string;
	email?: string;
	taxCode?: string;
	bankAccount?: string;
	bankName?: string;
	representName?: string;
	representPhoneNumber?: string;
	suppliedProductType?: string[]; // Array of productIds
}

/**
 * DTO for updating supplier
 */
export interface UpdateSupplierDTO {
	supplierName?: string;
	supplierType?: SupplierType;
	phoneNumber?: string;
	address?: string;
	email?: string;
	taxCode?: string;
	bankAccount?: string;
	bankName?: string;
	representName?: string;
	representPhoneNumber?: string;
	suppliedProductType?: string[]; // Array of productIds
}
