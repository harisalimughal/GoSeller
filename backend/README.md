# 🌟 GoSellr Backend - World's Best E-commerce Platform

## 🚀 Overview

GoSellr Backend is the powerhouse behind the world's best e-commerce platform. Built with Node.js, Express, and MongoDB, it provides a robust, scalable, and feature-rich API that powers the entire GoSellr ecosystem.

## ✨ Features

### 🛍️ **Core E-commerce Features**
- **Product Management**: Complete CRUD operations with advanced filtering
- **Category Management**: Hierarchical category system with SEO optimization
- **User Management**: Authentication, authorization, and user profiles
- **Order Management**: Complete order lifecycle with status tracking
- **Shopping Cart**: Persistent cart with real-time updates
- **Reviews & Ratings**: User-generated content with moderation
- **Search & Filtering**: Advanced search with multiple criteria
- **Inventory Management**: Real-time stock tracking and alerts

### 🤖 **AI-Powered Features**
- **Smart Recommendations**: Machine learning-based product suggestions
- **Search Optimization**: AI-enhanced search with natural language processing
- **Personalization**: User behavior analysis and personalized experiences
- **Trend Analysis**: Real-time trend detection and forecasting
- **Content Generation**: AI-powered product descriptions and marketing copy

### ⛓️ **Blockchain Integration**
- **Token Management**: ERC-20 token (GSLR) integration
- **NFT Marketplace**: Digital asset trading and ownership
- **Smart Contracts**: Automated business logic execution
- **Wallet Integration**: Secure cryptocurrency transactions
- **DeFi Features**: Staking, yield farming, and liquidity pools

### 🔗 **Multi-Platform Integration**
- **Amazon Integration**: Product synchronization and data extraction
- **Shopify Integration**: Cross-platform inventory management
- **eBay Integration**: Multi-marketplace selling capabilities
- **Fiverr Integration**: Service marketplace connectivity
- **OpenSea Integration**: NFT marketplace synchronization
- **Binance Integration**: Cryptocurrency trading and payment processing

### 📊 **Analytics & Insights**
- **Real-time Analytics**: Live dashboard with key metrics
- **Performance Monitoring**: System health and performance tracking
- **Business Intelligence**: Advanced reporting and data visualization
- **User Analytics**: Behavior tracking and conversion optimization
- **Revenue Analytics**: Sales tracking and financial reporting

### 🔒 **Security & Compliance**
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permission management
- **Data Encryption**: End-to-end encryption for sensitive data
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Input Validation**: Comprehensive data validation and sanitization
- **GDPR Compliance**: Data protection and privacy compliance

### 🚀 **Performance & Scalability**
- **Caching**: Redis-based caching for improved performance
- **Load Balancing**: Horizontal scaling capabilities
- **CDN Integration**: Global content delivery network
- **Database Optimization**: Indexed queries and connection pooling
- **Microservices Architecture**: Modular and scalable design

## 🛠️ Technology Stack

### **Core Technologies**
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **Redis**: In-memory data structure store for caching

### **Authentication & Security**
- **JWT**: JSON Web Tokens for stateless authentication
- **bcryptjs**: Password hashing and verification
- **Helmet**: Security middleware for Express
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Request throttling and abuse prevention

### **File Upload & Storage**
- **Multer**: Multipart form data handling
- **Cloudinary**: Cloud image and video management
- **AWS S3**: Scalable cloud storage
- **Sharp**: High-performance image processing

### **Payment Processing**
- **Stripe**: Credit card and digital wallet payments
- **PayPal**: Alternative payment method integration
- **Web3.js**: Blockchain payment processing

### **Communication**
- **Nodemailer**: Email sending capabilities
- **SendGrid**: Transactional email service
- **Twilio**: SMS and voice communication
- **Socket.io**: Real-time bidirectional communication

### **Search & Analytics**
- **Elasticsearch**: Distributed search and analytics engine
- **Algolia**: Hosted search API
- **TensorFlow.js**: Machine learning capabilities
- **OpenAI**: AI-powered content generation

