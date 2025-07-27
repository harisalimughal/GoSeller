const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: 20
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y', 'bogo'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscount: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  usage: {
    limit: {
      type: Number,
      default: -1, // -1 means unlimited
      min: -1
    },
    used: {
      type: Number,
      default: 0,
      min: 0
    },
    perUser: {
      type: Number,
      default: 1,
      min: 1
    },
    perOrder: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  restrictions: {
    categories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }],
    products: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    excludedCategories: [{
      type: Schema.Types.ObjectId,
      ref: 'Category'
    }],
    excludedProducts: [{
      type: Schema.Types.ObjectId,
      ref: 'Product'
    }],
    userGroups: [{
      type: String,
      enum: ['new_customers', 'returning_customers', 'vip_customers', 'all']
    }],
    userRoles: [{
      type: String,
      enum: ['customer', 'seller', 'admin']
    }],
    specificUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    minimumItems: {
      type: Number,
      default: 1,
      min: 1
    },
    maximumItems: {
      type: Number,
      min: 1
    },
    firstTimePurchase: {
      type: Boolean,
      default: false
    },
    newCustomersOnly: {
      type: Boolean,
      default: false
    },
    excludeSaleItems: {
      type: Boolean,
      default: false
    },
    excludeClearance: {
      type: Boolean,
      default: false
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    activeDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    activeHours: {
      start: {
        type: String,
        default: '00:00'
      },
      end: {
        type: String,
        default: '23:59'
      }
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'suspended', 'draft'],
    default: 'draft'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
  },
  stackable: {
    type: Boolean,
    default: false
  },
  autoApply: {
    type: Boolean,
    default: false
  },
  autoApplyThreshold: {
    type: Number,
    min: 0
  },
  displaySettings: {
    showOnHomepage: {
      type: Boolean,
      default: false
    },
    showInCheckout: {
      type: Boolean,
      default: true
    },
    showInCart: {
      type: Boolean,
      default: true
    },
    showInEmail: {
      type: Boolean,
      default: false
    },
    showInBanner: {
      type: Boolean,
      default: false
    }
  },
  marketing: {
    bannerText: String,
    bannerColor: String,
    emailSubject: String,
    emailTemplate: String,
    socialMediaText: String,
    landingPage: String
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    },
    successfulUses: {
      type: Number,
      default: 0
    },
    totalDiscount: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    revenueGenerated: {
      type: Number,
      default: 0
    }
  },
  usageHistory: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    discountAmount: {
      type: Number,
      required: true
    },
    orderAmount: {
      type: Number,
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  metadata: {
    tags: [String],
    notes: String,
    customFields: Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
couponSchema.index({ code: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });
couponSchema.index({ 'usage.used': 1, 'usage.limit': 1 });
couponSchema.index({ priority: -1 });
couponSchema.index({ autoApply: 1 });
couponSchema.index({ 'restrictions.specificUsers': 1 });

// Compound indexes
couponSchema.index({ status: 1, 'schedule.startDate': 1, 'schedule.endDate': 1 });
couponSchema.index({ code: 1, status: 1 });

// Virtual for is active
couponSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' &&
         now >= this.schedule.startDate &&
         now <= this.schedule.endDate &&
         (this.usage.limit === -1 || this.usage.used < this.usage.limit);
});

// Virtual for is expired
couponSchema.virtual('isExpired').get(function() {
  return new Date() > this.schedule.endDate;
});

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function() {
  return this.usage.limit === -1 ? -1 : Math.max(0, this.usage.limit - this.usage.used);
});

// Virtual for usage percentage
couponSchema.virtual('usagePercentage').get(function() {
  if (this.usage.limit === -1) return 0;
  return this.usage.limit > 0 ? (this.usage.used / this.usage.limit) * 100 : 0;
});

// Virtual for days remaining
couponSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.schedule.endDate);
  const diffTime = endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
couponSchema.pre('save', function(next) {
  // Auto-generate code if not provided
  if (!this.code) {
    this.code = this.generateCode();
  }

  // Set publishedAt when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Validate dates
  if (this.schedule.startDate >= this.schedule.endDate) {
    return next(new Error('Start date must be before end date'));
  }

  next();
});

