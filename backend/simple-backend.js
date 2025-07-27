const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT
  });
});

// API endpoints
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: [
      { id: 1, name: 'Product 1', price: 99.99, category: 'Electronics' },
      { id: 2, name: 'Product 2', price: 149.99, category: 'Clothing' },
      { id: 3, name: 'Product 3', price: 79.99, category: 'Books' }
    ]
  });
});

app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    orders: [
      { id: 1, customer: 'John Doe', total: 99.99, status: 'completed' },
      { id: 2, customer: 'Jane Smith', total: 149.99, status: 'pending' }
    ]
  });
});

app.get('/api/customers', (req, res) => {
  res.json({
    success: true,
    customers: [
      { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 3 }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🔧 Backend API Server Running');
  console.log('================================');
  console.log(`🔧 Backend API: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`📊 Orders: http://localhost:${PORT}/api/orders`);
  console.log(`👥 Customers: http://localhost:${PORT}/api/customers`);
  console.log('');
  console.log('✨ Backend API is ready!');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

module.exports = app;
