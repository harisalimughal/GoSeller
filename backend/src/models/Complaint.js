const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order ID is required']
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer ID is required']
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller ID is required']
  },
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: [true, 'Franchise ID is required']
  },
  franchiseLevel: {
    type: String,
    required: [true, 'Franchise level is required'],
    enum: ['sub', 'master', 'corporate'],
    default: 'sub'
  },
  complaintType: {
    type: String,
    required: [true, 'Complaint type is required'],
    enum: [
      'delivery_delayed',
      'product_not_found',
      'wrong_product',
      'damaged_product',
      'poor_service',
      'no_response',
      'cancellation_issue',
      'payment_issue',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    required: [true, 'Priority level is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    required: [true, 'Complaint status is required'],
    enum: ['pending', 'in_progress', 'resolved', 'escalated', 'closed'],
    default: 'pending'
  },
  escalated: {
    type: Boolean,
    default: false
  },
  escalationLevel: {
    type: String,
    enum: ['sub_franchise', 'master_franchise', 'corporate'],
    default: 'sub_franchise'
  },
  escalationHistory: [{
    level: {
      type: String,
      enum: ['sub_franchise', 'master_franchise', 'corporate']
    },
    escalatedAt: Date,
    escalatedBy: String,
    reason: String,
    notes: String
  }],
  // Fine calculation
  finePercentage: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  fineAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  fineStatus: {
    type: String,
    enum: ['pending', 'calculated', 'charged', 'refunded'],
    default: 'pending'
  },
  // Time tracking
  timeLogs: {
    orderPlacedAt: Date,
    subNotifiedAt: Date,
    masterEscalatedAt: Date,
    corporateEscalatedAt: Date,
    resolvedAt: Date,
    closedAt: Date
  },
  // Auto-escalation rules
  escalationRules: {
    subToMaster: {
      type: Number,
      default: 6 // hours
    },
    masterToCorporate: {
      type: Number,
      default: 6 // hours
    },
    totalTimeLimit: {
      type: Number,
      default: 24 // hours
    }
  },
  // Resolution details
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionType: {
      type: String,
      enum: ['refund', 'replacement', 'discount', 'compensation', 'apology', 'other']
    },
    resolutionNotes: String,
    customerSatisfaction: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  // Assignments
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  // Attachments
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: String
  }],
  // Communication history
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'chat', 'note']
    },
    from: String,
    to: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    isInternal: {
      type: Boolean,
      default: false
    }
  }],
  // Tags for categorization
  tags: [String],
  // SLA tracking
  sla: {
    targetResolutionTime: {
      type: Number,
      default: 24 // hours
    },
    actualResolutionTime: Number,
    slaBreached: {
      type: Boolean,
      default: false
    }
  },
  // Analytics
  analytics: {
    timeToFirstResponse: Number, // in minutes
    timeToResolution: Number, // in hours
    escalationCount: {
      type: Number,
      default: 0
    },
    customerSatisfactionScore: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
complaintSchema.index({ orderId: 1 });
complaintSchema.index({ buyerId: 1 });
complaintSchema.index({ sellerId: 1 });
complaintSchema.index({ franchiseId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ complaintType: 1 });
complaintSchema.index({ escalated: 1 });
complaintSchema.index({ createdAt: -1 });

// Virtual for time since creation
complaintSchema.virtual('timeSinceCreation').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInHours = Math.round((now - created) / (1000 * 60 * 60));
  return diffInHours;
});

// Virtual for escalation status
complaintSchema.virtual('escalationStatus').get(function() {
  if (this.escalationLevel === 'corporate') return 'Escalated to Corporate';
  if (this.escalationLevel === 'master_franchise') return 'Escalated to Master';
  return 'At Sub-Franchise';
});

// Virtual for fine calculation
complaintSchema.virtual('calculatedFine').get(function() {
  const baseAmount = 1000; // Base order amount, should come from order
  return (baseAmount * this.finePercentage) / 100;
});

