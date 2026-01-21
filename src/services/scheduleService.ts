import apiService from "@/lib/api";
import { withErrorHandling } from "@/utils/error";
import type {
	ShiftRoleConfig,
	CreateShiftRoleConfigDTO,
	WorkShift,
	CreateWorkShiftDTO,
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
			const url = queryString ? `/work-shifts?${queryString}` : "/work-shifts";

			return await apiService.get(url);
		},
	);

	/**
	 * Create a new shift template
	 */
	createWorkShift = withErrorHandling(async (data: CreateWorkShiftDTO) => {
		return await apiService.post("/work-shift-templates", data);
	});

	// ==================== Work Schedules ====================

	/**
	 * Get work schedules with filters
	 * @param filters - Filter parameters
	 */
	getWorkSchedules = withErrorHandling(
		async (filters: GetWorkSchedulesFilters): Promise<WorkScheduleResponse[]> => {
			const params = new URLSearchParams();

			// Required fields
			params.append("startDate", filters.startDate);
			params.append("endDate", filters.endDate);

			// Optional filters
			if (filters.profileId) {
				params.append("profileId", filters.profileId);
			}
			if (filters.workShiftId) {
				params.append("workShiftId", filters.workShiftId);
			}

			const queryString = params.toString();
			const url = `/work-schedules?${queryString}`;

			return await apiService.get(url);
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
