#!/bin/bash

# GoSellr Cloud Deployment Script
# This script deploys the complete GoSellr platform to AWS

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
AWS_REGION="us-east-1"
DOMAIN_NAME="${1:-gosellr.com}"
EMAIL="${2:-admin@gosellr.com}"

echo -e "${BLUE}☁️  GoSellr Cloud Deployment Script ☁️${NC}"
echo -e "${YELLOW}Domain: $DOMAIN_NAME${NC}"
echo -e "${YELLOW}Email: $EMAIL${NC}"
echo -e "${YELLOW}AWS Region: $AWS_REGION${NC}"
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

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi

    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed"
        exit 1
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi

    print_status "Prerequisites check passed"
}

# Create S3 bucket for Terraform state
create_terraform_state_bucket() {
    print_status "Creating S3 bucket for Terraform state..."

    BUCKET_NAME="gosellr-terraform-state-$(openssl rand -hex 8)"

    aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

    # Enable versioning
    aws s3api put-bucket-versioning \
        --bucket $BUCKET_NAME \
        --versioning-configuration Status=Enabled

    # Enable encryption
    aws s3api put-bucket-encryption \
        --bucket $BUCKET_NAME \
        --server-side-encryption-configuration '{
            "Rules": [
                {
                    "ApplyServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }'

    # Block public access
    aws s3api put-public-access-block \
        --bucket $BUCKET_NAME \
        --public-access-block-configuration \
        BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

    echo $BUCKET_NAME > .terraform-state-bucket
    print_status "Terraform state bucket created: $BUCKET_NAME"
}

# Create ECR repositories
create_ecr_repositories() {
    print_status "Creating ECR repositories..."

    # Backend repository
    aws ecr create-repository \
        --repository-name gosellr/backend \
        --region $AWS_REGION \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256

    # Frontend repository
    aws ecr create-repository \
        --repository-name gosellr/frontend \
        --region $AWS_REGION \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256

    # Get repository URLs
    BACKEND_REPO=$(aws ecr describe-repositories --repository-names gosellr/backend --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text)
    FRONTEND_REPO=$(aws ecr describe-repositories --repository-names gosellr/frontend --region $AWS_REGION --query 'repositories[0].repositoryUri' --output text)

    echo $BACKEND_REPO > .backend-repo-url
    echo $FRONTEND_REPO > .frontend-repo-url

    print_status "ECR repositories created"
    print_status "Backend: $BACKEND_REPO"
    print_status "Frontend: $FRONTEND_REPO"
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."

    # Get ECR login token
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

    # Build and push backend
    cd backend
    docker build -t gosellr-backend .
    docker tag gosellr-backend:latest $(cat ../.backend-repo-url):latest
    docker push $(cat ../.backend-repo-url):latest
    cd ..

    # Build and push frontend
    cd frontend
    docker build -t gosellr-frontend .
    docker tag gosellr-frontend:latest $(cat ../.frontend-repo-url):latest
    docker push $(cat ../.frontend-repo-url):latest
    cd ..

    print_status "Docker images built and pushed successfully"
}

# Create Terraform variables file
create_terraform_variables() {
    print_status "Creating Terraform variables file..."

    cat > aws/terraform/terraform.tfvars << EOF
# AWS Configuration
aws_region = "$AWS_REGION"
environment = "$ENVIRONMENT"
domain_name = "$DOMAIN_NAME"

# Database Configuration
database_password = "$(openssl rand -base64 32)"

# API Keys
openai_api_key = "$(read -p "Enter OpenAI API Key: " openai_key && echo $openai_key)"

# ECR Repository URLs
ecr_repository_url = "$(cat .backend-repo-url | sed 's|/backend||')"

# Terraform State
terraform_state_bucket = "$(cat .terraform-state-bucket)"
EOF

    print_status "Terraform variables file created"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."

    cd aws/terraform

    # Initialize Terraform
    terraform init \
        -backend-config="bucket=$(cat ../../.terraform-state-bucket)" \
        -backend-config="key=production/terraform.tfstate" \
        -backend-config="region=$AWS_REGION"

    # Plan deployment
    terraform plan -out=tfplan

    # Apply deployment
    terraform apply tfplan

    # Get outputs
    ALB_DNS=$(terraform output -raw alb_dns_name)
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
    REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)

    echo $ALB_DNS > ../../.alb-dns
    echo $RDS_ENDPOINT > ../../.rds-endpoint
    echo $REDIS_ENDPOINT > ../../.redis-endpoint

    cd ../..

    print_status "Infrastructure deployed successfully"
    print_status "ALB DNS: $ALB_DNS"
    print_status "RDS Endpoint: $RDS_ENDPOINT"
    print_status "Redis Endpoint: $REDIS_ENDPOINT"
}

# Configure DNS
configure_dns() {
    print_status "Configuring DNS..."

    # Get hosted zone ID
    ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN_NAME.'].Id" --output text)

    if [ -z "$ZONE_ID" ]; then
        print_warning "Hosted zone not found for $DOMAIN_NAME"
        print_warning "Please create a hosted zone in Route53 and update the nameservers"
    else
        # Create A record
        aws route53 change-resource-record-sets \
            --hosted-zone-id $ZONE_ID \
            --change-batch '{
                "Changes": [
                    {
                        "Action": "UPSERT",
                        "ResourceRecordSet": {
                            "Name": "'$DOMAIN_NAME'",
                            "Type": "A",
                            "AliasTarget": {
                                "HostedZoneId": "Z35SXDOTRQ7X7K",
                                "DNSName": "'$(cat .alb-dns)'",
                                "EvaluateTargetHealth": true
                            }
                        }
                    }
                ]
            }'

        print_status "DNS configured successfully"
    fi
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."

    ALB_DNS=$(cat .alb-dns)

    # Wait for ALB to be ready
    echo "Waiting for ALB to be ready..."
    until curl -f http://$ALB_DNS/health > /dev/null 2>&1; do
        sleep 30
    done

    # Check backend health
    if curl -f https://$DOMAIN_NAME/api/health > /dev/null 2>&1; then
        print_status "Backend is healthy"
    else
        print_error "Backend health check failed"
        return 1
    fi

    # Check frontend health
    if curl -f https://$DOMAIN_NAME > /dev/null 2>&1; then
        print_status "Frontend is healthy"
    else
        print_error "Frontend health check failed"
        return 1
    fi

    print_status "All health checks passed"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."

    # Create CloudWatch dashboard
    aws cloudwatch put-dashboard \
        --dashboard-name "GoSellr-Dashboard" \
        --dashboard-body '{
            "widgets": [
                {
                    "type": "metric",
                    "properties": {
                        "metrics": [
                            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "'$(cat .alb-dns | cut -d'.' -f1)'"],
                            [".", "TargetResponseTime", ".", "."],
                            [".", "HTTPCode_Target_5XX_Count", ".", "."]
                        ],
                        "period": 300,
                        "stat": "Sum",
                        "region": "'$AWS_REGION'",
                        "title": "GoSellr ALB Metrics"
                    }
                }
            ]
        }'

    # Create alarms
    aws cloudwatch put-metric-alarm \
        --alarm-name "GoSellr-High-Error-Rate" \
        --alarm-description "High error rate on GoSellr ALB" \
        --metric-name HTTPCode_Target_5XX_Count \
        --namespace AWS/ApplicationELB \
        --statistic Sum \
        --period 300 \
        --threshold 10 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --alarm-actions arn:aws:sns:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):gosellr-alerts

    print_status "Monitoring setup completed"
}

