const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const riderSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // Personal Details
  cnic: {
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    frontImage: String,
    backImage: String,
    verified: { type: Boolean, default: false }
  },
  drivingLicense: {
    number: String,
    image: String,
    verified: { type: Boolean, default: false },
    expiryDate: Date
  },
  // Location & Coverage
  address: {
    street: String,
    city: String,
    area: String,
    postalCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  deliveryAreas: [{
    city: String,
    areas: [String],
    coordinates: {
      lat: Number,
      lng: Number
    }
  }],
  // Vehicle Information
  vehicle: {
    type: { type: String, enum: ['motorcycle', 'car', 'bicycle', 'scooter'] },
    model: String,
    registrationNumber: String,
    color: String,
    year: Number
  },
  // Availability & Schedule
  availability: {
    monday: { available: { type: Boolean, default: true }, hours: String },
    tuesday: { available: { type: Boolean, default: true }, hours: String },
    wednesday: { available: { type: Boolean, default: true }, hours: String },
    thursday: { available: { type: Boolean, default: true }, hours: String },
    friday: { available: { type: Boolean, default: true }, hours: String },
    saturday: { available: { type: Boolean, default: true }, hours: String },
    sunday: { available: { type: Boolean, default: true }, hours: String }
  },
  // Franchise Association
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
  // SQL Level & Performance
  SQL_level: {
    type: String,
    enum: ['Free', 'Basic', 'Normal', 'High', 'VIP'],
    default: 'Free'
  },
  performanceScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Verification Status
  verified: {
    type: Boolean,
    default: false
  },
  verificationStatus: {
    pss: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, verifiedAt: Date, verifiedBy: String },
    edr: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, verifiedAt: Date, verifiedBy: String },
    emo: { status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, verifiedAt: Date, verifiedBy: String }
  },
  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Login Security
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  // Analytics & Performance
  totalDeliveries: {
    type: Number,
    default: 0
  },
  successfulDeliveries: {
    type: Number,
    default: 0
  },
  failedDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  averageDeliveryTime: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  // Current Status
  currentStatus: {
    type: String,
    enum: ['available', 'busy', 'offline', 'on_delivery'],
    default: 'offline'
  },
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
riderSchema.index({ email: 1 }, { unique: true });
riderSchema.index({ phone: 1 }, { unique: true });
riderSchema.index({ 'cnic.number': 1 }, { unique: true });
riderSchema.index({ franchiseId: 1 });
riderSchema.index({ franchiseType: 1 });
riderSchema.index({ SQL_level: 1 });
riderSchema.index({ status: 1 });
riderSchema.index({ verified: 1 });
riderSchema.index({ currentStatus: 1 });
riderSchema.index({ performanceScore: -1 });
riderSchema.index({ 'address.city': 1 });
riderSchema.index({ 'address.area': 1 });

// Pre-save middleware
riderSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  this.updatedAt = new Date();
  next();
});

// Instance methods
riderSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

riderSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

riderSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

riderSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

riderSchema.methods.isAvailable = function(day) {
  return this.availability[day.toLowerCase()]?.available || false;
};

riderSchema.methods.isFullyVerified = function() {
  return this.verificationStatus.pss.status === 'approved' &&
         this.verificationStatus.edr.status === 'approved' &&
         this.verificationStatus.emo.status === 'approved';
};

riderSchema.methods.updateDeliveryStats = function(successful, deliveryTime) {
  this.totalDeliveries += 1;
  if (successful) {
    this.successfulDeliveries += 1;
  } else {
    this.failedDeliveries += 1;
  }

  // Update average delivery time
  const totalTime = (this.averageDeliveryTime * (this.totalDeliveries - 1)) + deliveryTime;
  this.averageDeliveryTime = totalTime / this.totalDeliveries;

  // Update performance score
  this.performanceScore = (this.successfulDeliveries / this.totalDeliveries) * 100;

  return this.save();
};

riderSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

riderSchema.methods.updateLocation = function(lat, lng) {
  this.currentLocation = {
    coordinates: { lat, lng },
    updatedAt: new Date()
  };
  return this.save();
};

// Static methods
riderSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

riderSchema.statics.findByPhone = function(phone) {
  return this.findOne({ phone });
};

riderSchema.statics.findByCNIC = function(cnic) {
  return this.findOne({ 'cnic.number': cnic });
};

riderSchema.statics.findAvailable = function(location, franchiseType = 'sub') {
  return this.find({
    currentStatus: 'available',
    franchiseType,
    isActive: true,
    verified: true,
    'deliveryAreas.city': location.city
  }).sort({ performanceScore: -1, rating: -1 });
};

riderSchema.statics.findByFranchise = function(franchiseId) {
  return this.find({
    franchiseId,
    isActive: true
  }).sort({ createdAt: -1 });
};

riderSchema.statics.findBySQLLevel = function(sqlLevel) {
  return this.find({
    SQL_level: sqlLevel,
    isActive: true,
    verified: true
  });
};

riderSchema.statics.getRiderStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalRiders: { $sum: 1 },
        activeRiders: {
          $sum: {
            $cond: [{ $eq: ['$currentStatus', 'available'] }, 1, 0]
          }
        },
        verifiedRiders: {
          $sum: {
            $cond: ['$verified', 1, 0]
          }
        },
        averagePerformance: { $avg: '$performanceScore' },
        averageRating: { $avg: '$rating.average' },
        totalDeliveries: { $sum: '$totalDeliveries' },
        totalEarnings: { $sum: '$totalEarnings' }
      }
    }
  ]);
};

riderSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({
    isActive: true,
    verified: true
  })
  .sort({ performanceScore: -1, rating: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Rider', riderSchema);
