import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type { CreateSupplierDTO, UpdateSupplierDTO } from "@/types/supplier";

/**
 * SupplierService - Handles all supplier-related API calls
 * All methods use withErrorHandling for consistent error handling and data extraction
 */
class SupplierService {
	/**
	 * Get paginated list of suppliers
	 * @param filters - Pagination and search filters
	 * @returns Promise with success/error result containing suppliers array and pagination
	 */
	getSuppliers = withErrorHandling(
		async (filters?: {
			page?: number;
			size?: number;
			search?: string;
			supplierType?: string;
			sortBy?: string;
			order?: string;
		}) => {
			// Build query string using URLSearchParams
			const params = new URLSearchParams();
			if (filters?.page !== undefined)
				params.append("page", filters.page.toString());
			if (filters?.size) params.append("size", filters.size.toString());
			if (filters?.search) params.append("search", filters.search);
			if (filters?.supplierType)
				params.append("supplierType", filters.supplierType);
			if (filters?.sortBy) params.append("sortBy", filters.sortBy);
			if (filters?.order) params.append("order", filters.order);

			const queryString = params.toString();
			const url = queryString
				? `/suppliers?${queryString}`
				: "/suppliers";

			return await apiService.get(url);
		},
	);

	/**
	 * Get supplier by ID
	 * @param id - Supplier UUID
	 * @returns Promise with success/error result containing supplier detail data
	 */
	getSupplierById = withErrorHandling(async (id: string) => {
		return await apiService.get(`/suppliers/${id}`);
	});

	/**
	 * Create new supplier
	 * @param data - Supplier creation data
	 * @returns Promise with success/error result containing created supplier
	 */
	createSupplier = withErrorHandling(async (data: CreateSupplierDTO) => {
		return await apiService.post("/suppliers", data);
	});

	/**
	 * Update existing supplier
	 * @param id - Supplier UUID
	 * @param data - Partial supplier update data
	 * @returns Promise with success/error result containing updated supplier
	 */
	updateSupplier = withErrorHandling(
		async (id: string, data: UpdateSupplierDTO) => {
			return await apiService.put(`/suppliers/${id}`, data);
		},
	);

	/**
	 * Delete supplier
	 * @param id - Supplier UUID
	 * @returns Promise with success/error result
	 */
	deleteSupplier = withErrorHandling(async (id: string) => {
		return await apiService.delete(`/suppliers/${id}`);
	});

	/**
	 * Get products from a supplier
	 * @param supplierId - Supplier UUID
	 * @param filters - Pagination filters
	 * @returns Promise with success/error result containing products array
	 */
	getSupplierProducts = withErrorHandling(
		async (
			supplierId: string,
			filters?: {
				page?: number;
				size?: number;
			},
		) => {
			const params = new URLSearchParams();
			if (filters?.page !== undefined)
				params.append("page", filters.page.toString());
			if (filters?.size) params.append("size", filters.size.toString());

			const queryString = params.toString();
			const url = queryString
				? `/suppliers/${supplierId}/products?${queryString}`
				: `/suppliers/${supplierId}/products`;

			return await apiService.get(url);
		},
	);
}

export const supplierService = new SupplierService();
