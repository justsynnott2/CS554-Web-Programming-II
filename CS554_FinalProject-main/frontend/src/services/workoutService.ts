import api from "./api";
import { Workout, WorkoutFormData, ApiResponse, Pagination } from "../types";

export const workoutService = {
  createWorkout: async (data: WorkoutFormData): Promise<ApiResponse<Workout>> => {
    const formData = new FormData();

    formData.append("title", data.title);
    formData.append("split", data.split);
    formData.append("exercises", JSON.stringify(data.exercises));

    if (data.date) formData.append("date", data.date);
    if (typeof data.duration !== "undefined") formData.append("duration", String(data.duration));
    if (data.notes) formData.append("notes", data.notes);

    if (data.media && data.media.length > 0) {
      data.media.forEach((file) => formData.append("media", file));
    }

    const response = await api.post<ApiResponse<Workout>>("/workouts", formData);
    return response.data;
  },

  getWorkouts: async (
    userId?: string,
    split?: string,
    startDate?: string,
    endDate?: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<{ workouts: Workout[]; pagination: Pagination; total: number }>> => {
    const params: any = { page, limit };
    if (userId) params.userId = userId;
    if (split) params.split = split;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<ApiResponse<{ workouts: Workout[]; pagination: Pagination; total: number }>>(
      "/workouts",
      { params }
    );
    return response.data;
  },

  getWorkoutById: async (workoutId: string): Promise<ApiResponse<Workout>> => {
    const response = await api.get<ApiResponse<Workout>>(`/workouts/${workoutId}`);
    return response.data;
  },

  updateWorkout: async (
    workoutId: string,
    data: Partial<WorkoutFormData> & { removedMedia?: string[] }
  ): Promise<ApiResponse<Workout>> => {
    const formData = new FormData();

    if (typeof data.title === "string") formData.append("title", data.title);
    if (typeof data.split === "string") formData.append("split", data.split);
    if (data.exercises) formData.append("exercises", JSON.stringify(data.exercises));

    if (data.date) formData.append("date", data.date);
    if (typeof data.duration !== "undefined") formData.append("duration", String(data.duration));
    if (typeof data.notes === "string") formData.append("notes", data.notes);

    if (data.removedMedia && data.removedMedia.length > 0) {
      formData.append("removedMedia", JSON.stringify(data.removedMedia));
    } else {
      formData.append("removedMedia", JSON.stringify([]));
    }

    if (data.media && data.media.length > 0) {
      data.media.forEach((file) => formData.append("media", file));
    }

    const response = await api.put<ApiResponse<Workout>>(`/workouts/${workoutId}`, formData);
    return response.data;
  },

  deleteWorkout: async (workoutId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/workouts/${workoutId}`);
    return response.data;
  },
};
