const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  franchiseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: {
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
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  serviceAreas: [{
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
    radius: {
      type: Number,
      default: 50 // km
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  businessHours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: true }
    }
  },
  services: [{
    type: String,
    enum: ['delivery', 'pickup', 'express_delivery', 'same_day_delivery', 'international_shipping']
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'terminated'],
    default: 'pending'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  employees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'delivery_person', 'customer_service', 'admin']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  vehicles: [{
    type: {
      type: String,
      enum: ['motorcycle', 'car', 'van', 'truck']
    },
    model: String,
    plateNumber: String,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  documents: {
    businessLicense: String,
    taxCertificate: String,
    insuranceCertificate: String,
    franchiseAgreement: String
  },
  settings: {
    autoAcceptDeliveries: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    deliveryRadius: {
      type: Number,
      default: 50 // km
    },
    maxDeliveriesPerDay: {
      type: Number,
      default: 100
    }
  },
  analytics: {
    monthlyDeliveries: {
      type: Number,
      default: 0
    },
    monthlyRevenue: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageDeliveryTime: {
      type: Number,
      default: 0 // in minutes
    }
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
franchiseSchema.index({ franchiseCode: 1 }, { unique: true });
franchiseSchema.index({ owner: 1 });
franchiseSchema.index({ status: 1 });
franchiseSchema.index({ 'location.city': 1 });
franchiseSchema.index({ 'location.state': 1 });
franchiseSchema.index({ rating: -1 });
franchiseSchema.index({ totalDeliveries: -1 });

// Virtual for full address
franchiseSchema.virtual('fullAddress').get(function() {
  const addr = this.location;
  if (!addr) return '';

  const parts = [
    addr.address,
    addr.city,
    addr.state,
    addr.zipCode,
    addr.country
  ].filter(Boolean);

  return parts.join(', ');
});

// Virtual for business hours summary
franchiseSchema.virtual('businessHoursSummary').get(function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const openDays = days.filter(day => !this.businessHours[day].closed);

  if (openDays.length === 0) return 'Closed';
  if (openDays.length === 7) return 'Open 7 days a week';

  return `Open ${openDays.length} days a week`;
});

// Virtual for active employees count
franchiseSchema.virtual('activeEmployeesCount').get(function() {
  return this.employees.filter(emp => emp.isActive).length;
});

// Virtual for active vehicles count
franchiseSchema.virtual('activeVehiclesCount').get(function() {
  return this.vehicles.filter(vehicle => vehicle.isActive).length;
});

// Pre-save middleware
franchiseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to add employee
franchiseSchema.methods.addEmployee = function(userId, role) {
  const existingEmployee = this.employees.find(emp =>
    emp.user.toString() === userId.toString()
  );

  if (existingEmployee) {
    existingEmployee.role = role;
    existingEmployee.isActive = true;
  } else {
    this.employees.push({
      user: userId,
      role,
      isActive: true,
      joinedAt: new Date()
    });
  }

  return this.save();
};

// Instance method to remove employee
franchiseSchema.methods.removeEmployee = function(userId) {
  const employee = this.employees.find(emp =>
    emp.user.toString() === userId.toString()
  );

  if (employee) {
    employee.isActive = false;
    return this.save();
  }

  return Promise.resolve(this);
};

// Instance method to add vehicle
franchiseSchema.methods.addVehicle = function(vehicleData) {
  this.vehicles.push({
    ...vehicleData,
    isActive: true
  });

  return this.save();
};

// Instance method to update analytics
franchiseSchema.methods.updateAnalytics = function(deliveryCount, revenue, satisfaction, avgTime) {
  this.analytics.monthlyDeliveries = deliveryCount;
  this.analytics.monthlyRevenue = revenue;
  this.analytics.customerSatisfaction = satisfaction;
  this.analytics.averageDeliveryTime = avgTime;

  return this.save();
};

// Instance method to update rating
franchiseSchema.methods.updateRating = function(newRating) {
  // Calculate weighted average rating
  const totalRatings = this.totalDeliveries;
  const currentRating = this.rating;

  if (totalRatings === 0) {
    this.rating = newRating;
  } else {
    this.rating = ((currentRating * totalRatings) + newRating) / (totalRatings + 1);
  }

  return this.save();
};

// Static method to find franchises by location
franchiseSchema.statics.findByLocation = function(city, state, limit = 10) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.state': new RegExp(state, 'i'),
    status: 'active'
  })
  .sort({ rating: -1, totalDeliveries: -1 })
  .limit(limit);
};

// Static method to find nearest franchise
franchiseSchema.statics.findNearest = function(latitude, longitude, maxDistance = 50) {
  return this.find({
    status: 'active',
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    }
  })
  .sort({ 'location.coordinates': 1 })
  .limit(5);
};

// Static method to get top performing franchises
franchiseSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ rating: -1, totalDeliveries: -1 })
    .limit(limit);
};

// Static method to get franchise statistics
franchiseSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalFranchises: { $sum: 1 },
        activeFranchises: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        averageRating: { $avg: '$rating' },
        totalDeliveries: { $sum: '$totalDeliveries' },
        totalRevenue: { $sum: '$totalRevenue' }
      }
    }
  ]);
};

module.exports = mongoose.model('Franchise', franchiseSchema);
