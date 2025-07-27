const express = require('express');
const { catchAsync } = require('../utils/catchAsync');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');

const router = express.Router();

// ========================================
// PUBLIC ENDPOINTS
// ========================================

// Get platform information
router.get('/info', catchAsync(async (req, res) => {
  const platformInfo = {
    name: 'GoSeller',
    version: '1.0.0',
    description: 'World-class e-commerce platform',
    features: [
      'Multi-vendor marketplace',
      'Payment processing',
      'AI-powered recommendations',
      'Blockchain integration',
      'Real-time analytics',
      'Mobile-first design'
    ],
    status: 'active',
    uptime: '99.9%'
  };

  res.json(new ApiResponse(200, 'Platform information retrieved successfully', {
    platformInfo
  }));
}));

// Get public products
router.get('/products', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category, search } = req.query;

  // Mock products (in real app, fetch from database)
  const products = [
    {
      id: 'product_1',
      name: 'Smartphone',
      price: 599.99,
      category: 'Electronics',
      seller: 'Tech Store',
      rating: 4.5,
      image: 'https://example.com/smartphone.jpg'
    },
    {
      id: 'product_2',
      name: 'T-Shirt',
      price: 29.99,
      category: 'Clothing',
      seller: 'Fashion Boutique',
      rating: 4.2,
      image: 'https://example.com/tshirt.jpg'
    }
  ];

  // Filter products
  let filteredProducts = products;
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }
  if (search) {
    filteredProducts = filteredProducts.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Public products retrieved successfully', {
    products: paginatedProducts,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredProducts.length / limit),
      total: filteredProducts.length
    }
  }));
}));

// Get public categories
router.get('/categories', catchAsync(async (req, res) => {
  // Mock categories (in real app, fetch from database)
  const categories = [
    {
      id: 'cat_1',
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      productCount: 150,
      image: 'https://example.com/electronics.jpg'
    },
    {
      id: 'cat_2',
      name: 'Clothing',
      description: 'Fashion and apparel',
      productCount: 200,
      image: 'https://example.com/clothing.jpg'
    },
    {
      id: 'cat_3',
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      productCount: 100,
      image: 'https://example.com/home.jpg'
    }
  ];

  res.json(new ApiResponse(200, 'Public categories retrieved successfully', {
    categories
  }));
}));

// Get public sellers
router.get('/sellers', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;

  // Mock sellers (in real app, fetch from database)
  const sellers = [
    {
      id: 'seller_1',
      businessName: 'Tech Store',
      category: 'Electronics',
      rating: 4.8,
      productCount: 50,
      verified: true,
      image: 'https://example.com/tech-store.jpg'
    },
    {
      id: 'seller_2',
      businessName: 'Fashion Boutique',
      category: 'Clothing',
      rating: 4.5,
      productCount: 75,
      verified: true,
      image: 'https://example.com/fashion-boutique.jpg'
    }
  ];

  // Filter sellers
  let filteredSellers = sellers;
  if (category) {
    filteredSellers = filteredSellers.filter(s => s.category === category);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedSellers = filteredSellers.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Public sellers retrieved successfully', {
    sellers: paginatedSellers,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredSellers.length / limit),
      total: filteredSellers.length
    }
  }));
}));

// Get public product details
router.get('/products/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock product details (in real app, fetch from database)
  const product = {
    id: id,
    name: 'Smartphone',
    price: 599.99,
    originalPrice: 699.99,
    category: 'Electronics',
    seller: {
      id: 'seller_1',
      businessName: 'Tech Store',
      rating: 4.8,
      verified: true
    },
    description: 'Latest smartphone with advanced features',
    images: [
      'https://example.com/smartphone-1.jpg',
      'https://example.com/smartphone-2.jpg',
      'https://example.com/smartphone-3.jpg'
    ],
    specifications: {
      brand: 'TechBrand',
      model: 'SmartX Pro',
      color: 'Black',
      storage: '128GB',
      ram: '8GB'
    },
    rating: 4.5,
    reviewCount: 125,
    inStock: true,
    stockQuantity: 50
  };

  res.json(new ApiResponse(200, 'Public product details retrieved successfully', {
    product
  }));
}));

// Get public seller details
router.get('/sellers/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock seller details (in real app, fetch from database)
  const seller = {
    id: id,
    businessName: 'Tech Store',
    category: 'Electronics',
    description: 'Leading electronics retailer with quality products',
    rating: 4.8,
    reviewCount: 250,
    verified: true,
    joinedDate: new Date('2023-01-15'),
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA'
    },
    contact: {
      email: 'contact@techstore.com',
      phone: '+1234567890'
    },
    stats: {
      totalProducts: 50,
      totalSales: 1500,
      responseRate: '98%',
      averageResponseTime: '2 hours'
    },
    images: [
      'https://example.com/tech-store-1.jpg',
      'https://example.com/tech-store-2.jpg'
    ]
  };

  res.json(new ApiResponse(200, 'Public seller details retrieved successfully', {
    seller
  }));
}));

// Search public content
router.get('/search', catchAsync(async (req, res) => {
  const { q, type, page = 1, limit = 20 } = req.query;

  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  // Mock search results (in real app, search database)
  let searchResults = {
    products: [
      {
        id: 'product_1',
        name: 'Smartphone',
        price: 599.99,
        category: 'Electronics',
        seller: 'Tech Store',
        rating: 4.5
      }
    ],
    sellers: [
      {
        id: 'seller_1',
        businessName: 'Tech Store',
        category: 'Electronics',
        rating: 4.8
      }
    ],
    categories: [
      {
        id: 'cat_1',
        name: 'Electronics',
        productCount: 150
      }
    ]
  };

  // Filter by type if specified
  if (type) {
    const filteredResults = {};
    if (searchResults[type]) {
      filteredResults[type] = searchResults[type];
    }
    searchResults = filteredResults;
  }

  res.json(new ApiResponse(200, 'Search results retrieved successfully', {
    query: q,
    type: type || 'all',
    results: searchResults,
    pagination: {
      current: parseInt(page),
      limit: parseInt(limit)
    }
  }));
}));

module.exports = router;
