// Unified Frontend Configuration for EHB Platform
// This handles routing and integration for all services

const EHB_SERVICES_CONFIG = {
  // Main EHB Platform
  EHB_CORE: {
    name: 'EHB Core',
    frontendPort: 3000,
    backendPort: 5000,
    baseUrl: process.env.REACT_APP_EHB_CORE_URL || 'http://localhost:5000',
    routes: ['/', '/dashboard', '/admin'],
    description: 'Main EHB platform with home page and dashboard'
  },

  // EHB-GOSELLER Service
  EHB_GOSELLER: {
    name: 'GoSellr E-commerce',
    frontendPort: 3001,
    backendPort: 5001,
    baseUrl: process.env.REACT_APP_GOSELLER_URL || 'http://localhost:5001',
    routes: ['/gosellr', '/shop', '/products', '/cart', '/checkout'],
    description: 'E-commerce platform with AI and blockchain features'
  },

  // EHB-JPS Service
  EHB_JPS: {
    name: 'Job Portal System',
    frontendPort: 3002,
    backendPort: 5002,
    baseUrl: process.env.REACT_APP_JPS_URL || 'http://localhost:5002',
    routes: ['/jobs', '/careers', '/applications', '/recruit'],
    description: 'Job portal and recruitment system'
  },

  // EHB-BLOCKCHAIN Service
  EHB_BLOCKCHAIN: {
    name: 'Blockchain Services',
    frontendPort: 3003,
    backendPort: 5003,
    baseUrl: process.env.REACT_APP_BLOCKCHAIN_URL || 'http://localhost:5003',
    routes: ['/blockchain', '/crypto', '/wallet', '/nft'],
    description: 'Blockchain and cryptocurrency services'
  },

  // EHB-AFFILIATE Service
  EHB_AFFILIATE: {
    name: 'Affiliate System',
    frontendPort: 3004,
    backendPort: 5004,
    baseUrl: process.env.REACT_APP_AFFILIATE_URL || 'http://localhost:5004',
    routes: ['/affiliate', '/referrals', '/commissions'],
    description: 'Affiliate marketing and referral system'
  },

  // EHB-ANALYTICS Service
  EHB_ANALYTICS: {
    name: 'Analytics Platform',
    frontendPort: 3005,
    backendPort: 5005,
    baseUrl: process.env.REACT_APP_ANALYTICS_URL || 'http://localhost:5005',
    routes: ['/analytics', '/reports', '/insights'],
    description: 'Business intelligence and analytics'
  },

  // EHB-PAYMENT Service
  EHB_PAYMENT: {
    name: 'Payment Gateway',
    frontendPort: 3006,
    backendPort: 5006,
    baseUrl: process.env.REACT_APP_PAYMENT_URL || 'http://localhost:5006',
    routes: ['/payments', '/transactions', '/billing'],
    description: 'Payment processing and billing system'
  },

  // EHB-NOTIFICATION Service
  EHB_NOTIFICATION: {
    name: 'Notification System',
    frontendPort: 3007,
    backendPort: 5007,
    baseUrl: process.env.REACT_APP_NOTIFICATION_URL || 'http://localhost:5007',
    routes: ['/notifications', '/messages', '/alerts'],
    description: 'Real-time notifications and messaging'
  },

  // EHB-REPORTING Service
  EHB_REPORTING: {
    name: 'Reporting System',
    frontendPort: 3008,
    backendPort: 5008,
    baseUrl: process.env.REACT_APP_REPORTING_URL || 'http://localhost:5008',
    routes: ['/reports', '/exports', '/dashboards'],
    description: 'Advanced reporting and data export'
  },

  // EHB-WALLET Service
  EHB_WALLET: {
    name: 'Digital Wallet',
    frontendPort: 3009,
    backendPort: 5009,
    baseUrl: process.env.REACT_APP_WALLET_URL || 'http://localhost:5009',
    routes: ['/wallet', '/balance', '/transfers'],
    description: 'Digital wallet and financial management'
  }
};

