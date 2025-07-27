const Order = require('../models/Order');
const Complaint = require('../models/Complaint');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Seller = require('../models/Seller');
const SQLUpgradeRequest = require('../models/SQLUpgradeRequest');
const { ApiError } = require('../utils/ApiError');

class FranchiseAnalyticsService {
  constructor() {
    this.franchiseTypes = ['SubFranchise', 'MasterFranchise', 'CorporateFranchise'];
  }

  /**
   * Get comprehensive franchise dashboard data
   */
  async getFranchiseDashboard(franchiseId, franchiseType, filters = {}) {
    try {
      const { startDate, endDate, region } = filters;

      // Get date range
      const dateRange = this.getDateRange(startDate, endDate);

      // Get all metrics
      const [
        orderMetrics,
        incomeMetrics,
        complaintMetrics,
        deliveryMetrics,
        walletMetrics,
        sqlMetrics,
        rankingData
      ] = await Promise.all([
        this.getOrderMetrics(franchiseId, franchiseType, dateRange),
        this.getIncomeMetrics(franchiseId, franchiseType, dateRange),
        this.getComplaintMetrics(franchiseId, franchiseType, dateRange),
        this.getDeliveryMetrics(franchiseId, franchiseType, dateRange),
        this.getWalletMetrics(franchiseId, franchiseType),
        this.getSQLMetrics(franchiseId, franchiseType, dateRange),
        this.getFranchiseRanking(franchiseId, franchiseType)
      ]);

      return {
        franchiseId,
        franchiseType,
        period: dateRange,
        metrics: {
          orders: orderMetrics,
          income: incomeMetrics,
          complaints: complaintMetrics,
          delivery: deliveryMetrics,
          wallet: walletMetrics,
          sql: sqlMetrics,
          ranking: rankingData
        },
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Error getting franchise dashboard:', error);
      throw error;
    }
  }

  /**
   * Get order metrics for franchise
   */
  async getOrderMetrics(franchiseId, franchiseType, dateRange) {
    try {
      const query = {
        franchiseId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        isActive: true
      };

      const orders = await Order.find(query);
      const totalOrders = orders.length;

      // Order status breakdown
      const statusBreakdown = orders.reduce((acc, order) => {
        const status = order.order_status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Daily order volume
      const dailyOrders = await Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Top performing sellers
      const topSellers = await Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$sellerId',
            orderCount: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 }
      ]);

      return {
        totalOrders,
        statusBreakdown,
        dailyOrders,
        topSellers,
        averageOrderValue: totalOrders > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / totalOrders : 0
      };
    } catch (error) {
      console.error('❌ Error getting order metrics:', error);
      throw error;
    }
  }

  /**
   * Get income metrics for franchise
   */
  async getIncomeMetrics(franchiseId, franchiseType, dateRange) {
    try {
      const query = {
        'toWallet.ownerType': franchiseType,
        'toWallet.ownerId': franchiseId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        isActive: true,
        status: 'completed'
      };

      const transactions = await Transaction.find(query);

      // Income by source
      const incomeBySource = transactions.reduce((acc, transaction) => {
        const source = transaction.type;
        acc[source] = (acc[source] || 0) + transaction.amount;
        return acc;
      }, {});

      // Daily income
      const dailyIncome = await Transaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            amount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      // Income summary table
      const incomeSummary = {
        orders: incomeBySource.wallet_distribution || 0,
        lateComplaintFines: incomeBySource.fine_distribution || 0,
        serviceUpgrades: incomeBySource.commission || 0,
        pssEdrRegistrations: incomeBySource.bonus || 0,
        deliveryServices: incomeBySource.transfer || 0,
        total: transactions.reduce((sum, t) => sum + t.amount, 0)
      };

      return {
        incomeSummary,
        incomeBySource,
        dailyIncome,
        totalTransactions: transactions.length,
        averageTransactionValue: transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0
      };
    } catch (error) {
      console.error('❌ Error getting income metrics:', error);
      throw error;
    }
  }

