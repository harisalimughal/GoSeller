const express = require('express');
const { body, validationResult } = require('express-validator');
const Seller = require('../models/Seller');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

const router = express.Router();

// ========================================
// SELLER HIERARCHY MANAGEMENT
// ========================================

// Get company's supply chain hierarchy
router.get('/hierarchy/:companyId', catchAsync(async (req, res) => {
  const { companyId } = req.params;
  
  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can access hierarchy management');
  }

  // Get all downstream sellers
  const hierarchy = {
    company: {
      id: company._id,
      name: company.name,
      businessName: company.shopName,
      category: company.sellerCategory,
      location: company.location
    },
    dealers: [],
    wholesalers: [],
    traders: [],
    storekeepers: []
  };

  // Fetch dealers
  if (company.supplyChain.dealers && company.supplyChain.dealers.length > 0) {
    const dealers = await Seller.find({ _id: { $in: company.supplyChain.dealers } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.dealers = dealers;
  }

  // Fetch wholesalers
  if (company.supplyChain.wholesalers && company.supplyChain.wholesalers.length > 0) {
    const wholesalers = await Seller.find({ _id: { $in: company.supplyChain.wholesalers } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.wholesalers = wholesalers;
  }

  // Fetch traders
  if (company.supplyChain.traders && company.supplyChain.traders.length > 0) {
    const traders = await Seller.find({ _id: { $in: company.supplyChain.traders } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.traders = traders;
  }

  // Fetch storekeepers
  if (company.supplyChain.retailers && company.supplyChain.retailers.length > 0) {
    const storekeepers = await Seller.find({ _id: { $in: company.supplyChain.retailers } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.storekeepers = storekeepers;
  }

  res.json(new ApiResponse(200, 'Hierarchy retrieved successfully', {
    hierarchy
  }));
}));

// Enhanced Add dealer to company with product distribution and pricing
router.post('/add-dealer', [
  body('companyId').isMongoId().withMessage('Valid company ID is required'),
  body('dealerId').isMongoId().withMessage('Valid dealer ID is required'),
  body('territories').isArray().withMessage('Territories must be an array'),
  body('territories.*').isString().withMessage('Each territory must be a string'),
  body('assignedProducts').isArray().withMessage('Assigned products must be an array'),
  body('assignedProducts.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('assignedProducts.*.dealerPrice').isNumeric().withMessage('Dealer price must be a number'),
  body('assignedProducts.*.commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('priceRules').optional().isObject().withMessage('Price rules must be an object'),
  body('commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
  body('contractDuration').optional().isNumeric().withMessage('Contract duration must be a number')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { 
    companyId, 
    dealerId, 
    territories, 
    assignedProducts, 
    priceRules, 
    commissionMargin, 
    expiryDate, 
    contractDuration 
  } = req.body;

  // Verify company exists and is a Company
  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can add dealers');
  }

  // Verify dealer exists and is a Dealer
  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  if (dealer.sellerCategory !== 'Dealer' && dealer.sellerType !== 'dealer') {
    throw new ApiError(400, 'Can only add Dealers to Company hierarchy');
  }

  // Check if dealer is already in the hierarchy
  if (company.supplyChain.dealers && company.supplyChain.dealers.includes(dealerId)) {
    throw new ApiError(409, 'Dealer is already in the company hierarchy');
  }

  // Verify assigned products exist and belong to the company
  const Product = require('../models/Product');
  const productIds = assignedProducts.map(p => p.productId);
  const products = await Product.find({ 
    _id: { $in: productIds }, 
    sellerId: companyId 
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'Some assigned products do not exist or do not belong to the company');
  }

  // Add dealer to company's hierarchy
  if (!company.supplyChain.dealers) {
    company.supplyChain.dealers = [];
  }
  company.supplyChain.dealers.push(dealerId);

  // Update dealer's parent company and territories
  dealer.supplyChain.parentCompany = companyId;
  dealer.supplyChain.authorizedTerritories = territories;

  // Add dealer-specific configuration
  dealer.supplyChain.dealerConfig = {
    assignedProducts: assignedProducts.map(product => ({
      productId: product.productId,
      dealerPrice: product.dealerPrice,
      commissionMargin: product.commissionMargin || commissionMargin || 0,
      maxStockLimit: product.maxStockLimit || null,
      priceRules: product.priceRules || priceRules || {}
    })),
    commissionMargin: commissionMargin || 0,
    priceRules: priceRules || {},
    contractExpiry: expiryDate ? new Date(expiryDate) : null,
    contractDuration: contractDuration || null,
    addedAt: new Date()
  };

  await Promise.all([company.save(), dealer.save()]);

  res.json(new ApiResponse(200, 'Dealer added successfully with product distribution', {
    dealer: {
      id: dealer._id,
      name: dealer.name,
      businessName: dealer.shopName,
      territories: dealer.supplyChain.authorizedTerritories,
      assignedProducts: dealer.supplyChain.dealerConfig.assignedProducts,
      commissionMargin: dealer.supplyChain.dealerConfig.commissionMargin,
      contractExpiry: dealer.supplyChain.dealerConfig.contractExpiry
    }
  }));
}));

// Remove dealer from company
router.delete('/remove-dealer/:companyId/:dealerId', catchAsync(async (req, res) => {
  const { companyId, dealerId } = req.params;

  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can remove dealers');
  }

  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }

  // Remove dealer from company's hierarchy
  if (company.supplyChain.dealers) {
    company.supplyChain.dealers = company.supplyChain.dealers.filter(
      id => id.toString() !== dealerId
    );
  }

  // Remove company as parent from dealer
  dealer.supplyChain.parentCompany = null;
  dealer.supplyChain.authorizedTerritories = [];

  await Promise.all([company.save(), dealer.save()]);

  res.json(new ApiResponse(200, 'Dealer removed successfully'));
}));

// Update dealer territories
router.put('/update-dealer-territories/:dealerId', [
  body('territories').isArray().withMessage('Territories must be an array'),
  body('territories.*').isString().withMessage('Each territory must be a string')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { dealerId } = req.params;
  const { territories } = req.body;

  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }

  dealer.supplyChain.authorizedTerritories = territories;
  await dealer.save();

  res.json(new ApiResponse(200, 'Dealer territories updated successfully', {
    dealer: {
      id: dealer._id,
      name: dealer.name,
      businessName: dealer.shopName,
      territories: dealer.supplyChain.authorizedTerritories
    }
  }));
}));

// Get all sellers by category for company
router.get('/sellers/:companyId/:category', catchAsync(async (req, res) => {
  const { companyId, category } = req.params;
  
  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can access seller lists');
  }

  const validCategories = ['dealers', 'wholesalers', 'traders', 'retailers'];
  if (!validCategories.includes(category)) {
    throw new ApiError(400, 'Invalid category. Must be one of: dealers, wholesalers, traders, retailers');
  }

  let sellers = [];
  if (company.supplyChain[category] && company.supplyChain[category].length > 0) {
    sellers = await Seller.find({ _id: { $in: company.supplyChain[category] } })
      .select('name shopName location sellerCategory supplyChain status verified createdAt')
      .sort({ createdAt: -1 });
  }

  res.json(new ApiResponse(200, `${category} retrieved successfully`, {
    sellers,
    count: sellers.length
  }));
}));

// Approve pending dealer registration
router.put('/approve-dealer/:dealerId', catchAsync(async (req, res) => {
  const { dealerId } = req.params;

  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  if (dealer.sellerCategory !== 'Dealer') {
    throw new ApiError(400, 'Can only approve Dealers');
  }

  dealer.status = 'approved';
  dealer.verified = true;
  await dealer.save();

  res.json(new ApiResponse(200, 'Dealer approved successfully', {
    dealer: {
      id: dealer._id,
      name: dealer.name,
      businessName: dealer.shopName,
      status: dealer.status,
      verified: dealer.verified
    }
  }));
}));

// Reject dealer registration
router.put('/reject-dealer/:dealerId', [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { dealerId } = req.params;
  const { reason } = req.body;

  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  if (dealer.sellerCategory !== 'Dealer') {
    throw new ApiError(400, 'Can only reject Dealers');
  }

  dealer.status = 'rejected';
  dealer.verificationNotes = reason;
  await dealer.save();

  res.json(new ApiResponse(200, 'Dealer rejected successfully', {
    dealer: {
      id: dealer._id,
      name: dealer.name,
      businessName: dealer.shopName,
      status: dealer.status,
      reason: dealer.verificationNotes
    }
  }));
}));

// Get all dealers for a company
router.get('/dealers/:companyId', catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { status, search } = req.query;

  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can view dealers');
  }

  // Build query
  const query = {
    $or: [
      { sellerCategory: 'Dealer' },
      { sellerType: 'dealer' }
    ],
    'supplyChain.parentCompany': companyId
  };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
  }

  const dealers = await Seller.find(query)
    .select('name shopName location sellerCategory supplyChain status verified createdAt verificationNotes')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, 'Dealers retrieved successfully', {
    dealers,
    count: dealers.length
  }));
}));

