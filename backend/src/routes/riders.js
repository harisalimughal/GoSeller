const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// RIDER MANAGEMENT
// ========================================

// Register rider
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  body('vehicleType').isIn(['bike', 'car', 'van']).withMessage('Valid vehicle type is required'),
  body('vehicleNumber').isString().withMessage('Vehicle number is required'),
  body('location').isObject().withMessage('Location is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { name, email, phone, vehicleType, vehicleNumber, location, documents } = req.body;

  // Mock rider registration (in real app, create in database)
  const rider = {
    id: `rider_${Date.now()}`,
    name,
    email,
    phone,
    vehicleType,
    vehicleNumber,
    location,
    documents: documents || [],
    status: 'pending',
    createdAt: new Date()
  };

  res.status(201).json(new ApiResponse(201, 'Rider registered successfully', {
    rider
  }));
}));

// Get rider by ID
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock rider (in real app, fetch from database)
  const rider = {
    id: id,
    name: 'John Rider',
    email: 'john@rider.com',
    phone: '+1234567890',
    vehicleType: 'bike',
    vehicleNumber: 'ABC123',
    location: {
      address: '123 Rider Street',
      city: 'New York',
      state: 'NY',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    status: 'active',
    rating: 4.8,
    totalDeliveries: 150,
    joinedDate: new Date('2023-01-15'),
    documents: [
      { type: 'license', status: 'verified' },
      { type: 'insurance', status: 'verified' }
    ]
  };

  res.json(new ApiResponse(200, 'Rider retrieved successfully', {
    rider
  }));
}));

// Get all riders
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, vehicleType } = req.query;

  // Mock riders (in real app, fetch from database)
  const riders = [
    {
      id: 'rider_1',
      name: 'John Rider',
      vehicleType: 'bike',
      status: 'active',
      rating: 4.8,
      totalDeliveries: 150,
      createdAt: new Date()
    },
    {
      id: 'rider_2',
      name: 'Jane Driver',
      vehicleType: 'car',
      status: 'pending',
      rating: 0,
      totalDeliveries: 0,
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter riders
  let filteredRiders = riders;
  if (status) {
    filteredRiders = filteredRiders.filter(r => r.status === status);
  }
  if (vehicleType) {
    filteredRiders = filteredRiders.filter(r => r.vehicleType === vehicleType);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedRiders = filteredRiders.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Riders retrieved successfully', {
    riders: paginatedRiders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredRiders.length / limit),
      total: filteredRiders.length
    }
  }));
}));

// Update rider
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone(),
  body('location').optional().isObject(),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { name, phone, location, status } = req.body;

  // Mock update (in real app, update in database)
  const rider = {
    id: id,
    name: name || 'John Rider',
    phone: phone || '+1234567890',
    location: location || { city: 'New York', state: 'NY' },
    status: status || 'active',
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Rider updated successfully', {
    rider
  }));
}));

// ========================================
// RIDER DELIVERIES
// ========================================

// Get rider deliveries
router.get('/:id/deliveries', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, status } = req.query;

  // Mock deliveries (in real app, fetch from database)
  const deliveries = [
    {
      id: 'delivery_1',
      riderId: id,
      orderId: 'order_123',
      pickupAddress: '123 Store Street',
      deliveryAddress: '456 Customer Avenue',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'delivery_2',
      riderId: id,
      orderId: 'order_456',
      pickupAddress: '789 Warehouse Road',
      deliveryAddress: '321 Home Street',
      status: 'in_progress',
      createdAt: new Date()
    }
  ];

  // Filter deliveries
  let filteredDeliveries = deliveries;
  if (status) {
    filteredDeliveries = filteredDeliveries.filter(d => d.status === status);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Rider deliveries retrieved successfully', {
    deliveries: paginatedDeliveries,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredDeliveries.length / limit),
      total: filteredDeliveries.length
    }
  }));
}));

