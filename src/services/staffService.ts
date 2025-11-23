import type {
	Staff,
	StaffDetail,
	UpdateStaffData,
	WorkSchedule,
} from "@/types";

// Mock detailed staff data
const mockStaffDetails: Record<string, StaffDetail> = {
	"1": {
		id: "1",
		name: "Trần Thị Bé",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
		phone: "0912345678",
		email: "tranbe@5tmart.com",
		address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
		dateOfBirth: "1998-05-15",
		hireDate: "2022-01-10",
		salary: 8000000,
		workDays: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
		status: "active",
	},
	"2": {
		id: "2",
		name: "Nguyễn Văn An",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Chiều: 13:00 - 17:00",
		phone: "0923456789",
		email: "nguyenan@5tmart.com",
		address: "456 Lê Lợi, Quận 3, TP.HCM",
		dateOfBirth: "1995-08-20",
		hireDate: "2021-06-15",
		salary: 10000000,
		workDays: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"],
		status: "active",
	},
	"3": {
		id: "3",
		name: "Lê Thị Hương",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Tối: 18:00 - 22:00",
		phone: "0934567890",
		email: "lehuong@5tmart.com",
		address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
		dateOfBirth: "2000-03-10",
		hireDate: "2023-09-01",
		salary: 5000000,
		workDays: ["Thứ 6", "Thứ 7", "Chủ nhật"],
		status: "active",
	},
};

// Mock data cho nhân viên
const mockStaffData: Staff[] = [
	{
		id: "1",
		name: "Trần Thị Bé",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "2",
		name: "Nguyễn Văn An",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "3",
		name: "Lê Thị Hương",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Tối: 18:00 - 22:00",
	},
	{
		id: "4",
		name: "Phạm Minh Tuấn",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "5",
		name: "Hoàng Thu Hà",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "6",
		name: "Đỗ Văn Công",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "7",
		name: "Vũ Thị Mai",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Tối: 18:00 - 22:00",
	},
	{
		id: "8",
		name: "Bùi Văn Đức",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "9",
		name: "Ngô Thị Lan",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "10",
		name: "Trương Văn Hải",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "11",
		name: "Đinh Thị Ngọc",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Tối: 18:00 - 22:00",
	},
	{
		id: "12",
		name: "Lý Văn Minh",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "13",
		name: "Phan Thị Thanh",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "14",
		name: "Võ Văn Tùng",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Tối: 18:00 - 22:00",
	},
	{
		id: "15",
		name: "Dương Thị Kim",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "16",
		name: "Hồ Văn Quân",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "17",
		name: "Mai Thị Hoa",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Tối: 18:00 - 22:00",
	},
	{
		id: "18",
		name: "Đặng Văn Long",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "19",
		name: "Tô Thị Phương",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "20",
		name: "Châu Văn Nam",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Tối: 18:00 - 22:00",
	},
	{
		id: "21",
		name: "Lương Thị Xuân",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "22",
		name: "Cao Văn Đạt",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Chiều: 13:00 - 17:00",
	},
	{
		id: "23",
		name: "Huỳnh Thị My",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Tối: 18:00 - 22:00",
	},
	{
		id: "24",
		name: "Nguyễn Văn Bình",
		position: "Nhân viên bán hàng",
		employmentType: "Fulltime",
		shift: "Sáng: 7:00 - 11:00",
	},
	{
		id: "25",
		name: "Trần Thị Nga",
		position: "Nhân viên bán hàng",
		employmentType: "Partime",
		shift: "Chiều: 13:00 - 17:00",
	},
	// Warehouse staff
	{
		id: "26",
		name: "Nguyễn Văn Kho",
		position: "Nhân viên kho",
		employmentType: "Fulltime",
		shift: "Sáng: 6:00 - 12:00",
	},
	{
		id: "27",
		name: "Phạm Thị Kho",
		position: "Nhân viên kho",
		employmentType: "Fulltime",
		shift: "Chiều: 12:00 - 18:00",
	},
	{
		id: "28",
		name: "Lê Văn Kho",
		position: "Nhân viên kho",
		employmentType: "Partime",
		shift: "Sáng: 6:00 - 12:00",
	},
	{
		id: "29",
		name: "Hoàng Thị Kho",
		position: "Nhân viên kho",
		employmentType: "Partime",
		shift: "Chiều: 12:00 - 18:00",
	},
];

/**
 * Service để quản lý nhân viên
 */
