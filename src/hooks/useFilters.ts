import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Filters interface for pagination and filtering
 */
export interface Filters {
	page: number;
	size: number;
	[key: string]: any;
}

/**
 * Hook return type for useFilters
 */
interface UseFiltersReturn<T extends Filters> {
	filters: T;
	debouncedFilters: T;
	loading: boolean;
	error: string | null;
	handleFilterChange: (key: keyof T, value: any) => void;
	handlePageChange: (newPage: number) => void;
	handlePageSizeChange: (newPageSize: number) => void;
	resetFilters: () => void;
	updateFilters: (newFilters: Partial<T>) => void;
	setError: (error: string | null) => void;
	setLoading: (loading: boolean) => void;
}

/**
 * Custom hook for managing filters with debouncing
 * @param initialFilters - Initial filter values
 * @param fetchFunction - Function to call when filters change
 * @param debounceDelay - Delay in milliseconds for debouncing (default: 500ms)
 * @returns Filter state and handlers
 */
export const useFilters = <T extends Filters = Filters>(
	initialFilters: Partial<T> = {},
	fetchFunction?: (filters: T) => Promise<void>,
	debounceDelay: number = 500,
): UseFiltersReturn<T> => {
	const [filters, setFilters] = useState<T>({
		page: 1,
		size: 10,
		...initialFilters,
	} as T);

	const [debouncedFilters, setDebouncedFilters] = useState<T>(filters);
	// Start with loading=true if fetchFunction is provided (data not yet loaded)
	const [loading, setLoading] = useState<boolean>(!!fetchFunction);
	const [error, setError] = useState<string | null>(null);
	
	// Use ref to store fetchFunction to avoid triggering re-renders
	// This prevents infinite loops when fetchFunction is defined inline
	const fetchFunctionRef = useRef(fetchFunction);
	fetchFunctionRef.current = fetchFunction;

	// Debounce the filters
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedFilters(filters);
		}, debounceDelay);

		return () => clearTimeout(timer);
	}, [filters, debounceDelay]);

	// Execute fetch function when debounced filters change
	// Only depends on debouncedFilters, not fetchFunction (via ref)
	useEffect(() => {
		const executeFetch = async () => {
			const fn = fetchFunctionRef.current;
			if (!fn) return;

			try {
				setLoading(true);
				setError(null);
				await fn(debouncedFilters);
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to fetch data";
				setError(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		executeFetch();
	}, [debouncedFilters]);

	// Handle filter changes
	const handleFilterChange = useCallback((key: keyof T, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
			// Reset to first page when filtering (except for page changes)
			...(key !== "page" && { page: 1 }),
		}));
	}, []);

	// Handle pagination
	const handlePageChange = useCallback(
		(newPage: number) => {
			const newFilters = { ...filters, page: newPage };
			setFilters(newFilters);
			setDebouncedFilters(newFilters); // Immediate update for pagination
		},
		[filters],
	);

	// Handle page size change
	const handlePageSizeChange = useCallback(
		(newPageSize: number) => {
			const newFilters = {
				...filters,
				pageSize: newPageSize,
				page: 1,
			};
			setFilters(newFilters);
			setDebouncedFilters(newFilters); // Immediate update for page size
		},
		[filters],
	);

	// Reset filters
	const resetFilters = useCallback(() => {
		const resetFilters = {
			page: 1,
			size: (initialFilters.pageSize as number) || 10,
			...initialFilters,
		} as T;
		setFilters(resetFilters);
		setDebouncedFilters(resetFilters);
	}, [initialFilters]);

	// Update multiple filters at once
	const updateFilters = useCallback((newFilters: Partial<T>) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
			page: 1, // Reset to first page
		}));
	}, []);

	return {
		filters,
		debouncedFilters,
		loading,
		error,
		handleFilterChange,
		handlePageChange,
		handlePageSizeChange,
		resetFilters,
		updateFilters,
		setError,
		setLoading,
	};
};
