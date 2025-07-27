const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// COMPLAINT MANAGEMENT
// ========================================

// Create complaint
router.post('/', [
  body('type').isIn(['order', 'product', 'seller', 'delivery', 'payment', 'technical', 'other']).withMessage('Valid complaint type is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required'),
  body('orderId').optional().isMongoId().withMessage('Valid order ID is required'),
  body('productId').optional().isMongoId().withMessage('Valid product ID is required'),
  body('sellerId').optional().isMongoId().withMessage('Valid seller ID is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const {
    type,
    subject,
    description,
    priority = 'medium',
    orderId,
    productId,
    sellerId,
    attachments
  } = req.body;

  // Create complaint
  const complaint = {
    id: `complaint_${Date.now()}`,
    userId: req.user?.userId || 'anonymous',
    type,
    subject,
    description,
    priority,
    orderId,
    productId,
    sellerId,
    attachments: attachments || [],
    status: 'open',
    createdAt: new Date()
  };

  res.status(201).json(new ApiResponse(201, 'Complaint created successfully', {
    complaint
  }));
}));

// Get user complaints
router.get('/user/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, status, type } = req.query;

  // Mock complaints (in real app, these would come from a complaints collection)
  const complaints = [
    {
      id: 'complaint_1',
      userId: userId,
      type: 'order',
      subject: 'Order not delivered',
      description: 'My order was supposed to be delivered yesterday but it hasn\'t arrived yet.',
      priority: 'high',
      status: 'open',
      createdAt: new Date()
    },
    {
      id: 'complaint_2',
      userId: userId,
      type: 'product',
      subject: 'Product quality issue',
      description: 'The product I received is not as described in the listing.',
      priority: 'medium',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter complaints
  let filteredComplaints = complaints;
  if (status) {
    filteredComplaints = filteredComplaints.filter(c => c.status === status);
  }
  if (type) {
    filteredComplaints = filteredComplaints.filter(c => c.type === type);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'User complaints retrieved successfully', {
    complaints: paginatedComplaints,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredComplaints.length / limit),
      total: filteredComplaints.length
    }
  }));
}));

// Get complaint by ID
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock complaint (in real app, fetch from database)
  const complaint = {
    id: id,
    userId: 'user_123',
    type: 'order',
    subject: 'Order not delivered',
    description: 'My order was supposed to be delivered yesterday but it hasn\'t arrived yet.',
    priority: 'high',
    status: 'open',
    createdAt: new Date(),
    updates: [
      {
        id: 'update_1',
        message: 'Complaint received and being reviewed',
        status: 'open',
        createdAt: new Date()
      }
    ]
  };

  res.json(new ApiResponse(200, 'Complaint retrieved successfully', {
    complaint
  }));
}));

// Update complaint
router.put('/:id', [
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status is required'),
  body('message').optional().isString().withMessage('Message is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { status, message } = req.body;

  // Mock update (in real app, update in database)
  const complaint = {
    id: id,
    status: status || 'open',
    updatedAt: new Date(),
    message: message
  };

  res.json(new ApiResponse(200, 'Complaint updated successfully', {
    complaint
  }));
}));

// Add update to complaint
router.post('/:id/updates', [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Valid status is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { message, status } = req.body;

  // Mock update (in real app, add to database)
  const update = {
    id: `update_${Date.now()}`,
    complaintId: id,
    message,
    status: status || 'open',
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Complaint update added successfully', {
    update
  }));
}));

// ========================================
// ADMIN COMPLAINT MANAGEMENT
// ========================================

// Get all complaints (admin)
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, status, type, priority } = req.query;

  // Mock complaints (in real app, fetch from database)
  const complaints = [
    {
      id: 'complaint_1',
      userId: 'user_123',
      type: 'order',
      subject: 'Order not delivered',
      description: 'My order was supposed to be delivered yesterday but it hasn\'t arrived yet.',
      priority: 'high',
      status: 'open',
      createdAt: new Date()
    },
    {
      id: 'complaint_2',
      userId: 'user_456',
      type: 'product',
      subject: 'Product quality issue',
      description: 'The product I received is not as described in the listing.',
      priority: 'medium',
      status: 'resolved',
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter complaints
  let filteredComplaints = complaints;
  if (status) {
    filteredComplaints = filteredComplaints.filter(c => c.status === status);
  }
  if (type) {
    filteredComplaints = filteredComplaints.filter(c => c.type === type);
  }
  if (priority) {
    filteredComplaints = filteredComplaints.filter(c => c.priority === priority);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Complaints retrieved successfully', {
    complaints: paginatedComplaints,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredComplaints.length / limit),
      total: filteredComplaints.length
    }
  }));
}));

// Get complaint statistics (admin)
router.get('/stats', catchAsync(async (req, res) => {
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

  // Mock statistics (in real app, calculate from database)
  const stats = {
    period,
    totalComplaints: 150,
    openComplaints: 45,
    resolvedComplaints: 95,
    closedComplaints: 10,
    averageResolutionTime: '2.5 days',
    complaintsByType: {
      order: 60,
      product: 40,
      seller: 20,
      delivery: 15,
      payment: 10,
      technical: 3,
      other: 2
    },
    complaintsByPriority: {
      low: 30,
      medium: 80,
      high: 35,
      urgent: 5
    }
  };

  res.json(new ApiResponse(200, 'Complaint statistics retrieved successfully', {
    stats
  }));
}));

// ========================================
// COMPLAINT ESCALATION
// ========================================

// Escalate complaint
router.post('/:id/escalate', [
  body('reason').trim().notEmpty().withMessage('Escalation reason is required'),
  body('level').isIn(['level1', 'level2', 'level3', 'management']).withMessage('Valid escalation level is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { reason, level } = req.body;

  // Mock escalation (in real app, update in database)
  const escalation = {
    id: `escalation_${Date.now()}`,
    complaintId: id,
    reason,
    level,
    escalatedAt: new Date(),
    status: 'pending'
  };

  res.json(new ApiResponse(200, 'Complaint escalated successfully', {
    escalation
  }));
}));

// Get escalation history
router.get('/:id/escalations', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock escalations (in real app, fetch from database)
  const escalations = [
    {
      id: 'escalation_1',
      complaintId: id,
      reason: 'Customer not satisfied with initial response',
      level: 'level2',
      escalatedAt: new Date(),
      status: 'resolved'
    }
  ];

  res.json(new ApiResponse(200, 'Escalation history retrieved successfully', {
    escalations
  }));
}));

module.exports = router;
