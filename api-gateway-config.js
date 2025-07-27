// API Gateway Configuration for EHB Platform
// This handles routing and load balancing for all backend services

const API_GATEWAY_CONFIG = {
  // Gateway Settings
  gateway: {
    port: 8000,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000', 'https://ehb-platform.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP'
    }
  },

  // Service Routes Configuration
  services: {
    // EHB Core Service
    ehbCore: {
      name: 'EHB Core',
      port: 5000,
      baseUrl: process.env.EHB_CORE_URL || 'http://localhost:5000',
      healthCheck: '/health',
      routes: {
        auth: '/api/auth',
        users: '/api/users',
        dashboard: '/api/dashboard',
        admin: '/api/admin'
      },
      timeout: 10000,
      retries: 3
    },

    // EHB-GOSELLER Service
    gosellr: {
      name: 'GoSellr E-commerce',
      port: 5001,
      baseUrl: process.env.GOSELLER_URL || 'http://localhost:5001',
      healthCheck: '/health',
      routes: {
        products: '/api/products',
        categories: '/api/categories',
        orders: '/api/orders',
        cart: '/api/cart',
        reviews: '/api/reviews',
        search: '/api/search',
        ai: '/api/ai',
        blockchain: '/api/blockchain'
      },
      timeout: 15000,
      retries: 3
    },

    // EHB-JPS Service
    jps: {
      name: 'Job Portal System',
      port: 5002,
      baseUrl: process.env.JPS_URL || 'http://localhost:5002',
      healthCheck: '/health',
      routes: {
        jobs: '/api/jobs',
        applications: '/api/applications',
        companies: '/api/companies',
        candidates: '/api/candidates',
        recruiters: '/api/recruiters'
      },
      timeout: 10000,
      retries: 3
    },

    // EHB-BLOCKCHAIN Service
    blockchain: {
      name: 'Blockchain Services',
      port: 5003,
      baseUrl: process.env.BLOCKCHAIN_URL || 'http://localhost:5003',
      healthCheck: '/health',
      routes: {
        crypto: '/api/crypto',
        wallet: '/api/wallet',
        nft: '/api/nft',
        transactions: '/api/transactions',
        smartContracts: '/api/smart-contracts'
      },
      timeout: 20000,
      retries: 3
    },

    // EHB-AFFILIATE Service
    affiliate: {
      name: 'Affiliate System',
      port: 5004,
      baseUrl: process.env.AFFILIATE_URL || 'http://localhost:5004',
      healthCheck: '/health',
      routes: {
        affiliates: '/api/affiliates',
        referrals: '/api/referrals',
        commissions: '/api/commissions',
        campaigns: '/api/campaigns'
      },
      timeout: 10000,
      retries: 3
    },

    // EHB-ANALYTICS Service
    analytics: {
      name: 'Analytics Platform',
      port: 5005,
      baseUrl: process.env.ANALYTICS_URL || 'http://localhost:5005',
      healthCheck: '/health',
      routes: {
        metrics: '/api/metrics',
        reports: '/api/reports',
        insights: '/api/insights',
        dashboards: '/api/dashboards',
        bi: '/api/bi'
      },
      timeout: 15000,
      retries: 3
    },

    // EHB-PAYMENT Service
    payment: {
      name: 'Payment Gateway',
      port: 5006,
      baseUrl: process.env.PAYMENT_URL || 'http://localhost:5006',
      healthCheck: '/health',
      routes: {
        payments: '/api/payments',
        transactions: '/api/transactions',
        billing: '/api/billing',
        invoices: '/api/invoices',
        subscriptions: '/api/subscriptions'
      },
      timeout: 15000,
      retries: 3
    },

    // EHB-NOTIFICATION Service
    notification: {
      name: 'Notification System',
      port: 5007,
      baseUrl: process.env.NOTIFICATION_URL || 'http://localhost:5007',
      healthCheck: '/health',
      routes: {
        notifications: '/api/notifications',
        messages: '/api/messages',
        alerts: '/api/alerts',
        email: '/api/email',
        sms: '/api/sms',
        push: '/api/push'
      },
      timeout: 10000,
      retries: 3
    },

    // EHB-REPORTING Service
    reporting: {
      name: 'Reporting System',
      port: 5008,
      baseUrl: process.env.REPORTING_URL || 'http://localhost:5008',
      healthCheck: '/health',
      routes: {
        reports: '/api/reports',
        exports: '/api/exports',
        templates: '/api/templates',
        schedules: '/api/schedules'
      },
      timeout: 20000,
      retries: 3
    },

    // EHB-WALLET Service
    wallet: {
      name: 'Digital Wallet',
      port: 5009,
      baseUrl: process.env.WALLET_URL || 'http://localhost:5009',
      healthCheck: '/health',
      routes: {
        wallet: '/api/wallet',
        balance: '/api/balance',
        transfers: '/api/transfers',
        history: '/api/history'
      },
      timeout: 15000,
      retries: 3
    }
  },

  // Route Mapping
  routes: {
    // Authentication Routes
    '/api/auth': 'ehbCore',
    '/api/users': 'ehbCore',
    '/api/dashboard': 'ehbCore',
    '/api/admin': 'ehbCore',

    // E-commerce Routes
    '/api/products': 'gosellr',
    '/api/categories': 'gosellr',
    '/api/orders': 'gosellr',
    '/api/cart': 'gosellr',
    '/api/reviews': 'gosellr',
    '/api/search': 'gosellr',
    '/api/ai': 'gosellr',
    '/api/blockchain': 'gosellr',

    // Job Portal Routes
    '/api/jobs': 'jps',
    '/api/applications': 'jps',
    '/api/companies': 'jps',
    '/api/candidates': 'jps',
    '/api/recruiters': 'jps',

    // Blockchain Routes
    '/api/crypto': 'blockchain',
    '/api/wallet': 'blockchain',
    '/api/nft': 'blockchain',
    '/api/transactions': 'blockchain',
    '/api/smart-contracts': 'blockchain',

    // Affiliate Routes
    '/api/affiliates': 'affiliate',
    '/api/referrals': 'affiliate',
    '/api/commissions': 'affiliate',
    '/api/campaigns': 'affiliate',

    // Analytics Routes
    '/api/metrics': 'analytics',
    '/api/reports': 'analytics',
    '/api/insights': 'analytics',
    '/api/dashboards': 'analytics',
    '/api/bi': 'analytics',

    // Payment Routes
    '/api/payments': 'payment',
    '/api/transactions': 'payment',
    '/api/billing': 'payment',
    '/api/invoices': 'payment',
    '/api/subscriptions': 'payment',

    // Notification Routes
    '/api/notifications': 'notification',
    '/api/messages': 'notification',
    '/api/alerts': 'notification',
    '/api/email': 'notification',
    '/api/sms': 'notification',
    '/api/push': 'notification',

    // Reporting Routes
    '/api/reports': 'reporting',
    '/api/exports': 'reporting',
    '/api/templates': 'reporting',
    '/api/schedules': 'reporting',

    // Wallet Routes
    '/api/wallet': 'wallet',
    '/api/balance': 'wallet',
    '/api/transfers': 'wallet',
    '/api/history': 'wallet'
  },

  // Middleware Configuration
  middleware: {
    // Authentication
    auth: {
      enabled: true,
      exclude: ['/api/auth/login', '/api/auth/register', '/health'],
      tokenHeader: 'Authorization',
      tokenPrefix: 'Bearer'
    },

    // Logging
    logging: {
      enabled: true,
      level: 'info',
      format: 'combined',
      exclude: ['/health', '/metrics']
    },

    // Caching
    caching: {
      enabled: true,
      ttl: 300, // 5 minutes
      exclude: ['/api/auth', '/api/orders', '/api/payments']
    },

    // Rate Limiting
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    }
  },

  // Load Balancing Configuration
  loadBalancing: {
    strategy: 'round-robin', // round-robin, least-connections, ip-hash
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000,
      retries: 3
    },
    circuitBreaker: {
      enabled: true,
      threshold: 5,
      timeout: 60000, // 1 minute
      resetTimeout: 300000 // 5 minutes
    }
  },

  // Security Configuration
  security: {
    // CORS
    cors: {
      enabled: true,
      origin: ['http://localhost:3000', 'https://ehb-platform.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    },

    // Rate Limiting
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP'
    },

    // Request Validation
    validation: {
      enabled: true,
      strict: false,
      allowUnknown: true
    },

    // API Key Authentication
    apiKey: {
      enabled: false,
      header: 'X-API-Key',
      exclude: ['/health', '/metrics']
    }
  },

  // Monitoring Configuration
  monitoring: {
    // Metrics
    metrics: {
      enabled: true,
      endpoint: '/metrics',
      collectDefault: true
    },

    // Health Checks
    health: {
      enabled: true,
      endpoint: '/health',
      services: true
    },

    // Logging
    logging: {
      enabled: true,
      level: 'info',
      format: 'combined',
      file: './logs/api-gateway.log'
    },

    // Tracing
    tracing: {
      enabled: true,
      service: 'api-gateway',
      sampler: {
        type: 'probabilistic',
        param: 0.1
      }
    }
  }
};

