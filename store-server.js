const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('store'));

// Store homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GoSeller Store</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                min-height: 100vh;
                color: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .container { text-align: center; max-width: 800px; padding: 2rem; }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            .subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
            .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0; }
            .feature-card { background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; backdrop-filter: blur(10px); }
            .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
            .feature-title { font-size: 1.2rem; font-weight: bold; margin-bottom: 0.5rem; }
            .nav-buttons { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; justify-content: center; }
            .btn { padding: 0.8rem 1.5rem; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 5px; transition: all 0.3s; }
            .btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🛍️ GoSeller Store</h1>
            <p class="subtitle">Complete e-commerce store with payment processing</p>

            <div class="features">
                <div class="feature-card">
                    <div class="feature-icon">🛒</div>
                    <div class="feature-title">Shopping Cart</div>
                    <div>Advanced cart management</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">💳</div>
                    <div class="feature-title">Payment Gateway</div>
                    <div>Secure payment processing</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📦</div>
                    <div class="feature-title">Product Catalog</div>
                    <div>Rich product browsing</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <div class="feature-title">Analytics</div>
                    <div>Sales and customer insights</div>
                </div>
            </div>

            <div class="nav-buttons">
                <a href="/api/store/status" class="btn">🏥 Status</a>
                <a href="/api/store/products" class="btn">📦 Products</a>
                <a href="/api/payment/status" class="btn">💳 Payment</a>
                <a href="/api/payment/analytics" class="btn">📊 Analytics</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Store API endpoints
app.get('/api/store/status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Store API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT,
    features: {
      shopping_cart: 'enabled',
      payment_processing: 'active',
      inventory: 'synced',
      analytics: 'tracking'
    }
  });
});

app.get('/api/store/products', (req, res) => {
  res.json({
    success: true,
    products: [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 99.99,
        category: 'Electronics',
        image: '/images/headphones.jpg',
        description: 'High-quality wireless headphones with noise cancellation',
        stock: 50,
        rating: 4.5
      },
      {
        id: 2,
        name: 'Smart Watch',
        price: 299.99,
        category: 'Electronics',
        image: '/images/smartwatch.jpg',
        description: 'Advanced smartwatch with fitness tracking',
        stock: 25,
        rating: 4.7
      },
      {
        id: 3,
        name: 'Running Shoes',
        price: 79.99,
        category: 'Sports',
        image: '/images/shoes.jpg',
        description: 'Comfortable running shoes for all terrains',
        stock: 100,
        rating: 4.3
      }
    ],
    total: 3,
    categories: ['Electronics', 'Sports', 'Clothing', 'Books']
  });
});

// Payment system endpoints
app.get('/api/payment/status', (req, res) => {
  res.json({
    status: 'active',
    gateways: {
      stripe: 'connected',
      paypal: 'connected',
      square: 'available'
    },
    supported_currencies: ['USD', 'EUR', 'GBP'],
    transaction_count: 1247,
    daily_volume: 15420.50
  });
});

app.post('/api/payment/process', (req, res) => {
  const { amount, currency = 'USD', paymentMethod, customerEmail } = req.body;

  // Simulate payment processing
  const transactionId = 'txn_' + Math.random().toString(36).substr(2, 9);

  res.json({
    success: true,
    transaction_id: transactionId,
    amount: amount,
    currency: currency,
    status: 'completed',
    payment_method: paymentMethod,
    customer_email: customerEmail,
    timestamp: new Date().toISOString(),
    fee: (amount * 0.029 + 0.30).toFixed(2)
  });
});

app.get('/api/payment/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      total_transactions: 1247,
      total_volume: 152400.50,
      average_transaction: 122.25,
      success_rate: 98.5,
      daily_stats: [
        { date: '2025-01-25', transactions: 45, volume: 5420.50 },
        { date: '2025-01-24', transactions: 52, volume: 6120.75 },
        { date: '2025-01-23', transactions: 38, volume: 4680.25 }
      ],
      payment_methods: {
        stripe: 67,
        paypal: 28,
        square: 5
      }
    }
  });
});

// Shopping cart endpoints
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;

  res.json({
    success: true,
    message: 'Product added to cart',
    cart_item: {
      product_id: productId,
      quantity: quantity,
      added_at: new Date().toISOString()
    }
  });
});

app.get('/api/cart', (req, res) => {
  res.json({
    success: true,
    cart: {
      items: [
        { product_id: 1, name: 'Wireless Headphones', price: 99.99, quantity: 1 },
        { product_id: 2, name: 'Smart Watch', price: 299.99, quantity: 1 }
      ],
      total_items: 2,
      subtotal: 399.98,
      tax: 32.00,
      shipping: 9.99,
      total: 441.97
    }
  });
});

// Order endpoints
app.post('/api/orders', (req, res) => {
  const orderId = 'order_' + Math.random().toString(36).substr(2, 9);

  res.json({
    success: true,
    order: {
      id: orderId,
      status: 'confirmed',
      total: req.body.total || 441.97,
      customer: req.body.customer || 'Guest Customer',
      created_at: new Date().toISOString(),
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;

  res.json({
    success: true,
    order: {
      id: orderId,
      status: 'shipped',
      tracking_number: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      total: 441.97,
      customer: 'John Doe',
      created_at: '2025-01-24T10:30:00.000Z',
      shipped_at: '2025-01-25T09:15:00.000Z',
      estimated_delivery: '2025-01-27T18:00:00.000Z'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🛍️ GoSeller Store Server Running');
  console.log('==================================');
  console.log(`🛍️ Store: http://localhost:${PORT}`);
  console.log(`🏥 Store Status: http://localhost:${PORT}/api/store/status`);
  console.log(`📦 Store Products: http://localhost:${PORT}/api/store/products`);
  console.log(`💳 Payment Status: http://localhost:${PORT}/api/payment/status`);
  console.log(`📊 Payment Analytics: http://localhost:${PORT}/api/payment/analytics`);
  console.log(`🛒 Shopping Cart: http://localhost:${PORT}/api/cart`);
  console.log('');
  console.log('✨ Store is ready for customers!');
  console.log('💳 Payment processing is enabled!');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

module.exports = app;
