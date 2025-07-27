const express = require('express');
const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static('public'));

// Middleware for JSON parsing
app.use(express.json());

// Goseller homepage with API integration
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Goseller - E-commerce Platform</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
            }

            .header {
                background: rgba(0,0,0,0.1);
                padding: 1rem 2rem;
                backdrop-filter: blur(10px);
                position: sticky;
                top: 0;
                z-index: 100;
            }

            .nav {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
            }

            .nav-logo {
                font-size: 1.5rem;
                font-weight: bold;
            }

            .nav-links {
                display: flex;
                gap: 2rem;
            }

            .nav-link {
                color: white;
                text-decoration: none;
                padding: 0.5rem 1rem;
                border-radius: 6px;
                transition: all 0.3s ease;
            }

            .nav-link:hover {
                background: rgba(255,255,255,0.2);
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
            }

            .hero {
                text-align: center;
                padding: 4rem 0;
            }

            .logo {
                font-size: 4rem;
                font-weight: bold;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }

            .tagline {
                font-size: 1.5rem;
                margin-bottom: 2rem;
                opacity: 0.9;
            }

            .description {
                font-size: 1.1rem;
                margin-bottom: 3rem;
                opacity: 0.8;
                line-height: 1.6;
                max-width: 800px;
                margin-left: auto;
                margin-right: auto;
            }

            .buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-bottom: 4rem;
            }

            .btn {
                padding: 1rem 2rem;
                border: none;
                border-radius: 8px;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                display: inline-block;
            }

            .btn-primary {
                background: #4CAF50;
                color: white;
            }

            .btn-primary:hover {
                background: #45a049;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
            }

            .btn-secondary {
                background: rgba(255,255,255,0.2);
                color: white;
                border: 2px solid white;
            }

            .btn-secondary:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }

            .status-section {
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 3rem;
                backdrop-filter: blur(10px);
            }

            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .status-item {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 8px;
                text-align: center;
            }

            .status-item.online {
                border-left: 4px solid #4CAF50;
            }

            .status-item.offline {
                border-left: 4px solid #f44336;
            }

            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }

            .feature {
                background: rgba(255,255,255,0.1);
                padding: 2rem;
                border-radius: 12px;
                backdrop-filter: blur(10px);
                transition: transform 0.3s ease;
            }

            .feature:hover {
                transform: translateY(-5px);
            }

            .feature h3 {
                margin-bottom: 1rem;
                font-size: 1.3rem;
                color: #4CAF50;
            }

            .api-section {
                background: rgba(0,0,0,0.2);
                border-radius: 12px;
                padding: 2rem;
                margin-bottom: 3rem;
            }

            .api-endpoints {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .api-endpoint {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 8px;
                font-family: monospace;
                font-size: 0.9rem;
            }

            .footer {
                text-align: center;
                padding: 2rem;
                background: rgba(0,0,0,0.2);
                margin-top: 4rem;
            }

            .loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: #fff;
                animation: spin 1s ease-in-out infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .nav-links {
                    display: none;
                }

                .logo {
                    font-size: 2.5rem;
                }

                .tagline {
                    font-size: 1.2rem;
                }

                .buttons {
                    flex-direction: column;
                    align-items: center;
                }

                .features {
                    grid-template-columns: 1fr;
                }

                .status-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <nav class="nav">
                <div class="nav-logo">🛒 Goseller</div>
                <div class="nav-links">
                    <a href="#home" class="nav-link">Home</a>
                    <a href="#features" class="nav-link">Features</a>
                    <a href="#api" class="nav-link">API</a>
                    <a href="#status" class="nav-link">Status</a>
                </div>
            </nav>
        </div>

        <div class="container">
            <section id="home" class="hero">
                <div class="logo">🛒 Goseller</div>
                <div class="tagline">E-commerce Seller Management Platform</div>
                <div class="description">
                    The complete e-commerce platform for modern sellers. Manage your products,
                    process orders, and grow your business with powerful tools and analytics.
                    Built with cutting-edge technology for maximum performance and reliability.
                </div>

                <div class="buttons">
                    <a href="http://localhost:3004" target="_blank" class="btn btn-primary">🛍️ Launch Store</a>
                    <a href="http://localhost:3002" target="_blank" class="btn btn-secondary">⚙️ Admin Panel</a>
                    <a href="http://localhost:3001" target="_blank" class="btn btn-secondary">🔧 Backend API</a>
                    <button onclick="checkAllServices()" class="btn btn-primary">🔄 Check Status</button>
                </div>
            </section>

            <section id="status" class="status-section">
                <h2>🚀 System Status</h2>
                <div class="status-grid" id="statusGrid">
                    <div class="status-item" id="mainStatus">
                        <h4>Main Server</h4>
                        <p>Port 8080</p>
                        <div class="loading"></div>
                    </div>
                    <div class="status-item" id="backendStatus">
                        <h4>Backend API</h4>
                        <p>Port 3001</p>
                        <div class="loading"></div>
                    </div>
                    <div class="status-item" id="adminStatus">
                        <h4>Admin Panel</h4>
                        <p>Port 3002</p>
                        <div class="loading"></div>
                    </div>
                    <div class="status-item" id="storeStatus">
                        <h4>Customer Store</h4>
                        <p>Port 3004</p>
                        <div class="loading"></div>
                    </div>
                </div>
            </section>

            <section id="features" class="features">
                <div class="feature">
                    <h3>📦 Product Management</h3>
                    <p>Manage your product catalog with variants, categories, and inventory tracking. Add, edit, and organize products efficiently.</p>
                </div>
                <div class="feature">
                    <h3>🛒 Order Processing</h3>
                    <p>Process orders efficiently with automated workflows and status tracking. Real-time order updates and notifications.</p>
                </div>
                <div class="feature">
                    <h3>📊 Analytics & Reports</h3>
                    <p>Get insights into your sales, customers, and performance with detailed analytics and customizable reports.</p>
                </div>
                <div class="feature">
                    <h3>👥 Customer Management</h3>
                    <p>Build relationships with your customers through personalized experiences and comprehensive customer profiles.</p>
                </div>
                <div class="feature">
                    <h3>💳 Payment Processing</h3>
                    <p>Accept payments securely with multiple payment gateways and advanced fraud protection systems.</p>
                </div>
                <div class="feature">
                    <h3>🔒 Secure & Reliable</h3>
                    <p>Enterprise-grade security with 99.9% uptime and 24/7 support. Your data is safe with us.</p>
                </div>
            </section>

            <section id="api" class="api-section">
                <h2>🔧 API Endpoints</h2>
                <div class="api-endpoints">
                    <div class="api-endpoint">
                        <strong>Health Check:</strong><br>
                        GET /api/health
                    </div>
                    <div class="api-endpoint">
                        <strong>Goseller Info:</strong><br>
                        GET /api/goseller
                    </div>
                    <div class="api-endpoint">
                        <strong>Products:</strong><br>
                        GET /api/products
                    </div>
                    <div class="api-endpoint">
                        <strong>Orders:</strong><br>
                        GET /api/orders
                    </div>
                </div>
            </section>
        </div>

        <footer class="footer">
            <p>&copy; 2025 Goseller - E-commerce Platform. All rights reserved.</p>
        </footer>

        <script>
            // Check service status on page load
            document.addEventListener('DOMContentLoaded', function() {
                checkAllServices();
                // Auto-refresh status every 30 seconds
                setInterval(checkAllServices, 30000);
            });

            async function checkAllServices() {
                const services = [
                    { name: 'mainStatus', url: 'http://localhost:8080/api/health', port: 8080 },
                    { name: 'backendStatus', url: 'http://localhost:3001/api/health', port: 3001 },
                    { name: 'adminStatus', url: 'http://localhost:3002/api/status', port: 3002 },
                    { name: 'storeStatus', url: 'http://localhost:3004/api/status', port: 3004 }
                ];

                for (const service of services) {
                    await checkService(service);
                }
            }

            async function checkService(service) {
                const element = document.getElementById(service.name);
                const loadingDiv = element.querySelector('.loading');

                try {
                    const response = await fetch(service.url, {
                        method: 'GET',
                        mode: 'no-cors'
                    });

                    element.className = 'status-item online';
                    loadingDiv.innerHTML = '✅ Online';
                    element.style.borderLeftColor = '#4CAF50';
                } catch (error) {
                    try {
                        const testResponse = await fetch('http://localhost:' + service.port, {
                            method: 'GET',
                            mode: 'no-cors'
                        });
                        element.className = 'status-item online';
                        loadingDiv.innerHTML = '✅ Online';
                        element.style.borderLeftColor = '#4CAF50';
                    } catch (altError) {
                        element.className = 'status-item offline';
                        loadingDiv.innerHTML = '❌ Offline';
                        element.style.borderLeftColor = '#f44336';
                    }
                }
            }

            // Smooth scrolling for navigation
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        </script>
    </body>
    </html>
  `);
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Goseller API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    url: 'http://localhost:8080',
    services: {
      main: 'http://localhost:8080',
      backend: 'http://localhost:3001',
      admin: 'http://localhost:3002',
      store: 'http://localhost:3004'
    }
  });
});

app.get('/api/goseller', (req, res) => {
  res.json({
    name: 'Goseller',
    description: 'E-commerce Seller Management Platform',
    version: '1.0.0',
    status: 'active',
    url: 'http://localhost:8080',
    features: [
      'Product Management',
      'Order Processing',
      'Customer Management',
      'Analytics & Reporting',
      'Payment Processing',
      'Inventory Management'
    ],
    endpoints: {
      health: '/api/health',
      info: '/api/goseller',
      products: '/api/products',
      orders: '/api/orders'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Goseller Server Running');
  console.log('================================');
  console.log(`🏪 Goseller URL: http://localhost:${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📊 Goseller API: http://localhost:${PORT}/api/goseller`);
  console.log('');
  console.log('✨ Goseller is ready to serve!');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});
