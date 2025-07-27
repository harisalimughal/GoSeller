import express from 'express'
import cors from 'cors'
import path from 'path'
import { config } from 'dotenv'

// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../../frontend/dist')))

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Goseller API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

app.get('/api/goseller', (req, res) => {
  res.json({
    name: 'Goseller',
    description: 'E-commerce Seller Management Platform',
    version: '1.0.0',
    status: 'active',
    features: [
      'Product Management',
      'Order Processing',
      'Customer Management',
      'Analytics & Reporting',
      'Payment Processing',
      'Inventory Management'
    ]
  })
})

// Serve the React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'))
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Goseller server running on port ${PORT}`)
  console.log(`📱 Frontend: http://localhost:${PORT}`)
  console.log(`🔧 API: http://localhost:${PORT}/api`)
  console.log(`🏪 Goseller URL: http://localhost:${PORT}/goseller`)
  console.log('')
  console.log('✨ Goseller is ready to serve!')
})
