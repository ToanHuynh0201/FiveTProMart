import apiService from "@/lib/api";
import type { Customer } from "@/types";
import type { CustomerFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const customerService = {
	/**
	 * Fetch customers with server-side filtering and pagination
	 */
	async getCustomers(
		filters: CustomerFilters,
	): Promise<ApiResponse<Customer>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<Customer>>(
			`/customers?${params.toString()}`,
		);
	},

	async getCustomerById(id: string): Promise<Customer> {
		return apiService.get<Customer>(`/customers/${id}`);
	},

	async createCustomer(data: Omit<Customer, "id">): Promise<Customer> {
		return apiService.post<Customer>("/customers", data);
	},

	async updateCustomer(
		id: string,
		data: Partial<Customer>,
	): Promise<Customer> {
		return apiService.put<Customer>(`/customers/${id}`, data);
	},

	async deleteCustomer(id: string): Promise<void> {
		return apiService.delete(`/customers/${id}`);
	},
};
