const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Seller = require('../models/Seller');
const CloudinaryService = require('../services/cloudinaryService');
const { catchAsync } = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

// ========================================
// SELLER REGISTRATION
// ========================================

// Health check endpoint for debugging
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Seller Registration service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    }
  });
});

// Register new seller with file uploads
router.post('/register', 
  upload.fields([
    { name: 'storeLogo', maxCount: 1 },
    { name: 'storeBanner', maxCount: 1 },
    { name: 'businessDocuments', maxCount: 5 }
  ]),
  [
    // Personal Information Validation
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    
    // Business Information Validation
    body('businessName').trim().notEmpty().withMessage('Business name is required'),
    body('businessType').isIn(['Electronics', 'Fashion & Apparel', 'Home & Garden', 'Sports & Outdoors', 'Beauty & Health', 'Books & Media', 'Toys & Games', 'Automotive', 'Food & Beverages', 'Jewelry & Accessories', 'Other']).withMessage('Valid business type is required'),
    body('businessLicense').trim().notEmpty().withMessage('Business license is required'),
    body('businessAddress').trim().notEmpty().withMessage('Business address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('zipCode').trim().notEmpty().withMessage('ZIP code is required'),
    body('country').trim().notEmpty().withMessage('Country is required'),
    
    // Seller Category Validation
    body('sellerCategory').isIn(['Company', 'Dealer', 'Wholesaler', 'Trader', 'Storekeeper']).withMessage('Valid seller category is required'),
    
    // Store Information Validation
    body('storeDescription').trim().notEmpty().withMessage('Store description is required'),
    body('storeCategory').isIn(['Electronics Store', 'Fashion Boutique', 'Home & Lifestyle', 'Sports Equipment', 'Beauty & Cosmetics', 'Bookstore', 'Toy Store', 'Auto Parts', 'Grocery Store', 'Jewelry Store', 'General Store', 'Specialty Store']).withMessage('Valid store category is required'),
    
    // Optional Parent Company Validation
    body('parentCompanyId').optional().custom((value) => {
      if (value && value !== 'undefined' && value !== '' && value !== null) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error('Invalid parent company ID format');
        }
      }
      return true;
    }).withMessage('Invalid parent company ID format')
  ],
  catchAsync(async (req, res) => {
    console.log('Registration request body:', req.body);
    console.log('Registration files:', req.files);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      // Format validation errors for better user experience
      const formattedErrors = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));
      
      throw new ApiError(400, 'Please check the following fields:', formattedErrors);
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      businessName,
      businessType,
      businessLicense,
      businessAddress,
      city,
      state,
      zipCode,
      country,
      storeDescription,
      storeCategory,
      sellerCategory,
      distributionArea,
      authorizedTerritories,
      parentCompanyId
    } = req.body;

    // Check if seller already exists with more specific error messages
    const existingSellerByEmail = await Seller.findOne({ email });
    const existingSellerByPhone = await Seller.findOne({ contact: phone });

    if (existingSellerByEmail && existingSellerByPhone) {
      throw new ApiError(409, 'A seller account already exists with both this email and phone number. Please use different credentials or contact support for assistance.');
    } else if (existingSellerByEmail) {
      throw new ApiError(409, 'A seller account already exists with this email address. Please use a different email or try logging in if you already have an account.');
    } else if (existingSellerByPhone) {
      throw new ApiError(409, 'A seller account already exists with this phone number. Please use a different phone number or try logging in if you already have an account.');
    }

    // Validate parent company if provided
    let parentCompany = null;
    if (parentCompanyId && parentCompanyId !== 'undefined' && parentCompanyId !== '' && parentCompanyId !== null && sellerCategory !== 'Company') {
      // Validate that parentCompanyId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(parentCompanyId)) {
        throw new ApiError(400, 'Invalid parent company ID format. Please provide a valid company ID.');
      }
      
      parentCompany = await Seller.findById(parentCompanyId);
      if (!parentCompany) {
        throw new ApiError(400, 'Parent company not found. Please provide a valid company ID.');
      }
      
      // Validate hierarchy
      if (sellerCategory === 'Dealer' && parentCompany.sellerCategory !== 'Company') {
        throw new ApiError(400, 'Dealers can only be registered under Companies.');
      }
      if (sellerCategory === 'Wholesaler' && !['Company', 'Dealer'].includes(parentCompany.sellerCategory)) {
        throw new ApiError(400, 'Wholesalers can only be registered under Companies or Dealers.');
      }
      if (sellerCategory === 'Trader' && !['Company', 'Dealer', 'Wholesaler'].includes(parentCompany.sellerCategory)) {
        throw new ApiError(400, 'Traders can only be registered under Companies, Dealers, or Wholesalers.');
      }
      if (sellerCategory === 'Storekeeper' && !['Company', 'Dealer', 'Wholesaler', 'Trader'].includes(parentCompany.sellerCategory)) {
        throw new ApiError(400, 'Storekeepers can only be registered under Companies, Dealers, Wholesalers, or Traders.');
      }
    }

    // Upload images to Cloudinary
    let storeLogoUrl = null;
    let storeBannerUrl = null;
    let businessDocumentsUrls = [];

    // Check if Cloudinary credentials are configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ Cloudinary credentials not configured. File uploads will be skipped.');
      console.warn('📝 Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
      
      // For development, you can continue without file uploads
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Development mode: Continuing without file uploads');
      } else {
        throw new ApiError(500, 'File upload service not configured. Please contact administrator.');
      }
    } else {
    try {
      // Upload store logo
      if (req.files.storeLogo) {
        const logoResult = await CloudinaryService.uploadImage(
          req.files.storeLogo[0].buffer,
          'gosellr/store-logos'
        );
        storeLogoUrl = logoResult.url;
      }

      // Upload store banner
      if (req.files.storeBanner) {
        const bannerResult = await CloudinaryService.uploadImage(
          req.files.storeBanner[0].buffer,
          'gosellr/store-banners'
        );
        storeBannerUrl = bannerResult.url;
      }

          // Upload business documents
    if (req.files.businessDocuments && req.files.businessDocuments.length > 0) {
      const documentBuffers = req.files.businessDocuments.map(file => file.buffer);
      const documentResults = await CloudinaryService.uploadMultipleImages(
        documentBuffers,
        'gosellr/business-documents'
      );
      businessDocumentsUrls = documentResults.map(result => result.url);
    }
    } catch (uploadError) {
      console.error('File upload error:', uploadError);
      
      // Provide more specific error messages based on the error type
      if (uploadError.message && uploadError.message.includes('cloudinary')) {
        throw new ApiError(500, 'Image upload service is temporarily unavailable. Please try again in a few minutes.');
      } else if (uploadError.message && uploadError.message.includes('network')) {
        throw new ApiError(500, 'Network error during file upload. Please check your internet connection and try again.');
      } else if (uploadError.message && uploadError.message.includes('size')) {
        throw new ApiError(400, 'File size too large. Please upload smaller images (max 5MB each).');
      } else {
        throw new ApiError(500, 'File upload failed. Please try again or contact support if the problem persists.');
        }
      }
    }

    // Map seller category to seller type
    const sellerTypeMap = {
      'Company': 'company',
      'Dealer': 'dealer',
      'Wholesaler': 'wholesaler',
      'Trader': 'trader',
      'Storekeeper': 'storekeeper'
    };

    // Create seller with enhanced capabilities
    const seller = new Seller({
      // Personal Information
      name: `${firstName} ${lastName}`,
      email,
      password,
      contact: phone,
      location: `${city}, ${state}, ${country}`,
      
      // Enhanced Business Information
      sellerType: sellerTypeMap[sellerCategory],
      sellerCategory,
      profileType: 'product_seller',
      shopName: businessName,
      
      // Business Details
      businessDetails: {
        businessName,
        businessType: 'individual',
        registrationNumber: businessLicense,
        establishedYear: new Date().getFullYear()
      },
      
      // Supply Chain Information
      supplyChain: {
        parentCompany: parentCompanyId && parentCompanyId !== 'undefined' ? parentCompanyId : null,
        distributionArea: distributionArea || 'Local',
        authorizedTerritories: authorizedTerritories ? authorizedTerritories.split(',').map(t => t.trim()) : []
      },
      
      // Address Information
      address: {
        street: businessAddress,
        city,
        area: state,
        postalCode: zipCode
      },
      
      // Contact Information
      contactInfo: {
        phone,
        email
      },
      
      // Store Information
      storeInfo: {
        description: storeDescription,
        category: storeCategory,
        logo: storeLogoUrl,
        banner: storeBannerUrl,
        documents: businessDocumentsUrls
      },
      
      // SQL Quality Level (starts at Free)
      productSQL_level: 'Free',
      serviceSQL_level: 'Free',
      
      // Verification Status
      verified: false,
      status: 'pending',
      isActive: true,
      
      // KYC Documents
      kyc_docs: {
        businessLicense: {
          number: businessLicense,
          image: businessDocumentsUrls[0] || null,
          verified: false
        }
      }
    });

    try {
      await seller.save();
      
      // Update parent company's child list if applicable
      if (parentCompany) {
        const childField = `${sellerCategory.toLowerCase()}s`;
        if (parentCompany.supplyChain[childField]) {
          parentCompany.supplyChain[childField].push(seller._id);
        } else {
          parentCompany.supplyChain[childField] = [seller._id];
        }
        await parentCompany.save();
      }
    } catch (saveError) {
      console.error('Seller save error:', saveError);
      
      // Handle specific database errors
      if (saveError.code === 11000) {
        // Duplicate key error - this shouldn't happen since we checked above, but handle it anyway
        const field = Object.keys(saveError.keyValue)[0];
        throw new ApiError(409, `A seller account already exists with this ${field}. Please use different credentials.`);
      } else if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => err.message).join(', ');
        throw new ApiError(400, `Validation failed: ${validationErrors}`);
      } else {
        throw new ApiError(500, 'Failed to create seller account. Please try again or contact support.');
      }
    }

    res.status(201).json(new ApiResponse(201, 'Seller registration successful', {
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        businessName: seller.shopName,
        sellerCategory: seller.sellerCategory,
        sqlLevel: seller.productSQL_level,
        status: seller.status,
        capabilities: seller.capabilities,
        verificationStatus: {
          pss: seller.productVerification?.pss?.status || 'pending',
          edr: seller.productVerification?.edr?.status || 'pending',
          emo: seller.productVerification?.emo?.status || 'pending'
        }
      }
    }));
  })
);

