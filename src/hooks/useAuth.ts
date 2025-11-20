import { useState, useCallback } from "react";
import type { User } from "@/types";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
}

export function useAuth() {
	const [authState, setAuthState] = useState<AuthState>({
		// Mock user data for demo
		user: {
			id: "1",
			name: "Nguyễn Văn A",
			email: "nguyenvana@5tmart.com",
			role: "Quản lí",
		},
		isAuthenticated: true,
	});

	const login = useCallback((user: User) => {
		setAuthState({
			user,
			isAuthenticated: true,
		});
	}, []);

	const logout = useCallback(() => {
		setAuthState({
			user: null,
			isAuthenticated: false,
		});
		// You can add navigation to login page here
		console.log("User logged out");
	}, []);

	return {
		user: authState.user,
		isAuthenticated: authState.isAuthenticated,
		login,
		logout,
	};
}
