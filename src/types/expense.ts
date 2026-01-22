/**
 * Expense Types based on Stats API spec
 * API Endpoint: GET /api/v1/stats/
 */

export interface Expense {
	id: string;
	category: string;
	description: string;
	payDate: string; // Format: dd-MM-yyyy
	amount: number;
	image?: string; // Can be filename or URL
}

export interface CreateExpenseRequest {
	category: string;
	description: string;
	amount: number;
	payDate: string; // Format: dd-MM-yyyy
	image?: string;
}

export interface UpdateExpenseRequest {
	category?: string;
	description?: string;
	amount?: number;
	payDate?: string; // Format: dd-MM-yyyy
	image?: string;
}

export interface CategoryBreakdown {
	categoryName: string;
	totalAmount: number;
}

export interface ExpenseReport {
	totalAmount: number;
	breakdown: CategoryBreakdown[];
}

export interface StatsResponse {
	success: boolean;
	message: string;
	data: Expense | Expense[] | ExpenseReport;
	pagination?: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		pageSize: number;
	};
}
