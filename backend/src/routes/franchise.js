const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// FRANCHISE MANAGEMENT
// ========================================

// Register franchise
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Franchise name is required'),
  body('type').isIn(['master', 'sub', 'delivery']).withMessage('Valid franchise type is required'),
  body('location').isObject().withMessage('Location is required'),
  body('contact').isObject().withMessage('Contact details are required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { name, type, location, contact, description } = req.body;

  // Mock franchise creation (in real app, create in database)
  const franchise = {
    id: `franchise_${Date.now()}`,
    name,
    type,
    location,
    contact,
    description: description || '',
    status: 'pending',
    createdAt: new Date()
  };

  res.status(201).json(new ApiResponse(201, 'Franchise registered successfully', {
    franchise
  }));
}));

// Get franchise by ID
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock franchise (in real app, fetch from database)
  const franchise = {
    id: id,
    name: 'Tech Solutions Franchise',
    type: 'master',
    location: {
      address: '123 Tech Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    contact: {
      email: 'tech@franchise.com',
      phone: '+1234567890',
      manager: 'John Manager'
    },
    status: 'active',
    createdAt: new Date(),
    performance: {
      totalOrders: 1500,
      totalRevenue: 75000,
      activeSellers: 25
    }
  };

  res.json(new ApiResponse(200, 'Franchise retrieved successfully', {
    franchise
  }));
}));

// Get all franchises
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;

  // Mock franchises (in real app, fetch from database)
  const franchises = [
    {
      id: 'franchise_1',
      name: 'Tech Solutions Franchise',
      type: 'master',
      location: { city: 'New York', state: 'NY' },
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 'franchise_2',
      name: 'Fashion Hub Franchise',
      type: 'sub',
      location: { city: 'Los Angeles', state: 'CA' },
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter franchises
  let filteredFranchises = franchises;
  if (type) {
    filteredFranchises = filteredFranchises.filter(f => f.type === type);
  }
  if (status) {
    filteredFranchises = filteredFranchises.filter(f => f.status === status);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedFranchises = filteredFranchises.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Franchises retrieved successfully', {
    franchises: paginatedFranchises,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredFranchises.length / limit),
      total: filteredFranchises.length
    }
  }));
}));

// Update franchise
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('location').optional().isObject(),
  body('contact').optional().isObject(),
  body('description').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { name, location, contact, description } = req.body;

  // Mock update (in real app, update in database)
  const franchise = {
    id: id,
    name: name || 'Tech Solutions Franchise',
    location: location || { city: 'New York', state: 'NY' },
    contact: contact || { email: 'tech@franchise.com' },
    description: description || '',
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Franchise updated successfully', {
    franchise
  }));
}));

// ========================================
// FRANCHISE PERFORMANCE
// ========================================

// Get franchise performance
router.get('/:id/performance', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { period = '30d' } = req.query;

  // Mock performance data (in real app, calculate from database)
  const performance = {
    period,
    overview: {
      totalOrders: 1500,
      totalRevenue: 75000,
      activeSellers: 25,
      averageOrderValue: 50
    },
    trends: {
      ordersGrowth: 15.5,
      revenueGrowth: 12.3,
      sellerGrowth: 8.2
    },
    topSellers: [
      { name: 'Seller A', orders: 150, revenue: 7500 },
      { name: 'Seller B', orders: 120, revenue: 6000 },
      { name: 'Seller C', orders: 100, revenue: 5000 }
    ]
  };

  res.json(new ApiResponse(200, 'Franchise performance retrieved successfully', {
    performance
  }));
}));

// ========================================
// FRANCHISE APPROVAL
// ========================================

// Approve franchise
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

  // Mock update (in real app, update in database)
  const franchise = {
    id: id,
    status: status,
    approvedAt: status === 'approved' ? new Date() : null,
    approvalReason: reason
  };

  res.json(new ApiResponse(200, `Franchise ${status} successfully`, {
    franchise
  }));
}));

module.exports = router;
