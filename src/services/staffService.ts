import apiService from "@/lib/api";
import type { Staff } from "@/types";
import type { StaffFilters } from "@/types/filters";
import type { ApiResponse } from "@/types/api";
import { buildQueryParams } from "@/utils/queryParams";

export const staffService = {
	/**
	 * Fetch staff with server-side filtering and pagination
	 */
	async getStaff(filters: StaffFilters): Promise<ApiResponse<Staff>> {
		const params = buildQueryParams(filters);
		return apiService.get<ApiResponse<Staff>>(
			`/staff?${params.toString()}`,
		);
	},

	async getStaffById(id: string): Promise<Staff> {
		return apiService.get<Staff>(`/staff/${id}`);
	},

	async createStaff(data: Omit<Staff, "id">): Promise<Staff> {
		return apiService.post<Staff>("/staff", data);
	},

	async updateStaff(id: string, data: Partial<Staff>): Promise<Staff> {
		return apiService.put<Staff>(`/staff/${id}`, data);
	},

	async deleteStaff(id: string): Promise<void> {
		return apiService.delete(`/staff/${id}`);
	},
};
