const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Protect routes - Verify JWT token and attach user to request
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return next(new ApiError(401, 'You are not logged in. Please log in to get access.'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+password');
    if (!currentUser) {
      return next(new ApiError(401, 'The user belonging to this token no longer exists.'));
    }

    // Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(401, 'User recently changed password! Please log in again.'));
    }

    // Check if user is active
    if (currentUser.status !== 'active') {
      return next(new ApiError(401, 'Your account has been deactivated. Please contact support.'));
    }

    // Check if user is locked
    if (currentUser.isLocked) {
      return next(new ApiError(423, 'Your account has been temporarily locked due to multiple failed login attempts.'));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your token has expired! Please log in again.'));
    }
    return next(new ApiError(401, 'Authentication failed. Please log in again.'));
  }
});

/**
 * Restrict to certain roles
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
};

/**
 * Admin middleware - Only allow admins and super-admins
 */
exports.adminMiddleware = (req, res, next) => {
  if (!['admin', 'super-admin'].includes(req.user.role)) {
    return next(new ApiError(403, 'Access denied. Admin privileges required.'));
  }
  next();
};

/**
 * Super admin middleware - Only allow super-admins
 */
exports.superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'super-admin') {
    return next(new ApiError(403, 'Access denied. Super admin privileges required.'));
  }
  next();
};

/**
 * Seller middleware - Only allow sellers, admins, and super-admins
 */
exports.sellerMiddleware = (req, res, next) => {
  if (!['seller', 'admin', 'super-admin'].includes(req.user.role)) {
    return next(new ApiError(403, 'Access denied. Seller privileges required.'));
  }
  next();
};

/**
 * Optional authentication - Attach user if token exists, but don't require it
 */
exports.optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (currentUser && currentUser.status === 'active' && !currentUser.isLocked) {
        req.user = currentUser;
      }
    } catch (error) {
      // Token is invalid, but we don't throw an error for optional auth
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
});

/**
 * Rate limiting middleware for authentication attempts
 */
exports.authRateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const key = `auth_attempts:${ip}`;

  // This would typically use Redis for rate limiting
  // For now, we'll implement a basic version
  const attempts = req.session?.authAttempts?.[ip] || 0;

  if (attempts >= 5) {
    const lockTime = req.session?.authLockTime?.[ip] || 0;
    if (Date.now() < lockTime) {
      return next(new ApiError(429, 'Too many authentication attempts. Please try again later.'));
    } else {
      // Reset attempts after lock period
      if (req.session?.authAttempts) {
        delete req.session.authAttempts[ip];
      }
      if (req.session?.authLockTime) {
        delete req.session.authLockTime[ip];
      }
    }
  }

  // Store attempt count
  if (!req.session.authAttempts) req.session.authAttempts = {};
  if (!req.session.authLockTime) req.session.authLockTime = {};

  req.session.authAttempts[ip] = attempts + 1;

  // Lock for 15 minutes after 5 failed attempts
  if (attempts + 1 >= 5) {
    req.session.authLockTime[ip] = Date.now() + 15 * 60 * 1000;
  }

  next();
};

/**
 * Session management middleware
 */
exports.manageSession = catchAsync(async (req, res, next) => {
  if (req.user) {
    // Update last activity
    await User.findByIdAndUpdate(req.user._id, {
      lastActivityAt: new Date()
    });

    // Add session to user's sessions array
    const sessionData = {
      token: req.headers.authorization?.split(' ')[1] || req.cookies?.token,
      device: req.headers['user-agent'] || 'Unknown',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown',
      lastActivity: new Date(),
      isActive: true
    };

    // Remove old sessions (keep only last 5)
    const user = await User.findById(req.user._id);
    if (user.sessions.length >= 5) {
      user.sessions = user.sessions.slice(-4); // Keep last 4
    }

    // Add new session
    user.sessions.push(sessionData);
    await user.save();
  }

  next();
});

/**
 * Check if user owns the resource
 */
exports.checkOwnership = (resourceModel, resourceIdField = 'id') => {
  return catchAsync(async (req, res, next) => {
    const resourceId = req.params[resourceIdField];
    const resource = await resourceModel.findById(resourceId);

    if (!resource) {
      return next(new ApiError(404, 'Resource not found.'));
    }

    // Allow if user is admin or super-admin
    if (['admin', 'super-admin'].includes(req.user.role)) {
      return next();
    }

    // Check if user owns the resource
    const ownerField = resource.seller ? 'seller' : 'user';
    if (resource[ownerField].toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'You do not have permission to access this resource.'));
    }

    next();
  });
};

