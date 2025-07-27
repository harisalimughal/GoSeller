# AWS Region
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Environment
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Domain Configuration
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = "gosellr.com"
}

# VPC Configuration
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# ECS Configuration
variable "backend_cpu" {
  description = "CPU units for backend task"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory for backend task (MiB)"
  type        = number
  default     = 1024
}

variable "backend_desired_count" {
  description = "Desired number of backend tasks"
  type        = number
  default     = 2
}

variable "frontend_cpu" {
  description = "CPU units for frontend task"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend task (MiB)"
  type        = number
  default     = 512
}

variable "frontend_desired_count" {
  description = "Desired number of frontend tasks"
  type        = number
  default     = 2
}

# Database Configuration
variable "database_name" {
  description = "Database name"
  type        = string
  default     = "gosellr"
}

variable "database_username" {
  description = "Database master username"
  type        = string
  default     = "admin"
}

variable "database_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "database_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.r5.large"
}

variable "database_instance_count" {
  description = "Number of database instances"
  type        = number
  default     = 2
}

# Redis Configuration
variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_cluster_size" {
  description = "Number of Redis nodes"
  type        = number
  default     = 2
}

# ECR Configuration
variable "ecr_repository_url" {
  description = "ECR repository URL"
  type        = string
  default     = "123456789012.dkr.ecr.us-east-1.amazonaws.com/gosellr"
}

# API Keys
variable "openai_api_key" {
  description = "OpenAI API key"
  type        = string
  sensitive   = true
}

# Monitoring Configuration
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable CloudWatch logging"
  type        = bool
  default     = true
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 7
}

# Scaling Configuration
variable "enable_auto_scaling" {
  description = "Enable auto scaling"
  type        = bool
  default     = true
}

variable "min_capacity" {
  description = "Minimum capacity for auto scaling"
  type        = number
  default     = 1
}

variable "max_capacity" {
  description = "Maximum capacity for auto scaling"
  type        = number
  default     = 10
}

# Security Configuration
variable "enable_encryption" {
  description = "Enable encryption at rest"
  type        = bool
  default     = true
}

variable "enable_ssl" {
  description = "Enable SSL/TLS"
  type        = bool
  default     = true
}

# Cost Optimization
variable "enable_spot_instances" {
  description = "Enable spot instances for cost optimization"
  type        = bool
  default     = false
}

variable "reserved_instance_discount" {
  description = "Reserved instance discount percentage"
  type        = number
  default     = 0
}

# Tags
variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "GoSellr"
    Environment = "production"
    ManagedBy   = "Terraform"
    Owner       = "DevOps Team"
  }
}
