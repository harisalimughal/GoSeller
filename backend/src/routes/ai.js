const express = require('express');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

const router = express.Router();

// AI recommendations
router.get('/recommendations', catchAsync(async (req, res) => {
  res.json(new ApiResponse(200, { recommendations: [] }, 'AI recommendations retrieved'));
}));

module.exports = router;
