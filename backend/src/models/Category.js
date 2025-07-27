const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  icon: {
    type: String,
    default: '📦'
  },
  image: {
    type: String
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  order: {
    type: Number,
    default: 0
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
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Analytics
  productCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
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
categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Pre-save middleware
categorySchema.pre('save', function(next) {
  // Generate slug if not provided
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  this.updatedAt = new Date();
  next();
});

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Virtual for full path
categorySchema.virtual('fullPath').get(function() {
  return this.parentId ? `${this.parentId.name} > ${this.name}` : this.name;
});

// Instance methods
categorySchema.methods.incrementProductCount = function() {
  this.productCount += 1;
  return this.save();
};

categorySchema.methods.decrementProductCount = function() {
  if (this.productCount > 0) {
    this.productCount -= 1;
  }
  return this.save();
};

categorySchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static methods
categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, isActive: true });
};

categorySchema.statics.findMainCategories = function() {
  return this.find({
    parentId: null,
    isActive: true
  }).sort({ order: 1, name: 1 });
};

categorySchema.statics.findSubcategories = function(parentId) {
  return this.find({
    parentId,
    isActive: true
  }).sort({ order: 1, name: 1 });
};

categorySchema.statics.findFeatured = function() {
  return this.find({
    isFeatured: true,
    isActive: true
  }).sort({ order: 1, name: 1 });
};

categorySchema.statics.getCategoryTree = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parentId',
        as: 'subcategories'
      }
    },
    {
      $addFields: {
        subcategories: {
          $filter: {
            input: '$subcategories',
            as: 'sub',
            cond: { $eq: ['$$sub.isActive', true] }
          }
        }
      }
    },
    { $sort: { order: 1, name: 1 } }
  ]);
};

categorySchema.statics.updateProductCounts = async function() {
  const Product = mongoose.model('Product');

  const categories = await this.find({ isActive: true });

  for (const category of categories) {
    const count = await Product.countDocuments({
      category: category.name,
      isActive: true,
      status: 'approved'
    });

    category.productCount = count;
    await category.save();
  }
};

module.exports = mongoose.model('Category', categorySchema);
