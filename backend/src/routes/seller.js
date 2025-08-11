const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { catchAsync } = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { sellerAuth } = require('../middleware/sellerAuth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// ========================================
// SELLER AUTHENTICATION
// ========================================

// Seller login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw new ApiError(400, 'Please check the following fields:', formattedErrors);
  }

  const { email, password } = req.body;

  // Find seller by email
  const seller = await Seller.findOne({ email }).select('+password');
  if (!seller) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if seller is active
  if (!seller.isActive) {
    throw new ApiError(401, 'Your account has been deactivated. Please contact support.');
  }

  // Check if seller is locked
  if (seller.isLocked()) {
    throw new ApiError(423, 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.');
  }

  // Verify password
  const isPasswordValid = await seller.comparePassword(password);
  if (!isPasswordValid) {
    // Increment login attempts
    await seller.incLoginAttempts();
    throw new ApiError(401, 'Invalid email or password');
  }

  // Reset login attempts on successful login
  await seller.resetLoginAttempts();

  // Generate JWT token
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { 
      sellerId: seller._id, 
      email: seller.email,
      businessName: seller.businessName,
      sqlLevel: seller.sqlLevel || 'Free'
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  res.json(new ApiResponse(200, 'Seller login successful', {
    seller: {
      id: seller._id,
      businessName: seller.businessName,
      email: seller.email,
      status: seller.status,
      verificationStatus: seller.verificationStatus,
      sqlLevel: seller.sqlLevel || 'Free'
    },
    token
  }));
}));

// Seller logout
router.post('/logout', catchAsync(async (req, res) => {
  // For JWT tokens, logout is typically handled client-side by removing the token
  // But we can add server-side logic here if needed (e.g., blacklisting tokens)
  
  res.json(new ApiResponse(200, 'Seller logout successful', {}));
}));

// ========================================
// SELLER REGISTRATION & PROFILE
// ========================================