// Unified Frontend Configuration
const UNIFIED_FRONTEND_CONFIG = {
  // Main Application Settings
  app: {
    name: 'EHB Platform',
    version: '5.0.0',
    description: 'Unified EHB Platform - All Services',
    mainPort: 3000,
    apiGatewayPort: 8000
  },

  // API Gateway Configuration
  apiGateway: {
    port: 8000,
    baseUrl: process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8000',
    routes: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      analytics: '/api/analytics',
      blockchain: '/api/blockchain',
      payments: '/api/payments',
      notifications: '/api/notifications'
    }
  },

  // Service Discovery
  serviceDiscovery: {
    enabled: true,
    healthCheckInterval: 30000, // 30 seconds
    retryAttempts: 3,
    timeout: 5000
  },

  // Authentication & Authorization
  auth: {
    unified: true,
    singleSignOn: true,
    tokenRefreshInterval: 300000, // 5 minutes
    sessionTimeout: 3600000, // 1 hour
    services: Object.keys(EHB_SERVICES_CONFIG)
  },

  // Navigation Configuration
  navigation: {
    mainMenu: [
      {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        service: 'EHB_CORE'
      },
      {
        name: 'E-commerce',
        path: '/gosellr',
        icon: 'shopping_cart',
        service: 'EHB_GOSELLER',
        submenu: [
          { name: 'Products', path: '/gosellr/products' },
          { name: 'Orders', path: '/gosellr/orders' },
          { name: 'Analytics', path: '/gosellr/analytics' }
        ]
      },
      {
        name: 'Jobs',
        path: '/jobs',
        icon: 'work',
        service: 'EHB_JPS',
        submenu: [
          { name: 'Browse Jobs', path: '/jobs/browse' },
          { name: 'My Applications', path: '/jobs/applications' },
          { name: 'Post Job', path: '/jobs/post' }
        ]
      },
      {
        name: 'Blockchain',
        path: '/blockchain',
        icon: 'currency_bitcoin',
        service: 'EHB_BLOCKCHAIN',
        submenu: [
          { name: 'Crypto Payments', path: '/blockchain/payments' },
          { name: 'NFT Marketplace', path: '/blockchain/nft' },
          { name: 'Wallet', path: '/blockchain/wallet' }
        ]
      },
      {
        name: 'Analytics',
        path: '/analytics',
        icon: 'analytics',
        service: 'EHB_ANALYTICS',
        submenu: [
          { name: 'Business Intelligence', path: '/analytics/bi' },
          { name: 'Reports', path: '/analytics/reports' },
          { name: 'Insights', path: '/analytics/insights' }
        ]
      },
      {
        name: 'Payments',
        path: '/payments',
        icon: 'payment',
        service: 'EHB_PAYMENT',
        submenu: [
          { name: 'Transactions', path: '/payments/transactions' },
          { name: 'Billing', path: '/payments/billing' },
          { name: 'Invoices', path: '/payments/invoices' }
        ]
      }
    ]
  },

  // Theme Configuration
  theme: {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    success: '#4caf50'
  },

  // Feature Flags
  features: {
    ai: true,
    blockchain: true,
    analytics: true,
    notifications: true,
    realTimeUpdates: true,
    offlineMode: false,
    progressiveWebApp: true
  }
};

// Service Health Check Configuration
const HEALTH_CHECK_CONFIG = {
  interval: 30000, // 30 seconds
  timeout: 5000,
  retries: 3,
  endpoints: {
    health: '/health',
    ready: '/ready',
    live: '/live'
  }
};

// Development Configuration
const DEV_CONFIG = {
  // Local Development Ports
  ports: {
    frontend: 3000,
    apiGateway: 8000,
    services: {
      ehbCore: 5000,
      gosellr: 5001,
      jps: 5002,
      blockchain: 5003,
      affiliate: 5004,
      analytics: 5005,
      payment: 5006,
      notification: 5007,
      reporting: 5008,
      wallet: 5009
    }
  },

  // Development URLs
  urls: {
    frontend: 'http://localhost:3000',
    apiGateway: 'http://localhost:8000',
    services: {
      ehbCore: 'http://localhost:5000',
      gosellr: 'http://localhost:5001',
      jps: 'http://localhost:5002',
      blockchain: 'http://localhost:5003',
      affiliate: 'http://localhost:5004',
      analytics: 'http://localhost:5005',
      payment: 'http://localhost:5006',
      notification: 'http://localhost:5007',
      reporting: 'http://localhost:5008',
      wallet: 'http://localhost:5009'
    }
  }
};

// Production Configuration
const PROD_CONFIG = {
  // Production URLs (to be configured)
  urls: {
    frontend: process.env.REACT_APP_FRONTEND_URL || 'https://ehb-platform.com',
    apiGateway: process.env.REACT_APP_API_GATEWAY_URL || 'https://api.ehb-platform.com',
    services: {
      ehbCore: process.env.REACT_APP_EHB_CORE_URL || 'https://core.ehb-platform.com',
      gosellr: process.env.REACT_APP_GOSELLER_URL || 'https://gosellr.ehb-platform.com',
      jps: process.env.REACT_APP_JPS_URL || 'https://jobs.ehb-platform.com',
      blockchain: process.env.REACT_APP_BLOCKCHAIN_URL || 'https://blockchain.ehb-platform.com',
      affiliate: process.env.REACT_APP_AFFILIATE_URL || 'https://affiliate.ehb-platform.com',
      analytics: process.env.REACT_APP_ANALYTICS_URL || 'https://analytics.ehb-platform.com',
      payment: process.env.REACT_APP_PAYMENT_URL || 'https://payment.ehb-platform.com',
      notification: process.env.REACT_APP_NOTIFICATION_URL || 'https://notifications.ehb-platform.com',
      reporting: process.env.REACT_APP_REPORTING_URL || 'https://reports.ehb-platform.com',
      wallet: process.env.REACT_APP_WALLET_URL || 'https://wallet.ehb-platform.com'
    }
  }
};

// Export configurations
export {
  EHB_SERVICES_CONFIG,
  UNIFIED_FRONTEND_CONFIG,
  HEALTH_CHECK_CONFIG,
  DEV_CONFIG,
  PROD_CONFIG
};

// Helper functions
export const getServiceConfig = (serviceName) => {
  return EHB_SERVICES_CONFIG[serviceName] || null;
};

export const getAllServices = () => {
  return Object.keys(EHB_SERVICES_CONFIG);
};

export const getServiceUrl = (serviceName, environment = 'development') => {
  const config = environment === 'production' ? PROD_CONFIG : DEV_CONFIG;
  return config.urls.services[serviceName.toLowerCase()] || null;
};

export const isServiceEnabled = (serviceName) => {
  return EHB_SERVICES_CONFIG[serviceName] !== undefined;
};