# Setup backup
setup_backup() {
    print_status "Setting up backup..."

    # Create backup vault
    aws backup create-backup-vault \
        --backup-vault-name gosellr-backup-vault \
        --region $AWS_REGION

    # Create backup plan
    aws backup create-backup-plan \
        --backup-plan '{
            "BackupPlanName": "GoSellr-Backup-Plan",
            "Rules": [
                {
                    "RuleName": "DailyBackup",
                    "TargetBackupVault": "gosellr-backup-vault",
                    "ScheduleExpression": "cron(0 3 * * ? *)",
                    "StartWindowMinutes": 60,
                    "CompletionWindowMinutes": 120,
                    "Lifecycle": {
                        "DeleteAfterDays": 30
                    }
                }
            ]
        }' \
        --region $AWS_REGION

    print_status "Backup setup completed"
}

# Display deployment information
display_deployment_info() {
    echo ""
    echo -e "${BLUE}🎉 GoSellr Cloud Deployment Complete! 🎉${NC}"
    echo ""
    echo -e "${GREEN}Application URLs:${NC}"
    echo -e "  Frontend: ${YELLOW}https://$DOMAIN_NAME${NC}"
    echo -e "  Backend API: ${YELLOW}https://$DOMAIN_NAME/api${NC}"
    echo -e "  Health Check: ${YELLOW}https://$DOMAIN_NAME/health${NC}"
    echo ""
    echo -e "${GREEN}Infrastructure Details:${NC}"
    echo -e "  ALB DNS: ${YELLOW}$(cat .alb-dns)${NC}"
    echo -e "  RDS Endpoint: ${YELLOW}$(cat .rds-endpoint)${NC}"
    echo -e "  Redis Endpoint: ${YELLOW}$(cat .redis-endpoint)${NC}"
    echo -e "  ECR Backend: ${YELLOW}$(cat .backend-repo-url)${NC}"
    echo -e "  ECR Frontend: ${YELLOW}$(cat .frontend-repo-url)${NC}"
    echo ""
    echo -e "${GREEN}AWS Services:${NC}"
    echo -e "  ECS Cluster: ${YELLOW}gosellr-cluster${NC}"
    echo -e "  RDS Cluster: ${YELLOW}gosellr-db${NC}"
    echo -e "  ElastiCache: ${YELLOW}gosellr-redis${NC}"
    echo -e "  S3 Buckets: ${YELLOW}gosellr-*${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo -e "  1. Update DNS nameservers for $DOMAIN_NAME"
    echo -e "  2. Configure SSL certificate validation"
    echo -e "  3. Set up monitoring alerts"
    echo -e "  4. Configure backup schedules"
    echo -e "  5. Review security groups and IAM policies"
    echo ""
    echo -e "${GREEN}Useful Commands:${NC}"
    echo -e "  View logs: ${YELLOW}aws logs tail /ecs/gosellr-backend --follow${NC}"
    echo -e "  Scale services: ${YELLOW}aws ecs update-service --cluster gosellr-cluster --service gosellr-backend --desired-count 3${NC}"
    echo -e "  Update application: ${YELLOW}./deploy-cloud.sh $DOMAIN_NAME $EMAIL${NC}"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f .terraform-state-bucket .backend-repo-url .frontend-repo-url .alb-dns .rds-endpoint .redis-endpoint
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting GoSellr cloud deployment...${NC}"
    echo ""

    check_prerequisites
    create_terraform_state_bucket
    create_ecr_repositories
    build_and_push_images
    create_terraform_variables
    deploy_infrastructure
    configure_dns
    run_health_checks
    setup_monitoring
    setup_backup
    display_deployment_info

    echo -e "${GREEN}☁️  GoSellr is now running in the cloud! ☁️${NC}"
}

# Trap cleanup on exit
trap cleanup EXIT

# Run main function
main "$@"
