const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// STRIPE PAYMENT ENDPOINTS
// ========================================

// Create Stripe payment intent
router.post('/stripe/create-payment-intent', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('currency').isIn(['usd', 'eur', 'inr']).withMessage('Valid currency is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('paymentMethod').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { amount, currency, orderId, paymentMethod } = req.body;

  try {
    // Initialize Stripe (you'll need to install @stripe/stripe-js)
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Create payment intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount * 100, // Convert to cents
    //   currency: currency,
    //   metadata: {
    //     orderId: orderId,
    //     userId: req.user.userId
    // }
    // });

    // For now, return mock response
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100,
      currency: currency,
      status: 'requires_payment_method'
    };

    res.json(new ApiResponse(200, 'Payment intent created successfully', {
      paymentIntent,
      orderId
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to create payment intent', error.message);
  }
}));

// ========================================
// PAYPAL PAYMENT ENDPOINTS
// ========================================

// Create PayPal order
router.post('/paypal/create-order', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('currency').isIn(['USD', 'EUR', 'INR']).withMessage('Valid currency is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { amount, currency, orderId } = req.body;

  try {
    // Initialize PayPal (you'll need to install @paypal/checkout-server-sdk)
    // const paypal = require('@paypal/checkout-server-sdk');
    // const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
    // const client = new paypal.core.PayPalHttpClient(environment);

    // Create order request
    // const request = new paypal.orders.OrdersCreateRequest();
    // request.prefer("return=representation");
    // request.requestBody({
    //   intent: 'CAPTURE',
    //   purchase_units: [{
    //     amount: {
    //       currency_code: currency,
    //       value: amount.toString()
    //     },
    //     custom_id: orderId
    //   }]
    // });

    // const order = await client.execute(request);

    // For now, return mock response
    const order = {
      id: `PAYPAL-ORDER-${Date.now()}`,
      status: 'CREATED',
      links: [
        {
          href: `https://www.sandbox.paypal.com/checkoutnow?token=${Date.now()}`,
          rel: 'approve',
          method: 'GET'
        }
      ]
    };

    res.json(new ApiResponse(200, 'PayPal order created successfully', {
      order,
      orderId
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to create PayPal order', error.message);
  }
}));

// ========================================
// RAZORPAY PAYMENT ENDPOINTS
// ========================================

// Create Razorpay order
router.post('/razorpay/create-order', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('currency').isIn(['INR', 'USD']).withMessage('Valid currency is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { amount, currency, orderId } = req.body;

  try {
    // Initialize Razorpay (you'll need to install razorpay)
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET
    // });

    // Create order
    // const order = await razorpay.orders.create({
    //   amount: amount * 100, // Convert to paise
    //   currency: currency,
    //   receipt: orderId,
    //   notes: {
    //     orderId: orderId,
    //     userId: req.user.userId
    //   }
    // });

    // For now, return mock response
    const order = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: amount * 100,
      amount_paid: 0,
      amount_due: amount * 100,
      currency: currency,
      receipt: orderId,
      status: 'created',
      attempts: 0
    };

    res.json(new ApiResponse(200, 'Razorpay order created successfully', {
      order,
      orderId
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to create Razorpay order', error.message);
  }
}));

// ========================================
// PAYTM PAYMENT ENDPOINTS
// ========================================

// Create Paytm transaction
router.post('/paytm/create-transaction', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('phone').isMobilePhone('en-IN').withMessage('Valid phone number is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { amount, orderId, phone } = req.body;

  try {
    // Initialize Paytm (you'll need to install paytmchecksum)
    // const PaytmChecksum = require('paytmchecksum');

    // Create transaction
    // const paytmParams = {
    //   ORDER_ID: orderId,
    //   CUST_ID: req.user.userId,
    //   TXN_AMOUNT: amount.toString(),
    //   CHANNEL_ID: 'WEB',
    //   WEBSITE: 'WEBSTAGING',
    //   CALLBACK_URL: `${process.env.BASE_URL}/api/payments/paytm/callback`
    // };

    // const checksum = await PaytmChecksum.generateSignature(paytmParams, process.env.PAYTM_MERCHANT_KEY);

    // For now, return mock response
    const transaction = {
      ORDER_ID: orderId,
      TXN_AMOUNT: amount.toString(),
      CUST_ID: req.user.userId,
      CHANNEL_ID: 'WEB',
      WEBSITE: 'WEBSTAGING',
      CHECKSUMHASH: `checksum_${Date.now()}`,
      TXN_TOKEN: `token_${Date.now()}`
    };

    res.json(new ApiResponse(200, 'Paytm transaction created successfully', {
      transaction,
      orderId
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to create Paytm transaction', error.message);
  }
}));

// ========================================
// PHONEPE PAYMENT ENDPOINTS
// ========================================

// Create PhonePe payment
router.post('/phonepe/create-payment', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('phone').isMobilePhone('en-IN').withMessage('Valid phone number is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { amount, orderId, phone } = req.body;

  try {
    // Initialize PhonePe (you'll need to install phonepe-pg-sdk)
    // const PhonePe = require('phonepe-pg-sdk');
    // const phonepe = new PhonePe({
    //   merchantId: process.env.PHONEPE_MERCHANT_ID,
    //   saltKey: process.env.PHONEPE_SALT_KEY,
    //   saltIndex: process.env.PHONEPE_SALT_INDEX,
    //   environment: process.env.NODE_ENV === 'production' ? 'PROD' : 'UAT'
    // });

    // Create payment
    // const payment = await phonepe.payment.create({
    //   merchantTransactionId: orderId,
    //   merchantUserId: req.user.userId,
    //   amount: amount * 100,
    //   redirectUrl: `${process.env.BASE_URL}/api/payments/phonepe/callback`,
    //   redirectMode: 'POST',
    //   callbackUrl: `${process.env.BASE_URL}/api/payments/phonepe/callback`,
    //   mobileNumber: phone,
    //   paymentInstrument: {
    //     type: 'PAY_PAGE'
    //   }
    // });

    // For now, return mock response
    const payment = {
      success: true,
      code: 'PAYMENT_INITIATED',
      merchantTransactionId: orderId,
      transactionId: `TXN_${Date.now()}`,
      amount: amount * 100,
      redirectUrl: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay?merchantId=${process.env.PHONEPE_MERCHANT_ID}&merchantTransactionId=${orderId}`
    };

    res.json(new ApiResponse(200, 'PhonePe payment created successfully', {
      payment,
      orderId
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to create PhonePe payment', error.message);
  }
}));

// ========================================
// PAYMENT STATUS & WEBHOOKS
// ========================================

// Get payment status
router.get('/:id/status', catchAsync(async (req, res) => {
  const { id } = req.params;

  // Mock payment status
  const paymentStatus = {
    id: id,
    status: 'completed',
    amount: 1000,
    currency: 'INR',
    paymentMethod: 'card',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Payment status retrieved successfully', {
    payment: paymentStatus
  }));
}));

// Process payment refund
router.post('/:id/refund', [
  body('amount').optional().isNumeric().withMessage('Valid amount is required'),
  body('reason').optional().isString().withMessage('Refund reason is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { amount, reason } = req.body;

  // Mock refund response
  const refund = {
    id: `refund_${Date.now()}`,
    paymentId: id,
    amount: amount || 1000,
    reason: reason || 'Customer request',
    status: 'succeeded',
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Refund processed successfully', {
    refund
  }));
}));

// ========================================
// WEBHOOK ENDPOINTS
// ========================================

// Stripe webhook
router.post('/webhook/stripe', catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    // Verify webhook signature
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Process the event
    // switch (event.type) {
    //   case 'payment_intent.succeeded':
    //     // Handle successful payment
    //     break;
    //   case 'payment_intent.payment_failed':
    //     // Handle failed payment
    //     break;
    // }

    res.json({ received: true });
  } catch (error) {
    throw new ApiError(400, 'Webhook signature verification failed');
  }
}));

// PayPal webhook
router.post('/webhook/paypal', catchAsync(async (req, res) => {
  // Verify PayPal webhook
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.PAYPAL_WEBHOOK_SECRET)
  //   .update(JSON.stringify(req.body))
  //   .digest('hex');

  // if (req.headers['paypal-transmission-sig'] !== expectedSignature) {
  //   throw new ApiError(400, 'Invalid PayPal webhook signature');
  // }

  // Process PayPal webhook
  res.json({ received: true });
}));

// Razorpay webhook
router.post('/webhook/razorpay', catchAsync(async (req, res) => {
  // Verify Razorpay webhook
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
  //   .update(JSON.stringify(req.body))
  //   .digest('hex');

  // if (req.headers['x-razorpay-signature'] !== expectedSignature) {
  //   throw new ApiError(400, 'Invalid Razorpay webhook signature');
  // }

  // Process Razorpay webhook
  res.json({ received: true });
}));

// ========================================
// UTILITY ENDPOINTS
// ========================================

// Calculate commission
router.get('/commission-calculate', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('sellerId').isMongoId().withMessage('Valid seller ID is required')
], catchAsync(async (req, res) => {
  const { amount, sellerId } = req.query;

  // Calculate commission (example: 5% platform fee)
  const commission = {
    orderAmount: parseFloat(amount),
    platformFee: parseFloat(amount) * 0.05,
    sellerAmount: parseFloat(amount) * 0.95,
    commissionRate: 5,
    currency: 'INR'
  };

  res.json(new ApiResponse(200, 'Commission calculated successfully', {
    commission
  }));
}));

// Split payment
router.post('/split-payment', [
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('splits').isArray().withMessage('Payment splits are required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { amount, splits } = req.body;

  // Validate splits
  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
  if (totalSplit !== amount) {
    throw new ApiError(400, 'Split amounts must equal total amount');
  }

  // Process split payment
  const splitPayment = {
    id: `split_${Date.now()}`,
    totalAmount: amount,
    splits: splits,
    status: 'processing',
    createdAt: new Date()
  };

  res.json(new ApiResponse(200, 'Split payment created successfully', {
    splitPayment
  }));
}));

module.exports = router;
