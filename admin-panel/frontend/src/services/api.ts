import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-hot-toast';

// Add ImportMetaEnv type declaration for TypeScript
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // add other env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data.data;
          localStorage.setItem('admin_token', token);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('admin_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const errorData = error.response?.data as { message?: string } | undefined;
    const errorMessage = errorData?.message || error.message || 'An error occurred';

    // Don't show toast for 401 errors (handled above)
    if (error.response?.status !== 401) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Generic API functions
export const apiService = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    const response = await api.get(url, { params });
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete(url);
    return response.data;
  },

  // Upload file
  upload: async <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiService.post('/auth/login', { email, password }),

  logout: () => apiService.post('/auth/logout'),

  me: () => apiService.get('/auth/me'),

  refresh: () => apiService.post('/auth/refresh'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiService.post('/auth/change-password', { currentPassword, newPassword }),
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => apiService.get('/users', params),

  getById: (id: string) => apiService.get(`/users/${id}`),

  create: (userData: any) => apiService.post('/users', userData),

  update: (id: string, userData: any) => apiService.put(`/users/${id}`, userData),

  delete: (id: string) => apiService.delete(`/users/${id}`),

  updateStatus: (id: string, status: string) =>
    apiService.patch(`/users/${id}/status`, { status }),

  getStats: () => apiService.get('/users/stats'),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => apiService.get('/products', params),

  getById: (id: string) => apiService.get(`/products/${id}`),

  create: (productData: any) => apiService.post('/products', productData),

  update: (id: string, productData: any) => apiService.put(`/products/${id}`, productData),

  delete: (id: string) => apiService.delete(`/products/${id}`),

  updateStatus: (id: string, status: string) =>
    apiService.patch(`/products/${id}/status`, { status }),

  updateStock: (id: string, stock: number) =>
    apiService.patch(`/products/${id}/stock`, { stock }),

  getFeatured: () => apiService.get('/products/featured'),

  getTrending: () => apiService.get('/products/trending'),

  getBestSellers: () => apiService.get('/products/best-sellers'),

  getNewArrivals: () => apiService.get('/products/new-arrivals'),

  search: (query: string, params?: any) =>
    apiService.get('/products/search', { query, ...params }),

  getStats: () => apiService.get('/products/stats'),

  export: (params?: any) => apiService.get('/products/export/csv', params),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: any) => apiService.get('/orders', params),

  getById: (id: string) => apiService.get(`/orders/${id}`),

  create: (orderData: any) => apiService.post('/orders', orderData),

  updateStatus: (id: string, status: string, note?: string) =>
    apiService.patch(`/orders/${id}/status`, { status, note }),

  updateShipping: (id: string, shippingData: any) =>
    apiService.patch(`/orders/${id}/shipping`, shippingData),

  processRefund: (id: string, refundData: any) =>
    apiService.post(`/orders/${id}/refund`, refundData),

  cancel: (id: string, reason?: string) =>
    apiService.post(`/orders/${id}/cancel`, { reason }),

  getByStatus: (status: string, params?: any) =>
    apiService.get(`/orders/status/${status}`, params),

  getCustomerOrders: (params?: any) => apiService.get('/orders/customer/me', params),

  getSellerOrders: (params?: any) => apiService.get('/orders/seller/me', params),

  getStats: (params?: any) => apiService.get('/orders/stats/overview', params),

  export: (params?: any) => apiService.get('/orders/export/csv', params),
};

// Categories API
export const categoriesAPI = {
  getAll: (params?: any) => apiService.get('/categories', params),

  getById: (id: string) => apiService.get(`/categories/${id}`),

  create: (categoryData: any) => apiService.post('/categories', categoryData),

  update: (id: string, categoryData: any) => apiService.put(`/categories/${id}`, categoryData),

  delete: (id: string) => apiService.delete(`/categories/${id}`),

  getTree: (params?: any) => apiService.get('/categories/tree', params),

  getFeatured: (limit?: number) => apiService.get('/categories/featured', { limit }),

  getMenu: () => apiService.get('/categories/menu'),

  search: (query: string, params?: any) =>
    apiService.get('/categories/search', { query, ...params }),

  getStats: () => apiService.get('/categories/stats'),

  updateAnalytics: (id: string) => apiService.post(`/categories/${id}/analytics`),
};

// Reviews API
export const reviewsAPI = {
  getAll: (params?: any) => apiService.get('/reviews', params),

  getById: (id: string) => apiService.get(`/reviews/${id}`),

  create: (reviewData: any) => apiService.post('/reviews', reviewData),

  update: (id: string, reviewData: any) => apiService.put(`/reviews/${id}`, reviewData),

  delete: (id: string) => apiService.delete(`/reviews/${id}`),

  getByProduct: (productId: string, params?: any) =>
    apiService.get(`/reviews/product/${productId}`, params),

  getByCustomer: (customerId: string, params?: any) =>
    apiService.get(`/reviews/customer/${customerId}`, params),

  approve: (id: string) => apiService.patch(`/reviews/${id}/approve`),

  reject: (id: string, reason?: string) =>
    apiService.patch(`/reviews/${id}/reject`, { reason }),

  markHelpful: (id: string) => apiService.post(`/reviews/${id}/helpful`),

  markUnhelpful: (id: string) => apiService.post(`/reviews/${id}/unhelpful`),

  addReply: (id: string, replyData: any) =>
    apiService.post(`/reviews/${id}/reply`, replyData),

  flag: (id: string, flagData: any) =>
    apiService.post(`/reviews/${id}/flag`, flagData),

  getFeatured: (limit?: number) => apiService.get('/reviews/featured', { limit }),

  getPending: (limit?: number) => apiService.get('/reviews/pending', { limit }),

  getStats: (params?: any) => apiService.get('/reviews/stats', params),

  search: (query: string, params?: any) =>
    apiService.get('/reviews/search', { query, ...params }),
};

