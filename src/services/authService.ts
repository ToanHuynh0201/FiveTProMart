import {
	getStorageItem,
	setStorageItem,
	clearStorageItems,
} from "../utils/storage";
import type {
	User,
	LoginCredentials,
	LoginResponse,
	AuthTokens,
} from "../types/auth";
import {STORAGE_KEYS, API_CONFIG} from "../constants";

class AuthService {
	/**
	 * Login user with credentials
	 */
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(credentials),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || "Login failed");
			}

			const data: LoginResponse = await response.json();

			this.saveAuthData(data.user, data.tokens);

			return data;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	}

	/**
	 * Logout user and clear storage
	 */
	logout(): void {
		clearStorageItems([
			STORAGE_KEYS.USER,
			STORAGE_KEYS.ACCESS_TOKEN,
			STORAGE_KEYS.REFRESH_TOKEN,
		]);
	}

	/**
	 * Get user details from server
	 */
	async getUserDetail(): Promise<User | null> {
		try {
			const accessToken = this.getAccessToken();

			if (!accessToken) {
				throw new Error("No access token found");
			}

			const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			if (!response.ok) {
				if (response.status === 401) {
					const refreshed = await this.refreshAccessToken();
					if (refreshed) {
						return this.getUserDetail();
					}
				}
				throw new Error("Failed to get user details");
			}

			const user: User = await response.json();

			this.saveUser(user);

			return user;
		} catch (error) {
			console.error("Get user detail error:", error);
			return null;
		}
	}

	/**
	 * Refresh access token using refresh token
	 */
	async refreshAccessToken(): Promise<boolean> {
		try {
			const refreshToken = this.getRefreshToken();

			if (!refreshToken) {
				throw new Error("No refresh token found");
			}

			const response = await fetch(`${API_CONFIG.BASE_URL}/auth/refresh`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ refreshToken }),
			});

			if (!response.ok) {
				this.logout();
				return false;
			}

			const data: AuthTokens = await response.json();

			this.saveTokens(data);

			return true;
		} catch (error) {
			console.error("Refresh token error:", error);
			this.logout();
			return false;
		}
	}

	/**
	 * Save authentication data to storage
	 */
	private saveAuthData(user: User, tokens: AuthTokens): void {
		this.saveUser(user);
		this.saveTokens(tokens);
	}

	/**
	 * Save user to storage
	 */
	private saveUser(user: User): void {
		setStorageItem(STORAGE_KEYS.USER, user);
	}

	/**
	 * Save tokens to storage
	 */
	private saveTokens(tokens: AuthTokens): void {
		setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
		setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
	}

	/**
	 * Get user from storage
	 */
	getUser(): User | null {
		return getStorageItem(STORAGE_KEYS.USER, null);
	}

	/**
	 * Get access token from storage
	 */
	getAccessToken(): string | null {
		return getStorageItem(STORAGE_KEYS.ACCESS_TOKEN, null);
	}

	/**
	 * Get refresh token from storage
	 */
	getRefreshToken(): string | null {
		return getStorageItem(STORAGE_KEYS.REFRESH_TOKEN, null);
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		const accessToken = this.getAccessToken();
		const user = this.getUser();
		return !!(accessToken && user);
	}
}

export const authService = new AuthService();
