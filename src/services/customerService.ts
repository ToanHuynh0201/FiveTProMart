import type { Customer, CustomerDetail, UpdateCustomerData } from "@/types";

// Mock detailed customer data
const mockCustomerDetails: Record<string, CustomerDetail> = {
	"1": {
		id: "1",
		name: "Nguyễn Văn An",
		phone: "0901234567",
		gender: "Nam",
		loyaltyPoints: 1250,
		email: "nguyenvanan@email.com",
		address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
		dateOfBirth: "1990-05-15",
		registeredDate: "2023-01-10",
		totalSpent: 15000000,
		purchaseCount: 45,
		lastPurchaseDate: "2024-11-25",
		status: "active",
	},
	"2": {
		id: "2",
		name: "Trần Thị Bích",
		phone: "0912345678",
		gender: "Nữ",
		loyaltyPoints: 2100,
		email: "tranthibich@email.com",
		address: "456 Lê Lợi, Quận 3, TP.HCM",
		dateOfBirth: "1995-08-20",
		registeredDate: "2022-06-15",
		totalSpent: 25000000,
		purchaseCount: 78,
		lastPurchaseDate: "2024-11-26",
		status: "active",
	},
	"3": {
		id: "3",
		name: "Lê Hoàng Nam",
		phone: "0923456789",
		gender: "Nam",
		loyaltyPoints: 850,
		email: "lehoangnam@email.com",
		address: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
		dateOfBirth: "1988-03-10",
		registeredDate: "2023-09-01",
		totalSpent: 8500000,
		purchaseCount: 32,
		lastPurchaseDate: "2024-11-20",
		status: "active",
	},
};

// Mock customer data
const mockCustomerData: Customer[] = [
	{
		id: "1",
		name: "Nguyễn Văn An",
		phone: "0901234567",
		gender: "Nam",
		loyaltyPoints: 1250,
	},
	{
		id: "2",
		name: "Trần Thị Bích",
		phone: "0912345678",
		gender: "Nữ",
		loyaltyPoints: 2100,
	},
	{
		id: "3",
		name: "Lê Hoàng Nam",
		phone: "0923456789",
		gender: "Nam",
		loyaltyPoints: 850,
	},
	{
		id: "4",
		name: "Phạm Thị Hương",
		phone: "0934567890",
		gender: "Nữ",
		loyaltyPoints: 1500,
	},
	{
		id: "5",
		name: "Hoàng Văn Tùng",
		phone: "0945678901",
		gender: "Nam",
		loyaltyPoints: 950,
	},
	{
		id: "6",
		name: "Vũ Thị Mai",
		phone: "0956789012",
		gender: "Nữ",
		loyaltyPoints: 1800,
	},
	{
		id: "7",
		name: "Đỗ Minh Tuấn",
		phone: "0967890123",
		gender: "Nam",
		loyaltyPoints: 1200,
	},
	{
		id: "8",
		name: "Ngô Thị Lan",
		phone: "0978901234",
		gender: "Nữ",
		loyaltyPoints: 2300,
	},
	{
		id: "9",
		name: "Bùi Văn Hải",
		phone: "0989012345",
		gender: "Nam",
		loyaltyPoints: 750,
	},
	{
		id: "10",
		name: "Trương Thị Ngọc",
		phone: "0990123456",
		gender: "Nữ",
		loyaltyPoints: 1650,
	},
	{
		id: "11",
		name: "Đinh Văn Quân",
		phone: "0901234568",
		gender: "Nam",
		loyaltyPoints: 1100,
	},
	{
		id: "12",
		name: "Lý Thị Thanh",
		phone: "0912345679",
		gender: "Nữ",
		loyaltyPoints: 1950,
	},
	{
		id: "13",
		name: "Phan Văn Long",
		phone: "0923456780",
		gender: "Nam",
		loyaltyPoints: 880,
	},
	{
		id: "14",
		name: "Võ Thị Kim",
		phone: "0934567891",
		gender: "Nữ",
		loyaltyPoints: 1400,
	},
	{
		id: "15",
		name: "Dương Văn Minh",
		phone: "0945678902",
		gender: "Nam",
		loyaltyPoints: 1050,
	},
	{
		id: "16",
		name: "Hồ Thị Phương",
		phone: "0956789013",
		gender: "Nữ",
		loyaltyPoints: 2200,
	},
	{
		id: "17",
		name: "Mai Văn Đức",
		phone: "0967890124",
		gender: "Nam",
		loyaltyPoints: 920,
	},
	{
		id: "18",
		name: "Đặng Thị Hoa",
		phone: "0978901235",
		gender: "Nữ",
		loyaltyPoints: 1750,
	},
	{
		id: "19",
		name: "Tô Văn Nam",
		phone: "0989012346",
		gender: "Nam",
		loyaltyPoints: 1300,
	},
	{
		id: "20",
		name: "Châu Thị Xuân",
		phone: "0990123457",
		gender: "Nữ",
		loyaltyPoints: 2050,
	},
	{
		id: "21",
		name: "Lương Văn Tân",
		phone: "0901234569",
		gender: "Nam",
		loyaltyPoints: 800,
	},
	{
		id: "22",
		name: "Cao Thị My",
		phone: "0912345670",
		gender: "Nữ",
		loyaltyPoints: 1850,
	},
	{
		id: "23",
		name: "Huỳnh Văn Bình",
		phone: "0923456781",
		gender: "Nam",
		loyaltyPoints: 1150,
	},
	{
		id: "24",
		name: "Nguyễn Thị Nga",
		phone: "0934567892",
		gender: "Nữ",
		loyaltyPoints: 2400,
	},
	{
		id: "25",
		name: "Trần Văn Công",
		phone: "0945678903",
		gender: "Nam",
		loyaltyPoints: 950,
	},
];