// Get pending dealer registrations
router.get('/pending-dealers/:companyId', catchAsync(async (req, res) => {
  const { companyId } = req.params;

  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can view pending dealers');
  }

  const pendingDealers = await Seller.find({
    $or: [
      { sellerCategory: 'Dealer' },
      { sellerType: 'dealer' }
    ],
    'supplyChain.parentCompany': companyId,
    status: 'pending'
  }).select('name shopName location createdAt verificationNotes');

  res.json(new ApiResponse(200, 'Pending dealers retrieved successfully', {
    pendingDealers,
    count: pendingDealers.length
  }));
}));

// Get hierarchy statistics
router.get('/stats/:companyId', catchAsync(async (req, res) => {
  const { companyId } = req.params;

  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can access hierarchy statistics');
  }

  const stats = {
    totalDealers: company.supplyChain.dealers ? company.supplyChain.dealers.length : 0,
    totalWholesalers: company.supplyChain.wholesalers ? company.supplyChain.wholesalers.length : 0,
    totalTraders: company.supplyChain.traders ? company.supplyChain.traders.length : 0,
    totalStorekeepers: company.supplyChain.retailers ? company.supplyChain.retailers.length : 0,
    pendingDealers: 0,
    approvedDealers: 0,
    rejectedDealers: 0
  };

  // Get dealer status counts
  if (company.supplyChain.dealers && company.supplyChain.dealers.length > 0) {
    const dealers = await Seller.find({ _id: { $in: company.supplyChain.dealers } })
      .select('status');
    
    dealers.forEach(dealer => {
      switch (dealer.status) {
        case 'pending':
          stats.pendingDealers++;
          break;
        case 'approved':
          stats.approvedDealers++;
          break;
        case 'rejected':
          stats.rejectedDealers++;
          break;
      }
    });
  }

  res.json(new ApiResponse(200, 'Hierarchy statistics retrieved successfully', {
    stats
  }));
}));

