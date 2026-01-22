import apiService from "@/lib/api";
import type {
	SalaryRoleConfig,
	UpdateSalaryConfigRequest,
	SalaryConfigResponse,
	CalculateDailySalaryRequest,
	CalculateDailySalaryResponse,
	SalaryReportDateRange,
	SalaryReport,
	StaffSalaryReport,
} from "@/types/salary";

export const salaryService = {
	/**
	 * 1. Get current salary configs
	 * Endpoint: GET /api/v1/salary-configs
	 */
	async getSalaryConfigs(): Promise<{
		success: boolean;
		message: string;
		data: SalaryRoleConfig[];
	}> {
		return apiService.get("/salary-configs");
	},

	/**
	 * 2. Update salary configs
	 * Endpoint: PUT /api/v1/salary-configs
	 */
	async updateSalaryConfigs(
		request: UpdateSalaryConfigRequest,
	): Promise<{
		success: boolean;
		message: string;
		data: SalaryConfigResponse[];
	}> {
		return apiService.put("/salary-configs", request);
	},

	/**
	 * 3. Calculate Daily Salary
	 * Endpoint: POST /api/v1/salary/daily-salary
	 */
	async calculateDailySalary(
		request: CalculateDailySalaryRequest,
	): Promise<{
		success: boolean;
		message: string;
		data: CalculateDailySalaryResponse;
	}> {
		return apiService.post("/salary/daily-salary", request);
	},

	/**
	 * 4. Get salaries query (summary report)
	 * Endpoint: GET /api/v1/salary/salary-reports
	 */
	async getSalaryReport(params: SalaryReportDateRange): Promise<{
		success: boolean;
		message: string;
		data: SalaryReport;
	}> {
		return apiService.get(
			`/salary/salary-reports?startDate=${params.startDate}&endDate=${params.endDate}`,
		);
	},

	/**
	 * 5. Get salary by staff (individual report)
	 * Endpoint: GET /api/v1/salary/salary-reports/{id}
	 */
	async getStaffSalaryReport(
		staffId: string,
		params: SalaryReportDateRange,
	): Promise<{
		success: boolean;
		message: string;
		data: StaffSalaryReport;
	}> {
		return apiService.get(
			`/salary/salary-reports/${staffId}?startDate=${params.startDate}&endDate=${params.endDate}`,
		);
	},
};