/**
 * Service để quản lý khách hàng
 */
export const customerService = {
	/**
	 * Lấy danh sách tất cả khách hàng
	 */
	getAllCustomers: async (): Promise<Customer[]> => {
		// Simulate API call delay
		await new Promise((resolve) => setTimeout(resolve, 300));
		return mockCustomerData;
	},

	/**
	 * Lấy thông tin khách hàng theo ID
	 */
	getCustomerById: async (id: string): Promise<Customer | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockCustomerData.find((customer) => customer.id === id);
	},

	/**
	 * Lấy thông tin chi tiết khách hàng theo ID
	 */
	getCustomerDetailById: async (
		id: string,
	): Promise<CustomerDetail | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 300));
		// Return detailed data if exists, otherwise return basic data
		if (mockCustomerDetails[id]) {
			return mockCustomerDetails[id];
		}
		// Fallback: create basic detail from customer data
		const basicCustomer = mockCustomerData.find(
			(customer) => customer.id === id,
		);
		if (basicCustomer) {
			return {
				...basicCustomer,
				email: "N/A",
				status: "active" as const,
			};
		}
		return undefined;
	},

	/**
	 * Tìm kiếm khách hàng theo tên hoặc số điện thoại
	 */
	searchCustomers: async (query: string): Promise<Customer[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		const lowerQuery = query.toLowerCase();
		return mockCustomerData.filter(
			(customer) =>
				customer.name.toLowerCase().includes(lowerQuery) ||
				customer.phone.includes(query),
		);
	},

	/**
	 * Lọc khách hàng theo giới tính
	 */
	filterByGender: async (
		gender: "Nam" | "Nữ" | "Khác",
	): Promise<Customer[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockCustomerData.filter(
			(customer) => customer.gender === gender,
		);
	},

	/**
	 * Lọc khách hàng theo điểm tích lũy
	 */
	filterByLoyaltyPoints: async (
		minPoints: number,
		maxPoints?: number,
	): Promise<Customer[]> => {
		await new Promise((resolve) => setTimeout(resolve, 200));
		return mockCustomerData.filter((customer) => {
			const points = customer.loyaltyPoints;
			if (maxPoints !== undefined) {
				return points >= minPoints && points <= maxPoints;
			}
			return points >= minPoints;
		});
	},

	/**
	 * Cập nhật thông tin khách hàng
	 */
	updateCustomer: async (
		id: string,
		data: UpdateCustomerData,
	): Promise<CustomerDetail | undefined> => {
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Update in mockCustomerDetails if exists
		if (mockCustomerDetails[id]) {
			mockCustomerDetails[id] = {
				...mockCustomerDetails[id],
				...data,
			};
			return mockCustomerDetails[id];
		}

		// Update in mockCustomerData
		const customerIndex = mockCustomerData.findIndex((c) => c.id === id);
		if (customerIndex !== -1) {
			mockCustomerData[customerIndex] = {
				...mockCustomerData[customerIndex],
				...data,
			};
			return {
				...mockCustomerData[customerIndex],
				email: data.email || "N/A",
				status: data.status || "active",
			};
		}

		return undefined;
	},

	/**
	 * Thêm khách hàng mới
	 */
	addCustomer: async (customer: Omit<Customer, "id">): Promise<Customer> => {
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Generate new ID
		const newId = (mockCustomerData.length + 1).toString();

		const newCustomer: Customer = {
			id: newId,
			...customer,
		};

		// Add to mock data
		mockCustomerData.push(newCustomer);

		return newCustomer;
	},

	/**
	 * Xóa khách hàng
	 */
	deleteCustomer: async (id: string): Promise<boolean> => {
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Find index in mockCustomerData
		const customerIndex = mockCustomerData.findIndex((c) => c.id === id);
		if (customerIndex !== -1) {
			mockCustomerData.splice(customerIndex, 1);
			// Also remove from detailed data if exists
			if (mockCustomerDetails[id]) {
				delete mockCustomerDetails[id];
			}
			return true;
		}

		return false;
	},
};