/**
 * Check if user can access seller resources
 */
exports.checkSellerAccess = catchAsync(async (req, res, next) => {
  if (!['seller', 'admin', 'super-admin'].includes(req.user.role)) {
    return next(new ApiError(403, 'Seller account required to access this resource.'));
  }

  // If user is a seller, check if their business is verified
  if (req.user.role === 'seller' && !req.user.business?.verified) {
    return next(new ApiError(403, 'Your seller account needs to be verified to access this resource.'));
  }

  next();
});

/**
 * Check if user can access admin resources
 */
exports.checkAdminAccess = catchAsync(async (req, res, next) => {
  if (!['admin', 'super-admin'].includes(req.user.role)) {
    return next(new ApiError(403, 'Admin privileges required to access this resource.'));
  }

  next();
});

/**
 * Validate API key middleware
 */
exports.validateApiKey = catchAsync(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return next(new ApiError(401, 'API key is required.'));
  }

  // In a real application, you would validate against stored API keys
  // For now, we'll use a simple check
  if (apiKey !== process.env.API_KEY) {
    return next(new ApiError(401, 'Invalid API key.'));
  }

  next();
});

/**
 * Log authentication attempts
 */
exports.logAuthAttempt = (success = false) => {
  return (req, res, next) => {
    const logData = {
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      email: req.body.email || req.body.username,
      success,
      method: req.method,
      path: req.path
    };

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth Attempt:', logData);
    }

    // In production, you would log to a file or external service
    // logger.info('Authentication attempt', logData);

    next();
  };
};

/**
 * Check if user is verified
 */
exports.requireVerification = catchAsync(async (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(new ApiError(403, 'Please verify your email address before accessing this resource.'));
  }

  next();
});

/**
 * Check if user has completed profile
 */
exports.requireCompleteProfile = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (!user.firstName || !user.lastName || !user.email) {
    return next(new ApiError(403, 'Please complete your profile before accessing this resource.'));
  }

  next();
});

/**
 * Check if user has sufficient balance (for wallet operations)
 */
exports.checkBalance = (requiredAmount = 0) => {
  return catchAsync(async (req, res, next) => {
    if (req.user.wallet.balance < requiredAmount) {
      return next(new ApiError(400, `Insufficient balance. Required: ${requiredAmount}, Available: ${req.user.wallet.balance}`));
    }

    next();
  });
};

/**
 * Validate session token
 */
exports.validateSession = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  const session = req.user.sessions.find(s => s.token === token && s.isActive);

  if (!session) {
    return next(new ApiError(401, 'Invalid session. Please log in again.'));
  }

  // Check if session is expired (30 days)
  const sessionAge = Date.now() - new Date(session.lastActivity).getTime();
  const maxSessionAge = 30 * 24 * 60 * 60 * 1000; // 30 days

  if (sessionAge > maxSessionAge) {
    // Deactivate expired session
    await User.updateOne(
      { _id: req.user._id, 'sessions.token': token },
      { 'sessions.$.isActive': false }
    );
    return next(new ApiError(401, 'Session expired. Please log in again.'));
  }

  next();
});

module.exports = {
  protect: exports.protect,
  restrictTo: exports.restrictTo,
  adminMiddleware: exports.adminMiddleware,
  superAdminMiddleware: exports.superAdminMiddleware,
  sellerMiddleware: exports.sellerMiddleware,
  optionalAuth: exports.optionalAuth,
  authRateLimit: exports.authRateLimit,
  manageSession: exports.manageSession,
  checkOwnership: exports.checkOwnership,
  checkSellerAccess: exports.checkSellerAccess,
  checkAdminAccess: exports.checkAdminAccess,
  validateApiKey: exports.validateApiKey,
  logAuthAttempt: exports.logAuthAttempt,
  requireVerification: exports.requireVerification,
  requireCompleteProfile: exports.requireCompleteProfile,
  checkBalance: exports.checkBalance,
  validateSession: exports.validateSession
};