// Get seller categories and their capabilities
router.get('/categories', catchAsync(async (req, res) => {
  const categories = [
    {
      name: 'Company',
      description: 'Manufacturers or official product owners who produce goods under their own brand.',
      keyFeatures: [
        'Can monitor all downstream supply chain',
        'Highest level of product control',
        'Can register dealers, wholesalers, etc.'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Full'
      }
    },
    {
      name: 'Dealer',
      description: 'Direct representatives of the manufacturing company or major stockists.',
      keyFeatures: [
        'Works directly under company',
        'Can manage multiple wholesalers',
        'Handles regional distribution'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Regional'
      }
    },
    {
      name: 'Wholesaler',
      description: 'Buys products in bulk from dealers or companies and sells to traders.',
      keyFeatures: [
        'Mid-level distributor',
        'Manages stock and pricing',
        'May serve multiple areas'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Zonal'
      }
    },
    {
      name: 'Trader',
      description: 'Purchases from wholesalers and supplies to local shops.',
      keyFeatures: [
        'Works on local demand',
        'Can manage small product quantities',
        'Often limited by region'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Local'
      }
    },
    {
      name: 'Storekeeper',
      description: 'Final seller to customers through GoSellr platform.',
      keyFeatures: [
        'Registers store on GoSellr',
        'Manages orders, deliveries, and customer complaints',
        'Can be verified under SQL levels (Free → VIP)'
      ],
      capabilities: {
        productListing: true,
        priceControl: false,
        orderHandling: true,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: false,
        bulkOrderTools: false,
        dashboardRoleAccess: 'Area-wise'
      }
    }
  ];

  res.json(new ApiResponse(200, 'Seller categories retrieved successfully', {
    categories
  }));
}));

