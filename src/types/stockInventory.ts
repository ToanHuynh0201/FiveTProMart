// Stock Inventory status type
export type StockInventoryStatus = "active" | "expired" | "sold-out";

// Stock inventory item (Lot/Batch)
export interface StockInventoryItem {
	lotId: string;
	productId: string;
	productName: string;
	manufactureDate: string; // Format: dd-MM-yyyy
	expirationDate: string; // Format: dd-MM-yyyy
	stockQuantity: number;
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
	stockQuantity: number;
	status: StockInventoryStatus;
}

// Update stock inventory response
export interface UpdateStockInventoryResponse {
	lotId: string;
	stockQuantity: number;
	status: StockInventoryStatus;
}
