const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  variant: {
    size: String,
    color: String,
    material: String,
    customOptions: Schema.Types.Mixed
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  commission: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  }
}, { timestamps: true });

const shippingAddressSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'US'
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const paymentSchema = new Schema({
  method: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'crypto', 'bank_transfer', 'cash_on_delivery'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  cryptoDetails: {
    network: String,
    walletAddress: String,
    transactionHash: String,
    blockNumber: Number
  },
  cardDetails: {
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  gateway: {
    type: String,
    enum: ['stripe', 'paypal', 'crypto', 'custom'],
    default: 'stripe'
  },
  gatewayResponse: Schema.Types.Mixed,
  refundedAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date
}, { timestamps: true });

const orderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  },
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  payment: paymentSchema,
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard'
    },
    carrier: {
      type: String,
      default: 'standard'
    },
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippingLabel: String,
    packageWeight: Number,
    packageDimensions: {
      length: Number,
      width: Number,
      height: Number
    }
  },
  notes: {
    customer: String,
    internal: String
  },
  tags: [String],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  source: {
    type: String,
    enum: ['web', 'mobile', 'admin', 'api', 'phone'],
    default: 'web'
  },
  affiliate: {
    code: String,
    commission: Number,
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  analytics: {
    conversionSource: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    utmTerm: String,
    utmContent: String,
    referrer: String,
    userAgent: String,
    ipAddress: String,
    location: {
      country: String,
      region: String,
      city: String,
      latitude: Number,
      longitude: Number
    }
  },
  timeline: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'in_app'],
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    template: String,
    content: Schema.Types.Mixed
  }],
  reviews: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  returns: [{
    items: [{
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number,
      reason: String,
      condition: {
        type: String,
        enum: ['new', 'like_new', 'good', 'fair', 'poor']
      }
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    reason: String,
    refundAmount: Number,
    returnLabel: String,
    trackingNumber: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    processedAt: Date,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  metadata: Schema.Types.Mixed,
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  scheduledDelivery: Date,
  urgent: {
    type: Boolean,
    default: false
  },
  bulkOrder: {
    type: Boolean,
    default: false
  },
  bulkOrderId: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'payment.transactionId': 1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });
orderSchema.index({ 'items.seller': 1 });
orderSchema.index({ totalAmount: 1 });
orderSchema.index({ 'analytics.location.country': 1 });

// Virtual for order summary
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age
orderSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for profit calculation
orderSchema.virtual('profit').get(function() {
  const totalCost = this.items.reduce((total, item) => {
    return total + (item.product?.cost || 0) * item.quantity;
  }, 0);
  return this.totalAmount - totalCost;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Get count of orders today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const orderCount = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });

    this.orderNumber = `ORD-${year}${month}${day}-${String(orderCount + 1).padStart(4, '0')}`;
  }

  // Add to timeline when status changes
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`
    });
  }

  next();
});

// Static method to get order statistics
orderSchema.statics.getStats = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        totalItems: { $sum: { $sum: '$items.quantity' } }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    totalItems: 0
  };
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('customer items.product');
};

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => total + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.tax + this.shipping - this.discount;
  return this.totalAmount;
};

// Instance method to add item
orderSchema.methods.addItem = function(product, quantity, price, variant = {}) {
  const item = {
    product: product._id || product,
    quantity,
    price,
    totalPrice: quantity * price,
    variant,
    seller: product.seller || product.userId
  };

  this.items.push(item);
  this.calculateTotals();
  return this;
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy
  });
  return this;
};

// Instance method to process refund
orderSchema.methods.processRefund = function(amount, reason, items = []) {
  this.payment.refundedAmount = (this.payment.refundedAmount || 0) + amount;
  this.payment.refundReason = reason;
  this.payment.refundedAt = new Date();

  if (this.payment.refundedAmount >= this.totalAmount) {
    this.status = 'refunded';
  } else {
    this.status = 'partially_refunded';
  }

  return this;
};

module.exports = mongoose.model('Order', orderSchema);
