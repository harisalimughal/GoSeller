import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 10000;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  sku: string;
  stock: number;
  rating: number;
  reviews: number;
  tags: string[];
  specifications: Record<string, any>;
  variants?: ProductVariant[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id: string;
  name: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
}

// User Types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  preferences: UserPreferences;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  marketing: boolean;
}

// Order Types
export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
  variant?: ProductVariant;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export interface PaymentMethod {
  type: 'stripe' | 'paypal' | 'crypto' | 'bank_transfer';
  details: any;
}

// Cart Types
export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  coupon?: Coupon;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

// Category Types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  _id: string;
  product: string;
  user: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// Search Types
export interface SearchFilters {
  category?: string;
  brand?: string[];
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'newest' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

// API Service Class
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  private async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.get(url, { params });
    return response.data;
  }

  private async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.post(url, data);
    return response.data;
  }

  private async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.put(url, data);
    return response.data;
  }

  private async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response: AxiosResponse<ApiResponse<T>> = await this.api.delete(url);
    return response.data;
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.post('/auth/login', { email, password });
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.post('/auth/register', userData);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.post('/auth/logout');
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get('/auth/me');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.put('/auth/profile', userData);
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    filters?: SearchFilters;
  }): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return this.get('/products', params);
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.get(`/products/${id}`);
  }

  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.get('/products/featured');
  }

  async getRelatedProducts(productId: string): Promise<ApiResponse<Product[]>> {
    return this.get(`/products/${productId}/related`);
  }

  async searchProducts(query: string, filters?: SearchFilters): Promise<ApiResponse<PaginatedResponse<Product>>> {
    return this.get('/products/search', { q: query, ...filters });
  }

  // Categories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.get('/categories');
  }

  async getCategory(slug: string): Promise<ApiResponse<Category>> {
    return this.get(`/categories/${slug}`);
  }

  // Cart
  async getCart(): Promise<ApiResponse<Cart>> {
    return this.get('/cart');
  }

  async addToCart(productId: string, quantity: number, variantId?: string): Promise<ApiResponse<Cart>> {
    return this.post('/cart/items', { productId, quantity, variantId });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
    return this.put(`/cart/items/${itemId}`, { quantity });
  }

  async removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    return this.delete(`/cart/items/${itemId}`);
  }

  async clearCart(): Promise<ApiResponse<Cart>> {
    return this.delete('/cart');
  }

  async applyCoupon(code: string): Promise<ApiResponse<Cart>> {
    return this.post('/cart/coupon', { code });
  }

  async removeCoupon(): Promise<ApiResponse<Cart>> {
    return this.delete('/cart/coupon');
  }

  // Orders
  async createOrder(orderData: {
    items: Array<{ productId: string; quantity: number; variantId?: string }>;
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    return this.post('/orders', orderData);
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }): Promise<ApiResponse<PaginatedResponse<Order>>> {
    return this.get('/orders', params);
  }

  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    return this.get(`/orders/${orderId}`);
  }

  async cancelOrder(orderId: string): Promise<ApiResponse<Order>> {
    return this.put(`/orders/${orderId}/cancel`);
  }

  // Reviews
  async getProductReviews(productId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
  }): Promise<ApiResponse<PaginatedResponse<Review>>> {
    return this.get(`/products/${productId}/reviews`, params);
  }

  async createReview(productId: string, reviewData: {
    rating: number;
    title: string;
    comment: string;
    images?: string[];
  }): Promise<ApiResponse<Review>> {
    return this.post(`/products/${productId}/reviews`, reviewData);
  }

  async updateReview(reviewId: string, reviewData: Partial<Review>): Promise<ApiResponse<Review>> {
    return this.put(`/reviews/${reviewId}`, reviewData);
  }

  async deleteReview(reviewId: string): Promise<ApiResponse<void>> {
    return this.delete(`/reviews/${reviewId}`);
  }

  // Wishlist
  async getWishlist(): Promise<ApiResponse<Product[]>> {
    return this.get('/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse<Product[]>> {
    return this.post('/wishlist', { productId });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<Product[]>> {
    return this.delete(`/wishlist/${productId}`);
  }

  // Analytics
  async getAnalytics(): Promise<ApiResponse<any>> {
    return this.get('/analytics');
  }

  async getSalesAnalytics(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    return this.get('/analytics/sales', params);
  }

  // AI Recommendations
  async getRecommendations(): Promise<ApiResponse<Product[]>> {
    return this.get('/ai/recommendations');
  }

  async getPersonalizedRecommendations(): Promise<ApiResponse<Product[]>> {
    return this.get('/ai/personalized');
  }

  // Blockchain
  async getCryptoPaymentMethods(): Promise<ApiResponse<any[]>> {
    return this.get('/blockchain/payment-methods');
  }

  async createCryptoPayment(orderId: string, cryptoData: any): Promise<ApiResponse<any>> {
    return this.post(`/blockchain/payments/${orderId}`, cryptoData);
  }

  // File Upload
  async uploadFile(file: File, type: 'product' | 'avatar' | 'review'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.get('/health');
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