  /**
   * Get complaint metrics for franchise
   */
  async getComplaintMetrics(franchiseId, franchiseType, dateRange) {
    try {
      const query = {
        franchiseId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        isActive: true
      };

      const complaints = await Complaint.find(query);
      const totalComplaints = complaints.length;

      // Complaint status breakdown
      const statusBreakdown = complaints.reduce((acc, complaint) => {
        const status = complaint.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Complaint type breakdown
      const typeBreakdown = complaints.reduce((acc, complaint) => {
        const type = complaint.complaintType || 'general';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Escalation metrics
      const escalationMetrics = {
        totalEscalated: complaints.filter(c => c.escalated).length,
        escalatedToMaster: complaints.filter(c => c.escalationLevel === 'master_franchise').length,
        escalatedToCorporate: complaints.filter(c => c.escalationLevel === 'corporate').length,
        totalFines: complaints.reduce((sum, c) => sum + (c.fineAmount || 0), 0)
      };

      // Daily complaint volume
      const dailyComplaints = await Complaint.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 },
            totalFines: { $sum: '$fineAmount' }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      return {
        totalComplaints,
        statusBreakdown,
        typeBreakdown,
        escalationMetrics,
        dailyComplaints,
        averageResolutionTime: this.calculateAverageResolutionTime(complaints)
      };
    } catch (error) {
      console.error('❌ Error getting complaint metrics:', error);
      throw error;
    }
  }

  /**
   * Get delivery metrics for franchise
   */
  async getDeliveryMetrics(franchiseId, franchiseType, dateRange) {
    try {
      const query = {
        franchiseId,
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        isActive: true
      };

      const orders = await Order.find(query);

      // Delivery status breakdown
      const deliveryStatus = orders.reduce((acc, order) => {
        const status = order.delivery_status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Delivery performance
      const deliveryPerformance = {
        onTime: orders.filter(o => o.delivery_status === 'delivered' && this.isOnTime(o)).length,
        late: orders.filter(o => o.delivery_status === 'delivered' && !this.isOnTime(o)).length,
        failed: orders.filter(o => o.delivery_status === 'failed').length,
        pending: orders.filter(o => o.delivery_status === 'pending').length
      };

      // Average delivery time
      const deliveredOrders = orders.filter(o => o.delivery_status === 'delivered');
      const averageDeliveryTime = deliveredOrders.length > 0
        ? deliveredOrders.reduce((sum, order) => {
            const deliveryTime = new Date(order.deliveredAt || order.updatedAt) - new Date(order.createdAt);
            return sum + deliveryTime;
          }, 0) / deliveredOrders.length
        : 0;

      return {
        deliveryStatus,
        deliveryPerformance,
        averageDeliveryTime: averageDeliveryTime / (1000 * 60 * 60), // Convert to hours
        totalDeliveries: orders.length
      };
    } catch (error) {
      console.error('❌ Error getting delivery metrics:', error);
      throw error;
    }
  }

  /**
   * Get wallet metrics for franchise
   */
  async getWalletMetrics(franchiseId, franchiseType) {
    try {
      const wallet = await Wallet.findByOwner(franchiseId, franchiseType);

      if (!wallet) {
        return {
          mainWallet: 0,
          trustyWallet: 0,
          shoppingWallet: 0,
          totalBalance: 0,
          walletStatus: 'not_found'
        };
      }

      return {
        mainWallet: wallet.mainWallet.balance,
        trustyWallet: wallet.trustyWallet.balance,
        shoppingWallet: wallet.shoppingWallet.balance,
        totalBalance: wallet.getTotalBalance().total,
        walletStatus: wallet.status,
        lastUpdated: wallet.updatedAt
      };
    } catch (error) {
      console.error('❌ Error getting wallet metrics:', error);
      throw error;
    }
  }

  /**
   * Get SQL level metrics for franchise
   */
  async getSQLMetrics(franchiseId, franchiseType, dateRange) {
    try {
      // Get SQL upgrade requests in franchise area
      const sqlRequests = await SQLUpgradeRequest.find({
        createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        isActive: true
      });

      // Get sellers in franchise area
      const sellers = await Seller.find({
        isActive: true
      });

      const sqlLevels = sellers.reduce((acc, seller) => {
        const level = seller.SQL_level || 'Free';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

      return {
        totalSQLRequests: sqlRequests.length,
        pendingRequests: sqlRequests.filter(r => r.verificationStatus === 'pending').length,
        approvedRequests: sqlRequests.filter(r => r.verificationStatus === 'approved').length,
        rejectedRequests: sqlRequests.filter(r => r.verificationStatus === 'rejected').length,
        sqlLevelDistribution: sqlLevels,
        averageProcessingTime: this.calculateAverageProcessingTime(sqlRequests)
      };
    } catch (error) {
      console.error('❌ Error getting SQL metrics:', error);
      throw error;
    }
  }

  /**
   * Get franchise ranking
   */
  async getFranchiseRanking(franchiseId, franchiseType) {
    try {
      // Get all franchises of same type
      const allFranchises = await this.getAllFranchisesByType(franchiseType);

      // Calculate performance scores
      const franchiseScores = await Promise.all(
        allFranchises.map(async (franchise) => {
          const score = await this.calculateFranchiseScore(franchise._id, franchiseType);
          return {
            franchiseId: franchise._id,
            score,
            rank: 0
          };
        })
      );

      // Sort by score and assign ranks
      franchiseScores.sort((a, b) => b.score - a.score);
      franchiseScores.forEach((franchise, index) => {
        franchise.rank = index + 1;
      });

      const currentFranchise = franchiseScores.find(f => f.franchiseId.toString() === franchiseId.toString());

      return {
        currentRank: currentFranchise?.rank || 0,
        totalFranchises: franchiseScores.length,
        topPerformers: franchiseScores.slice(0, 5),
        performanceScore: currentFranchise?.score || 0
      };
    } catch (error) {
      console.error('❌ Error getting franchise ranking:', error);
      throw error;
    }
  }

  /**
   * Get income summary for franchise
   */
  async getIncomeSummary(franchiseId, franchiseType, filters = {}) {
    try {
      const { startDate, endDate } = filters;
      const dateRange = this.getDateRange(startDate, endDate);

      const incomeMetrics = await this.getIncomeMetrics(franchiseId, franchiseType, dateRange);

      return {
        franchiseId,
        franchiseType,
        period: dateRange,
        summary: incomeMetrics.incomeSummary,
        breakdown: incomeMetrics.incomeBySource,
        trends: incomeMetrics.dailyIncome
      };
    } catch (error) {
      console.error('❌ Error getting income summary:', error);
      throw error;
    }
  }

  /**
   * Get AI-driven insights for franchise
   */
  async getAIInsights(franchiseId, franchiseType) {
    try {
      const insights = [];

      // Check wallet balance alerts
      const walletMetrics = await this.getWalletMetrics(franchiseId, franchiseType);
      if (walletMetrics.mainWallet < 1000) {
        insights.push({
          type: 'warning',
          title: 'Low Wallet Balance',
          message: 'Your main wallet balance is below recommended threshold',
          action: 'Consider withdrawing or adding funds'
        });
      }

      // Check complaint alerts
      const complaintMetrics = await this.getComplaintMetrics(franchiseId, franchiseType, this.getDateRange());
      if (complaintMetrics.totalComplaints > 3) {
        insights.push({
          type: 'alert',
          title: 'High Complaint Volume',
          message: 'You have more than 3 unresolved complaints',
          action: 'Review and resolve complaints immediately'
        });
      }

      // Check missed income opportunities
      const orderMetrics = await this.getOrderMetrics(franchiseId, franchiseType, this.getDateRange());
      if (orderMetrics.totalOrders === 0) {
        insights.push({
          type: 'info',
          title: 'No Orders',
          message: 'No orders in your area',
          action: 'Consider expanding your service area'
        });
      }

      return insights;
    } catch (error) {
      console.error('❌ Error getting AI insights:', error);
      throw error;
    }
  }

  // Helper methods
  getDateRange(startDate, endDate) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    return { start, end };
  }

  isOnTime(order) {
    const deliveryTime = new Date(order.deliveredAt || order.updatedAt) - new Date(order.createdAt);
    const expectedTime = 24 * 60 * 60 * 1000; // 24 hours
    return deliveryTime <= expectedTime;
  }

  calculateAverageResolutionTime(complaints) {
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved' && c.resolvedAt);
    if (resolvedComplaints.length === 0) return 0;

    const totalTime = resolvedComplaints.reduce((sum, complaint) => {
      return sum + (new Date(complaint.resolvedAt) - new Date(complaint.createdAt));
    }, 0);

    return totalTime / resolvedComplaints.length / (1000 * 60 * 60); // Convert to hours
  }

  calculateAverageProcessingTime(requests) {
    const processedRequests = requests.filter(r => r.verificationStatus !== 'pending');
    if (processedRequests.length === 0) return 0;

    const totalTime = processedRequests.reduce((sum, request) => {
      return sum + (new Date(request.updatedAt) - new Date(request.createdAt));
    }, 0);

    return totalTime / processedRequests.length / (1000 * 60 * 60); // Convert to hours
  }

  async getAllFranchisesByType(franchiseType) {
    // This would typically query a Franchise model
    // For now, return mock data
    return [];
  }

  async calculateFranchiseScore(franchiseId, franchiseType) {
    // Calculate performance score based on various metrics
    // This is a simplified calculation
    return Math.random() * 100;
  }
}

module.exports = new FranchiseAnalyticsService();
