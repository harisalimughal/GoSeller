#!/bin/bash

# GoSellr Production Deployment Script
# This script deploys the complete GoSellr platform to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="gosellr"
ENVIRONMENT="production"
DOMAIN="${1:-localhost}"
EMAIL="${2:-admin@gosellr.com}"

echo -e "${BLUE}🌟 GoSellr Production Deployment Script 🌟${NC}"
echo -e "${YELLOW}Domain: $DOMAIN${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"
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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi

    # Check if Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        exit 1
    fi

    print_status "Prerequisites check passed"
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."

    if [ ! -f .env ]; then
        cat > .env << EOF
# GoSellr Production Environment Configuration

# Application
NODE_ENV=production
DOMAIN=$DOMAIN
EMAIL=$EMAIL

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
MONGO_DATABASE=gosellr
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# JWT
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key_here
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# Search
ELASTICSEARCH_URL=http://elasticsearch:9200
ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_API_KEY=your_algolia_api_key
ALGOLIA_SEARCH_KEY=your_algolia_search_key

# Monitoring
GRAFANA_PASSWORD=$(openssl rand -base64 32)

# Ports
BACKEND_PORT=5000
FRONTEND_PORT=3000

# API URLs
VITE_API_URL=https://$DOMAIN/api
VITE_APP_NAME=GoSellr
VITE_APP_VERSION=3.0.0
EOF
        print_status "Environment file created"
    else
        print_warning "Environment file already exists"
    fi
}

# Create SSL certificates
create_ssl_certificates() {
    print_status "Setting up SSL certificates..."

    mkdir -p nginx/ssl

    if [ "$DOMAIN" = "localhost" ]; then
        # Self-signed certificate for localhost
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=GoSellr/CN=localhost"
        print_status "Self-signed SSL certificate created for localhost"
    else
        # Let's Encrypt certificate for production domain
        print_warning "Please obtain SSL certificate for $DOMAIN"
        print_warning "You can use Let's Encrypt or your preferred SSL provider"
        print_warning "Place the certificate files in nginx/ssl/cert.pem and nginx/ssl/key.pem"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."

    mkdir -p backend/uploads
    mkdir -p backend/logs
    mkdir -p nginx/logs
    mkdir -p monitoring/grafana/dashboards
    mkdir -p monitoring/grafana/datasources
    mkdir -p scripts

    print_status "Directories created"
}

# Create MongoDB initialization script
create_mongo_init() {
    print_status "Creating MongoDB initialization script..."

    cat > scripts/mongo-init.js << EOF
// MongoDB initialization script for GoSellr
db = db.getSiblingDB('gosellr');

// Create collections
db.createCollection('users');
db.createCollection('products');
db.createCollection('categories');
db.createCollection('orders');
db.createCollection('reviews');
db.createCollection('carts');
db.createCollection('payments');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.products.createIndex({ "slug": 1 }, { unique: true });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "brand": 1 });
db.products.createIndex({ "price": 1 });
db.orders.createIndex({ "user": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });

// Create admin user
db.users.insertOne({
    email: "admin@gosellr.com",
    password: "\$2b\$10\$rQZ8K9mN2pL1vX3yW4zA5uB6cD7eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
});

print("MongoDB initialized successfully");
EOF
    print_status "MongoDB initialization script created"
}

# Create Grafana datasource configuration
create_grafana_datasources() {
    print_status "Creating Grafana datasource configuration..."

    cat > monitoring/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
EOF
    print_status "Grafana datasource configuration created"
}

# Build and deploy
deploy_application() {
    print_status "Building and deploying GoSellr..."

    # Stop existing containers
    docker-compose down --remove-orphans

    # Build images
    docker-compose build --no-cache

    # Start services
    docker-compose up -d

    print_status "Application deployed successfully"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."

    # Wait for MongoDB
    echo "Waiting for MongoDB..."
    until docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
        sleep 5
    done

    # Wait for Redis
    echo "Waiting for Redis..."
    until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
        sleep 5
    done

    # Wait for Backend
    echo "Waiting for Backend..."
    until curl -f http://localhost:5000/health > /dev/null 2>&1; do
        sleep 5
    done

    # Wait for Frontend
    echo "Waiting for Frontend..."
    until curl -f http://localhost:3000 > /dev/null 2>&1; do
        sleep 5
    done

    print_status "All services are ready"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."

    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi

    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi

    # Check database connection
    if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_status "Database is healthy"
    else
        print_error "Database health check failed"
        return 1
    fi

    # Check Redis connection
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_status "Redis is healthy"
    else
        print_error "Redis health check failed"
        return 1
    fi

    print_status "All health checks passed"
}

# Display deployment information
display_deployment_info() {
    echo ""
    echo -e "${BLUE}🎉 GoSellr Production Deployment Complete! 🎉${NC}"
    echo ""
    echo -e "${GREEN}Application URLs:${NC}"
    echo -e "  Frontend: ${YELLOW}https://$DOMAIN${NC}"
    echo -e "  Backend API: ${YELLOW}https://$DOMAIN/api${NC}"
    echo -e "  Health Check: ${YELLOW}https://$DOMAIN/health${NC}"
    echo ""
    echo -e "${GREEN}Monitoring URLs:${NC}"
    echo -e "  Grafana Dashboard: ${YELLOW}http://localhost:3001${NC}"
    echo -e "  Prometheus: ${YELLOW}http://localhost:9090${NC}"
    echo -e "  Kibana: ${YELLOW}http://localhost:5601${NC}"
    echo -e "  Redis Commander: ${YELLOW}http://localhost:8081${NC}"
    echo -e "  MongoDB Express: ${YELLOW}http://localhost:8082${NC}"
    echo -e "  Jaeger Tracing: ${YELLOW}http://localhost:16686${NC}"
    echo ""
    echo -e "${GREEN}Default Credentials:${NC}"
    echo -e "  Grafana: ${YELLOW}admin / $(grep GRAFANA_PASSWORD .env | cut -d '=' -f2)${NC}"
    echo -e "  MongoDB Express: ${YELLOW}admin / $(grep MONGO_EXPRESS_PASSWORD .env | cut -d '=' -f2)${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo -e "  1. Update the .env file with your actual API keys and credentials"
    echo -e "  2. Configure SSL certificates for production domain"
    echo -e "  3. Set up proper firewall rules"
    echo -e "  4. Configure backup strategies"
    echo -e "  5. Set up monitoring alerts"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo -e "  View logs: ${YELLOW}docker-compose logs -f${NC}"
    echo -e "  Stop services: ${YELLOW}docker-compose down${NC}"
    echo -e "  Restart services: ${YELLOW}docker-compose restart${NC}"
    echo -e "  Update application: ${YELLOW}./deploy-production.sh $DOMAIN $EMAIL${NC}"
    echo ""
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting GoSellr production deployment...${NC}"
    echo ""

    check_prerequisites
    create_env_file
    create_ssl_certificates
    create_directories
    create_mongo_init
    create_grafana_datasources
    deploy_application
    wait_for_services
    run_health_checks
    display_deployment_info

    echo -e "${GREEN}🌟 GoSellr is now running in production! 🌟${NC}"
}

# Run main function
main "$@"
