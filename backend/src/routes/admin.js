const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// ADMIN DASHBOARD
// ========================================

// Get admin dashboard stats
router.get('/dashboard', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Mock dashboard stats (in real app, calculate from database)
  const dashboardStats = {
    period,
    overview: {
      totalUsers: 1250,
      totalSellers: 180,
      totalProducts: 2500,
      totalOrders: 850,
      totalRevenue: 125000,
      activeUsers: 450,
      newUsers: 25,
      pendingApprovals: 15
    },
    revenue: {
      currentPeriod: 125000,
      previousPeriod: 110000,
      growth: 13.6,
      averageOrderValue: 147,
      topProducts: [
        { name: 'Product A', revenue: 15000 },
        { name: 'Product B', revenue: 12000 },
        { name: 'Product C', revenue: 10000 }
      ]
    },
    orders: {
      total: 850,
      pending: 45,
      processing: 120,
      shipped: 200,
      delivered: 485,
      cancelled: 15,
      averageProcessingTime: '2.3 days'
    },
    users: {
      total: 1250,
      active: 450,
      new: 25,
      sellers: 180,
      customers: 1070,
      topPerformingSellers: [
        { name: 'Seller A', revenue: 25000 },
        { name: 'Seller B', revenue: 20000 },
        { name: 'Seller C', revenue: 18000 }
      ]
    },
    complaints: {
      total: 45,
      open: 15,
      resolved: 25,
      escalated: 5,
      averageResolutionTime: '2.5 days'
    }
  };

  res.json(new ApiResponse(200, 'Admin dashboard stats retrieved successfully', {
    dashboardStats
  }));
}));

// ========================================
// USER MANAGEMENT
// ========================================

// Get all users
router.get('/users', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, role, search } = req.query;

  // Mock users (in real app, fetch from database)
  const users = [
    {
      id: 'user_1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'customer',
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 'user_2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'seller',
      status: 'active',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter users
  let filteredUsers = users;
  if (status) {
    filteredUsers = filteredUsers.filter(u => u.status === status);
  }
  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }
  if (search) {
    filteredUsers = filteredUsers.filter(u =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Users retrieved successfully', {
    users: paginatedUsers,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredUsers.length / limit),
      total: filteredUsers.length
    }
  }));
}));

// Get user by ID
router.get('/users/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock user (in real app, fetch from database)
  const user = {
    id: id,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    role: 'customer',
    status: 'active',
    createdAt: new Date(),
    lastLogin: new Date(Date.now() - 3600000),
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001'
      }
    }
  };

  res.json(new ApiResponse(200, 'User retrieved successfully', {
    user
  }));
}));

// Update user
router.put('/users/:id', [
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Valid status is required'),
  body('role').optional().isIn(['customer', 'seller', 'admin']).withMessage('Valid role is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { status, role } = req.body;

  // Mock update (in real app, update in database)
  const user = {
    id: id,
    status: status || 'active',
    role: role || 'customer',
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'User updated successfully', {
    user
  }));
}));

// ========================================
// SELLER MANAGEMENT
// ========================================

// Get all sellers
router.get('/sellers', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, verificationStatus } = req.query;

  // Mock sellers (in real app, fetch from database)
  const sellers = [
    {
      id: 'seller_1',
      businessName: 'Tech Store',
      email: 'tech@example.com',
      status: 'approved',
      verificationStatus: 'verified',
      createdAt: new Date()
    },
    {
      id: 'seller_2',
      businessName: 'Fashion Boutique',
      email: 'fashion@example.com',
      status: 'pending',
      verificationStatus: 'pending',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter sellers
  let filteredSellers = sellers;
  if (status) {
    filteredSellers = filteredSellers.filter(s => s.status === status);
  }
  if (verificationStatus) {
    filteredSellers = filteredSellers.filter(s => s.verificationStatus === verificationStatus);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedSellers = filteredSellers.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Sellers retrieved successfully', {
    sellers: paginatedSellers,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredSellers.length / limit),
      total: filteredSellers.length
    }
  }));
}));

// Approve/reject seller
router.put('/sellers/:id/approve', [
  body('status').isIn(['approved', 'rejected']).withMessage('Valid status is required'),
  body('reason').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { status, reason } = req.body;

  // Mock update (in real app, update in database)
  const seller = {
    id: id,
    status: status,
    verificationStatus: status,
    approvedAt: status === 'approved' ? new Date() : null,
    approvalReason: reason
  };

  res.json(new ApiResponse(200, `Seller ${status} successfully`, {
    seller
  }));
}));

// ========================================
// PRODUCT MANAGEMENT
// ========================================