### **Development Tools**
- **Jest**: JavaScript testing framework
- **ESLint**: Code linting and quality assurance
- **Prettier**: Code formatting
- **Nodemon**: Development server with auto-restart
- **Swagger**: API documentation

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                 # Main application entry point
│   ├── models/                # Database models
│   │   ├── Product.js         # Product model with full schema
│   │   ├── User.js            # User model with authentication
│   │   ├── Category.js        # Category model
│   │   ├── Order.js           # Order model
│   │   ├── Cart.js            # Shopping cart model
│   │   └── Review.js          # Review and rating model
│   ├── routes/                # API route handlers
│   │   ├── products.js        # Product management routes
│   │   ├── auth.js            # Authentication routes
│   │   ├── users.js           # User management routes
│   │   ├── orders.js          # Order management routes
│   │   ├── cart.js            # Shopping cart routes
│   │   ├── categories.js      # Category management routes
│   │   ├── reviews.js         # Review management routes
│   │   ├── search.js          # Search functionality routes
│   │   ├── ai.js              # AI-powered features routes
│   │   ├── blockchain.js      # Blockchain integration routes
│   │   └── analytics.js       # Analytics and reporting routes
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # Authentication middleware
│   │   ├── validation.js      # Request validation middleware
│   │   ├── upload.js          # File upload middleware
│   │   └── errorHandler.js    # Error handling middleware
│   ├── utils/                 # Utility functions
│   │   ├── catchAsync.js      # Async error handling
│   │   ├── ApiError.js        # Custom API error class
│   │   ├── ApiResponse.js     # Standardized API response
│   │   └── helpers.js         # Helper functions
│   ├── validations/           # Request validation schemas
│   │   ├── productSchema.js   # Product validation
│   │   ├── userSchema.js      # User validation
│   │   └── orderSchema.js     # Order validation
│   ├── services/              # Business logic services
│   │   ├── authService.js     # Authentication service
│   │   ├── productService.js  # Product business logic
│   │   ├── orderService.js    # Order processing service
│   │   ├── aiService.js       # AI integration service
│   │   ├── blockchainService.js # Blockchain integration
│   │   └── emailService.js    # Email notification service
│   └── config/                # Configuration files
│       ├── database.js        # Database configuration
│       ├── redis.js           # Redis configuration
│       └── cloudinary.js      # Cloud storage configuration
├── uploads/                   # File upload directory
├── logs/                      # Application logs
├── tests/                     # Test files
├── scripts/                   # Utility scripts
├── docs/                      # API documentation
├── package.json               # Dependencies and scripts
├── env.example                # Environment variables template
├── start-backend.bat          # Windows startup script
└── README.md                  # This file
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (v6 or higher)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   cd services/EHB-GOSELLER/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   copy env.example .env
   # Edit .env file with your configuration
   ```

4. **Start the development server**
   ```bash
   # Windows (using batch script)
   start-backend.bat

   # Manual start
   npm run dev
   ```

5. **Access the API**
   - API Base URL: `http://localhost:5000/api`
   - Health Check: `http://localhost:5000/health`
   - API Documentation: `http://localhost:5000/api/docs`

### **Database Setup**

1. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env file
   ```

2. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

3. **Seed initial data**
   ```bash
   npm run db:seed
   ```

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### **Product Endpoints**
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/trending` - Get trending products
- `GET /api/products/best-sellers` - Get best sellers
- `GET /api/products/new-arrivals` - Get new arrivals
- `GET /api/products/search` - Search products
- `GET /api/products/:id/similar` - Get similar products

### **Category Endpoints**
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### **User Endpoints**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/orders` - Get user orders
- `GET /api/users/wishlist` - Get user wishlist
- `POST /api/users/wishlist` - Add to wishlist
- `DELETE /api/users/wishlist/:id` - Remove from wishlist

### **Order Endpoints**
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/cancel` - Cancel order

### **Cart Endpoints**
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:id` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### **Review Endpoints**
- `GET /api/reviews/product/:id` - Get product reviews
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### **Search Endpoints**
- `GET /api/search` - Global search
- `GET /api/search/products` - Product search
- `GET /api/search/suggestions` - Search suggestions

### **AI Endpoints**
- `GET /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/analyze` - Analyze product data
- `GET /api/ai/trends` - Get trending analysis

### **Blockchain Endpoints**
- `GET /api/blockchain/balance` - Get token balance
- `POST /api/blockchain/transfer` - Transfer tokens
- `GET /api/blockchain/nfts` - Get user NFTs
- `POST /api/blockchain/mint` - Mint new NFT

### **Analytics Endpoints**
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/sales` - Get sales analytics
- `GET /api/analytics/users` - Get user analytics
- `GET /api/analytics/products` - Get product analytics

## 🔧 Configuration

### **Environment Variables**

Key environment variables to configure:

```bash
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/gosellr

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payments
STRIPE_SECRET_KEY=sk_test_your-stripe-key
PAYPAL_CLIENT_ID=your-paypal-client-id