// Get seller profile
router.get('/profile/:sellerId', catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.params.sellerId)
    .select('-password');

  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  res.json(new ApiResponse(200, 'Seller profile retrieved successfully', {
    seller
  }));
}));

// Update seller profile
router.put('/profile/:sellerId', 
  upload.fields([
    { name: 'storeLogo', maxCount: 1 },
    { name: 'storeBanner', maxCount: 1 },
    { name: 'businessDocuments', maxCount: 5 }
  ]),
  catchAsync(async (req, res) => {
    const seller = await Seller.findById(req.params.sellerId);
    
    if (!seller) {
      throw new ApiError(404, 'Seller not found');
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.storeLogo) {
        const logoResult = await CloudinaryService.uploadImage(
          req.files.storeLogo[0].buffer,
          'gosellr/store-logos'
        );
        seller.storeInfo.logo = logoResult.url;
      }

      if (req.files.storeBanner) {
        const bannerResult = await CloudinaryService.uploadImage(
          req.files.storeBanner[0].buffer,
          'gosellr/store-banners'
        );
        seller.storeInfo.banner = bannerResult.url;
      }

      if (req.files.businessDocuments) {
        const documentBuffers = req.files.businessDocuments.map(file => file.buffer);
        const documentResults = await CloudinaryService.uploadMultipleImages(
          documentBuffers,
          'gosellr/business-documents'
        );
        seller.storeInfo.documents = [...(seller.storeInfo.documents || []), ...documentResults.map(result => result.url)];
      }
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'password' && seller[key] !== undefined) {
        seller[key] = req.body[key];
      }
    });

    await seller.save();

    res.json(new ApiResponse(200, 'Seller profile updated successfully', {
      seller: {
        id: seller._id,
        name: seller.name,
        email: seller.email,
        businessName: seller.shopName,
        sellerCategory: seller.sellerCategory,
        sqlLevel: seller.productSQL_level,
        status: seller.status,
        capabilities: seller.capabilities
      }
    }));
  })
);

