const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  // Order Reference
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  // Rider Assignment
  riderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rider',
    required: true
  },
  // Franchise Information
  franchiseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true
  },
  franchiseType: {
    type: String,
    enum: ['sub', 'master', 'corporate'],
    default: 'sub'
  },
  // Delivery Details
  pickupLocation: {
    address: String,
    city: String,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryLocation: {
    address: String,
    city: String,
    area: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Status Tracking
  status: {
    type: String,
    enum: ['assigned', 'picked', 'in_transit', 'delivered', 'failed', 'cancelled'],
    default: 'assigned'
  },
  // Time Tracking
  timeLogs: {
    assignedAt: {
      type: Date,
      default: Date.now
    },
    pickedAt: Date,
    inTransitAt: Date,
    deliveredAt: Date,
    failedAt: Date,
    cancelledAt: Date
  },
  // Delivery Performance
  estimatedDeliveryTime: {
    type: Number, // in minutes
    required: true
  },
  actualDeliveryTime: {
    type: Number, // in minutes
    default: 0
  },
  isOnTime: {
    type: Boolean,
    default: true
  },
  // Distance & Route
  distance: {
    type: Number, // in kilometers
    default: 0
  },
  route: {
    polyline: String,
    distance: Number,
    duration: Number
  },
  // Payment & Earnings
  deliveryFee: {
    type: Number,
    required: true
  },
  riderEarnings: {
    type: Number,
    default: 0
  },
  franchiseEarnings: {
    type: Number,
    default: 0
  },
  // Customer Information
  customerInfo: {
    name: String,
    phone: String,
    email: String,
    address: String
  },
  // Delivery Instructions
  deliveryInstructions: {
    type: String,
    trim: true
  },
  // Package Details
  packageDetails: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    fragile: {
      type: Boolean,
      default: false
    },
    specialHandling: String
  },
  // Real-time Tracking
  currentLocation: {
    coordinates: {
      lat: Number,
      lng: Number
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Delivery Proof
  deliveryProof: {
    signature: String,
    image: String,
    notes: String,
    deliveredTo: String
  },
  // Issues & Complaints
  issues: [{
    type: { type: String, enum: ['late', 'damaged', 'wrong_item', 'not_delivered', 'customer_unavailable'] },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    },
    resolution: String
  }],
  // Ratings & Feedback
  customerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  // Escalation & Fines
  escalated: {
    type: Boolean,
    default: false
  },
  escalationLevel: {
    type: String,
    enum: ['none', 'sub_franchise', 'master_franchise', 'corporate'],
    default: 'none'
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  fineReason: String,
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  // Timestamps
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
deliverySchema.index({ orderId: 1 });
deliverySchema.index({ riderId: 1 });
deliverySchema.index({ franchiseId: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ franchiseType: 1 });
deliverySchema.index({ isActive: 1 });
deliverySchema.index({ escalated: 1 });
deliverySchema.index({ 'timeLogs.assignedAt': -1 });
deliverySchema.index({ 'timeLogs.deliveredAt': -1 });
deliverySchema.index({ 'deliveryLocation.city': 1 });
deliverySchema.index({ 'pickupLocation.city': 1 });

// Pre-save middleware
deliverySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance methods
deliverySchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;

  // Update time logs
  switch (newStatus) {
    case 'picked':
      this.timeLogs.pickedAt = new Date();
      break;
    case 'in_transit':
      this.timeLogs.inTransitAt = new Date();
      break;
    case 'delivered':
      this.timeLogs.deliveredAt = new Date();
      this.actualDeliveryTime = this.calculateDeliveryTime();
      this.isOnTime = this.actualDeliveryTime <= this.estimatedDeliveryTime;
      break;
    case 'failed':
      this.timeLogs.failedAt = new Date();
      break;
    case 'cancelled':
      this.timeLogs.cancelledAt = new Date();
      break;
  }

  return this.save();
};

deliverySchema.methods.calculateDeliveryTime = function() {
  if (!this.timeLogs.assignedAt || !this.timeLogs.deliveredAt) {
    return 0;
  }

  const diff = this.timeLogs.deliveredAt - this.timeLogs.assignedAt;
  return Math.round(diff / (1000 * 60)); // Convert to minutes
};

deliverySchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation = {
    coordinates: { lat, lng },
    updatedAt: new Date()
  };
  return this.save();
};

deliverySchema.methods.addIssue = function(type, description) {
  this.issues.push({
    type,
    description,
    reportedAt: new Date()
  });
  return this.save();
};

deliverySchema.methods.escalate = function(level, reason) {
  this.escalated = true;
  this.escalationLevel = level;
  this.fineReason = reason;

  // Calculate fine based on escalation level
  switch (level) {
    case 'sub_franchise':
      this.fineAmount = this.deliveryFee * 0.02; // 2%
      break;
    case 'master_franchise':
      this.fineAmount = this.deliveryFee * 0.03; // 3%
      break;
    case 'corporate':
      this.fineAmount = this.deliveryFee * 0.05; // 5%
      break;
  }

  return this.save();
};

deliverySchema.methods.addCustomerRating = function(rating, feedback) {
  this.customerRating = {
    rating,
    feedback,
    ratedAt: new Date()
  };
  return this.save();
};

// Static methods
deliverySchema.statics.findByOrder = function(orderId) {
  return this.findOne({ orderId }).populate('riderId franchiseId');
};

deliverySchema.statics.findByRider = function(riderId) {
  return this.find({ riderId }).sort({ createdAt: -1 });
};

deliverySchema.statics.findByFranchise = function(franchiseId) {
  return this.find({ franchiseId }).sort({ createdAt: -1 });
};

deliverySchema.statics.findByStatus = function(status) {
  return this.find({ status, isActive: true }).populate('riderId franchiseId');
};

deliverySchema.statics.findEscalated = function() {
  return this.find({ escalated: true }).populate('riderId franchiseId');
};

deliverySchema.statics.findLateDeliveries = function() {
  return this.find({
    status: 'delivered',
    isOnTime: false,
    isActive: true
  }).populate('riderId franchiseId');
};

deliverySchema.statics.getDeliveryStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        successfulDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
          }
        },
        failedDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        },
        onTimeDeliveries: {
          $sum: {
            $cond: ['$isOnTime', 1, 0]
          }
        },
        escalatedDeliveries: {
          $sum: {
            $cond: ['$escalated', 1, 0]
          }
        },
        totalFines: { $sum: '$fineAmount' },
        averageDeliveryTime: { $avg: '$actualDeliveryTime' },
        totalEarnings: { $sum: '$deliveryFee' }
      }
    }
  ]);
};

deliverySchema.statics.getFranchiseDeliveryStats = function(franchiseId) {
  return this.aggregate([
    { $match: { franchiseId: mongoose.Types.ObjectId(franchiseId), isActive: true } },
    {
      $group: {
        _id: '$franchiseType',
        totalDeliveries: { $sum: 1 },
        successfulDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
          }
        },
        failedDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        },
        escalatedDeliveries: {
          $sum: {
            $cond: ['$escalated', 1, 0]
          }
        },
        totalFines: { $sum: '$fineAmount' },
        totalEarnings: { $sum: '$deliveryFee' }
      }
    }
  ]);
};

deliverySchema.statics.getRiderDeliveryStats = function(riderId) {
  return this.aggregate([
    { $match: { riderId: mongoose.Types.ObjectId(riderId), isActive: true } },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        successfulDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0]
          }
        },
        failedDeliveries: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        },
        onTimeDeliveries: {
          $sum: {
            $cond: ['$isOnTime', 1, 0]
          }
        },
        totalEarnings: { $sum: '$riderEarnings' },
        averageDeliveryTime: { $avg: '$actualDeliveryTime' }
      }
    }
  ]);
};

module.exports = mongoose.model('Delivery', deliverySchema);