// Register new seller
router.post('/register', [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('businessType').isIn(['individual', 'company', 'partnership']).withMessage('Valid business type is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('address').isObject().withMessage('Address is required'),
  body('documents').isArray().withMessage('Documents are required'),
  body('bankDetails').isObject().withMessage('Bank details are required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format validation errors for better user experience
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw new ApiError(400, 'Please check the following fields:', formattedErrors);
  }

  const {
    businessName,
    businessType,
    email,
    phone,
    address,
    documents,
    bankDetails,
    description,
    categories,
    socialMedia
  } = req.body;

  // Check if seller already exists with more specific error messages
  const existingSellerByEmail = await Seller.findOne({ email });
  const existingSellerByPhone = await Seller.findOne({ phone });

  if (existingSellerByEmail && existingSellerByPhone) {
    throw new ApiError(409, 'A seller account already exists with both this email and phone number. Please use different credentials or contact support for assistance.');
  } else if (existingSellerByEmail) {
    throw new ApiError(409, 'A seller account already exists with this email address. Please use a different email or try logging in if you already have an account.');
  } else if (existingSellerByPhone) {
    throw new ApiError(409, 'A seller account already exists with this phone number. Please use a different phone number or try logging in if you already have an account.');
  }

  // Create seller
  const seller = new Seller({
    userId: req.user?.userId || 'temp_user_id',
    name: businessName, // Required field
    email,
    password: 'temp_password_' + Date.now(), // Required field - will be updated later
    contact: phone, // Required field
    location: `${address.city || ''}, ${address.state || ''}, ${address.country || ''}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''),
    sellerType: 'store', // Required field
    shopName: businessName, // Required field
    businessName,
    businessType,
    address,
    documents,
    bankDetails,
    description,
    categories,
    socialMedia,
    status: 'pending',
    verificationStatus: 'pending'
  });

  try {
    await seller.save();
  } catch (saveError) {
    console.error('Seller save error:', saveError);
    
    // Handle specific database errors
    if (saveError.code === 11000) {
      // Duplicate key error - this shouldn't happen since we checked above, but handle it anyway
      const field = Object.keys(saveError.keyValue)[0];
      throw new ApiError(409, `A seller account already exists with this ${field}. Please use different credentials.`);
    } else if (saveError.name === 'ValidationError') {
      const validationErrors = Object.values(saveError.errors).map(err => err.message).join(', ');
      throw new ApiError(400, `Validation failed: ${validationErrors}`);
    } else {
      throw new ApiError(500, 'Failed to create seller account. Please try again or contact support.');
    }
  }

  res.status(201).json(new ApiResponse(201, 'Seller registration successful', {
    seller: {
      id: seller._id,
      businessName: seller.businessName,
      status: seller.status,
      verificationStatus: seller.verificationStatus
    }
  }));
}));

// Get seller profile
router.get('/profile', sellerAuth, catchAsync(async (req, res) => {
  console.log('Profile request received');
  console.log('Authenticated seller ID:', req.seller._id);

  const seller = await Seller.findById(req.seller._id)
    .populate('categories', 'name');

  if (!seller) {
    throw new ApiError(404, 'Seller profile not found');
  }

  console.log('Found seller:', {
    id: seller._id,
    name: seller.name,
    serviceSQL_level: seller.serviceSQL_level,
    productSQL_level: seller.productSQL_level
  });

  res.json(new ApiResponse(200, 'Seller profile retrieved successfully', {
    seller
  }));
}));

// Get current seller verification status
router.get('/verification-status', sellerAuth, catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.seller._id)
    .select('serviceVerification serviceSQL_level productSQL_level sqlLevelUpdatedAt');

  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  res.json(new ApiResponse(200, 'Verification status retrieved successfully', {
    serviceVerification: seller.serviceVerification,
    serviceSQL_level: seller.serviceSQL_level,
    productSQL_level: seller.productSQL_level,
    sqlLevelUpdatedAt: seller.sqlLevelUpdatedAt
  }));
}));

// Update seller profile
router.put('/profile', sellerAuth, [
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

  const seller = await Seller.findById(req.seller._id);
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

// ========================================
// DOCUMENT SUBMISSION & VERIFICATION
// ========================================

// Submit documents for verification (separate submissions for PSS/EDR/EMO)
router.post('/submit-documents/:section', sellerAuth, upload.fields([
  { name: 'pss', maxCount: 1 },
  { name: 'edr', maxCount: 1 },
  { name: 'emo', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
  { name: 'cnic', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 }
]), catchAsync(async (req, res) => {
    console.log(`Document submission request received for section: ${req.params.section}`);
    console.log('Files received:', req.files);
    console.log('Authenticated seller:', req.seller._id);
  
    try {
      const { section } = req.params;
      
      // Validate section
      if (!['pss', 'edr', 'emo'].includes(section)) {
        throw new ApiError(400, 'Invalid verification section. Must be pss, edr, or emo');
      }
      
      // Use authenticated seller
      const seller = req.seller;

      const uploadedDocs = {};
      const cloudinaryService = require('../services/cloudinaryService');

      // Process each uploaded file
      for (const [fieldName, files] of Object.entries(req.files || {})) {
        if (files && files.length > 0) {
          const file = files[0];
          
          try {
            console.log(`Uploading ${fieldName} to Cloudinary...`);
            const result = await cloudinaryService.uploadFile(file.buffer, {
              folder: `seller-documents/${section}`,
              public_id: `${sellerId}_${fieldName}_${Date.now()}`,
              resource_type: 'auto'
            });
            console.log(`Upload successful for ${fieldName}:`, result.url);

            uploadedDocs[fieldName] = result.url;
          } catch (uploadError) {
            console.error(`Failed to upload ${fieldName}:`, uploadError);
            throw new ApiError(500, `Failed to upload ${fieldName}: ${uploadError.message}`);
          }
        }
      }

      // Map uploaded documents to the correct schema structure
      const kycUpdate = {};
      const serviceVerificationUpdate = {};
      
      // Handle section-specific documents
      if (section === 'pss') {
        if (uploadedDocs.pss) {
          kycUpdate['kyc_docs.pss'] = uploadedDocs.pss;
        }
        if (uploadedDocs.cnic) {
          kycUpdate['kyc_docs.cnic.frontImage'] = uploadedDocs.cnic;
        }
        serviceVerificationUpdate[`serviceVerification.pss`] = {
          status: 'pending',
          submittedAt: new Date()
        };
      } else if (section === 'edr') {
        if (uploadedDocs.edr) {
          kycUpdate['kyc_docs.edr'] = uploadedDocs.edr;
        }
        if (uploadedDocs.businessLicense) {
          kycUpdate['kyc_docs.businessLicense.image'] = uploadedDocs.businessLicense;
        }
        serviceVerificationUpdate[`serviceVerification.edr`] = {
          status: 'pending',
          submittedAt: new Date()
        };
      } else if (section === 'emo') {
        if (uploadedDocs.emo) {
          kycUpdate['kyc_docs.emo'] = uploadedDocs.emo;
        }
        if (uploadedDocs.addressProof) {
          kycUpdate['kyc_docs.addressProof.image'] = uploadedDocs.addressProof;
        }
        if (uploadedDocs.bankStatement) {
          kycUpdate['kyc_docs.bankStatement.image'] = uploadedDocs.bankStatement;
        }
        serviceVerificationUpdate[`serviceVerification.emo`] = {
          status: 'pending',
          submittedAt: new Date()
        };
      }

      // Combine all updates
      const allUpdates = { ...kycUpdate, ...serviceVerificationUpdate };

      // Update seller with document URLs and verification status
      await Seller.findByIdAndUpdate(
        sellerId,
        { 
          $set: allUpdates,
          $currentDate: { updatedAt: true }
        },
        { new: true, runValidators: false }
      );

      console.log(`${section.toUpperCase()} documents saved successfully for seller:`, sellerId);
      console.log('Documents uploaded:', Object.keys(uploadedDocs));

      res.json(new ApiResponse(200, `${section.toUpperCase()} documents submitted successfully`, {
        sellerId: sellerId,
        section: section,
        documentsSubmitted: Object.keys(uploadedDocs),
        submittedAt: new Date()
      }));
    } catch (error) {
      console.error(`Error in ${req.params.section} document submission:`, error);
      throw new ApiError(500, `Failed to submit ${req.params.section} documents: ` + error.message);
    }
}));

// Submit documents for verification (legacy route - all documents at once)
router.post('/submit-documents', sellerAuth, upload.fields([
  { name: 'pss', maxCount: 1 },
  { name: 'edr', maxCount: 1 },
  { name: 'emo', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 },
  { name: 'cnic', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'bankStatement', maxCount: 1 }
]), catchAsync(async (req, res) => {
    console.log('Document submission request received');
    console.log('Authenticated seller:', req.seller._id);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files);
    console.log('Cloudinary config check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    });  try {
    const { submittedAt } = req.body;
    
    // Use authenticated seller
    const seller = req.seller;

    const uploadedDocs = {};
    const cloudinaryService = require('../services/cloudinaryService');

    // Process each uploaded file
    for (const [fieldName, files] of Object.entries(req.files || {})) {
      if (files && files.length > 0) {
        const file = files[0];
        
        try {
          // Upload to Cloudinary
          console.log(`Uploading ${fieldName} to Cloudinary...`);
          const result = await cloudinaryService.uploadFile(file.buffer, {
            folder: 'seller-documents',
            public_id: `${sellerId}_${fieldName}_${Date.now()}`,
            resource_type: 'auto'
          });
          console.log(`Upload successful for ${fieldName}:`, result.url);

          uploadedDocs[fieldName] = result.url; // Store just the URL string
        } catch (uploadError) {
          console.error(`Failed to upload ${fieldName}:`, uploadError);
          throw new ApiError(500, `Failed to upload ${fieldName}: ${uploadError.message}`);
        }
      }
    }

    // Map uploaded documents to the correct schema structure
    const kycUpdate = {};
    const verificationUpdate = {};
    
    if (uploadedDocs.cnic) {
      kycUpdate['kyc_docs.cnic.frontImage'] = uploadedDocs.cnic;
    }
    if (uploadedDocs.businessLicense) {
      kycUpdate['kyc_docs.businessLicense.image'] = uploadedDocs.businessLicense;
    }
    if (uploadedDocs.addressProof) {
      kycUpdate['kyc_docs.addressProof.image'] = uploadedDocs.addressProof;
    }
    if (uploadedDocs.bankStatement) {
      kycUpdate['kyc_docs.bankStatement.image'] = uploadedDocs.bankStatement;
    }
    if (uploadedDocs.pss) {
      kycUpdate['kyc_docs.pss'] = uploadedDocs.pss;
      verificationUpdate['productVerification.pss'] = {
        status: 'pending',
        submittedAt: new Date(),
        documentUrl: uploadedDocs.pss
      };
    }
    if (uploadedDocs.edr) {
      kycUpdate['kyc_docs.edr'] = uploadedDocs.edr;
      verificationUpdate['productVerification.edr'] = {
        status: 'pending',
        submittedAt: new Date(),
        documentUrl: uploadedDocs.edr
      };
    }
    if (uploadedDocs.emo) {
      kycUpdate['kyc_docs.emo'] = uploadedDocs.emo;
      verificationUpdate['productVerification.emo'] = {
        status: 'pending',
        submittedAt: new Date(),
        documentUrl: uploadedDocs.emo
      };
    }

    // Combine all updates
    const allUpdates = { ...kycUpdate, ...verificationUpdate };

    // Update seller with document URLs and verification status
    await Seller.findByIdAndUpdate(
      sellerId,
      { 
        $set: allUpdates,
        $currentDate: { updatedAt: true }
      },
      { new: true, runValidators: false }
    );

    console.log('Documents saved successfully for seller:', sellerId);
    console.log('Documents uploaded:', Object.keys(uploadedDocs));

    res.json(new ApiResponse(200, 'Documents submitted successfully', {
      sellerId: sellerId,
      documentsSubmitted: Object.keys(uploadedDocs),
      submittedAt: new Date()
    }));
    } catch (error) {
      console.error('Error in document submission:', error);
      throw new ApiError(500, 'Failed to submit documents: ' + error.message);
    }
}));

// Get seller verification status
router.get('/verification-status/:sellerId', catchAsync(async (req, res) => {
  const { sellerId } = req.params;

  const seller = await Seller.findById(sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  res.json(new ApiResponse(200, 'Verification status retrieved successfully', {
    sellerId: seller._id,
    productVerification: seller.productVerification,
    serviceVerification: seller.serviceVerification,
    kyc_docs: seller.kyc_docs,
    verified: seller.verified
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

// Check verification status and trigger auto-upgrade
router.get('/check-upgrade', catchAsync(async (req, res) => {
  try {
    const sellerToken = req.headers.authorization?.split(' ')[1];
    if (!sellerToken) {
      throw new ApiError(401, 'No seller token provided');
    }

    // Extract seller ID from token
    const payload = JSON.parse(Buffer.from(sellerToken.split('.')[1], 'base64').toString());
    const sellerId = payload.sellerId;

    if (!sellerId) {
      throw new ApiError(401, 'Invalid seller token');
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    console.log('Checking seller:', sellerId);
    console.log('Current SQL levels:', {
      service: seller.serviceSQL_level,
      product: seller.productSQL_level
    });
    console.log('Service verification:', seller.serviceVerification);

    // Manual upgrade check
    const serviceVerification = seller.serviceVerification || {};
    const pssApproved = serviceVerification.pss?.status === 'approved';
    const edrApproved = serviceVerification.edr?.status === 'approved';
    const emoApproved = serviceVerification.emo?.status === 'approved';

    console.log('Verification status:', { pssApproved, edrApproved, emoApproved });

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

    console.log('Calculated new levels:', { newServiceLevel, newProductLevel });

    // Update levels if they have changed
    if (newServiceLevel !== seller.serviceSQL_level || newProductLevel !== seller.productSQL_level) {
      const updatedSeller = await Seller.findByIdAndUpdate(
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

      console.log(`Upgraded seller ${sellerId} SQL levels: Service=${newServiceLevel}, Product=${newProductLevel}`);

      res.json(new ApiResponse(200, 'SQL levels upgraded successfully', {
        oldLevels: {
          service: seller.serviceSQL_level,
          product: seller.productSQL_level
        },
        newLevels: {
          service: newServiceLevel,
          product: newProductLevel
        },
        seller: updatedSeller
      }));
    } else {
      res.json(new ApiResponse(200, 'SQL levels are already correct', {
        currentLevels: {
          service: seller.serviceSQL_level,
          product: seller.productSQL_level
        },
        verificationStatus: { pssApproved, edrApproved, emoApproved }
      }));
    }
  } catch (error) {
    console.error('Error in check-upgrade:', error);
    throw new ApiError(500, 'Failed to check/upgrade SQL levels: ' + error.message);
  }
}));

module.exports = router;