// Get company products for dealer assignment
router.get('/company-products/:companyId', catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { search, category } = req.query;

  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can access product management');
  }

  // Build query for company products
  const Product = require('../models/Product');
  const query = { sellerId: companyId, isActive: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query)
    .select('title description price originalPrice category subcategory images stock tieredPricing')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, 'Company products retrieved successfully', {
    products,
    count: products.length
  }));
}));

// Search available dealers on GoSeller platform
router.get('/search-available-dealers/:companyId', catchAsync(async (req, res) => {
  const { companyId } = req.params;
  const { search, page = 1, limit = 20 } = req.query;

  const company = await Seller.findById(companyId);
  if (!company) {
    throw new ApiError(404, 'Company not found');
  }
  if (company.sellerCategory !== 'Company') {
    throw new ApiError(403, 'Only Company sellers can search for dealers');
  }

  // Build search query
  const searchQuery = {
    $or: [
      { sellerCategory: 'Dealer' },
      { sellerType: 'dealer' }
    ],
    // Include both approved and pending dealers
    status: { $in: ['approved', 'pending'] },
    // Exclude dealers already in this company's hierarchy
    _id: { $nin: company.supplyChain.dealers || [] }
  };

  // Add search term if provided
  if (search) {
    searchQuery.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Get total count for pagination
  const totalCount = await Seller.countDocuments(searchQuery);

  // Get dealers with pagination
  const dealers = await Seller.find(searchQuery)
    .select('name shopName location sellerCategory status verified createdAt businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json(new ApiResponse(200, 'Available dealers retrieved successfully', {
    dealers,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total: totalCount,
      pages: Math.ceil(totalCount / limitNum)
    }
  }));
}));

