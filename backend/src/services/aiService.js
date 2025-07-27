const OpenAI = require('openai');
const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

class AIService {
  constructor() {
    this.recommendationModel = null;
    this.searchModel = null;
    this.initializeModels();
  }

  /**
   * Initialize AI models
   */
  async initializeModels() {
    try {
      // Load pre-trained models or create new ones
      this.recommendationModel = await this.createRecommendationModel();
      this.searchModel = await this.createSearchModel();
      console.log('✅ AI models initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing AI models:', error);
    }
  }

  /**
   * Create recommendation model
   */
  async createRecommendationModel() {
    // Simple collaborative filtering model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [10] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Create search optimization model
   */
  async createSearchModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 128, activation: 'relu', inputShape: [50] }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Get personalized product recommendations
   */
  getPersonalizedRecommendations = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { limit = 10, category } = req.query;

    // Get user's purchase history and preferences
    const user = await User.findById(userId).populate('preferences');
    const userOrders = await Order.find({ user: userId }).populate('items.product');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Extract user preferences and purchase patterns
    const userPreferences = this.extractUserPreferences(user, userOrders);

    // Get candidate products
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const candidateProducts = await Product.find(query)
      .limit(100)
      .populate('category');

    // Score and rank products
    const scoredProducts = await this.scoreProducts(candidateProducts, userPreferences);

