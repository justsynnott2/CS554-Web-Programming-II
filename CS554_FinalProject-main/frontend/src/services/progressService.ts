import api from './api';
import {Progress, ProgressFormData, WeightProgress, WeightProgressFormData, PRExercise, PRProgress, PRHistoryResponse, ApiResponse, Pagination} from '../types';

export const progressService = {
    createProgress: async (data: ProgressFormData): Promise<ApiResponse<Progress>> => {
        const formData = new FormData();
        formData.append('type', data.type);
        if (data.date) formData.append('date', data.date);
        if (data.weight) formData.append('weight', data.weight.toString());
        if (data.exercise) formData.append('exercise', data.exercise);
        if (data.prValue) formData.append('prValue', data.prValue.toString());
        if (data.measurement) formData.append('measurement', JSON.stringify(data.measurement));
        if (data.notes) formData.append('notes', data.notes);
        if (data.photos && data.photos.length > 0) {
            data.photos.forEach((photo) => {
                formData.append('photos', photo);
            });
        }
        const response = await api.post<ApiResponse<Progress>>('/progress', formData);
        return response.data;
    },
    getProgress: async (userId?: string, type?: string, startDate?: string, endDate?: string, page = 1, limit = 20) => {
        const params: any = { page, limit };
        if (userId) params.userId = userId;
        if (type) params.type = type;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get<ApiResponse<{progressEntries: Progress[]; pagination: Pagination;}>>('/progress', { params });
        return response.data;
    },
    getProgressById: async (progressId: string): Promise<ApiResponse<Progress>> => {
        const response = await api.get<ApiResponse<Progress>>(`/progress/${progressId}`);
        return response.data;
    },
    deleteProgress: async (progressId: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/progress/${progressId}`);
        return response.data;
    },
};

export const weightProgressService = {
    createWeightProgress: async (data: WeightProgressFormData): Promise<ApiResponse<WeightProgress>> => {
        const formData = new FormData();
        if (data.date) formData.append('date', data.date);
        formData.append('weight', data.weight.toString());
        if (data.notes) formData.append('notes', data.notes);
        if (data.photos?.length) {
            data.photos.forEach(photo => {
                formData.append('photos', photo);
            });
        }
        const response = await api.post<ApiResponse<WeightProgress>>('/progress/weight', formData);
        return response.data;
    },
    getWeightProgress: async (startDate?: string, endDate?: string, page = 1, limit = 20): Promise<ApiResponse<{entries: WeightProgress[]; pagination: Pagination}>> => {
        const params: any = {page, limit};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get<ApiResponse<{entries: WeightProgress[]; pagination: Pagination}>>('/progress/weight', {params});
        return response.data;
    },
    getWeightProgressById: async (id: string): Promise<ApiResponse<WeightProgress>> => {
        const response = await api.get<ApiResponse<WeightProgress>>(`/progress/weight/${id}`);
        return response.data;
    },
    updateWeightProgress: async (id: string, data: Partial<WeightProgressFormData>): Promise<ApiResponse<WeightProgress>> => {
        const response = await api.put<ApiResponse<WeightProgress>>(`/progress/weight/${id}`, data);
        return response.data;
    },
    deleteWeightProgress: async (id: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/progress/weight/${id}`);
        return response.data;
    }
}

export const prExerciseService = {
    createPRExercise: async (name: string, unit: PRExercise['unit'] = 'lbs'): Promise<ApiResponse<PRExercise>> => {
        const response = await api.post<ApiResponse<PRExercise>>('/progress/pr/exercises', {name, unit});
        return response.data;
    },
    getPRExercises: async (): Promise<ApiResponse<PRExercise[]>> => {
        const response = await api.get<ApiResponse<PRExercise[]>>('/progress/pr/exercises');
        return response.data;
    },
    updatePRExercise: async (exerciseId: string, data: Partial<Pick<PRExercise, 'name' | 'unit'>>): Promise<ApiResponse<PRExercise>> => {
        const response = await api.put<ApiResponse<PRExercise>>(`/progress/pr/exercises/${exerciseId}`, data);
        return response.data;
    },
    deletePRExercise: async (exerciseId: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/progress/pr/exercises/${exerciseId}`);
        return response.data;
    }
};

export const prProgressService = {
    setPR: async (prExerciseId: string, value: number): Promise<ApiResponse<PRProgress>> => {
        const response = await api.post<ApiResponse<PRProgress>>('/progress/pr/progress', {prExerciseId, value});
        return response.data;
    },
    getPRHistory: async (prExerciseId: string): Promise<ApiResponse<PRHistoryResponse>> => {
        const response = await api.get<ApiResponse<PRHistoryResponse>>(`/progress/pr/progress/${prExerciseId}`);
        return response.data;
    },
    deletePR: async (prId: string): Promise<ApiResponse> => {
        const response = await api.delete<ApiResponse>(`/progress/pr/progress/${prId}`);
        return response.data;
    }
};