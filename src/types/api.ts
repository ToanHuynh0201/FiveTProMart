// Cấu trúc response từ backend
export interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T[];
	pagination: {
		totalItems: number;
		itemsPerPage: number;
		totalPages: number;
		startPage: number;
	};
}

// Utility types
export interface ApiError {
	success: false;
	message: string;
	errors?: Record<string, string[]>;
}