// Get seller statistics
router.get('/stats/:sellerId', catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.params.sellerId);
  
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  const stats = {
    totalProducts: seller.totalProducts,
    totalOrders: seller.totalOrders,
    totalRevenue: seller.totalRevenue,
    rating: seller.rating,
    sqlLevel: seller.productSQL_level,
    sellerCategory: seller.sellerCategory,
    capabilities: seller.capabilities,
    verificationStatus: {
      pss: seller.productVerification?.pss?.status || 'pending',
      edr: seller.productVerification?.edr?.status || 'pending',
      emo: seller.productVerification?.emo?.status || 'pending'
    }
  };

  res.json(new ApiResponse(200, 'Seller statistics retrieved successfully', {
    stats
  }));
}));

// Get all sellers (for admin)
router.get('/all', catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, sqlLevel, sellerCategory } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (sqlLevel) query.productSQL_level = sqlLevel;
  if (sellerCategory) query.sellerCategory = sellerCategory;

  const sellers = await Seller.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Seller.countDocuments(query);

  res.json(new ApiResponse(200, 'Sellers retrieved successfully', {
    sellers,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  }));
}));

// Delete seller (admin only)
router.delete('/:sellerId', catchAsync(async (req, res) => {
  const seller = await Seller.findById(req.params.sellerId);
  
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  // Delete associated images from Cloudinary
  if (seller.storeInfo?.logo) {
    try {
      await CloudinaryService.deleteImage(seller.storeInfo.logo);
    } catch (error) {
      console.error('Error deleting logo:', error);
    }
  }

  if (seller.storeInfo?.banner) {
    try {
      await CloudinaryService.deleteImage(seller.storeInfo.banner);
    } catch (error) {
      console.error('Error deleting banner:', error);
    }
  }

  await Seller.findByIdAndDelete(req.params.sellerId);

  res.json(new ApiResponse(200, 'Seller deleted successfully'));
}));

module.exports = router; 