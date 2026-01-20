import apiService from "@/lib/api";
import type {
	Expense,
	CreateExpenseRequest,
	UpdateExpenseRequest,
	ExpenseReport,
} from "@/types/expense";
import type { ExpenseFilters } from "@/types/filters";
import type { ApiSingleResponse } from "@/types/api";

interface ExpenseListResponse {
	success: boolean;
	message: string;
	data: Expense[];
	pagination: {
		totalItems: number;
		itemsPerPage: number;
		totalPages: number;
		startPage: number;
	};
}

interface ExpenseCreateResponse extends ApiSingleResponse<{
	id: string;
	category: string;
	amount: number;
}> {}

interface ExpenseUpdateResponse extends ApiSingleResponse<Expense> {}

interface ExpenseReportResponse extends ApiSingleResponse<ExpenseReport> {}

export const expenseService = {
	/**
	 * GET /api/v1/stats/
	 * Fetch expenses with filtering, search, sorting, and pagination
	 */
	async getExpenses(filters: ExpenseFilters): Promise<ExpenseListResponse> {
		// Convert filters to query parameters
		const params = new URLSearchParams();

		// Pagination
		const page = filters.page || 1;
		const pageSize = filters.pageSize || 10;
		params.append("page", String(page - 1)); // Convert to 0-based indexing

		// Search
		if (filters.searchQuery) {
			params.append("search", filters.searchQuery);
		}

		// Category filter
		if (filters.category && filters.category !== "all") {
			params.append("category", filters.category);
		}

		// Date range filters
		if (filters.startDate) {
			params.append("startDate", filters.startDate);
		}
		if (filters.endDate) {
			params.append("endDate", filters.endDate);
		}

		// Sorting
		if (filters.sortBy) {
			params.append("sortBy", filters.sortBy);
		}
		if (filters.order) {
			params.append("order", filters.order);
		}

		params.append("size", String(pageSize));

		const response = await apiService.get<ExpenseListResponse>(
			`/expenses?${params.toString()}`,
		);

		return {
			...response,
			data: response.data || [],
		};
	},

	/**
	 * POST /api/v1/stats/
	 * Create new expense
	 */
	async createExpense(
		data: CreateExpenseRequest,
	): Promise<ExpenseCreateResponse> {
		return apiService.post<ExpenseCreateResponse>("/expenses", data);
	},

	/**
	 * PUT /api/v1/stats/{id}
	 * Update existing expense
	 */
	async updateExpense(
		id: string,
		data: UpdateExpenseRequest,
	): Promise<ExpenseUpdateResponse> {
		return apiService.put<ExpenseUpdateResponse>(`/expenses/${id}`, data);
	},

	/**
	 * DELETE /api/v1/stats/{id}
	 * Delete expense
	 */
	async deleteExpense(id: string): Promise<void> {
		await apiService.delete(`/expenses/${id}`);
	},

	/**
	 * GET /api/v1/stats/category-report
	 * Get expense report by category for date range
	 */
	async getCategoryReport(
		startDate: string,
		endDate: string,
	): Promise<ExpenseReportResponse> {
		const params = new URLSearchParams();
		params.append("startDate", startDate); // Format: dd-MM-yyyy
		params.append("endDate", endDate); // Format: dd-MM-yyyy

		return apiService.get<ExpenseReportResponse>(
			`/stats/category-report?${params.toString()}`,
		);
	},
};
