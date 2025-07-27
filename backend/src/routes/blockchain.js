const express = require('express');
const { ApiResponse } = require('../utils/ApiResponse');
const { ApiError } = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

const router = express.Router();

// Blockchain status
router.get('/status', catchAsync(async (req, res) => {
  res.json(new ApiResponse(200, { status: 'connected' }, 'Blockchain status retrieved'));
}));

module.exports = router;
