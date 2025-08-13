import axios from 'axios';

// API base URL - use Vite's import.meta.env for environment variables
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect for seller login attempts - let the component handle the error
    if (error.response?.status === 401 && !error.config?.url?.includes('/seller/login')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// SELLER REGISTRATION API
// ========================================

export interface SellerRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  businessName: string;
  businessType: string;
  businessLicense: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  sellerCategory: string;
  distributionArea?: string;
  authorizedTerritories?: string;
  parentCompanyId?: string;
  storeDescription: string;
  storeCategory: string;
  storeLogo?: File;
  storeBanner?: File;
  businessDocuments?: File[];
}

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  sellerCategory: string;
  sqlLevel: string;
  status: string;
  capabilities: {
    productListing: boolean;
    priceControl: boolean;
    orderHandling: boolean;
    franchiseIncomeContribution: boolean;
    supplyChainFlowMonitoring: boolean;
    bulkOrderTools: boolean;
    dashboardRoleAccess: string;
  };
  verificationStatus: {
    pss: string;
    edr: string;
    emo: string;
  };
}

export const sellerRegistrationAPI = {
  // Register new seller
  register: async (data: SellerRegistrationData): Promise<{ seller: SellerProfile }> => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach(key => {
      if (key !== 'storeLogo' && key !== 'storeBanner' && key !== 'businessDocuments') {
        formData.append(key, data[key as keyof SellerRegistrationData] as string);
      }
    });

    // Add files
    if (data.storeLogo) {
      formData.append('storeLogo', data.storeLogo);
    }
    if (data.storeBanner) {
      formData.append('storeBanner', data.storeBanner);
    }
    if (data.businessDocuments) {
      data.businessDocuments.forEach((file, index) => {
        formData.append('businessDocuments', file);
      });
    }

    const response = await api.post('/seller-registration/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // Extract the data from ApiResponse structure
    return response.data.data;
  },

  // Get seller profile
  getProfile: async (sellerId: string): Promise<{ seller: any }> => {
    const response = await api.get(`/seller-registration/profile/${sellerId}`);
    return response.data.data;
  },

  // Update seller profile
  updateProfile: async (sellerId: string, data: any): Promise<{ seller: any }> => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach(key => {
      if (key !== 'storeLogo' && key !== 'storeBanner' && key !== 'businessDocuments') {
        formData.append(key, data[key]);
      }
    });

    // Add files
    if (data.storeLogo) {
      formData.append('storeLogo', data.storeLogo);
    }
    if (data.storeBanner) {
      formData.append('storeBanner', data.storeBanner);
    }
    if (data.businessDocuments) {
      data.businessDocuments.forEach((file: File) => {
        formData.append('businessDocuments', file);
      });
    }

    const response = await api.put(`/seller-registration/profile/${sellerId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Get seller statistics
  getStats: async (sellerId: string): Promise<{ stats: any }> => {
    const response = await api.get(`/seller-registration/stats/${sellerId}`);
    return response.data.data;
  },
};

// ========================================
// SELLER AUTHENTICATION API
// ========================================

export interface SellerLoginData {
  email: string;
  password: string;
}

export interface SellerAuthResponse {
  token: string;
  seller: SellerProfile;
}

export const sellerAuthAPI = {
  // Login seller
  login: async (data: SellerLoginData): Promise<SellerAuthResponse> => {
    const response = await api.post('/seller/login', data);
    // Extract the data from ApiResponse structure
    return response.data.data;
  },

  // Get seller profile
  getProfile: async (): Promise<{ seller: SellerProfile }> => {
    const response = await api.get('/seller/profile');
    // Extract the data from ApiResponse structure
    return response.data.data;
  },

  // Update seller profile
  updateProfile: async (data: Partial<SellerProfile>): Promise<{ seller: SellerProfile }> => {
    const response = await api.put('/seller/profile', data);
    // Extract the data from ApiResponse structure
    return response.data.data;
  },

  // Logout seller
  logout: async (): Promise<void> => {
    try {
      // Call backend logout endpoint if available
      await api.post('/seller/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.log('Seller logout API call failed, continuing with local logout');
    }
  }
};

// ========================================
// SELLER HIERARCHY API
// ========================================

export interface HierarchyData {
  company: {
    id: string;
    name: string;
    businessName: string;
    category: string;
    location: string;
  };
  dealers: Array<{
    _id: string;
    name: string;
    shopName: string;
    location: string;
    sellerCategory: string;
    supplyChain: any;
    status: string;
    verified: boolean;
  }>;
  wholesalers: Array<{
    _id: string;
    name: string;
    shopName: string;
    location: string;
    sellerCategory: string;
    supplyChain: any;
    status: string;
    verified: boolean;
  }>;
  traders: Array<{
    _id: string;
    name: string;
    shopName: string;
    location: string;
    sellerCategory: string;
    supplyChain: any;
    status: string;
    verified: boolean;
  }>;
  storekeepers: Array<{
    _id: string;
    name: string;
    shopName: string;
    location: string;
    sellerCategory: string;
    supplyChain: any;
    status: string;
    verified: boolean;
  }>;
}

export interface HierarchyStats {
  totalDealers: number;
  totalWholesalers: number;
  totalTraders: number;
  totalStorekeepers: number;
  pendingDealers: number;
  approvedDealers: number;
  rejectedDealers: number;
}

export const sellerHierarchyAPI = {
  // Get company's supply chain hierarchy
  getHierarchy: async (companyId: string): Promise<{ hierarchy: HierarchyData }> => {
    const response = await api.get(`/seller-hierarchy/hierarchy/${companyId}`);
    return response.data.data;
  },

  // Add dealer to company
  addDealer: async (companyId: string, dealerId: string, territories: string[]): Promise<{ dealer: any }> => {
    const response = await api.post('/seller-hierarchy/add-dealer', {
      companyId,
      dealerId,
      territories
    });
    return response.data.data;
  },

  // Remove dealer from company
  removeDealer: async (companyId: string, dealerId: string): Promise<void> => {
    await api.delete(`/seller-hierarchy/remove-dealer/${companyId}/${dealerId}`);
  },

  // Update dealer territories
  updateDealerTerritories: async (dealerId: string, territories: string[]): Promise<{ dealer: any }> => {
    const response = await api.put(`/seller-hierarchy/update-dealer-territories/${dealerId}`, {
      territories
    });
    return response.data.data;
  },

  // Get sellers by category
  getSellersByCategory: async (companyId: string, category: string): Promise<{ sellers: any[], count: number }> => {
    const response = await api.get(`/seller-hierarchy/sellers/${companyId}/${category}`);
    return response.data.data;
  },

  // Approve dealer
  approveDealer: async (dealerId: string): Promise<{ dealer: any }> => {
    const response = await api.put(`/seller-hierarchy/approve-dealer/${dealerId}`);
    return response.data.data;
  },

  // Reject dealer
  rejectDealer: async (dealerId: string, reason: string): Promise<{ dealer: any }> => {
    const response = await api.put(`/seller-hierarchy/reject-dealer/${dealerId}`, {
      reason
    });
    return response.data.data;
  },

  // Get all dealers for a company
  getDealers: async (companyId: string, status?: string, search?: string): Promise<{ dealers: any[], count: number }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    const response = await api.get(`/seller-hierarchy/dealers/${companyId}?${params.toString()}`);
    return response.data.data;
  },

  // Get pending dealers
  getPendingDealers: async (companyId: string): Promise<{ pendingDealers: any[], count: number }> => {
    const response = await api.get(`/seller-hierarchy/pending-dealers/${companyId}`);
    return response.data.data;
  },

  // Get hierarchy statistics
  getStats: async (companyId: string): Promise<{ stats: HierarchyStats }> => {
    const response = await api.get(`/seller-hierarchy/stats/${companyId}`);
    return response.data.data;
  },

  // Get company products for dealer assignment
  getCompanyProducts: async (companyId: string, search?: string, category?: string): Promise<{ products: any[], count: number }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await api.get(`/seller-hierarchy/company-products/${companyId}?${params.toString()}`);
    return response.data.data;
  },

  // Search available dealers on GoSeller platform
  searchAvailableDealers: async (
    companyId: string, 
    search?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ 
    dealers: any[], 
    pagination: { 
      page: number, 
      limit: number, 
      total: number, 
      pages: number 
    } 
  }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/seller-hierarchy/search-available-dealers/${companyId}?${params.toString()}`);
    return response.data.data;
  },

  // Enhanced add dealer with product distribution
  addDealerWithProducts: async (data: {
    companyId: string;
    dealerId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      dealerPrice: number;
      commissionMargin?: number;
      maxStockLimit?: number;
      priceRules?: any;
    }>;
    priceRules?: any;
    commissionMargin?: number;
    expiryDate?: string;
    contractDuration?: number;
  }): Promise<any> => {
    const response = await api.post('/seller-hierarchy/add-dealer', data);
    return response.data.data;
  },

  // Search available wholesalers on GoSeller platform
  searchAvailableWholesalers: async (
    dealerId: string, 
    search?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ 
    wholesalers: any[], 
    pagination: { 
      page: number, 
      limit: number, 
      total: number, 
      pages: number 
    } 
  }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/seller-hierarchy/search-available-wholesalers/${dealerId}?${params.toString()}`);
    return response.data.data;
  },

  // Enhanced add wholesaler with product distribution
  addWholesalerWithProducts: async (data: {
    dealerId: string;
    wholesalerId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      wholesalerPrice: number;
      commissionMargin?: number;
      maxStockLimit?: number;
      priceRules?: any;
    }>;
    priceRules?: any;
    commissionMargin?: number;
    expiryDate?: string;
    contractDuration?: number;
  }): Promise<any> => {
    const response = await api.post('/seller-hierarchy/add-wholesaler', data);
    return response.data.data;
  },

  // Get dealer's wholesaler hierarchy
  getDealerHierarchy: async (dealerId: string): Promise<{ hierarchy: HierarchyData }> => {
    const response = await api.get(`/seller-hierarchy/dealer-hierarchy/${dealerId}`);
    return response.data.data;
  },

  // Remove wholesaler from dealer
  removeWholesaler: async (dealerId: string, wholesalerId: string): Promise<void> => {
    await api.delete(`/seller-hierarchy/remove-wholesaler/${dealerId}/${wholesalerId}`);
  },

  // Get dealer products for wholesaler assignment
  getDealerProducts: async (dealerId: string, search?: string, category?: string): Promise<{ products: any[], count: number }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await api.get(`/seller-hierarchy/dealer-products/${dealerId}?${params.toString()}`);
    return response.data.data;
  },

  // Get wholesaler's trader hierarchy
  getWholesalerHierarchy: async (wholesalerId: string): Promise<{ hierarchy: HierarchyData }> => {
    const response = await api.get(`/seller-hierarchy/wholesaler-hierarchy/${wholesalerId}`);
    return response.data.data;
  },

  // Remove trader from wholesaler
  removeTrader: async (wholesalerId: string, traderId: string): Promise<void> => {
    await api.delete(`/seller-hierarchy/remove-trader/${wholesalerId}/${traderId}`);
  },

  // Get wholesaler products for trader assignment
  getWholesalerProducts: async (wholesalerId: string, search?: string, category?: string): Promise<{ products: any[], count: number }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await api.get(`/seller-hierarchy/wholesaler-products/${wholesalerId}?${params.toString()}`);
    return response.data.data;
  },

  // Search available traders for wholesaler
  searchAvailableTraders: async (
    wholesalerId: string, 
    search?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ 
    traders: any[], 
    pagination: { 
      page: number, 
      limit: number, 
      total: number, 
      pages: number 
    } 
  }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/seller-hierarchy/search-available-traders/${wholesalerId}?${params.toString()}`);
    return response.data.data;
  },

  // Enhanced add trader with product distribution
  addTraderWithProducts: async (data: {
    wholesalerId: string;
    traderId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      traderPrice: number;
      commissionMargin?: number;
      maxStockLimit?: number;
      priceRules?: any;
    }>;
    priceRules?: any;
    commissionMargin?: number;
    expiryDate?: string;
    contractDuration?: number;
  }): Promise<any> => {
    const response = await api.post('/seller-hierarchy/add-trader', data);
    return response.data.data;
  },

  // Get trader's storekeeper hierarchy
  getTraderHierarchy: async (traderId: string): Promise<{ hierarchy: HierarchyData }> => {
    const response = await api.get(`/seller-hierarchy/trader-hierarchy/${traderId}`);
    return response.data.data;
  },

  // Remove storekeeper from trader
  removeStorekeeper: async (traderId: string, storekeeperId: string): Promise<void> => {
    await api.delete(`/seller-hierarchy/remove-storekeeper/${traderId}/${storekeeperId}`);
  },

  // Get trader products for storekeeper assignment
  getTraderProducts: async (traderId: string, search?: string, category?: string): Promise<{ products: any[], count: number }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const response = await api.get(`/seller-hierarchy/trader-products/${traderId}?${params.toString()}`);
    return response.data.data;
  },

  // Search available storekeepers for trader
  searchAvailableStorekeepers: async (
    traderId: string, 
    search?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ 
    storekeepers: any[], 
    pagination: { 
      page: number, 
      limit: number, 
      total: number, 
      pages: number 
    } 
  }> => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await api.get(`/seller-hierarchy/search-available-storekeepers/${traderId}?${params.toString()}`);
    return response.data.data;
  },

  // Enhanced add storekeeper with product distribution
  addStorekeeperWithProducts: async (data: {
    traderId: string;
    storekeeperId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      storekeeperPrice: number;
      commissionMargin?: number;
      maxStockLimit?: number;
      priceRules?: any;
    }>;
    priceRules?: any;
    commissionMargin?: number;
    expiryDate?: string;
    contractDuration?: number;
  }): Promise<any> => {
    const response = await api.post('/seller-hierarchy/add-storekeeper', data);
    return response.data.data;
  }
};

