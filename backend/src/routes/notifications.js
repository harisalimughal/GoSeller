const express = require('express');
const { body, validationResult } = require('express-validator');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// ========================================
// EMAIL NOTIFICATIONS
// ========================================

// Send email notification
router.post('/send-email', [
  body('to').isEmail().withMessage('Valid recipient email is required'),
  body('subject').trim().notEmpty().withMessage('Email subject is required'),
  body('template').optional().isString(),
  body('data').optional().isObject(),
  body('html').optional().isString(),
  body('text').optional().isString()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { to, subject, template, data, html, text } = req.body;

  try {
    // Initialize email service (you'll need to install @sendgrid/mail)
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Prepare email content
    let emailContent = '';
    if (template) {
      // Load template and replace variables
      emailContent = await loadEmailTemplate(template, data);
    } else if (html) {
      emailContent = html;
    } else {
      emailContent = text || 'No content provided';
    }

    // Send email
    // const msg = {
    //   to: to,
    //   from: process.env.EMAIL_FROM,
    //   subject: subject,
    //   html: emailContent,
    //   text: text || emailContent.replace(/<[^>]*>/g, '')
    // };

    // await sgMail.send(msg);

    // For now, return mock response
    const emailNotification = {
      id: `email_${Date.now()}`,
      to: to,
      subject: subject,
      status: 'sent',
      sentAt: new Date(),
      template: template || 'custom'
    };

    res.json(new ApiResponse(200, 'Email sent successfully', {
      notification: emailNotification
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to send email', error.message);
  }
}));

// Send bulk email notifications
router.post('/send-email/bulk', [
  body('recipients').isArray().withMessage('Recipients array is required'),
  body('subject').trim().notEmpty().withMessage('Email subject is required'),
  body('template').optional().isString(),
  body('data').optional().isObject()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { recipients, subject, template, data } = req.body;

  try {
    // Initialize email service
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Prepare email content
    const emailContent = template ? await loadEmailTemplate(template, data) : '';

    // Send bulk emails
    const emails = recipients.map(recipient => ({
      to: recipient.email,
      from: process.env.EMAIL_FROM,
      subject: subject,
      html: emailContent,
      text: emailContent.replace(/<[^>]*>/g, '')
    }));

    // await sgMail.sendMultiple(emails);

    // For now, return mock response
    const bulkNotification = {
      id: `bulk_email_${Date.now()}`,
      recipients: recipients.length,
      subject: subject,
      status: 'sent',
      sentAt: new Date(),
      template: template || 'custom'
    };

    res.json(new ApiResponse(200, 'Bulk emails sent successfully', {
      notification: bulkNotification
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to send bulk emails', error.message);
  }
}));

// ========================================
// SMS NOTIFICATIONS
// ========================================

// Send SMS notification
router.post('/send-sms', [
  body('to').isMobilePhone().withMessage('Valid phone number is required'),
  body('message').trim().notEmpty().withMessage('SMS message is required'),
  body('template').optional().isString(),
  body('data').optional().isObject()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { to, message, template, data } = req.body;

  try {
    // Initialize SMS service (you'll need to install twilio)
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Prepare SMS content
    let smsContent = message;
    if (template) {
      smsContent = await loadSMSTemplate(template, data);
    }

    // Send SMS
    // const sms = await client.messages.create({
    //   body: smsContent,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: to
    // });

    // For now, return mock response
    const smsNotification = {
      id: `sms_${Date.now()}`,
      to: to,
      message: smsContent,
      status: 'sent',
      sentAt: new Date(),
      template: template || 'custom'
    };

    res.json(new ApiResponse(200, 'SMS sent successfully', {
      notification: smsNotification
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to send SMS', error.message);
  }
}));

// Send bulk SMS notifications
router.post('/send-sms/bulk', [
  body('recipients').isArray().withMessage('Recipients array is required'),
  body('message').trim().notEmpty().withMessage('SMS message is required'),
  body('template').optional().isString(),
  body('data').optional().isObject()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { recipients, message, template, data } = req.body;

  try {
    // Initialize SMS service
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Prepare SMS content
    let smsContent = message;
    if (template) {
      smsContent = await loadSMSTemplate(template, data);
    }

    // Send bulk SMS
    const smsPromises = recipients.map(recipient =>
      // client.messages.create({
      //   body: smsContent,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: recipient.phone
      // })
      Promise.resolve({ sid: `mock_${Date.now()}_${Math.random()}` })
    );

    // await Promise.all(smsPromises);

    // For now, return mock response
    const bulkSMSNotification = {
      id: `bulk_sms_${Date.now()}`,
      recipients: recipients.length,
      message: smsContent,
      status: 'sent',
      sentAt: new Date(),
      template: template || 'custom'
    };

    res.json(new ApiResponse(200, 'Bulk SMS sent successfully', {
      notification: bulkSMSNotification
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to send bulk SMS', error.message);
  }
}));

// ========================================
// PUSH NOTIFICATIONS
// ========================================

// Send push notification
router.post('/send-push', [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('title').trim().notEmpty().withMessage('Notification title is required'),
  body('body').trim().notEmpty().withMessage('Notification body is required'),
  body('data').optional().isObject(),
  body('image').optional().isURL()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userId, title, body, data, image } = req.body;

  try {
    // Get user's push tokens
    // const user = await User.findById(userId);
    // if (!user || !user.pushTokens || user.pushTokens.length === 0) {
    //   throw new ApiError(400, 'User has no push tokens registered');
    // }

    // Initialize push notification service (you'll need to install firebase-admin)
    // const admin = require('firebase-admin');
    // const serviceAccount = require('../config/firebase-service-account.json');

    // if (!admin.apps.length) {
    //   admin.initializeApp({
    //     credential: admin.credential.cert(serviceAccount)
    //   });
    // }

    // Send push notification to all user tokens
    // const pushPromises = user.pushTokens.map(token =>
    //   admin.messaging().send({
    //     token: token,
    //     notification: {
    //       title: title,
    //       body: body,
    //       imageUrl: image
    //     },
    //     data: data || {}
    //   })
    // );

    // await Promise.all(pushPromises);

    // For now, return mock response
    const pushNotification = {
      id: `push_${Date.now()}`,
      userId: userId,
      title: title,
      body: body,
      status: 'sent',
      sentAt: new Date(),
      data: data || {}
    };

    res.json(new ApiResponse(200, 'Push notification sent successfully', {
      notification: pushNotification
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to send push notification', error.message);
  }
}));

// Send bulk push notifications
router.post('/send-push/bulk', [
  body('userIds').isArray().withMessage('User IDs array is required'),
  body('title').trim().notEmpty().withMessage('Notification title is required'),
  body('body').trim().notEmpty().withMessage('Notification body is required'),
  body('data').optional().isObject()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { userIds, title, body, data } = req.body;

  try {
    // Get users with push tokens
    // const users = await User.find({
    //   _id: { $in: userIds },
    //   pushTokens: { $exists: true, $ne: [] }
    // });

    // Send push notifications
    // const pushPromises = users.flatMap(user =>
    //   user.pushTokens.map(token =>
    //     admin.messaging().send({
    //       token: token,
    //       notification: {
    //         title: title,
    //         body: body
    //       },
    //       data: data || {}
    //     })
    //   )
    // );

    // await Promise.all(pushPromises);

    // For now, return mock response
    const bulkPushNotification = {
      id: `bulk_push_${Date.now()}`,
      userIds: userIds.length,
      title: title,
      body: body,
      status: 'sent',
      sentAt: new Date(),
      data: data || {}
    };

    res.json(new ApiResponse(200, 'Bulk push notifications sent successfully', {
      notification: bulkPushNotification
    }));
  } catch (error) {
    throw new ApiError(500, 'Failed to send bulk push notifications', error.message);
  }
}));

// ========================================
// NOTIFICATION MANAGEMENT
// ========================================

// Get user notifications
router.get('/user/:userId', catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20, type, read } = req.query;

  // Mock notifications (in real app, these would come from a notifications collection)
  const notifications = [
    {
      id: 'notif_1',
      userId: userId,
      type: 'email',
      title: 'Order Confirmed',
      body: 'Your order #12345 has been confirmed',
      read: false,
      createdAt: new Date()
    },
    {
      id: 'notif_2',
      userId: userId,
      type: 'sms',
      title: 'Delivery Update',
      body: 'Your package is out for delivery',
      read: true,
      createdAt: new Date(Date.now() - 86400000)
    }
  ];

  // Filter notifications
  let filteredNotifications = notifications;
  if (type) {
    filteredNotifications = filteredNotifications.filter(n => n.type === type);
  }
  if (read !== undefined) {
    filteredNotifications = filteredNotifications.filter(n => n.read === (read === 'true'));
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  res.json(new ApiResponse(200, 'User notifications retrieved successfully', {
    notifications: paginatedNotifications,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(filteredNotifications.length / limit),
      total: filteredNotifications.length
    }
  }));
}));

// Mark notification as read
router.put('/:id/read', catchAsync(async (req, res) => {
  const { id } = req.params;

  // In real app, update notification in database
  // await Notification.findByIdAndUpdate(id, { read: true });

  res.json(new ApiResponse(200, 'Notification marked as read', {
    notificationId: id,
    read: true
  }));
}));

// Delete notification
router.delete('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;

  // In real app, delete notification from database
  // await Notification.findByIdAndDelete(id);

  res.json(new ApiResponse(200, 'Notification deleted successfully', {
    notificationId: id
  }));
}));

// ========================================
// NOTIFICATION TEMPLATES
// ========================================

// Get notification templates
router.get('/templates', catchAsync(async (req, res) => {
  const { type } = req.query;

  const templates = {
    email: {
      'order-confirmation': {
        subject: 'Order Confirmed - #{orderNumber}',
        html: '<h1>Order Confirmed</h1><p>Your order #{orderNumber} has been confirmed.</p>',
        variables: ['orderNumber', 'customerName', 'totalAmount']
      },
      'order-shipped': {
        subject: 'Order Shipped - #{orderNumber}',
        html: '<h1>Order Shipped</h1><p>Your order #{orderNumber} has been shipped.</p>',
        variables: ['orderNumber', 'trackingNumber', 'estimatedDelivery']
      },
      'welcome': {
        subject: 'Welcome to GoSeller',
        html: '<h1>Welcome!</h1><p>Thank you for joining GoSeller.</p>',
        variables: ['customerName']
      }
    },
    sms: {
      'order-confirmation': {
        message: 'Your order #{orderNumber} has been confirmed. Total: #{totalAmount}',
        variables: ['orderNumber', 'totalAmount']
      },
      'delivery-update': {
        message: 'Your package #{trackingNumber} is out for delivery.',
        variables: ['trackingNumber', 'estimatedDelivery']
      }
    },
    push: {
      'order-update': {
        title: 'Order Update',
        body: 'Your order #{orderNumber} status has been updated.',
        variables: ['orderNumber', 'status']
      },
      'new-product': {
        title: 'New Product',
        body: 'Check out our latest product: #{productName}',
        variables: ['productName', 'productId']
      }
    }
  };

  const filteredTemplates = type ? templates[type] : templates;

  res.json(new ApiResponse(200, 'Notification templates retrieved successfully', {
    templates: filteredTemplates
  }));
}));

// Create notification template
router.post('/templates', [
  body('type').isIn(['email', 'sms', 'push']).withMessage('Valid notification type is required'),
  body('name').trim().notEmpty().withMessage('Template name is required'),
  body('subject').optional().isString(),
  body('message').optional().isString(),
  body('html').optional().isString(),
  body('variables').optional().isArray()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { type, name, subject, message, html, variables } = req.body;

  // In real app, save template to database
  const template = {
    id: `template_${Date.now()}`,
    type,
    name,
    subject,
    message,
    html,
    variables: variables || [],
    createdAt: new Date()
  };

  res.status(201).json(new ApiResponse(201, 'Notification template created successfully', {
    template
  }));
}));

// Update notification template
router.put('/templates/:id', [
  body('subject').optional().isString(),
  body('message').optional().isString(),
  body('html').optional().isString(),
  body('variables').optional().isArray()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const { subject, message, html, variables } = req.body;

  // In real app, update template in database
  const template = {
    id,
    subject,
    message,
    html,
    variables,
    updatedAt: new Date()
  };

  res.json(new ApiResponse(200, 'Notification template updated successfully', {
    template
  }));
}));

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Load email template
async function loadEmailTemplate(templateName, data) {
  const templates = {
    'order-confirmation': `
      <h1>Order Confirmed</h1>
      <p>Dear #{customerName},</p>
      <p>Your order #{orderNumber} has been confirmed.</p>
      <p>Total Amount: #{totalAmount}</p>
      <p>Thank you for shopping with us!</p>
    `,
    'order-shipped': `
      <h1>Order Shipped</h1>
      <p>Dear #{customerName},</p>
      <p>Your order #{orderNumber} has been shipped.</p>
      <p>Tracking Number: #{trackingNumber}</p>
      <p>Estimated Delivery: #{estimatedDelivery}</p>
    `,
    'welcome': `
      <h1>Welcome to GoSeller!</h1>
      <p>Dear #{customerName},</p>
      <p>Thank you for joining GoSeller. We're excited to have you on board!</p>
    `
  };

  let template = templates[templateName] || 'No template found';

  // Replace variables
  Object.keys(data || {}).forEach(key => {
    template = template.replace(new RegExp(`#\\{${key}\\}`, 'g'), data[key]);
  });

  return template;
}

// Load SMS template
async function loadSMSTemplate(templateName, data) {
  const templates = {
    'order-confirmation': 'Your order #{orderNumber} has been confirmed. Total: #{totalAmount}',
    'delivery-update': 'Your package #{trackingNumber} is out for delivery.',
    'welcome': 'Welcome to GoSeller! Thank you for joining us.'
  };

  let template = templates[templateName] || 'No template found';

  // Replace variables
  Object.keys(data || {}).forEach(key => {
    template = template.replace(new RegExp(`#\\{${key}\\}`, 'g'), data[key]);
  });

  return template;
}

module.exports = router;
