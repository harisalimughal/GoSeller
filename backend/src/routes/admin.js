const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

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

  // // Mock sellers (in real app, fetch from database)
  // const sellers = [
  //   {
  //     id: 'seller_1',
  //     businessName: 'Tech Store',
  //     email: 'tech@example.com',
  //     status: 'approved',
  //     verificationStatus: 'verified',
  //     createdAt: new Date()
  //   },
  //   {
  //     id: 'seller_2',
  //     businessName: 'Fashion Boutique',
  //     email: 'fashion@example.com',
  //     status: 'pending',
  //     verificationStatus: 'pending',
  //     createdAt: new Date(Date.now() - 86400000)
  //   }
  // ];

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

// ========================================
// VERIFICATION MANAGEMENT
// ========================================

// Get all sellers for verification
router.get('/verifications', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  
  try {
    const Seller = require('../models/Seller');
    
    // Build filter query - removed isActive filter to show all sellers
    const filter = {};
    
    // If status filter is provided, filter by verification status
    if (status && status !== 'all') {
      filter.$or = [
        { 'serviceVerification.pss.status': status },
        { 'serviceVerification.edr.status': status },
        { 'serviceVerification.emo.status': status }
      ];
    }
    
    console.log('Verification filter:', filter);
    
    // Find sellers with complete information
    const sellers = await Seller.find(filter)
      .select('_id name shopName email contact serviceVerification kyc_docs createdAt profileType sellerType isActive')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log(`Found ${sellers.length} sellers for verification`);
    
    const sellersForVerification = sellers.map(seller => {
      console.log(`Processing seller: ${seller.name}, serviceVerification:`, seller.serviceVerification);
      
      return {
        id: seller._id,
        name: seller.name,
        shopName: seller.shopName,
        email: seller.email,
        contact: seller.contact,
        profileType: seller.profileType,
        sellerType: seller.sellerType,
        submittedAt: seller.createdAt,
        pssStatus: seller.serviceVerification?.pss?.status || 'pending',
        edrStatus: seller.serviceVerification?.edr?.status || 'pending',
        emoStatus: seller.serviceVerification?.emo?.status || 'pending',
        overallStatus: getOverallVerificationStatus(seller.serviceVerification)
      };
    });

    // Get total count for pagination
    const totalCount = await Seller.countDocuments(filter);

    console.log(`Returning ${sellersForVerification.length} sellers for verification`);

    res.json(new ApiResponse(200, 'Sellers for verification retrieved successfully', {
      sellers: sellersForVerification,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount
      }
    }));
  } catch (error) {
    console.error('Error in verifications route:', error);
    throw new ApiError(500, 'Failed to retrieve sellers for verification: ' + error.message);
  }
}));

// Helper function to determine overall verification status
function getOverallVerificationStatus(serviceVerification) {
  if (!serviceVerification) return 'pending';
  
  const statuses = [
    serviceVerification.pss?.status || 'pending',
    serviceVerification.edr?.status || 'pending',
    serviceVerification.emo?.status || 'pending'
  ];
  
  if (statuses.every(status => status === 'approved')) return 'approved';
  if (statuses.some(status => status === 'rejected')) return 'rejected';
  if (statuses.some(status => status === 'approved')) return 'partial';
  return 'pending';
}

// Migration route to initialize serviceVerification for existing sellers
router.post('/verifications/migrate', catchAsync(async (req, res) => {
  try {
    const Seller = require('../models/Seller');
    
    console.log('Starting serviceVerification migration...');
    
    // Find sellers without serviceVerification field
    const sellersToUpdate = await Seller.find({
      $or: [
        { serviceVerification: { $exists: false } },
        { serviceVerification: null },
        { 'serviceVerification.pss': { $exists: false } }
      ]
    });
    
    console.log(`Found ${sellersToUpdate.length} sellers to update`);
    
    // Update each seller
    for (const seller of sellersToUpdate) {
      await Seller.findByIdAndUpdate(seller._id, {
        $set: {
          serviceVerification: {
            pss: { status: 'pending' },
            edr: { status: 'pending' },
            emo: { status: 'pending' }
          }
        }
      });
    }
    
    console.log('Migration completed successfully');
    
    res.json(new ApiResponse(200, 'Migration completed successfully', {
      updated: sellersToUpdate.length
    }));
  } catch (error) {
    console.error('Migration error:', error);
    throw new ApiError(500, 'Migration failed: ' + error.message);
  }
}));