// Add wholesaler to dealer
router.post('/add-wholesaler', [
  body('dealerId').isMongoId().withMessage('Valid dealer ID is required'),
  body('wholesalerId').isMongoId().withMessage('Valid wholesaler ID is required'),
  body('territories').isArray().withMessage('Territories must be an array'),
  body('territories.*').isString().withMessage('Each territory must be a string'),
  body('assignedProducts').isArray().withMessage('Assigned products must be an array'),
  body('assignedProducts.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('assignedProducts.*.wholesalerPrice').isNumeric().withMessage('Wholesaler price must be a number'),
  body('assignedProducts.*.commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('priceRules').optional().isObject().withMessage('Price rules must be an object'),
  body('commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
  body('contractDuration').optional().isNumeric().withMessage('Contract duration must be a number')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { 
    dealerId, 
    wholesalerId, 
    territories, 
    assignedProducts, 
    priceRules, 
    commissionMargin, 
    expiryDate, 
    contractDuration 
  } = req.body;

  // Verify dealer exists and is a Dealer
  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  if (dealer.sellerCategory !== 'Dealer' && dealer.sellerType !== 'dealer') {
    throw new ApiError(403, 'Only Dealers can add wholesalers');
  }

  // Verify wholesaler exists and is a Wholesaler
  const wholesaler = await Seller.findById(wholesalerId);
  if (!wholesaler) {
    throw new ApiError(404, 'Wholesaler not found');
  }
  if (wholesaler.sellerCategory !== 'Wholesaler' && wholesaler.sellerType !== 'wholesaler') {
    throw new ApiError(400, 'Can only add Wholesalers to Dealer hierarchy');
  }

  // Check if wholesaler is already in the hierarchy
  if (dealer.supplyChain.wholesalers && dealer.supplyChain.wholesalers.includes(wholesalerId)) {
    throw new ApiError(409, 'Wholesaler is already in the dealer hierarchy');
  }

  // Verify assigned products exist and belong to the dealer
  const Product = require('../models/Product');
  const productIds = assignedProducts.map(p => p.productId);
  const products = await Product.find({ 
    _id: { $in: productIds }, 
    sellerId: dealerId 
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'Some assigned products do not exist or do not belong to the dealer');
  }

  // Add wholesaler to dealer's hierarchy
  if (!dealer.supplyChain.wholesalers) {
    dealer.supplyChain.wholesalers = [];
  }
  dealer.supplyChain.wholesalers.push(wholesalerId);

  // Update wholesaler's parent dealer and territories
  wholesaler.supplyChain.parentCompany = dealerId;
  wholesaler.supplyChain.authorizedTerritories = territories;

  // Add wholesaler-specific configuration
  wholesaler.supplyChain.wholesalerConfig = {
    assignedProducts: assignedProducts.map(product => ({
      productId: product.productId,
      wholesalerPrice: product.wholesalerPrice,
      commissionMargin: product.commissionMargin || commissionMargin || 0,
      maxStockLimit: product.maxStockLimit || null,
      priceRules: product.priceRules || priceRules || {}
    })),
    commissionMargin: commissionMargin || 0,
    priceRules: priceRules || {},
    contractExpiry: expiryDate ? new Date(expiryDate) : null,
    contractDuration: contractDuration || null,
    addedAt: new Date()
  };

  await Promise.all([dealer.save(), wholesaler.save()]);

  res.json(new ApiResponse(200, 'Wholesaler added successfully with product distribution', {
    wholesaler: {
      id: wholesaler._id,
      name: wholesaler.name,
      businessName: wholesaler.shopName,
      territories: wholesaler.supplyChain.authorizedTerritories,
      assignedProducts: wholesaler.supplyChain.wholesalerConfig.assignedProducts,
      commissionMargin: wholesaler.supplyChain.wholesalerConfig.commissionMargin,
      contractExpiry: wholesaler.supplyChain.wholesalerConfig.contractExpiry
    }
  }));
}));

// Remove wholesaler from dealer
router.delete('/remove-wholesaler/:dealerId/:wholesalerId', catchAsync(async (req, res) => {
  const { dealerId, wholesalerId } = req.params;

  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  if (dealer.sellerCategory !== 'Dealer' && dealer.sellerType !== 'dealer') {
    throw new ApiError(403, 'Only Dealers can remove wholesalers');
  }

  const wholesaler = await Seller.findById(wholesalerId);
  if (!wholesaler) {
    throw new ApiError(404, 'Wholesaler not found');
  }

  // Remove wholesaler from dealer's hierarchy
  if (dealer.supplyChain.wholesalers) {
    dealer.supplyChain.wholesalers = dealer.supplyChain.wholesalers.filter(
      id => id.toString() !== wholesalerId
    );
  }

  // Remove dealer as parent from wholesaler
  wholesaler.supplyChain.parentCompany = null;
  wholesaler.supplyChain.authorizedTerritories = [];

  await Promise.all([dealer.save(), wholesaler.save()]);

  res.json(new ApiResponse(200, 'Wholesaler removed successfully'));
}));

// Get dealer's wholesaler hierarchy
router.get('/dealer-hierarchy/:dealerId', catchAsync(async (req, res) => {
  const { dealerId } = req.params;
  
  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  
  if (dealer.sellerCategory !== 'Dealer' && dealer.sellerType !== 'dealer') {
    throw new ApiError(403, 'Only Dealer sellers can access hierarchy management');
  }

  // Get all downstream sellers
  const hierarchy = {
    dealer: {
      id: dealer._id,
      name: dealer.name,
      businessName: dealer.shopName,
      category: dealer.sellerCategory,
      location: dealer.location
    },
    wholesalers: [],
    traders: [],
    storekeepers: []
  };

  // Fetch wholesalers
  if (dealer.supplyChain.wholesalers && dealer.supplyChain.wholesalers.length > 0) {
    const wholesalers = await Seller.find({ _id: { $in: dealer.supplyChain.wholesalers } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.wholesalers = wholesalers;
  }

  // Fetch traders
  if (dealer.supplyChain.traders && dealer.supplyChain.traders.length > 0) {
    const traders = await Seller.find({ _id: { $in: dealer.supplyChain.traders } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.traders = traders;
  }

  // Fetch storekeepers
  if (dealer.supplyChain.retailers && dealer.supplyChain.retailers.length > 0) {
    const storekeepers = await Seller.find({ _id: { $in: dealer.supplyChain.retailers } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.storekeepers = storekeepers;
  }

  res.json(new ApiResponse(200, 'Dealer hierarchy retrieved successfully', {
    hierarchy
  }));
}));

// Search available wholesalers for dealer
router.get('/search-available-wholesalers/:dealerId', catchAsync(async (req, res) => {
  const { dealerId } = req.params;
  const { search, page = 1, limit = 20 } = req.query;

  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  if (dealer.sellerCategory !== 'Dealer' && dealer.sellerType !== 'dealer') {
    throw new ApiError(403, 'Only Dealers can search for wholesalers');
  }

  // Build search query
  const searchQuery = {
    $or: [
      { sellerCategory: 'Wholesaler' },
      { sellerType: 'wholesaler' }
    ],
    // Include both approved and pending wholesalers
    status: { $in: ['approved', 'pending'] },
    // Exclude wholesalers already in this dealer's hierarchy
    _id: { $nin: dealer.supplyChain.wholesalers || [] }
  };

  // Add search term if provided
  if (search) {
    searchQuery.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Get total count for pagination
  const totalCount = await Seller.countDocuments(searchQuery);

  // Get wholesalers with pagination
  const wholesalers = await Seller.find(searchQuery)
    .select('name shopName location sellerCategory status verified createdAt businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json(new ApiResponse(200, 'Available wholesalers retrieved successfully', {
    wholesalers,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total: totalCount,
      pages: Math.ceil(totalCount / limitNum)
    }
  }));
}));

// Get dealer products for wholesaler assignment
router.get('/dealer-products/:dealerId', catchAsync(async (req, res) => {
  const { dealerId } = req.params;
  const { search, category } = req.query;

  const dealer = await Seller.findById(dealerId);
  if (!dealer) {
    throw new ApiError(404, 'Dealer not found');
  }
  if (dealer.sellerCategory !== 'Dealer' && dealer.sellerType !== 'dealer') {
    throw new ApiError(403, 'Only Dealers can access product lists');
  }

  // Build query for dealer's products
  const Product = require('../models/Product');
  const query = { sellerId: dealerId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query)
    .select('name description price category images stockQuantity')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, 'Dealer products retrieved successfully', {
    products,
    count: products.length
  }));
}));

// Add trader to wholesaler
router.post('/add-trader', [
  body('wholesalerId').isMongoId().withMessage('Valid wholesaler ID is required'),
  body('traderId').isMongoId().withMessage('Valid trader ID is required'),
  body('territories').isArray().withMessage('Territories must be an array'),
  body('territories.*').isString().withMessage('Each territory must be a string'),
  body('assignedProducts').isArray().withMessage('Assigned products must be an array'),
  body('assignedProducts.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('assignedProducts.*.traderPrice').isNumeric().withMessage('Trader price must be a number'),
  body('assignedProducts.*.commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('priceRules').optional().isObject().withMessage('Price rules must be an object'),
  body('commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
  body('contractDuration').optional().isNumeric().withMessage('Contract duration must be a number')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { 
    wholesalerId, 
    traderId, 
    territories, 
    assignedProducts, 
    priceRules, 
    commissionMargin, 
    expiryDate, 
    contractDuration 
  } = req.body;

  // Verify wholesaler exists and is a Wholesaler
  const wholesaler = await Seller.findById(wholesalerId);
  if (!wholesaler) {
    throw new ApiError(404, 'Wholesaler not found');
  }
  if (wholesaler.sellerCategory !== 'Wholesaler' && wholesaler.sellerType !== 'wholesaler') {
    throw new ApiError(403, 'Only Wholesalers can add traders');
  }

  // Verify trader exists and is a Trader
  const trader = await Seller.findById(traderId);
  if (!trader) {
    throw new ApiError(404, 'Trader not found');
  }
  if (trader.sellerCategory !== 'Trader' && trader.sellerType !== 'trader') {
    throw new ApiError(400, 'Can only add Traders to Wholesaler hierarchy');
  }

  // Check if trader is already in the hierarchy
  if (wholesaler.supplyChain.traders && wholesaler.supplyChain.traders.includes(traderId)) {
    throw new ApiError(409, 'Trader is already in the wholesaler hierarchy');
  }

  // Verify assigned products exist and belong to the wholesaler
  const Product = require('../models/Product');
  const productIds = assignedProducts.map(p => p.productId);
  const products = await Product.find({ 
    _id: { $in: productIds }, 
    sellerId: wholesalerId 
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'Some assigned products do not exist or do not belong to the wholesaler');
  }

  // Add trader to wholesaler's hierarchy
  if (!wholesaler.supplyChain.traders) {
    wholesaler.supplyChain.traders = [];
  }
  wholesaler.supplyChain.traders.push(traderId);

  // Update trader's parent wholesaler and territories
  trader.supplyChain.parentCompany = wholesalerId;
  trader.supplyChain.authorizedTerritories = territories;

  // Add trader-specific configuration
  trader.supplyChain.traderConfig = {
    assignedProducts: assignedProducts.map(product => ({
      productId: product.productId,
      traderPrice: product.traderPrice,
      commissionMargin: product.commissionMargin || commissionMargin || 0,
      maxStockLimit: product.maxStockLimit || null,
      priceRules: product.priceRules || priceRules || {}
    })),
    commissionMargin: commissionMargin || 0,
    priceRules: priceRules || {},
    contractExpiry: expiryDate ? new Date(expiryDate) : null,
    contractDuration: contractDuration || null,
    addedAt: new Date()
  };

  await Promise.all([wholesaler.save(), trader.save()]);

  res.json(new ApiResponse(200, 'Trader added successfully with product distribution', {
    trader: {
      id: trader._id,
      name: trader.name,
      businessName: trader.shopName,
      territories: trader.supplyChain.authorizedTerritories,
      assignedProducts: trader.supplyChain.traderConfig.assignedProducts,
      commissionMargin: trader.supplyChain.traderConfig.commissionMargin,
      contractExpiry: trader.supplyChain.traderConfig.contractExpiry
    }
  }));
}));

// Remove trader from wholesaler
router.delete('/remove-trader/:wholesalerId/:traderId', catchAsync(async (req, res) => {
  const { wholesalerId, traderId } = req.params;

  const wholesaler = await Seller.findById(wholesalerId);
  if (!wholesaler) {
    throw new ApiError(404, 'Wholesaler not found');
  }
  if (wholesaler.sellerCategory !== 'Wholesaler' && wholesaler.sellerType !== 'wholesaler') {
    throw new ApiError(403, 'Only Wholesalers can remove traders');
  }

  const trader = await Seller.findById(traderId);
  if (!trader) {
    throw new ApiError(404, 'Trader not found');
  }

  // Remove trader from wholesaler's hierarchy
  if (wholesaler.supplyChain.traders) {
    wholesaler.supplyChain.traders = wholesaler.supplyChain.traders.filter(
      id => id.toString() !== traderId
    );
  }

  // Remove wholesaler as parent from trader
  trader.supplyChain.parentCompany = null;
  trader.supplyChain.authorizedTerritories = [];

  await Promise.all([wholesaler.save(), trader.save()]);

  res.json(new ApiResponse(200, 'Trader removed successfully'));
}));

// Get wholesaler's trader hierarchy
router.get('/wholesaler-hierarchy/:wholesalerId', catchAsync(async (req, res) => {
  const { wholesalerId } = req.params;
  
  const wholesaler = await Seller.findById(wholesalerId);
  if (!wholesaler) {
    throw new ApiError(404, 'Wholesaler not found');
  }
  
  if (wholesaler.sellerCategory !== 'Wholesaler' && wholesaler.sellerType !== 'wholesaler') {
    throw new ApiError(403, 'Only Wholesaler sellers can access hierarchy management');
  }

  // Get all downstream sellers
  const hierarchy = {
    wholesaler: {
      id: wholesaler._id,
      name: wholesaler.name,
      businessName: wholesaler.shopName,
      category: wholesaler.sellerCategory,
      location: wholesaler.location
    },
    traders: [],
    storekeepers: []
  };

  // Fetch traders
  if (wholesaler.supplyChain.traders && wholesaler.supplyChain.traders.length > 0) {
    const traders = await Seller.find({ _id: { $in: wholesaler.supplyChain.traders } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.traders = traders;
  }

  // Fetch storekeepers
  if (wholesaler.supplyChain.retailers && wholesaler.supplyChain.retailers.length > 0) {
    const storekeepers = await Seller.find({ _id: { $in: wholesaler.supplyChain.retailers } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.storekeepers = storekeepers;
  }

  res.json(new ApiResponse(200, 'Wholesaler hierarchy retrieved successfully', {
    hierarchy
  }));
}));

// Search available traders for wholesaler
router.get('/search-available-traders/:wholesalerId', catchAsync(async (req, res) => {
  const { wholesalerId } = req.params;
  const { search, page = 1, limit = 20 } = req.query;

  const wholesaler = await Seller.findById(wholesalerId);
  if (!wholesaler) {
    throw new ApiError(404, 'Wholesaler not found');
  }
  if (wholesaler.sellerCategory !== 'Wholesaler' && wholesaler.sellerType !== 'wholesaler') {
    throw new ApiError(403, 'Only Wholesalers can search for traders');
  }

  // Build search query
  const searchQuery = {
    $or: [
      { sellerCategory: 'Trader' },
      { sellerType: 'trader' }
    ],
    // Include both approved and pending traders
    status: { $in: ['approved', 'pending'] },
    // Exclude traders already in this wholesaler's hierarchy
    _id: { $nin: wholesaler.supplyChain.traders || [] }
  };

  // Add search term if provided
  if (search) {
    searchQuery.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Get total count for pagination
  const totalCount = await Seller.countDocuments(searchQuery);

  // Get traders with pagination
  const traders = await Seller.find(searchQuery)
    .select('name shopName location sellerCategory status verified createdAt businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json(new ApiResponse(200, 'Available traders retrieved successfully', {
    traders,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total: totalCount,
      pages: Math.ceil(totalCount / limitNum)
    }
  }));
}));

// Get wholesaler products for trader assignment
router.get('/wholesaler-products/:wholesalerId', catchAsync(async (req, res) => {
  const { wholesalerId } = req.params;
  const { search, category } = req.query;

  const wholesaler = await Seller.findById(wholesalerId);
  if (!wholesaler) {
    throw new ApiError(404, 'Wholesaler not found');
  }
  if (wholesaler.sellerCategory !== 'Wholesaler' && wholesaler.sellerType !== 'wholesaler') {
    throw new ApiError(403, 'Only Wholesalers can access product lists');
  }

  // Build query for wholesaler's products
  const Product = require('../models/Product');
  const query = { sellerId: wholesalerId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query)
    .select('name description price category images stockQuantity')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, 'Wholesaler products retrieved successfully', {
    products,
    count: products.length
  }));
}));

// Add storekeeper to trader
router.post('/add-storekeeper', [
  body('traderId').isMongoId().withMessage('Valid trader ID is required'),
  body('storekeeperId').isMongoId().withMessage('Valid storekeeper ID is required'),
  body('territories').isArray().withMessage('Territories must be an array'),
  body('territories.*').isString().withMessage('Each territory must be a string'),
  body('assignedProducts').isArray().withMessage('Assigned products must be an array'),
  body('assignedProducts.*.productId').isMongoId().withMessage('Valid product ID is required'),
  body('assignedProducts.*.storekeeperPrice').isNumeric().withMessage('Storekeeper price must be a number'),
  body('assignedProducts.*.commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('priceRules').optional().isObject().withMessage('Price rules must be an object'),
  body('commissionMargin').optional().isNumeric().withMessage('Commission margin must be a number'),
  body('expiryDate').optional().isISO8601().withMessage('Expiry date must be a valid date'),
  body('contractDuration').optional().isNumeric().withMessage('Contract duration must be a number')
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { 
    traderId, 
    storekeeperId, 
    territories, 
    assignedProducts, 
    priceRules, 
    commissionMargin, 
    expiryDate, 
    contractDuration 
  } = req.body;

  // Verify trader exists and is a Trader
  const trader = await Seller.findById(traderId);
  if (!trader) {
    throw new ApiError(404, 'Trader not found');
  }
  if (trader.sellerCategory !== 'Trader' && trader.sellerType !== 'trader') {
    throw new ApiError(403, 'Only Traders can add storekeepers');
  }

  // Verify storekeeper exists and is a Storekeeper
  const storekeeper = await Seller.findById(storekeeperId);
  if (!storekeeper) {
    throw new ApiError(404, 'Storekeeper not found');
  }
  if (storekeeper.sellerCategory !== 'Storekeeper' && storekeeper.sellerType !== 'storekeeper') {
    throw new ApiError(400, 'Can only add Storekeepers to Trader hierarchy');
  }

  // Check if storekeeper is already in the hierarchy
  if (trader.supplyChain.storekeepers && trader.supplyChain.storekeepers.includes(storekeeperId)) {
    throw new ApiError(409, 'Storekeeper is already in the trader hierarchy');
  }

  // Verify assigned products exist and belong to the trader
  const Product = require('../models/Product');
  const productIds = assignedProducts.map(p => p.productId);
  const products = await Product.find({ 
    _id: { $in: productIds }, 
    sellerId: traderId 
  });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'Some assigned products do not exist or do not belong to the trader');
  }

  // Add storekeeper to trader's hierarchy
  if (!trader.supplyChain.storekeepers) {
    trader.supplyChain.storekeepers = [];
  }
  trader.supplyChain.storekeepers.push(storekeeperId);

  // Update storekeeper's parent trader and territories
  storekeeper.supplyChain.parentCompany = traderId;
  storekeeper.supplyChain.authorizedTerritories = territories;

  // Add storekeeper-specific configuration
  storekeeper.supplyChain.storekeeperConfig = {
    assignedProducts: assignedProducts.map(product => ({
      productId: product.productId,
      storekeeperPrice: product.storekeeperPrice,
      commissionMargin: product.commissionMargin || commissionMargin || 0,
      maxStockLimit: product.maxStockLimit || null,
      priceRules: product.priceRules || priceRules || {}
    })),
    commissionMargin: commissionMargin || 0,
    priceRules: priceRules || {},
    contractExpiry: expiryDate ? new Date(expiryDate) : null,
    contractDuration: contractDuration || null,
    addedAt: new Date()
  };

  await Promise.all([trader.save(), storekeeper.save()]);

  res.json(new ApiResponse(200, 'Storekeeper added successfully with product distribution', {
    storekeeper: {
      id: storekeeper._id,
      name: storekeeper.name,
      businessName: storekeeper.shopName,
      territories: storekeeper.supplyChain.authorizedTerritories,
      assignedProducts: storekeeper.supplyChain.storekeeperConfig.assignedProducts,
      commissionMargin: storekeeper.supplyChain.storekeeperConfig.commissionMargin,
      contractExpiry: storekeeper.supplyChain.storekeeperConfig.contractExpiry
    }
  }));
}));

// Remove storekeeper from trader
router.delete('/remove-storekeeper/:traderId/:storekeeperId', catchAsync(async (req, res) => {
  const { traderId, storekeeperId } = req.params;

  const trader = await Seller.findById(traderId);
  if (!trader) {
    throw new ApiError(404, 'Trader not found');
  }
  if (trader.sellerCategory !== 'Trader' && trader.sellerType !== 'trader') {
    throw new ApiError(403, 'Only Traders can remove storekeepers');
  }

  const storekeeper = await Seller.findById(storekeeperId);
  if (!storekeeper) {
    throw new ApiError(404, 'Storekeeper not found');
  }

  // Remove storekeeper from trader's hierarchy
  if (trader.supplyChain.storekeepers) {
    trader.supplyChain.storekeepers = trader.supplyChain.storekeepers.filter(
      id => id.toString() !== storekeeperId
    );
  }

  // Remove trader as parent from storekeeper
  storekeeper.supplyChain.parentCompany = null;
  storekeeper.supplyChain.authorizedTerritories = [];

  await Promise.all([trader.save(), storekeeper.save()]);

  res.json(new ApiResponse(200, 'Storekeeper removed successfully'));
}));

// Get trader's storekeeper hierarchy
router.get('/trader-hierarchy/:traderId', catchAsync(async (req, res) => {
  const { traderId } = req.params;
  
  const trader = await Seller.findById(traderId);
  if (!trader) {
    throw new ApiError(404, 'Trader not found');
  }
  
  if (trader.sellerCategory !== 'Trader' && trader.sellerType !== 'trader') {
    throw new ApiError(403, 'Only Trader sellers can access hierarchy management');
  }

  // Get all downstream sellers
  const hierarchy = {
    trader: {
      id: trader._id,
      name: trader.name,
      businessName: trader.shopName,
      category: trader.sellerCategory,
      location: trader.location
    },
    storekeepers: []
  };

  // Fetch storekeepers
  if (trader.supplyChain.storekeepers && trader.supplyChain.storekeepers.length > 0) {
    const storekeepers = await Seller.find({ _id: { $in: trader.supplyChain.storekeepers } })
      .select('name shopName location sellerCategory supplyChain status verified');
    hierarchy.storekeepers = storekeepers;
  }

  res.json(new ApiResponse(200, 'Trader hierarchy retrieved successfully', {
    hierarchy
  }));
}));

// Search available storekeepers for trader
router.get('/search-available-storekeepers/:traderId', catchAsync(async (req, res) => {
  const { traderId } = req.params;
  const { search, page = 1, limit = 20 } = req.query;

  const trader = await Seller.findById(traderId);
  if (!trader) {
    throw new ApiError(404, 'Trader not found');
  }
  if (trader.sellerCategory !== 'Trader' && trader.sellerType !== 'trader') {
    throw new ApiError(403, 'Only Traders can search for storekeepers');
  }

  // Build search query
  const searchQuery = {
    $or: [
      { sellerCategory: 'Storekeeper' },
      { sellerType: 'storekeeper' }
    ],
    // Include both approved and pending storekeepers
    status: { $in: ['approved', 'pending'] },
    // Exclude storekeepers already in this trader's hierarchy
    _id: { $nin: trader.supplyChain.storekeepers || [] }
  };

  // Add search term if provided
  if (search) {
    searchQuery.$or = [
      { shopName: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ];
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const limitNum = parseInt(limit);

  // Get total count for pagination
  const totalCount = await Seller.countDocuments(searchQuery);

  // Get storekeepers with pagination
  const storekeepers = await Seller.find(searchQuery)
    .select('name shopName location sellerCategory status verified createdAt businessName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json(new ApiResponse(200, 'Available storekeepers retrieved successfully', {
    storekeepers,
    pagination: {
      page: parseInt(page),
      limit: limitNum,
      total: totalCount,
      pages: Math.ceil(totalCount / limitNum)
    }
  }));
}));

// Get trader products for storekeeper assignment
router.get('/trader-products/:traderId', catchAsync(async (req, res) => {
  const { traderId } = req.params;
  const { search, category } = req.query;

  const trader = await Seller.findById(traderId);
  if (!trader) {
    throw new ApiError(404, 'Trader not found');
  }
  if (trader.sellerCategory !== 'Trader' && trader.sellerType !== 'trader') {
    throw new ApiError(403, 'Only Traders can access product lists');
  }

  // Build query for trader's products
  const Product = require('../models/Product');
  const query = { sellerId: traderId };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) {
    query.category = category;
  }

  const products = await Product.find(query)
    .select('name description price category images stockQuantity')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, 'Trader products retrieved successfully', {
    products,
    count: products.length
  }));
}));

module.exports = router; 