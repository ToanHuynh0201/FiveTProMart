import apiService from "@/lib/api";
import type { Customer } from "@/types";
import type { CustomerFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

/**
 * Request type for creating/updating customers
 * Matches backend CustomerRequest.java exactly
 * ALL fields are REQUIRED - backend has @NotNull/@NotBlank on all
 */
interface CustomerRequest {
	fullName: string;
	gender: string;
	dateOfBirth: string; // ISO date string - REQUIRED by backend
	phoneNumber: string;
}

export const customerService = {
	/**
	 * Fetch customers with server-side filtering and pagination
	 * Returns Customer[] matching backend CustomerResponse.java exactly
	 */
	async getCustomers(
		filters: CustomerFilters,
	): Promise<ApiResponse<Customer>> {
		return apiService.get<ApiResponse<Customer>>(
			`/customers?${buildQueryParams(filters).toString()}`,
		);
	},

	async getCustomerById(id: string): Promise<Customer> {
		const response = await apiService.get<{
			success: boolean;
			message: string;
			data: Customer;
		}>(`/customers/${id}`);
		return response.data;
	},

	/**
	 * Search for customer by phone number.
	 * Returns null if no customer found.
	 */
	async findByPhone(phone: string): Promise<Customer | null> {
		try {
			const response = await apiService.get<{
				success: boolean;
				data: Customer[];
			}>(`/customers?search=${encodeURIComponent(phone)}`);

			if (response.success && response.data.length > 0) {
				// Find exact phone match
				const match = response.data.find(
					(c) => c.phoneNumber === phone,
				);
				return match || null;
			}
			return null;
		} catch {
			return null;
		}
	},

	async createCustomer(data: CustomerRequest): Promise<Customer> {
		const response = await apiService.post<{
			success: boolean;
			message: string;
			data: Customer;
		}>("/customers", data);
		return response.data;
	},

	async updateCustomer(
		id: string,
		data: Partial<CustomerRequest>,
	): Promise<Customer> {
		const response = await apiService.put<{
			success: boolean;
			message: string;
			data: Customer;
		}>(`/customers/${id}`, data);
		return response.data;
	},

	async deleteCustomer(id: string): Promise<void> {
		return apiService.delete(`/customers/${id}`);
	},
};