// Coupons API
export const couponsAPI = {
  getAll: (params?: any) => apiService.get('/coupons', params),

  getById: (id: string) => apiService.get(`/coupons/${id}`),

  create: (couponData: any) => apiService.post('/coupons', couponData),

  update: (id: string, couponData: any) => apiService.put(`/coupons/${id}`, couponData),

  delete: (id: string) => apiService.delete(`/coupons/${id}`),

  getByCode: (code: string) => apiService.get(`/coupons/code/${code}`),

  getActive: () => apiService.get('/coupons/active'),

  getAutoApply: (orderAmount?: number) =>
    apiService.get('/coupons/auto-apply', { orderAmount }),

  validate: (code: string, userId: string, orderAmount: number, items: any[]) =>
    apiService.post('/coupons/validate', { code, userId, orderAmount, items }),

  apply: (code: string, userId: string, orderId: string, discountAmount: number, orderAmount: number) =>
    apiService.post('/coupons/apply', { code, userId, orderId, discountAmount, orderAmount }),

  getStats: () => apiService.get('/coupons/stats'),

  search: (query: string, params?: any) =>
    apiService.get('/coupons/search', { query, ...params }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: (params?: any) => apiService.get('/analytics/dashboard', params),

  getSales: (params?: any) => apiService.get('/analytics/sales', params),

  getOrders: (params?: any) => apiService.get('/analytics/orders', params),

  getProducts: (params?: any) => apiService.get('/analytics/products', params),

  getCustomers: (params?: any) => apiService.get('/analytics/customers', params),

  getRevenue: (params?: any) => apiService.get('/analytics/revenue', params),

  getTopProducts: (params?: any) => apiService.get('/analytics/top-products', params),

  getTopCategories: (params?: any) => apiService.get('/analytics/top-categories', params),

  getTopCustomers: (params?: any) => apiService.get('/analytics/top-customers', params),

  getConversion: (params?: any) => apiService.get('/analytics/conversion', params),

  getTraffic: (params?: any) => apiService.get('/analytics/traffic', params),
};

// AI API
export const aiAPI = {
  getRecommendations: (userId: string, params?: any) =>
    apiService.get(`/ai/recommendations/${userId}`, params),

  search: (query: string, params?: any) =>
    apiService.post('/ai/search', { query, ...params }),

  generateDescription: (productData: any) =>
    apiService.post('/ai/generate-description', productData),

  analyzeSentiment: (text: string) =>
    apiService.post('/ai/sentiment-analysis', { text }),

  getInsights: (productId: string) =>
    apiService.get(`/ai/insights/${productId}`),
};

// Blockchain API
export const blockchainAPI = {
  getBalance: (address: string) =>
    apiService.get(`/blockchain/balance/${address}`),

  processPayment: (paymentData: any) =>
    apiService.post('/blockchain/payment', paymentData),

  verifyTransaction: (txHash: string) =>
    apiService.get(`/blockchain/verify/${txHash}`),

  getEscrow: (orderId: string) =>
    apiService.get(`/blockchain/escrow/${orderId}`),

  releaseEscrow: (orderId: string) =>
    apiService.post(`/blockchain/escrow/${orderId}/release`),

  refundEscrow: (orderId: string) =>
    apiService.post(`/blockchain/escrow/${orderId}/refund`),
};

// Verifications API
export const verificationsAPI = {
  getAll: (params?: any) => apiService.get('/admin/verifications', params),

  getSellerDetails: (sellerId: string) => 
    apiService.get(`/admin/verifications/seller/${sellerId}`),

  updateSectionStatus: (sellerId: string, section: 'pss' | 'edr' | 'emo', status: 'approved' | 'rejected', notes?: string) =>
    apiService.patch(`/admin/verifications/seller/${sellerId}/${section}`, { 
      status, 
      reviewerNotes: notes
    }),

  // Legacy methods (keeping for backward compatibility)
  getById: (id: string) => apiService.get(`/admin/verifications/${id}`),

  updateStatus: (id: string, status: 'approved' | 'rejected', notes?: string) =>
    apiService.patch(`/admin/verifications/${id}`, { 
      status, 
      reviewerNotes: notes
    }),

  getByStatus: (status: string, params?: any) =>
    apiService.get('/admin/verifications', { status, ...params }),

  getByDocumentType: (documentType: string, params?: any) =>
    apiService.get('/admin/verifications', { documentType, ...params }),

  getStats: () => apiService.get('/admin/verifications/stats'),
};

export default api;
