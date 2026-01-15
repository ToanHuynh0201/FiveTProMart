import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type { CreateStaffDTO, UpdateStaffDTO } from "@/types/staff";

/**
 * StaffService - Handles all staff-related API calls
 * All methods use withErrorHandling for consistent error handling and data extraction
 */
class StaffService {
	/**
	 * Get paginated list of staff members
	 * @param filters - Pagination and search filters
	 * @returns Promise with success/error result containing staff array and pagination
	 */
	getStaffs = withErrorHandling(
		async (filters?: {
			page?: number; // Zero-based (convert from 1-based UI)
			size?: number;
			search?: string; // Searches fullName, phoneNumber, userId
			accountType?: string; // "SalesStaff" or "WarehouseStaff"
			sortBy?: string; // Default: "fullName"
			order?: string; // "asc" or "desc"
		}) => {
			// Build query string using URLSearchParams
			const params = new URLSearchParams();
			if (filters?.page !== undefined)
				params.append("page", filters.page.toString());
			if (filters?.size) params.append("size", filters.size.toString());
			if (filters?.search) params.append("search", filters.search);
			if (filters?.accountType)
				params.append("accountType", filters.accountType);
			if (filters?.sortBy) params.append("sortBy", filters.sortBy);
			if (filters?.order) params.append("order", filters.order);

			const queryString = params.toString();
			const url = queryString ? `/staffs?${queryString}` : "/staffs";

			return await apiService.get(url);
		},
	);

	/**
	 * Get staff member by ID
	 * @param id - Staff profileId
	 * @returns Promise with success/error result containing staff data
	 */
	getStaffById = withErrorHandling(async (id: string) => {
		return await apiService.get(`/staffs/${id}`);
	});

	/**
	 * Create new staff member
	 * @param data - Staff creation data including username and password
	 * @returns Promise with success/error result containing created staff
	 */
	createStaff = withErrorHandling(async (data: CreateStaffDTO) => {
		return await apiService.post("/staffs", data);
	});

	/**
	 * Update existing staff member
	 * @param id - Staff profileId
	 * @param data - Partial staff update data
	 * @returns Promise with success/error result containing updated staff
	 */
	updateStaff = withErrorHandling(
		async (id: string, data: UpdateStaffDTO) => {
			return await apiService.put(`/staffs/${id}`, data);
		},
	);

	/**
	 * Delete staff member
	 * @param id - Staff profileId
	 * @returns Promise with success/error result
	 */
	deleteStaff = withErrorHandling(async (id: string) => {
		return await apiService.delete(`/staffs/${id}`);
	});
}

export const staffService = new StaffService();
