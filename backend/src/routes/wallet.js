const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// WALLET MANAGEMENT
// ========================================

// Get wallet balance
router.get('/balance/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Mock wallet balance (in real app, fetch from database)
  const wallet = {
    userId: userId,
    balance: 1250.75,
    currency: 'USD',
    lastUpdated: new Date(),
    transactions: [
      {
        id: 'txn_1',
        type: 'credit',
        amount: 500.00,
        description: 'Order payment received',
        createdAt: new Date(Date.now() - 86400000)
      },
      {
        id: 'txn_2',
        type: 'debit',
        amount: 250.25,
        description: 'Withdrawal to bank account',
        createdAt: new Date(Date.now() - 172800000)
      }
    ]
  };

  res.json(new ApiResponse(200, 'Wallet balance retrieved successfully', {
    wallet
  }));
}));

// Add funds to wallet
router.post('/add-funds', [
  body('userId').isString().withMessage('User ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('paymentMethod').isString().withMessage('Payment method is required'),
  body('description').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userId, amount, paymentMethod, description } = req.body;

  // Mock transaction (in real app, create in database)
  const transaction = {
    id: `txn_${Date.now()}`,
    userId: userId,
    type: 'credit',
    amount: parseFloat(amount),
    paymentMethod: paymentMethod,
    description: description || 'Wallet top-up',
    status: 'completed',
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Funds added to wallet successfully', {
    transaction
  }));
}));

// Withdraw funds from wallet
router.post('/withdraw', [
  body('userId').isString().withMessage('User ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('bankAccount').isString().withMessage('Bank account details are required'),
  body('reason').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userId, amount, bankAccount, reason } = req.body;

  // Check if user has sufficient balance
  const currentBalance = 1250.75; // Mock balance
  if (parseFloat(amount) > currentBalance) {
    throw new ApiError(400, 'Insufficient balance for withdrawal');
  }

  // Mock withdrawal transaction (in real app, create in database)
  const transaction = {
    id: `txn_${Date.now()}`,
    userId: userId,
    type: 'debit',
    amount: parseFloat(amount),
    bankAccount: bankAccount,
    description: reason || 'Withdrawal to bank account',
    status: 'pending',
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Withdrawal request created successfully', {
    transaction
  }));
}));

// Get transaction history
router.get('/transactions/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, type, status } = req.query;

  // Mock transactions (in real app, fetch from database)
  const transactions = [
    {
      id: 'txn_1',
      userId: userId,
      type: 'credit',
      amount: 500.00,
      description: 'Order payment received',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      id: 'txn_2',
      userId: userId,
      type: 'debit',
      amount: 250.25,
      description: 'Withdrawal to bank account',
      status: 'completed',
      createdAt: new Date(Date.now() - 172800000)
    },
    {
      id: 'txn_3',
      userId: userId,
      type: 'credit',
      amount: 750.50,
      description: 'Refund from cancelled order',
      status: 'completed',
      createdAt: new Date(Date.now() - 259200000)
    }
  ];

  // Filter transactions
  let filteredTransactions = transactions;
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }
  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'Transaction history retrieved successfully', {
    transactions: paginatedTransactions,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredTransactions.length / limit),
      total: filteredTransactions.length
    }
  }));
}));

// Get transaction by ID
router.get('/transactions/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock transaction (in real app, fetch from database)
  const transaction = {
    id: id,
    userId: 'user_123',
    type: 'credit',
    amount: 500.00,
    description: 'Order payment received',
    status: 'completed',
    paymentMethod: 'stripe',
    createdAt: new Date(Date.now() - 86400000),
    details: {
      orderId: 'order_123',
      paymentId: 'pay_456',
      fee: 15.00,
      netAmount: 485.00
    }
  };

  res.json(new ApiResponse(200, 'Transaction retrieved successfully', {
    transaction
  }));
}));

// ========================================
// WALLET SETTINGS
// ========================================

