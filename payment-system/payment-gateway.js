const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Simulated payment processing
class PaymentGateway {
  constructor() {
    this.transactions = [];
    this.paymentMethods = {
      'stripe': {
        name: 'Stripe',
        supported: ['card', 'bank_transfer'],
        processingFee: 0.029, // 2.9%
        fixedFee: 0.30 // $0.30
      },
      'paypal': {
        name: 'PayPal',
        supported: ['paypal', 'card'],
        processingFee: 0.029,
        fixedFee: 0.30
      },
      'square': {
        name: 'Square',
        supported: ['card', 'contactless'],
        processingFee: 0.026,
        fixedFee: 0.10
      }
    };
  }

  // Process payment
  async processPayment(paymentData) {
    const {
      amount,
      currency = 'USD',
      paymentMethod,
      gateway = 'stripe',
      customerEmail,
      orderId,
      description
    } = paymentData;

    // Validate payment data
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!paymentMethod) {
      throw new Error('Payment method required');
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate transaction ID
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Calculate fees
    const gatewayConfig = this.paymentMethods[gateway];
    const processingFee = (amount * gatewayConfig.processingFee) + gatewayConfig.fixedFee;
    const netAmount = amount - processingFee;

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    const transaction = {
      id: transactionId,
      amount: amount,
      currency: currency,
      paymentMethod: paymentMethod,
      gateway: gateway,
      customerEmail: customerEmail,
      orderId: orderId,
      description: description,
      processingFee: processingFee,
      netAmount: netAmount,
      status: isSuccess ? 'succeeded' : 'failed',
      timestamp: new Date().toISOString(),
      gatewayResponse: isSuccess ? {
        chargeId: `ch_${transactionId}`,
        balanceTransaction: `txn_${transactionId}`,
        receiptUrl: `https://receipt.stripe.com/${transactionId}`
      } : {
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined.'
        }
      }
    };

    this.transactions.push(transaction);

    return {
      success: isSuccess,
      transaction: transaction,
      message: isSuccess ? 'Payment processed successfully' : 'Payment failed'
    };
  }

  // Get transaction history
  getTransactions(filters = {}) {
    let filtered = [...this.transactions];

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.gateway) {
      filtered = filtered.filter(t => t.gateway === filters.gateway);
    }

    if (filters.customerEmail) {
      filtered = filtered.filter(t => t.customerEmail === filters.customerEmail);
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get payment analytics
  getAnalytics() {
    const totalTransactions = this.transactions.length;
    const successfulTransactions = this.transactions.filter(t => t.status === 'succeeded');
    const failedTransactions = this.transactions.filter(t => t.status === 'failed');

    const totalAmount = successfulTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = successfulTransactions.reduce((sum, t) => sum + t.processingFee, 0);
    const netRevenue = successfulTransactions.reduce((sum, t) => sum + t.netAmount, 0);

    const gatewayStats = {};
    this.transactions.forEach(t => {
      if (!gatewayStats[t.gateway]) {
        gatewayStats[t.gateway] = {
          total: 0,
          successful: 0,
          failed: 0,
          amount: 0
        };
      }
      gatewayStats[t.gateway].total++;
      gatewayStats[t.gateway][t.status]++;
      if (t.status === 'succeeded') {
        gatewayStats[t.gateway].amount += t.amount;
      }
    });

    return {
      totalTransactions,
      successfulTransactions: successfulTransactions.length,
      failedTransactions: failedTransactions.length,
      successRate: totalTransactions > 0 ? (successfulTransactions.length / totalTransactions * 100).toFixed(2) : 0,
      totalAmount: totalAmount.toFixed(2),
      totalFees: totalFees.toFixed(2),
      netRevenue: netRevenue.toFixed(2),
      gatewayStats,
      averageTransactionValue: successfulTransactions.length > 0 ? (totalAmount / successfulTransactions.length).toFixed(2) : 0
    };
  }

  // Refund transaction
  async refundTransaction(transactionId, amount = null) {
    const transaction = this.transactions.find(t => t.id === transactionId);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'succeeded') {
      throw new Error('Cannot refund failed transaction');
    }

    const refundAmount = amount || transaction.amount;
    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const refund = {
      id: refundId,
      originalTransactionId: transactionId,
      amount: refundAmount,
      currency: transaction.currency,
      status: 'succeeded',
      timestamp: new Date().toISOString(),
      reason: 'Customer request'
    };

    // Add refund to transaction
    if (!transaction.refunds) {
      transaction.refunds = [];
    }
    transaction.refunds.push(refund);

    return {
      success: true,
      refund: refund,
      message: 'Refund processed successfully'
    };
  }
}

const paymentGateway = new PaymentGateway();

// API Routes
app.get('/api/payment/status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Payment Gateway is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    supportedGateways: Object.keys(paymentGateway.paymentMethods)
  });
});

// Process payment
app.post('/api/payment/process', async (req, res) => {
  try {
    const result = await paymentGateway.processPayment(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get transaction history
app.get('/api/payment/transactions', (req, res) => {
  const filters = {
    status: req.query.status,
    gateway: req.query.gateway,
    customerEmail: req.query.customerEmail
  };

  const transactions = paymentGateway.getTransactions(filters);
  res.json({
    success: true,
    data: transactions,
    count: transactions.length
  });
});

// Get payment analytics
app.get('/api/payment/analytics', (req, res) => {
  const analytics = paymentGateway.getAnalytics();
  res.json({
    success: true,
    data: analytics
  });
});

// Refund transaction
app.post('/api/payment/refund/:transactionId', async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await paymentGateway.refundTransaction(req.params.transactionId, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Get supported payment methods
app.get('/api/payment/methods', (req, res) => {
  res.json({
    success: true,
    data: paymentGateway.paymentMethods
  });
});

// Health check
app.get('/api/payment/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('💳 Payment Gateway Server Running');
  console.log('==================================');
  console.log(`💳 Payment Gateway: http://localhost:${PORT}`);
  console.log(`🏥 Payment Status: http://localhost:${PORT}/api/payment/status`);
  console.log(`📊 Payment Analytics: http://localhost:${PORT}/api/payment/analytics`);
  console.log(`💳 Process Payment: POST http://localhost:${PORT}/api/payment/process`);
  console.log('');
  console.log('✨ Payment Gateway is ready!');
  console.log('');
  console.log('Supported Gateways:');
  Object.keys(paymentGateway.paymentMethods).forEach(gateway => {
    console.log(`  - ${gateway}: ${paymentGateway.paymentMethods[gateway].name}`);
  });
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});
