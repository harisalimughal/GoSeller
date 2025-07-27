const jwt = require('jsonwebtoken');
const Rider = require('../models/Rider');
const { ApiError } = require('../utils/ApiError');

const riderAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access denied. No token provided.');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Find rider
    const rider = await Rider.findById(decoded.id).select('-password');
    if (!rider) {
      throw new ApiError(401, 'The user belonging to this token no longer exists.');
    }

    // Check if rider is active
    if (!rider.isActive) {
      throw new ApiError(401, 'Rider account is deactivated.');
    }

    // Check if rider is locked
    if (rider.isLocked()) {
      throw new ApiError(423, 'Rider account is locked.');
    }

    // Attach rider to request
    req.rider = rider;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired.'));
    } else {
      next(error);
    }
  }
};

const optionalRiderAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const rider = await Rider.findById(decoded.id).select('-password');

    if (rider && rider.isActive && !rider.isLocked()) {
      req.rider = rider;
    }

    next();
  } catch (error) {
    // Don't throw error for optional auth
    next();
  }
};

const requireRiderVerification = async (req, res, next) => {
  if (!req.rider) {
    return next(new ApiError(401, 'Rider authentication required.'));
  }

  if (!req.rider.verified) {
    return next(new ApiError(403, 'Rider account not verified.'));
  }

  next();
};

const requireSQLLevel = (requiredLevel) => {
  return async (req, res, next) => {
    if (!req.rider) {
      return next(new ApiError(401, 'Rider authentication required.'));
    }

    const sqlLevels = ['Free', 'Basic', 'Normal', 'High', 'VIP'];
    const riderLevel = sqlLevels.indexOf(req.rider.SQL_level);
    const requiredLevelIndex = sqlLevels.indexOf(requiredLevel);

    if (riderLevel < requiredLevelIndex) {
      return next(new ApiError(403, `SQL level ${requiredLevel} required. Current level: ${req.rider.SQL_level}`));
    }

    next();
  };
};

const restrictToFranchiseType = (allowedTypes) => {
  return async (req, res, next) => {
    if (!req.rider) {
      return next(new ApiError(401, 'Rider authentication required.'));
    }

    if (!allowedTypes.includes(req.rider.franchiseType)) {
      return next(new ApiError(403, `Access denied. Required franchise type: ${allowedTypes.join(', ')}`));
    }

    next();
  };
};

module.exports = {
  riderAuth,
  optionalRiderAuth,
  requireRiderVerification,
  requireSQLLevel,
  restrictToFranchiseType
};
