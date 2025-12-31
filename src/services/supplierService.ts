import apiService from "@/lib/api";
import type { Supplier } from "@/types/supplier";
import type { SupplierFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const supplierService = {
	/**
	 * Fetch suppliers with server-side filtering and pagination
	 */
	async getSuppliers(
		filters: SupplierFilters,
	): Promise<ApiResponse<Supplier>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<Supplier>>(
			`/suppliers?${params.toString()}`,
		);
	},

	async getSupplierById(id: string): Promise<Supplier> {
		return apiService.get<Supplier>(`/suppliers/${id}`);
	},

	async createSupplier(
		data: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
	): Promise<Supplier> {
		return apiService.post<Supplier>("/suppliers", data);
	},

	async updateSupplier(
		id: string,
		data: Partial<Supplier>,
	): Promise<Supplier> {
		return apiService.put<Supplier>(`/suppliers/${id}`, data);
	},

	async deleteSupplier(id: string): Promise<void> {
		return apiService.delete(`/suppliers/${id}`);
	},
};