# AI
OPENAI_API_KEY=your-openai-api-key

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
```

### **Database Configuration**

The application uses MongoDB with Mongoose ODM. Configure your database connection in the `.env` file:

```bash
MONGODB_URI=mongodb://localhost:27017/gosellr
```

### **Redis Configuration**

Redis is used for caching and session storage:

```bash
REDIS_URL=redis://localhost:6379
```

## 🧪 Testing

### **Run Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=products.test.js
```

### **API Testing**
```bash
# Test API endpoints
npm run api:test

# Health check
npm run health
```

## 📊 Monitoring & Logging

### **Health Check**
```bash
curl http://localhost:5000/health
```

### **Logs**
Logs are stored in the `logs/` directory:
- `app.log` - Application logs
- `error.log` - Error logs
- `access.log` - Access logs

### **Performance Monitoring**
- Response time tracking
- Database query monitoring
- Memory usage monitoring
- Error rate tracking

## 🚀 Deployment

### **Development Deployment**
```bash
npm run dev
```

### **Production Deployment**
```bash
# Build the application
npm run build

# Start production server
npm start

# Or use PM2
pm2 start ecosystem.config.js
```

### **Docker Deployment**
```bash
# Build Docker image
docker build -t gosellr-backend .

# Run Docker container
docker run -p 5000:5000 gosellr-backend
```

### **Environment-Specific Configurations**

#### **Development**
- Debug mode enabled
- Detailed logging
- Hot reload enabled
- Test routes available

#### **Production**
- Debug mode disabled
- Optimized logging
- Compression enabled
- Security headers enabled
- Rate limiting enabled

## 🔒 Security

### **Authentication**
- JWT-based authentication
- Refresh token mechanism
- Password hashing with bcrypt
- Session management

### **Authorization**
- Role-based access control (RBAC)
- Permission-based authorization
- API key management
- OAuth2 integration

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### **Encryption**
- HTTPS/TLS encryption
- Data encryption at rest
- Secure cookie configuration
- Environment variable protection

## 📈 Performance Optimization

### **Caching Strategy**
- Redis caching for frequently accessed data
- Database query result caching
- Static asset caching
- CDN integration

### **Database Optimization**
- Indexed queries
- Connection pooling
- Query optimization
- Database sharding support

### **API Optimization**
- Response compression
- Pagination
- Field selection
- Query optimization

## 🔧 Troubleshooting

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check MongoDB status
mongod --version
mongo --eval "db.serverStatus()"

# Check connection string
echo $MONGODB_URI
```

#### **Redis Connection Issues**
```bash
# Check Redis status
redis-cli ping

# Check Redis configuration
redis-cli config get *
```

#### **Port Already in Use**
```bash
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <process_id> /F
```

#### **Permission Issues**
```bash
# Check file permissions
ls -la

# Fix permissions
chmod 755 start-backend.bat
```

### **Debug Mode**
Enable debug mode for detailed logging:

```bash
DEBUG=true npm run dev
```

### **Log Analysis**
```bash
# View recent logs
tail -f logs/app.log

# Search for errors
grep "ERROR" logs/app.log

# Monitor real-time logs
tail -f logs/*.log
```

## 🤝 Contributing

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

### **Code Standards**
- Follow ESLint configuration
- Use Prettier for code formatting
- Write comprehensive tests
- Add JSDoc comments
- Follow conventional commits

### **Testing Guidelines**
- Write unit tests for all functions
- Write integration tests for API endpoints
- Maintain 80%+ test coverage
- Test error scenarios
- Test edge cases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Documentation**
- [API Documentation](http://localhost:5000/api/docs)
- [Swagger UI](http://localhost:5000/api/swagger)
- [Postman Collection](docs/postman-collection.json)

### **Community**
- [GitHub Issues](https://github.com/ehb-team/gosellr-backend/issues)
- [Discord Server](https://discord.gg/gosellr)
- [Email Support](mailto:support@gosellr.com)

### **Professional Support**
- [Enterprise Support](https://gosellr.com/enterprise)
- [Consulting Services](https://gosellr.com/consulting)
- [Training Programs](https://gosellr.com/training)

---

## 🌟 **World's Best E-commerce Backend - Ready to Power Your Business!**

This backend system is designed to handle millions of users, process thousands of transactions per second, and provide the foundation for the world's most advanced e-commerce platform. With AI-powered features, blockchain integration, and multi-platform connectivity, GoSellr Backend is the ultimate solution for modern e-commerce businesses.

**🚀 Start building the future of e-commerce today!**
