import apiService from "@/lib/api";
import type { Expense } from "@/types";
import type { ExpenseFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const expenseService = {
	/**
	 * Fetch expenses with server-side filtering and pagination
	 */
	async getExpenses(filters: ExpenseFilters): Promise<ApiResponse<Expense>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<Expense>>(
			`/expenses?${params.toString()}`,
		);
	},

	async getExpenseById(id: string): Promise<Expense> {
		return apiService.get<Expense>(`/expenses/${id}`);
	},

	async createExpense(data: Omit<Expense, "id">): Promise<Expense> {
		return apiService.post<Expense>("/expenses", data);
	},

	async updateExpense(
		id: string,
		data: Partial<Expense>,
	): Promise<Expense> {
		return apiService.put<Expense>(`/expenses/${id}`, data);
	},

	async deleteExpense(id: string): Promise<void> {
		return apiService.delete(`/expenses/${id}`);
	},
};
