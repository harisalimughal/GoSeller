const jwt = require('jsonwebtoken');
const Seller = require('../models/Seller');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

/**
 * Protect seller routes - Verify JWT token and attach seller to request
 */
exports.sellerAuth = catchAsync(async (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if seller still exists
    const currentSeller = await Seller.findById(decoded.sellerId).select('+password');
    if (!currentSeller) {
      return next(new ApiError(401, 'The seller belonging to this token no longer exists.'));
    }

    // Check if seller is active
    if (!currentSeller.isActive) {
      return next(new ApiError(401, 'Your account has been deactivated. Please contact support.'));
    }

    // Check if seller is locked
    if (currentSeller.isLocked()) {
      return next(new ApiError(423, 'Your account has been temporarily locked due to multiple failed login attempts.'));
    }

    // Grant access to protected route
    req.seller = currentSeller;
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
 * Optional seller authentication - Attach seller if token exists, but don't require it
 */
exports.optionalSellerAuth = catchAsync(async (req, res, next) => {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Check if seller still exists
      const currentSeller = await Seller.findById(decoded.sellerId);
      if (currentSeller && currentSeller.isActive && !currentSeller.isLocked()) {
        req.seller = currentSeller;
      }
    } catch (error) {
      // Token is invalid, but we don't throw an error for optional auth
      console.log('Optional seller auth failed:', error.message);
    }
  }

  next();
});

/**
 * Restrict to certain seller types
 */
exports.restrictToSellerType = (...sellerTypes) => {
  return (req, res, next) => {
    if (!sellerTypes.includes(req.seller.sellerType)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
};

/**
 * Check if seller is verified
 */
exports.requireSellerVerification = catchAsync(async (req, res, next) => {
  if (!req.seller.verified) {
    return next(new ApiError(403, 'Your seller account needs to be verified to access this resource.'));
  }

  next();
});

/**
 * Check if seller has required SQL level
 */
exports.requireSQLLevel = (...levels) => {
  return (req, res, next) => {
    if (!levels.includes(req.seller.SQL_level)) {
      return next(new ApiError(403, `This feature requires SQL level: ${levels.join(' or ')}`));
    }
    next();
  };
};

module.exports = {
  sellerAuth: exports.sellerAuth,
  optionalSellerAuth: exports.optionalSellerAuth,
  restrictToSellerType: exports.restrictToSellerType,
  requireSellerVerification: exports.requireSellerVerification,
  requireSQLLevel: exports.requireSQLLevel
};
