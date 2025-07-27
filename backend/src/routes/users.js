const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Seller = require('../models/Seller');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// Get all users (admin only)
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search, userType, isActive } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (userType) {
    query.userType = userType;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.json(new ApiResponse(200, 'Users retrieved successfully', {
    users,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Get user by ID
router.get('/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get seller info if user is a seller
  let seller = null;
  if (user.userType === 'seller') {
    seller = await Seller.findOne({ userId: user._id });
  }

  res.json(new ApiResponse(200, 'User retrieved successfully', {
    user,
    seller
  }));
}));

// Update user
router.put('/:id', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('isActive').optional().isBoolean(),
  body('emailVerified').optional().isBoolean()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { firstName, lastName, phone, isActive, emailVerified, profile } = req.body;

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;
  if (emailVerified !== undefined) user.emailVerified = emailVerified;
  if (profile) user.profile = { ...user.profile, ...profile };

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json(new ApiResponse(200, 'User updated successfully', {
    user: userResponse
  }));
}));

// Delete user
router.delete('/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if user has associated data
  const hasOrders = await require('../models/Order').exists({ userId: req.params.id });
  if (hasOrders) {
    throw new ApiError(400, 'Cannot delete user with existing orders');
  }

  // Delete associated seller profile if exists
  if (user.userType === 'seller') {
    await Seller.findOneAndDelete({ userId: req.params.id });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json(new ApiResponse(200, 'User deleted successfully', {
    message: 'User deleted successfully'
  }));
}));

// Get user statistics
router.get('/stats/overview', catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const customers = await User.countDocuments({ userType: 'customer' });
  const sellers = await User.countDocuments({ userType: 'seller' });
  const verifiedUsers = await User.countDocuments({ emailVerified: true });

  // Get recent registrations
  const recentUsers = await User.find()
    .select('firstName lastName email userType createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json(new ApiResponse(200, 'User statistics retrieved successfully', {
    stats: {
      total: totalUsers,
      active: activeUsers,
      customers,
      sellers,
      verified: verifiedUsers
    },
    recentUsers
  }));
}));

// Get user profile (current user)
router.get('/profile/me', catchAsync(async (req, res) => {
  const user = await User.findById(req.user.userId).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Get seller info if user is a seller
  let seller = null;
  if (user.userType === 'seller') {
    seller = await Seller.findOne({ userId: user._id });
  }

  res.json(new ApiResponse(200, 'Profile retrieved successfully', {
    user,
    seller
  }));
}));

// Update user profile (current user)
router.put('/profile/me', [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const { firstName, lastName, phone, profile } = req.body;

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (profile) user.profile = { ...user.profile, ...profile };

  await user.save();

  // Remove password from response
  const userResponse = user.toObject();
  delete userResponse.password;

  res.json(new ApiResponse(200, 'Profile updated successfully', {
    user: userResponse
  }));
}));

// Get user orders
router.get('/:id/orders', catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { userId: req.params.id };
  if (status) {
    query.status = status;
  }

  const orders = await require('../models/Order').find(query)
    .populate('items.product', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await require('../models/Order').countDocuments(query);

  res.json(new ApiResponse(200, 'User orders retrieved successfully', {
    orders,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Get user reviews
router.get('/:id/reviews', catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await require('../models/Review').find({ userId: req.params.id })
    .populate('product', 'name images')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await require('../models/Review').countDocuments({ userId: req.params.id });

  res.json(new ApiResponse(200, 'User reviews retrieved successfully', {
    reviews,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

module.exports = router;
