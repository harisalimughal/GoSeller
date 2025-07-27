const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { catchAsync } = require('../utils/catchAsync');
const { ApiError } = require('../utils/ApiError');
const { ApiResponse } = require('../utils/ApiResponse');

const router = express.Router();

// Get all categories
router.get('/', catchAsync(async (req, res) => {
  const { page = 1, limit = 20, search, parentId } = req.query;

  const query = {};

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  if (parentId) {
    query.parentId = parentId;
  } else if (parentId === 'null') {
    query.parentId = null;
  }

  const categories = await Category.find(query)
    .populate('parentId', 'name')
    .populate('children', 'name')
    .sort({ name: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Category.countDocuments(query);

  res.json(new ApiResponse(200, 'Categories retrieved successfully', {
    categories,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }));
}));

// Get category by ID
router.get('/:id', catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('parentId', 'name')
    .populate('children', 'name')
    .populate('products', 'name price images');

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.json(new ApiResponse(200, 'Category retrieved successfully', { category }));
}));

// Create new category
router.post('/', [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().trim(),
  body('parentId').optional().isMongoId(),
  body('image').optional().isURL(),
  body('isActive').optional().isBoolean()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { name, description, parentId, image, isActive = true } = req.body;

  // Check if category with same name exists
  const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existingCategory) {
    throw new ApiError(409, 'Category with this name already exists');
  }

  const category = new Category({
    name,
    description,
    parentId,
    image,
    isActive
  });

  await category.save();

  res.status(201).json(new ApiResponse(201, 'Category created successfully', { category }));
}));

// Update category
router.put('/:id', [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('parentId').optional().isMongoId(),
  body('image').optional().isURL(),
  body('isActive').optional().isBoolean()
], catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const { name, description, parentId, image, isActive } = req.body;

  // Check if name is being changed and if it conflicts
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    });
    if (existingCategory) {
      throw new ApiError(409, 'Category with this name already exists');
    }
  }

  // Update fields
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (parentId !== undefined) category.parentId = parentId;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  res.json(new ApiResponse(200, 'Category updated successfully', { category }));
}));

// Delete category
router.delete('/:id', catchAsync(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check if category has children
  const hasChildren = await Category.exists({ parentId: req.params.id });
  if (hasChildren) {
    throw new ApiError(400, 'Cannot delete category with subcategories');
  }

  // Check if category has products
  const hasProducts = await require('../models/Product').exists({ categoryId: req.params.id });
  if (hasProducts) {
    throw new ApiError(400, 'Cannot delete category with products');
  }

  await Category.findByIdAndDelete(req.params.id);

  res.json(new ApiResponse(200, 'Category deleted successfully', {
    message: 'Category deleted successfully'
  }));
}));

// Get category tree
router.get('/tree/all', catchAsync(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('children', 'name description image isActive')
    .sort({ name: 1 });

  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => String(item.parentId) === String(parentId))
      .map(item => ({
        ...item.toObject(),
        children: buildTree(items, item._id)
      }));
  };

  const categoryTree = buildTree(categories);

  res.json(new ApiResponse(200, 'Category tree retrieved successfully', {
    categories: categoryTree
  }));
}));

// Get category statistics
router.get('/stats/overview', catchAsync(async (req, res) => {
  const totalCategories = await Category.countDocuments();
  const activeCategories = await Category.countDocuments({ isActive: true });
  const parentCategories = await Category.countDocuments({ parentId: null });
  const subCategories = await Category.countDocuments({ parentId: { $ne: null } });

  res.json(new ApiResponse(200, 'Category statistics retrieved successfully', {
    stats: {
      total: totalCategories,
      active: activeCategories,
      parent: parentCategories,
      sub: subCategories
    }
  }));
}));

module.exports = router;
