const Web3 = require('web3');
const ethers = require('ethers');
const crypto = require('crypto');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { catchAsync } = require('../utils/catchAsync');

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.provider = null;
    this.contracts = {};
    this.initializeBlockchain();
  }

  /**
   * Initialize blockchain connections
   */
  async initializeBlockchain() {
    try {
      // Initialize Web3 with multiple networks
      this.web3 = {
        ethereum: new Web3(process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID'),
        polygon: new Web3(process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'),
        bsc: new Web3(process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org'),
        testnet: new Web3(process.env.TESTNET_RPC_URL || 'https://goerli.infura.io/v3/YOUR_PROJECT_ID')
      };

      // Initialize providers
      this.provider = {
        ethereum: new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL),
        polygon: new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL),
        bsc: new ethers.providers.JsonRpcProvider(process.env.BSC_RPC_URL),
        testnet: new ethers.providers.JsonRpcProvider(process.env.TESTNET_RPC_URL)
      };

      // Initialize smart contracts
      await this.initializeContracts();

      console.log('✅ Blockchain service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing blockchain service:', error);
    }
  }

  /**
   * Initialize smart contracts
   */
  async initializeContracts() {
    try {
      // Payment contract ABI (simplified)
      const paymentContractABI = [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "recipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "processPayment",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];

      // Initialize contracts for different networks
      const networks = ['ethereum', 'polygon', 'bsc', 'testnet'];

      for (const network of networks) {
        if (this.provider[network]) {
          this.contracts[network] = {
            payment: new ethers.Contract(
              process.env[`${network.toUpperCase()}_PAYMENT_CONTRACT_ADDRESS`] || '0x0000000000000000000000000000000000000000',
              paymentContractABI,
              this.provider[network]
            ),
            escrow: new ethers.Contract(
              process.env[`${network.toUpperCase()}_ESCROW_CONTRACT_ADDRESS`] || '0x0000000000000000000000000000000000000000',
              paymentContractABI,
              this.provider[network]
            )
          };
        }
      }
    } catch (error) {
      console.error('Error initializing contracts:', error);
    }
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCryptocurrencies = catchAsync(async (req, res) => {
    const cryptocurrencies = [
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        network: 'Ethereum',
        decimals: 18,
        icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
        isActive: true
      },
      {
        id: 'polygon',
        name: 'Polygon',
        symbol: 'MATIC',
        network: 'Polygon',
        decimals: 18,
        icon: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
        isActive: true
      },
      {
        id: 'binance',
        name: 'Binance Coin',
        symbol: 'BNB',
        network: 'BSC',
        decimals: 18,
        icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
        isActive: true
      },
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        network: 'Bitcoin',
        decimals: 8,
        icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
        isActive: true
      },
      {
        id: 'usdt',
        name: 'Tether USD',
        symbol: 'USDT',
        network: 'Ethereum',
        decimals: 6,
        icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        isActive: true
      }
    ];

    res.status(200).json({
      success: true,
      data: cryptocurrencies,
      message: 'Supported cryptocurrencies retrieved successfully'
    });
  });

  /**
   * Create crypto payment
   */
  createCryptoPayment = catchAsync(async (req, res) => {
    const { orderId, cryptocurrency, amount, walletAddress } = req.body;

    if (!orderId || !cryptocurrency || !amount || !walletAddress) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    // Validate wallet address
    if (!this.isValidAddress(walletAddress, cryptocurrency)) {
      throw new ApiError(400, 'Invalid wallet address');
    }

    // Generate payment ID
    const paymentId = crypto.randomBytes(32).toString('hex');

    // Calculate crypto amount based on current exchange rate
    const cryptoAmount = await this.convertToCrypto(amount, cryptocurrency);

    // Create payment record
    const payment = {
      id: paymentId,
      orderId: orderId,
      cryptocurrency: cryptocurrency,
      amount: amount,
      cryptoAmount: cryptoAmount,
      walletAddress: walletAddress,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };

    // Store payment in database (you would create a Payment model)
    // await Payment.create(payment);

    // Generate QR code for payment
    const qrCodeData = this.generatePaymentQRCode(payment);

    res.status(200).json({
      success: true,
      data: {
        payment,
        qrCode: qrCodeData,
        paymentUrl: this.generatePaymentUrl(payment)
      },
      message: 'Crypto payment created successfully'
    });
  });

  /**
   * Process crypto payment
   */
  processCryptoPayment = catchAsync(async (req, res) => {
    const { paymentId, transactionHash, network } = req.body;

    if (!paymentId || !transactionHash || !network) {
      throw new ApiError(400, 'Missing required fields');
    }

    try {
      // Verify transaction on blockchain
      const transaction = await this.verifyTransaction(transactionHash, network);

      if (!transaction) {
        throw new ApiError(400, 'Invalid transaction');
      }

      // Update payment status
      // await Payment.findByIdAndUpdate(paymentId, {
      //   status: 'completed',
      //   transactionHash: transactionHash,
      //   confirmedAt: new Date()
      // });

      // Update order status
      // await Order.findByIdAndUpdate(order.orderId, {
      //   paymentStatus: 'paid',
      //   status: 'confirmed'
      // });

      res.status(200).json({
        success: true,
        data: { transaction },
        message: 'Crypto payment processed successfully'
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to process crypto payment');
    }
  });

  /**
   * Get payment status
   */
  getPaymentStatus = catchAsync(async (req, res) => {
    const { paymentId } = req.params;

    // Get payment from database
    // const payment = await Payment.findById(paymentId);

    // Mock payment data
    const payment = {
      id: paymentId,
      status: 'pending',
      amount: 100,
      cryptoAmount: 0.05,
      cryptocurrency: 'ETH',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };

    if (!payment) {
      throw new ApiError(404, 'Payment not found');
    }

    res.status(200).json({
      success: true,
      data: payment,
      message: 'Payment status retrieved successfully'
    });
  });

  /**
   * Create smart contract for escrow
   */
  createEscrowContract = catchAsync(async (req, res) => {
    const { orderId, buyerAddress, sellerAddress, amount, cryptocurrency } = req.body;

    if (!orderId || !buyerAddress || !sellerAddress || !amount || !cryptocurrency) {
      throw new ApiError(400, 'Missing required fields');
    }

    try {
      // Create escrow contract
      const escrowData = await this.deployEscrowContract({
        buyerAddress,
        sellerAddress,
        amount,
        cryptocurrency,
        orderId
      });

      res.status(200).json({
        success: true,
        data: escrowData,
        message: 'Escrow contract created successfully'
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to create escrow contract');
    }
  });

  /**
   * Release escrow funds
   */
  releaseEscrowFunds = catchAsync(async (req, res) => {
    const { contractAddress, orderId } = req.body;

    if (!contractAddress || !orderId) {
      throw new ApiError(400, 'Missing required fields');
    }

    try {
      // Release funds from escrow
      const result = await this.releaseFunds(contractAddress, orderId);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Escrow funds released successfully'
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to release escrow funds');
    }
  });

  /**
   * Get blockchain transaction
   */
  getTransaction = catchAsync(async (req, res) => {
    const { transactionHash, network } = req.params;

    if (!transactionHash || !network) {
      throw new ApiError(400, 'Missing required fields');
    }

    try {
      const transaction = await this.getTransactionDetails(transactionHash, network);

      res.status(200).json({
        success: true,
        data: transaction,
        message: 'Transaction details retrieved successfully'
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to get transaction details');
    }
  });

  /**
   * Get wallet balance
   */
  getWalletBalance = catchAsync(async (req, res) => {
    const { walletAddress, cryptocurrency } = req.params;

    if (!walletAddress || !cryptocurrency) {
      throw new ApiError(400, 'Missing required fields');
    }

    try {
      const balance = await this.getBalance(walletAddress, cryptocurrency);

      res.status(200).json({
        success: true,
        data: { balance, walletAddress, cryptocurrency },
        message: 'Wallet balance retrieved successfully'
      });
    } catch (error) {
      throw new ApiError(500, 'Failed to get wallet balance');
    }
  });

  /**
   * Validate wallet address
   */
  isValidAddress(address, cryptocurrency) {
    try {
      switch (cryptocurrency.toLowerCase()) {
        case 'ethereum':
        case 'polygon':
        case 'binance':
          return ethers.utils.isAddress(address);
        case 'bitcoin':
          // Add Bitcoin address validation
          return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert USD to cryptocurrency
   */
  async convertToCrypto(usdAmount, cryptocurrency) {
    try {
      // In a real implementation, you would fetch current exchange rates
      const exchangeRates = {
        'ethereum': 2000, // 1 ETH = $2000
        'polygon': 1.5,   // 1 MATIC = $1.5
        'binance': 300,   // 1 BNB = $300
        'bitcoin': 40000, // 1 BTC = $40000
        'usdt': 1         // 1 USDT = $1
      };

      const rate = exchangeRates[cryptocurrency.toLowerCase()] || 1;
      return usdAmount / rate;
    } catch (error) {
      throw new Error('Failed to convert currency');
    }
  }

  /**
   * Generate payment QR code
   */
  generatePaymentQRCode(payment) {
    const qrData = {
      address: payment.walletAddress,
      amount: payment.cryptoAmount,
      currency: payment.cryptocurrency,
      paymentId: payment.id
    };

    return JSON.stringify(qrData);
  }

  /**
   * Generate payment URL
   */
  generatePaymentUrl(payment) {
    const baseUrls = {
      'ethereum': 'ethereum:',
      'polygon': 'polygon:',
      'binance': 'bsc:',
      'bitcoin': 'bitcoin:',
      'usdt': 'ethereum:'
    };

    const baseUrl = baseUrls[payment.cryptocurrency.toLowerCase()] || 'ethereum:';
    return `${baseUrl}${payment.walletAddress}?amount=${payment.cryptoAmount}`;
  }

  /**
   * Verify transaction on blockchain
   */
  async verifyTransaction(transactionHash, network) {
    try {
      const provider = this.provider[network.toLowerCase()];
      if (!provider) {
        throw new Error('Network not supported');
      }

      const transaction = await provider.getTransaction(transactionHash);
      const receipt = await provider.getTransactionReceipt(transactionHash);

      return {
        hash: transactionHash,
        from: transaction.from,
        to: transaction.to,
        value: ethers.utils.formatEther(transaction.value),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations
      };
    } catch (error) {
      console.error('Transaction verification error:', error);
      return null;
    }
  }

  /**
   * Deploy escrow contract
   */
  async deployEscrowContract(contractData) {
    try {
      // In a real implementation, you would deploy an actual smart contract
      const contractAddress = '0x' + crypto.randomBytes(20).toString('hex');

      return {
        contractAddress,
        buyerAddress: contractData.buyerAddress,
        sellerAddress: contractData.sellerAddress,
        amount: contractData.amount,
        cryptocurrency: contractData.cryptocurrency,
        orderId: contractData.orderId,
        status: 'deployed'
      };
    } catch (error) {
      throw new Error('Failed to deploy escrow contract');
    }
  }

  /**
   * Release funds from escrow
   */
  async releaseFunds(contractAddress, orderId) {
    try {
      // In a real implementation, you would call the smart contract
      return {
        contractAddress,
        orderId,
        status: 'released',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error('Failed to release funds');
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(transactionHash, network) {
    try {
      const provider = this.provider[network.toLowerCase()];
      if (!provider) {
        throw new Error('Network not supported');
      }

      const transaction = await provider.getTransaction(transactionHash);
      const receipt = await provider.getTransactionReceipt(transactionHash);

      return {
        hash: transactionHash,
        from: transaction.from,
        to: transaction.to,
        value: ethers.utils.formatEther(transaction.value),
        gasPrice: ethers.utils.formatUnits(transaction.gasPrice, 'gwei'),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
        blockNumber: receipt.blockNumber,
        confirmations: receipt.confirmations,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error('Failed to get transaction details');
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(walletAddress, cryptocurrency) {
    try {
      const network = this.getNetworkForCurrency(cryptocurrency);
      const provider = this.provider[network.toLowerCase()];

      if (!provider) {
        throw new Error('Network not supported');
      }

      const balance = await provider.getBalance(walletAddress);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      throw new Error('Failed to get wallet balance');
    }
  }

  /**
   * Get network for cryptocurrency
   */
  getNetworkForCurrency(cryptocurrency) {
    const networkMap = {
      'ethereum': 'ethereum',
      'polygon': 'polygon',
      'binance': 'bsc',
      'bitcoin': 'bitcoin',
      'usdt': 'ethereum'
    };

    return networkMap[cryptocurrency.toLowerCase()] || 'ethereum';
  }
}

module.exports = new BlockchainService();
