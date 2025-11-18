/**
 * Storage utilities for handling localStorage operations safely
 */

/**
 * Safely get item from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
export const getStorageItem = (key: string, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

/**
 * Safely set item in localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export const setStorageItem = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Error writing to localStorage key "${key}":`, error);
        return false;
    }
};

/**
 * Safely remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export const removeStorageItem = (key: string) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.warn(`Error removing localStorage key "${key}":`, error);
        return false;
    }
};

/**
 * Clear all storage items
 * @param {string[]} keys - Array of keys to remove
 * @returns {boolean} Success status
 */
export const clearStorageItems = (keys: string[]) => {
    try {
        keys.forEach((key) => localStorage.removeItem(key));
        return true;
    } catch (error) {
        console.warn("Error clearing localStorage items:", error);
        return false;
    }
};

/**
 * Check if localStorage is available
 * @returns {boolean} Availability status
 */
export const isStorageAvailable = () => {
    try {
        const test = "__storage_test__";
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch {
        return false;
    }
};
