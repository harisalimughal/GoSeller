const express = require('express');
const { body, validationResult } = require('express-validator');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { catchAsync } = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// SELLER REGISTRATION & PROFILE
// ========================================

// Register new seller - MOVED TO sellerRegistration.js to avoid conflicts
// router.post('/register', [
//   body('businessName').trim().notEmpty().withMessage('Business name is required'),
//   body('businessType').isIn(['individual', 'company', 'partnership']).withMessage('Valid business type is required'),
//   body('email').isEmail().withMessage('Valid email is required'),
//   body('phone').isMobilePhone().withMessage('Valid phone number is required'),
//   body('address').isObject().withMessage('Address is required'),
//   body('documents').isArray().withMessage('Documents are required'),
//   body('bankDetails').isObject().withMessage('Bank details are required')
// ], catchAsync(async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // Format validation errors for better user experience
//     const formattedErrors = errors.array().map(error => ({
//       field: error.path,
//       message: error.msg,
//       value: error.value
//     }));
    
//     throw new ApiError(400, 'Please check the following fields:', formattedErrors);
//   }

//   const {
//     businessName,
//     businessType,
//     email,
//     phone,
//     address,
//     documents,
//     bankDetails,
//     description,
//     categories,
//     socialMedia
//   } = req.body;

//   // Check if seller already exists with more specific error messages
//   const existingSellerByEmail = await Seller.findOne({ email });
//   const existingSellerByPhone = await Seller.findOne({ phone });

//   if (existingSellerByEmail && existingSellerByPhone) {
//     throw new ApiError(409, 'A seller account already exists with both this email and phone number. Please use different credentials or contact support for assistance.');
//   } else if (existingSellerByEmail) {
//     throw new ApiError(409, 'A seller account already exists with this email address. Please use a different email or try logging in if you already have an account.');
//   } else if (existingSellerByPhone) {
//     throw new ApiError(409, 'A seller account already exists with this phone number. Please use a different phone number or try logging in if you already have an account.');
//   }

//   // Create seller
//   const seller = new Seller({
//     userId: req.user.userId,
//     name: businessName, // Required field
//     email,
//     password: 'temp_password_' + Date.now(), // Required field - will be updated later
//     contact: phone, // Required field
//     location: `${address.city || ''}, ${address.state || ''}, ${address.country || ''}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''),
//     sellerType: 'store', // Required field
//     shopName: businessName, // Required field
//     businessName,
//     businessType,
//     address,
//     documents,
//     bankDetails,
//     description,
//     categories,
//     socialMedia,
//     status: 'pending',
//     verificationStatus: 'pending'
//   });

//   try {
//     await seller.save();
//   } catch (saveError) {
//     console.error('Seller save error:', saveError);
    
//     // Handle specific database errors
//     if (saveError.code === 11000) {
//       // Duplicate key error - this shouldn't happen since we checked above, but handle it anyway
//       const field = Object.keys(saveError.keyValue)[0];
//       throw new ApiError(409, `A seller account already exists with this ${field}. Please use different credentials.`);
//     } else if (saveError.name === 'ValidationError') {
//       const validationErrors = Object.values(saveError.errors).map(err => err.message).join(', ');
//       throw new ApiError(400, `Validation failed: ${validationErrors}`);
//     } else {
//       throw new ApiError(500, 'Failed to create seller account. Please try again or contact support.');
//     }
//   }

//   // Update user role to seller
//   try {
//     await User.findByIdAndUpdate(req.user.userId, {
//       role: 'seller',
//       userType: 'seller'
//     });
//   } catch (userUpdateError) {
//     console.error('User role update error:', userUpdateError);
//     // Don't fail the entire registration if user role update fails
//     // The seller account was created successfully
//   }

//   res.status(201).json(new ApiResponse(201, 'Seller registration successful', {
//     seller: {
//       id: seller._id,
//       businessName: seller.businessName,
//       status: seller.status,
//       verificationStatus: seller.verificationStatus,
//       sqlLevel: seller.sqlLevel || 'Free'
//     }
//   }));
// }));

