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

// Single data response (for GET by ID, POST, PUT)
export interface ApiSingleResponse<T> {
	success: boolean;
	message: string;
	data: T;
	statusCode?: number;
}

// Delete response
export interface ApiDeleteResponse {
	success: boolean;
	message: string;
	data: null;
	statusCode?: number;
}

// Utility types
export interface ApiError {
	success: false;
	message: string;
	errors?: Record<string, string[]> | null;
	statusCode?: number;
}
