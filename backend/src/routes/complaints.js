const express = require('express');
const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

const router = express.Router();

// Create Complaint
router.post('/', catchAsync(async (req, res) => {
  const {
    orderId,
    complaintType,
    description,
    priority = 'medium',
    attachments = []
  } = req.body;

  // Validate order exists
  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check if complaint already exists for this order
  const existingComplaint = await Complaint.findOne({ orderId });
  if (existingComplaint) {
    throw new ApiError(400, 'Complaint already exists for this order');
  }

  // Create complaint
  const complaint = new Complaint({
    orderId,
    buyerId: order.userId,
    sellerId: order.sellerId,
    franchiseId: order.franchiseId || 'default_franchise', // Should come from order
    franchiseLevel: 'sub', // Default to sub-franchise
    complaintType,
    description,
    priority,
    attachments,
    timeLogs: {
      orderPlacedAt: order.createdAt,
      subNotifiedAt: new Date()
    }
  });

  await complaint.save();

  res.status(201).json(new ApiResponse(201, {
    complaint: {
      id: complaint._id,
      orderId: complaint.orderId,
      complaintType: complaint.complaintType,
      status: complaint.status,
      priority: complaint.priority,
      createdAt: complaint.createdAt
    }
  }, 'Complaint created successfully'));
}));

// Get All Complaints (with filters)
router.get('/', catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    complaintType,
    franchiseId,
    escalated
  } = req.query;

  const query = { isActive: true };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (complaintType) query.complaintType = complaintType;
  if (franchiseId) query.franchiseId = franchiseId;
  if (escalated !== undefined) query.escalated = escalated === 'true';

  const complaints = await Complaint.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .populate('franchiseId', 'name level')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const total = await Complaint.countDocuments(query);

  res.json(new ApiResponse(200, {
    complaints,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Complaints retrieved'));
}));

// Get Complaint by ID
router.get('/:id', catchAsync(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('orderId', 'orderNumber totalAmount items')
    .populate('buyerId', 'name email contact')
    .populate('sellerId', 'name shopName contact')
    .populate('franchiseId', 'name level contact')
    .populate('assignedTo', 'name email');

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  res.json(new ApiResponse(200, { complaint }, 'Complaint retrieved'));
}));

// Update Complaint Status
router.patch('/:id/status', catchAsync(async (req, res) => {
  const { status, notes } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  complaint.status = status;

  if (status === 'resolved') {
    complaint.timeLogs.resolvedAt = new Date();
  }

  // Add communication note
  if (notes) {
    complaint.communications.push({
      type: 'note',
      from: req.user?.name || 'System',
      to: 'system',
      message: `Status changed to ${status}. Notes: ${notes}`,
      isInternal: true
    });
  }

  await complaint.save();

  res.json(new ApiResponse(200, { complaint }, 'Complaint status updated'));
}));

// Assign Complaint
router.patch('/:id/assign', catchAsync(async (req, res) => {
  const { assignedTo } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  await complaint.assign(assignedTo);

  res.json(new ApiResponse(200, { complaint }, 'Complaint assigned successfully'));
}));

// Escalate Complaint
router.patch('/:id/escalate', catchAsync(async (req, res) => {
  const { level, reason, notes } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  await complaint.escalate(level, req.user?.name || 'System', reason);

  res.json(new ApiResponse(200, { complaint }, 'Complaint escalated successfully'));
}));

// Resolve Complaint
router.patch('/:id/resolve', catchAsync(async (req, res) => {
  const {
    resolutionType,
    resolutionNotes,
    customerSatisfaction
  } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  await complaint.resolve(
    req.user?.id || 'system',
    resolutionType,
    resolutionNotes
  );

  if (customerSatisfaction) {
    complaint.resolution.customerSatisfaction = customerSatisfaction;
    await complaint.save();
  }

  res.json(new ApiResponse(200, { complaint }, 'Complaint resolved successfully'));
}));

// Add Communication to Complaint
router.post('/:id/communication', catchAsync(async (req, res) => {
  const { type, to, message, isInternal = false } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  await complaint.addCommunication(
    type,
    req.user?.name || 'System',
    to,
    message,
    isInternal
  );

  res.json(new ApiResponse(200, { complaint }, 'Communication added successfully'));
}));

// Calculate Fine for Complaint
router.post('/:id/calculate-fine', catchAsync(async (req, res) => {
  const { orderAmount } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  await complaint.calculateFine(orderAmount);

  res.json(new ApiResponse(200, {
    fineAmount: complaint.fineAmount,
    finePercentage: complaint.finePercentage
  }, 'Fine calculated successfully'));
}));

