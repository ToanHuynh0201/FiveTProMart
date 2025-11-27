/**
 * Date and time utility functions
 */

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date: Date | string | number, options = {}) => {
	try {
		const dateObj = date instanceof Date ? date : new Date(date);
		return dateObj.toLocaleDateString("vi-VN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			...options,
		});
	} catch (error) {
		console.warn("Error formatting date:", error);
		return "Invalid Date";
	}
};

/**
 * Format time to locale string
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted time string
 */
export const formatTime = (date: Date | string | number, options = {}) => {
	try {
		const dateObj = date instanceof Date ? date : new Date(date);
		return dateObj.toLocaleTimeString("vi-VN", {
			hour: "2-digit",
			minute: "2-digit",
			...options,
		});
	} catch (error) {
		console.warn("Error formatting time:", error);
		return "Invalid Time";
	}
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date: Date | string | number) => {
	try {
		const dateObj = date instanceof Date ? date : new Date(date);
		const now = new Date();
		const diffInSeconds = Math.floor(
			(now.getTime() - dateObj.getTime()) / 1000,
		);

		if (diffInSeconds < 60) return "Just now";
		if (diffInSeconds < 3600)
			return `${Math.floor(diffInSeconds / 60)} minutes ago`;
		if (diffInSeconds < 86400)
			return `${Math.floor(diffInSeconds / 3600)} hours ago`;
		if (diffInSeconds < 2592000)
			return `${Math.floor(diffInSeconds / 86400)} days ago`;

		return formatDate(dateObj);
	} catch (error) {
		console.warn("Error getting relative time:", error);
		return "Unknown";
	}
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} Is today
 */
export const isToday = (date: Date | string | number) => {
	try {
		const dateObj = date instanceof Date ? date : new Date(date);
		const today = new Date();
		return dateObj.toDateString() === today.toDateString();
	} catch {
		return false;
	}
};

/**
 * Check if product is expired
 * @param {Date|string} expiryDate - Expiry date of the product
 * @returns {boolean} Is expired
 */
export const isExpired = (expiryDate?: Date | string | number) => {
	if (!expiryDate) return false;
	try {
		const expiry =
			expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		expiry.setHours(0, 0, 0, 0);
		return expiry < today;
	} catch {
		return false;
	}
};

/**
 * Check if product is expiring soon (within 7 days)
 * @param {Date|string} expiryDate - Expiry date of the product
 * @param {number} days - Number of days to check (default: 7)
 * @returns {boolean} Is expiring soon
 */
export const isExpiringSoon = (
	expiryDate?: Date | string | number,
	days: number = 7,
) => {
	if (!expiryDate) return false;
	try {
		const expiry =
			expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		expiry.setHours(0, 0, 0, 0);

		const diffInDays = Math.floor(
			(expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
		);

		return diffInDays >= 0 && diffInDays <= days;
	} catch {
		return false;
	}
};

/**
 * Get days until expiry
 * @param {Date|string} expiryDate - Expiry date of the product
 * @returns {number} Days until expiry (negative if expired)
 */
export const getDaysUntilExpiry = (expiryDate?: Date | string | number) => {
	if (!expiryDate) return Infinity;
	try {
		const expiry =
			expiryDate instanceof Date ? expiryDate : new Date(expiryDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		expiry.setHours(0, 0, 0, 0);

		return Math.floor(
			(expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
		);
	} catch {
		return Infinity;
	}
};

/**
 * Format expiry date with status
 * @param {Date|string} expiryDate - Expiry date of the product
 * @returns {Object} Formatted expiry info
 */
export const getExpiryStatus = (expiryDate?: Date | string | number) => {
	if (!expiryDate) {
		return {
			text: "Không có HSD",
			color: "gray.500",
			status: "no-expiry",
		};
	}

	const daysUntil = getDaysUntilExpiry(expiryDate);

	if (daysUntil < 0) {
		return {
			text: `Đã hết hạn ${Math.abs(daysUntil)} ngày`,
			color: "red.600",
			status: "expired",
		};
	}

	if (daysUntil === 0) {
		return {
			text: "Hết hạn hôm nay",
			color: "red.600",
			status: "expired-today",
		};
	}

	if (daysUntil <= 3) {
		return {
			text: `Còn ${daysUntil} ngày`,
			color: "red.500",
			status: "critical",
		};
	}

	if (daysUntil <= 7) {
		return {
			text: `Còn ${daysUntil} ngày`,
			color: "orange.500",
			status: "warning",
		};
	}

	return {
		text: formatDate(expiryDate),
		color: "gray.600",
		status: "normal",
	};
};
