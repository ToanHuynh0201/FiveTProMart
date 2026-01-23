// Stock Inventory status type - MUST match backend BatchStatus enum exactly
// Backend values: "AVAILABLE", "OUT_OF_STOCK", "EXPIRED", "DISPOSED"
export type StockInventoryStatus = "AVAILABLE" | "OUT_OF_STOCK" | "EXPIRED" | "DISPOSED";

// Stock inventory item (Lot/Batch)
export interface StockInventoryItem {
	lotId: string;
	productId: string;
	productName: string;
	manufactureDate: string; // Format: dd-MM-yyyy
	expirationDate: string; // Format: dd-MM-yyyy
	stockQuantity: number;
	reservedQuantity?: number; // Amount currently reserved for pending orders
	quantityShelf?: number | null;
	quantityStorage?: number | null;
	importPrice: number;
	status: StockInventoryStatus;
}

// Get stock inventories filter
export interface StockInventoryFilter {
	search?: string; // lot_id contains search string
	productId?: string; // Filter by product_id
	status?: StockInventoryStatus | "all"; // Filter by status
	sortBy?: "expirationDate" | "stockQuantity" | "importPrice";
	order?: "asc" | "desc";
	page?: number; // Page number (zero-based)
	size?: number; // Page size
}

// Create stock inventory request
export interface CreateStockInventoryRequest {
	productId: string;
	manufactureDate: string; // Format: dd-MM-yyyy
	expirationDate: string; // Format: dd-MM-yyyy
	stockQuantity: number;
	importPrice: number;
}

// Update stock inventory request
export interface UpdateStockInventoryRequest {
	quantityStorage: number;
	quantityShelf: number;
	status: StockInventoryStatus;
}

// Update stock inventory response
export interface UpdateStockInventoryResponse {
	lotId: string;
	quantityStorage: number;
	quantityShelf: number;
	status: StockInventoryStatus;
}
