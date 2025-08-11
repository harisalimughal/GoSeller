const fs = require('fs');
const path = require('path');

const envContent = `# ========================================
# DATABASE CONFIGURATION
# ========================================
MONGODB_URI=mongodb://localhost:27017/gosellr
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/gosellr

# ========================================
# CLOUDINARY CONFIGURATION
# ========================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:4000

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# ========================================
# EMAIL CONFIGURATION (Optional)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# ========================================
# PAYMENT CONFIGURATION (Optional)
# ========================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# ========================================
# REDIS CONFIGURATION (Optional)
# ========================================
REDIS_URL=redis://localhost:6379

# ========================================
# AWS CONFIGURATION (Optional)
# ========================================
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# ========================================
# AI SERVICES (Optional)
# ========================================
OPENAI_API_KEY=your_openai_api_key

# ========================================
# BLOCKCHAIN CONFIGURATION (Optional)
# ========================================
ETHEREUM_NETWORK=mainnet
ETHEREUM_PRIVATE_KEY=your_ethereum_private_key
CONTRACT_ADDRESS=your_smart_contract_address

# ========================================
# MONITORING & LOGGING
# ========================================
LOG_LEVEL=info
SENTRY_DSN=your_sentry_dsn

# ========================================
# SECURITY
# ========================================
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# ========================================
# CORS CONFIGURATION
# ========================================
ALLOWED_ORIGINS=http://localhost:4000,http://localhost:3000,https://yourdomain.com
`;

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created successfully!');
  console.log('📝 Please update the .env file with your actual configuration values.');
  console.log('');
  console.log('🔑 Required configurations:');
  console.log('   - MONGODB_URI: Your MongoDB connection string');
  console.log('   - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name');
  console.log('   - CLOUDINARY_API_KEY: Your Cloudinary API key');
  console.log('   - CLOUDINARY_API_SECRET: Your Cloudinary API secret');
  console.log('   - JWT_SECRET: A secure random string for JWT tokens');
  console.log('');
  console.log('🚀 After updating the .env file, run: npm start');
} else {
  console.log('⚠️  .env file already exists. Skipping creation.');
} 