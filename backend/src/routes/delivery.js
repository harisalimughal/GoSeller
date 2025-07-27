const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const Franchise = require('../models/Franchise');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// Create delivery request
router.post('/request', [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('deliveryAddress').isObject().withMessage('Delivery address is required'),
  body('deliveryType').isIn(['standard', 'express', 'same_day']).withMessage('Valid delivery type is required'),
  body('specialInstructions').optional().trim()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { orderId, deliveryAddress, deliveryType, specialInstructions } = req.body;

  // Check if order exists and belongs to user
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.user.toString() !== req.user.userId) {
    throw new ApiError(403, 'You can only create delivery requests for your own orders');
  }

  // Check if delivery already exists for this order
  const existingDelivery = await Delivery.findOne({ orderId });
  if (existingDelivery) {
    throw new ApiError(409, 'Delivery request already exists for this order');
  }

  // Find nearest franchise for delivery
  const nearestFranchise = await findNearestFranchise(deliveryAddress);
  if (!nearestFranchise) {
    throw new ApiError(400, 'No delivery service available in this area');
  }

  // Calculate delivery fee based on type and distance
  const deliveryFee = calculateDeliveryFee(deliveryType, nearestFranchise.distance);

  // Create delivery request
  const delivery = new Delivery({
    orderId,
    user: req.user.userId,
    franchise: nearestFranchise.franchiseId,
    deliveryAddress,
    deliveryType,
    deliveryFee,
    specialInstructions,
    status: 'pending',
    estimatedDeliveryTime: calculateEstimatedDeliveryTime(deliveryType, nearestFranchise.distance)
  });

  await delivery.save();

  // Update order with delivery information
  order.delivery = {
    deliveryId: delivery._id,
    deliveryFee,
    estimatedDeliveryTime: delivery.estimatedDeliveryTime
  };
  order.totalAmount += deliveryFee;
  await order.save();

  // Send notification to franchise
  await sendFranchiseNotification(nearestFranchise.franchiseId, {
    type: 'new_delivery_request',
    orderId,
    deliveryId: delivery._id,
    deliveryAddress,
    deliveryType
  });

  res.status(201).json(new ApiResponse(201, 'Delivery request created successfully', {
    delivery,
    franchise: nearestFranchise
  }));
}));

// Get delivery status
router.get('/status/:deliveryId', catchAsync(async (req, res) => {
  const { deliveryId } = req.params;

  const delivery = await Delivery.findById(deliveryId)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('franchise', 'name location contactInfo')
    .populate('user', 'firstName lastName phone');

  if (!delivery) {
    throw new ApiError(404, 'Delivery not found');
  }

  // Check if user has permission to view this delivery
  if (delivery.user.toString() !== req.user.userId && req.user.userType !== 'admin') {
    throw new ApiError(403, 'Access denied');
  }

  res.json(new ApiResponse(200, 'Delivery status retrieved successfully', { delivery }));
}));

// Update delivery status (franchise only)
router.put('/status/:deliveryId', [
  body('status').isIn(['accepted', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed']).withMessage('Valid status is required'),
  body('notes').optional().trim(),
  body('location').optional().isObject()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { deliveryId } = req.params;
  const { status, notes, location } = req.body;

  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw new ApiError(404, 'Delivery not found');
  }

  // Check if user is from the assigned franchise
  if (delivery.franchise.toString() !== req.user.franchiseId) {
    throw new ApiError(403, 'You can only update deliveries assigned to your franchise');
  }

  // Update delivery status
  delivery.status = status;
  delivery.notes = notes || delivery.notes;

  if (location) {
    delivery.currentLocation = location;
  }

  // Add status update to history
  delivery.statusHistory.push({
    status,
    updatedAt: new Date(),
    updatedBy: req.user.userId,
    notes
  });

  await delivery.save();

  // Send notification to customer
  await sendCustomerNotification(delivery.user, {
    type: 'delivery_status_update',
    deliveryId,
    status,
    orderNumber: delivery.orderId
  });

  // Update order status if delivery is completed
  if (status === 'delivered') {
    await Order.findByIdAndUpdate(delivery.orderId, {
      status: 'delivered',
      deliveredAt: new Date()
    });
  }

  res.json(new ApiResponse(200, 'Delivery status updated successfully', { delivery }));
}));

