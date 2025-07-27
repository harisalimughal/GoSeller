#!/bin/bash

# EHB Platform - All Services Deployment Script
# This script deploys all EHB services with unified frontend and microservices backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="EHB Platform"
ENVIRONMENT="${1:-development}"
DOMAIN="${2:-localhost}"

echo -e "${BLUE}🚀 EHB Platform - All Services Deployment Script 🚀${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Service Configuration
declare -A SERVICES=(
    ["EHB_CORE"]="5000:5000"
    ["EHB_GOSELLER"]="5001:5001"
    ["EHB_JPS"]="5002:5002"
    ["EHB_BLOCKCHAIN"]="5003:5003"
    ["EHB_AFFILIATE"]="5004:5004"
    ["EHB_ANALYTICS"]="5005:5005"
    ["EHB_PAYMENT"]="5006:5006"
    ["EHB_NOTIFICATION"]="5007:5007"
    ["EHB_REPORTING"]="5008:5008"
    ["EHB_WALLET"]="5009:5009"
)

# Frontend Configuration
FRONTEND_PORT=3000
API_GATEWAY_PORT=8000

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    # Check if ports are available
    for service in "${!SERVICES[@]}"; do
        port=$(echo ${SERVICES[$service]} | cut -d':' -f1)
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
            print_warning "Port $port is already in use for $service"
        fi
    done

    print_status "Prerequisites check passed"
}

# Create environment files
create_env_files() {
    print_status "Creating environment configuration files..."

    # Create main .env file
    cat > .env << EOF
# EHB Platform Environment Configuration
NODE_ENV=$ENVIRONMENT
DOMAIN=$DOMAIN

# Frontend Configuration
REACT_APP_API_GATEWAY_URL=http://localhost:$API_GATEWAY_PORT
REACT_APP_FRONTEND_URL=http://localhost:$FRONTEND_PORT

# Service URLs
EHB_CORE_URL=http://localhost:5000
GOSELLER_URL=http://localhost:5001
JPS_URL=http://localhost:5002
BLOCKCHAIN_URL=http://localhost:5003
AFFILIATE_URL=http://localhost:5004
ANALYTICS_URL=http://localhost:5005
PAYMENT_URL=http://localhost:5006
NOTIFICATION_URL=http://localhost:5007
REPORTING_URL=http://localhost:5008
WALLET_URL=http://localhost:5009

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ehb_platform
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRE=7d

# API Keys (to be configured)
OPENAI_API_KEY=your_openai_api_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# Search Configuration
ELASTICSEARCH_URL=http://localhost:9200
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_API_KEY=your_algolia_api_key
ALGOLIA_SEARCH_KEY=your_algolia_search_key
EOF

    print_status "Environment files created"
}

# Install dependencies for all services
install_dependencies() {
    print_status "Installing dependencies for all services..."

    # Install dependencies for each service
    for service in "${!SERVICES[@]}"; do
        service_path="services/$service"
        if [ -d "$service_path" ]; then
            print_status "Installing dependencies for $service..."

            # Backend dependencies
            if [ -f "$service_path/backend/package.json" ]; then
                cd "$service_path/backend"
                npm install
                cd ../../..
            fi

            # Frontend dependencies
            if [ -f "$service_path/frontend/package.json" ]; then
                cd "$service_path/frontend"
                npm install
                cd ../../..
            fi

            # Admin dependencies
            if [ -f "$service_path/admin/package.json" ]; then
                cd "$service_path/admin"
                npm install
                cd ../../..
            fi
        fi
    done

    print_status "All dependencies installed"
}

# Start backend services
start_backend_services() {
    print_status "Starting backend services..."

    for service in "${!SERVICES[@]}"; do
        service_path="services/$service"
        port=$(echo ${SERVICES[$service]} | cut -d':' -f1)

        if [ -d "$service_path/backend" ]; then
            print_status "Starting $service backend on port $port..."

            cd "$service_path/backend"

            # Start the service in background
            nohup npm start > ../../../logs/${service,,}_backend.log 2>&1 &
            echo $! > ../../../pids/${service,,}_backend.pid

            cd ../../..

            # Wait for service to start
            sleep 5

            # Check if service is running
            if curl -f http://localhost:$port/health > /dev/null 2>&1; then
                print_status "$service backend is running on port $port"
            else
                print_warning "$service backend might not be ready yet"
            fi
        fi
    done

    print_status "All backend services started"
}

