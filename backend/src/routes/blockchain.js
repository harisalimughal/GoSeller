const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/blockchain/cryptocurrencies
 * @desc    Get supported cryptocurrencies
 * @access  Public
 */
router.get('/cryptocurrencies', blockchainService.getSupportedCryptocurrencies);

/**
 * @route   POST /api/blockchain/payments
 * @desc    Create crypto payment
 * @access  Private
 */
router.post('/payments', auth, blockchainService.createCryptoPayment);

/**
 * @route   POST /api/blockchain/payments/process
 * @desc    Process crypto payment
 * @access  Private
 */
router.post('/payments/process', auth, blockchainService.processCryptoPayment);

/**
 * @route   GET /api/blockchain/payments/:paymentId/status
 * @desc    Get payment status
 * @access  Private
 */
router.get('/payments/:paymentId/status', auth, blockchainService.getPaymentStatus);

/**
 * @route   POST /api/blockchain/escrow
 * @desc    Create escrow contract
 * @access  Private
 */
router.post('/escrow', auth, blockchainService.createEscrowContract);

/**
 * @route   POST /api/blockchain/escrow/release
 * @desc    Release escrow funds
 * @access  Private
 */
router.post('/escrow/release', auth, blockchainService.releaseEscrowFunds);

/**
 * @route   GET /api/blockchain/transactions/:network/:transactionHash
 * @desc    Get blockchain transaction
 * @access  Public
 */
router.get('/transactions/:network/:transactionHash', blockchainService.getTransaction);

/**
 * @route   GET /api/blockchain/balance/:cryptocurrency/:walletAddress
 * @desc    Get wallet balance
 * @access  Public
 */
router.get('/balance/:cryptocurrency/:walletAddress', blockchainService.getWalletBalance);

module.exports = router;