// Instance method to generate coupon code
couponSchema.methods.generateCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Instance method to validate coupon for user
couponSchema.methods.validateForUser = async function(userId, orderAmount = 0, items = []) {
  // Check if coupon is active
  if (!this.isActive) {
    return { valid: false, reason: 'Coupon is not active' };
  }

  // Check minimum order amount
  if (orderAmount < this.minimumOrderAmount) {
    return {
      valid: false,
      reason: `Minimum order amount of ${this.currency} ${this.minimumOrderAmount} required`
    };
  }

  // Check usage limits
  if (this.usage.limit !== -1 && this.usage.used >= this.usage.limit) {
    return { valid: false, reason: 'Coupon usage limit reached' };
  }

  // Check per-user usage limit
  const userUsage = this.usageHistory.filter(usage => usage.user.toString() === userId.toString()).length;
  if (userUsage >= this.usage.perUser) {
    return { valid: false, reason: 'Coupon usage limit per user reached' };
  }

  // Check user restrictions
  if (this.restrictions.specificUsers.length > 0) {
    if (!this.restrictions.specificUsers.includes(userId)) {
      return { valid: false, reason: 'Coupon not available for this user' };
    }
  }

  // Check product restrictions
  if (this.restrictions.products.length > 0 || this.restrictions.excludedProducts.length > 0) {
    const itemProductIds = items.map(item => item.product.toString());

    if (this.restrictions.products.length > 0) {
      const hasRequiredProduct = this.restrictions.products.some(productId =>
        itemProductIds.includes(productId.toString())
      );
      if (!hasRequiredProduct) {
        return { valid: false, reason: 'Coupon not applicable to items in cart' };
      }
    }

    if (this.restrictions.excludedProducts.length > 0) {
      const hasExcludedProduct = this.restrictions.excludedProducts.some(productId =>
        itemProductIds.includes(productId.toString())
      );
      if (hasExcludedProduct) {
        return { valid: false, reason: 'Coupon not applicable to some items in cart' };
      }
    }
  }

  return { valid: true };
};

// Instance method to calculate discount
couponSchema.methods.calculateDiscount = function(orderAmount, items = []) {
  let discountAmount = 0;

  switch (this.type) {
    case 'percentage':
      discountAmount = (orderAmount * this.value) / 100;
      break;
    case 'fixed':
      discountAmount = this.value;
      break;
    case 'free_shipping':
      // This would be handled separately in shipping calculation
      discountAmount = 0;
      break;
    case 'buy_x_get_y':
      // Complex logic for buy X get Y
      discountAmount = this.calculateBuyXGetYDiscount(items);
      break;
    case 'bogo':
      // Buy one get one logic
      discountAmount = this.calculateBOGODiscount(items);
      break;
  }

  // Apply maximum discount limit
  if (this.maximumDiscount && discountAmount > this.maximumDiscount) {
    discountAmount = this.maximumDiscount;
  }

  // Ensure discount doesn't exceed order amount
  discountAmount = Math.min(discountAmount, orderAmount);

  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Instance method to calculate buy X get Y discount
couponSchema.methods.calculateBuyXGetYDiscount = function(items) {
  // Implementation for buy X get Y discount
  return 0;
};

// Instance method to calculate BOGO discount
couponSchema.methods.calculateBOGODiscount = function(items) {
  // Implementation for buy one get one discount
  return 0;
};

// Instance method to apply coupon
couponSchema.methods.applyCoupon = function(userId, orderId, discountAmount, orderAmount) {
  this.usage.used++;
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountAmount,
    orderAmount,
    usedAt: new Date()
  });

  // Update analytics
  this.analytics.applications++;
  this.analytics.successfulUses++;
  this.analytics.totalDiscount += discountAmount;
  this.analytics.revenueGenerated += orderAmount;

  return this;
};

// Static method to get active coupons
couponSchema.statics.getActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    'schedule.startDate': { $lte: now },
    'schedule.endDate': { $gte: now },
    $or: [
      { 'usage.limit': -1 },
      { 'usage.used': { $lt: '$usage.limit' } }
    ]
  }).sort({ priority: -1, createdAt: 1 });
};

// Static method to get coupons by code
couponSchema.statics.getByCode = function(code) {
  return this.findOne({
    code: code.toUpperCase(),
    status: 'active'
  });
};

// Static method to get auto-apply coupons
couponSchema.statics.getAutoApply = function(orderAmount) {
  const now = new Date();
  return this.find({
    status: 'active',
    autoApply: true,
    'schedule.startDate': { $lte: now },
    'schedule.endDate': { $gte: now },
    'minimumOrderAmount': { $lte: orderAmount },
    $or: [
      { 'usage.limit': -1 },
      { 'usage.used': { $lt: '$usage.limit' } }
    ]
  }).sort({ priority: -1 });
};

// Static method to get coupon statistics
couponSchema.statics.getStats = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalCoupons: { $sum: 1 },
        activeCoupons: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        totalUsage: { $sum: '$usage.used' },
        totalDiscount: { $sum: '$analytics.totalDiscount' },
        totalRevenue: { $sum: '$analytics.revenueGenerated' },
        averageDiscount: { $avg: '$analytics.totalDiscount' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    totalDiscount: 0,
    totalRevenue: 0,
    averageDiscount: 0
  };
};

// Static method to search coupons
couponSchema.statics.search = function(query, options = {}) {
  const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

  return this.find({
    $or: [
      { code: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ]
  })
  .sort(sort)
  .skip(skip)
  .limit(limit);
};

module.exports = mongoose.model('Coupon', couponSchema);