# Start API Gateway
start_api_gateway() {
    print_status "Starting API Gateway on port $API_GATEWAY_PORT..."

    # Create API Gateway directory if it doesn't exist
    mkdir -p api-gateway

    # Create package.json for API Gateway
    cat > api-gateway/package.json << EOF
{
  "name": "ehb-api-gateway",
  "version": "1.0.0",
  "description": "EHB Platform API Gateway",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0",
    "http-proxy-middleware": "^2.0.6",
    "axios": "^1.4.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
EOF

    # Create API Gateway server
    cat > api-gateway/server.js << EOF
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || $API_GATEWAY_PORT;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:$FRONTEND_PORT', 'https://$DOMAIN'],
  credentials: true
}));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Service routing
const services = {
  'ehb-core': 'http://localhost:5000',
  'gosellr': 'http://localhost:5001',
  'jps': 'http://localhost:5002',
  'blockchain': 'http://localhost:5003',
  'affiliate': 'http://localhost:5004',
  'analytics': 'http://localhost:5005',
  'payment': 'http://localhost:5006',
  'notification': 'http://localhost:5007',
  'reporting': 'http://localhost:5008',
  'wallet': 'http://localhost:5009'
};

// Route mapping
const routeMapping = {
  '/api/auth': 'ehb-core',
  '/api/users': 'ehb-core',
  '/api/dashboard': 'ehb-core',
  '/api/admin': 'ehb-core',
  '/api/products': 'gosellr',
  '/api/categories': 'gosellr',
  '/api/orders': 'gosellr',
  '/api/cart': 'gosellr',
  '/api/reviews': 'gosellr',
  '/api/search': 'gosellr',
  '/api/ai': 'gosellr',
  '/api/blockchain': 'gosellr',
  '/api/jobs': 'jps',
  '/api/applications': 'jps',
  '/api/companies': 'jps',
  '/api/candidates': 'jps',
  '/api/recruiters': 'jps',
  '/api/crypto': 'blockchain',
  '/api/wallet': 'blockchain',
  '/api/nft': 'blockchain',
  '/api/transactions': 'blockchain',
  '/api/smart-contracts': 'blockchain',
  '/api/affiliates': 'affiliate',
  '/api/referrals': 'affiliate',
  '/api/commissions': 'affiliate',
  '/api/campaigns': 'affiliate',
  '/api/metrics': 'analytics',
  '/api/reports': 'analytics',
  '/api/insights': 'analytics',
  '/api/dashboards': 'analytics',
  '/api/bi': 'analytics',
  '/api/payments': 'payment',
  '/api/billing': 'payment',
  '/api/invoices': 'payment',
  '/api/subscriptions': 'payment',
  '/api/notifications': 'notification',
  '/api/messages': 'notification',
  '/api/alerts': 'notification',
  '/api/email': 'notification',
  '/api/sms': 'notification',
  '/api/push': 'notification',
  '/api/exports': 'reporting',
  '/api/templates': 'reporting',
  '/api/schedules': 'reporting',
  '/api/balance': 'wallet',
  '/api/transfers': 'wallet',
  '/api/history': 'wallet'
};