// ========================================
// PRODUCTS API
// ========================================

export interface ProductData {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  subcategory?: string;
  sellerId: string;
  brand: string;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  variants?: Array<{
    name: string;
    options: string[];
  }>;
  images?: File[];
  // Tiered Pricing for Company Sellers
  tieredPricing?: string; // JSON string
  // Enhanced Inventory Management for Company Sellers
  inventory?: string; // JSON string
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  subcategory?: string;
  brand: string;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images: string[];
  tags: string[];
  specifications: Array<{
    name: string;
    value: string;
  }>;
  variants: Array<{
    name: string;
    options: string[];
  }>;
  sellerId: {
    id: string;
    name: string;
    shopName: string;
    location: string;
    SQL_level: string;
    verified: boolean;
  };
  SQL_level: string;
  status: string;
  isActive: boolean;
  views: number;
  sales: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const productsAPI = {
  // Create new product
  create: async (data: ProductData): Promise<{ product: any }> => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach(key => {
      if (key !== 'images' && key !== 'tags' && key !== 'specifications' && key !== 'variants' && key !== 'dimensions' && key !== 'tieredPricing' && key !== 'inventory') {
        formData.append(key, data[key as keyof ProductData] as string);
      }
    });

    // Add arrays as JSON strings
    if (data.tags) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.specifications) {
      formData.append('specifications', JSON.stringify(data.specifications));
    }
    if (data.variants) {
      formData.append('variants', JSON.stringify(data.variants));
    }
    if (data.dimensions) {
      formData.append('dimensions', JSON.stringify(data.dimensions));
    }
    
