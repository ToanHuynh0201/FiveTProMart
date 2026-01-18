import type { Filters as BaseFilters } from "@/hooks/useFilters";

export type PaginationFilters = BaseFilters;

// Main pages
export interface CustomerFilters extends BaseFilters {
	searchQuery?: string;
	gender?: string;
	pointRange?: string;
}

export interface InventoryFilters extends BaseFilters {
	searchQuery?: string;
	category?: string;
	status?: string;
	stockLevel?: string;
}

export interface StaffFilters extends BaseFilters {
	searchQuery?: string;
}

export interface PromotionFilters extends BaseFilters {
	search?: string; // Filter promotionId, promotionName, productName
	type?: string; // "all" | "Discount" | "Buy X Get Y"
	status?: string; // "all" | "Active" | "Expired" | "Upcoming" | "Cancelled"
	startDate?: string; // dd-MM-yyyy
	endDate?: string; // dd-MM-yyyy
	sortBy?: "startDate" | "endDate";
	order?: "asc" | "desc";
}

export interface PurchaseFilters extends BaseFilters {
	search?: string; // Filter by poId or supplierName
	status?: string; // "Draft" | "Completed" | "Cancelled" | "all"
	startDate?: string; // dd-MM-yyyy
	endDate?: string; // dd-MM-yyyy
	sortBy?: string;
	order?: string;
}

export interface SupplierFilters extends BaseFilters {
	searchQuery?: string;
	status?: string;
}

export interface ExpenseFilters extends BaseFilters {
	searchQuery?: string;
	category?: string;
}

// Modal filters
export interface ExpenseDetailFilters extends BaseFilters {
	timeFilter?: "7days" | "30days" | "3months" | "year";
}

export interface ProductsDetailFilters extends BaseFilters {
	topLimit?: number | "all";
}

export interface CategoryDetailFilters extends BaseFilters {
	// Add specific filters if needed
}
