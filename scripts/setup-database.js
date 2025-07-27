#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗄️ Setting up Goseller database...');

// Create database migration files
const migrationsDir = path.join(__dirname, '..', 'backend', 'src', 'database', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// Create initial migration file
const initialMigration = `
-- Migration: 001_initial_schema
-- Created: ${new Date().toISOString()}

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'seller',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  store_name VARCHAR(255) NOT NULL,
  store_description TEXT,
  business_address TEXT,
  business_phone VARCHAR(20),
  business_email VARCHAR(255),
  tax_id VARCHAR(50),
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  payout_method VARCHAR(50),
  payout_details JSONB,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES sellers(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  weight DECIMAL(8,2),
  dimensions JSONB,
  inventory_quantity INTEGER DEFAULT 0,
  min_inventory_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product images table
CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  value VARCHAR(100) NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  inventory_quantity INTEGER DEFAULT 0,
  sku VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  seller_id INTEGER REFERENCES sellers(id),
  status VARCHAR(50) DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_variant_id INTEGER REFERENCES product_variants(id),
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  gateway_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  customer_id INTEGER REFERENCES customers(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES sellers(id),
  date DATE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_analytics_seller_date ON analytics(seller_id, date);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Fashion and apparel'),
('Home & Garden', 'Home improvement and garden supplies'),
('Sports & Outdoors', 'Sports equipment and outdoor gear'),
('Books & Media', 'Books, movies, and music'),
('Health & Beauty', 'Health and beauty products'),
('Toys & Games', 'Toys and games for all ages'),
('Automotive', 'Automotive parts and accessories')
ON CONFLICT DO NOTHING;
`;

const migrationFile = path.join(migrationsDir, '001_initial_schema.sql');
if (!fs.existsSync(migrationFile)) {
  fs.writeFileSync(migrationFile, initialMigration.trim());
  console.log('✅ Created initial database migration');
}

// Create database seed file
const seedDir = path.join(__dirname, '..', 'backend', 'src', 'database', 'seeds');
if (!fs.existsSync(seedDir)) {
  fs.mkdirSync(seedDir, { recursive: true });
}

const seedData = `
-- Seed: 001_sample_data
-- Created: ${new Date().toISOString()}

-- Insert sample admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, is_active) VALUES
('admin@goseller.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', 'Admin', 'User', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample seller
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified, is_active) VALUES
('seller@goseller.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KqKqKq', 'John', 'Seller', 'seller', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample seller profile
INSERT INTO sellers (user_id, store_name, store_description, business_address, business_phone, business_email, is_approved) VALUES
((SELECT id FROM users WHERE email = 'seller@goseller.com'), 'Sample Store', 'A sample store for testing', '123 Main St, City, State', '+1234567890', 'seller@goseller.com', true)
ON CONFLICT DO NOTHING;

-- Insert sample customer
INSERT INTO customers (email, first_name, last_name, phone) VALUES
('customer@goseller.com', 'Jane', 'Customer', '+1234567890')
ON CONFLICT (email) DO NOTHING;
`;

const seedFile = path.join(seedDir, '001_sample_data.sql');
if (!fs.existsSync(seedFile)) {
  fs.writeFileSync(seedFile, seedData.trim());
  console.log('✅ Created database seed file');
}

console.log('🎉 Database setup completed successfully!');
console.log('');
console.log('Next steps:');
console.log('1. Configure your database connection in .env');
console.log('2. Run database migrations');
console.log('3. Run database seeds');
