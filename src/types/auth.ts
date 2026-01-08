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

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    getUserDetail: () => Promise<User | null>;
}