// Get franchise deliveries
router.get('/franchise/deliveries', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = { franchise: req.user.franchiseId };
  if (status) {
    query.status = status;
  }

  const deliveries = await Delivery.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('user', 'firstName lastName phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Delivery.countDocuments(query);

  res.json(new ApiResponse(200, 'Franchise deliveries retrieved successfully', {
    deliveries,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Get user deliveries
router.get('/user/deliveries', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = { user: req.user.userId };
  if (status) {
    query.status = status;
  }

  const deliveries = await Delivery.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('franchise', 'name location contactInfo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Delivery.countDocuments(query);

  res.json(new ApiResponse(200, 'User deliveries retrieved successfully', {
    deliveries,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Cancel delivery
router.post('/cancel/:deliveryId', [
  body('reason').trim().notEmpty().withMessage('Cancellation reason is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { deliveryId } = req.params;
  const { reason } = req.body;

  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw new ApiError(404, 'Delivery not found');
  }

  // Check if user can cancel this delivery
  if (delivery.user.toString() !== req.user.userId && req.user.userType !== 'admin') {
    throw new ApiError(403, 'You can only cancel your own deliveries');
  }

  // Check if delivery can be cancelled
  if (!['pending', 'accepted'].includes(delivery.status)) {
    throw new ApiError(400, 'Delivery cannot be cancelled at this stage');
  }

  delivery.status = 'cancelled';
  delivery.cancellationReason = reason;
  delivery.cancelledAt = new Date();
  delivery.cancelledBy = req.user.userId;

  await delivery.save();

  // Update order
  await Order.findByIdAndUpdate(delivery.orderId, {
    status: 'cancelled',
    'delivery.status': 'cancelled'
  });

  // Send notification to franchise
  await sendFranchiseNotification(delivery.franchise, {
    type: 'delivery_cancelled',
    deliveryId,
    reason
  });

  res.json(new ApiResponse(200, 'Delivery cancelled successfully', { delivery }));
}));

// Track delivery location
router.post('/track/:deliveryId', [
  body('location').isObject().withMessage('Location is required'),
  body('timestamp').optional().isISO8601()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { deliveryId } = req.params;
  const { location, timestamp } = req.body;

  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    throw new ApiError(404, 'Delivery not found');
  }

  // Check if user is from the assigned franchise
  if (delivery.franchise.toString() !== req.user.franchiseId) {
    throw new ApiError(403, 'You can only track deliveries assigned to your franchise');
  }

  // Add location update
  delivery.locationUpdates.push({
    location,
    timestamp: timestamp || new Date(),
    updatedBy: req.user.userId
  });

  delivery.currentLocation = location;
  await delivery.save();

  res.json(new ApiResponse(200, 'Delivery location updated successfully', { delivery }));
}));

// Get delivery analytics
router.get('/analytics', catchAsync(async (req, res) => {
  const { period = '30d', franchiseId } = req.query;

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

  const query = { createdAt: { $gte: startDate } };
  if (franchiseId) {
    query.franchise = franchiseId;
  }

  // Get delivery statistics
  const deliveryStats = await Delivery.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        totalRevenue: { $sum: '$deliveryFee' },
        averageDeliveryTime: { $avg: '$actualDeliveryTime' },
        statusDistribution: {
          $push: '$status'
        }
      }
    }
  ]);

  const stats = deliveryStats[0] || {
    totalDeliveries: 0,
    totalRevenue: 0,
    averageDeliveryTime: 0,
    statusDistribution: []
  };

  // Calculate status distribution
  const statusCounts = {};
  stats.statusDistribution.forEach(status => {
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Get top performing franchises
  const topFranchises = await Delivery.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$franchise',
        deliveryCount: { $sum: 1 },
        totalRevenue: { $sum: '$deliveryFee' },
        averageRating: { $avg: '$rating' }
      }
    },
    {
      $lookup: {
        from: 'franchises',
        localField: '_id',
        foreignField: '_id',
        as: 'franchise'
      }
    },
    {
      $unwind: '$franchise'
    },
    {
      $project: {
        name: '$franchise.name',
        location: '$franchise.location',
        deliveryCount: 1,
        totalRevenue: 1,
        averageRating: 1
      }
    },
    {
      $sort: { deliveryCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.json(new ApiResponse(200, 'Delivery analytics retrieved successfully', {
    period,
    stats: {
      totalDeliveries: stats.totalDeliveries,
      totalRevenue: stats.totalRevenue,
      averageDeliveryTime: stats.averageDeliveryTime,
      statusDistribution: statusCounts
    },
    topFranchises
  }));
}));

// Helper functions
async function findNearestFranchise(deliveryAddress) {
  // This would integrate with EHB franchise system
  // For now, return a mock franchise
  const franchises = await Franchise.find({
    isActive: true,
    'serviceAreas.city': deliveryAddress.city
  });

  if (franchises.length === 0) {
    return null;
  }

  // Simple distance calculation (in real implementation, use proper geolocation)
  const nearest = franchises[0];
  return {
    franchiseId: nearest._id,
    distance: 5.2, // Mock distance in km
    estimatedTime: 30 // Mock time in minutes
  };
}

function calculateDeliveryFee(deliveryType, distance) {
  const baseFee = 5;
  const distanceFee = distance * 0.5;

  switch (deliveryType) {
    case 'standard':
      return baseFee + distanceFee;
    case 'express':
      return (baseFee + distanceFee) * 1.5;
    case 'same_day':
      return (baseFee + distanceFee) * 2;
    default:
      return baseFee + distanceFee;
  }
}

function calculateEstimatedDeliveryTime(deliveryType, distance) {
  const baseTime = 60; // minutes
  const distanceTime = distance * 10; // 10 minutes per km

  switch (deliveryType) {
    case 'standard':
      return baseTime + distanceTime;
    case 'express':
      return Math.round((baseTime + distanceTime) * 0.7);
    case 'same_day':
      return Math.round((baseTime + distanceTime) * 0.5);
    default:
      return baseTime + distanceTime;
  }
}

async function sendFranchiseNotification(franchiseId, notification) {
  // This would integrate with EHB notification system
  console.log(`Sending notification to franchise ${franchiseId}:`, notification);
}

async function sendCustomerNotification(userId, notification) {
  // This would integrate with EHB notification system
  console.log(`Sending notification to user ${userId}:`, notification);
}

module.exports = router;
