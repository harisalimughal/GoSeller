const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const SQLUpgradeRequest = require('../models/SQLUpgradeRequest');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');
const { sellerAuth, requireSellerVerification } = require('../middleware/sellerAuth');

const router = express.Router();

// Seller Registration (Public)
router.post('/register', catchAsync(async (req, res) => {
  const {
    name,
    email,
    password,
    contact,
    location,
    sellerType,
    shopName,
    businessDetails
  } = req.body;

  // Check if seller already exists
  const existingSeller = await Seller.findByEmail(email);
  if (existingSeller) {
    throw new ApiError(400, 'Seller already exists with this email');
  }

  // Validate seller type
  const validSellerTypes = ['shopkeeper', 'store', 'wholesaler', 'distributor', 'dealer', 'company'];
  if (!validSellerTypes.includes(sellerType)) {
    throw new ApiError(400, 'Invalid seller type');
  }

  // Create seller
  const seller = new Seller({
    name,
    email,
    password,
    contact,
    location,
    sellerType,
    shopName,
    businessDetails
  });

  await seller.save();

  // Generate JWT token
  const token = jwt.sign(
    {
      sellerId: seller._id,
      email: seller.email,
      sellerType: seller.sellerType,
      SQL_level: seller.SQL_level
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  res.status(201).json(new ApiResponse(201, {
    seller: {
      id: seller._id,
      name: seller.name,
      email: seller.email,
      shopName: seller.shopName,
      sellerType: seller.sellerType,
      SQL_level: seller.SQL_level,
      verified: seller.verified,
      status: seller.status
    },
    token
  }, 'Seller registered successfully'));
}));

// Seller Login (Public)
router.post('/login', catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find seller
  const seller = await Seller.findByEmail(email).select('+password');
  if (!seller) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if account is locked
  if (seller.isLocked()) {
    throw new ApiError(423, 'Account is locked due to too many failed attempts. Please try again later.');
  }

  // Check password
  const isPasswordValid = await seller.comparePassword(password);
  if (!isPasswordValid) {
    await seller.incLoginAttempts();
    throw new ApiError(401, 'Invalid credentials');
  }

  // Reset login attempts on successful login
  await seller.resetLoginAttempts();

  // Generate JWT token
  const token = jwt.sign(
    {
      sellerId: seller._id,
      email: seller.email,
      sellerType: seller.sellerType,
      SQL_level: seller.SQL_level
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  res.json(new ApiResponse(200, {
    seller: {
      id: seller._id,
      name: seller.name,
      email: seller.email,
      shopName: seller.shopName,
      sellerType: seller.sellerType,
      SQL_level: seller.SQL_level,
      verified: seller.verified,
      status: seller.status
    },
    token
  }, 'Login successful'));
}));

// Get Seller Profile (Protected)
router.get('/profile', sellerAuth, catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.seller.sellerId).select('-password');
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  res.json(new ApiResponse(200, { seller }, 'Seller profile retrieved'));
}));

