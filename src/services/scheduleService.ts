import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type {
	ShiftRoleConfig,
	CreateShiftRoleConfigDTO,
	UpdateShiftRoleConfigDTO,
	WorkShift,
	CreateWorkShiftDTO,
	UpdateWorkShiftDTO,
	WorkScheduleResponse,
	GetWorkSchedulesFilters,
	AssignStaffDTO,
	AssignStaffResponse,
	RemoveStaffDTO,
	RemoveStaffResponse,
} from "@/types/schedule";

class ScheduleService {
	// ==================== Shift Role Configs ====================

	/**
	 * Get all role configs
	 * @param isActive - Filter by active status
	 */
	getRoleConfigs = withErrorHandling(
		async (isActive?: boolean): Promise<ShiftRoleConfig[]> => {
			const params = new URLSearchParams();
			if (isActive !== undefined) {
				params.append("isActive", isActive.toString());
			}

			const queryString = params.toString();
			const url = queryString
				? `/shift-role-configs?${queryString}`
				: "/shift-role-configs";

			return await apiService.get(url);
		},
	);

	/**
	 * Create a new role config
	 */
	createRoleConfig = withErrorHandling(
		async (data: CreateShiftRoleConfigDTO) => {
			return await apiService.post("/shift-role-configs", data);
		},
	);

	/**
	 * Update an existing role config
	 * @param id - Role config ID
	 * @param data - Updated role config data
	 */
	updateRoleConfig = withErrorHandling(
		async (id: string, data: UpdateShiftRoleConfigDTO) => {
			return await apiService.put(`/shift-role-configs/${id}`, data);
		},
	);

	/**
	 * Delete a role config (soft delete - sets isActive to false)
	 * @param id - Role config ID
	 */
	deleteRoleConfig = withErrorHandling(async (id: string) => {
		return await apiService.delete(`/shift-role-configs/${id}`);
	});

	// ==================== Work Shifts ====================

	/**
	 * Get all work shifts
	 * @param isActive - Filter by active status
	 */
	getWorkShifts = withErrorHandling(
		async (isActive?: boolean): Promise<WorkShift[]> => {
			const params = new URLSearchParams();
			if (isActive !== undefined) {
				params.append("isActive", isActive.toString());
			}

			const queryString = params.toString();
			const url = queryString
				? `/work-shifts?${queryString}`
				: "/work-shifts";

			return await apiService.get(url);
		},
	);

	/**
	 * Create a new shift template
	 */
	createWorkShift = withErrorHandling(async (data: CreateWorkShiftDTO) => {
		return await apiService.post("/work-shift-templates", data);
	});

	/**
	 * Update a shift template
	 * @param id - Work shift ID
	 * @param data - Updated shift data
	 */
	updateWorkShift = withErrorHandling(
		async (id: string, data: UpdateWorkShiftDTO) => {
			return await apiService.put(`/work-shift-templates/${id}`, data);
		},
	);

	/**
	 * Delete a shift template (soft delete)
	 * @param id - Work shift ID
	 * @param data - Shift data (same as update but with isActive: false)
	 */
	deleteWorkShift = withErrorHandling(
		async (id: string, data: Omit<UpdateWorkShiftDTO, "isActive">) => {
			return await apiService.put(`/work-shift-templates/${id}`, {
				...data,
				is_active: false,
			});
		},
	);

	// ==================== Work Schedules ====================

	/**
	 * Get work schedules with filters
	 * @param filters - Filter parameters (sent as query params)
	 */
	getWorkSchedules = withErrorHandling(
		async (
			filters: GetWorkSchedulesFilters,
		): Promise<WorkScheduleResponse[]> => {
			const params = new URLSearchParams();

			Object.entries(filters).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					params.append(key, String(value));
				}
			});

			return await apiService.get(`/work-schedules?${params.toString()}`);
		},
	);
	/**
	 * Assign staff to shifts
	 * @param data - Assignment data
	 */
	assignStaff = withErrorHandling(
		async (data: AssignStaffDTO): Promise<AssignStaffResponse> => {
			return await apiService.post("/work-schedules", data);
		},
	);

	/**
	 * Remove staff from shifts
	 * @param data - Removal data
	 */
	removeStaff = withErrorHandling(
		async (data: RemoveStaffDTO): Promise<RemoveStaffResponse> => {
			return await apiService.delete("/work-schedules", { data });
		},
	);
}

export const scheduleService = new ScheduleService();
