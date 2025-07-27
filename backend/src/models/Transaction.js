const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction Details
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },

  // Transaction Type
  type: {
    type: String,
    required: true,
    enum: [
      'order_payment',
      'wallet_distribution',
      'fine_distribution',
      'withdrawal',
      'deposit',
      'refund',
      'cashback',
      'commission',
      'bonus',
      'penalty',
      'transfer'
    ]
  },

  // Amount Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'PKR'
  },
  walletType: {
    type: String,
    required: true,
    enum: ['main', 'trusty', 'shopping']
  },

  // Parties Involved
  fromWallet: {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet'
    },
    ownerId: mongoose.Schema.Types.ObjectId,
    ownerType: String
  },
  toWallet: {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet'
    },
    ownerId: mongoose.Schema.Types.ObjectId,
    ownerType: String
  },

  // Distribution Details (for order payments)
  distribution: {
    seller: {
      amount: Number,
      percentage: Number
    },
    subFranchise: {
      amount: Number,
      percentage: Number
    },
    masterFranchise: {
      amount: Number,
      percentage: Number
    },
    corporateFranchise: {
      amount: Number,
      percentage: Number
    },
    company: {
      amount: Number,
      percentage: Number
    },
    rider: {
      amount: Number,
      fixed: Boolean
    }
  },

  // Transaction Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
    default: 'pending'
  },

  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['wallet', 'card', 'bank_transfer', 'cash', 'crypto'],
    default: 'wallet'
  },

  // Fee Details
  fees: {
    transactionFee: {
      type: Number,
      default: 0
    },
    serviceCharge: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      default: 0
    }
  },

  // Description and Notes
  description: {
    type: String,
    required: true
  },
  notes: String,

  // Metadata
  processedBy: {
    type: String,
    default: 'system'
  },
  processedAt: {
    type: Date,
    default: Date.now
  },

  // Error handling
  error: {
    code: String,
    message: String,
    details: mongoose.Schema.Types.Mixed
  },

  // Audit trail
  auditTrail: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: String,
    details: mongoose.Schema.Types.Mixed
  }],

  // Timestamps
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ transactionId: 1 }, { unique: true });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ 'fromWallet.ownerId': 1 });
transactionSchema.index({ 'toWallet.ownerId': 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Generate transaction ID if not provided
  if (!this.transactionId) {
    this.transactionId = this.generateTransactionId();
  }

  next();
});

// Instance methods
transactionSchema.methods.generateTransactionId = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
};

transactionSchema.methods.addAuditTrail = function(action, performedBy, details = {}) {
  this.auditTrail.push({
    action,
    performedBy,
    details
  });
  return this.save();
};

transactionSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return this.addAuditTrail('completed', 'system');
};

transactionSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.error = error;
  return this.addAuditTrail('failed', 'system', error);
};

transactionSchema.methods.reverse = function(reason) {
  this.status = 'reversed';
  return this.addAuditTrail('reversed', 'system', { reason });
};

// Static methods
transactionSchema.statics.findByOrder = function(orderId) {
  return this.find({ orderId, isActive: true }).sort({ createdAt: -1 });
};

transactionSchema.statics.findByWallet = function(walletId) {
  return this.find({
    $or: [
      { 'fromWallet.walletId': walletId },
      { 'toWallet.walletId': walletId }
    ],
    isActive: true
  }).sort({ createdAt: -1 });
};

transactionSchema.statics.findByOwner = function(ownerId) {
  return this.find({
    $or: [
      { 'fromWallet.ownerId': ownerId },
      { 'toWallet.ownerId': ownerId }
    ],
    isActive: true
  }).sort({ createdAt: -1 });
};

transactionSchema.statics.getTransactionStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        byType: {
          $push: {
            type: '$type',
            count: 1,
            amount: '$amount'
          }
        },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        }
      }
    }
  ]);
};

transactionSchema.statics.getDailyStats = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        failedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