// Get seller profile
router.get('/profile', catchAsync(async (req, res) => {
  const seller = await Seller.findOne({ userId: req.user.userId })
    .populate('userId', 'firstName lastName email phone')
    .populate('categories', 'name');

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  res.json(new ApiResponse(200, 'Seller profile retrieved successfully', {
    seller
  }));
}));

// Update seller profile
router.put('/profile', [
  body('businessName').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('address').optional().isObject(),
  body('socialMedia').optional().isObject(),
  body('categories').optional().isArray()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const seller = await Seller.findOne({ userId: req.user.userId });
  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  // Update fields
  const updateFields = ['businessName', 'description', 'address', 'socialMedia', 'categories'];
  updateFields.forEach(field => {
    if (req.body[field] !== undefined) {
      seller[field] = req.body[field];
    }
  });

  await seller.save();

  res.json(new ApiResponse(200, 'Seller profile updated successfully', {
    seller
  }));
}));

// ========================================
// SELLER PRODUCTS
// ========================================

// Get seller products
router.get('/:id/products', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, status, category } = req.query;

  const query = { sellerId: id };

  if (status) {
    query.status = status;
  }

  if (category) {
    query.categoryId = category;
  }

  const products = await Product.find(query)
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.json(new ApiResponse(200, 'Seller products retrieved successfully', {
    products,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Get seller product statistics
router.get('/:id/products/stats', catchAsync(async (req, res) => {
  const { id } = req.params;

  const stats = await Product.aggregate([
    { $match: { sellerId: id } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        inactiveProducts: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
        totalViews: { $sum: '$viewCount' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  res.json(new ApiResponse(200, 'Product statistics retrieved successfully', {
    stats: stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      inactiveProducts: 0,
      totalViews: 0,
      averageRating: 0
    }
  }));
}));

// ========================================
// SELLER ORDERS
// ========================================

// Get seller orders
router.get('/:id/orders', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;

  const query = { 'items.sellerId': id };

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const orders = await Order.find(query)
    .populate('user', 'firstName lastName email')
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Order.countDocuments(query);

  res.json(new ApiResponse(200, 'Seller orders retrieved successfully', {
    orders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Get seller order statistics
router.get('/:id/orders/stats', catchAsync(async (req, res) => {
  const { id } = req.params;
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

  const stats = await Order.aggregate([
    {
      $match: {
        'items.sellerId': id,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
      }
    }
  ]);

  res.json(new ApiResponse(200, 'Order statistics retrieved successfully', {
    stats: stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      completedOrders: 0,
      pendingOrders: 0
    }
  }));
}));

// ========================================
// SELLER ANALYTICS
// ========================================

// Get seller analytics
router.get('/:id/analytics', catchAsync(async (req, res) => {
  const { id } = req.params;
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

  // Get product analytics
  const productStats = await Product.aggregate([
    { $match: { sellerId: id, createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalViews: { $sum: '$viewCount' },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  // Get order analytics
  const orderStats = await Order.aggregate([
    {
      $match: {
        'items.sellerId': id,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  // Get revenue trend
  const revenueTrend = await Order.aggregate([
    {
      $match: {
        'items.sellerId': id,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.json(new ApiResponse(200, 'Seller analytics retrieved successfully', {
    analytics: {
      period,
      productStats: productStats[0] || {
        totalProducts: 0,
        totalViews: 0,
        averageRating: 0
      },
      orderStats: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      },
      revenueTrend
    }
  }));
}));

// ========================================
// SELLER EARNINGS & WITHDRAWALS
// ========================================

// Get seller earnings
router.get('/:id/earnings', catchAsync(async (req, res) => {
  const { id } = req.params;
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

  // Calculate earnings from orders
  const earnings = await Order.aggregate([
    {
      $match: {
        'items.sellerId': id,
        status: { $in: ['completed', 'delivered'] },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        platformFee: { $sum: { $multiply: ['$totalAmount', 0.05] } }, // 5% platform fee
        netEarnings: { $sum: { $multiply: ['$totalAmount', 0.95] } }, // 95% to seller
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  const earningsData = earnings[0] || {
    totalRevenue: 0,
    platformFee: 0,
    netEarnings: 0,
    totalOrders: 0
  };

  res.json(new ApiResponse(200, 'Seller earnings retrieved successfully', {
    earnings: {
      period,
      ...earningsData,
      pendingWithdrawal: 0, // This would come from withdrawal table
      totalWithdrawn: 0 // This would come from withdrawal table
    }
  }));
}));

// Request withdrawal
router.post('/:id/withdraw', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('bankAccount').isString().withMessage('Bank account details are required'),
  body('reason').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { amount, bankAccount, reason } = req.body;

  // Check if seller exists
  const seller = await Seller.findById(id);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Check available balance (this would come from earnings calculation)
  const availableBalance = 10000; // Mock balance
  if (amount > availableBalance) {
    throw new ApiError(400, 'Insufficient balance for withdrawal');
  }

  // Create withdrawal request
  const withdrawal = {
    id: `withdrawal_${Date.now()}`,
    sellerId: id,
    amount,
    bankAccount,
    reason: reason || 'Withdrawal request',
    status: 'pending',
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Withdrawal request created successfully', {
    withdrawal
  }));
}));

// ========================================
// SELLER VERIFICATION
// ========================================

// Submit verification documents
router.post('/:id/verification', [
  body('documents').isArray().withMessage('Documents are required'),
  body('businessDetails').isObject().withMessage('Business details are required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { documents, businessDetails } = req.body;

  const seller = await Seller.findById(id);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Update verification documents
  seller.documents = documents;
  seller.businessDetails = businessDetails;
  seller.verificationStatus = 'pending';
  seller.verificationSubmittedAt = new Date();

  await seller.save();

  res.json(new ApiResponse(200, 'Verification documents submitted successfully', {
    seller: {
      id: seller._id,
      verificationStatus: seller.verificationStatus
    }
  }));
}));

// ========================================
// ADMIN ENDPOINTS
// ========================================

// Get approval queue (admin only)
router.get('/approval-queue', catchAsync(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const sellers = await Seller.find({ status: 'pending' })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Seller.countDocuments({ status: 'pending' });

  res.json(new ApiResponse(200, 'Approval queue retrieved successfully', {
    sellers,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Approve seller (admin only)
router.put('/:id/approve', [
  body('status').isIn(['approved', 'rejected']).withMessage('Valid status is required'),
  body('reason').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { status, reason } = req.body;

  const seller = await Seller.findById(id);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  seller.status = status;
  seller.verificationStatus = status;
  seller.approvedAt = status === 'approved' ? new Date() : null;
  seller.approvalReason = reason;

  await seller.save();

  res.json(new ApiResponse(200, `Seller ${status} successfully`, {
    seller: {
      id: seller._id,
      status: seller.status,
      verificationStatus: seller.verificationStatus
    }
  }));
}));

// Get top performing sellers
router.get('/top-performing', catchAsync(async (req, res) => {
  const { limit = 10, period = '30d' } = req.query;

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

  const topSellers = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ['completed', 'delivered'] }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $group: {
        _id: '$items.sellerId',
        totalRevenue: { $sum: '$items.price' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$items.price' }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    },
    {
      $limit: parseInt(limit)
    },
    {
      $lookup: {
        from: 'sellers',
        localField: '_id',
        foreignField: '_id',
        as: 'seller'
      }
    },
    {
      $unwind: '$seller'
    }
  ]);

  res.json(new ApiResponse(200, 'Top performing sellers retrieved successfully', {
    topSellers,
    period
  }));
}));

module.exports = router;
