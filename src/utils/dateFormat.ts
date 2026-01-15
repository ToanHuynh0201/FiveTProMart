/**
 * Date format utilities for staff API
 *
 * API formats:
 * - Response: DD/MM/YYYY
 * - Request (Create/Update): DD-MM-YYYY
 * - HTML date input: YYYY-MM-DD
 */

/**
 * Convert from HTML date input format to API request format
 * @param date - Date in YYYY-MM-DD format (from HTML input)
 * @returns Date in DD-MM-YYYY format (for API POST/PUT)
 */
export const formatDateForAPI = (date: string): string => {
	if (!date) return "";
	const [year, month, day] = date.split("-");
	if (!year || !month || !day) return "";
	return `${day}-${month}-${year}`;
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
