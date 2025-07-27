const express = require('express');
const Order = require('../models/Order');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

const router = express.Router();

// Get all orders
router.get('/', catchAsync(async (req, res) => {
  const orders = await Order.find().populate('user');
  res.json(new ApiResponse(200, { orders }, 'Orders retrieved successfully'));
}));

// Get single order
router.get('/:id', catchAsync(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  res.json(new ApiResponse(200, { order }, 'Order retrieved successfully'));
}));

// Create order
router.post('/', catchAsync(async (req, res) => {
  const order = new Order(req.body);
  await order.save();
  res.status(201).json(new ApiResponse(201, { order }, 'Order created successfully'));
}));

module.exports = router;
