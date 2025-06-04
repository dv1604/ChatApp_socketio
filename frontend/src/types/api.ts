import { User, UserDisplayInfo } from ".";

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    total?: number;
    limit?: number;
    offset?: number;
}

export interface ApiError{
    data: {
        error: string;
    };
    status : number
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: Pick<User, 'id' | 'username' | 'email' | 'avatarUrl' | 'createdAt'>;
    token: string;
};

export interface LoginResponse{
    user: Omit<User, 'passwordHash'>,
    token : string
}

// api response for users list
export interface UsersApiResponse {
    users: UserDisplayInfo[];
    total: number;
    limit: number;
    offset: number;
}

// api response for single user
export interface UserApiResponse extends UserDisplayInfo { }

export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}