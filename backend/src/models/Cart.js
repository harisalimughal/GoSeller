const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
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
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  appliedCoupon: {
    code: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    discountValue: Number,
    discount: Number
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
cartSchema.index({ userId: 1 });
cartSchema.index({ 'items.product': 1 });

// Virtual for total items count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Virtual for total with discount
cartSchema.virtual('total').get(function() {
  const subtotal = this.subtotal;
  const discount = this.appliedCoupon ? this.appliedCoupon.discount : 0;
  return Math.max(0, subtotal - discount);
});

// Virtual for discount amount
cartSchema.virtual('discountAmount').get(function() {
  return this.appliedCoupon ? this.appliedCoupon.discount : 0;
});

// Pre-save middleware
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to add item
cartSchema.methods.addItem = function(productId, quantity, price) {
  const existingItem = this.items.find(item =>
    item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price
    });
  }

  return this.save();
};

// Instance method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    item.quantity = quantity;
    return this.save();
  }
  return Promise.reject(new Error('Item not found'));
};

// Instance method to remove item
cartSchema.methods.removeItem = function(itemId) {
  const item = this.items.id(itemId);
  if (item) {
    item.remove();
    return this.save();
  }
  return Promise.reject(new Error('Item not found'));
};

// Instance method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.appliedCoupon = null;
  return this.save();
};

// Instance method to apply coupon
cartSchema.methods.applyCoupon = function(coupon) {
  const subtotal = this.subtotal;

  if (subtotal < coupon.minimumOrderValue) {
    throw new Error(`Minimum order value of $${coupon.minimumOrderValue} required`);
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);

  this.appliedCoupon = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount: discount
  };

  return this.save();
};

// Instance method to remove coupon
cartSchema.methods.removeCoupon = function() {
  this.appliedCoupon = null;
  return this.save();
};

// Instance method to check item availability
cartSchema.methods.checkAvailability = async function() {
  const issues = [];

  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.product);

    if (!product) {
      issues.push({
        itemId: item._id,
        productId: item.product,
        issue: 'Product not found'
      });
    } else if (!product.isActive) {
      issues.push({
        itemId: item._id,
        productId: item.product,
        productName: product.name,
        issue: 'Product is no longer available'
      });
    } else if (product.stock < item.quantity) {
      issues.push({
        itemId: item._id,
        productId: item.product,
        productName: product.name,
        issue: `Only ${product.stock} items available`,
        availableStock: product.stock
      });
    }
  }

  return issues;
};

// Instance method to get cart summary
cartSchema.methods.getSummary = function() {
  const itemCount = this.items.length;
  const totalQuantity = this.itemCount;
  const subtotal = this.subtotal;
  const discount = this.discountAmount;
  const total = this.total;

  // Calculate tax (example: 10%)
  const taxRate = 0.10;
  const tax = total * taxRate;

  // Calculate shipping (example: free shipping over $50, otherwise $5)
  const shipping = total >= 50 ? 0 : 5;

  const finalTotal = total + tax + shipping;

  return {
    itemCount,
    totalQuantity,
    subtotal,
    discount,
    total,
    tax,
    shipping,
    finalTotal
  };
};

// Static method to get cart by user ID
cartSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId }).populate('items.product', 'name price images stock sellerId');
};

// Static method to create or get cart
cartSchema.statics.findOrCreate = async function(userId) {
  let cart = await this.findOne({ userId });

  if (!cart) {
    cart = new this({ userId, items: [] });
    await cart.save();
  }

  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
