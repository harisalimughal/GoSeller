// MongoDB Service Layer for Admin Panel
// This file contains all MongoDB operations for the admin panel

export interface MongoDBConfig {
  uri: string
  database: string
}

export class MongoDBService {
  private config: MongoDBConfig

  constructor(config: MongoDBConfig) {
    this.config = config
  }

  // Generic database operation
  private async executeQuery<T>(collection: string, operation: string, data?: any): Promise<T> {
    try {
      const response = await fetch(`http://localhost:3001/api/mongodb/${collection}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operation,
          data,
          database: this.config.database
        })
      })

      if (!response.ok) {
        throw new Error(`MongoDB operation failed: ${response.statusText}`)
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('MongoDB operation error:', error)
      throw error
    }
  }

  // Verification Operations
  async getVerifications() {
    return this.executeQuery('verifications', 'find', {})
  }

  async getVerificationById(id: string) {
    return this.executeQuery('verifications', 'findOne', { _id: id })
  }

  async updateVerificationStatus(id: string, status: string, reviewerNotes?: string) {
    return this.executeQuery('verifications', 'updateOne', {
      _id: id,
      update: {
        status,
        reviewerNotes,
        reviewedAt: new Date().toISOString()
      }
    })
  }

  async createVerification(verification: any) {
    return this.executeQuery('verifications', 'insertOne', verification)
  }

  // Product Operations
  async getProducts() {
    return this.executeQuery('products', 'find', {})
  }

  async getProductById(id: string) {
    return this.executeQuery('products', 'findOne', { _id: id })
  }

  async createProduct(product: any) {
    return this.executeQuery('products', 'insertOne', {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async updateProduct(id: string, updates: any) {
    return this.executeQuery('products', 'updateOne', {
      _id: id,
      update: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    })
  }

  async deleteProduct(id: string) {
    return this.executeQuery('products', 'deleteOne', { _id: id })
  }

  // Payment Operations
  async getPayments() {
    return this.executeQuery('payments', 'find', {})
  }

  async getPaymentById(id: string) {
    return this.executeQuery('payments', 'findOne', { _id: id })
  }

  async createPayment(payment: any) {
    return this.executeQuery('payments', 'insertOne', {
      ...payment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  async updatePaymentStatus(id: string, status: string) {
    return this.executeQuery('payments', 'updateOne', {
      _id: id,
      update: {
        status,
        updatedAt: new Date().toISOString()
      }
    })
  }

  // Analytics Operations
  async getDashboardStats() {
    const [products, payments, verifications] = await Promise.all([
      this.getProducts(),
      this.getPayments(),
      this.getVerifications()
    ])

    const totalSales = payments
      .filter((p: any) => p.status === 'completed')
      .reduce((sum: number, p: any) => sum + p.amount, 0)

    const totalOrders = payments.length
    const totalCustomers = new Set(payments.map((p: any) => p.customerId)).size
    const totalProducts = products.length

    return {
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts
    }
  }

  async getRecentOrders(limit = 5) {
    return this.executeQuery('payments', 'find', {}, { sort: { createdAt: -1 }, limit })
  }
}

// Default MongoDB configuration
export const defaultMongoConfig: MongoDBConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  database: process.env.MONGODB_DATABASE || 'goseller_admin'
}

// Create default service instance
export const mongoService = new MongoDBService(defaultMongoConfig)
