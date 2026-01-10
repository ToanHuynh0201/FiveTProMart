import { API_CONFIG, ROUTES } from "@/constants";
import {
	logError,
	parseError,
	shouldLogout,
} from "@/utils";
import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";
import {
	refreshAccessToken,
	isRefreshInProgress,
	waitForRefresh,
} from "@/lib/tokenManager";

class ApiService {
	private baseUrl: string;
	private api: AxiosInstance;
	constructor(customBaseUrl = null) {
		this.baseUrl = customBaseUrl || API_CONFIG.BASE_URL;
		this.api = this._createAxiosInstance();
		this._setupInterceptors();
	}

	/**
	 * Create axios instance with base configuration
	 * @private
	 * @returns {axios.AxiosInstance} Configured axios instance
	 */
	_createAxiosInstance() {
		return axios.create({
			baseURL: this.baseUrl,
			timeout: API_CONFIG.TIMEOUT,
			headers: {
				"Content-Type": "application/json",
			},
			withCredentials: true, // CRITICAL: Send HttpOnly cookies for refresh tokens
		});
	}

	/**
	 * Setup request and response interceptors
	 * @private
	 */
	_setupInterceptors() {
		this._setupRequestInterceptor();
		this._setupResponseInterceptor();
	}

	/** from store
	 * @private
	 */
	_setupRequestInterceptor() {
		this.api.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				// Read token from Zustand store (in-memory, XSS-safe)
				const state = useAuthStore.getState();
				const accessToken = state.accessToken;

				if (accessToken) {
					config.headers.set('Authorization', `Bearer ${accessToken}`);
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
	 * Setup response interceptor with production-grade token refresh
	 * @private
	 */
	_setupResponseInterceptor() {
		this.api.interceptors.response.use(
			(response: any) => response,
			async (error: AxiosError) => {
				const parsedError = parseError(error);
				const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

				// Don't trigger logout for login endpoint errors
				if (this._isLoginEndpoint(error.config?.url || '')) {
					logError(parsedError, { context: "api.response" });
					return Promise.reject(parsedError);
				}

				// ----------------------------------------------------------------
				// HANDLE 401 UNAUTHORIZED WITH CENTRALIZED REFRESH
				// ----------------------------------------------------------------
				if (
					error.response?.status === 401 &&
					originalRequest &&
					!originalRequest._retry
				) {
					originalRequest._retry = true;

					// If refresh already in progress, wait for it
					if (isRefreshInProgress()) {
						const result = await waitForRefresh();
						if (result.success && result.token) {
							// Retry with new token
							originalRequest.headers.set('Authorization', `Bearer ${result.token}`);
							return this.api(originalRequest);
						}
						// Refresh failed, logout
						this._handleLogout();
						return Promise.reject(parsedError);
					}

					// Initiate refresh
					const onTokenRefreshed = (newToken: string) => {
						useAuthStore.setState({ accessToken: newToken });
					};

					const onSessionExpired = () => {
						this._handleLogout();
					};

					const result = await refreshAccessToken(onTokenRefreshed, onSessionExpired);

					if (result.success && result.token) {
						// Retry original request with new token
						originalRequest.headers.set('Authorization', `Bearer ${result.token}`);
						return this.api(originalRequest);
					}

					// Refresh failed, logout
					this._handleLogout();
					return Promise.reject(parsedError);
				}

				logError(parsedError, { context: "api.response" });
				return Promise.reject(parsedError);
			},
		);
	}

	/**
	 * Check if URL is login endpoint
	 * @private
	 * @param {string} url - Request URL
	 * @returns {boolean} Whether URL is login endpoint
	 */
	_isLoginEndpoint(url: string) {
		return url?.includes("/users/login") || url?.includes("/auth/login");
	}

	/**
	 * Handle logout by clearing store and redirecting
	 * @private
	 */
	_handleLogout() {
		useAuthStore.getState().logout();
		window.location.href = ROUTES.LOGIN;
	}

	// Proxy methods to axios instance
	get(url: any, config?: any) {
		return this.api.get(url, config);
	}

	post(url: any, data: any, config?: any) {
		return this.api.post(url, data, config);
	}

	put(url: any, data: any, config?: any) {
		return this.api.put(url, data, config);
	}

	patch(url: any, data: any, config?: any) {
		return this.api.patch(url, data, config);
	}

	delete(url: any, config?: any) {
		return this.api.delete(url, config);
	}
}

const apiService = new ApiService();

// * Use this for custom instances
export { ApiService };

export default apiService;
