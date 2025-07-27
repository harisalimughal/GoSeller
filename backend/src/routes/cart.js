const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// Get user's cart
router.get('/', catchAsync(async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.userId })
    .populate('items.product', 'name price images stock sellerId');

  if (!cart) {
    cart = new Cart({ userId: req.user.userId, items: [] });
    await cart.save();
  }

  res.json(new ApiResponse(200, 'Cart retrieved successfully', { cart }));
}));

// Add item to cart
router.post('/add', [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { productId, quantity } = req.body;

  // Check if product exists and is available
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (!product.isActive) {
    throw new ApiError(400, 'Product is not available');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, 'Insufficient stock');
  }

  // Get or create cart
  let cart = await Cart.findOne({ userId: req.user.userId });
  if (!cart) {
    cart = new Cart({ userId: req.user.userId, items: [] });
  }

  // Check if product already exists in cart
  const existingItem = cart.items.find(item =>
    item.product.toString() === productId
  );

  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
    if (existingItem.quantity > product.stock) {
      throw new ApiError(400, 'Insufficient stock');
    }
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price
    });
  }

  await cart.save();

  // Populate product details
  await cart.populate('items.product', 'name price images stock sellerId');

  res.json(new ApiResponse(200, 'Item added to cart successfully', { cart }));
}));

// Update cart item quantity
router.put('/update/:itemId', [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { quantity } = req.body;
  const { itemId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  // Check stock availability
  const product = await Product.findById(item.product);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (quantity > product.stock) {
    throw new ApiError(400, 'Insufficient stock');
  }

  item.quantity = quantity;
  await cart.save();

  await cart.populate('items.product', 'name price images stock sellerId');

  res.json(new ApiResponse(200, 'Cart item updated successfully', { cart }));
}));

// Remove item from cart
router.delete('/remove/:itemId', catchAsync(async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ userId: req.user.userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.id(itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  item.remove();
  await cart.save();

  await cart.populate('items.product', 'name price images stock sellerId');

  res.json(new ApiResponse(200, 'Item removed from cart successfully', { cart }));
}));

// Clear cart
router.delete('/clear', catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.items = [];
  await cart.save();

  res.json(new ApiResponse(200, 'Cart cleared successfully', { cart }));
}));

// Get cart summary
router.get('/summary', catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId })
    .populate('items.product', 'name price images stock sellerId');

  if (!cart || cart.items.length === 0) {
    return res.json(new ApiResponse(200, 'Cart is empty', {
      summary: {
        itemCount: 0,
        totalQuantity: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0
      }
    }));
  }

  // Calculate summary
  const itemCount = cart.items.length;
  const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Calculate tax (example: 10%)
  const taxRate = 0.10;
  const tax = subtotal * taxRate;

  // Calculate shipping (example: free shipping over $50, otherwise $5)
  const shipping = subtotal >= 50 ? 0 : 5;

  const total = subtotal + tax + shipping;

  res.json(new ApiResponse(200, 'Cart summary retrieved successfully', {
    summary: {
      itemCount,
      totalQuantity,
      subtotal,
      tax,
      shipping,
      total
    }
  }));
}));

// Apply coupon to cart
router.post('/apply-coupon', [
  body('couponCode').trim().notEmpty().withMessage('Coupon code is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { couponCode } = req.body;

  // Find coupon
  const coupon = await require('../models/Coupon').findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() }
  });

  if (!coupon) {
    throw new ApiError(404, 'Invalid or expired coupon code');
  }

  const cart = await Cart.findOne({ userId: req.user.userId })
    .populate('items.product', 'name price images stock sellerId');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Check minimum order value
  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotal < coupon.minimumOrderValue) {
    throw new ApiError(400, `Minimum order value of $${coupon.minimumOrderValue} required`);
  }

  // Apply discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100;
  } else {
    discount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed subtotal
  discount = Math.min(discount, subtotal);

  cart.appliedCoupon = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discount: discount
  };

  await cart.save();

  res.json(new ApiResponse(200, 'Coupon applied successfully', { cart }));
}));

// Remove coupon from cart
router.delete('/remove-coupon', catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  cart.appliedCoupon = null;
  await cart.save();

  await cart.populate('items.product', 'name price images stock sellerId');

  res.json(new ApiResponse(200, 'Coupon removed successfully', { cart }));
}));

// Check cart item availability
router.post('/check-availability', catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId })
    .populate('items.product', 'name price images stock sellerId');

  if (!cart || cart.items.length === 0) {
    return res.json(new ApiResponse(200, 'Cart is empty', { issues: [] }));
  }

  const issues = [];

  for (const item of cart.items) {
    const product = item.product;

    if (!product.isActive) {
      issues.push({
        itemId: item._id,
        productId: product._id,
        productName: product.name,
        issue: 'Product is no longer available'
      });
    } else if (product.stock < item.quantity) {
      issues.push({
        itemId: item._id,
        productId: product._id,
        productName: product.name,
        issue: `Only ${product.stock} items available`,
        availableStock: product.stock
      });
    }
  }

  res.json(new ApiResponse(200, 'Cart availability checked', { issues }));
}));

module.exports = router;
