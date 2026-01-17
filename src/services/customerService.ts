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

	/**
	 * Search for customer by phone number.
	 * Returns null if no customer found.
	 *
	 * NOTE: CustomerAPI doesn't have dedicated phone search.
	 * This uses general search and filters client-side.
	 * TODO: Request backend to add phone search parameter.
	 */
	async findByPhone(phone: string): Promise<Customer | null> {
		try {
			// Try search with phone number
			const response = await apiService.get<{
				success: boolean;
				data: Array<{
					customerId: string;
					fullName: string;
					phoneNumber: string;
					loyaltyPoints: number;
					gender?: string;
					dateOfBirth?: string;
					registrationDate?: string;
				}>;
			}>(`/customers?search=${encodeURIComponent(phone)}`);

			if (response.success && response.data.length > 0) {
				// Find exact phone match
				const match = response.data.find(
					(c) => c.phoneNumber === phone,
				);
				if (match) {
					return {
						id: match.customerId,
						name: match.fullName,
						phone: match.phoneNumber,
						email: undefined,
						address: undefined,
						loyaltyPoints: match.loyaltyPoints,
						registrationDate: match.registrationDate,
					};
				}
			}
			return null;
		} catch {
			// API error or no results
			return null;
		}
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
