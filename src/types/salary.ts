/**
 * Salary Types - Staff salary management
 */

import type { AccountType } from "./staff";

// ============================================================
// Salary Role Config
// ============================================================

export interface SalaryRoleConfig {
	id: string;
	role: AccountType; // "SalesStaff" or "WarehouseStaff"
	hourlySalary: number; // Hourly rate
	updatedAt: string; // Format: dd-MM-yyyy
}

export interface UpdateSalaryConfigRequest {
	configs: Array<{
		role: AccountType;
		hourlyRate: number;
	}>;
}

export interface SalaryConfigResponse {
	role: AccountType;
	hourlyRate: number;
	updatedAt: string; // Format: dd-MM-yyyy
}

// ============================================================
// Daily Salary
// ============================================================

export interface DailySalary {
	_id: string;
	userId: string;
	date: string; // Format: dd-MM-yyyy
	role: AccountType;
	hourlyRate: number;
	workHours: number;
	dailySalary: number;
	createdAt: string;
}

export interface CalculateDailySalaryRequest {
	date: string; // Format: dd-MM-yyyy
}

export interface CalculateDailySalaryResponse {
	processedDate: string; // Format: dd-MM-yyyy
	status: "SUCCESS" | "FAILED";
}

// ============================================================
// Salary Reports
// ============================================================

export interface SalaryReportDateRange {
	startDate: string; // Format: dd-MM-yyyy
	endDate: string; // Format: dd-MM-yyyy
}

export interface SalaryReportSummary {
	totalSalaryCost: number; // Tổng lương phải trả
	totalWorkHours: number; // Tổng số giờ công
	totalStaffs: number; // Tổng số nhân viên
}

export interface StaffSalaryDetail {
	userId: string;
	fullName: string;
	role: AccountType;
	totalWorkHours: number;
	totalSalary: number;
}

export interface SalaryReport {
	range: SalaryReportDateRange;
	summary: SalaryReportSummary;
	staffSalaryDetails: StaffSalaryDetail[];
}

// ============================================================
// Individual Staff Salary Report
// ============================================================

export interface DailySalaryDetail {
	date: string; // Format: dd-MM-yyyy
	workHours: number;
	hourlyRate: number;
	dailyAmount: number;
}

export interface StaffSalaryReport {
	userId: string;
	fullName: string;
	role: AccountType;
	range: SalaryReportDateRange;
	summary: {
		totalSalary: number;
		totalWorkHours: number;
	};
	dailyDetails: DailySalaryDetail[];
}
