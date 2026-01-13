export interface User {
    id: string;
    name: string;
    email: string;
    position: string;
    avatar?: string;
    phone?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

// Backend login response (wrapped in ApiResponse)
export interface LoginApiData {
    accessToken: string;
    refreshToken: null; // Always null (stored in HttpOnly cookie)
    idToken: string;
    scope: string;
    authenticated: boolean;
    lastLogin: string;
}

export interface LoginResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data: LoginApiData;
}

export interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    getUserDetail: () => Promise<User | null>;
}
