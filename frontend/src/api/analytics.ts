import api from './client';
import { ApiResponse, AnalyticsOverview, RevenueData } from '@/types';
import type { Order } from '@/types';

interface TopSweet {
  _id: string;
  name: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  stockValue: number;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface InventoryResponse {
  inventory: InventoryItem[];
  summary: {
    totalItems: number;
    totalValue: number;
    avgPrice: number;
  };
}

export const analyticsApi = {
  getOverview: async (): Promise<ApiResponse<AnalyticsOverview>> => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  // Alias for dashboard compatibility
  getStats: async (): Promise<ApiResponse<AnalyticsOverview>> => {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  getTopSweets: async (limit?: number): Promise<ApiResponse<TopSweet[]>> => {
    const response = await api.get('/analytics/top-sweets', { params: { limit } });
    return response.data;
  },

  getRevenue: async (range: string): Promise<ApiResponse<{ range: string; revenueData: RevenueData[]; total?: number }>> => {
    // Map period to range format
    const rangeMap: Record<string, string> = {
      'week': '7d',
      'month': '30d',
      'year': '90d',
      '7d': '7d',
      '30d': '30d',
      '90d': '90d',
    };
    const mappedRange = rangeMap[range] || '7d';
    const response = await api.get('/analytics/revenue', { params: { range: mappedRange } });
    
    // Calculate total from revenueData
    const revenueData = response.data?.data?.revenueData || [];
    const total = revenueData.reduce((sum: number, item: RevenueData) => sum + (item.revenue || 0), 0);
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        total,
      },
    };
  },

  getInventory: async (): Promise<ApiResponse<InventoryResponse>> => {
    const response = await api.get('/analytics/inventory');
    return response.data;
  },

  getRecentOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/orders');
    return response.data;
  },
};
