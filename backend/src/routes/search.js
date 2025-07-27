const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const Category = require('../models/Category');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// Search products
router.get('/products', catchAsync(async (req, res) => {
  const {
    q = '',
    category,
    seller,
    minPrice,
    maxPrice,
    rating,
    sort = 'relevance',
    page = 1,
    limit = 20,
    inStock = false
  } = req.query;

  const query = { isActive: true };

  // Text search
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { tags: { $in: [new RegExp(q, 'i')] } }
    ];
  }

  // Category filter
  if (category) {
    query.categoryId = category;
  }

  // Seller filter
  if (seller) {
    query.sellerId = seller;
  }

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Stock filter
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Sort options
  let sortOption = {};
  switch (sort) {
    case 'price_low':
      sortOption = { price: 1 };
      break;
    case 'price_high':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'popular':
      sortOption = { viewCount: -1 };
      break;
    case 'relevance':
    default:
      // For relevance, we'll use text score if there's a search query
      if (q) {
        sortOption = { score: { $meta: 'textScore' } };
      } else {
        sortOption = { createdAt: -1 };
      }
  }

  const products = await Product.find(query)
    .populate('categoryId', 'name')
    .populate('sellerId', 'businessName businessType')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  // Get search suggestions
  const suggestions = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$categoryId' } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $limit: 5 }
  ]);

  res.json(new ApiResponse(200, 'Products searched successfully', {
    products,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    },
    suggestions: suggestions.map(s => s.category.name)
  }));
}));