// Development Configuration
const DEV_CONFIG = {
  // Local Development Settings
  services: {
    ehbCore: { port: 5000, url: 'http://localhost:5000' },
    gosellr: { port: 5001, url: 'http://localhost:5001' },
    jps: { port: 5002, url: 'http://localhost:5002' },
    blockchain: { port: 5003, url: 'http://localhost:5003' },
    affiliate: { port: 5004, url: 'http://localhost:5004' },
    analytics: { port: 5005, url: 'http://localhost:5005' },
    payment: { port: 5006, url: 'http://localhost:5006' },
    notification: { port: 5007, url: 'http://localhost:5007' },
    reporting: { port: 5008, url: 'http://localhost:5008' },
    wallet: { port: 5009, url: 'http://localhost:5009' }
  },
  gateway: {
    port: 8000,
    url: 'http://localhost:8000'
  }
};

// Production Configuration
const PROD_CONFIG = {
  // Production Settings
  services: {
    ehbCore: { url: process.env.EHB_CORE_URL || 'https://core.ehb-platform.com' },
    gosellr: { url: process.env.GOSELLER_URL || 'https://gosellr.ehb-platform.com' },
    jps: { url: process.env.JPS_URL || 'https://jobs.ehb-platform.com' },
    blockchain: { url: process.env.BLOCKCHAIN_URL || 'https://blockchain.ehb-platform.com' },
    affiliate: { url: process.env.AFFILIATE_URL || 'https://affiliate.ehb-platform.com' },
    analytics: { url: process.env.ANALYTICS_URL || 'https://analytics.ehb-platform.com' },
    payment: { url: process.env.PAYMENT_URL || 'https://payment.ehb-platform.com' },
    notification: { url: process.env.NOTIFICATION_URL || 'https://notifications.ehb-platform.com' },
    reporting: { url: process.env.REPORTING_URL || 'https://reports.ehb-platform.com' },
    wallet: { url: process.env.WALLET_URL || 'https://wallet.ehb-platform.com' }
  },
  gateway: {
    port: 8000,
    url: process.env.API_GATEWAY_URL || 'https://api.ehb-platform.com'
  }
};

// Export configurations
export {
  API_GATEWAY_CONFIG,
  DEV_CONFIG,
  PROD_CONFIG
};

// Helper functions
export const getServiceConfig = (serviceName) => {
  return API_GATEWAY_CONFIG.services[serviceName] || null;
};

export const getRouteService = (route) => {
  return API_GATEWAY_CONFIG.routes[route] || null;
};

export const getAllServices = () => {
  return Object.keys(API_GATEWAY_CONFIG.services);
};

export const isServiceHealthy = async (serviceName) => {
  const service = API_GATEWAY_CONFIG.services[serviceName];
  if (!service) return false;

  try {
    const response = await fetch(`${service.baseUrl}${service.healthCheck}`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

export const getServiceUrl = (serviceName, environment = 'development') => {
  const config = environment === 'production' ? PROD_CONFIG : DEV_CONFIG;
  return config.services[serviceName]?.url || null;
};