// Migration route to upgrade SQL levels based on verification status
router.post('/verifications/migrate-sql-levels', catchAsync(async (req, res) => {
  try {
    const Seller = require('../models/Seller');
    
    console.log('Starting SQL level migration based on verification status...');
    
    // Find all sellers with service verification data
    const sellers = await Seller.find({
      'serviceVerification': { $exists: true }
    });
    
    console.log(`Found ${sellers.length} sellers to check for SQL level upgrade`);
    
    let upgradedCount = 0;
    
    // Update each seller's SQL level based on their verification status
    for (const seller of sellers) {
      const serviceVerification = seller.serviceVerification || {};
      const pssApproved = serviceVerification.pss?.status === 'approved';
      const edrApproved = serviceVerification.edr?.status === 'approved';
      const emoApproved = serviceVerification.emo?.status === 'approved';

      let newServiceLevel = 'Free';
      let newProductLevel = 'Free';

      // Determine new SQL levels based on verification status
      if (pssApproved && edrApproved && emoApproved) {
        // All three verified → High level
        newServiceLevel = 'High';
        newProductLevel = 'High';
      } else if (pssApproved && edrApproved) {
        // PSS + EDR verified → Normal level
        newServiceLevel = 'Normal';
        newProductLevel = 'Normal';
      } else if (pssApproved) {
        // Only PSS verified → Basic level
        newServiceLevel = 'Basic';
        newProductLevel = 'Basic';
      }

      // Update levels if they need to be changed
      if (newServiceLevel !== seller.serviceSQL_level || newProductLevel !== seller.productSQL_level) {
        await Seller.findByIdAndUpdate(
          seller._id,
          {
            $set: {
              serviceSQL_level: newServiceLevel,
              productSQL_level: newProductLevel,
              sqlLevelUpdatedAt: new Date()
            }
          },
          { new: true, runValidators: false }
        );

        console.log(`Upgraded seller ${seller._id} (${seller.name}) SQL levels: Service=${newServiceLevel}, Product=${newProductLevel}`);
        upgradedCount++;
      }
    }
    
    console.log(`SQL level migration completed successfully. Upgraded ${upgradedCount} sellers.`);
    
    res.json(new ApiResponse(200, 'SQL level migration completed successfully', {
      totalSellers: sellers.length,
      upgradedCount: upgradedCount
    }));
  } catch (error) {
    console.error('SQL level migration error:', error);
    throw new ApiError(500, 'SQL level migration failed: ' + error.message);
  }
}));

// Test route to manually trigger SQL level upgrade for a seller (for testing)
router.post('/verifications/test-upgrade/:sellerId', catchAsync(async (req, res) => {
  const { sellerId } = req.params;
  
  try {
    const Seller = require('../models/Seller');
    const { ObjectId } = require('mongoose').Types;
    
    if (!ObjectId.isValid(sellerId)) {
      throw new ApiError(400, 'Invalid seller ID format');
    }

    // Auto-upgrade seller level based on current verification status
    await autoUpgradeSellerLevel(sellerId);

    const updatedSeller = await Seller.findById(sellerId)
      .select('name serviceSQL_level productSQL_level serviceVerification sqlLevelUpdatedAt');

    res.json(new ApiResponse(200, 'SQL level upgrade test completed', {
      seller: updatedSeller
    }));
  } catch (error) {
    console.error('Test upgrade error:', error);
    throw new ApiError(500, 'Test upgrade failed: ' + error.message);
  }
}));

