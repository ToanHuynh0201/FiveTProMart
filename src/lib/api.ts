import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	AxiosError,
	type InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG, AUTH_CONFIG, ROUTES } from "../constants";
import {
	getStorageItem,
	setStorageItem,
	clearStorageItems,
	logError,
	parseError,
	shouldLogout,
} from "../utils";

interface RefreshTokenData {
	accessToken: string;
	refreshToken?: string;
}

interface RefreshTokenResponse {
	data: {
		status: string;
		data: RefreshTokenData;
	};
}

/**
 * API Service Class
 * Handles all API calls with automatic token refresh and authentication
 */
class ApiService {
	private baseUrl: string;
	private api: AxiosInstance;
	private isRefreshing = false;
	private refreshSubscribers: Array<(token: string) => void> = [];

	/**
	 * Create API service instance
	 * @param customBaseUrl - Optional custom base URL
	 */
	constructor(customBaseUrl: string | null = null) {
		this.baseUrl = customBaseUrl || API_CONFIG.BASE_URL;
		this.api = this._createAxiosInstance();
		this._setupInterceptors();
	}

	/**
	 * Create axios instance with base configuration
	 * @private
	 * @returns Configured axios instance
	 */
	private _createAxiosInstance(): AxiosInstance {
		return axios.create({
			baseURL: this.baseUrl,
			timeout: API_CONFIG.TIMEOUT,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * Setup request and response interceptors
	 * @private
	 */
	private _setupInterceptors(): void {
		this._setupRequestInterceptor();
		this._setupResponseInterceptor();
	}

	/**
	 * Setup request interceptor to add auth token
	 * @private
	 */
	private _setupRequestInterceptor(): void {
		this.api.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				const token = getStorageItem(AUTH_CONFIG.TOKEN_STORAGE_KEY);
				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error: AxiosError) => {
				const parsedError = parseError(error);
				logError(parsedError, { context: "api.request" });
				return Promise.reject(parsedError);
			},
		);
	}

	/**
	 * Setup response interceptor to handle auth errors
	 * @private
	 */
	private _setupResponseInterceptor(): void {
		this.api.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				const parsedError = parseError(error);

				// Don't trigger logout for login endpoint errors
				if (this._isLoginEndpoint(error.config?.url)) {
					logError(parsedError, { context: "api.response" });
					return Promise.reject(parsedError);
				}

				// Handle auth errors with token refresh attempt
				if (shouldLogout(parsedError)) {
					const refreshResult = await this._handleAuthError(
						error,
						parsedError,
					);
					if (refreshResult) {
						return refreshResult;
					}
					this._handleLogout();
				}

				logError(parsedError, { context: "api.response" });
				return Promise.reject(parsedError);
			},
		);
	}

	/**
	 * Check if URL is login endpoint
	 * @private
	 * @param url - Request URL
	 * @returns Whether URL is login endpoint
	 */
	private _isLoginEndpoint(url?: string): boolean {
		return url?.includes("/auth/login") || false;
	}

	/**
	 * Handle authentication errors
	 * @private
	 * @param originalError - Original error object
	 * @param parsedError - Parsed error object
	 * @returns Retry result or false
	 */
	private async _handleAuthError(
		originalError: AxiosError,
		parsedError: any,
	): Promise<any> {
		// Try token refresh for 401 errors only
		if (parsedError.status === 401) {
			return await this._tryTokenRefresh(originalError);
		}
		return false;
	}

	/**
	 * Attempt to refresh token and retry original request
	 * @private
	 * @param originalError - Original error object
	 * @returns Retry result or false
	 */
	private async _tryTokenRefresh(originalError: AxiosError): Promise<any> {
		// If already refreshing, queue this request
		if (this.isRefreshing) {
			return new Promise((resolve) => {
				this.refreshSubscribers.push((token: string) => {
					if (originalError.config) {
						originalError.config.headers.Authorization = `Bearer ${token}`;
						resolve(this.api(originalError.config));
					}
				});
			});
		}

		const refreshToken = getStorageItem(
			AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
		);
		if (!refreshToken) {
			return false;
		}

		this.isRefreshing = true;

		try {
			const refreshResponse = await this._performTokenRefresh(
				refreshToken,
			);

			if (refreshResponse.data.status === "success") {
				const { accessToken, refreshToken: newRefreshToken } =
					refreshResponse.data.data;
				setStorageItem(AUTH_CONFIG.TOKEN_STORAGE_KEY, accessToken);

				if (newRefreshToken) {
					setStorageItem(
						AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
						newRefreshToken,
					);
				}

				// Notify all queued requests
				this.refreshSubscribers.forEach((callback) =>
					callback(accessToken),
				);
				this.refreshSubscribers = [];

				return this._retryOriginalRequest(originalError, accessToken);
			}
		} catch (refreshError) {
			logError(parseError(refreshError), { context: "api.refresh" });
			this.refreshSubscribers = [];
		} finally {
			this.isRefreshing = false;
		}

		return false;
	}

	/**
	 * Perform token refresh API call
	 * @private
	 * @param refreshToken - Refresh token
	 * @returns Refresh response
	 */
	private async _performTokenRefresh(
		refreshToken: string,
	): Promise<RefreshTokenResponse> {
		const response = await axios.post<RefreshTokenResponse["data"]>(
			`${API_CONFIG.BASE_URL}/auth/token/refresh`,
			{
				refreshToken,
			},
		);
		return response;
	}

	/**
	 * Retry original request with new token
	 * @private
	 * @param originalError - Original error object
	 * @param accessToken - New access token
	 * @returns Request response
	 */
	private _retryOriginalRequest(
		originalError: AxiosError,
		accessToken: string,
	): Promise<any> {
		if (!originalError.config) {
			return Promise.reject(new Error("No config available"));
		}
		const originalRequest = originalError.config;
		originalRequest.headers.Authorization = `Bearer ${accessToken}`;
		return this.api(originalRequest);
	}

	/**
	 * Handle logout by clearing storage and redirecting
	 * @private
	 */
	private _handleLogout(): void {
		clearStorageItems([
			AUTH_CONFIG.TOKEN_STORAGE_KEY,
			AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
			AUTH_CONFIG.USER_STORAGE_KEY,
		]);
		window.location.href = ROUTES.LOGIN;
	}

	// ============================================
	// Public API Methods
	// ============================================

	/**
	 * GET request
	 */
	public async get<T = any>(
		url: string,
		config?: AxiosRequestConfig,
	): Promise<T> {
		const response = await this.api.get<T>(url, config);
		return response.data;
	}

	/**
	 * POST request
	 */
	public async post<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
	): Promise<T> {
		const response = await this.api.post<T>(url, data, config);
		return response.data;
	}

	/**
	 * PUT request
	 */
	public async put<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
	): Promise<T> {
		const response = await this.api.put<T>(url, data, config);
		return response.data;
	}

	/**
	 * PATCH request
	 */
	public async patch<T = any>(
		url: string,
		data?: any,
		config?: AxiosRequestConfig,
	): Promise<T> {
		const response = await this.api.patch<T>(url, data, config);
		return response.data;
	}

	/**
	 * DELETE request
	 */
	public async delete<T = any>(
		url: string,
		config?: AxiosRequestConfig,
	): Promise<T> {
		const response = await this.api.delete<T>(url, config);
		return response.data;
	}

	/**
	 * Get axios instance for advanced usage
	 */
	public getAxiosInstance(): AxiosInstance {
		return this.api;
	}
}

// Export singleton instance
const apiService = new ApiService();

// Export class for custom instances
export { ApiService };

export default apiService;
