/**
 * Date format utilities for staff API
 *
 * API formats:
 * - Response: DD/MM/YYYY
 * - Request (Create/Update): YYYY-MM-DD (ISO 8601)
 * - HTML date input: YYYY-MM-DD
 */

/**
 * Convert from HTML date input format to API request format
 * @param date - Date in YYYY-MM-DD format (from HTML input)
 * @returns Date in YYYY-MM-DD format (ISO 8601 for API POST/PUT)
 */
export const formatDateForAPI = (date: string): string => {
	if (!date) return "";
	// HTML input already returns YYYY-MM-DD which is ISO 8601 format
	// Backend expects ISO 8601, so return as-is
	return date;
};

/**
 * Convert from API response format to HTML date input format
 * @param date - Date in DD/MM/YYYY format (from API response)
 * @returns Date in YYYY-MM-DD format (for HTML input)
 */
export const formatDateForInput = (date: string): string => {
	if (!date) return "";
	const [day, month, year] = date.split("/");
	if (!year || !month || !day) return "";
	return `${year}-${month}-${day}`;
};

/**
 * Format date for display (keep as-is from API or provide fallback)
 * @param date - Date in DD/MM/YYYY format (from API response)
 * @returns Formatted date string or "N/A"
 */
export const formatDateForDisplay = (date: string | null | undefined): string => {
	return date || "N/A";
};
