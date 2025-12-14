export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sweet {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;
  reviews?: Array<{
    _id: string;
    userId: string;
    userName: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  sweetId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  _id: string;
  userId: string;
  user?: { _id: string; name: string; email: string };
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: 'created' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'cancelled' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'order' | 'inventory' | 'promo' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CartItem {
  sweet: Sweet;
  quantity: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface AnalyticsOverview {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalSweets: number;
  pendingOrders: number;
  lowStockItems: number;
}

export interface RevenueData {
  _id: string;
  revenue: number;
  orders: number;
}
