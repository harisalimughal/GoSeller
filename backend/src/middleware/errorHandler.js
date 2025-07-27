const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `Duplicate field value: ${value}. Please use another value.`;
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token. Please log in again.';
    error = new ApiError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Your token has expired! Please log in again.';
    error = new ApiError(401, message);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Please upload a smaller file.';
    error = new ApiError(400, message);
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files. Please upload fewer files.';
    error = new ApiError(400, message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field.';
    error = new ApiError(400, message);
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests from this IP, please try again later.';
    error = new ApiError(429, message);
  }

  // Network errors
  if (err.code === 'ECONNREFUSED') {
    const message = 'Database connection refused. Please try again later.';
    error = new ApiError(503, message);
  }

  if (err.code === 'ENOTFOUND') {
    const message = 'Service not found. Please try again later.';
    error = new ApiError(503, message);
  }

  // Timeout errors
  if (err.code === 'ETIMEDOUT') {
    const message = 'Request timeout. Please try again.';
    error = new ApiError(408, message);
  }

  // File system errors
  if (err.code === 'ENOENT') {
    const message = 'File not found.';
    error = new ApiError(404, message);
  }

  if (err.code === 'EACCES') {
    const message = 'Permission denied.';
    error = new ApiError(403, message);
  }

  // Memory errors
  if (err.code === 'ENOMEM') {
    const message = 'Server out of memory. Please try again later.';
    error = new ApiError(503, message);
  }

  // Syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'Invalid JSON in request body.';
    error = new ApiError(400, message);
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = 'Internal Server Error';
  }

  // Send error response
  const errorResponse = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      status: error.status || 'error',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  // Add additional error details if available
  if (error.isOperational !== undefined) {
    errorResponse.error.isOperational = error.isOperational;
  }

  // Add validation errors if available
  if (err.errors) {
    errorResponse.error.errors = err.errors;
  }

  // Add field errors if available
  if (err.keyValue) {
    errorResponse.error.duplicateField = Object.keys(err.keyValue)[0];
  }

  // Add retry information for rate limiting
  if (error.statusCode === 429) {
    errorResponse.error.retryAfter = req.headers['retry-after'] || 60;
  }

  // Add correlation ID for tracking
  if (req.headers['x-correlation-id']) {
    errorResponse.error.correlationId = req.headers['x-correlation-id'];
  }

  // Add request ID for tracking
  if (req.id) {
    errorResponse.error.requestId = req.id;
  }

  // Send response
  res.status(error.statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (err) => {
  console.error('Unhandled Promise Rejection:', err);
  console.error('Stack:', err.stack);

  // Close server gracefully
  process.exit(1);
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = (err) => {
  console.error('Uncaught Exception:', err);
  console.error('Stack:', err.stack);

  // Close server gracefully
  process.exit(1);
};

/**
 * Handle SIGTERM signal
 */
const handleSIGTERM = () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
};

/**
 * Handle SIGINT signal
 */
const handleSIGINT = () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
};

/**
 * Setup global error handlers
 */
const setupErrorHandlers = () => {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', handleUnhandledRejection);

  // Handle uncaught exceptions
  process.on('uncaughtException', handleUncaughtException);

  // Handle SIGTERM
  process.on('SIGTERM', handleSIGTERM);

  // Handle SIGINT
  process.on('SIGINT', handleSIGINT);
};

/**
 * Validation error formatter
 */
const formatValidationError = (err) => {
  const errors = {};

  Object.keys(err.errors).forEach(key => {
    errors[key] = err.errors[key].message;
  });

  return {
    message: 'Validation failed',
    errors,
    statusCode: 400,
    status: 'fail'
  };
};

/**
 * Database error formatter
 */
const formatDatabaseError = (err) => {
  return {
    message: 'Database operation failed',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Database error',
    statusCode: 500,
    status: 'error'
  };
};

/**
 * File upload error formatter
 */
const formatFileUploadError = (err) => {
  return {
    message: 'File upload failed',
    error: err.message,
    statusCode: 400,
    status: 'fail'
  };
};

/**
 * Authentication error formatter
 */
const formatAuthError = (err) => {
  return {
    message: 'Authentication failed',
    error: err.message,
    statusCode: 401,
    status: 'fail'
  };
};

/**
 * Authorization error formatter
 */
const formatAuthorizationError = (err) => {
  return {
    message: 'Access denied',
    error: err.message,
    statusCode: 403,
    status: 'fail'
  };
};

/**
 * Rate limit error formatter
 */
const formatRateLimitError = (err) => {
  return {
    message: 'Rate limit exceeded',
    retryAfter: err.retryAfter || 60,
    statusCode: 429,
    status: 'fail'
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  handleSIGTERM,
  handleSIGINT,
  setupErrorHandlers,
  formatValidationError,
  formatDatabaseError,
  formatFileUploadError,
  formatAuthError,
  formatAuthorizationError,
  formatRateLimitError
};
