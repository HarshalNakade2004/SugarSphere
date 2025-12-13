import api from './client';
import { ApiResponse, User } from '@/types';

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const usersApi = {
  // User self-service routes
  updateProfile: async (data: FormData): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/auth/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updatePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> => {
    const response = await api.put('/auth/password', data);
    return response.data;
  },

  // Admin routes
  getAll: async (params?: { page?: number; limit?: number; role?: string }): Promise<ApiResponse<UsersResponse>> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  updateRole: async (userId: string, role: string): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  toggleStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${userId}/status`, { isActive });
    return response.data;
  },
};