// Search sellers
router.get('/sellers', catchAsync(async (req, res) => {
  const {
    q = '',
    businessType,
    location,
    rating,
    sort = 'relevance',
    page = 1,
    limit = 20
  } = req.query;

  const query = { status: 'approved' };

  // Text search
  if (q) {
    query.$or = [
      { businessName: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ];
  }

  // Business type filter
  if (businessType) {
    query.businessType = businessType;
  }

  // Location filter
  if (location) {
    query.$or = [
      { 'businessAddress.city': { $regex: location, $options: 'i' } },
      { 'businessAddress.state': { $regex: location, $options: 'i' } }
    ];
  }

  // Rating filter
  if (rating) {
    query.rating = { $gte: parseFloat(rating) };
  }

  // Sort options
  let sortOption = {};
  switch (sort) {
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'sales':
      sortOption = { totalSales: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'relevance':
    default:
      sortOption = { rating: -1, totalSales: -1 };
  }

  const sellers = await Seller.find(query)
    .populate('userId', 'firstName lastName profile.avatar')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Seller.countDocuments(query);

  res.json(new ApiResponse(200, 'Sellers searched successfully', {
    sellers,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Advanced search
router.post('/advanced', [
  body('query').optional().trim(),
  body('filters').optional().isObject(),
  body('sort').optional().isString(),
  body('page').optional().isInt({ min: 1 }),
  body('limit').optional().isInt({ min: 1, max: 100 })
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { query = '', filters = {}, sort = 'relevance', page = 1, limit = 20 } = req.body;

  const searchQuery = { isActive: true };

  // Text search
  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  // Apply filters
  if (filters.category) {
    searchQuery.categoryId = filters.category;
  }

  if (filters.seller) {
    searchQuery.sellerId = filters.seller;
  }

  if (filters.priceRange) {
    searchQuery.price = {};
    if (filters.priceRange.min) searchQuery.price.$gte = filters.priceRange.min;
    if (filters.priceRange.max) searchQuery.price.$lte = filters.priceRange.max;
  }

  if (filters.rating) {
    searchQuery.rating = { $gte: filters.rating };
  }

  if (filters.inStock) {
    searchQuery.stock = { $gt: 0 };
  }

  if (filters.brands && filters.brands.length > 0) {
    searchQuery.brand = { $in: filters.brands };
  }

  // Sort options
  let sortOption = {};
  switch (sort) {
    case 'price_low':
      sortOption = { price: 1 };
      break;
    case 'price_high':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'popular':
      sortOption = { viewCount: -1 };
      break;
    case 'relevance':
    default:
      if (query) {
        sortOption = { score: { $meta: 'textScore' } };
      } else {
        sortOption = { createdAt: -1 };
      }
  }

  const products = await Product.find(searchQuery)
    .populate('categoryId', 'name')
    .populate('sellerId', 'businessName businessType')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(searchQuery);

  // Get facets for filtering
  const facets = await Product.aggregate([
    { $match: searchQuery },
    {
      $facet: {
        categories: [
          { $group: { _id: '$categoryId', count: { $sum: 1 } } },
          { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
          { $unwind: '$category' },
          { $project: { name: '$category.name', count: 1 } }
        ],
        brands: [
          { $group: { _id: '$brand', count: { $sum: 1 } } },
          { $match: { _id: { $ne: null } } }
        ],
        priceRange: [
          { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }
        ],
        ratings: [
          { $group: { _id: '$rating', count: { $sum: 1 } } },
          { $sort: { _id: -1 } }
        ]
      }
    }
  ]);

  res.json(new ApiResponse(200, 'Advanced search completed successfully', {
    products,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    },
    facets: facets[0] || {
      categories: [],
      brands: [],
      priceRange: [],
      ratings: []
    }
  }));
}));

// Search suggestions
router.get('/suggestions', catchAsync(async (req, res) => {
  const { q = '', type = 'products' } = req.query;

  if (!q || q.length < 2) {
    return res.json(new ApiResponse(200, 'No suggestions available', { suggestions: [] }));
  }

  let suggestions = [];

  if (type === 'products') {
    // Get product suggestions
    const products = await Product.find({
      name: { $regex: q, $options: 'i' },
      isActive: true
    })
    .select('name categoryId')
    .populate('categoryId', 'name')
    .limit(5);

    suggestions = products.map(product => ({
      type: 'product',
      id: product._id,
      name: product.name,
      category: product.categoryId?.name
    }));
  } else if (type === 'categories') {
    // Get category suggestions
    const categories = await Category.find({
      name: { $regex: q, $options: 'i' },
      isActive: true
    })
    .select('name')
    .limit(5);

    suggestions = categories.map(category => ({
      type: 'category',
      id: category._id,
      name: category.name
    }));
  } else if (type === 'sellers') {
    // Get seller suggestions
    const sellers = await Seller.find({
      businessName: { $regex: q, $options: 'i' },
      status: 'approved'
    })
    .select('businessName businessType')
    .limit(5);

    suggestions = sellers.map(seller => ({
      type: 'seller',
      id: seller._id,
      name: seller.businessName,
      businessType: seller.businessType
    }));
  }

  res.json(new ApiResponse(200, 'Suggestions retrieved successfully', { suggestions }));
}));

// Search by category
router.get('/category/:categoryId', catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 20, sort = 'relevance' } = req.query;

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Get all subcategories
  const subcategories = await Category.find({ parentId: categoryId });
  const categoryIds = [categoryId, ...subcategories.map(c => c._id)];

  const query = {
    categoryId: { $in: categoryIds },
    isActive: true
  };

  // Sort options
  let sortOption = {};
  switch (sort) {
    case 'price_low':
      sortOption = { price: 1 };
      break;
    case 'price_high':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'popular':
      sortOption = { viewCount: -1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const products = await Product.find(query)
    .populate('categoryId', 'name')
    .populate('sellerId', 'businessName businessType')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.json(new ApiResponse(200, 'Category products retrieved successfully', {
    category,
    products,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Search analytics
router.get('/analytics', catchAsync(async (req, res) => {
  const { period = '7d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '1d':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get search statistics
  const searchStats = await Product.aggregate([
    {
      $match: {
        isActive: true,
        updatedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        averageRating: { $avg: '$rating' },
        totalViews: { $sum: '$viewCount' }
      }
    }
  ]);

  // Get top searched categories
  const topCategories = await Product.aggregate([
    {
      $match: {
        isActive: true,
        updatedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$categoryId',
        count: { $sum: 1 },
        totalViews: { $sum: '$viewCount' }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $project: {
        name: '$category.name',
        count: 1,
        totalViews: 1
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.json(new ApiResponse(200, 'Search analytics retrieved successfully', {
    period,
    stats: searchStats[0] || {
      totalProducts: 0,
      averagePrice: 0,
      averageRating: 0,
      totalViews: 0
    },
    topCategories
  }));
}));

module.exports = router;