    // Add tiered pricing and inventory for Company sellers
    if (data.tieredPricing) {
      formData.append('tieredPricing', data.tieredPricing);
    }
    if (data.inventory) {
      formData.append('inventory', data.inventory);
    }

    // Add images
    if (data.images) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await api.post('/products/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all products with filters
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sqlLevel?: string;
    sellerId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get('/products', { params });
    return response.data.data; // Access the data property from ApiResponse
  },

  // Get single product
  getById: async (id: string): Promise<{ product: Product }> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  // Get products by seller
  getBySeller: async (sellerId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get(`/products/seller/${sellerId}`, { params });
    return response.data.data; // Access the data property from ApiResponse
  },

  // Update product
  update: async (id: string, data: Partial<ProductData>): Promise<{ product: any }> => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(data).forEach(key => {
      if (key !== 'images' && key !== 'tags' && key !== 'specifications' && key !== 'variants' && key !== 'dimensions') {
        formData.append(key, data[key as keyof ProductData] as string);
      }
    });

    // Add arrays as JSON strings
    if (data.tags) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    if (data.specifications) {
      formData.append('specifications', JSON.stringify(data.specifications));
    }
    if (data.variants) {
      formData.append('variants', JSON.stringify(data.variants));
    }
    if (data.dimensions) {
      formData.append('dimensions', JSON.stringify(data.dimensions));
    }

    // Add new images
    if (data.images) {
      data.images.forEach((file) => {
        formData.append('images', file);
      });
    }

    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Get product categories
  getCategories: async (): Promise<{ categories: string[] }> => {
    const response = await api.get('/products/categories/all');
    return response.data.data;
  },

  // Get trending products
  getTrending: async (limit?: number): Promise<{ products: Product[] }> => {
    const response = await api.get('/products/trending/featured', { params: { limit } });
    return response.data.data; // Access the data property from ApiResponse
  },

  // Get products by SQL level
  getBySQLLevel: async (level: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get(`/products/sql-level/${level}`, { params });
    return response.data.data; // Access the data property from ApiResponse
  },
};

// ========================================
// AUTH API
// ========================================

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authAPI = {
  // Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
    return { token, user };
  },

  // Logout
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: any }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const apiUtils = {
  // Handle API errors
  handleError: (error: any) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    return error.message || 'An error occurred';
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  },

  // Get auth token
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },
};

export default api;
