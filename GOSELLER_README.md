# 🛒 Goseller - E-commerce Platform

## Overview
Goseller is a comprehensive e-commerce seller management platform designed to help modern sellers manage their products, process orders, and grow their business with powerful tools and analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Setup

1. **Clone and Navigate**
   ```bash
   cd services/EHB-GOSELLER
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Goseller**
   ```bash
   # Option 1: Simple server (recommended)
   node simple-goseller.js

   # Option 2: Full development server
   node dev-server.js

   # Option 3: Using batch script
   run-goseller.bat

   # Option 4: Using PowerShell script
   .\run-goseller.ps1
   ```

## 🌐 Access URLs

Once started, you can access Goseller at:

- **🏪 Main Goseller URL**: http://localhost:8080
- **🔧 API Health Check**: http://localhost:8080/api/health
- **📊 Goseller API**: http://localhost:8080/api/goseller
- **📱 Frontend**: http://localhost:3000 (if running full dev server)
- **⚙️ Admin Panel**: http://localhost:3002 (if running full dev server)

## 🏗️ Architecture

```
services/EHB-GOSELLER/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── store/          # Redux store
│   │   └── services/       # API services
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Data models
│   │   └── routes/         # API routes
├── admin-panel/            # Admin dashboard
├── scripts/                # Setup and utility scripts
└── simple-goseller.js      # Simple standalone server
```

## ✨ Features

### Core Features
- **📦 Product Management**: Manage product catalog with variants, categories, and inventory tracking
- **🛒 Order Processing**: Process orders efficiently with automated workflows and status tracking
- **📊 Analytics & Reports**: Get insights into sales, customers, and performance with detailed analytics
- **👥 Customer Management**: Build relationships with customers through personalized experiences
- **💳 Payment Processing**: Accept payments securely with multiple payment gateways and fraud protection
- **🔒 Security**: Enterprise-grade security with 99.9% uptime and 24/7 support

### Technical Features
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Updates**: Live data synchronization across all components
- **API Integration**: RESTful API with comprehensive endpoints
- **Database Support**: PostgreSQL with migrations and seeding
- **Authentication**: JWT-based authentication system
- **File Upload**: Secure file upload for product images and documents

## 🛠️ Development

### Available Scripts

```bash
# Setup
npm run setup              # Complete setup (env, db, tools)
npm run setup:env          # Setup environment variables
npm run setup:db           # Setup database
npm run setup:tools        # Setup development tools

# Development
npm run dev:goseller       # Start development server
npm run start:goseller     # Start production server

# Frontend
cd frontend
npm run dev               # Start frontend development server
npm run build             # Build for production
npm run preview           # Preview production build

# Backend
cd backend
npm run dev               # Start backend development server
npm run start             # Start production server
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/goseller

# JWT Secret
JWT_SECRET=your-secret-key

# API Keys
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id
```

## 📁 Project Structure

### Frontend Structure
```
frontend/
├── src/
│   ├── pages/             # Page components
│   │   ├── Home.tsx       # Homepage
│   │   ├── Dashboard.tsx  # Main dashboard
│   │   ├── Products.tsx   # Product management
│   │   ├── Orders.tsx     # Order processing
│   │   ├── Customers.tsx  # Customer management
│   │   └── Analytics.tsx  # Analytics & reports
│   ├── components/        # Reusable components
│   ├── store/            # Redux store and slices
│   ├── services/         # API services
│   └── utils/            # Utility functions
```

### Backend Structure
```
backend/
├── src/
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
```

## 🚀 Deployment

### Local Development
1. Start the simple server: `node simple-goseller.js`
2. Access at: http://localhost:8080

### Production Deployment
1. Build frontend: `cd frontend && npm run build`
2. Start backend: `cd backend && npm start`
3. Configure environment variables
4. Set up database
5. Configure reverse proxy (nginx)

## 🔧 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Goseller Info
- `GET /api/goseller` - Platform information and features

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer details

## 🎨 UI Components

The application uses a modern design system with:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Redux Toolkit** for state management
- **React Hook Form** for forms

## 📊 Analytics & Monitoring

- Real-time dashboard with key metrics
- Sales analytics and reporting
- Customer behavior tracking
- Inventory management
- Performance monitoring

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure payment processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

**Goseller** - Empowering modern e-commerce sellers with powerful tools and analytics. 🚀
