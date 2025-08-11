const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    enum: ['Grocery', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Automotive', 'Health', 'Other']
  },
  subcategory: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  // Tiered Pricing for Company Sellers
  tieredPricing: {
    dealerPrice: {
      type: Number,
      min: 0
    },
    wholesalerPrice: {
      type: Number,
      min: 0
    },
    storePrice: {
      type: Number,
      min: 0
    },
    retailPrice: {
      type: Number,
      min: 0
    }
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  // Enhanced Inventory Management
  inventory: {
    availableStock: {
      type: Number,
      min: 0,
      default: 0
    },
    reservedStock: {
      type: Number,
      min: 0,
      default: 0
    },
    minimumStockLevel: {
      type: Number,
      min: 0,
      default: 0
    },
    reorderPoint: {
      type: Number,
      min: 0,
      default: 0
    },
    supplierInfo: {
      name: String,
      contact: String,
      leadTime: Number // in days
    }
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  specifications: [{
    name: String,
    value: String
  }],
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  warranty: {
    type: String,
    trim: true
  },
  // SQL Level Features
  SQL_level: {
    type: String,
    enum: ['Free', 'Basic', 'Normal', 'High', 'VIP'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'draft'],
    default: 'pending'
  },
  // SEO Fields
  metaTitle: {
    type: String,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [{
    type: String,
    trim: true
  }],
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  sales: {
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
  // Express Delivery
  expressDelivery: {
    available: {
      type: Boolean,
      default: false
    },
    estimatedTime: {
      type: String,
      default: '24-48 hours'
    },
    additionalCost: {
      type: Number,
      default: 0
    }
  },
  // Location & Coverage
  availableLocations: [{
    type: String,
    trim: true
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
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
productSchema.index({ slug: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ SQL_level: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ views: -1 });
productSchema.index({ sales: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ tags: 1 });
productSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // Generate SKU if not provided
  if (!this.sku) {
    this.sku = `PRD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Calculate discount percentage
  if (this.originalPrice && this.price) {
    this.discountPercentage = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }

  this.updatedAt = new Date();
  next();
});

// Instance methods
productSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

productSchema.methods.incrementSales = function(quantity = 1) {
  this.sales += quantity;
  return this.save();
};

productSchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  return this.save();
};

productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

productSchema.methods.getFinalPrice = function() {
  return this.price;
};

productSchema.methods.getDiscountAmount = function() {
  if (this.originalPrice) {
    return this.originalPrice - this.price;
  }
  return 0;
};

// Static methods
productSchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true, status: 'approved' });
};

productSchema.statics.findTrending = function(limit = 10) {
  return this.find({
    isActive: true,
    status: 'approved'
  })
  .sort({ views: -1, sales: -1 })
  .limit(limit);
};

productSchema.statics.findBySQLLevel = function(sqlLevel) {
  return this.find({
    SQL_level: sqlLevel,
    isActive: true,
    status: 'approved'
  });
};

productSchema.statics.searchProducts = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    status: 'approved'
  };

  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (filters.category) {
    searchQuery.category = filters.category;
  }

  if (filters.minPrice || filters.maxPrice) {
    searchQuery.price = {};
    if (filters.minPrice) searchQuery.price.$gte = parseFloat(filters.minPrice);
    if (filters.maxPrice) searchQuery.price.$lte = parseFloat(filters.maxPrice);
  }

  if (filters.sqlLevel) {
    searchQuery.SQL_level = filters.sqlLevel;
  }

  return this.find(searchQuery)
    .populate('sellerId', 'name shopName location SQL_level verified')
    .sort({ createdAt: -1 });
};

productSchema.statics.getPopularTags = function(limit = 20) {
  return this.aggregate([
    { $match: { isActive: true, status: 'approved' } },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Product', productSchema);
