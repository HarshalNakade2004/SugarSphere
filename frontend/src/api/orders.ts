import api from './client';
import { ApiResponse, Order, OrderItem } from '@/types';

interface CreateOrderData {
  items: { sweetId: string; quantity: number }[];
}

interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  items: OrderItem[];
}

interface VerifyPaymentData {
  orderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export const ordersApi = {
  create: async (data: CreateOrderData): Promise<ApiResponse<CreateOrderResponse>> => {
    const response = await api.post('/orders/create', data);
    return response.data;
  },

  verify: async (data: VerifyPaymentData): Promise<ApiResponse<{ status: string; order: Order }>> => {
    const response = await api.post('/orders/verify', data);
    return response.data;
  },

  getAll: async (params?: { page?: number; limit?: number; status?: string; paymentStatus?: string }): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get user's own orders
  getMy: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ orders: Order[]; pagination?: any }>> => {
    const response = await api.get('/orders/my', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data;
  },

  getAllAdmin: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/orders/admin/all');
    return response.data;
  },

  updateStatus: async (orderId: string, status: string): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/orders/admin/${orderId}/status`, { status });
    return response.data;
  },
};
