const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// Get all orders (with pagination, filtering, and sorting)
router.get('/', protect, catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = '-createdAt',
    status,
    customer,
    seller,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (customer) query.customer = customer;
  if (seller) query['items.seller'] = seller;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (minAmount || maxAmount) {
    query.totalAmount = {};
    if (minAmount) query.totalAmount.$gte = parseFloat(minAmount);
    if (maxAmount) query.totalAmount.$lte = parseFloat(maxAmount);
  }
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.firstName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.lastName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.email': { $regex: search, $options: 'i' } }
    ];
  }

  // Apply user restrictions
  if (req.user.role === 'customer') {
    query.customer = req.user._id;
  } else if (req.user.role === 'seller') {
    query['items.seller'] = req.user._id;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: [
      { path: 'customer', select: 'firstName lastName email avatar' },
      { path: 'items.product', select: 'name images price' },
      { path: 'items.seller', select: 'firstName lastName email' }
    ]
  };

  const orders = await Order.paginate(query, options);

  res.status(200).json(new ApiResponse(200, 'Orders retrieved successfully', orders));
}));

// Get order by ID
router.get('/:id', protect, catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'firstName lastName email phone avatar')
    .populate('items.product', 'name images price description')
    .populate('items.seller', 'firstName lastName email phone')
    .populate('affiliate.affiliateId', 'firstName lastName email');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check access permissions
  if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  if (req.user.role === 'seller' && !order.items.some(item => item.seller._id.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'Access denied');
  }

  res.status(200).json(new ApiResponse(200, 'Order retrieved successfully', order));
}));

// Create new order
router.post('/', protect, catchAsync(async (req, res) => {
  const {
    items,
    shippingAddress,
    billingAddress,
    paymentMethod,
    couponCode,
    notes,
    source = 'web'
  } = req.body;

  // Validate items
  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  // Calculate totals and validate products
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ApiError(400, `Product ${item.product} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for product ${product.name}`);
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
      totalPrice: itemTotal,
      variant: item.variant || {},
      seller: product.seller || product.userId
    });
  }

  // Apply coupon if provided
  let discount = 0;
  let coupon = null;
  if (couponCode) {
    const Coupon = require('../models/Coupon');
    coupon = await Coupon.getByCode(couponCode);

    if (coupon) {
      const validation = await coupon.validateForUser(req.user._id, subtotal, items);
      if (validation.valid) {
        discount = coupon.calculateDiscount(subtotal, items);
      } else {
        throw new ApiError(400, validation.reason);
      }
    }
  }

  // Calculate totals
  const tax = subtotal * 0.1; // 10% tax - should be configurable
  const shipping = 0; // Should be calculated based on shipping method
  const totalAmount = subtotal + tax + shipping - discount;

  // Create order
  const order = new Order({
    customer: req.user._id,
    items: orderItems,
    subtotal,
    tax,
    shipping,
    discount,
    totalAmount,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    payment: {
      method: paymentMethod,
      amount: totalAmount,
      status: 'pending'
    },
    coupon: coupon ? {
      code: coupon.code,
      discount: discount,
      type: coupon.type
    } : null,
    notes: {
      customer: notes
    },
    source,
    analytics: {
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    }
  });

  await order.save();

  // Update product stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity }
    });
  }

  // Apply coupon if used
  if (coupon) {
    await coupon.applyCoupon(req.user._id, order._id, discount, totalAmount);
    await coupon.save();
  }

  // Populate order for response
  await order.populate([
    { path: 'customer', select: 'firstName lastName email' },
    { path: 'items.product', select: 'name images price' },
    { path: 'items.seller', select: 'firstName lastName email' }
  ]);

  res.status(201).json(new ApiResponse(201, 'Order created successfully', order));
}));

// Update order status
router.patch('/:id/status', protect, restrictTo(['admin', 'seller']), catchAsync(async (req, res) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check seller permissions
  if (req.user.role === 'seller') {
    const hasItems = order.items.some(item => item.seller.toString() === req.user._id.toString());
    if (!hasItems) {
      throw new ApiError(403, 'Access denied');
    }
  }

  // Update status
  await order.updateStatus(status, note, req.user._id);
  await order.save();

  res.status(200).json(new ApiResponse(200, 'Order status updated successfully', order));
}));

// Update order shipping information
router.patch('/:id/shipping', protect, restrictTo(['admin', 'seller']), catchAsync(async (req, res) => {
  const { trackingNumber, carrier, estimatedDelivery } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check seller permissions
  if (req.user.role === 'seller') {
    const hasItems = order.items.some(item => item.seller.toString() === req.user._id.toString());
    if (!hasItems) {
      throw new ApiError(403, 'Access denied');
    }
  }

  // Update shipping info
  order.shipping.trackingNumber = trackingNumber;
  order.shipping.carrier = carrier;
  order.shipping.estimatedDelivery = estimatedDelivery;

  if (trackingNumber) {
    order.shipping.trackingUrl = `https://tracking.example.com/${trackingNumber}`;
  }

  await order.save();

  res.status(200).json(new ApiResponse(200, 'Shipping information updated successfully', order));
}));

