const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const { ApiError } = require('../utils/ApiError');

class WalletDistributionService {
  constructor() {
    // Distribution percentages
    this.distributionPercentages = {
      seller: 80,
      subFranchise: 5,
      masterFranchise: 2,
      corporateFranchise: 1,
      company: 10,
      rider: 50 // Fixed amount in PKR
    };
  }

  /**
   * Distribute order payment to all parties
   */
  async distributeOrderPayment(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate('sellerId', 'name email SQL_level')
        .populate('buyerId', 'name email');

      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      if (order.payment_status !== 'paid') {
        throw new ApiError(400, 'Order payment not completed');
      }

      const orderAmount = order.totalAmount;
      const distribution = this.calculateDistribution(orderAmount, order.sellerId.SQL_level);

      // Get or create wallets for all parties
      const wallets = await this.getOrCreateWallets(order);

      // Create transactions for each party
      const transactions = await this.createDistributionTransactions(order, distribution, wallets);

      // Update wallet balances
      await this.updateWalletBalances(wallets, distribution);

      console.log(`💰 Order ${orderId} payment distributed successfully`);
      return {
        orderId,
        distribution,
        transactions,
        totalDistributed: orderAmount
      };
    } catch (error) {
      console.error('❌ Error distributing order payment:', error);
      throw error;
    }
  }

  /**
   * Calculate distribution amounts based on order amount and SQL level
   */
  calculateDistribution(orderAmount, sellerSQLLevel) {
    const baseAmount = orderAmount;
    const distribution = {};

    // Calculate percentages based on SQL level
    let sellerPercentage = this.distributionPercentages.seller;
    let subFranchisePercentage = this.distributionPercentages.subFranchise;
    let masterFranchisePercentage = this.distributionPercentages.masterFranchise;
    let corporateFranchisePercentage = this.distributionPercentages.corporateFranchise;
    let companyPercentage = this.distributionPercentages.company;

    // Adjust percentages based on SQL level
    switch (sellerSQLLevel) {
      case 'VIP':
        sellerPercentage += 5;
        companyPercentage -= 5;
        break;
      case 'High':
        sellerPercentage += 3;
        companyPercentage -= 3;
        break;
      case 'Normal':
        sellerPercentage += 1;
        companyPercentage -= 1;
        break;
    }

    // Calculate amounts
    distribution.seller = {
      amount: (baseAmount * sellerPercentage) / 100,
      percentage: sellerPercentage
    };

    distribution.subFranchise = {
      amount: (baseAmount * subFranchisePercentage) / 100,
      percentage: subFranchisePercentage
    };

    distribution.masterFranchise = {
      amount: (baseAmount * masterFranchisePercentage) / 100,
      percentage: masterFranchisePercentage
    };

    distribution.corporateFranchise = {
      amount: (baseAmount * corporateFranchisePercentage) / 100,
      percentage: corporateFranchisePercentage
    };

    distribution.company = {
      amount: (baseAmount * companyPercentage) / 100,
      percentage: companyPercentage
    };

    distribution.rider = {
      amount: this.distributionPercentages.rider,
      fixed: true
    };

    return distribution;
  }

  /**
   * Get or create wallets for all parties involved
   */
  async getOrCreateWallets(order) {
    const wallets = {};

    // Get or create seller wallet
    let sellerWallet = await Wallet.findByOwner(order.sellerId._id, 'Seller');
    if (!sellerWallet) {
      sellerWallet = await Wallet.createWallet(order.sellerId._id, 'Seller', order.sellerId.SQL_level);
    }
    wallets.seller = sellerWallet;

    // Get or create buyer wallet
    let buyerWallet = await Wallet.findByOwner(order.buyerId._id, 'User');
    if (!buyerWallet) {
      buyerWallet = await Wallet.createWallet(order.buyerId._id, 'User', 'Free');
    }
    wallets.buyer = buyerWallet;

    // Get or create company wallet
    let companyWallet = await Wallet.findByOwner(null, 'Company');
    if (!companyWallet) {
      companyWallet = await Wallet.createWallet(null, 'Company', 'VIP');
    }
    wallets.company = companyWallet;

    // TODO: Get franchise wallets based on order location
    // For now, create default franchise wallets
    wallets.subFranchise = await this.getOrCreateFranchiseWallet('SubFranchise');
    wallets.masterFranchise = await this.getOrCreateFranchiseWallet('MasterFranchise');
    wallets.corporateFranchise = await this.getOrCreateFranchiseWallet('CorporateFranchise');

    return wallets;
  }

  /**
   * Get or create franchise wallet
   */
  async getOrCreateFranchiseWallet(franchiseType) {
    let franchiseWallet = await Wallet.findByOwner(null, franchiseType);
    if (!franchiseWallet) {
      franchiseWallet = await Wallet.createWallet(null, franchiseType, 'Normal');
    }
    return franchiseWallet;
  }

  /**
   * Create distribution transactions
   */
  async createDistributionTransactions(order, distribution, wallets) {
    const transactions = [];

    // Create transaction for seller
    const sellerTransaction = new Transaction({
      orderId: order._id,
      type: 'wallet_distribution',
      amount: distribution.seller.amount,
      currency: 'PKR',
      walletType: 'main',
      fromWallet: {
        walletId: wallets.buyer._id,
        ownerId: order.buyerId._id,
        ownerType: 'User'
      },
      toWallet: {
        walletId: wallets.seller._id,
        ownerId: order.sellerId._id,
        ownerType: 'Seller'
      },
      distribution,
      description: `Order payment distribution to seller`,
      status: 'completed'
    });
    await sellerTransaction.save();
    transactions.push(sellerTransaction);

    // Create transaction for sub-franchise
    const subFranchiseTransaction = new Transaction({
      orderId: order._id,
      type: 'commission',
      amount: distribution.subFranchise.amount,
      currency: 'PKR',
      walletType: 'main',
      fromWallet: {
        walletId: wallets.buyer._id,
        ownerId: order.buyerId._id,
        ownerType: 'User'
      },
      toWallet: {
        walletId: wallets.subFranchise._id,
        ownerId: null,
        ownerType: 'SubFranchise'
      },
      distribution,
      description: `Sub-franchise commission`,
      status: 'completed'
    });
    await subFranchiseTransaction.save();
    transactions.push(subFranchiseTransaction);

    // Create transaction for master franchise
    const masterFranchiseTransaction = new Transaction({
      orderId: order._id,
      type: 'commission',
      amount: distribution.masterFranchise.amount,
      currency: 'PKR',
      walletType: 'main',
      fromWallet: {
        walletId: wallets.buyer._id,
        ownerId: order.buyerId._id,
        ownerType: 'User'
      },
      toWallet: {
        walletId: wallets.masterFranchise._id,
        ownerId: null,
        ownerType: 'MasterFranchise'
      },
      distribution,
      description: `Master franchise commission`,
      status: 'completed'
    });
    await masterFranchiseTransaction.save();
    transactions.push(masterFranchiseTransaction);

    // Create transaction for corporate franchise
    const corporateFranchiseTransaction = new Transaction({
      orderId: order._id,
      type: 'commission',
      amount: distribution.corporateFranchise.amount,
      currency: 'PKR',
      walletType: 'main',
      fromWallet: {
        walletId: wallets.buyer._id,
        ownerId: order.buyerId._id,
        ownerType: 'User'
      },
      toWallet: {
        walletId: wallets.corporateFranchise._id,
        ownerId: null,
        ownerType: 'CorporateFranchise'
      },
      distribution,
      description: `Corporate franchise commission`,
      status: 'completed'
    });
    await corporateFranchiseTransaction.save();
    transactions.push(corporateFranchiseTransaction);

    // Create transaction for company
    const companyTransaction = new Transaction({
      orderId: order._id,
      type: 'commission',
      amount: distribution.company.amount,
      currency: 'PKR',
      walletType: 'main',
      fromWallet: {
        walletId: wallets.buyer._id,
        ownerId: order.buyerId._id,
        ownerType: 'User'
      },
      toWallet: {
        walletId: wallets.company._id,
        ownerId: null,
        ownerType: 'Company'
      },
      distribution,
      description: `Company commission`,
      status: 'completed'
    });
    await companyTransaction.save();
    transactions.push(companyTransaction);

    return transactions;
  }

  /**
   * Update wallet balances
   */
  async updateWalletBalances(wallets, distribution) {
    try {
      // Update seller wallet
      await wallets.seller.addToMainWallet(distribution.seller.amount);

      // Update sub-franchise wallet
      await wallets.subFranchise.addToMainWallet(distribution.subFranchise.amount);

      // Update master franchise wallet
      await wallets.masterFranchise.addToMainWallet(distribution.masterFranchise.amount);

      // Update corporate franchise wallet
      await wallets.corporateFranchise.addToMainWallet(distribution.corporateFranchise.amount);

      // Update company wallet
      await wallets.company.addToMainWallet(distribution.company.amount);

      console.log('✅ All wallet balances updated successfully');
    } catch (error) {
      console.error('❌ Error updating wallet balances:', error);
      throw error;
    }
  }

  /**
   * Distribute fine to customer and company
   */
  async distributeFine(complaintId, fineAmount) {
    try {
      const complaint = await Complaint.findById(complaintId)
        .populate('buyerId', 'name email')
        .populate('orderId', 'totalAmount');

      if (!complaint) {
        throw new ApiError(404, 'Complaint not found');
      }

      // Get or create wallets
      const buyerWallet = await this.getOrCreateWallet(complaint.buyerId._id, 'User');
      const companyWallet = await this.getOrCreateWallet(null, 'Company');

      // Calculate distribution (80% to customer, 20% to company)
      const customerAmount = fineAmount * 0.8;
      const companyAmount = fineAmount * 0.2;

      // Create transactions
      const customerTransaction = new Transaction({
        type: 'fine_distribution',
        amount: customerAmount,
        currency: 'PKR',
        walletType: 'shopping',
        fromWallet: {
          walletId: companyWallet._id,
          ownerId: null,
          ownerType: 'Company'
        },
        toWallet: {
          walletId: buyerWallet._id,
          ownerId: complaint.buyerId._id,
          ownerType: 'User'
        },
        description: `Fine compensation for complaint ${complaintId}`,
        status: 'completed'
      });
      await customerTransaction.save();

      // Update wallet balances
      await buyerWallet.addToShoppingWallet(customerAmount);
      await companyWallet.addToMainWallet(companyAmount);

      console.log(`💰 Fine ${fineAmount} distributed: ${customerAmount} to customer, ${companyAmount} to company`);
      return { customerAmount, companyAmount };
    } catch (error) {
      console.error('❌ Error distributing fine:', error);
      throw error;
    }
  }

  /**
   * Get or create wallet for owner
   */
  async getOrCreateWallet(ownerId, ownerType, sqlLevel = 'Free') {
    let wallet = await Wallet.findByOwner(ownerId, ownerType);
    if (!wallet) {
      wallet = await Wallet.createWallet(ownerId, ownerType, sqlLevel);
    }
    return wallet;
  }

  /**
   * Process withdrawal request
   */
  async processWithdrawal(walletId, amount, withdrawalMethod) {
    try {
      const wallet = await Wallet.findById(walletId);
      if (!wallet) {
        throw new ApiError(404, 'Wallet not found');
      }

      if (wallet.mainWallet.balance < amount) {
        throw new ApiError(400, 'Insufficient balance');
      }

      // Check if trusty wallet requirement is met
      if (!wallet.checkTrustyWalletRequirement()) {
        throw new ApiError(400, 'Trusty wallet requirement not met. Income capped to 30%');
      }

      // Create withdrawal transaction
      const withdrawalTransaction = new Transaction({
        type: 'withdrawal',
        amount,
        currency: 'PKR',
        walletType: 'main',
        fromWallet: {
          walletId: wallet._id,
          ownerId: wallet.ownerId,
          ownerType: wallet.ownerType
        },
        paymentMethod: withdrawalMethod,
        description: `Withdrawal of ${amount} PKR`,
        status: 'pending'
      });
      await withdrawalTransaction.save();

      // Deduct from wallet
      await wallet.deductFromMainWallet(amount);

      console.log(`💰 Withdrawal processed: ${amount} PKR from wallet ${walletId}`);
      return withdrawalTransaction;
    } catch (error) {
      console.error('❌ Error processing withdrawal:', error);
      throw error;
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats() {
    try {
      const stats = await Wallet.getWalletStats();
      const transactionStats = await Transaction.getTransactionStats();

      return {
        walletStats: stats[0] || {},
        transactionStats: transactionStats[0] || {}
      };
    } catch (error) {
      console.error('❌ Error getting wallet stats:', error);
      throw error;
    }
  }

  /**
   * Get wallet history for owner
   */
  async getWalletHistory(ownerId, filters = {}) {
    try {
      const { page = 1, limit = 10, type, status } = filters;

      const query = {
        $or: [
          { 'fromWallet.ownerId': ownerId },
          { 'toWallet.ownerId': ownerId }
        ],
        isActive: true
      };

      if (type) query.type = type;
      if (status) query.status = status;

      const transactions = await Transaction.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Transaction.countDocuments(query);

      return {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting wallet history:', error);
      throw error;
    }
  }
}

module.exports = new WalletDistributionService();
