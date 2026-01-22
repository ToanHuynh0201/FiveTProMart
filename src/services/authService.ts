import type { User, LoginCredentials, LoginResponse } from "../types/auth";
import { API_CONFIG } from "../constants";
import apiService from "../lib/api";
import { useAuthStore } from "@/store/authStore";

/**
 * AuthService - Business logic for authentication
 *
 * SECURITY: No longer stores tokens in localStorage.
 * - Access tokens: Managed by Zustand store (in-memory, cleared on tab close)
 * - Refresh tokens: HttpOnly cookies managed by backend
 * - User profile: Persisted via Zustand persist middleware
 */

class AuthService {
	/**
	 * Login user with credentials
	 *
	 * DEFENSIVE: Validates Content-Type, wraps JSON parsing, provides actionable errors
	 */
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			// Use fetch for login to avoid axios interceptors during auth flow
			const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // CRITICAL: Accept HttpOnly refresh token cookie
				body: JSON.stringify(credentials),
			});

			// DEFENSIVE: Validate Content-Type before parsing
			const contentType = response.headers.get("content-type");
			if (!contentType?.includes("application/json")) {
				throw new Error(
					`Server returned unexpected format (${response.status} ${response.statusText}). Expected JSON but got ${contentType || "unknown type"}.`,
				);
			}

			// DEFENSIVE: Parse JSON with try/catch
			let apiResponse: any;
			try {
				apiResponse = await response.json();
			} catch (parseError) {
				throw new Error(
					`Failed to parse server response (${response.status}). The server may be experiencing issues.`,
				);
			}

			// Handle error responses (4xx/5xx)
			if (!response.ok) {
				const errorMessage =
					apiResponse?.message ||
					apiResponse?.error?.message ||
					"Login failed";
				throw new Error(errorMessage);
			}

			const data = apiResponse.data; // Extract from ApiResponse wrapper

			// Store access token in Zustand (in-memory)
			if (data?.accessToken) {
				await useAuthStore.getState().login(data.accessToken);
			} else {
				throw new Error("No access token in login response");
			}

			// Fetch user profile and store it (backend doesn't return it in login response)
			await this.getUserDetail();

			return apiResponse;
		} catch (error) {
			console.error("[authService] Login error:", error);
			throw error;
		}
	}

	/**
	 * Logout user and clear store
	 */
	async logout(): Promise<void> {
		const { accessToken } = useAuthStore.getState();

		try {
			// Only call logout API if we have a valid token
			// If session already expired, just clear client-side state
			if (accessToken) {
				await apiService.post("/auth/logout", {});
			} else {
				console.log("Logout: No access token, skipping API call");
			}
		} catch (err) {
			console.error("Logout API error:", err);
			// Swallow error - logout should always succeed client-side
		} finally {
			// Always clear Zustand store, even if API call fails
			useAuthStore.getState().logout();
		}
	}

	/**
	 * Get user details from server (uses axios with auto token refresh)
	 */
	async getUserDetail(): Promise<User | null> {
		try {
			// apiService.get unwraps res.data, so response = { success, message, data: User }
			const response = await apiService.get<{
				success: boolean;
				message: string;
				data: User;
			}>("/auth/me");

			console.log(response);

			const user: User = response.data;

			// Update store with fresh user data
			useAuthStore.getState().setUser(user);

			return user;
		} catch (error) {
			console.error("Get user detail error:", error);
			return null;
		}
	}

	/**
	 * Get user from store
	 */
	getUser(): User | null {
		return useAuthStore.getState().user;
	}

	/**
	 * Check if user is authenticated
	 */
	isAuthenticated(): boolean {
		return useAuthStore.getState().isAuthenticated;
	}

	/**
	 * Request password reset OTP
	 */
	async forgotPassword(email: string): Promise<void> {
		await apiService.post("/auth/forgot-password", { email });
	}

	/**
	 * Verify OTP for password reset
	 */
	async verifyOtp(email: string, otp: string): Promise<void> {
		await apiService.post("/auth/verify-otp", { email, otp });
	}

	/**
	 * Reset password with OTP verification
	 */
	async resetPassword(
		email: string,
		otp: string,
		newPassword: string,
	): Promise<void> {
		await apiService.post("/auth/reset-password", {
			email,
			otp,
			newPassword,
		});
	}
}

export const authService = new AuthService();
