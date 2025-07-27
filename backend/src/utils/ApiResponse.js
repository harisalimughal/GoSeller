class ApiResponse {
  constructor(statusCode, message, data = null, success = true) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = success;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Success', statusCode = 200) {
    return new ApiResponse(statusCode, message, data, true);
  }

  static error(message = 'Error occurred', statusCode = 500, data = null) {
    return new ApiResponse(statusCode, message, data, false);
  }

  static created(data = null, message = 'Resource created successfully') {
    return new ApiResponse(201, message, data, true);
  }

  static noContent(message = 'No content') {
    return new ApiResponse(204, message, null, true);
  }

  static badRequest(message = 'Bad request', data = null) {
    return new ApiResponse(400, message, data, false);
  }

  static unauthorized(message = 'Unauthorized', data = null) {
    return new ApiResponse(401, message, data, false);
  }

  static forbidden(message = 'Forbidden', data = null) {
    return new ApiResponse(403, message, data, false);
  }

  static notFound(message = 'Resource not found', data = null) {
    return new ApiResponse(404, message, data, false);
  }

  static conflict(message = 'Conflict', data = null) {
    return new ApiResponse(409, message, data, false);
  }

  static tooManyRequests(message = 'Too many requests', data = null) {
    return new ApiResponse(429, message, data, false);
  }

  static internalServerError(message = 'Internal server error', data = null) {
    return new ApiResponse(500, message, data, false);
  }

  static serviceUnavailable(message = 'Service unavailable', data = null) {
    return new ApiResponse(503, message, data, false);
  }

  // Pagination response
  static paginated(data, page, limit, total, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return new ApiResponse(200, message, {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }, true);
  }

  // List response with metadata
  static list(data, total, message = 'Data retrieved successfully') {
    return new ApiResponse(200, message, {
      data,
      total,
      count: data.length
    }, true);
  }

  // Single item response
  static item(data, message = 'Data retrieved successfully') {
    return new ApiResponse(200, message, data, true);
  }

  // Validation error response
  static validationError(errors, message = 'Validation failed') {
    return new ApiResponse(400, message, {
      errors,
      type: 'validation'
    }, false);
  }

  // Database error response
  static databaseError(error, message = 'Database operation failed') {
    return new ApiResponse(500, message, {
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database error',
      type: 'database'
    }, false);
  }

  // File upload error response
  static fileUploadError(error, message = 'File upload failed') {
    return new ApiResponse(400, message, {
      error: error.message,
      type: 'file_upload'
    }, false);
  }

  // Authentication error response
  static authError(message = 'Authentication failed', data = null) {
    return new ApiResponse(401, message, {
      ...data,
      type: 'authentication'
    }, false);
  }

  // Authorization error response
  static authorizationError(message = 'Access denied', data = null) {
    return new ApiResponse(403, message, {
      ...data,
      type: 'authorization'
    }, false);
  }

  // Rate limit error response
  static rateLimitError(message = 'Rate limit exceeded', retryAfter = null) {
    const data = retryAfter ? { retryAfter } : null;
    return new ApiResponse(429, message, {
      ...data,
      type: 'rate_limit'
    }, false);
  }

  // Maintenance mode response
  static maintenanceMode(message = 'Service under maintenance', estimatedTime = null) {
    const data = estimatedTime ? { estimatedTime } : null;
    return new ApiResponse(503, message, {
      ...data,
      type: 'maintenance'
    }, false);
  }

  // API version response
  static apiInfo(version, endpoints, message = 'API Information') {
    return new ApiResponse(200, message, {
      version,
      endpoints,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Health check response
  static healthCheck(status, services = {}, message = 'Health check completed') {
    return new ApiResponse(200, message, {
      status,
      services,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }, true);
  }

  // Search response
  static search(data, query, total, message = 'Search completed') {
    return new ApiResponse(200, message, {
      data,
      query,
      total,
      count: data.length
    }, true);
  }

  // Export response
  static export(data, format, filename, message = 'Export completed') {
    return new ApiResponse(200, message, {
      data,
      format,
      filename,
      downloadUrl: `/downloads/${filename}`
    }, true);
  }

  // Notification response
  static notification(type, message, data = null) {
    return new ApiResponse(200, message, {
      type,
      data,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Webhook response
  static webhook(event, data, message = 'Webhook processed') {
    return new ApiResponse(200, message, {
      event,
      data,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Cache response
  static cached(data, cacheKey, ttl, message = 'Data retrieved from cache') {
    return new ApiResponse(200, message, {
      data,
      cacheKey,
      ttl,
      cached: true,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Analytics response
  static analytics(data, period, metrics, message = 'Analytics data retrieved') {
    return new ApiResponse(200, message, {
      data,
      period,
      metrics,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Blockchain response
  static blockchain(txHash, status, data = null, message = 'Blockchain operation completed') {
    return new ApiResponse(200, message, {
      txHash,
      status,
      data,
      timestamp: new Date().toISOString()
    }, true);
  }

  // AI response
  static aiResponse(data, model, confidence, message = 'AI processing completed') {
    return new ApiResponse(200, message, {
      data,
      model,
      confidence,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Payment response
  static payment(status, transactionId, amount, currency, message = 'Payment processed') {
    return new ApiResponse(200, message, {
      status,
      transactionId,
      amount,
      currency,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Email response
  static emailSent(messageId, recipient, subject, message = 'Email sent successfully') {
    return new ApiResponse(200, message, {
      messageId,
      recipient,
      subject,
      timestamp: new Date().toISOString()
    }, true);
  }

  // SMS response
  static smsSent(messageId, recipient, message = 'SMS sent successfully') {
    return new ApiResponse(200, message, {
      messageId,
      recipient,
      timestamp: new Date().toISOString()
    }, true);
  }

  // File response
  static fileUploaded(filename, url, size, type, message = 'File uploaded successfully') {
    return new ApiResponse(200, message, {
      filename,
      url,
      size,
      type,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Log response
  static logEntry(level, message, data = null) {
    return new ApiResponse(200, message, {
      level,
      data,
      timestamp: new Date().toISOString()
    }, true);
  }

  // Debug response (development only)
  static debug(data, message = 'Debug information') {
    if (process.env.NODE_ENV === 'development') {
      return new ApiResponse(200, message, {
        data,
        debug: true,
        timestamp: new Date().toISOString()
      }, true);
    }
    return new ApiResponse(404, 'Debug endpoint not available in production');
  }
}

module.exports = ApiResponse;
