const mongoose = require('mongoose');

const sqlUpgradeRequestSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: [true, 'Seller ID is required']
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // Optional, only for product-specific upgrades
  },
  type: {
    type: String,
    required: [true, 'Request type is required'],
    enum: ['profile', 'product'],
    default: 'profile'
  },
  currentLevel: {
    type: String,
    required: [true, 'Current SQL level is required'],
    enum: ['Free', 'Basic', 'Normal', 'High', 'VIP']
  },
  requestedLevel: {
    type: String,
    required: [true, 'Requested SQL level is required'],
    enum: ['Basic', 'Normal', 'High', 'VIP']
  },
  verificationStatus: {
    type: String,
    required: [true, 'Verification status is required'],
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedDocs: [{
    documentType: {
      type: String,
      enum: ['CNIC', 'Business_License', 'Tax_Certificate', 'Bank_Statement', 'Income_Proof', 'Business_Plan', 'Market_Analysis', 'Financial_Statement']
    },
    documentUrl: {
      type: String,
      required: [true, 'Document URL is required']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  reason: {
    type: String,
    required: [true, 'Reason for upgrade is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  businessPlan: {
    type: String,
    maxlength: [2000, 'Business plan cannot exceed 2000 characters']
  },
  financialProjections: {
    expectedRevenue: Number,
    expectedOrders: Number,
    expectedGrowth: Number,
    investmentAmount: Number
  },
  verificationDetails: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Admin who verified
    },
    verifiedAt: Date,
    verificationNotes: String,
    rejectionReason: String
  },
  // PSS, EDR, EMO verification tracking
  verificationProgress: {
    pss: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending'
      },
      verifiedAt: Date,
      verifiedBy: String,
      notes: String
    },
    edr: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending'
      },
      verifiedAt: Date,
      verifiedBy: String,
      notes: String
    },
    emo: {
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'failed'],
        default: 'pending'
      },
      verifiedAt: Date,
      verifiedBy: String,
      notes: String
    }
  },
  // Auto-escalation tracking
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
    notes: String
  }],
  // Processing time tracking
  processingTime: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    firstReviewAt: Date,
    finalDecisionAt: Date,
    totalProcessingTime: Number // in hours
  },
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'escalated']
    },
    sentAt: Date,
    sentTo: String,
    message: String
  }],
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
sqlUpgradeRequestSchema.index({ sellerId: 1 });
sqlUpgradeRequestSchema.index({ productId: 1 });
sqlUpgradeRequestSchema.index({ type: 1 });
sqlUpgradeRequestSchema.index({ verificationStatus: 1 });
sqlUpgradeRequestSchema.index({ requestedLevel: 1 });
sqlUpgradeRequestSchema.index({ createdAt: -1 });

// Virtual for processing time
sqlUpgradeRequestSchema.virtual('processingTimeInHours').get(function() {
  if (!this.processingTime.finalDecisionAt) return null;

  const submitted = new Date(this.processingTime.submittedAt);
  const decided = new Date(this.processingTime.finalDecisionAt);
  return Math.round((decided - submitted) / (1000 * 60 * 60));
});

// Virtual for verification progress percentage
sqlUpgradeRequestSchema.virtual('verificationProgressPercentage').get(function() {
  const verifications = ['pss', 'edr', 'emo'];
  const completed = verifications.filter(v =>
    this.verificationProgress[v].status === 'completed'
  ).length;

  return Math.round((completed / verifications.length) * 100);
});

// Virtual for status with color
sqlUpgradeRequestSchema.virtual('statusColor').get(function() {
  switch (this.verificationStatus) {
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'pending': return 'yellow';
    default: return 'gray';
  }
});

// Pre-save middleware to calculate processing time
sqlUpgradeRequestSchema.pre('save', function(next) {
  if (this.isModified('verificationStatus') && this.verificationStatus !== 'pending') {
    this.processingTime.finalDecisionAt = new Date();

    const submitted = new Date(this.processingTime.submittedAt);
    const decided = new Date(this.processingTime.finalDecisionAt);
    this.processingTime.totalProcessingTime = Math.round((decided - submitted) / (1000 * 60 * 60));
  }
  next();
});

// Static method to find pending requests
sqlUpgradeRequestSchema.statics.findPending = function() {
  return this.find({ verificationStatus: 'pending', isActive: true })
    .populate('sellerId', 'name email shopName sellerType')
    .populate('productId', 'title price')
    .sort({ createdAt: -1 });
};

// Static method to find by seller
sqlUpgradeRequestSchema.statics.findBySeller = function(sellerId) {
  return this.find({ sellerId, isActive: true })
    .populate('productId', 'title price')
    .sort({ createdAt: -1 });
};

// Static method to find by verification status
sqlUpgradeRequestSchema.statics.findByStatus = function(status) {
  return this.find({ verificationStatus: status, isActive: true })
    .populate('sellerId', 'name email shopName sellerType')
    .populate('productId', 'title price')
    .sort({ createdAt: -1 });
};

// Static method to find by SQL level
sqlUpgradeRequestSchema.statics.findByRequestedLevel = function(level) {
  return this.find({ requestedLevel: level, isActive: true })
    .populate('sellerId', 'name email shopName sellerType')
    .populate('productId', 'title price')
    .sort({ createdAt: -1 });
};

// Instance method to approve request
sqlUpgradeRequestSchema.methods.approve = function(adminId, notes = '') {
  this.verificationStatus = 'approved';
  this.verificationDetails.verifiedBy = adminId;
  this.verificationDetails.verifiedAt = new Date();
  this.verificationDetails.verificationNotes = notes;

  // Add notification
  this.notifications.push({
    type: 'approved',
    sentAt: new Date(),
    sentTo: 'seller',
    message: `Your SQL upgrade request to ${this.requestedLevel} has been approved!`
  });

  return this.save();
};

// Instance method to reject request
sqlUpgradeRequestSchema.methods.reject = function(adminId, reason = '') {
  this.verificationStatus = 'rejected';
  this.verificationDetails.verifiedBy = adminId;
  this.verificationDetails.verifiedAt = new Date();
  this.verificationDetails.rejectionReason = reason;

  // Add notification
  this.notifications.push({
    type: 'rejected',
    sentAt: new Date(),
    sentTo: 'seller',
    message: `Your SQL upgrade request to ${this.requestedLevel} has been rejected. Reason: ${reason}`
  });

  return this.save();
};

// Instance method to escalate request
sqlUpgradeRequestSchema.methods.escalate = function(level, escalatedBy, notes = '') {
  this.escalationLevel = level;
  this.escalationHistory.push({
    level,
    escalatedAt: new Date(),
    escalatedBy,
    notes
  });

  // Add notification
  this.notifications.push({
    type: 'escalated',
    sentAt: new Date(),
    sentTo: 'admin',
    message: `SQL upgrade request escalated to ${level} level`
  });

  return this.save();
};

// Instance method to update verification progress
sqlUpgradeRequestSchema.methods.updateVerificationProgress = function(verificationType, status, verifiedBy, notes = '') {
  this.verificationProgress[verificationType] = {
    status,
    verifiedAt: status === 'completed' ? new Date() : null,
    verifiedBy: status === 'completed' ? verifiedBy : null,
    notes
  };

  return this.save();
};

module.exports = mongoose.model('SQLUpgradeRequest', sqlUpgradeRequestSchema);
