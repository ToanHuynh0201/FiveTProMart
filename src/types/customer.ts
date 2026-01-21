export interface Customer {
	customerId: string;
	fullName: string;
	gender: "Male" | "Female" | "Other";
	dateOfBirth: string; // Format: YYYY-MM-DD (ISO format for Java LocalDate)
	phoneNumber: string;
	registrationDate: string; // Format: DD-MM-YYYY (display from API)
	loyaltyPoints: number;
}

export interface CustomerDetail extends Customer {
	email?: string;
	address?: string;
	status?: "active" | "inactive";
	registeredDate?: string; // Display format
	purchaseCount?: number;
	lastPurchaseDate?: string;
	totalSpent?: number;
}

export interface CreateCustomerRequest {
	fullName: string;
	gender: "Male" | "Female" | "Other";
	dateOfBirth: string; // Format: YYYY-MM-DD (ISO format for Java LocalDate)
	phoneNumber: string;
}

export interface UpdateCustomerRequest {
	fullName?: string;
	gender?: "Male" | "Female" | "Other";
	dateOfBirth?: string; // Format: YYYY-MM-DD (ISO format for Java LocalDate)
	phoneNumber?: string;
}

// Legacy support - kept for backward compatibility
export interface UpdateCustomerData extends UpdateCustomerRequest {}