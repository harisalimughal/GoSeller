const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    overall: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    },
    customerService: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    caption: String,
    thumbnail: String
  }],
  videos: [{
    url: {
      type: String,
      required: true
    },
    thumbnail: String,
    duration: Number,
    platform: {
      type: String,
      enum: ['youtube', 'vimeo', 'direct']
    }
  }],
  verified: {
    type: Boolean,
    default: false
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  unhelpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'spam', 'hidden'],
    default: 'pending'
  },
  moderation: {
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reason: String,
    notes: String
  },
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  language: {
    type: String,
    default: 'en'
  },
  location: {
    country: String,
    region: String,
    city: String
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'app']
  },
  source: {
    type: String,
    enum: ['web', 'mobile', 'email', 'admin', 'api'],
    default: 'web'
  },
  tags: [String],
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  },
  replies: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    isSeller: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date
  }],
  flags: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other'],
      required: true
    },
    description: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    reviewed: {
      type: Boolean,
      default: false
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    action: {
      type: String,
      enum: ['dismissed', 'hidden', 'removed']
    }
  }],
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date,
  featuredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  editedAt: Date,
  editedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    },
    editedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ verified: 1 });
reviewSchema.index({ featured: 1 });
reviewSchema.index({ 'sentiment.label': 1 });
reviewSchema.index({ status: 1, createdAt: -1 });

// Compound indexes
reviewSchema.index({ product: 1, 'rating.overall': -1 });
reviewSchema.index({ product: 1, verified: 1, 'rating.overall': -1 });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

// Virtual for average rating
reviewSchema.virtual('averageRating').get(function() {
  const ratings = [
    this.rating.overall,
    this.rating.quality,
    this.rating.value,
    this.rating.delivery,
    this.rating.customerService
  ].filter(r => r !== undefined);

  return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
});

// Virtual for helpful score
reviewSchema.virtual('helpfulScore').get(function() {
  const total = this.helpful.count + this.unhelpful.count;
  return total > 0 ? this.helpful.count / total : 0;
});

// Virtual for review age
reviewSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for is verified purchase
reviewSchema.virtual('isVerifiedPurchase').get(function() {
  return this.verifiedPurchase && this.order;
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Set publishedAt on first save
  if (this.isNew && this.status === 'approved') {
    this.publishedAt = new Date();
  }

  // Update editedAt when content changes
  if (this.isModified('content') || this.isModified('title') || this.isModified('rating')) {
    this.editedAt = new Date();
  }

  // Auto-approve verified purchases
  if (this.verifiedPurchase && this.status === 'pending') {
    this.status = 'approved';
    this.verified = true;
  }

  next();
});

// Pre-save middleware to update product rating
reviewSchema.pre('save', async function(next) {
  if (this.isModified('rating.overall') || this.isModified('status')) {
    await this.updateProductRating();
  }
  next();
});

// Instance method to update product rating
reviewSchema.methods.updateProductRating = async function() {
  const Product = mongoose.model('Product');

  if (this.status === 'approved') {
    const reviews = await this.constructor.find({
      product: this.product,
      status: 'approved'
    });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating.overall, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    await Product.findByIdAndUpdate(this.product, {
      'rating.average': averageRating,
      'rating.count': reviews.length,
      'rating.distribution': this.calculateRatingDistribution(reviews)
    });
  }
};

// Instance method to calculate rating distribution
reviewSchema.methods.calculateRatingDistribution = function(reviews) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach(review => {
    const rating = Math.round(review.rating.overall);
    if (distribution[rating] !== undefined) {
      distribution[rating]++;
    }
  });

  return distribution;
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count++;

    // Remove from unhelpful if user had marked it unhelpful
    const unhelpfulIndex = this.unhelpful.users.indexOf(userId);
    if (unhelpfulIndex > -1) {
      this.unhelpful.users.splice(unhelpfulIndex, 1);
      this.unhelpful.count--;
    }
  }
  return this;
};

