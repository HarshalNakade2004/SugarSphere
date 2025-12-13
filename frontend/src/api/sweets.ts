import api from './client';
import { ApiResponse, PaginatedResponse, Sweet } from '@/types';

interface SearchParams {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewData {
  rating: number;
  comment: string;
}

export const sweetsApi = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<any> => {
    if (params?.page) {
      const response = await api.get('/sweets/search', { params });
      return response.data;
    }
    const response = await api.get('/sweets');
    return response.data;
  },

  // Admin: Get all sweets including inactive
  getAllAdmin: async (): Promise<ApiResponse<Sweet[]>> => {
    const response = await api.get('/sweets/admin/all');
    return response.data;
  },

  search: async (params: SearchParams): Promise<PaginatedResponse<Sweet>> => {
    const response = await api.get('/sweets/search', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Sweet>> => {
    const response = await api.get(`/sweets/${id}`);
    return response.data;
  },

  create: async (data: FormData): Promise<ApiResponse<Sweet>> => {
    const response = await api.post('/sweets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<ApiResponse<Sweet>> => {
    const response = await api.put(`/sweets/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/sweets/${id}`);
    return response.data;
  },

  restock: async (id: string, quantity: number, note?: string): Promise<ApiResponse<Sweet>> => {
    const response = await api.post(`/sweets/${id}/restock`, { quantity, note });
    return response.data;
  },

  // Reviews
  addReview: async (sweetId: string, data: ReviewData): Promise<ApiResponse<Sweet>> => {
    const response = await api.post(`/sweets/${sweetId}/review`, data);
    return response.data;
  },

  getReviews: async (sweetId: string): Promise<ApiResponse<Review[]>> => {
    const response = await api.get(`/sweets/${sweetId}/reviews`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<string[]>> => {
    const response = await api.get('/sweets/categories');
    return response.data;
  },
};
