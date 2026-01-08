import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/authService";
import type { User, LoginCredentials, AuthContextType } from "../types/auth";

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useEffect(() => {
		initializeAuth();
	}, []);

	const initializeAuth = async () => {
		try {
			const storedUser = authService.getUser();
			const storedAccessToken = authService.getAccessToken();
			const storedRefreshToken = authService.getRefreshToken();

			if (storedUser && storedAccessToken && storedRefreshToken) {
				setUser(storedUser);
				setAccessToken(storedAccessToken);
				setRefreshToken(storedRefreshToken);

				const updatedUser = await authService.getUserDetail();
				if (updatedUser) {
					setUser(updatedUser);
				}
			}
		} catch (error) {
			console.error("Auth initialization error:", error);
			logout();
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (credentials: LoginCredentials): Promise<void> => {
		try {
			setIsLoading(true);
			const response = await authService.login(credentials);

			setUser(response.user);
			setAccessToken(response.tokens.accessToken);
			setRefreshToken(response.tokens.refreshToken);
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = (): void => {
		authService.logout();
		setUser(null);
		setAccessToken(null);
		setRefreshToken(null);
	};

	const getUserDetail = async (): Promise<User | null> => {
		try {
			const updatedUser = await authService.getUserDetail();
			if (updatedUser) {
				setUser(updatedUser);
			}
			return updatedUser;
		} catch (error) {
			console.error("Get user detail error:", error);
			return null;
		}
	};

	const value: AuthContextType = {
		user,
		accessToken,
		refreshToken,
		isAuthenticated: !!(user && accessToken),
		isLoading,
		login,
		logout,
		getUserDetail,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
};
