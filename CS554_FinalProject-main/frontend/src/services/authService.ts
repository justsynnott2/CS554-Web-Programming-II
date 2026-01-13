import api from './api';
import { AuthResponse, LoginCredentials, RegisterData, User, ApiResponse } from '../types';

export const authService = {
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },
    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data;
    },
    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('token');
    },
    getToken: (): string | null => {
        return localStorage.getItem('token');
    },
    setToken: (token: string): void => {
        localStorage.setItem('token', token);
    },
    getStoredUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    setStoredUser: (user: User): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },
};