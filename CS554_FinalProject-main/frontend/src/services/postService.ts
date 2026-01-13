import api from "./api";
import { Post, PostFormData, Comment, ApiResponse, Pagination } from "../types";

export const postService = {
  createPost: async (data: PostFormData): Promise<ApiResponse<Post>> => {
    const response = await api.post<ApiResponse<Post>>("/posts", data);
    return response.data;
  },

  getPosts: async (userId?: string, type?: string, page = 1, limit = 20) => {
    const params: any = { page, limit };
    if (userId) params.userId = userId;
    if (type) params.type = type;

    const response = await api.get<
      ApiResponse<{ posts: Post[]; pagination: Pagination }>
    >("/posts", { params });

    return response.data;
  },

  getPostById: async (postId: string): Promise<ApiResponse<Post>> => {
    const response = await api.get<ApiResponse<Post>>(`/posts/${postId}`);
    return response.data;
  },

  likePost: async (
    postId: string
  ): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> => {
    const response = await api.post<
      ApiResponse<{ liked: boolean; likesCount: number }>
    >(`/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId: string, text: string): Promise<ApiResponse<Comment>> => {
    const response = await api.post<ApiResponse<Comment>>(
      `/posts/${postId}/comment`,
      { text }
    );
    return response.data;
  },

  addReply: async (commentId: string, text: string): Promise<ApiResponse<Comment>> => {
    const response = await api.post<ApiResponse<Comment>>(
      `/posts/comments/${commentId}/replies`,
      { text }
    );
    return response.data;
  },

  deletePost: async (postId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/posts/${postId}`);
    return response.data;
  },

  updatePost: async (
    postId: string,
    data: { content: string }
  ): Promise<ApiResponse<Post>> => {
    const response = await api.patch<ApiResponse<Post>>(`/posts/${postId}`, data);
    return response.data;
  },
};
