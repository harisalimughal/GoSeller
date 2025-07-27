const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Seller = require('../models/Seller');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// Get platform overview analytics
router.get('/overview', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get basic counts
  const totalUsers = await User.countDocuments();
  const totalSellers = await Seller.countDocuments({ status: 'approved' });
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalOrders = await Order.countDocuments();

  // Get period-specific data
  const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
  const newSellers = await Seller.countDocuments({
    status: 'approved',
    createdAt: { $gte: startDate }
  });
  const newProducts = await Product.countDocuments({
    isActive: true,
    createdAt: { $gte: startDate }
  });
  const newOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });

  // Get revenue data
  const revenueData = await Order.aggregate([
    {
      $match: {
        status: { $in: ['delivered', 'completed'] },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    }
  ]);

  const revenue = revenueData[0] || {
    totalRevenue: 0,
    averageOrderValue: 0,
    orderCount: 0
  };

  // Get top performing categories
  const topCategories = await Product.aggregate([
    {
      $match: {
        isActive: true,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$categoryId',
        productCount: { $sum: 1 },
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
        productCount: 1,
        totalViews: 1
      }
    },
    {
      $sort: { productCount: -1 }
    },
    {
      $limit: 5
    }
  ]);

  // Get top sellers
  const topSellers = await Seller.aggregate([
    {
      $match: {
        status: 'approved',
        createdAt: { $gte: startDate }
      }
    },
    {
      $sort: { totalSales: -1 }
    },
    {
      $limit: 5
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        businessName: 1,
        businessType: 1,
        totalSales: 1,
        rating: 1,
        totalOrders: 1,
        user: {
          firstName: '$user.firstName',
          lastName: '$user.lastName'
        }
      }
    }
  ]);

  res.json(new ApiResponse(200, 'Analytics overview retrieved successfully', {
    period,
    overview: {
      total: {
        users: totalUsers,
        sellers: totalSellers,
        products: totalProducts,
        orders: totalOrders
      },
      new: {
        users: newUsers,
        sellers: newSellers,
        products: newProducts,
        orders: newOrders
      },
      revenue: {
        total: revenue.totalRevenue,
        average: revenue.averageOrderValue,
        orders: revenue.orderCount
      }
    },
    topCategories,
    topSellers
  }));
}));

// Get sales analytics
router.get('/sales', catchAsync(async (req, res) => {
  const { period = '30d', groupBy = 'day' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get sales data grouped by time
  const salesData = await Order.aggregate([
    {
      $match: {
        status: { $in: ['delivered', 'completed'] },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m',
            date: '$createdAt'
          }
        },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get sales by category
  const salesByCategory = await Order.aggregate([
    {
      $match: {
        status: { $in: ['delivered', 'completed'] },
        createdAt: { $gte: startDate }
      }
    },
    {
      $unwind: '$items'
    },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product'
      }
    },
    {
      $unwind: '$product'
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    {
      $unwind: '$category'
    },
    {
      $group: {
        _id: '$category.name',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $sum: 1 },
        units: { $sum: '$items.quantity' }
      }
    },
    {
      $sort: { revenue: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.json(new ApiResponse(200, 'Sales analytics retrieved successfully', {
    period,
    groupBy,
    salesData,
    salesByCategory
  }));
}));

// Get user analytics
router.get('/users', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get user registration data
  const userRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get user types distribution
  const userTypes = await User.aggregate([
    {
      $group: {
        _id: '$userType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get active users (users with orders)
  const activeUsers = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' }
      }
    },
    {
      $count: 'activeUsers'
    }
  ]);

  // Get top customers
  const topCustomers = await Order.aggregate([
    {
      $match: {
        status: { $in: ['delivered', 'completed'] },
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    {
      $sort: { totalSpent: -1 }
    },
    {
      $limit: 10
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $project: {
        firstName: '$user.firstName',
        lastName: '$user.lastName',
        email: '$user.email',
        totalSpent: 1,
        orderCount: 1
      }
    }
  ]);

  res.json(new ApiResponse(200, 'User analytics retrieved successfully', {
    period,
    userRegistrations,
    userTypes,
    activeUsers: activeUsers[0]?.activeUsers || 0,
    topCustomers
  }));
}));

// Get product analytics
router.get('/products', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get product creation data
  const productCreations = await Product.aggregate([
    {
      $match: {
        isActive: true,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get top viewed products
  const topViewedProducts = await Product.find({
    isActive: true
  })
  .select('name price viewCount rating images categoryId')
  .populate('categoryId', 'name')
  .sort({ viewCount: -1 })
  .limit(10);

  // Get top rated products
  const topRatedProducts = await Product.find({
    isActive: true,
    rating: { $gt: 0 }
  })
  .select('name price rating reviewCount images categoryId')
  .populate('categoryId', 'name')
  .sort({ rating: -1 })
  .limit(10);

  // Get category performance
  const categoryPerformance = await Product.aggregate([
    {
      $match: {
        isActive: true
      }
    },
    {
      $group: {
        _id: '$categoryId',
        productCount: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        averageRating: { $avg: '$rating' },
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
        productCount: 1,
        averagePrice: 1,
        averageRating: 1,
        totalViews: 1
      }
    },
    {
      $sort: { productCount: -1 }
    }
  ]);

  res.json(new ApiResponse(200, 'Product analytics retrieved successfully', {
    period,
    productCreations,
    topViewedProducts,
    topRatedProducts,
    categoryPerformance
  }));
}));

// Get seller analytics
router.get('/sellers', catchAsync(async (req, res) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Get seller registration data
  const sellerRegistrations = await Seller.aggregate([
    {
      $match: {
        status: 'approved',
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Get business type distribution
  const businessTypes = await Seller.aggregate([
    {
      $match: {
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$businessType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get top performing sellers
  const topSellers = await Seller.find({
    status: 'approved'
  })
  .populate('userId', 'firstName lastName')
  .sort({ totalSales: -1 })
  .limit(10)
  .select('businessName businessType totalSales totalOrders rating');

  // Get seller status distribution
  const sellerStatus = await Seller.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json(new ApiResponse(200, 'Seller analytics retrieved successfully', {
    period,
    sellerRegistrations,
    businessTypes,
    topSellers,
    sellerStatus
  }));
}));

// Get real-time analytics
router.get('/realtime', catchAsync(async (req, res) => {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

  // Get real-time data
  const realtimeData = {
    last24Hours: {
      newUsers: await User.countDocuments({ createdAt: { $gte: last24Hours } }),
      newOrders: await Order.countDocuments({ createdAt: { $gte: last24Hours } }),
      newProducts: await Product.countDocuments({
        isActive: true,
        createdAt: { $gte: last24Hours }
      }),
      revenue: await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'completed'] },
            createdAt: { $gte: last24Hours }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).then(result => result[0]?.total || 0)
    },
    lastHour: {
      newUsers: await User.countDocuments({ createdAt: { $gte: lastHour } }),
      newOrders: await Order.countDocuments({ createdAt: { $gte: lastHour } }),
      newProducts: await Product.countDocuments({
        isActive: true,
        createdAt: { $gte: lastHour }
      }),
      revenue: await Order.aggregate([
        {
          $match: {
            status: { $in: ['delivered', 'completed'] },
            createdAt: { $gte: lastHour }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]).then(result => result[0]?.total || 0)
    }
  };

  res.json(new ApiResponse(200, 'Real-time analytics retrieved successfully', {
    realtimeData
  }));
}));

module.exports = router;
