const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessType: {
    type: String,
    required: true,
    enum: ['shop', 'store', 'wholesaler', 'distributor', 'dealer', 'company'],
    default: 'shop'
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  businessPhone: {
    type: String,
    required: true
  },
  taxId: {
    type: String,
    trim: true
  },
  businessLicense: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  paymentMethods: [{
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'crypto']
  }],
  shippingMethods: [{
    type: String,
    enum: ['pickup', 'delivery', 'express', 'standard']
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
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    linkedin: String
  },
  documents: {
    businessLicense: String,
    taxCertificate: String,
    insuranceCertificate: String
  },
  // SQL Level Tracking
  sqlLevel: {
    current: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    experience: {
      type: Number,
      default: 0
    },
    nextLevelExp: {
      type: Number,
      default: 1000
    },
    achievements: [{
      type: String,
      enum: [
        'first_sale',
        'first_product',
        'first_review',
        'sales_milestone_100',
        'sales_milestone_500',
        'sales_milestone_1000',
        'perfect_rating',
        'customer_satisfaction',
        'quick_delivery',
        'quality_products'
      ]
    }],
    badges: [{
      type: String,
      enum: [
        'new_seller',
        'rising_star',
        'trusted_seller',
        'premium_seller',
        'expert_seller',
        'master_seller',
        'legend_seller',
        'divine_seller',
        'cosmic_seller',
        'eternal_seller'
      ]
    }]
  },
  // Company SQL Level
  companySqlLevel: {
    current: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    experience: {
      type: Number,
      default: 0
    },
    nextLevelExp: {
      type: Number,
      default: 2000
    },
    companyAchievements: [{
      type: String,
      enum: [
        'company_registered',
        'first_employee',
        'business_expansion',
        'market_leader',
        'industry_expert',
        'global_presence',
        'innovation_leader',
        'sustainability_champion',
        'community_leader',
        'legacy_builder'
      ]
    }],
    companyBadges: [{
      type: String,
      enum: [
        'startup',
        'growing_business',
        'established_company',
        'market_player',
        'industry_leader',
        'premium_brand',
        'trusted_enterprise',
        'global_company',
        'innovative_leader',
        'legacy_company'
      ]
    }]
  },
  // Performance Metrics
  performance: {
    monthlySales: {
      type: Number,
      default: 0
    },
    monthlyOrders: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    deliveryTime: {
      type: Number,
      default: 0 // in hours
    },
    returnRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  // Analytics
  analytics: {
    totalViews: {
      type: Number,
      default: 0
    },
    totalFavorites: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageOrderValue: {
      type: Number,
      default: 0
    }
  },
  // Settings
  settings: {
    autoAcceptOrders: {
      type: Boolean,
      default: false
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      showContactInfo: { type: Boolean, default: true },
      showBusinessHours: { type: Boolean, default: true },
      showAnalytics: { type: Boolean, default: false }
    }
  },
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
sellerSchema.index({ email: 1 });
sellerSchema.index({ userId: 1 });
sellerSchema.index({ businessName: 1 });
sellerSchema.index({ businessType: 1 });
sellerSchema.index({ status: 1 });
sellerSchema.index({ rating: -1 });
sellerSchema.index({ totalSales: -1 });
sellerSchema.index({ 'businessAddress.city': 1 });
sellerSchema.index({ 'businessAddress.state': 1 });

// Virtual for full business address
sellerSchema.virtual('fullBusinessAddress').get(function() {
  const addr = this.businessAddress;
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

// Virtual for business hours summary
sellerSchema.virtual('businessHoursSummary').get(function() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const openDays = days.filter(day => !this.businessHours[day].closed);

  if (openDays.length === 0) return 'Closed';
  if (openDays.length === 7) return 'Open 7 days a week';

  return `Open ${openDays.length} days a week`;
});

// Virtual for SQL level progress
sellerSchema.virtual('sqlLevelProgress').get(function() {
  const current = this.sqlLevel.current;
  const exp = this.sqlLevel.experience;
  const nextExp = this.sqlLevel.nextLevelExp;

  return {
    level: current,
    experience: exp,
    nextLevelExp: nextExp,
    progress: Math.round((exp / nextExp) * 100)
  };
});

// Virtual for company SQL level progress
sellerSchema.virtual('companySqlLevelProgress').get(function() {
  const current = this.companySqlLevel.current;
  const exp = this.companySqlLevel.experience;
  const nextExp = this.companySqlLevel.nextLevelExp;

  return {
    level: current,
    experience: exp,
    nextLevelExp: nextExp,
    progress: Math.round((exp / nextExp) * 100)
  };
});

// Pre-save middleware
sellerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find sellers by location
sellerSchema.statics.findByLocation = function(city, state, limit = 10) {
  return this.find({
    'businessAddress.city': new RegExp(city, 'i'),
    'businessAddress.state': new RegExp(state, 'i'),
    status: 'approved'
  })
  .sort({ rating: -1, totalSales: -1 })
  .limit(limit);
};

// Static method to find top sellers
sellerSchema.statics.findTopSellers = function(limit = 10) {
  return this.find({ status: 'approved' })
    .sort({ rating: -1, totalSales: -1 })
    .limit(limit);
};

// Instance method to add experience
sellerSchema.methods.addExperience = function(amount) {
  this.sqlLevel.experience += amount;

  // Check for level up
  while (this.sqlLevel.experience >= this.sqlLevel.nextLevelExp) {
    this.sqlLevel.experience -= this.sqlLevel.nextLevelExp;
    this.sqlLevel.current += 1;
    this.sqlLevel.nextLevelExp = Math.round(this.sqlLevel.nextLevelExp * 1.5);
  }

  return this.save();
};

// Instance method to add company experience
sellerSchema.methods.addCompanyExperience = function(amount) {
  this.companySqlLevel.experience += amount;

  // Check for company level up
  while (this.companySqlLevel.experience >= this.companySqlLevel.nextLevelExp) {
    this.companySqlLevel.experience -= this.companySqlLevel.nextLevelExp;
    this.companySqlLevel.current += 1;
    this.companySqlLevel.nextLevelExp = Math.round(this.companySqlLevel.nextLevelExp * 1.5);
  }

  return this.save();
};

// Instance method to add achievement
sellerSchema.methods.addAchievement = function(achievement) {
  if (!this.sqlLevel.achievements.includes(achievement)) {
    this.sqlLevel.achievements.push(achievement);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to add company achievement
sellerSchema.methods.addCompanyAchievement = function(achievement) {
  if (!this.companySqlLevel.companyAchievements.includes(achievement)) {
    this.companySqlLevel.companyAchievements.push(achievement);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to add badge
sellerSchema.methods.addBadge = function(badge) {
  if (!this.sqlLevel.badges.includes(badge)) {
    this.sqlLevel.badges.push(badge);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to add company badge
sellerSchema.methods.addCompanyBadge = function(badge) {
  if (!this.companySqlLevel.companyBadges.includes(badge)) {
    this.companySqlLevel.companyBadges.push(badge);
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('Seller', sellerSchema);