export const staffService = {
	/**
	 * Lấy danh sách tất cả nhân viên
	 */
	getAllStaff: async (): Promise<Staff[]> => {
		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 300));
		return mockStaffData;
	},

	/**
	 * Lấy thông tin nhân viên theo ID
	 */
	getStaffById: async (id: string): Promise<Staff | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockStaffData.find((staff) => staff.id === id);
	},

	/**
	 * Lấy thông tin chi tiết nhân viên theo ID
	 */
	getStaffDetailById: async (
		id: string,
	): Promise<StaffDetail | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		// Return detailed data if exists, otherwise return basic data
		if (mockStaffDetails[id]) {
			return mockStaffDetails[id];
		}
		// Fallback: create basic detail from staff data
		const basicStaff = mockStaffData.find((staff) => staff.id === id);
		if (basicStaff) {
			return {
				...basicStaff,
				phone: "N/A",
				email: "N/A",
				status: "active" as const,
			};
		}
		return undefined;
	},

	/**
	 * Tìm kiếm nhân viên theo tên
	 */
	searchStaff: async (query: string): Promise<Staff[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		const lowerQuery = query.toLowerCase();
		return mockStaffData.filter((staff) =>
			staff.name.toLowerCase().includes(lowerQuery),
		);
	},

	/**
	 * Lọc nhân viên theo loại hình làm việc
	 */
	filterByEmploymentType: async (
		type: "Fulltime" | "Partime",
	): Promise<Staff[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockStaffData.filter((staff) => staff.employmentType === type);
	},

	/**
	 * Cập nhật thông tin nhân viên
	 */
	updateStaff: async (
		id: string,
		data: UpdateStaffData,
	): Promise<StaffDetail | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Update in mockStaffDetails if exists
		if (mockStaffDetails[id]) {
			mockStaffDetails[id] = {
				...mockStaffDetails[id],
				...data,
			};
			return mockStaffDetails[id];
		}

		// Update in mockStaffData
		const staffIndex = mockStaffData.findIndex((s) => s.id === id);
		if (staffIndex !== -1) {
			mockStaffData[staffIndex] = {
				...mockStaffData[staffIndex],
				...data,
			};
			return {
				...mockStaffData[staffIndex],
				phone: data.phone || "N/A",
				email: data.email || "N/A",
				status: data.status || "active",
			};
		}

		return undefined;
	},

	/**
	 * Thêm nhân viên mới
	 */
	addStaff: async (staff: Omit<Staff, "id">): Promise<Staff> => {
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Generate new ID
		const newId = (mockStaffData.length + 1).toString();

		const newStaff: Staff = {
			id: newId,
			...staff,
		};

		// Add to mock data
		mockStaffData.push(newStaff);

		return newStaff;
	},

	/**
	 * Xóa nhân viên
	 */
	deleteStaff: async (id: string): Promise<boolean> => {
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Find index in mockStaffData
		const staffIndex = mockStaffData.findIndex((s) => s.id === id);
		if (staffIndex !== -1) {
			mockStaffData.splice(staffIndex, 1);
			// Also remove from detailed data if exists
			if (mockStaffDetails[id]) {
				delete mockStaffDetails[id];
			}
			return true;
		}

		return false;
	},

	/**
	 * Lấy lịch làm việc của nhân viên từ scheduleService
	 */
	getWorkSchedule: async (
		id: string,
		month?: number,
		year?: number,
	): Promise<WorkSchedule[]> => {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const currentDate = new Date();
		const targetMonth = month || currentDate.getMonth() + 1;
		const targetYear = year || currentDate.getFullYear();

		// Import scheduleService để lấy dữ liệu thật
		const { scheduleService } = await import("./scheduleService");

		// Get all assignments for the month
		const firstDay = new Date(targetYear, targetMonth - 1, 1);
		const lastDay = new Date(targetYear, targetMonth, 0);

		const weekSchedule = await scheduleService.getWeekSchedule(
			firstDay.toISOString().split("T")[0],
			lastDay.toISOString().split("T")[0],
		);

		// Filter assignments for this staff and convert to WorkSchedule format
		const staffAssignments = weekSchedule.assignments.filter(
			(assignment) => assignment.staffId === id,
		);

		// Map shift to time ranges
		const shiftTimeMap: Record<string, { start: string; end: string }> = {
			morning: { start: "07:00", end: "11:00" },
			afternoon: { start: "13:00", end: "17:00" },
		};

		const schedule: WorkSchedule[] = staffAssignments.map((assignment) => ({
			date: assignment.date,
			shift: assignment.shift,
			startTime: shiftTimeMap[assignment.shift].start,
			endTime: shiftTimeMap[assignment.shift].end,
			status: assignment.status,
			notes: assignment.notes,
		}));

		return schedule;
	},
};
