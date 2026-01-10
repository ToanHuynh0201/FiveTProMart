import { createContext, useState, useEffect, type ReactNode } from "react";
import { authService } from "../services/authService";
import type { User, LoginCredentials, AuthContextType } from "../types/auth";
import { useAuthStore } from "@/store/authStore";
import { waitForVisibilityRefresh } from "@/components/providers/TokenRefreshProvider";

/**
 * AuthContext - React Context wrapper for Zustand auth store
 * 
 * ARCHITECTURE:
 * - State managed by Zustand store (authStore.ts)
 * - This context provides React Context API for component compatibility
 * - Token refresh handled by TokenRefreshProvider + tokenManager
 * 
 * MIGRATION NOTE: Maintains the same API as the old Context-based implementation
 * so existing components don't need changes.
 */

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	// Subscribe to Zustand store
	const {
		user,
		accessToken,
		isAuthenticated,
		isLoading: storeIsLoading,
		isHydrated,
		setLoading: storeSetLoading,
		setHydrated: storeSetHydrated,
	} = useAuthStore();

	const storeLogout = useAuthStore(state => state.logout);

	const [isInitialized, setIsInitialized] = useState(false);

	/**
	 * Initialize auth state on mount
	 */
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				// Wait for Zustand to hydrate from localStorage
				if (!isHydrated) {
					storeSetHydrated(true);
				}

				// If we have a persisted user but no token, validate session
				if (user && !accessToken) {
					// Wait for any visibility-triggered refresh to complete
					await waitForVisibilityRefresh();

					// Try to validate session (will trigger refresh if needed)
					const updatedUser = await authService.getUserDetail();
					if (!updatedUser) {
						// Session invalid, clear state
						storeLogout();
					}
				}
			} catch (error) {
				console.error("Auth initialization error:", error);
				storeLogout();
			} finally {
				storeSetLoading(false);
				setIsInitialized(true);
			}
		};

		initializeAuth();
	}, []);

	/**
	 * Login action - calls authService and updates store
	 */
	const login = async (credentials: LoginCredentials): Promise<void> => {
		try {
			storeSetLoading(true);
			
			// authService.login() updates the store internally
			await authService.login(credentials);
			
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		} finally {
			storeSetLoading(false);
		}
	};

	/**
	 * Logout action
	 */
	const logout = (): void => {
		authService.logout();
	};

	/**
	 * Get user details (refresh profile from server)
	 */
	const getUserDetail = async (): Promise<User | null> => {
		try {
			return await authService.getUserDetail();
		} catch (error) {
			console.error("Get user detail error:", error);
			return null;
		}
	};

	const value: AuthContextType = {
		user,
		accessToken,
		refreshToken: null, // Not exposed (HttpOnly cookie)
		isAuthenticated,
		isLoading: storeIsLoading || !isInitialized,
		login,
		logout,
		getUserDetail,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
