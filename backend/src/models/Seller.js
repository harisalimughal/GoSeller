const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  contact: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^(\+92|0)?[0-9]{10}$/, 'Please enter a valid Pakistani phone number']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    province: {
      type: String,
      required: [true, 'Province is required']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  sellerType: {
    type: String,
    required: [true, 'Seller type is required'],
    enum: ['shopkeeper', 'store', 'wholesaler', 'distributor', 'dealer', 'company'],
    default: 'shopkeeper'
  },
  shopName: {
    type: String,
    required: [true, 'Shop name is required'],
    trim: true,
    maxlength: [100, 'Shop name cannot exceed 100 characters']
  },
  SQL_level: {
    type: String,
    enum: ['Free', 'Basic', 'Normal', 'High', 'VIP'],
    default: 'Free'
  },
  verified: {
    type: Boolean,
    default: false
  },
  kyc_docs: [{
    documentType: {
      type: String,
      enum: ['CNIC', 'Business_License', 'Tax_Certificate', 'Bank_Statement']
    },
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  businessDetails: {
    businessId: String,
    taxNumber: String,
    bankAccount: String,
    businessCategory: String
  },
  profileImage: String,
  coverImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
sellerSchema.index({ email: 1 });
sellerSchema.index({ sellerType: 1 });
sellerSchema.index({ SQL_level: 1 });
sellerSchema.index({ verified: 1 });
sellerSchema.index({ 'location.city': 1 });

// Virtual for full address
sellerSchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.city}, ${this.location.province}`;
});

// Virtual for seller status
sellerSchema.virtual('status').get(function() {
  if (!this.isActive) return 'Suspended';
  if (!this.verified) return 'Pending Verification';
  return 'Active';
});

// Pre-save middleware to hash password
sellerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
sellerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
sellerSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
sellerSchema.methods.incLoginAttempts = function() {
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

// Method to reset login attempts
sellerSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: Date.now() }
  });
};

// Static method to find by email
sellerSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find verified sellers
sellerSchema.statics.findVerified = function() {
  return this.find({ verified: true, isActive: true });
};

// Static method to find by seller type
sellerSchema.statics.findByType = function(type) {
  return this.find({ sellerType: type, verified: true, isActive: true });
};

// Static method to find by SQL level
sellerSchema.statics.findBySQLLevel = function(level) {
  return this.find({ SQL_level: level, verified: true, isActive: true });
};

module.exports = mongoose.model('Seller', sellerSchema);
