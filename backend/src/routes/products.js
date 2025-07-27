const express = require('express');
const Product = require('../models/Product');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

const router = express.Router();

// Get all products
router.get('/', catchAsync(async (req, res) => {
  const products = await Product.find().populate('category');
  res.json(new ApiResponse(200, { products }, 'Products retrieved successfully'));
}));

// Get single product
router.get('/:id', catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category');
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  res.json(new ApiResponse(200, { product }, 'Product retrieved successfully'));
}));

// Create product
router.post('/', catchAsync(async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.status(201).json(new ApiResponse(201, { product }, 'Product created successfully'));
}));

// Update product
router.put('/:id', catchAsync(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  res.json(new ApiResponse(200, { product }, 'Product updated successfully'));
}));

// Delete product
router.delete('/:id', catchAsync(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  res.json(new ApiResponse(200, {}, 'Product deleted successfully'));
}));

module.exports = router;
