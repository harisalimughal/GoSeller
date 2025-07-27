const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: 200
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  ancestors: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0,
    min: 0
  },
  path: {
    type: String,
    required: true
  },
  image: {
    url: String,
    alt: String,
    caption: String,
    thumbnail: String
  },
  icon: {
    type: String,
    default: 'folder'
  },
  banner: {
    url: String,
    alt: String,
    title: String,
    subtitle: String,
    ctaText: String,
    ctaUrl: String
  },
  seo: {
    title: {
      type: String,
      maxlength: 60
    },
    description: {
      type: String,
      maxlength: 160
    },
    keywords: [String],
    canonicalUrl: String,
    ogImage: String,
    ogTitle: String,
    ogDescription: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'archived'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0,
    min: 0
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  displaySettings: {
    showInMenu: {
      type: Boolean,
      default: true
    },
    showInFooter: {
      type: Boolean,
      default: false
    },
    showInHomepage: {
      type: Boolean,
      default: false
    },
    showInSidebar: {
      type: Boolean,
      default: true
    },
    showProductCount: {
      type: Boolean,
      default: true
    },
    showSubcategories: {
      type: Boolean,
      default: true
    }
  },
  filters: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['range', 'checkbox', 'radio', 'select', 'color', 'size'],
      required: true
    },
    options: [{
      label: String,
      value: String,
      count: Number
    }],
    minValue: Number,
    maxValue: Number,
    step: Number,
    unit: String,
    required: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    sortOrder: {
      type: Number,
      default: 0
    }
  }],
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'date', 'select', 'multiselect'],
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: false
    },
    options: [String],
    defaultValue: Schema.Types.Mixed,
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      message: String
    }
  }],
  commission: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  analytics: {
    viewCount: {
      type: Number,
      default: 0
    },
    clickCount: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    productCount: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    keywords: [String],
    tags: [String],
    customFields: Schema.Types.Mixed
  },
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
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ featured: 1 });
categorySchema.index({ priority: -1 });
categorySchema.index({ sortOrder: 1 });
categorySchema.index({ path: 1 });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ 'seo.keywords': 1 });

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  return this.path;
});

// Virtual for children count
categorySchema.virtual('childrenCount', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
  count: true
});

// Virtual for products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Pre-save middleware to generate slug and path
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.generateSlug(this.name);
  }

  if (this.isModified('parent') || this.isModified('name')) {
    await this.updatePath();
  }

  next();
});

// Pre-save middleware to update ancestors
categorySchema.pre('save', async function(next) {
  if (this.isModified('parent')) {
    await this.updateAncestors();
  }
  next();
});

// Instance method to generate slug
categorySchema.methods.generateSlug = function(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Instance method to update path
categorySchema.methods.updatePath = async function() {
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.path = `${parent.path}/${this.slug}`;
      this.level = parent.level + 1;
    }
  } else {
    this.path = this.slug;
    this.level = 0;
  }
};

// Instance method to update ancestors
categorySchema.methods.updateAncestors = async function() {
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.ancestors = [...parent.ancestors, parent._id];
    }
  } else {
    this.ancestors = [];
  }
};

// Instance method to get breadcrumb
categorySchema.methods.getBreadcrumb = async function() {
  const breadcrumb = [];
  let current = this;

  while (current) {
    breadcrumb.unshift({
      _id: current._id,
      name: current.name,
      slug: current.slug,
      path: current.path
    });

    if (current.parent) {
      current = await this.constructor.findById(current.parent);
    } else {
      current = null;
    }
  }

  return breadcrumb;
};

// Instance method to get all children recursively
categorySchema.methods.getAllChildren = async function() {
  const children = await this.constructor.find({ parent: this._id });
  let allChildren = [...children];

  for (const child of children) {
    const grandChildren = await child.getAllChildren();
    allChildren = [...allChildren, ...grandChildren];
  }

  return allChildren;
};

// Instance method to get all products in category and subcategories
categorySchema.methods.getAllProducts = async function() {
  const Product = mongoose.model('Product');
  const children = await this.getAllChildren();
  const categoryIds = [this._id, ...children.map(child => child._id)];

  return Product.find({ category: { $in: categoryIds } });
};

// Static method to get category tree
categorySchema.statics.getTree = async function(filters = {}) {
  const categories = await this.find(filters).sort({ sortOrder: 1, name: 1 });

  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => String(item.parent) === String(parentId))
      .map(item => ({
        ...item.toObject(),
        children: buildTree(items, item._id)
      }));
  };

  return buildTree(categories);
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function(limit = 10) {
  return this.find({
    featured: true,
    status: 'active'
  })
  .sort({ priority: -1, sortOrder: 1 })
  .limit(limit)
  .populate('childrenCount');
};

// Static method to get categories for menu
categorySchema.statics.getMenuCategories = function() {
  return this.find({
    'displaySettings.showInMenu': true,
    status: 'active'
  })
  .sort({ sortOrder: 1, name: 1 })
  .populate('subcategories');
};

// Static method to search categories
categorySchema.statics.search = function(query, options = {}) {
  const { limit = 10, skip = 0, sort = { name: 1 } } = options;

  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { 'seo.keywords': { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'active'
  })
  .sort(sort)
  .skip(skip)
  .limit(limit);
};

// Static method to get category statistics
categorySchema.statics.getStats = async function() {
  const pipeline = [
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        featuredCategories: {
          $sum: { $cond: ['$featured', 1, 0] }
        },
        averageProductsPerCategory: { $avg: '$analytics.productCount' },
        totalRevenue: { $sum: '$analytics.totalRevenue' }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || {
    totalCategories: 0,
    activeCategories: 0,
    featuredCategories: 0,
    averageProductsPerCategory: 0,
    totalRevenue: 0
  };
};

// Static method to update analytics
categorySchema.statics.updateAnalytics = async function(categoryId) {
  const Product = mongoose.model('Product');
  const Order = mongoose.model('Order');

  const category = await this.findById(categoryId);
  if (!category) return;

  // Get all products in this category and subcategories
  const allProducts = await category.getAllProducts();
  const productIds = allProducts.map(p => p._id);

  // Calculate analytics
  const productCount = allProducts.length;
  const totalRevenue = await Order.aggregate([
    {
      $match: {
        'items.product': { $in: productIds },
        status: { $in: ['delivered', 'completed'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalAmount' }
      }
    }
  ]);

  const averageOrderValue = await Order.aggregate([
    {
      $match: {
        'items.product': { $in: productIds },
        status: { $in: ['delivered', 'completed'] }
      }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$totalAmount' }
      }
    }
  ]);

  // Update category analytics
  await this.findByIdAndUpdate(categoryId, {
    'analytics.productCount': productCount,
    'analytics.totalRevenue': totalRevenue[0]?.total || 0,
    'analytics.averageOrderValue': averageOrderValue[0]?.average || 0
  });
};

module.exports = mongoose.model('Category', categorySchema);
