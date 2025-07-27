const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', catchAsync(async (req, res) => {
  const { page = 1, limit = 10, rating, sort = 'newest' } = req.query;
  const { productId } = req.params;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const query = { product: productId, isActive: true };

  if (rating) {
    query.rating = parseInt(rating);
  }

  let sortOption = {};
  switch (sort) {
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    case 'highest':
      sortOption = { rating: -1 };
      break;
    case 'lowest':
      sortOption = { rating: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const reviews = await Review.find(query)
    .populate('user', 'firstName lastName profile.avatar')
    .sort(sortOption)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments(query);

  // Get rating statistics
  const ratingStats = await Review.aggregate([
    { $match: { product: productId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingCounts: {
          $push: '$rating'
        }
      }
    }
  ]);

  const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratingCounts: [] };

  // Calculate rating distribution
  const ratingDistribution = {
    5: stats.ratingCounts.filter(r => r === 5).length,
    4: stats.ratingCounts.filter(r => r === 4).length,
    3: stats.ratingCounts.filter(r => r === 3).length,
    2: stats.ratingCounts.filter(r => r === 2).length,
    1: stats.ratingCounts.filter(r => r === 1).length
  };

  res.json(new ApiResponse(200, 'Reviews retrieved successfully', {
    reviews,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    },
    stats: {
      averageRating: Math.round(stats.averageRating * 10) / 10,
      totalReviews: stats.totalReviews,
      ratingDistribution
    }
  }));
}));

// Get user's reviews
router.get('/user/me', catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.find({ user: req.user.userId })
    .populate('product', 'name images price')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments({ user: req.user.userId });

  res.json(new ApiResponse(200, 'User reviews retrieved successfully', {
    reviews,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Create review
router.post('/', [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { productId, rating, title, comment } = req.body;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({
    user: req.user.userId,
    product: productId
  });

  if (existingReview) {
    throw new ApiError(409, 'You have already reviewed this product');
  }

  // Check if user has purchased this product (optional validation)
  const hasPurchased = await require('../models/Order').exists({
    user: req.user.userId,
    'items.product': productId,
    status: { $in: ['delivered', 'completed'] }
  });

  if (!hasPurchased) {
    throw new ApiError(403, 'You can only review products you have purchased');
  }

  const review = new Review({
    user: req.user.userId,
    product: productId,
    rating,
    title,
    comment,
    isActive: true
  });

  await review.save();

  // Update product rating
  await updateProductRating(productId);

  // Populate user info
  await review.populate('user', 'firstName lastName profile.avatar');

  res.status(201).json(new ApiResponse(201, 'Review created successfully', { review }));
}));

// Update review
router.put('/:id', [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().trim().isLength({ max: 100 }),
  body('comment').optional().trim().isLength({ max: 1000 })
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user.userId) {
    throw new ApiError(403, 'You can only edit your own reviews');
  }

  const { rating, title, comment } = req.body;

  // Update fields
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;

  await review.save();

  // Update product rating
  await updateProductRating(review.product);

  // Populate user info
  await review.populate('user', 'firstName lastName profile.avatar');

  res.json(new ApiResponse(200, 'Review updated successfully', { review }));
}));

// Delete review
router.delete('/:id', catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  // Check if user owns this review
  if (review.user.toString() !== req.user.userId) {
    throw new ApiError(403, 'You can only delete your own reviews');
  }

  await Review.findByIdAndDelete(req.params.id);

  // Update product rating
  await updateProductRating(review.product);

  res.json(new ApiResponse(200, 'Review deleted successfully', {
    message: 'Review deleted successfully'
  }));
}));

// Like/Unlike review
router.post('/:id/like', catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const userId = req.user.userId;
  const likeIndex = review.likes.indexOf(userId);

  if (likeIndex > -1) {
    // Unlike
    review.likes.splice(likeIndex, 1);
  } else {
    // Like
    review.likes.push(userId);
  }

  await review.save();

  res.json(new ApiResponse(200, 'Review like updated successfully', {
    review: {
      id: review._id,
      likes: review.likes.length,
      isLiked: review.likes.includes(userId)
    }
  }));
}));

// Report review
router.post('/:id/report', [
  body('reason').trim().notEmpty().withMessage('Report reason is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const review = await Review.findById(req.params.id);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  const { reason } = req.body;

  // Check if user has already reported this review
  const existingReport = review.reports.find(
    report => report.user.toString() === req.user.userId
  );

  if (existingReport) {
    throw new ApiError(409, 'You have already reported this review');
  }

  review.reports.push({
    user: req.user.userId,
    reason,
    reportedAt: new Date()
  });

  await review.save();

  res.json(new ApiResponse(200, 'Review reported successfully', {
    message: 'Review reported successfully'
  }));
}));

// Get review statistics for a product
router.get('/stats/product/:productId', catchAsync(async (req, res) => {
  const { productId } = req.params;

  const stats = await Review.aggregate([
    { $match: { product: productId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (stats.length === 0) {
    return res.json(new ApiResponse(200, 'No reviews found', {
      stats: {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }));
  }

  const ratingCounts = stats[0].ratingDistribution;
  const ratingDistribution = {
    5: ratingCounts.filter(r => r === 5).length,
    4: ratingCounts.filter(r => r === 4).length,
    3: ratingCounts.filter(r => r === 3).length,
    2: ratingCounts.filter(r => r === 2).length,
    1: ratingCounts.filter(r => r === 1).length
  };

  res.json(new ApiResponse(200, 'Review statistics retrieved successfully', {
    stats: {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      ratingDistribution
    }
  }));
}));

// Helper function to update product rating
async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, isActive: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].totalReviews
    });
  }
}

module.exports = router;
