import { useState, useCallback, useMemo } from "react";

interface PaginationState {
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

interface UsePaginationOptions {
	initialPage?: number;
	pageSize?: number;
	initialTotal?: number;
}

export const usePagination = (options: UsePaginationOptions = {}) => {
	const { initialPage = 1, pageSize = 10, initialTotal = 0 } = options;

	const [currentPage, setCurrentPage] = useState(initialPage);
	const [total, setTotal] = useState(initialTotal);
	const [itemsPerPage] = useState(pageSize);

	// Calculate pagination state
	const pagination = useMemo<PaginationState>(() => {
		const totalPages = Math.ceil(total / itemsPerPage) || 1;
		const hasNextPage = currentPage < totalPages;
		const hasPreviousPage = currentPage > 1;

		return {
			total,
			totalPages,
			hasNextPage,
			hasPreviousPage,
		};
	}, [total, itemsPerPage, currentPage]);

	// Reset pagination to initial state
	const resetPagination = useCallback(() => {
		setCurrentPage(initialPage);
		setTotal(0);
	}, [initialPage]);

	// Update total items count
	const updateTotal = useCallback((newTotal: number) => {
		setTotal(newTotal);
	}, []);

	// Go to specific page
	const goToPage = useCallback(
		(page: number) => {
			const validPage = Math.max(
				1,
				Math.min(page, pagination.totalPages),
			);
			setCurrentPage(validPage);
		},
		[pagination.totalPages],
	);

	// Go to next page
	const nextPage = useCallback(() => {
		if (pagination.hasNextPage) {
			setCurrentPage((prev) => prev + 1);
		}
	}, [pagination.hasNextPage]);

	// Go to previous page
	const previousPage = useCallback(() => {
		if (pagination.hasPreviousPage) {
			setCurrentPage((prev) => prev - 1);
		}
	}, [pagination.hasPreviousPage]);

	// Calculate start and end item indices
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, total);

	return {
		// State
		currentPage,
		total,
		pageSize: itemsPerPage,
		pagination,
		startItem,
		endItem,
		// Actions
		setCurrentPage,
		setTotal: updateTotal,
		goToPage,
		nextPage,
		previousPage,
		resetPagination,
	};
};
