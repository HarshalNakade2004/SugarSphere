import api from './client';
import { ApiResponse, Notification } from '@/types';

export const notificationsApi = {
  getAll: async (): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    const response = await api.post(`/notifications/read/${id}`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },
};
