const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const CloudinaryService = require('../services/cloudinaryService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

const router = express.Router();

// Configure multer for product image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Maximum 10 images per product
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

// ========================================
// PRODUCT CRUD OPERATIONS
// ========================================

// Create new product with image uploads
router.post('/create', 
  upload.array('images', 10),
  [
    body('title').trim().notEmpty().withMessage('Product title is required'),
    body('description').trim().notEmpty().withMessage('Product description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
    body('category').isIn(['Grocery', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Automotive', 'Health', 'Other']).withMessage('Valid category is required'),
    body('sellerId').isMongoId().withMessage('Valid seller ID is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('sku').trim().notEmpty().withMessage('SKU is required')
  ],
  catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const {
      title,
      description,
      price,
      originalPrice,
      stock,
      category,
      subcategory,
      sellerId,
      brand,
      sku,
      weight,
      dimensions,
      tags,
      specifications,
      variants,
      tieredPricing,
      inventory
    } = req.body;

    // Check if seller exists and get SQL level
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    // Check SQL level product limits
    const sqlLevel = seller.productSQL_level;
    const productLimits = {
      'Free': 3,
      'Basic': 10,
      'Normal': 50,
      'High': 200,
      'VIP': 1000
    };

    const currentProductCount = await Product.countDocuments({ sellerId });
    const limit = productLimits[sqlLevel] || 3;

    if (currentProductCount >= limit) {
      throw new ApiError(403, `You have reached the product limit for ${sqlLevel} level. Upgrade your SQL level to add more products.`);
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      try {
        const imageBuffers = req.files.map(file => file.buffer);
        const uploadResults = await CloudinaryService.uploadMultipleImages(
          imageBuffers,
          `gosellr/products/${sellerId}`
        );
        imageUrls = uploadResults.map(result => result.url);
      } catch (uploadError) {
        throw new ApiError(500, 'Image upload failed', uploadError.message);
      }
    }

    // Create product
    const product = new Product({
      sellerId,
      title,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      stock: parseInt(stock),
      category,
      subcategory,
      brand,
      sku,
      images: imageUrls,
      tags: tags ? JSON.parse(tags) : [],
      specifications: specifications ? JSON.parse(specifications) : [],
      variants: variants ? JSON.parse(variants) : [],
      weight: weight ? parseFloat(weight) : null,
      dimensions: dimensions ? JSON.parse(dimensions) : null,
      // Add tiered pricing if provided (for Company sellers)
      tieredPricing: tieredPricing ? JSON.parse(tieredPricing) : null,
      // Add enhanced inventory management if provided (for Company sellers)
      inventory: inventory ? JSON.parse(inventory) : null,
      SQL_level: sqlLevel,
      status: 'approved',
      isActive: true
    });

    await product.save();

    // Update seller's product count
    await seller.updateProductCount(currentProductCount + 1);

    res.status(201).json(new ApiResponse(201, 'Product created successfully', {
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        images: product.images,
        status: product.status,
        sqlLevel: product.SQL_level
      }
    }));
  })
);

// Get all products with filtering and pagination
router.get('/', catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    minPrice,
    maxPrice,
    sqlLevel,
    sellerId,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {
    isActive: true,
    status: 'approved'
  };

  // Apply filters
  if (category) query.category = category;
  if (sqlLevel) query.SQL_level = sqlLevel;
  if (sellerId) query.sellerId = sellerId;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Search functionality
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const products = await Product.find(query)
    .populate('sellerId', 'name shopName location SQL_level verified')
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  // Transform products to include 'id' field
  const transformedProducts = products.map(product => {
    const productObj = product.toObject();
    return {
      ...productObj,
      id: productObj._id,
      _id: undefined
    };
  });

  res.json(new ApiResponse(200, 'Products retrieved successfully', {
    products: transformedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
}));

// Get products by seller
router.get('/seller/:sellerId', catchAsync(async (req, res) => {
  const { page = 1, limit = 12, status } = req.query;
  
  const query = { sellerId: req.params.sellerId };
  if (status) query.status = status;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  // Transform products to include 'id' field
  const transformedProducts = products.map(product => {
    const productObj = product.toObject();
    return {
      ...productObj,
      id: productObj._id,
      _id: undefined
    };
  });

  res.json(new ApiResponse(200, 'Seller products retrieved successfully', {
    products: transformedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
}));

// Get product categories
router.get('/categories/all', catchAsync(async (req, res) => {
  // Return the specific categories that are validated in the create product endpoint
  const categories = [
    'Grocery',
    'Electronics', 
    'Fashion',
    'Home',
    'Beauty',
    'Sports',
    'Books',
    'Automotive',
    'Health',
    'Other'
  ];
  
  res.json(new ApiResponse(200, 'Categories retrieved successfully', {
    categories
  }));
}));

// Get trending products
router.get('/trending/featured', catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.find({
    isActive: true,
    status: 'approved'
  })
  .populate('sellerId', 'name shopName location SQL_level verified')
  .sort({ views: -1, sales: -1 })
  .limit(parseInt(limit));

  // Transform products to include 'id' field
  const transformedProducts = products.map(product => {
    const productObj = product.toObject();
    return {
      ...productObj,
      id: productObj._id,
      _id: undefined
    };
  });

  res.json(new ApiResponse(200, 'Trending products retrieved successfully', {
    products: transformedProducts
  }));
}));

// Get products by SQL level
router.get('/sql-level/:level', catchAsync(async (req, res) => {
  const { page = 1, limit = 12 } = req.query;
  const { level } = req.params;

  const products = await Product.find({
    SQL_level: level,
    isActive: true,
    status: 'approved'
  })
  .populate('sellerId', 'name shopName location SQL_level verified')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  const total = await Product.countDocuments({
    SQL_level: level,
    isActive: true,
    status: 'approved'
  });

  // Transform products to include 'id' field
  const transformedProducts = products.map(product => {
    const productObj = product.toObject();
    return {
      ...productObj,
      id: productObj._id,
      _id: undefined
    };
  });

  res.json(new ApiResponse(200, 'Products by SQL level retrieved successfully', {
    products: transformedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
}));

// Get single product by ID (must be last to avoid conflicts with other routes)
router.get('/:id', catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('sellerId', 'name shopName location SQL_level verified rating');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Increment view count
  await product.incrementViews();

  // Transform product to include 'id' field
  const productObj = product.toObject();
  const transformedProduct = {
    ...productObj,
    id: productObj._id,
    _id: undefined
  };

  res.json(new ApiResponse(200, 'Product retrieved successfully', {
    product: transformedProduct
  }));
}));

// Update product
router.put('/:id', 
  upload.array('images', 10),
  catchAsync(async (req, res) => {
    console.log('Update product request body:', req.body);
    console.log('Update product files:', req.files);
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      try {
        const imageBuffers = req.files.map(file => file.buffer);
        const uploadResults = await CloudinaryService.uploadMultipleImages(
          imageBuffers,
          `gosellr/products/${product.sellerId}`
        );
        
        // Add new images to existing ones
        const newImageUrls = uploadResults.map(result => result.url);
        product.images = [...product.images, ...newImageUrls];
      } catch (uploadError) {
        throw new ApiError(500, 'Image upload failed', uploadError.message);
      }
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (product[key] !== undefined && key !== 'sellerId') { // Exclude sellerId from updates
        console.log(`Updating field ${key}:`, req.body[key]);
        if (key === 'price' || key === 'originalPrice' || key === 'weight') {
          product[key] = parseFloat(req.body[key]);
        } else if (key === 'stock') {
          product[key] = parseInt(req.body[key]);
        } else if (key === 'tags' || key === 'specifications' || key === 'variants' || key === 'dimensions') {
          product[key] = JSON.parse(req.body[key]);
        } else {
          product[key] = req.body[key];
        }
      }
    });

    await product.save();

    res.json(new ApiResponse(200, 'Product updated successfully', {
      product: {
        id: product._id,
        title: product.title,
        price: product.price,
        images: product.images,
        status: product.status
      }
    }));
  })
);

// Delete product
router.delete('/:id', catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Delete images from Cloudinary
  for (const imageUrl of product.images) {
    try {
      // Extract public_id from URL (you might need to store this separately)
      const publicId = imageUrl.split('/').pop().split('.')[0];
      await CloudinaryService.deleteImage(publicId);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  // Update seller's product count
  const seller = await Seller.findById(product.sellerId);
  if (seller) {
    const currentCount = await Product.countDocuments({ sellerId: product.sellerId });
    await seller.updateProductCount(currentCount - 1);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.json(new ApiResponse(200, 'Product deleted successfully'));
}));

module.exports = router;
