/**
 * StockInventory/Batch type matching backend StockInventoryResponse.java EXACTLY
 * Backend is source of truth - DO NOT add fields the backend doesn't send
 */
export interface ProductBatch {
	lotId: string;
	productId: string;
	productName: string;
	manufactureDate: string | null; // ISO date string (LocalDate)
	expirationDate: string | null; // ISO date string (LocalDate)
	stockQuantity: number;
	importPrice: number;
	status: string; // Backend returns string, e.g., "AVAILABLE", "EXPIRED"
}

/**
 * Product type matching backend ProductResponse.java EXACTLY
 * Backend is source of truth - DO NOT add fields the backend doesn't send
 */
export interface InventoryProduct {
	productId: string;
	productName: string;
	categoryId: string;
	unitOfMeasure: string;
	sellingPrice: number | null;
	totalStockQuantity: number | null;
}

/**
 * Category type matching backend CategoryResponse.java EXACTLY
 */
export interface InventoryCategory {
	categoryId: string;
	categoryName: string;
}

/**
 * Stats type matching backend ProductStatsResponse.java EXACTLY
 */
export interface InventoryStats {
	totalProducts: number;
	activeProducts: number;
	inactiveProducts: number;
	totalInventoryValue: number;
	lowStockCount: number;
	outOfStockCount: number;
	expiringSoonCount: number;
	expiredCount: number;
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

// Hủy hàng
export interface DisposalItem {
	id: string; // ID unique cho mỗi item trong disposal
	productId: string;
	productName: string;
	productCode: string;
	batchId: string;
	batchNumber: string;
	quantity: number; // Số lượng hủy
	maxQuantity: number; // Số lượng tối đa có thể hủy (quantity của batch)
	costPrice: number; // Giá vốn
	expiryDate?: Date;
	reason: string; // Lý do hủy: "expired" | "damaged" | "other"
}

export interface DisposalRecord {
	id: string;
	items: DisposalItem[];
	totalValue: number; // Tổng giá trị hủy
	createdBy: string;
	createdAt: Date;
	note?: string; // Ghi chú
}
