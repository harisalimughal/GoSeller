const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// SERVICE MANAGEMENT
// ========================================

// Get all services
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category, status } = req.query;

  // Mock services (in real app, fetch from database)
  const services = [
    {
      id: 'service_1',
      name: 'Express Delivery',
      category: 'Delivery',
      description: 'Fast delivery within 2-4 hours',
      price: 15.00,
      status: 'active',
      provider: 'GoSeller Logistics'
    },
    {
      id: 'service_2',
      name: 'Product Photography',
      category: 'Marketing',
      description: 'Professional product photography',
      price: 50.00,
      status: 'active',
      provider: 'PhotoPro Studio'
    }
  ];

  // Filter services
  let filteredServices = services;
  if (category) {
    filteredServices = filteredServices.filter(s => s.category === category);
  }
  if (status) {
    filteredServices = filteredServices.filter(s => s.status === status);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Services retrieved successfully', {
    services: paginatedServices,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredServices.length / limit),
      total: filteredServices.length
    }
  }));
}));

// Get service by ID
router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock service (in real app, fetch from database)
  const service = {
    id: id,
    name: 'Express Delivery',
    category: 'Delivery',
    description: 'Fast delivery within 2-4 hours to your doorstep',
    price: 15.00,
    status: 'active',
    provider: 'GoSeller Logistics',
    features: [
      'Same day delivery',
      'Real-time tracking',
      'Insurance included',
      'Customer support'
    ],
    requirements: [
      'Valid address',
      'Contact number',
      'Payment confirmation'
    ],
    coverage: {
      areas: ['New York', 'Los Angeles', 'Chicago'],
      deliveryTime: '2-4 hours',
      maxWeight: '50 kg'
    }
  };

  res.json(new ApiResponse(200, 'Service retrieved successfully', {
    service
  }));
}));

// Book service
router.post('/:id/book', [
  body('userId').isString().withMessage('User ID is required'),
  body('orderId').optional().isString(),
  body('details').isObject().withMessage('Service details are required'),
  body('preferredDate').optional().isISO8601().withMessage('Valid date is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { userId, orderId, details, preferredDate } = req.body;

  // Mock booking (in real app, create in database)
  const booking = {
    id: `booking_${Date.now()}`,
    serviceId: id,
    userId: userId,
    orderId: orderId,
    details: details,
    preferredDate: preferredDate || new Date(),
    status: 'pending',
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Service booked successfully', {
    booking
  }));
}));

// Get service bookings
router.get('/:id/bookings', catchAsync(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20, status } = req.query;

  // Mock bookings (in real app, fetch from database)
  const bookings = [
    {
      id: 'booking_1',
      serviceId: id,
      userId: 'user_123',
      orderId: 'order_456',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'booking_2',
      serviceId: id,
      userId: 'user_789',
      orderId: 'order_101',
      status: 'pending',
      createdAt: new Date()
    }
  ];

  // Filter bookings
  let filteredBookings = bookings;
  if (status) {
    filteredBookings = filteredBookings.filter(b => b.status === status);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Service bookings retrieved successfully', {
    bookings: paginatedBookings,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredBookings.length / limit),
      total: filteredBookings.length
    }
  }));
}));

// ========================================
// SERVICE CATEGORIES
// ========================================

// Get service categories
router.get('/categories', catchAsync(async (req, res) => {
  // Mock categories (in real app, fetch from database)
  const categories = [
    {
      id: 'cat_1',
      name: 'Delivery',
      description: 'Logistics and delivery services',
      serviceCount: 5,
      icon: '🚚'
    },
    {
      id: 'cat_2',
      name: 'Marketing',
      description: 'Marketing and promotion services',
      serviceCount: 8,
      icon: '📢'
    },
    {
      id: 'cat_3',
      name: 'Support',
      description: 'Customer support services',
      serviceCount: 3,
      icon: '🎧'
    }
  ];

  res.json(new ApiResponse(200, 'Service categories retrieved successfully', {
    categories
  }));
}));

// Get services by category
router.get('/categories/:categoryId', catchAsync(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // Mock services by category (in real app, fetch from database)
  const services = [
    {
      id: 'service_1',
      name: 'Express Delivery',
      category: 'Delivery',
      description: 'Fast delivery within 2-4 hours',
      price: 15.00,
      status: 'active'
    },
    {
      id: 'service_2',
      name: 'Standard Delivery',
      category: 'Delivery',
      description: 'Standard delivery within 24-48 hours',
      price: 8.00,
      status: 'active'
    }
  ];

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedServices = services.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Services by category retrieved successfully', {
    categoryId,
    services: paginatedServices,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(services.length / limit),
      total: services.length
    }
  }));
}));

// ========================================
// SERVICE PROVIDERS
// ========================================

// Get service providers
router.get('/providers', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;

  // Mock providers (in real app, fetch from database)
  const providers = [
    {
      id: 'provider_1',
      name: 'GoSeller Logistics',
      category: 'Delivery',
      rating: 4.8,
      serviceCount: 3,
      verified: true
    },
    {
      id: 'provider_2',
      name: 'PhotoPro Studio',
      category: 'Marketing',
      rating: 4.6,
      serviceCount: 2,
      verified: true
    }
  ];

  // Filter providers
  let filteredProviders = providers;
  if (category) {
    filteredProviders = filteredProviders.filter(p => p.category === category);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedProviders = filteredProviders.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Service providers retrieved successfully', {
    providers: paginatedProviders,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredProviders.length / limit),
      total: filteredProviders.length
    }
  }));
}));

// Get provider details
router.get('/providers/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock provider details (in real app, fetch from database)
  const provider = {
    id: id,
    name: 'GoSeller Logistics',
    category: 'Delivery',
    description: 'Professional logistics and delivery services',
    rating: 4.8,
    reviewCount: 150,
    verified: true,
    joinedDate: new Date('2023-01-15'),
    contact: {
      email: 'contact@goseller-logistics.com',
      phone: '+1234567890',
      website: 'https://goseller-logistics.com'
    },
    services: [
      {
        id: 'service_1',
        name: 'Express Delivery',
        price: 15.00,
        status: 'active'
      },
      {
        id: 'service_2',
        name: 'Standard Delivery',
        price: 8.00,
        status: 'active'
      }
    ],
    coverage: {
      areas: ['New York', 'Los Angeles', 'Chicago', 'Houston'],
      deliveryTime: '2-48 hours',
      maxWeight: '100 kg'
    }
  };

  res.json(new ApiResponse(200, 'Provider details retrieved successfully', {
    provider
  }));
}));

// ========================================
// SERVICE ANALYTICS
// ========================================

// Get service analytics
router.get('/analytics', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Mock analytics (in real app, calculate from database)
  const analytics = {
    period,
    overview: {
      totalServices: 15,
      activeServices: 12,
      totalBookings: 250,
      totalRevenue: 5000.00
    },
    topServices: [
      { name: 'Express Delivery', bookings: 100, revenue: 1500.00 },
      { name: 'Product Photography', bookings: 50, revenue: 2500.00 },
      { name: 'Customer Support', bookings: 30, revenue: 1000.00 }
    ],
    bookingsByCategory: [
      { category: 'Delivery', bookings: 120, revenue: 1800.00 },
      { category: 'Marketing', bookings: 80, revenue: 2500.00 },
      { category: 'Support', bookings: 50, revenue: 700.00 }
    ]
  };

  res.json(new ApiResponse(200, 'Service analytics retrieved successfully', {
    analytics
  }));
}));

module.exports = router;
