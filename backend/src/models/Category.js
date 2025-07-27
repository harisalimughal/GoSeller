const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: 60
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160
  },
  sortOrder: {
    type: Number,
    default: 0
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
categorySchema.index({ name: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId'
});

// Virtual for products in this category
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'categoryId'
});

// Pre-save middleware to generate slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  this.updatedAt = new Date();
  next();
});

// Static method to get category tree
categorySchema.statics.getTree = function() {
  return this.find({ isActive: true })
    .populate('children')
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to get breadcrumb
categorySchema.statics.getBreadcrumb = async function(categoryId) {
  const breadcrumb = [];
  let currentCategory = await this.findById(categoryId);

  while (currentCategory) {
    breadcrumb.unshift({
      id: currentCategory._id,
      name: currentCategory.name,
      slug: currentCategory.slug
    });

    if (currentCategory.parentId) {
      currentCategory = await this.findById(currentCategory.parentId);
    } else {
      break;
    }
  }

  return breadcrumb;
};

// Instance method to get all children recursively
categorySchema.methods.getAllChildren = async function() {
  const children = await this.constructor.find({ parentId: this._id });
  let allChildren = [...children];

  for (const child of children) {
    const grandChildren = await child.getAllChildren();
    allChildren = allChildren.concat(grandChildren);
  }

  return allChildren;
};

// Instance method to get all parents recursively
categorySchema.methods.getAllParents = async function() {
  const parents = [];
  let currentCategory = this;

  while (currentCategory.parentId) {
    const parent = await this.constructor.findById(currentCategory.parentId);
    if (parent) {
      parents.unshift(parent);
      currentCategory = parent;
    } else {
      break;
    }
  }

  return parents;
};

module.exports = mongoose.model('Category', categorySchema);
