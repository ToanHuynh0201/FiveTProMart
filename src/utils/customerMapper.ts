/**
 * Customer field mapping utilities
 * Provides helper functions to work with Customer objects using either old or new field names
 */

import type { Customer } from "@/types";

/**
 * Get customer ID (supports both customerId and legacy id field)
 */
export const getCustomerId = (customer: Customer): string => {
	return customer.customerId;
};

/**
 * Get customer full name (supports both fullName and legacy name field)
 */
export const getCustomerName = (customer: Customer): string => {
	return customer.fullName;
};

/**
 * Get customer phone number (supports both phoneNumber and legacy phone field)
 */
export const getCustomerPhone = (customer: Customer): string => {
	return customer.phoneNumber;
};

/**
 * Map gender from API format to display format
 */
export const mapGenderToDisplay = (gender: "Male" | "Female" | "Other"): "Nam" | "Nữ" | "Khác" => {
	const mapping = {
		"Male": "Nam" as const,
		"Female": "Nữ" as const,
		"Other": "Khác" as const,
	};
	return mapping[gender] || "Khác";
};

/**
 * Map gender from display format to API format
 */
export const mapGenderToAPI = (gender: "Nam" | "Nữ" | "Khác"): "Male" | "Female" | "Other" => {
	const mapping = {
		"Nam": "Male" as const,
		"Nữ": "Female" as const,
		"Khác": "Other" as const,
	};
	return mapping[gender] || "Other";
};

/**
 * Get customer gender in display format
 */
export const getCustomerGender = (customer: Customer): "Nam" | "Nữ" | "Khác" => {
	return mapGenderToDisplay(customer.gender);
};
