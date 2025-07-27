const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },

  // Profile Information
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },

  // Address Information
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'billing', 'shipping'],
      default: 'home'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    firstName: String,
    lastName: String,
    company: String,
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'US'
    },
    phone: String
  }],

  // Account Settings
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin', 'super-admin'],
    default: 'customer'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },

  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CNY']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        marketing: { type: Boolean, default: true },
        orderUpdates: { type: Boolean, default: true },
        security: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: true }
      },
      push: {
        marketing: { type: Boolean, default: true },
        orderUpdates: { type: Boolean, default: true },
        security: { type: Boolean, default: true }
      },
      sms: {
        orderUpdates: { type: Boolean, default: false },
        security: { type: Boolean, default: true }
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      allowDataCollection: { type: Boolean, default: true }
    }
  },

  // Social Media
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String,
    tiktok: String
  },

  // Business Information (for sellers)
  business: {
    name: String,
    description: String,
    website: String,
    logo: String,
    banner: String,
    category: String,
    subcategory: String,
    tags: [String],
    founded: Date,
    employees: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+']
    },
    annualRevenue: {
      type: String,
      enum: ['<100k', '100k-500k', '500k-1m', '1m-5m', '5m-10m', '10m+']
    },
    verified: {
      type: Boolean,
      default: false
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 }
    },
    commission: {
      type: Number,
      default: 5, // 5% commission
      min: 0,
      max: 100
    }
  },

  // Wallet & Payments
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit', 'refund', 'commission', 'withdrawal']
      },
      amount: Number,
      description: String,
      reference: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Blockchain Integration
  blockchain: {
    walletAddress: String,
    walletType: {
      type: String,
      enum: ['ethereum', 'polygon', 'binance', 'solana'],
      default: 'ethereum'
    },
    tokens: [{
      symbol: String,
      balance: Number,
      contractAddress: String
    }],
    nfts: [{
      tokenId: String,
      contractAddress: String,
      metadata: Object
    }]
  },

  // Analytics & Tracking
  analytics: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: Date,
    favoriteCategories: [String],
    browsingHistory: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
    searchHistory: [{
      query: String,
      searchedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // Security & Sessions
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  sessions: [{
    token: String,
    device: String,
    ip: String,
    userAgent: String,
    lastActivity: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: Date,
  lastActivityAt: Date,

  // Soft Delete
  deletedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'business.verified': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastActivityAt: -1 });
userSchema.index({ isDeleted: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for default address
userSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

// Virtual for is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete confirmPassword field
    this.confirmPassword = undefined;

    // Set passwordChangedAt
    this.passwordChangedAt = Date.now() - 1000; // 1 second ago

    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// Instance method to generate refresh token
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      id: this._id,
      type: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    }
  );
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({
    status: 'active',
    isDeleted: false
  });
};

// Static method to find sellers
userSchema.statics.findSellers = function() {
  return this.find({
    role: 'seller',
    status: 'active',
    isDeleted: false
  });
};

// Static method to find admins
userSchema.statics.findAdmins = function() {
  return this.find({
    role: { $in: ['admin', 'super-admin'] },
    status: 'active',
    isDeleted: false
  });
};

module.exports = mongoose.model('User', userSchema);