// Get Complaint Analytics
router.get('/analytics/summary', catchAsync(async (req, res) => {
  const { franchiseId, startDate, endDate } = req.query;

  const query = { isActive: true };
  if (franchiseId) query.franchiseId = franchiseId;
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Get complaint statistics
  const stats = await Complaint.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        escalated: {
          $sum: { $cond: [{ $eq: ['$escalated', true] }, 1, 0] }
        },
        totalFines: { $sum: '$fineAmount' },
        avgResolutionTime: { $avg: '$analytics.timeToResolution' }
      }
    }
  ]);

  // Get complaints by type
  const byType = await Complaint.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$complaintType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get complaints by priority
  const byPriority = await Complaint.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  const analytics = {
    summary: stats[0] || {
      total: 0,
      pending: 0,
      inProgress: 0,
      resolved: 0,
      escalated: 0,
      totalFines: 0,
      avgResolutionTime: 0
    },
    byType,
    byPriority
  };

  res.json(new ApiResponse(200, { analytics }, 'Analytics retrieved'));
}));

// Get Pending Complaints (for dashboard)
router.get('/dashboard/pending', catchAsync(async (req, res) => {
  const { franchiseId } = req.query;

  const query = { status: 'pending', isActive: true };
  if (franchiseId) query.franchiseId = franchiseId;

  const complaints = await Complaint.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .populate('franchiseId', 'name level')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(new ApiResponse(200, { complaints }, 'Pending complaints retrieved'));
}));

// Get Escalated Complaints (for dashboard)
router.get('/dashboard/escalated', catchAsync(async (req, res) => {
  const { franchiseId } = req.query;

  const query = { escalated: true, isActive: true };
  if (franchiseId) query.franchiseId = franchiseId;

  const complaints = await Complaint.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .populate('franchiseId', 'name level')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json(new ApiResponse(200, { complaints }, 'Escalated complaints retrieved'));
}));

// Auto-escalation check (cron job endpoint)
router.post('/check-escalation', catchAsync(async (req, res) => {
  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  // Find complaints that need escalation
  const complaintsToEscalate = await Complaint.find({
    status: { $in: ['pending', 'in_progress'] },
    escalated: false,
    isActive: true,
    createdAt: { $lt: sixHoursAgo }
  });

  const escalatedComplaints = [];

  for (const complaint of complaintsToEscalate) {
    const hoursSinceCreation = Math.round((now - complaint.createdAt) / (1000 * 60 * 60));

    if (hoursSinceCreation >= 12) {
      // Escalate to corporate
      await complaint.escalate('corporate', 'System', 'Auto-escalation after 12 hours');
      escalatedComplaints.push({ id: complaint._id, level: 'corporate' });
    } else if (hoursSinceCreation >= 6) {
      // Escalate to master
      await complaint.escalate('master_franchise', 'System', 'Auto-escalation after 6 hours');
      escalatedComplaints.push({ id: complaint._id, level: 'master_franchise' });
    }
  }

  res.json(new ApiResponse(200, {
    escalatedCount: escalatedComplaints.length,
    escalatedComplaints
  }, 'Escalation check completed'));
}));

// Get Complaint Timeline
router.get('/:id/timeline', catchAsync(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .populate('franchiseId', 'name level');

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  const timeline = [
    {
      event: 'Order Placed',
      timestamp: complaint.timeLogs.orderPlacedAt,
      description: `Order #${complaint.orderId?.orderNumber} was placed`
    },
    {
      event: 'Complaint Created',
      timestamp: complaint.createdAt,
      description: `Complaint filed for ${complaint.complaintType}`
    },
    {
      event: 'Sub-Franchise Notified',
      timestamp: complaint.timeLogs.subNotifiedAt,
      description: 'Complaint assigned to sub-franchise'
    }
  ];

  if (complaint.timeLogs.masterEscalatedAt) {
    timeline.push({
      event: 'Escalated to Master',
      timestamp: complaint.timeLogs.masterEscalatedAt,
      description: 'Complaint escalated to master franchise'
    });
  }

  if (complaint.timeLogs.corporateEscalatedAt) {
    timeline.push({
      event: 'Escalated to Corporate',
      timestamp: complaint.timeLogs.corporateEscalatedAt,
      description: 'Complaint escalated to corporate'
    });
  }

  if (complaint.timeLogs.resolvedAt) {
    timeline.push({
      event: 'Resolved',
      timestamp: complaint.timeLogs.resolvedAt,
      description: `Complaint resolved with ${complaint.resolution.resolutionType}`
    });
  }

  // Add communications to timeline
  complaint.communications.forEach(comm => {
    timeline.push({
      event: 'Communication',
      timestamp: comm.timestamp,
      description: `${comm.type} from ${comm.from} to ${comm.to}: ${comm.message}`,
      isInternal: comm.isInternal
    });
  });

  // Sort timeline by timestamp
  timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  res.json(new ApiResponse(200, { timeline }, 'Complaint timeline retrieved'));
}));

module.exports = router;
