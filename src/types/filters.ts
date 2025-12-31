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
	searchQuery?: string;
	type?: string;
	status?: string;
}

export interface PurchaseFilters extends BaseFilters {
	searchQuery?: string;
	status?: string;
	paymentStatus?: string;
	supplierId?: string;
	dateFrom?: string;
	dateTo?: string;
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
