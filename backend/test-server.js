const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'GoSellr Backend Server is running!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5002
  });
});

// Test seller registration endpoint
app.post('/api/seller/register', (req, res) => {
  res.json({
    status: 'success',
    message: 'Seller registration endpoint is working!',
    data: req.body
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/seller/register`);
});