// Assign delivery to rider
router.post('/:id/assign-delivery', [
  body('deliveryId').isString().withMessage('Delivery ID is required'),
  body('estimatedTime').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { deliveryId, estimatedTime } = req.body;

  // Mock assignment (in real app, update in database)
  const assignment = {
    id: `assignment_${Date.now()}`,
    riderId: id,
    deliveryId: deliveryId,
    estimatedTime: estimatedTime || '30 minutes',
    status: 'assigned',
    assignedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Delivery assigned to rider successfully', {
    assignment
  }));
}));

// Update delivery status
router.put('/:id/deliveries/:deliveryId/status', [
  body('status').isIn(['picked_up', 'in_transit', 'delivered', 'failed']).withMessage('Valid status is required'),
  body('notes').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id, deliveryId } = req.params;
  const { status, notes } = req.body;

  // Mock update (in real app, update in database)
  const delivery = {
    id: deliveryId,
    riderId: id,
    status: status,
    notes: notes,
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Delivery status updated successfully', {
    delivery
  }));
}));

// ========================================
// RIDER LOCATION & TRACKING
// ========================================

// Update rider location
router.put('/:id/location', [
  body('latitude').isNumeric().withMessage('Valid latitude is required'),
  body('longitude').isNumeric().withMessage('Valid longitude is required'),
  body('address').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { latitude, longitude, address } = req.body;

  // Mock location update (in real app, update in database)
  const location = {
    riderId: id,
    coordinates: { lat: latitude, lng: longitude },
    address: address || 'Current location',
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Rider location updated successfully', {
    location
  }));
}));

// Get rider location
router.get('/:id/location', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock location (in real app, fetch from database)
  const location = {
    riderId: id,
    coordinates: { lat: 40.7128, lng: -74.0060 },
    address: '123 Rider Street, New York, NY',
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Rider location retrieved successfully', {
    location
  }));
}));

// Get nearby riders
router.get('/nearby', catchAsync(async (req, res) => {
  const { latitude, longitude, radius = 5, vehicleType } = req.query;

  if (!latitude || !longitude) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  // Mock nearby riders (in real app, calculate from database)
  const nearbyRiders = [
    {
      id: 'rider_1',
      name: 'John Rider',
      vehicleType: 'bike',
      distance: 0.5,
      rating: 4.8,
      available: true
    },
    {
      id: 'rider_2',
      name: 'Jane Driver',
      vehicleType: 'car',
      distance: 1.2,
      rating: 4.6,
      available: true
    }
  ];

  // Filter by vehicle type if specified
  let filteredRiders = nearbyRiders;
  if (vehicleType) {
    filteredRiders = filteredRiders.filter(r => r.vehicleType === vehicleType);
  }

  res.json(new ApiResponse(200, 'Nearby riders retrieved successfully', {
    location: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
    radius: parseFloat(radius),
    riders: filteredRiders
  }));
}));

// ========================================
// RIDER PERFORMANCE
// ========================================

// Get rider performance
router.get('/:id/performance', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { period = '30d' } = req.query;

  // Mock performance data (in real app, calculate from database)
  const performance = {
    period,
    overview: {
      totalDeliveries: 150,
      completedDeliveries: 145,
      failedDeliveries: 5,
      averageRating: 4.8,
      totalEarnings: 2500.00
    },
    trends: {
      deliveriesGrowth: 12.5,
      ratingGrowth: 0.2,
      earningsGrowth: 15.8
    },
    monthlyStats: [
      { month: 'January', deliveries: 45, earnings: 750.00 },
      { month: 'February', deliveries: 52, earnings: 850.00 },
      { month: 'March', deliveries: 48, earnings: 800.00 }
    ]
  };

  res.json(new ApiResponse(200, 'Rider performance retrieved successfully', {
    performance
  }));
}));

// ========================================
// RIDER APPROVAL
// ========================================

// Approve rider
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
  const rider = {
    id: id,
    status: status,
    approvedAt: status === 'approved' ? new Date() : null,
    approvalReason: reason
  };

  res.json(new ApiResponse(200, `Rider ${status} successfully`, {
    rider
  }));
}));

module.exports = router;
