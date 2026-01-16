// Status type for purchase workflow: Draft -> Completed/Cancelled
export type PurchaseStatus = "Draft" | "Completed" | "Cancelled";

// Supplier info embedded in purchase order
export interface PurchaseSupplier {
	supplierId: string;
	supplierName: string;
	phone?: string;
	representName?: string;
	representPhoneNumber?: string;
}

// Item in purchase order
export interface PurchaseItem {
	productId: string;
	productName: string;
	importPrice: number;
	quantityOrdered: number;
	quantityReceived: number; // Default = 0 when create draft
	subTotal: number;
}

// Invoice info for confirmed orders
export interface PurchaseInvoice {
	invoiceNumber: string;
	invoiceDate: string;
	images: string[];
}

// Purchase order list item (from GET /purchase_orders)
export interface PurchaseListItem {
	id: string;
	poCode: string;
	supplierName: string;
	staffNameCreated: string;
	totalAmount: number;
	status: PurchaseStatus;
	purchaseDate: string;
	checkDate?: string;
}

// Purchase order detail (from GET /purchase_orders/{id})
export interface PurchaseDetail {
	_id: string;
	poCode: string;
	status: PurchaseStatus;
	notes?: string;
	supplier: PurchaseSupplier;
	staffIdCreated: string;
	purchaseDate: string;
	staffIdChecked?: string;
	checkDate?: string;
	items: PurchaseItem[];
	totalAmount: number;
	invoice?: PurchaseInvoice;
	generatedLotIds?: string[];
}

// Create draft request body
export interface CreateDraftRequest {
	supplierId: string;
	notes?: string;
	items: {
		productId: string;
		quantityOrdered: number;
	}[];
}

// Create draft response
export interface CreateDraftResponse {
	id: string;
	poId: string;
	supplierName: string;
	status: "Draft";
	purchaseDate: string;
}

// Actual item for confirm receipt
export interface ActualItem {
	productId: string;
	quantityReceived: number;
	importPrice: number;
	manufactureDate: string;
	expirationDate: string;
	notes?: string; // Ghi chú cho từng sản phẩm (lý do nhập/hủy/thiếu...)
}

// Confirm receipt request body
export interface ConfirmReceiptRequest {
	staffIdChecked: string;
	checkDate: string;
	notes?: string;
	invoice: {
		invoiceNumber: string;
		invoiceDate: string;
		images: string[];
	};
	actualItems: ActualItem[];
}

// Lot info for printing labels
export interface LotToPrint {
	lotId: string;
	productName: string;
	quantity: number;
	expirationDate: string;
}

// Confirm receipt response
export interface ConfirmReceiptResponse {
	poId: string;
	status: "Completed";
	checkDate: string;
	finalTotalAmount: number;
	lotsToPrint: LotToPrint[];
}

// Cancel order request body
export interface CancelOrderRequest {
	staffIdChecked: string;
	checkDate: string;
	cancelNotesReason: string;
}

// Cancel order response
export interface CancelOrderResponse {
	poId: string;
	poCode: string;
	status: "Cancelled";
	cancellationReason: string;
	checkDate: string;
}

// Labels response (for reprint)
export interface LabelsResponse {
	lotId: string;
	productName: string;
	quantity: number;
	expirationDate: string;
}

// Filter type for purchase list
export interface PurchaseFilter {
	search?: string; // Filter by poId or supplierName
	status?: string; // "Draft" | "Completed" | "Cancelled" | "all"
	startDate?: string; // dd-MM-yyyy
	endDate?: string; // dd-MM-yyyy
}

// Supplier type for dropdown selection
export interface Supplier {
	id: string;
	name: string;
	phone?: string;
	email?: string;
	address?: string;
	representName?: string;
	representPhoneNumber?: string;
}

// Product type for dropdown selection when creating draft
export interface SupplierProduct {
	productId: string;
	productName: string;
	productCode?: string;
	unit?: string;
	category?: string;
}