// Get seller details for verification
router.get('/verifications/seller/:sellerId', catchAsync(async (req, res) => {
  const { sellerId } = req.params;
  
  try {
    const Seller = require('../models/Seller');
    const { ObjectId } = require('mongoose').Types;
    
    if (!ObjectId.isValid(sellerId)) {
      throw new ApiError(400, 'Invalid seller ID format');
    }
    
    const seller = await Seller.findById(sellerId)
      .select('_id name shopName email contact profileType sellerType serviceVerification kyc_docs businessDetails address createdAt');
    
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }
    
    // Organize documents by verification type
    const verificationSections = {
      pss: {
        status: seller.serviceVerification?.pss?.status || 'pending',
        verifiedAt: seller.serviceVerification?.pss?.verifiedAt,
        verifiedBy: seller.serviceVerification?.pss?.verifiedBy,
        notes: seller.serviceVerification?.pss?.notes,
        documents: []
      },
      edr: {
        status: seller.serviceVerification?.edr?.status || 'pending',
        verifiedAt: seller.serviceVerification?.edr?.verifiedAt,
        verifiedBy: seller.serviceVerification?.edr?.verifiedBy,
        notes: seller.serviceVerification?.edr?.notes,
        documents: []
      },
      emo: {
        status: seller.serviceVerification?.emo?.status || 'pending',
        verifiedAt: seller.serviceVerification?.emo?.verifiedAt,
        verifiedBy: seller.serviceVerification?.emo?.verifiedBy,
        notes: seller.serviceVerification?.emo?.notes,
        documents: []
      }
    };
    
    // Add PSS related documents
    if (seller.kyc_docs?.pss) {
      verificationSections.pss.documents.push({
        type: 'pss',
        name: 'PSS Document',
        url: seller.kyc_docs.pss
      });
    }
    if (seller.kyc_docs?.cnic?.frontImage) {
      verificationSections.pss.documents.push({
        type: 'cnic',
        name: 'CNIC Document',
        url: seller.kyc_docs.cnic.frontImage
      });
    }
    
    // Add EDR related documents (business license, etc.)
    if (seller.kyc_docs?.edr) {
      verificationSections.edr.documents.push({
        type: 'edr',
        name: 'EDR Document',
        url: seller.kyc_docs.edr
      });
    }
    if (seller.kyc_docs?.businessLicense?.image) {
      verificationSections.edr.documents.push({
        type: 'businessLicense',
        name: 'Business License',
        url: seller.kyc_docs.businessLicense.image
      });
    }
    
    // Add EMO related documents (address proof, bank statement, etc.)
    if (seller.kyc_docs?.emo) {
      verificationSections.emo.documents.push({
        type: 'emo',
        name: 'EMO Document',
        url: seller.kyc_docs.emo
      });
    }
    if (seller.kyc_docs?.addressProof?.image) {
      verificationSections.emo.documents.push({
        type: 'addressProof',
        name: 'Address Proof',
        url: seller.kyc_docs.addressProof.image
      });
    }
    if (seller.kyc_docs?.bankStatement?.image) {
      verificationSections.emo.documents.push({
        type: 'bankStatement',
        name: 'Bank Statement',
        url: seller.kyc_docs.bankStatement.image
      });
    }
    
    const sellerDetails = {
      id: seller._id,
      name: seller.name,
      shopName: seller.shopName,
      email: seller.email,
      contact: seller.contact,
      profileType: seller.profileType,
      sellerType: seller.sellerType,
      businessDetails: seller.businessDetails,
      address: seller.address,
      registeredAt: seller.createdAt,
      verificationSections
    };
    
    res.json(new ApiResponse(200, 'Seller details retrieved successfully', {
      seller: sellerDetails
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to retrieve seller details: ' + error.message);
  }
}));

// Update service verification status for a specific section (PSS/EDR/EMO)
router.patch('/verifications/seller/:sellerId/:section', catchAsync(async (req, res) => {
  const { sellerId, section } = req.params;
  const { status, reviewerNotes } = req.body;

  console.log('Service verification update request:', { sellerId, section, status, reviewerNotes });

  try {
    const Seller = require('../models/Seller');
    const { ObjectId } = require('mongoose').Types;
    
    // Validate input
    if (!ObjectId.isValid(sellerId)) {
      throw new ApiError(400, 'Invalid seller ID format');
    }

    if (!['pss', 'edr', 'emo'].includes(section)) {
      throw new ApiError(400, 'Invalid verification section. Must be pss, edr, or emo');
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }

    // Update service verification status using direct database update
    const updateData = {};
    updateData[`serviceVerification.${section}.status`] = status;
    updateData[`serviceVerification.${section}.verifiedAt`] = new Date();
    updateData[`serviceVerification.${section}.verifiedBy`] = 'admin';
    if (reviewerNotes) {
      updateData[`serviceVerification.${section}.notes`] = reviewerNotes;
    }

    console.log('Update data:', updateData);

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!updatedSeller) {
      throw new ApiError(404, 'Seller not found');
    }

    // Auto-upgrade SQL level based on verification status
    await autoUpgradeSellerLevel(updatedSeller._id);

    console.log('Service verification updated successfully');

    res.json(new ApiResponse(200, 'Service verification status updated successfully', {
      sellerId,
      section,
      status,
      reviewedAt: new Date()
    }));
  } catch (error) {
    console.error('Service verification update error:', error);
    throw new ApiError(500, 'Failed to update service verification: ' + error.message);
  }
}));

// Auto-upgrade seller SQL level based on verification status
async function autoUpgradeSellerLevel(sellerId) {
  try {
    const Seller = require('../models/Seller');
    const seller = await Seller.findById(sellerId);
    
    if (!seller) return;

    const serviceVerification = seller.serviceVerification || {};
    const pssApproved = serviceVerification.pss?.status === 'approved';
    const edrApproved = serviceVerification.edr?.status === 'approved';
    const emoApproved = serviceVerification.emo?.status === 'approved';

    let newServiceLevel = seller.serviceSQL_level;
    let newProductLevel = seller.productSQL_level;

    // Determine new SQL levels based on verification status
    if (pssApproved && edrApproved && emoApproved) {
      // All three verified → High level
      newServiceLevel = 'High';
      newProductLevel = 'High';
    } else if (pssApproved && edrApproved) {
      // PSS + EDR verified → Normal level
      newServiceLevel = 'Normal';
      newProductLevel = 'Normal';
    } else if (pssApproved) {
      // Only PSS verified → Basic level
      newServiceLevel = 'Basic';
      newProductLevel = 'Basic';
    } else {
      // No verifications approved → Free level
      newServiceLevel = 'Free';
      newProductLevel = 'Free';
    }

    // Update levels if they have changed
    if (newServiceLevel !== seller.serviceSQL_level || newProductLevel !== seller.productSQL_level) {
      await Seller.findByIdAndUpdate(
        sellerId,
        {
          $set: {
            serviceSQL_level: newServiceLevel,
            productSQL_level: newProductLevel,
            sqlLevelUpdatedAt: new Date()
          }
        },
        { new: true, runValidators: false }
      );

      console.log(`Auto-upgraded seller ${sellerId} SQL levels: Service=${newServiceLevel}, Product=${newProductLevel}`);
    }
  } catch (error) {
    console.error('Error in auto-upgrade seller level:', error);
  }
}

// Update verification status (legacy route - keeping for backward compatibility)
router.patch('/verifications/:verificationId', catchAsync(async (req, res) => {
  const { verificationId } = req.params;
  const { status, reviewerNotes } = req.body;

  console.log('Verification update request:', { verificationId, status, reviewerNotes });

  try {
    const Seller = require('../models/Seller');
    const { ObjectId } = require('mongoose').Types;
    
    // Parse verification ID to get seller ID and document type
    const [sellerId, documentType] = verificationId.split('_');
    console.log('Parsed IDs:', { sellerId, documentType });
    
    // Validate input
    if (!sellerId || !documentType) {
      throw new ApiError(400, 'Invalid verification ID format');
    }

    // Validate ObjectId
    if (!ObjectId.isValid(sellerId)) {
      throw new ApiError(400, 'Invalid seller ID format');
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }

    // Update verification status using direct database update
    const updateData = {};
    updateData[`productVerification.${documentType}.status`] = status;
    updateData[`productVerification.${documentType}.verifiedAt`] = new Date();
    updateData[`productVerification.${documentType}.verifiedBy`] = 'admin';
    if (reviewerNotes) {
      updateData[`productVerification.${documentType}.notes`] = reviewerNotes;
    }

    console.log('Update data:', updateData);

    const updatedSeller = await Seller.findByIdAndUpdate(
      sellerId,
      { $set: updateData },
      { new: true, runValidators: false }
    );

    if (!updatedSeller) {
      throw new ApiError(404, 'Seller not found');
    }

    console.log('Verification updated successfully');

    res.json(new ApiResponse(200, 'Verification status updated successfully', {
      verificationId,
      status,
      reviewedAt: new Date()
    }));
  } catch (error) {
    console.error('Verification update error:', error);
    throw new ApiError(500, 'Failed to update verification: ' + error.message);
  }
}));

// Get verification details
router.get('/verifications/:verificationId', catchAsync(async (req, res) => {
  const { verificationId } = req.params;

  try {
    const Seller = require('../models/Seller');
    
    const [sellerId, documentType] = verificationId.split('_');
    
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    const docMappings = {
      'pss': 'pss',
      'edr': 'edr', 
      'emo': 'emo',
      'businessLicense': 'businessLicense.image',
      'cnic': 'cnic.frontImage',
      'addressProof': 'addressProof.image',
      'bankStatement': 'bankStatement.image'
    };
    
    const schemaPath = docMappings[documentType];
    const docValue = schemaPath.includes('.') 
      ? seller.kyc_docs?.[schemaPath.split('.')[0]]?.[schemaPath.split('.')[1]]
      : seller.kyc_docs?.[schemaPath];

    if (!docValue) {
      throw new ApiError(404, 'Document not found');
    }

    const verification = {
      id: verificationId,
      sellerId: seller._id,
      sellerName: seller.shopName || seller.name,
      documentType: documentType,
      documentName: `${documentType.toUpperCase()} Document`,
      status: seller.productVerification?.[documentType]?.status || 'pending',
      submittedAt: seller.createdAt,
      reviewedAt: seller.productVerification?.[documentType]?.verifiedAt,
      reviewerNotes: seller.productVerification?.[documentType]?.notes,
      fileUrl: docValue,
      documentUrl: seller.kyc_docs?.[documentType]?.url
    };

    res.json(new ApiResponse(200, 'Verification details retrieved successfully', {
      verification
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to retrieve verification details: ' + error.message);
  }
}));

module.exports = router;
