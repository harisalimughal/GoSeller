const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

/**
 * @route   GET /api/ai/recommendations
 * @desc    Get personalized product recommendations
 * @access  Private
 */
router.get('/recommendations', auth, aiService.getPersonalizedRecommendations);

/**
 * @route   GET /api/ai/recommendations/general
 * @desc    Get general product recommendations
 * @access  Public
 */
router.get('/recommendations/general', aiService.getGeneralRecommendations);

/**
 * @route   POST /api/ai/search
 * @desc    AI-powered product search
 * @access  Public
 */
router.post('/search', aiService.aiSearch);

/**
 * @route   POST /api/ai/generate-description
 * @desc    Generate product description using AI
 * @access  Private (Admin)
 */
router.post('/generate-description', auth, aiService.generateProductDescription);

/**
 * @route   POST /api/ai/analyze-sentiment
 * @desc    Analyze customer sentiment
 * @access  Private
 */
router.post('/analyze-sentiment', auth, aiService.analyzeSentiment);

/**
 * @route   GET /api/ai/insights/:productId
 * @desc    Get product insights and analytics
 * @access  Private (Admin)
 */
router.get('/insights/:productId', auth, aiService.getProductInsights);

/**
 * @route   GET /api/ai/recommendations/user/:userId
 * @desc    Get personalized recommendations for specific user
 * @access  Private (Admin)
 */
router.get('/recommendations/user/:userId', auth, aiService.getPersonalizedRecommendations);

module.exports = router;
