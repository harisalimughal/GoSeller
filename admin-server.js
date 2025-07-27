const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin panel homepage
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GoSeller Admin Panel</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
            .stat-card { background: rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 10px; backdrop-filter: blur(10px); }
            .stat-number { font-size: 2rem; font-weight: bold; color: #4CAF50; }
            .stat-label { margin-top: 0.5rem; opacity: 0.8; }
            .nav-buttons { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; justify-content: center; }
            .btn { padding: 0.8rem 1.5rem; background: rgba(255,255,255,0.2); color: white; text-decoration: none; border-radius: 5px; transition: all 0.3s; }
            .btn:hover { background: rgba(255,255,255,0.3); transform: translateY(-2px); }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>⚙️ GoSeller Admin Panel</h1>
            <p class="subtitle">Complete administration dashboard for your e-commerce platform</p>

            <div class="stats">
                <div class="stat-card">
                    <div class="stat-number">156</div>
                    <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">89</div>
                    <div class="stat-label">Customers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">42</div>
                    <div class="stat-label">Products</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$15,420</div>
                    <div class="stat-label">Revenue</div>
                </div>
            </div>

            <div class="nav-buttons">
                <a href="/api/admin/status" class="btn">🏥 Status</a>
                <a href="/api/admin/dashboard" class="btn">📊 Dashboard</a>
                <a href="/api/admin/products" class="btn">📦 Products</a>
                <a href="/api/admin/orders" class="btn">📋 Orders</a>
                <a href="/api/admin/customers" class="btn">👥 Customers</a>
                <a href="/api/admin/analytics" class="btn">📈 Analytics</a>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Admin API routes
app.get('/api/admin/status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'GoSeller Admin Panel is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: PORT,
    services: {
      database: 'connected',
      cache: 'active',
      notifications: 'enabled'
    }
  });
});

app.get('/api/admin/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      totalSales: 15420,
      totalOrders: 156,
      totalCustomers: 89,
      totalProducts: 42,
      monthlyGrowth: 12.5,
      todayOrders: 8,
      pendingOrders: 12,
      completedOrders: 144
    }
  });
});

app.get('/api/admin/products', (req, res) => {
  res.json({
    success: true,
    products: [
      { id: 1, name: 'Wireless Headphones', price: 99.99, stock: 50, status: 'active' },
      { id: 2, name: 'Smart Watch', price: 299.99, stock: 25, status: 'active' },
      { id: 3, name: 'Laptop Stand', price: 49.99, stock: 0, status: 'out_of_stock' }
    ]
  });
});

app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    orders: [
      { id: 1, customer: 'John Doe', total: 99.99, status: 'completed', date: '2025-01-25' },
      { id: 2, customer: 'Jane Smith', total: 299.99, status: 'pending', date: '2025-01-25' },
      { id: 3, customer: 'Bob Johnson', total: 149.99, status: 'shipped', date: '2025-01-24' }
    ]
  });
});

app.get('/api/admin/customers', (req, res) => {
  res.json({
    success: true,
    customers: [
      { id: 1, name: 'John Doe', email: 'john@example.com', orders: 5, total_spent: 450.99 },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', orders: 3, total_spent: 299.99 },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', orders: 7, total_spent: 780.50 }
    ]
  });
});

app.get('/api/admin/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      sales_by_month: [
        { month: 'Jan', sales: 4000 },
        { month: 'Feb', sales: 3000 },
        { month: 'Mar', sales: 5000 },
        { month: 'Apr', sales: 4500 },
        { month: 'May', sales: 6000 }
      ],
      top_products: [
        { name: 'Wireless Headphones', sales: 120 },
        { name: 'Smart Watch', sales: 98 },
        { name: 'Laptop Stand', sales: 76 }
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('⚙️ GoSeller Admin Panel Server Running');
  console.log('======================================');
  console.log(`⚙️ Admin Panel: http://localhost:${PORT}`);
  console.log(`🏥 Admin Status: http://localhost:${PORT}/api/admin/status`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/api/admin/dashboard`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/admin/products`);
  console.log(`📋 Orders API: http://localhost:${PORT}/api/admin/orders`);
  console.log(`👥 Customers API: http://localhost:${PORT}/api/admin/customers`);
  console.log(`📈 Analytics API: http://localhost:${PORT}/api/admin/analytics`);
  console.log('');
  console.log('✨ Admin Panel is ready!');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

module.exports = app;
