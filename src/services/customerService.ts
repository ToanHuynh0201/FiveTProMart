import apiService from "@/lib/api";
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest } from "@/types";
import type { CustomerFilters } from "@/types/filters";
import type { ApiResponse, ApiSingleResponse, ApiDeleteResponse } from "@/types/api";

export const customerService = {
	/**
	 * 1.1 Get customers with query parameters
	 * GET /api/customers
	 */
	async getCustomers(
		filters: CustomerFilters,
	): Promise<ApiResponse<Customer>> {
		const params = new URLSearchParams();
		
		// API query parameters
		// NOTE: Backend search is not working well, we do full filter client-side
		// if (filters.id) params.append('customerId', filters.id);
		// if (filters.searchQuery) params.append('customerName', filters.searchQuery);
		
		if (filters.sortBy) params.append('sortBy', filters.sortBy);
		if (filters.order) params.append('order', filters.order);
		
		// Pagination - backend uses 0-based indexing
		const pageNumber = (filters.page || 1) - 1; // Convert 1-based to 0-based
		params.append('page', pageNumber.toString());
		if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
		
		const queryString = params.toString();
		console.log('Query params:', params.toString());
		console.log('Full URL:', `/customers${queryString ? `?${queryString}` : ''}`);
		const response = await apiService.get<ApiResponse<Customer>>(
			`/customers${queryString ? `?${queryString}` : ''}`,
		);
		return response;
	},

	/**
	 * 1.2 Get customer by ID
	 * GET /api/customers/{id}
	 */
	async getCustomerById(id: string): Promise<Customer> {
		const response = await apiService.get<ApiSingleResponse<Customer>>(`/customers/${id}`);
		return response.data;
	},

	/**
	 * Search for customer by phone number.
	 * Returns null if no customer found.
	 */
	async findByPhone(phone: string): Promise<Customer | null> {
		try {
			// Use exact phoneNumber match - backend supports this param
			const response = await apiService.get<{
				success: boolean;
				data: Customer[];
			}>(`/customers?phoneNumber=${encodeURIComponent(phone)}`);

			if (response.success && response.data.length > 0) {
				// Backend returns exact match, return first result
				return response.data[0];
			}
			return null;
		} catch {
			// API error or no results
			return null;
		}
	},

	/**
	 * 1.3 Add new customer
	 * POST /api/customers
	 */
	async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
		const response = await apiService.post<ApiSingleResponse<Customer>>("/customers", data);
		return response.data;
	},

	/**
	 * 1.4 Update a customer
	 * PUT /api/customers/{id}
	 */
	async updateCustomer(
		id: string,
		data: UpdateCustomerRequest,
	): Promise<Customer> {
		const response = await apiService.put<ApiSingleResponse<Customer>>(`/customers/${id}`, data);
		return response.data;
	},

	/**
	 * 1.5 Delete a customer
	 * DELETE /api/customers/{id}
	 */
	async deleteCustomer(id: string): Promise<void> {
		await apiService.delete<ApiDeleteResponse>(`/customers/${id}`);
	},
};