// Process refund
router.post('/:id/refund', protect, restrictTo(['admin', 'seller']), catchAsync(async (req, res) => {
  const { amount, reason, items = [] } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check seller permissions
  if (req.user.role === 'seller') {
    const hasItems = order.items.some(item => item.seller.toString() === req.user._id.toString());
    if (!hasItems) {
      throw new ApiError(403, 'Access denied');
    }
  }

  // Validate refund amount
  if (amount > order.totalAmount) {
    throw new ApiError(400, 'Refund amount cannot exceed order total');
  }

  // Process refund
  await order.processRefund(amount, reason, items);
  await order.save();

  // Update product stock if items are returned
  if (items.length > 0) {
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }
  }

  res.status(200).json(new ApiResponse(200, 'Refund processed successfully', order));
}));

// Get order statistics
router.get('/stats/overview', protect, restrictTo(['admin', 'seller']), catchAsync(async (req, res) => {
  const { startDate, endDate, seller } = req.query;

  const filters = {};
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) filters.createdAt.$gte = new Date(startDate);
    if (endDate) filters.createdAt.$lte = new Date(endDate);
  }

  if (seller) {
    filters['items.seller'] = seller;
  } else if (req.user.role === 'seller') {
    filters['items.seller'] = req.user._id;
  }

  const stats = await Order.getStats(filters);

  // Get status distribution
  const statusStats = await Order.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        total: { $sum: '$totalAmount' }
      }
    }
  ]);

  // Get daily orders for chart
  const dailyStats = await Order.aggregate([
    { $match: filters },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json(new ApiResponse(200, 'Order statistics retrieved successfully', {
    ...stats,
    statusDistribution: statusStats,
    dailyStats
  }));
}));

// Get orders by status
router.get('/status/:status', protect, catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const status = req.params.status;

  const query = { status };

  // Apply user restrictions
  if (req.user.role === 'customer') {
    query.customer = req.user._id;
  } else if (req.user.role === 'seller') {
    query['items.seller'] = req.user._id;
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: '-createdAt',
    populate: [
      { path: 'customer', select: 'firstName lastName email' },
      { path: 'items.product', select: 'name images price' }
    ]
  };

  const orders = await Order.paginate(query, options);

  res.status(200).json(new ApiResponse(200, 'Orders retrieved successfully', orders));
}));

// Cancel order
router.post('/:id/cancel', protect, catchAsync(async (req, res) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check permissions
  if (req.user.role === 'customer' && order.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Access denied');
  }

  if (req.user.role === 'seller') {
    const hasItems = order.items.some(item => item.seller.toString() === req.user._id.toString());
    if (!hasItems) {
      throw new ApiError(403, 'Access denied');
    }
  }

  // Check if order can be cancelled
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ApiError(400, 'Order cannot be cancelled in current status');
  }

  // Cancel order
  await order.updateStatus('cancelled', reason, req.user._id);
  await order.save();

  // Restore product stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }

  res.status(200).json(new ApiResponse(200, 'Order cancelled successfully', order));
}));

// Get customer orders
router.get('/customer/me', protect, catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { customer: req.user._id };
  if (status) query.status = status;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: '-createdAt',
    populate: [
      { path: 'items.product', select: 'name images price' },
      { path: 'items.seller', select: 'firstName lastName' }
    ]
  };

  const orders = await Order.paginate(query, options);

  res.status(200).json(new ApiResponse(200, 'Orders retrieved successfully', orders));
}));

// Get seller orders
router.get('/seller/me', protect, restrictTo(['seller']), catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { 'items.seller': req.user._id };
  if (status) query.status = status;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: '-createdAt',
    populate: [
      { path: 'customer', select: 'firstName lastName email' },
      { path: 'items.product', select: 'name images price' }
    ]
  };

  const orders = await Order.paginate(query, options);

  res.status(200).json(new ApiResponse(200, 'Orders retrieved successfully', orders));
}));

// Export orders
router.get('/export/csv', protect, restrictTo(['admin']), catchAsync(async (req, res) => {
  const { startDate, endDate, status } = req.query;

  const query = {};
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'name')
    .sort('-createdAt');

  // Convert to CSV format
  const csvData = orders.map(order => ({
    orderNumber: order.orderNumber,
    customer: `${order.customer.firstName} ${order.customer.lastName}`,
    email: order.customer.email,
    status: order.status,
    totalAmount: order.totalAmount,
    items: order.items.length,
    createdAt: order.createdAt.toISOString()
  }));

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');

  // Convert to CSV string
  const csvString = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).join(','))
  ].join('\n');

  res.send(csvString);
}));

module.exports = router;
