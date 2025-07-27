const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { upload } = require('../middleware/upload');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

// Validation schemas
const { productSchema, updateProductSchema } = require('../validations/productSchema');

/**
 * @route   GET /api/products
 * @desc    Get all products with pagination, filtering, and sorting
 * @access  Public
 */
router.get('/', catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    status = 'active',
    featured,
    trending,
    bestSeller,
    newArrival,
    search,
    inStock
  } = req.query;

  // Build filter object
  const filter = { isDeleted: false };

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (featured !== undefined) filter.featured = featured === 'true';
  if (trending !== undefined) filter.trending = trending === 'true';
  if (bestSeller !== undefined) filter.bestSeller = bestSeller === 'true';
  if (newArrival !== undefined) filter.newArrival = newArrival === 'true';
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (inStock === 'false') filter.stock = { $lte: 0 };

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (rating) {
    filter['ratings.average'] = { $gte: parseFloat(rating) };
  }

  // Search filter
  if (search) {
    filter.$text = { $search: search };
  }

  // Build sort object
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await Product.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.json(new ApiResponse(200, 'Products retrieved successfully', {
    products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  }));
}));

/**
 * @route   GET /api/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.findFeatured()
    .limit(parseInt(limit))
    .lean();

  res.json(new ApiResponse(200, 'Featured products retrieved successfully', { products }));
}));

/**
 * @route   GET /api/products/trending
 * @desc    Get trending products
 * @access  Public
 */
router.get('/trending', catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.findTrending()
    .limit(parseInt(limit))
    .lean();

  res.json(new ApiResponse(200, 'Trending products retrieved successfully', { products }));
}));

/**
 * @route   GET /api/products/best-sellers
 * @desc    Get best seller products
 * @access  Public
 */
router.get('/best-sellers', catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.findBestSellers()
    .limit(parseInt(limit))
    .lean();

  res.json(new ApiResponse(200, 'Best seller products retrieved successfully', { products }));
}));

/**
 * @route   GET /api/products/new-arrivals
 * @desc    Get new arrival products
 * @access  Public
 */
router.get('/new-arrivals', catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.findNewArrivals()
    .limit(parseInt(limit))
    .lean();

  res.json(new ApiResponse(200, 'New arrival products retrieved successfully', { products }));
}));

/**
 * @route   GET /api/products/search
 * @desc    Search products
 * @access  Public
 */
router.get('/search', catchAsync(async (req, res) => {
  const { q, limit = 20 } = req.query;

  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  const products = await Product.find({
    $text: { $search: q },
    status: 'active',
    isDeleted: false
  })
  .populate('category', 'name slug')
  .limit(parseInt(limit))
  .lean();

  res.json(new ApiResponse(200, 'Search results retrieved successfully', { products }));
}));

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOne({
    $or: [
      { _id: id },
      { slug: id }
    ],
    isDeleted: false
  })
  .populate('category', 'name slug description')
  .populate('subcategory', 'name slug')
  .populate('seller', 'name email avatar')
  .populate('aiRecommendations.productId', 'name price thumbnail ratings');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Increment view count
  await product.incrementViewCount();

  res.json(new ApiResponse(200, 'Product retrieved successfully', { product }));
}));

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (Seller/Admin)
 */
router.post('/',
  authMiddleware,
  upload.array('images', 10),
  validateRequest(productSchema),
  catchAsync(async (req, res) => {
    const productData = req.body;

    // Add seller information
    productData.seller = req.user.id;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file, index) => ({
        url: file.path,
        alt: file.originalname,
        isPrimary: index === 0
      }));
      productData.thumbnail = req.files[0].path;
    }

    // Generate SKU if not provided
    if (!productData.sku) {
      productData.sku = `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    const product = await Product.create(productData);

    await product.populate('category', 'name slug');
    await product.populate('seller', 'name email');

    res.status(201).json(new ApiResponse(201, 'Product created successfully', { product }));
  })
);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product
 * @access  Private (Seller/Admin)
 */
router.put('/:id',
  authMiddleware,
  upload.array('images', 10),
  validateRequest(updateProductSchema),
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user is authorized to update this product
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to update this product');
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file, index) => ({
        url: file.path,
        alt: file.originalname,
        isPrimary: index === 0
      }));
      updateData.thumbnail = req.files[0].path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('category', 'name slug')
    .populate('seller', 'name email');

    res.json(new ApiResponse(200, 'Product updated successfully', { product: updatedProduct }));
  })
);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (soft delete)
 * @access  Private (Seller/Admin)
 */
router.delete('/:id',
  authMiddleware,
  catchAsync(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user is authorized to delete this product
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to delete this product');
    }

    // Soft delete
    product.isDeleted = true;
    product.deletedAt = new Date();
    await product.save();

    res.json(new ApiResponse(200, 'Product deleted successfully'));
  })
);

/**
 * @route   PATCH /api/products/:id/status
 * @desc    Update product status
 * @access  Private (Seller/Admin)
 */
router.patch('/:id/status',
  authMiddleware,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user is authorized
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to update this product');
    }

    product.status = status;
    if (status === 'active') {
      product.publishedAt = new Date();
    }

    await product.save();

    res.json(new ApiResponse(200, 'Product status updated successfully', { product }));
  })
);

/**
 * @route   PATCH /api/products/:id/stock
 * @desc    Update product stock
 * @access  Private (Seller/Admin)
 */
router.patch('/:id/stock',
  authMiddleware,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Check if user is authorized
    if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized to update this product');
    }

    product.stock = stock;
    await product.save();

    res.json(new ApiResponse(200, 'Product stock updated successfully', { product }));
  })
);

/**
 * @route   POST /api/products/:id/review
 * @desc    Add review to product
 * @access  Private
 */
router.post('/:id/review',
  authMiddleware,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Update product rating
    await product.updateRating(rating);

    // Add review to reviews collection (if you have a separate reviews model)
    // This is a simplified version - you might want to create a separate Review model

    res.json(new ApiResponse(200, 'Review added successfully'));
  })
);

/**
 * @route   GET /api/products/:id/similar
 * @desc    Get similar products
 * @access  Public
 */
router.get('/:id/similar',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const product = await Product.findById(id);

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Find similar products based on category and price range
    const similarProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      status: 'active',
      isDeleted: false,
      price: {
        $gte: product.price * 0.7,
        $lte: product.price * 1.3
      }
    })
    .populate('category', 'name slug')
    .limit(parseInt(limit))
    .lean();

    res.json(new ApiResponse(200, 'Similar products retrieved successfully', { products: similarProducts }));
  })
);

/**
 * @route   GET /api/products/stats/overview
 * @desc    Get product statistics overview
 * @access  Private (Admin)
 */
router.get('/stats/overview',
  authMiddleware,
  adminMiddleware,
  catchAsync(async (req, res) => {
    const stats = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          inactiveProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          },
          draftProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          featuredProducts: {
            $sum: { $cond: ['$featured', 1, 0] }
          },
          trendingProducts: {
            $sum: { $cond: ['$trending', 1, 0] }
          },
          bestSellerProducts: {
            $sum: { $cond: ['$bestSeller', 1, 0] }
          },
          newArrivalProducts: {
            $sum: { $cond: ['$newArrival', 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $lte: ['$stock', 0] }, 1, 0] }
          },
          lowStockProducts: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 10] }] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    res.json(new ApiResponse(200, 'Product statistics retrieved successfully', { stats: stats[0] }));
  })
);

module.exports = router;