// Create proxy middleware for each route
Object.entries(routeMapping).forEach(([route, service]) => {
  const target = services[service];
  if (target) {
    app.use(route, createProxyMiddleware({
      target: target,
      changeOrigin: true,
      pathRewrite: {
        ['^' + route]: route
      },
      onError: (err, req, res) => {
        console.error(\`Proxy error for \${route}: \${err.message}\`);
        res.status(503).json({ error: 'Service temporarily unavailable' });
      }
    }));
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'EHB Platform API Gateway',
    version: '1.0.0',
    status: 'running',
    services: Object.keys(services),
    routes: Object.keys(routeMapping)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`API Gateway running on port \${PORT}\`);
});
EOF

    # Install dependencies and start API Gateway
    cd api-gateway
    npm install
    nohup npm start > ../logs/api_gateway.log 2>&1 &
    echo $! > ../pids/api_gateway.pid
    cd ..

    # Wait for API Gateway to start
    sleep 5

    if curl -f http://localhost:$API_GATEWAY_PORT/health > /dev/null 2>&1; then
        print_status "API Gateway is running on port $API_GATEWAY_PORT"
    else
        print_warning "API Gateway might not be ready yet"
    fi
}

# Start unified frontend
start_unified_frontend() {
    print_status "Starting unified frontend on port $FRONTEND_PORT..."

    # Create unified frontend directory if it doesn't exist
    mkdir -p unified-frontend

    # Create package.json for unified frontend
    cat > unified-frontend/package.json << EOF
{
  "name": "ehb-unified-frontend",
  "version": "1.0.0",
  "description": "EHB Platform Unified Frontend",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "axios": "^1.4.0",
    "@mui/material": "^5.11.0",
    "@mui/icons-material": "^5.11.0",
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0",
    "framer-motion": "^10.12.0",
    "react-query": "^3.39.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

    # Create basic React app structure
    mkdir -p unified-frontend/src
    mkdir -p unified-frontend/public

    # Create index.html
    cat > unified-frontend/public/index.html << EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="EHB Platform - Unified Frontend" />
    <title>EHB Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

    # Create App.js
    cat > unified-frontend/src/App.js << EOF
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';

// Import components (to be created)
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GoSellr from './pages/GoSellr';
import Jobs from './pages/Jobs';
import Blockchain from './pages/Blockchain';
import Analytics from './pages/Analytics';
import Payments from './pages/Payments';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/gosellr/*" element={<GoSellr />} />
              <Route path="/jobs/*" element={<Jobs />} />
              <Route path="/blockchain/*" element={<Blockchain />} />
              <Route path="/analytics/*" element={<Analytics />} />
              <Route path="/payments/*" element={<Payments />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
EOF

    # Create index.js
    cat > unified-frontend/src/index.js << EOF
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

    # Create basic components
    mkdir -p unified-frontend/src/components
    mkdir -p unified-frontend/src/pages

    # Create Layout component
    cat > unified-frontend/src/components/Layout.js << EOF
import React from 'react';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';

const Layout = ({ children }) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EHB Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
EOF

    # Create basic pages
    cat > unified-frontend/src/pages/Dashboard.js << EOF
import React from 'react';
import { Typography, Grid, Card, CardContent } from '@mui/material';

const Dashboard = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        EHB Platform Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">GoSellr</Typography>
              <Typography variant="body2">E-commerce Platform</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Jobs</Typography>
              <Typography variant="body2">Job Portal System</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Blockchain</Typography>
              <Typography variant="body2">Crypto Services</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Analytics</Typography>
              <Typography variant="body2">Business Intelligence</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
EOF

    # Create other page components
    for page in GoSellr Jobs Blockchain Analytics Payments; do
        cat > "unified-frontend/src/pages/$page.js" << EOF
import React from 'react';
import { Typography } from '@mui/material';

const $page = () => {
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        $page
      </Typography>
      <Typography variant="body1">
        $page service is running successfully!
      </Typography>
    </div>
  );
};

export default $page;
EOF
    done

    # Install dependencies and start frontend
    cd unified-frontend
    npm install
    nohup npm start > ../logs/unified_frontend.log 2>&1 &
    echo $! > ../pids/unified_frontend.pid
    cd ..

    # Wait for frontend to start
    sleep 10

    if curl -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        print_status "Unified frontend is running on port $FRONTEND_PORT"
    else
        print_warning "Unified frontend might not be ready yet"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."

    mkdir -p logs
    mkdir -p pids
    mkdir -p api-gateway
    mkdir -p unified-frontend

    print_status "Directories created"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."

    # Check API Gateway
    if curl -f http://localhost:$API_GATEWAY_PORT/health > /dev/null 2>&1; then
        print_status "API Gateway is healthy"
    else
        print_error "API Gateway health check failed"
        return 1
    fi

    # Check frontend
    if curl -f http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        print_status "Unified frontend is healthy"
    else
        print_error "Unified frontend health check failed"
        return 1
    fi

    # Check backend services
    for service in "${!SERVICES[@]}"; do
        port=$(echo ${SERVICES[$service]} | cut -d':' -f1)
        if curl -f http://localhost:$port/health > /dev/null 2>&1; then
            print_status "$service backend is healthy"
        else
            print_warning "$service backend health check failed"
        fi
    done

    print_status "Health checks completed"
}

# Display deployment information
display_deployment_info() {
    echo ""
    echo -e "${BLUE}🎉 EHB Platform Deployment Complete! 🎉${NC}"
    echo ""
    echo -e "${GREEN}Service URLs:${NC}"
    echo -e "  Unified Frontend: ${YELLOW}http://localhost:$FRONTEND_PORT${NC}"
    echo -e "  API Gateway: ${YELLOW}http://localhost:$API_GATEWAY_PORT${NC}"
    echo ""
    echo -e "${GREEN}Backend Services:${NC}"
    for service in "${!SERVICES[@]}"; do
        port=$(echo ${SERVICES[$service]} | cut -d':' -f1)
        echo -e "  $service: ${YELLOW}http://localhost:$port${NC}"
    done
    echo ""
    echo -e "${GREEN}API Endpoints:${NC}"
    echo -e "  Health Check: ${YELLOW}http://localhost:$API_GATEWAY_PORT/health${NC}"
    echo -e "  API Info: ${YELLOW}http://localhost:$API_GATEWAY_PORT${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo -e "  1. All services are running in background"
    echo -e "  2. Check logs in the 'logs' directory"
    echo -e "  3. Process IDs are saved in the 'pids' directory"
    echo -e "  4. Update environment variables in .env file"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo -e "  View logs: ${YELLOW}tail -f logs/*.log${NC}"
    echo -e "  Stop services: ${YELLOW}./stop-all-services.sh${NC}"
    echo -e "  Restart services: ${YELLOW}./restart-all-services.sh${NC}"
    echo ""
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting EHB Platform deployment...${NC}"
    echo ""

    create_directories
    check_prerequisites
    create_env_files
    install_dependencies
    start_backend_services
    start_api_gateway
    start_unified_frontend
    run_health_checks
    display_deployment_info

    echo -e "${GREEN}🚀 EHB Platform is now running! 🚀${NC}"
}

# Run main function
main "$@"
