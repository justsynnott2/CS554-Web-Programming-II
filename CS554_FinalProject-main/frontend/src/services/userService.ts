import api from './api';
import { User, ApiResponse, Pagination } from '../types';

export const userService = {
    getAllUsers: async (page = 1, limit = 20, search?: string) => {
        const params: any = { page, limit };
        if (search) params.search = search;
        const response = await api.get<ApiResponse<{users: User[]; pagination: Pagination;}>>('/users', { params });
        return response.data;
    },
    getUserById: async (userId: string): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
        return response.data;
    },
    updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>('/users/profile', data);
        return response.data;
    },
    uploadProfilePicture: async (file: File): Promise<ApiResponse<User>> => {
        const formData = new FormData();
        formData.append('profilePicture', file);
        const response = await api.post<ApiResponse<User>>('/users/profile-picture', formData);
        return response.data;
    },
    updateWeightGoal: async (goalWeight: number): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>('/users/goal-weight', {goalWeight});
        return response.data;
    }
};