    // Return top recommendations
    const recommendations = scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit))
      .map(item => item.product);

    res.status(200).json({
      success: true,
      data: recommendations,
      message: 'Personalized recommendations generated successfully'
    });
  });

  /**
   * Get general product recommendations
   */
  getGeneralRecommendations = catchAsync(async (req, res) => {
    const { limit = 10, category } = req.query;

    // Get trending products based on sales and ratings
    const trendingProducts = await Product.aggregate([
      { $match: { isActive: true, ...(category && { category }) } },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ['$rating', 0.4] },
              { $multiply: ['$reviews', 0.3] },
              { $multiply: [{ $subtract: [new Date(), '$createdAt'] }, -0.0001] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate category information
    const recommendations = await Product.populate(trendingProducts, {
      path: 'category',
      select: 'name slug'
    });

    res.status(200).json({
      success: true,
      data: recommendations,
      message: 'General recommendations generated successfully'
    });
  });

  /**
   * AI-powered product search
   */
  aiSearch = catchAsync(async (req, res) => {
    const { query, filters = {}, limit = 20, page = 1 } = req.body;

    if (!query || query.trim().length === 0) {
      throw new ApiError(400, 'Search query is required');
    }

    // Enhance search query using AI
    const enhancedQuery = await this.enhanceSearchQuery(query);

    // Build search pipeline
    const searchPipeline = this.buildSearchPipeline(enhancedQuery, filters, limit, page);

    // Execute search
    const searchResults = await Product.aggregate(searchPipeline);

    // Get total count for pagination
    const countPipeline = this.buildSearchPipeline(enhancedQuery, filters, null, null, true);
    const totalResults = await Product.aggregate(countPipeline);
    const total = totalResults.length > 0 ? totalResults[0].total : 0;

    // Populate category information
    const results = await Product.populate(searchResults, {
      path: 'category',
      select: 'name slug'
    });

    res.status(200).json({
      success: true,
      data: {
        products: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'AI-powered search completed successfully'
    });
  });

  /**
   * Generate product descriptions using AI
   */
  generateProductDescription = catchAsync(async (req, res) => {
    const { productName, category, features, price } = req.body;

    if (!productName) {
      throw new ApiError(400, 'Product name is required');
    }

    try {
      const prompt = `Generate a compelling product description for:
Product: ${productName}
Category: ${category || 'General'}
Features: ${features ? features.join(', ') : 'Not specified'}
Price: $${price || 'Not specified'}

Please create a professional, engaging description that highlights the benefits and features. Keep it between 100-200 words.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert e-commerce copywriter who creates compelling product descriptions that drive sales."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const description = completion.choices[0].message.content.trim();

      res.status(200).json({
        success: true,
        data: { description },
        message: 'Product description generated successfully'
      });
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new ApiError(500, 'Failed to generate product description');
    }
  });

  /**
   * Analyze customer sentiment
   */
  analyzeSentiment = catchAsync(async (req, res) => {
    const { text } = req.body;

    if (!text) {
      throw new ApiError(400, 'Text is required for sentiment analysis');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Analyze the sentiment of the following text and return a JSON response with 'sentiment' (positive/negative/neutral) and 'confidence' (0-1)."
          },
          {
            role: "user",
            content: text
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content.trim();
      let sentimentData;

      try {
        sentimentData = JSON.parse(response);
      } catch (parseError) {
        // Fallback sentiment analysis
        sentimentData = this.fallbackSentimentAnalysis(text);
      }

      res.status(200).json({
        success: true,
        data: sentimentData,
        message: 'Sentiment analysis completed successfully'
      });
    } catch (error) {
      console.error('Sentiment Analysis Error:', error);
      // Use fallback analysis
      const sentimentData = this.fallbackSentimentAnalysis(text);

      res.status(200).json({
        success: true,
        data: sentimentData,
        message: 'Sentiment analysis completed using fallback method'
      });
    }
  });

  /**
   * Get product insights and analytics
   */
  getProductInsights = catchAsync(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Get sales data
    const salesData = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': productId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$items.total' },
          quantity: { $sum: '$items.quantity' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get customer segments
    const customerSegments = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.product': productId } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$items.total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          highValue: { $sum: { $cond: [{ $gte: ['$totalSpent', 100] }, 1, 0] } },
          mediumValue: { $sum: { $cond: [{ $and: [{ $gte: ['$totalSpent', 50] }, { $lt: ['$totalSpent', 100] }] }, 1, 0] } },
          lowValue: { $sum: { $cond: [{ $lt: ['$totalSpent', 50] }, 1, 0] } }
        }
      }
    ]);

    // Generate AI insights
    const insights = await this.generateProductInsights(product, salesData, customerSegments);

    res.status(200).json({
      success: true,
      data: {
        product,
        salesData,
        customerSegments: customerSegments[0] || { highValue: 0, mediumValue: 0, lowValue: 0 },
        insights
      },
      message: 'Product insights generated successfully'
    });
  });

  /**
   * Extract user preferences from purchase history
   */
  extractUserPreferences(user, orders) {
    const preferences = {
      categories: {},
      priceRange: { min: 0, max: 0 },
      brands: {},
      avgRating: 0,
      totalSpent: 0
    };

    if (!orders || orders.length === 0) {
      return preferences;
    }

    let totalSpent = 0;
    let totalRating = 0;
    let ratingCount = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        if (!product) return;

        // Category preferences
        if (product.category) {
          preferences.categories[product.category] =
            (preferences.categories[product.category] || 0) + item.quantity;
        }

        // Brand preferences
        if (product.brand) {
          preferences.brands[product.brand] =
            (preferences.brands[product.brand] || 0) + item.quantity;
        }

        // Price range
        totalSpent += item.total;
        if (product.price > preferences.priceRange.max) {
          preferences.priceRange.max = product.price;
        }
        if (preferences.priceRange.min === 0 || product.price < preferences.priceRange.min) {
          preferences.priceRange.min = product.price;
        }

        // Rating preferences
        if (product.rating) {
          totalRating += product.rating;
          ratingCount++;
        }
      });
    });

    preferences.totalSpent = totalSpent;
    preferences.avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return preferences;
  }

  /**
   * Score products based on user preferences
   */
  async scoreProducts(products, userPreferences) {
    const scoredProducts = [];

    for (const product of products) {
      let score = 0;

      // Category preference score
      if (product.category && userPreferences.categories[product.category]) {
        score += userPreferences.categories[product.category] * 0.3;
      }

      // Brand preference score
      if (product.brand && userPreferences.brands[product.brand]) {
        score += userPreferences.brands[product.brand] * 0.2;
      }

      // Price range score
      if (product.price >= userPreferences.priceRange.min &&
          product.price <= userPreferences.priceRange.max) {
        score += 0.2;
      }

      // Rating score
      if (product.rating >= userPreferences.avgRating) {
        score += 0.15;
      }

      // Popularity score
      score += (product.reviews / 1000) * 0.1;

      // Recency score
      const daysSinceCreation = (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24);
      score += Math.max(0, (365 - daysSinceCreation) / 365) * 0.05;

      scoredProducts.push({ product, score });
    }

    return scoredProducts;
  }

  /**
   * Enhance search query using AI
   */
  async enhanceSearchQuery(query) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a search optimization expert. Expand the given search query with relevant synonyms and related terms to improve search results. Return only the enhanced query, no explanations."
          },
          {
            role: "user",
            content: query
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      console.error('Search enhancement error:', error);
      return query; // Return original query if enhancement fails
    }
  }

  /**
   * Build search pipeline for MongoDB aggregation
   */
  buildSearchPipeline(query, filters, limit, page, countOnly = false) {
    const pipeline = [];

    // Text search
    if (query) {
      pipeline.push({
        $search: {
          text: {
            query: query,
            path: ['name', 'description', 'tags', 'brand'],
            fuzzy: { maxEdits: 2 }
          }
        }
      });
    }

    // Filters
    const matchStage = { isActive: true };

    if (filters.category) {
      matchStage.category = filters.category;
    }

    if (filters.brand && filters.brand.length > 0) {
      matchStage.brand = { $in: filters.brand };
    }

    if (filters.priceRange) {
      matchStage.price = {
        $gte: filters.priceRange[0],
        $lte: filters.priceRange[1]
      };
    }

    if (filters.rating) {
      matchStage.rating = { $gte: filters.rating };
    }

    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        matchStage.stock = { $gt: 0 };
      } else {
        matchStage.stock = { $lte: 0 };
      }
    }

    pipeline.push({ $match: matchStage });

    // Add score field for ranking
    pipeline.push({
      $addFields: {
        searchScore: { $meta: "searchScore" }
      }
    });

    if (countOnly) {
      pipeline.push({ $count: "total" });
    } else {
      // Sort by search score and other factors
      pipeline.push({
        $sort: {
          searchScore: -1,
          rating: -1,
          reviews: -1
        }
      });

      // Pagination
      if (page && limit) {
        pipeline.push(
          { $skip: (parseInt(page) - 1) * parseInt(limit) },
          { $limit: parseInt(limit) }
        );
      }
    }

    return pipeline;
  }

  /**
   * Fallback sentiment analysis
   */
  fallbackSentimentAnalysis(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'perfect', 'best', 'awesome'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'worst', 'horrible', 'disappointing', 'poor', 'useless'];

    const tokens = tokenizer.tokenize(text.toLowerCase());
    let positiveCount = 0;
    let negativeCount = 0;

    tokens.forEach(token => {
      if (positiveWords.includes(token)) positiveCount++;
      if (negativeWords.includes(token)) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    if (total === 0) {
      return { sentiment: 'neutral', confidence: 0.5 };
    }

    const positiveRatio = positiveCount / total;
    let sentiment, confidence;

    if (positiveRatio > 0.6) {
      sentiment = 'positive';
      confidence = positiveRatio;
    } else if (positiveRatio < 0.4) {
      sentiment = 'negative';
      confidence = 1 - positiveRatio;
    } else {
      sentiment = 'neutral';
      confidence = 0.5;
    }

    return { sentiment, confidence };
  }

  /**
   * Generate product insights using AI
   */
  async generateProductInsights(product, salesData, customerSegments) {
    try {
      const prompt = `Analyze this product data and provide business insights:

Product: ${product.name}
Category: ${product.category}
Price: $${product.price}
Rating: ${product.rating}/5 (${product.reviews} reviews)
Stock: ${product.stock} units

Sales Data: ${JSON.stringify(salesData)}
Customer Segments: ${JSON.stringify(customerSegments)}

Provide 3-5 actionable business insights in JSON format with 'insight' and 'action' fields.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a business analyst expert. Provide concise, actionable insights based on product data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      });

      const response = completion.choices[0].message.content.trim();

      try {
        return JSON.parse(response);
      } catch (parseError) {
        return {
          insights: [
            {
              insight: "Product performance analysis completed",
              action: "Review sales data and customer segments for optimization opportunities"
            }
          ]
        };
      }
    } catch (error) {
      console.error('AI insights generation error:', error);
      return {
        insights: [
          {
            insight: "Product analysis available",
            action: "Review sales data and customer segments manually"
          }
        ]
      };
    }
  }
}

module.exports = new AIService();
