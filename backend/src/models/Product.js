const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },

  // Pricing
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },

  // Images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  thumbnail: {
    type: String,
    required: true
  },

  // Category and Brand
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },

  // Inventory
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },

  // Specifications
  specifications: [{
    name: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  }],

  // Dimensions and Weight
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      enum: ['cm', 'inch'],
      default: 'cm'
    }
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz'],
      default: 'kg'
    }
  },

  // Shipping
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    }
  },

  // Ratings and Reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },

  // SEO and Marketing
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title cannot exceed 60 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  keywords: [String],
  tags: [String],

  // Status and Visibility
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  bestSeller: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },

  // AI and Analytics
  aiRecommendations: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    score: Number,
    reason: String
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  wishlistCount: {
    type: Number,
    default: 0
  },

  // Blockchain Integration
  blockchain: {
    tokenized: {
      type: Boolean,
      default: false
    },
    nftContract: String,
    tokenId: String,
    blockchain: {
      type: String,
      enum: ['ethereum', 'polygon', 'binance', 'solana'],
      default: 'ethereum'
    }
  },

  // Multi-platform Integration
  platformData: {
    amazon: {
      asin: String,
      price: Number,
      rating: Number,
      reviewCount: Number
    },
    shopify: {
      productId: String,
      price: Number,
      inventory: Number
    },
    ebay: {
      itemId: String,
      price: Number,
      condition: String
    }
  },

  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    name: String,
    id: String,
    rating: Number
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,

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
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ trending: 1, status: 1 });
productSchema.index({ bestSeller: 1, status: 1 });
productSchema.index({ newArrival: 1, status: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ seller: 1, status: 1 });

// Virtual for discount calculation
productSchema.virtual('discountAmount').get(function() {
  if (this.originalPrice && this.price) {
    return this.originalPrice - this.price;
  }
  return 0;
});

// Virtual for discount percentage calculation
productSchema.virtual('calculatedDiscountPercentage').get(function() {
  if (this.originalPrice && this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0] ? this.images[0].url : this.thumbnail);
});

// Virtual for in stock status
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for low stock status
productSchema.virtual('lowStock').get(function() {
  return this.stock > 0 && this.stock <= 10;
});

// Pre-save middleware to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  next();
});

// Pre-save middleware to update timestamps
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({
    featured: true,
    status: 'active',
    isDeleted: false
  }).populate('category');
};

// Static method to find trending products
productSchema.statics.findTrending = function() {
  return this.find({
    trending: true,
    status: 'active',
    isDeleted: false
  }).populate('category');
};

// Static method to find best sellers
productSchema.statics.findBestSellers = function() {
  return this.find({
    bestSeller: true,
    status: 'active',
    isDeleted: false
  }).populate('category');
};

// Static method to find new arrivals
productSchema.statics.findNewArrivals = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return this.find({
    createdAt: { $gte: thirtyDaysAgo },
    status: 'active',
    isDeleted: false
  }).populate('category');
};

// Instance method to update rating
productSchema.methods.updateRating = function(newRating) {
  const oldRating = this.ratings.average;
  const oldCount = this.ratings.count;

  this.ratings.count += 1;
  this.ratings.average = ((oldRating * oldCount) + newRating) / this.ratings.count;

  // Update rating distribution
  const ratingKey = Math.floor(newRating);
  if (this.ratings.distribution[ratingKey] !== undefined) {
    this.ratings.distribution[ratingKey] += 1;
  }

  return this.save();
};

// Instance method to increment view count
productSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Instance method to increment purchase count
productSchema.methods.incrementPurchaseCount = function() {
  this.purchaseCount += 1;
  return this.save();
};

// Instance method to increment wishlist count
productSchema.methods.incrementWishlistCount = function() {
  this.wishlistCount += 1;
  return this.save();
};

// Instance method to decrement wishlist count
productSchema.methods.decrementWishlistCount = function() {
  if (this.wishlistCount > 0) {
    this.wishlistCount -= 1;
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