// Virtual for SLA status
complaintSchema.virtual('slaStatus').get(function() {
  const timeSinceCreation = this.timeSinceCreation;
  const targetTime = this.sla.targetResolutionTime;

  if (timeSinceCreation > targetTime) return 'Breached';
  if (timeSinceCreation > targetTime * 0.8) return 'Warning';
  return 'On Track';
});

// Pre-save middleware to calculate fine percentage based on franchise level
complaintSchema.pre('save', function(next) {
  if (this.isModified('franchiseLevel')) {
    switch (this.franchiseLevel) {
      case 'sub':
        this.finePercentage = 2;
        break;
      case 'master':
        this.finePercentage = 3;
        break;
      case 'corporate':
        this.finePercentage = 5;
        break;
      default:
        this.finePercentage = 2;
    }
  }
  next();
});

// Static method to find pending complaints
complaintSchema.statics.findPending = function() {
  return this.find({ status: 'pending', isActive: true })
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .populate('franchiseId', 'name level')
    .sort({ createdAt: -1 });
};

// Static method to find by franchise
complaintSchema.statics.findByFranchise = function(franchiseId) {
  return this.find({ franchiseId, isActive: true })
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .sort({ createdAt: -1 });
};

// Static method to find escalated complaints
complaintSchema.statics.findEscalated = function() {
  return this.find({ escalated: true, isActive: true })
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .populate('franchiseId', 'name level')
    .sort({ createdAt: -1 });
};

// Static method to find by priority
complaintSchema.statics.findByPriority = function(priority) {
  return this.find({ priority, isActive: true })
    .populate('orderId', 'orderNumber totalAmount')
    .populate('buyerId', 'name email')
    .populate('sellerId', 'name shopName')
    .populate('franchiseId', 'name level')
    .sort({ createdAt: -1 });
};

// Instance method to escalate complaint
complaintSchema.methods.escalate = function(level, escalatedBy, reason = '') {
  this.escalated = true;
  this.escalationLevel = level;
  this.escalationHistory.push({
    level,
    escalatedAt: new Date(),
    escalatedBy,
    reason
  });

  // Update time logs
  if (level === 'master_franchise') {
    this.timeLogs.masterEscalatedAt = new Date();
  } else if (level === 'corporate') {
    this.timeLogs.corporateEscalatedAt = new Date();
  }

  // Add communication
  this.communications.push({
    type: 'note',
    from: escalatedBy,
    to: 'system',
    message: `Complaint escalated to ${level} level. Reason: ${reason}`,
    isInternal: true
  });

  return this.save();
};

// Instance method to resolve complaint
complaintSchema.methods.resolve = function(resolvedBy, resolutionType, notes = '') {
  this.status = 'resolved';
  this.resolution.resolvedBy = resolvedBy;
  this.resolution.resolvedAt = new Date();
  this.resolution.resolutionType = resolutionType;
  this.resolution.resolutionNotes = notes;
  this.timeLogs.resolvedAt = new Date();

  // Calculate resolution time
  const created = new Date(this.createdAt);
  const resolved = new Date(this.timeLogs.resolvedAt);
  this.analytics.timeToResolution = Math.round((resolved - created) / (1000 * 60 * 60));

  // Check SLA breach
  if (this.analytics.timeToResolution > this.sla.targetResolutionTime) {
    this.sla.slaBreached = true;
  }

  return this.save();
};

// Instance method to assign complaint
complaintSchema.methods.assign = function(assignedTo) {
  this.assignedTo = assignedTo;
  this.assignedAt = new Date();
  this.status = 'in_progress';

  return this.save();
};

// Instance method to add communication
complaintSchema.methods.addCommunication = function(type, from, to, message, isInternal = false) {
  this.communications.push({
    type,
    from,
    to,
    message,
    timestamp: new Date(),
    isInternal
  });

  return this.save();
};

// Instance method to calculate fine
complaintSchema.methods.calculateFine = function(orderAmount) {
  this.fineAmount = (orderAmount * this.finePercentage) / 100;
  this.fineStatus = 'calculated';

  return this.save();
};

module.exports = mongoose.model('Complaint', complaintSchema);
