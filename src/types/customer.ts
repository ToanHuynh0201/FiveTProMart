export interface Customer {
	id: string;
	name: string;
	phone: string;
	gender: "Nam" | "Nữ" | "Khác";
	loyaltyPoints: number;
	// Extended details
	email?: string;
	address?: string;
	dateOfBirth?: string;
	registeredDate?: string;
	totalSpent?: number;
	purchaseCount?: number;
	lastPurchaseDate?: string;
	status?: "active" | "inactive";
}

export interface CustomerDetail extends Customer {}

export interface UpdateCustomerData {
	name?: string;
	phone?: string;
	email?: string;
	address?: string;
	gender?: "Nam" | "Nữ" | "Khác";
	loyaltyPoints?: number;
	dateOfBirth?: string;
	status?: "active" | "inactive";
}
