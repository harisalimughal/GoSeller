const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Franchise',
    required: true
  },
  deliveryAddress: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'Pakistan'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  deliveryType: {
    type: String,
    enum: ['standard', 'express', 'same_day'],
    default: 'standard'
  },
  deliveryFee: {
    type: Number,
    required: true,
    min: 0
  },
  specialInstructions: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
  },
  estimatedDeliveryTime: {
    type: Number, // in minutes
    required: true
  },
  actualDeliveryTime: {
    type: Number, // in minutes
    default: null
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    timestamp: Date
  },
  locationUpdates: [{
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'accepted', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled']
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  review: {
    type: String,
    trim: true,
    maxlength: 500
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
deliverySchema.index({ orderId: 1 }, { unique: true });
deliverySchema.index({ user: 1 });
deliverySchema.index({ franchise: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ createdAt: -1 });
deliverySchema.index({ 'deliveryAddress.city': 1 });
deliverySchema.index({ 'deliveryAddress.state': 1 });

// Virtual for delivery duration
deliverySchema.virtual('deliveryDuration').get(function() {
  if (this.actualDeliveryTime) {
    return this.actualDeliveryTime;
  }
  return null;
});

// Virtual for is delayed
deliverySchema.virtual('isDelayed').get(function() {
  if (this.actualDeliveryTime && this.estimatedDeliveryTime) {
    return this.actualDeliveryTime > this.estimatedDeliveryTime;
  }
  return false;
});

// Virtual for delivery progress percentage
deliverySchema.virtual('progressPercentage').get(function() {
  const statusOrder = ['pending', 'accepted', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentIndex = statusOrder.indexOf(this.status);
  return currentIndex >= 0 ? Math.round((currentIndex / (statusOrder.length - 1)) * 100) : 0;
});

// Virtual for full delivery address
deliverySchema.virtual('fullDeliveryAddress').get(function() {
  const addr = this.deliveryAddress;
  if (!addr) return '';

  const parts = [
    addr.street,
    addr.city,
    addr.state,
    addr.zipCode,
    addr.country
  ].filter(Boolean);

  return parts.join(', ');
});

// Pre-save middleware
deliverySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to update status
deliverySchema.methods.updateStatus = function(status, updatedBy, notes = '') {
  this.status = status;
  this.notes = notes || this.notes;

  this.statusHistory.push({
    status,
    updatedAt: new Date(),
    updatedBy,
    notes
  });

  return this.save();
};

// Instance method to add location update
deliverySchema.methods.addLocationUpdate = function(location, updatedBy) {
  this.locationUpdates.push({
    location,
    timestamp: new Date(),
    updatedBy
  });

  this.currentLocation = {
    latitude: location.latitude,
    longitude: location.longitude,
    address: location.address,
    timestamp: new Date()
  };

  return this.save();
};

// Instance method to complete delivery
deliverySchema.methods.completeDelivery = function(actualTime, updatedBy) {
  this.status = 'delivered';
  this.actualDeliveryTime = actualTime;

  this.statusHistory.push({
    status: 'delivered',
    updatedAt: new Date(),
    updatedBy,
    notes: 'Delivery completed'
  });

  return this.save();
};

// Instance method to cancel delivery
deliverySchema.methods.cancelDelivery = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;

  this.statusHistory.push({
    status: 'cancelled',
    updatedAt: new Date(),
    updatedBy: cancelledBy,
    notes: reason
  });

  return this.save();
};

// Instance method to rate delivery
deliverySchema.methods.rateDelivery = function(rating, review = '') {
  this.rating = rating;
  this.review = review;
  return this.save();
};

// Static method to get deliveries by status
deliverySchema.statics.findByStatus = function(status, options = {}) {
  const { page = 1, limit = 20, franchiseId } = options;

  const query = { status };
  if (franchiseId) {
    query.franchise = franchiseId;
  }

  return this.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('user', 'firstName lastName phone')
    .populate('franchise', 'name location')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get user deliveries
deliverySchema.statics.findByUser = function(userId, options = {}) {
  const { page = 1, limit = 20, status } = options;

  const query = { user: userId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('franchise', 'name location contactInfo')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get franchise deliveries
deliverySchema.statics.findByFranchise = function(franchiseId, options = {}) {
  const { page = 1, limit = 20, status } = options;

  const query = { franchise: franchiseId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('orderId', 'orderNumber totalAmount')
    .populate('user', 'firstName lastName phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get delivery statistics
deliverySchema.statics.getStats = function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        totalRevenue: { $sum: '$deliveryFee' },
        averageDeliveryTime: { $avg: '$actualDeliveryTime' },
        averageRating: { $avg: '$rating' },
        statusDistribution: {
          $push: '$status'
        }
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Static method to get delayed deliveries
deliverySchema.statics.getDelayedDeliveries = function() {
  return this.find({
    status: { $in: ['accepted', 'picked_up', 'in_transit', 'out_for_delivery'] },
    createdAt: {
      $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) // More than 24 hours old
    }
  })
  .populate('orderId', 'orderNumber')
  .populate('user', 'firstName lastName phone')
  .populate('franchise', 'name contactInfo');
};

module.exports = mongoose.model('Delivery', deliverySchema);