// Instance method to mark as unhelpful
reviewSchema.methods.markUnhelpful = function(userId) {
  if (!this.unhelpful.users.includes(userId)) {
    this.unhelpful.users.push(userId);
    this.unhelpful.count++;

    // Remove from helpful if user had marked it helpful
    const helpfulIndex = this.helpful.users.indexOf(userId);
    if (helpfulIndex > -1) {
      this.helpful.users.splice(helpfulIndex, 1);
      this.helpful.count--;
    }
  }
  return this;
};

// Instance method to add reply
reviewSchema.methods.addReply = function(userId, content, isSeller = false, isAdmin = false) {
  this.replies.push({
    user: userId,
    content,
    isSeller,
    isAdmin,
    createdAt: new Date()
  });
  return this;
};

// Instance method to flag review
reviewSchema.methods.flagReview = function(userId, reason, description = '') {
  // Check if user already flagged
  const existingFlag = this.flags.find(flag => flag.user.toString() === userId.toString());
  if (existingFlag) {
    throw new Error('User has already flagged this review');
  }

  this.flags.push({
    user: userId,
    reason,
    description,
    createdAt: new Date()
  });
  return this;
};

// Static method to get reviews by product
reviewSchema.statics.getByProduct = function(productId, options = {}) {
  const {
    status = 'approved',
    sort = { createdAt: -1 },
    limit = 10,
    skip = 0,
    rating = null,
    verified = null
  } = options;

  let query = { product: productId, status };

  if (rating) {
    query['rating.overall'] = rating;
  }

  if (verified !== null) {
    query.verified = verified;
  }

  return this.find(query)
    .populate('customer', 'firstName lastName avatar')
    .populate('replies.user', 'firstName lastName avatar')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get reviews by customer
reviewSchema.statics.getByCustomer = function(customerId, options = {}) {
  const {
    status = 'approved',
    sort = { createdAt: -1 },
    limit = 10,
    skip = 0
  } = options;

  return this.find({ customer: customerId, status })
    .populate('product', 'name images price')
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Static method to get review statistics
reviewSchema.statics.getStats = async function(filters = {}) {
  const pipeline = [
    { $match: { ...filters, status: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating.overall' },
        verifiedReviews: {
          $sum: { $cond: ['$verifiedPurchase', 1, 0] }
        },
        totalHelpful: { $sum: '$helpful.count' },
        totalUnhelpful: { $sum: '$unhelpful.count' },
        ratingDistribution: {
          $push: '$rating.overall'
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  const stats = result[0] || {
    totalReviews: 0,
    averageRating: 0,
    verifiedReviews: 0,
    totalHelpful: 0,
    totalUnhelpful: 0,
    ratingDistribution: []
  };

  // Calculate rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats.ratingDistribution.forEach(rating => {
    const roundedRating = Math.round(rating);
    if (distribution[roundedRating] !== undefined) {
      distribution[roundedRating]++;
    }
  });

  stats.ratingDistribution = distribution;
  delete stats._id;

  return stats;
};

// Static method to get featured reviews
reviewSchema.statics.getFeatured = function(limit = 5) {
  return this.find({
    featured: true,
    status: 'approved'
  })
  .populate('product', 'name images price')
  .populate('customer', 'firstName lastName avatar')
  .sort({ featuredAt: -1 })
  .limit(limit);
};

// Static method to search reviews
reviewSchema.statics.search = function(query, options = {}) {
  const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options;

  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'approved'
  })
  .populate('product', 'name images price')
  .populate('customer', 'firstName lastName avatar')
  .sort(sort)
  .skip(skip)
  .limit(limit);
};

// Static method to get reviews needing moderation
reviewSchema.statics.getPendingModeration = function(limit = 20) {
  return this.find({ status: 'pending' })
    .populate('product', 'name')
    .populate('customer', 'firstName lastName email')
    .sort({ createdAt: 1 })
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);