// Get wallet settings
router.get('/settings/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;

  // Mock wallet settings (in real app, fetch from database)
  const settings = {
    userId: userId,
    autoRecharge: {
      enabled: false,
      threshold: 100,
      amount: 500
    },
    notifications: {
      lowBalance: true,
      transactionComplete: true,
      withdrawalComplete: true
    },
    security: {
      requirePin: true,
      maxWithdrawal: 1000,
      dailyLimit: 5000
    },
    bankAccounts: [
      {
        id: 'bank_1',
        accountNumber: '****1234',
        bankName: 'Chase Bank',
        isDefault: true
      }
    ]
  };

  res.json(new ApiResponse(200, 'Wallet settings retrieved successfully', {
    settings
  }));
}));

// Update wallet settings
router.put('/settings/:userId', [
  body('autoRecharge').optional().isObject(),
  body('notifications').optional().isObject(),
  body('security').optional().isObject()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userId } = req.params;
  const { autoRecharge, notifications, security } = req.body;

  // Mock update (in real app, update in database)
  const settings = {
    userId: userId,
    autoRecharge: autoRecharge || { enabled: false, threshold: 100, amount: 500 },
    notifications: notifications || { lowBalance: true, transactionComplete: true, withdrawalComplete: true },
    security: security || { requirePin: true, maxWithdrawal: 1000, dailyLimit: 5000 },
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Wallet settings updated successfully', {
    settings
  }));
}));

// Add bank account
router.post('/bank-accounts', [
  body('userId').isString().withMessage('User ID is required'),
  body('accountNumber').isString().withMessage('Account number is required'),
  body('bankName').isString().withMessage('Bank name is required'),
  body('routingNumber').isString().withMessage('Routing number is required'),
  body('accountHolderName').isString().withMessage('Account holder name is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userId, accountNumber, bankName, routingNumber, accountHolderName } = req.body;

  // Mock bank account (in real app, create in database)
  const bankAccount = {
    id: `bank_${Date.now()}`,
    userId: userId,
    accountNumber: `****${accountNumber.slice(-4)}`,
    bankName: bankName,
    routingNumber: routingNumber,
    accountHolderName: accountHolderName,
    isDefault: false,
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Bank account added successfully', {
    bankAccount
  }));
}));

// ========================================
// WALLET ANALYTICS
// ========================================

// Get wallet analytics
router.get('/analytics/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { period = '30d' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Mock analytics (in real app, calculate from database)
  const analytics = {
    period,
    overview: {
      totalCredits: 2500.00,
      totalDebits: 1250.25,
      netChange: 1249.75,
      currentBalance: 1250.75
    },
    transactions: {
      total: 15,
      credits: 8,
      debits: 7,
      averageAmount: 166.65
    },
    topSources: [
      { source: 'Order payments', amount: 1500.00, count: 6 },
      { source: 'Refunds', amount: 750.50, count: 2 },
      { source: 'Manual top-up', amount: 249.50, count: 1 }
    ],
    spendingByCategory: [
      { category: 'Withdrawals', amount: 1000.00 },
      { category: 'Fees', amount: 250.25 }
    ]
  };

  res.json(new ApiResponse(200, 'Wallet analytics retrieved successfully', {
    analytics
  }));
}));

// ========================================
// WALLET SECURITY
// ========================================

// Set wallet PIN
router.post('/pin', [
  body('userId').isString().withMessage('User ID is required'),
  body('pin').isLength({ min: 4, max: 6 }).withMessage('PIN must be 4-6 digits'),
  body('confirmPin').isLength({ min: 4, max: 6 }).withMessage('Confirm PIN is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userId, pin, confirmPin } = req.body;

  if (pin !== confirmPin) {
    throw new ApiError(400, 'PINs do not match');
  }

  // Mock PIN update (in real app, update in database)
  const result = {
    userId: userId,
    pinSet: true,
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Wallet PIN set successfully', {
    result
  }));
}));

// Verify wallet PIN
router.post('/verify-pin', [
  body('userId').isString().withMessage('User ID is required'),
  body('pin').isLength({ min: 4, max: 6 }).withMessage('PIN is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userId, pin } = req.body;

  // Mock PIN verification (in real app, verify against database)
  const isValid = pin === '1234'; // Mock validation

  if (!isValid) {
    throw new ApiError(401, 'Invalid PIN');
  }

  res.json(new ApiResponse(200, 'PIN verified successfully', {
    verified: true
  }));
}));

module.exports = router;