// Update Seller Profile (Protected)
router.put('/profile', sellerAuth, catchAsync(async (req, res) => {
  const {
    name,
    contact,
    location,
    shopName,
    businessDetails,
    profileImage,
    coverImage
  } = req.body;

  const seller = await Seller.findById(req.seller.sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Update fields
  if (name) seller.name = name;
  if (contact) seller.contact = contact;
  if (location) seller.location = location;
  if (shopName) seller.shopName = shopName;
  if (businessDetails) seller.businessDetails = businessDetails;
  if (profileImage) seller.profileImage = profileImage;
  if (coverImage) seller.coverImage = coverImage;

  await seller.save();

  res.json(new ApiResponse(200, { seller }, 'Profile updated successfully'));
}));

// Upload KYC Documents (Protected)
router.post('/kyc/upload', sellerAuth, catchAsync(async (req, res) => {
  const { documentType, documentUrl } = req.body;

  const seller = await Seller.findById(req.seller.sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Validate document type
  const validDocTypes = ['CNIC', 'Business_License', 'Tax_Certificate', 'Bank_Statement'];
  if (!validDocTypes.includes(documentType)) {
    throw new ApiError(400, 'Invalid document type');
  }

  // Add document to KYC docs
  seller.kyc_docs.push({
    documentType,
    documentUrl,
    uploadedAt: new Date()
  });

  await seller.save();

  res.json(new ApiResponse(200, {
    kyc_docs: seller.kyc_docs
  }, 'KYC document uploaded successfully'));
}));

// Request SQL Level Upgrade (Protected)
router.post('/sql-upgrade', sellerAuth, catchAsync(async (req, res) => {
  const {
    type,
    productId,
    requestedLevel,
    reason,
    businessPlan,
    financialProjections,
    submittedDocs
  } = req.body;

  const seller = await Seller.findById(req.seller.sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Validate upgrade request
  if (type === 'product' && !productId) {
    throw new ApiError(400, 'Product ID is required for product upgrade');
  }

  // Check if seller can request this level
  const currentLevel = seller.SQL_level;
  const levelOrder = ['Free', 'Basic', 'Normal', 'High', 'VIP'];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const requestedIndex = levelOrder.indexOf(requestedLevel);

  if (requestedIndex <= currentIndex) {
    throw new ApiError(400, 'Requested level must be higher than current level');
  }

  // Check if there's already a pending request
  const existingRequest = await SQLUpgradeRequest.findOne({
    sellerId: seller._id,
    type,
    productId: type === 'product' ? productId : null,
    verificationStatus: 'pending'
  });

  if (existingRequest) {
    throw new ApiError(400, 'You already have a pending upgrade request');
  }

  // Create upgrade request
  const upgradeRequest = new SQLUpgradeRequest({
    sellerId: seller._id,
    productId: type === 'product' ? productId : null,
    type,
    currentLevel,
    requestedLevel,
    reason,
    businessPlan,
    financialProjections,
    submittedDocs
  });

  await upgradeRequest.save();

  res.status(201).json(new ApiResponse(201, {
    upgradeRequest: {
      id: upgradeRequest._id,
      type: upgradeRequest.type,
      currentLevel: upgradeRequest.currentLevel,
      requestedLevel: upgradeRequest.requestedLevel,
      verificationStatus: upgradeRequest.verificationStatus,
      createdAt: upgradeRequest.createdAt
    }
  }, 'SQL upgrade request submitted successfully'));
}));

// Get SQL Upgrade Requests (Protected)
router.get('/sql-upgrade', sellerAuth, catchAsync(async (req, res) => {
  const requests = await SQLUpgradeRequest.findBySeller(req.seller.sellerId);

  res.json(new ApiResponse(200, { requests }, 'SQL upgrade requests retrieved'));
}));

// Get Seller Dashboard Stats (Protected)
router.get('/dashboard', sellerAuth, catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.seller.sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Get pending SQL upgrade requests
  const pendingRequests = await SQLUpgradeRequest.find({
    sellerId: seller._id,
    verificationStatus: 'pending'
  }).countDocuments();

  // Get total SQL upgrade requests
  const totalRequests = await SQLUpgradeRequest.find({
    sellerId: seller._id
  }).countDocuments();

  // Get approved requests
  const approvedRequests = await SQLUpgradeRequest.find({
    sellerId: seller._id,
    verificationStatus: 'approved'
  }).countDocuments();

  // Dashboard stats
  const dashboardStats = {
    seller: {
      name: seller.name,
      shopName: seller.shopName,
      sellerType: seller.sellerType,
      SQL_level: seller.SQL_level,
      verified: seller.verified,
      status: seller.status
    },
    sqlUpgrades: {
      pending: pendingRequests,
      total: totalRequests,
      approved: approvedRequests
    },
    verificationProgress: {
      pss: seller.kyc_docs.some(doc => doc.documentType === 'CNIC' && doc.verified),
      edr: seller.kyc_docs.some(doc => doc.documentType === 'Business_License' && doc.verified),
      emo: seller.kyc_docs.some(doc => doc.documentType === 'Tax_Certificate' && doc.verified)
    }
  };

  res.json(new ApiResponse(200, { dashboardStats }, 'Dashboard stats retrieved'));
}));

// Get Seller Analytics (Protected)
router.get('/analytics', sellerAuth, catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.seller.sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Get SQL upgrade request analytics
  const upgradeAnalytics = await SQLUpgradeRequest.aggregate([
    { $match: { sellerId: seller._id } },
    {
      $group: {
        _id: '$verificationStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get verification progress
  const verificationProgress = {
    pss: seller.kyc_docs.filter(doc => doc.documentType === 'CNIC' && doc.verified).length > 0,
    edr: seller.kyc_docs.filter(doc => doc.documentType === 'Business_License' && doc.verified).length > 0,
    emo: seller.kyc_docs.filter(doc => doc.documentType === 'Tax_Certificate' && doc.verified).length > 0
  };

  const analytics = {
    upgradeAnalytics,
    verificationProgress,
    totalDocuments: seller.kyc_docs.length,
    verifiedDocuments: seller.kyc_docs.filter(doc => doc.verified).length
  };

  res.json(new ApiResponse(200, { analytics }, 'Analytics retrieved'));
}));

// Get All Sellers (Admin only - no auth for now)
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sellerType, SQL_level, verified } = req.query;

  const query = { isActive: true };
  if (sellerType) query.sellerType = sellerType;
  if (SQL_level) query.SQL_level = SQL_level;
  if (verified !== undefined) query.verified = verified === 'true';

  const sellers = await Seller.find(query)
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Seller.countDocuments(query);

  res.json(new ApiResponse(200, {
    sellers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Sellers retrieved'));
}));

// Get Seller by ID (Admin only - no auth for now)
router.get('/:id', catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.params.id).select('-password');
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  res.json(new ApiResponse(200, { seller }, 'Seller retrieved'));
}));

// Update Seller (Admin only - no auth for now)
router.put('/:id', catchAsync(async (req, res) => {
  const { verified, SQL_level, isActive } = req.body;

  const seller = await Seller.findById(req.params.id);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  if (verified !== undefined) seller.verified = verified;
  if (SQL_level) seller.SQL_level = SQL_level;
  if (isActive !== undefined) seller.isActive = isActive;

  await seller.save();

  res.json(new ApiResponse(200, { seller }, 'Seller updated successfully'));
}));

module.exports = router;
