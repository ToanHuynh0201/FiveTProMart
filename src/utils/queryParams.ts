/**
 * Build URL query parameters from filters object
 * @param filters - Object containing filter key-value pairs
 * @returns URLSearchParams object ready to be stringified
 */
export function buildQueryParams(
	filters: Record<string, any>,
): URLSearchParams {
	const params = new URLSearchParams();

	Object.entries(filters).forEach(([key, value]) => {
		// Skip undefined, null, empty string, and 'all' values
		if (
			value !== undefined &&
			value !== null &&
			value !== "" &&
			value !== "all"
		) {
			if (value instanceof Date) {
				// Convert Date to ISO string
				params.append(key, value.toISOString());
			} else if (Array.isArray(value)) {
				// Handle arrays by appending each value
				value.forEach((v) => params.append(key, v.toString()));
			} else {
				// Convert to string for all other types
				params.append(key, value.toString());
			}
		}
	});

	return params;
}
