/**
 * Customer type matching backend CustomerResponse.java EXACTLY
 * Backend is source of truth - DO NOT add fields the backend doesn't send
 */
export interface Customer {
	customerId: string;
	fullName: string;
	gender: string | null;
	dateOfBirth: string | null;
	phoneNumber: string;
	registrationDate: string | null;
	loyaltyPoints: number;
}

export interface CustomerDetail extends Customer {}

/**
 * Request type for creating/updating customers
 * Matches backend CreateCustomerRequest.java
 */
export interface UpdateCustomerData {
	fullName?: string;
	phoneNumber?: string;
	gender?: string;
	dateOfBirth?: string | null;
}
