const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isActive: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  helpful: {
    yes: {
      type: Number,
      default: 0
    },
    no: {
      type: Number,
      default: 0
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
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, isActive: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ 'reports.user': 1 });

// Virtual for helpful percentage
reviewSchema.virtual('helpfulPercentage').get(function() {
  const total = this.helpful.yes + this.helpful.no;
  if (total === 0) return 0;
  return Math.round((this.helpful.yes / total) * 100);
});

// Virtual for like count
reviewSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for report count
reviewSchema.virtual('reportCount').get(function() {
  return this.reports.length;
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to add like
reviewSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove like
reviewSchema.methods.removeLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to toggle like
reviewSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// Instance method to add report
reviewSchema.methods.addReport = function(userId, reason) {
  const existingReport = this.reports.find(
    report => report.user.toString() === userId.toString()
  );

  if (!existingReport) {
    this.reports.push({
      user: userId,
      reason,
      reportedAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = function(isHelpful) {
  if (isHelpful) {
    this.helpful.yes += 1;
  } else {
    this.helpful.no += 1;
  }
  return this.save();
};

// Static method to get reviews by product
reviewSchema.statics.findByProduct = function(productId, options = {}) {
  const { page = 1, limit = 10, rating, sort = 'newest' } = options;

  const query = { product: productId, isActive: true };

  if (rating) {
    query.rating = parseInt(rating);
  }

  let sortOption = {};
  switch (sort) {
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'highest':
      sortOption = { rating: -1 };
      break;
    case 'lowest':
      sortOption = { rating: 1 };
      break;
    case 'helpful':
      sortOption = { 'helpful.yes': -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  return this.find(query)
    .populate('user', 'firstName lastName profile.avatar')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get user reviews
reviewSchema.statics.findByUser = function(userId, options = {}) {
  const { page = 1, limit = 10 } = options;

  return this.find({ user: userId })
    .populate('product', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get review statistics
reviewSchema.statics.getStats = function(productId) {
  return this.aggregate([
    { $match: { product: productId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
};

// Static method to update product rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].totalReviews
    });
  }
};

// Static method to get top reviews
reviewSchema.statics.getTopReviews = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('user', 'firstName lastName profile.avatar')
    .populate('product', 'name images price')
    .sort({ 'helpful.yes': -1, rating: -1 })
    .limit(limit);
};

// Static method to get recent reviews
reviewSchema.statics.getRecentReviews = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('user', 'firstName lastName profile.avatar')
    .populate('product', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get reported reviews
reviewSchema.statics.getReportedReviews = function(limit = 20) {
  return this.find({
    'reports.0': { $exists: true }
  })
    .populate('user', 'firstName lastName')
    .populate('product', 'name')
    .populate('reports.user', 'firstName lastName')
    .sort({ 'reports.0.reportedAt': -1 })
    .limit(limit);
};

module.exports = mongoose.model('Review', reviewSchema);
