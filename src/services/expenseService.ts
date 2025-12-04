/**
 * Expense Service
 * Handles expense data management and reporting
 */

import type {
	Expense,
	ExpenseReport,
	ExpenseDataPoint,
	DateRangeFilter,
	ExpenseCategory,
} from "@/types/reports";

// Mock data storage - Generate realistic expense data
const generateMockExpenses = (): Expense[] => {
	const expenses: Expense[] = [];
	let idCounter = 1;

	// Tháng 12/2025
	expenses.push(
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "electricity",
			description: "Tiền điện tháng 12",
			amount: 3500000,
			date: new Date("2025-12-03"),
			createdBy: "Admin",
			notes: "Hóa đơn EVN",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "water",
			description: "Tiền nước tháng 12",
			amount: 800000,
			date: new Date("2025-12-03"),
			createdBy: "Admin",
			notes: "Hóa đơn nước sạch",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "supplies",
			description: "Mua túi nilon, túi giấy",
			amount: 1200000,
			date: new Date("2025-12-02"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "repairs",
			description: "Sửa điều hòa phòng làm việc",
			amount: 1500000,
			date: new Date("2025-12-01"),
			createdBy: "Admin",
		}
	);

	// Tháng 11/2025
	expenses.push(
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "electricity",
			description: "Tiền điện tháng 11",
			amount: 3200000,
			date: new Date("2025-11-28"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "water",
			description: "Tiền nước tháng 11",
			amount: 750000,
			date: new Date("2025-11-28"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "repairs",
			description: "Sửa máy lạnh phòng kho",
			amount: 2500000,
			date: new Date("2025-11-25"),
			createdBy: "Admin",
			notes: "Thay gas, vệ sinh",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "supplies",
			description: "Giấy in, bút viết văn phòng",
			amount: 450000,
			date: new Date("2025-11-20"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "repairs",
			description: "Sửa cửa kính bị vỡ",
			amount: 1800000,
			date: new Date("2025-11-15"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "supplies",
			description: "Nước rửa tay, khăn giấy",
			amount: 350000,
			date: new Date("2025-11-10"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "other",
			description: "Phí bảo trì camera an ninh",
			amount: 2000000,
			date: new Date("2025-11-05"),
			createdBy: "Admin",
		}
	);

	// Tháng 10/2025
	expenses.push(
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "electricity",
			description: "Tiền điện tháng 10",
			amount: 3100000,
			date: new Date("2025-10-28"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "water",
			description: "Tiền nước tháng 10",
			amount: 720000,
			date: new Date("2025-10-28"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "other",
			description: "Phí bảo trì hệ thống POS",
			amount: 5000000,
			date: new Date("2025-10-25"),
			createdBy: "Admin",
			notes: "Phí hàng quý",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "supplies",
			description: "Vật tư vệ sinh",
			amount: 980000,
			date: new Date("2025-10-20"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "repairs",
			description: "Sửa máy in",
			amount: 650000,
			date: new Date("2025-10-15"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "other",
			description: "Phí Internet tháng 10",
			amount: 500000,
			date: new Date("2025-10-05"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "supplies",
			description: "Mua bóng đèn thay thế",
			amount: 300000,
			date: new Date("2025-10-08"),
			createdBy: "Admin",
		}
	);

	// Tháng 9/2025
	expenses.push(
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "electricity",
			description: "Tiền điện tháng 9",
			amount: 2900000,
			date: new Date("2025-09-28"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "water",
			description: "Tiền nước tháng 9",
			amount: 680000,
			date: new Date("2025-09-28"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "repairs",
			description: "Sơn lại tường cửa hàng",
			amount: 4500000,
			date: new Date("2025-09-20"),
			createdBy: "Admin",
		},
		{
			id: `EXP${String(idCounter++).padStart(3, "0")}`,
			category: "supplies",
			description: "Mua thùng rác mới",
			amount: 450000,
			date: new Date("2025-09-15"),
			createdBy: "Admin",
		}
	);

	return expenses;
};

let mockExpenses: Expense[] = generateMockExpenses();

/**
 * Get date range based on filter type
 */
const getDateRange = (
	filter: DateRangeFilter
): { startDate: Date; endDate: Date } => {
	const endDate = new Date();
	let startDate = new Date();

	switch (filter.type) {
		case "today":
			startDate = new Date();
			startDate.setHours(0, 0, 0, 0);
			break;
		case "week":
			startDate = new Date();
			startDate.setDate(startDate.getDate() - 7);
			break;
		case "month":
			startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 1);
			break;
		case "quarter":
			startDate = new Date();
			startDate.setMonth(startDate.getMonth() - 3);
			break;
		case "year":
			startDate = new Date();
			startDate.setFullYear(startDate.getFullYear() - 1);
			break;
		case "custom":
			if (filter.startDate && filter.endDate) {
				startDate = filter.startDate;
				return { startDate, endDate: filter.endDate };
			}
			break;
	}

	return { startDate, endDate };
};

/**
 * Generate expense data points for chart
 */
const generateExpenseDataPoints = (
	expenses: Expense[],
	startDate: Date,
	endDate: Date
): ExpenseDataPoint[] => {
	const dataMap = new Map<string, ExpenseDataPoint>();

	// Aggregate expenses by date and category
	expenses.forEach((expense) => {
		const expenseDate = new Date(expense.date);
		// Only include expenses within the date range
		if (expenseDate >= startDate && expenseDate <= endDate) {
			const dateStr = expenseDate.toISOString().split("T")[0];

			if (!dataMap.has(dateStr)) {
				dataMap.set(dateStr, {
					date: dateStr,
					electricity: 0,
					water: 0,
					supplies: 0,
					repairs: 0,
					other: 0,
					total: 0,
				});
			}

			const dataPoint = dataMap.get(dateStr)!;
			dataPoint[expense.category] += expense.amount;
			dataPoint.total += expense.amount;
		}
	});

	// Convert to array and sort by date
	return Array.from(dataMap.values()).sort((a, b) =>
		a.date.localeCompare(b.date)
	);
};

/**
 * Get expense report for a specific period
 */
export const getExpenseReport = async (
	period: DateRangeFilter
): Promise<ExpenseReport> => {
	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 500));

	const { startDate, endDate } = getDateRange(period);

	// Filter expenses within date range
	const filteredExpenses = mockExpenses.filter((expense) => {
		const expenseDate = new Date(expense.date);
		return expenseDate >= startDate && expenseDate <= endDate;
	});

	// Calculate totals by category
	const byCategory = {
		electricity: 0,
		water: 0,
		supplies: 0,
		repairs: 0,
		other: 0,
	};

	let totalExpense = 0;

	filteredExpenses.forEach((expense) => {
		byCategory[expense.category] += expense.amount;
		totalExpense += expense.amount;
	});

	// Calculate growth (compare with previous period)
	const previousStartDate = new Date(startDate);
	const previousEndDate = new Date(endDate);
	const periodDiff = endDate.getTime() - startDate.getTime();

	previousStartDate.setTime(previousStartDate.getTime() - periodDiff);
	previousEndDate.setTime(previousEndDate.getTime() - periodDiff);

	const previousExpenses = mockExpenses.filter((expense) => {
		const expenseDate = new Date(expense.date);
		return expenseDate >= previousStartDate && expenseDate <= previousEndDate;
	});

	const previousTotal = previousExpenses.reduce(
		(sum, exp) => sum + exp.amount,
		0
	);
	const growth =
		previousTotal > 0 ? ((totalExpense - previousTotal) / previousTotal) * 100 : 0;

	// Generate data points for chart
	const data = generateExpenseDataPoints(filteredExpenses, startDate, endDate);

	return {
		period,
		totalExpense,
		byCategory,
		data,
		growth,
		expenses: filteredExpenses.sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		),
	};
};

/**
 * Get all expenses
 */
export const getAllExpenses = async (): Promise<Expense[]> => {
	await new Promise((resolve) => setTimeout(resolve, 300));
	return [...mockExpenses].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
};

/**
 * Add new expense
 */
export const addExpense = async (
	expense: Omit<Expense, "id">
): Promise<Expense> => {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const newExpense: Expense = {
		...expense,
		id: `EXP${String(mockExpenses.length + 1).padStart(3, "0")}`,
	};

	mockExpenses.push(newExpense);
	return newExpense;
};

/**
 * Update expense
 */
export const updateExpense = async (
	id: string,
	updates: Partial<Expense>
): Promise<Expense> => {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const index = mockExpenses.findIndex((exp) => exp.id === id);
	if (index === -1) {
		throw new Error("Expense not found");
	}

	mockExpenses[index] = { ...mockExpenses[index], ...updates };
	return mockExpenses[index];
};

/**
 * Delete expense
 */
export const deleteExpense = async (id: string): Promise<void> => {
	await new Promise((resolve) => setTimeout(resolve, 300));

	const index = mockExpenses.findIndex((exp) => exp.id === id);
	if (index === -1) {
		throw new Error("Expense not found");
	}

	mockExpenses.splice(index, 1);
};

/**
 * Get expense category label in Vietnamese
 */
export const getExpenseCategoryLabel = (category: ExpenseCategory): string => {
	const labels: Record<ExpenseCategory, string> = {
		electricity: "Điện",
		water: "Nước",
		supplies: "Nhu yếu phẩm",
		repairs: "Sửa chữa",
		other: "Khác",
	};
	return labels[category];
};

/**
 * Get expense category color
 */
export const getExpenseCategoryColor = (category: ExpenseCategory): string => {
	const colors: Record<ExpenseCategory, string> = {
		electricity: "#F59E0B",
		water: "#3B82F6",
		supplies: "#10B981",
		repairs: "#EF4444",
		other: "#6B7280",
	};
	return colors[category];
};