// Get all products
router.get('/products', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, category, seller } = req.query;

  // Mock products (in real app, fetch from database)
  const products = [
    {
      id: 'product_1',
      name: 'Smartphone',
      price: 599.99,
      status: 'active',
      category: 'Electronics',
      seller: 'Tech Store',
      createdAt: new Date()
    },
    {
      id: 'product_2',
      name: 'T-Shirt',
      price: 29.99,
      status: 'active',
      category: 'Clothing',
      seller: 'Fashion Boutique',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter products
  let filteredProducts = products;
  if (status) {
    filteredProducts = filteredProducts.filter(p => p.status === status);
  }
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  if (seller) {
    filteredProducts = filteredProducts.filter(p => p.seller === seller);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Products retrieved successfully', {
    products: paginatedProducts,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredProducts.length / limit),
      total: filteredProducts.length
    }
  }));
}));

// Update product status
router.put('/products/:id/status', [
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Valid status is required'),
  body('reason').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { status, reason } = req.body;

  // Mock update (in real app, update in database)
  const product = {
    id: id,
    status: status,
    updatedAt: new Date(),
    reason: reason
  };

  res.json(new ApiResponse(200, 'Product status updated successfully', {
    product
  }));
}));

// ========================================
// ORDER MANAGEMENT
// ========================================

// Get all orders
router.get('/orders', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;

  // Mock orders (in real app, fetch from database)
  const orders = [
    {
      id: 'order_1',
      orderNumber: 'ORD-001',
      customer: 'John Doe',
      total: 599.99,
      status: 'delivered',
      createdAt: new Date()
    },
    {
      id: 'order_2',
      orderNumber: 'ORD-002',
      customer: 'Jane Smith',
      total: 29.99,
      status: 'processing',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter orders
  let filteredOrders = orders;
  if (status) {
    filteredOrders = filteredOrders.filter(o => o.status === status);
  }
  if (dateFrom || dateTo) {
    filteredOrders = filteredOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      if (dateFrom && orderDate < new Date(dateFrom)) return false;
      if (dateTo && orderDate > new Date(dateTo)) return false;
      return true;
    });
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Orders retrieved successfully', {
    orders: paginatedOrders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredOrders.length / limit),
      total: filteredOrders.length
    }
  }));
}));

// Update order status
router.put('/orders/:id/status', [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required'),
  body('notes').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { status, notes } = req.body;

  // Mock update (in real app, update in database)
  const order = {
    id: id,
    status: status,
    updatedAt: new Date(),
    notes: notes
  };

  res.json(new ApiResponse(200, 'Order status updated successfully', {
    order
  }));
}));

// ========================================
// ANALYTICS & REPORTS
// ========================================

// Get sales analytics
router.get('/analytics/sales', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Mock sales analytics (in real app, calculate from database)
  const salesAnalytics = {
    period,
    totalRevenue: 125000,
    totalOrders: 850,
    averageOrderValue: 147,
    revenueGrowth: 13.6,
    topProducts: [
      { name: 'Product A', revenue: 15000, units: 25 },
      { name: 'Product B', revenue: 12000, units: 40 },
      { name: 'Product C', revenue: 10000, units: 30 }
    ],
    revenueByDay: [
      { date: '2025-07-01', revenue: 4000 },
      { date: '2025-07-02', revenue: 4500 },
      { date: '2025-07-03', revenue: 3800 }
    ]
  };

  res.json(new ApiResponse(200, 'Sales analytics retrieved successfully', {
    salesAnalytics
  }));
}));

// Get user analytics
router.get('/analytics/users', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Mock user analytics (in real app, calculate from database)
  const userAnalytics = {
    period,
    totalUsers: 1250,
    activeUsers: 450,
    newUsers: 25,
    userGrowth: 8.5,
    topPerformingUsers: [
      { name: 'John Doe', orders: 15, revenue: 2500 },
      { name: 'Jane Smith', orders: 12, revenue: 2000 },
      { name: 'Bob Johnson', orders: 10, revenue: 1800 }
    ],
    userActivityByDay: [
      { date: '2025-07-01', activeUsers: 150 },
      { date: '2025-07-02', activeUsers: 165 },
      { date: '2025-07-03', activeUsers: 140 }
    ]
  };

  res.json(new ApiResponse(200, 'User analytics retrieved successfully', {
    userAnalytics
  }));
}));

// ========================================
// SYSTEM SETTINGS
// ========================================

// Get system settings
router.get('/settings', catchAsync(async (req, res) => {
  // Mock system settings (in real app, fetch from database)
  const settings = {
    platform: {
      name: 'GoSeller',
      version: '1.0.0',
      maintenance: false,
      maintenanceMessage: ''
    },
    payment: {
      stripeEnabled: true,
      paypalEnabled: true,
      razorpayEnabled: true,
      commissionRate: 5
    },
    notification: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: true
    },
    security: {
      maxLoginAttempts: 5,
      sessionTimeout: 3600,
      passwordMinLength: 8
    }
  };

  res.json(new ApiResponse(200, 'System settings retrieved successfully', {
    settings
  }));
}));

// Update system settings
router.put('/settings', [
  body('settings').isObject().withMessage('Settings object is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { settings } = req.body;

  // Mock update (in real app, update in database)
  const updatedSettings = {
    ...settings,
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'System settings updated successfully', {
    settings: updatedSettings
  }));
}));

module.exports = router;
