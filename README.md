# 🛒 EHB-GOSELLER

## 📋 Project Overview

**EHB-GOSELLER** is a comprehensive e-commerce seller management platform designed to provide sellers with tools to manage their products, orders, customers, and business analytics.

### 🎯 Purpose
- Seller registration and management
- Product catalog management
- Order processing and fulfillment
- Customer relationship management
- Sales analytics and reporting
- Payment processing integration
- Inventory management

### 🛠️ Technology Stack

#### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Redux Toolkit** for state management
- **React Query** for data fetching
- **React Hook Form** for forms
- **Recharts** for analytics

#### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** for database
- **Redis** for caching
- **JWT** for authentication
- **Multer** for file uploads
- **Stripe** for payments
- **Nodemailer** for emails

#### Admin Panel
- **React Admin** for admin interface
- **Material-UI** for components
- **Chart.js** for analytics
- **React Hook Form** for forms

### 📁 Project Structure

```
EHB-GOSELLER/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── tests/              # Backend tests
│   └── package.json
├── admin-panel/            # Admin dashboard
│   ├── src/
│   │   ├── components/     # Admin components
│   │   ├── pages/         # Admin pages
│   │   ├── services/      # Admin services
│   │   └── utils/         # Admin utilities
│   └── package.json
├── scripts/                # Setup and utility scripts
├── docs/                   # Documentation
├── .env.example           # Environment variables template
├── package.json           # Root package.json
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- Redis >= 6.0

### Installation

1. **Clone and navigate to the project:**
```bash
cd services/EHB-GOSELLER
```

2. **Install all dependencies:**
```bash
npm run install:all
```

3. **Setup environment:**
```bash
npm run setup:env
```

4. **Setup database:**
```bash
npm run setup:db
```

5. **Start development servers:**
```bash
npm run dev
```

### Development Commands

```bash
# Start all services
npm run dev

# Start individual services
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only
npm run dev:admin       # Admin panel only

# Build all services
npm run build

# Run tests
npm run test

# Run linting
npm run lint
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/goseller_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 📊 Features

### 🛍️ Seller Management
- Seller registration and verification
- Profile management
- Store customization
- Business hours and location

### 📦 Product Management
- Product catalog creation
- Category management
- Inventory tracking
- Product variants and options
- Bulk import/export

### 🛒 Order Management
- Order processing workflow
- Order status tracking
- Fulfillment management
- Shipping integration
- Return/refund handling

### 💰 Payment Processing
- Multiple payment methods
- Secure payment processing
- Transaction history
- Payout management
- Commission tracking

### 📈 Analytics & Reporting
- Sales analytics
- Customer insights
- Performance metrics
- Revenue reports
- Inventory reports

### 👥 Customer Management
- Customer profiles
- Order history
- Communication tools
- Customer support
- Review management

### 🔐 Security Features
- JWT authentication
- Role-based access control
- Data encryption
- API rate limiting
- Input validation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:frontend
npm run test:backend
npm run test:admin

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Build
```bash
npm run build
```

### Docker Deployment
```bash
docker-compose up -d
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SSL certificates
4. Configure CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added advanced analytics
- **v1.2.0** - Enhanced security features
- **v1.3.0** - Mobile responsive design
- **v1.4.0** - Multi-language support

---

**Built with ❤️ by the EHB Team**
