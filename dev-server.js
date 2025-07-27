const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve a simple HTML page for Goseller
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
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .container {
                text-align: center;
                max-width: 800px;
                padding: 2rem;
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
            }

            .buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
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

            .features {
                margin-top: 3rem;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                text-align: left;
            }

            .feature {
                background: rgba(255,255,255,0.1);
                padding: 1.5rem;
                border-radius: 12px;
                backdrop-filter: blur(10px);
            }

            .feature h3 {
                margin-bottom: 0.5rem;
                font-size: 1.2rem;
            }

            .status {
                position: fixed;
                top: 1rem;
                right: 1rem;
                background: #4CAF50;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.9rem;
            }

            @media (max-width: 768px) {
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
            }
        </style>
    </head>
    <body>
        <div class="status">🚀 Running</div>

        <div class="container">
            <div class="logo">🛒 Goseller</div>
            <div class="tagline">E-commerce Seller Management Platform</div>
            <div class="description">
                The complete e-commerce platform for modern sellers. Manage your products,
                process orders, and grow your business with powerful tools and analytics.
            </div>

            <div class="buttons">
                <a href="/frontend" class="btn btn-primary">Launch Frontend</a>
                <a href="/api" class="btn btn-secondary">View API</a>
                <a href="/admin" class="btn btn-secondary">Admin Panel</a>
            </div>

            <div class="features">
                <div class="feature">
                    <h3>📦 Product Management</h3>
                    <p>Manage your product catalog with variants, categories, and inventory tracking.</p>
                </div>
                <div class="feature">
                    <h3>🛒 Order Processing</h3>
                    <p>Process orders efficiently with automated workflows and status tracking.</p>
                </div>
                <div class="feature">
                    <h3>📊 Analytics & Reports</h3>
                    <p>Get insights into your sales, customers, and performance with detailed analytics.</p>
                </div>
                <div class="feature">
                    <h3>👥 Customer Management</h3>
                    <p>Build relationships with your customers through personalized experiences.</p>
                </div>
                <div class="feature">
                    <h3>💳 Payment Processing</h3>
                    <p>Accept payments securely with multiple payment gateways and fraud protection.</p>
                </div>
                <div class="feature">
                    <h3>🔒 Secure & Reliable</h3>
                    <p>Enterprise-grade security with 99.9% uptime and 24/7 support.</p>
                </div>
            </div>
        </div>

        <script>
            // Auto-refresh status
            setInterval(() => {
                fetch('/api/health')
                    .then(response => response.json())
                    .then(data => {
                        document.querySelector('.status').textContent = '🚀 Running';
                    })
                    .catch(() => {
                        document.querySelector('.status').textContent = '⚠️ Connecting...';
                    });
            }, 5000);
        </script>
    </body>
    </html>
  `);
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Goseller API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      frontend: 'http://localhost:3000',
      backend: 'http://localhost:3001',
      admin: 'http://localhost:3002'
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
    ]
  });
});

// Proxy routes to different services
app.get('/frontend', (req, res) => {
  res.redirect('http://localhost:3000');
});

app.get('/api/*', (req, res) => {
  res.redirect(`http://localhost:3001${req.url}`);
});

app.get('/admin', (req, res) => {
  res.redirect('http://localhost:3002');
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Goseller Development Server');
  console.log('================================');
  console.log(`🏪 Main URL: http://localhost:${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔧 Backend API: http://localhost:3001`);
  console.log(`⚙️ Admin Panel: http://localhost:3002`);
  console.log('');
  console.log('✨ Goseller is ready to serve!');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Start frontend development server
console.log('📦 Starting frontend development server...');
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Start backend development server
console.log('🔧 Starting backend development server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Goseller servers...');
  frontend.kill();
  backend.kill();
  process.exit();
});
