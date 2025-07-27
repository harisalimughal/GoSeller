const SQLUpgradeRequest = require('../models/SQLUpgradeRequest');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const { ApiError } = require('../utils/ApiError');

class SQLUpgradeService {
  /**
   * Create a new SQL upgrade request
   */
  async createUpgradeRequest(sellerId, requestData) {
    try {
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        throw new ApiError(404, 'Seller not found');
      }

      // Validate upgrade request
      const { type, productId, requestedLevel, reason, businessPlan, financialProjections, submittedDocs } = requestData;

      if (type === 'product' && !productId) {
        throw new ApiError(400, 'Product ID is required for product upgrade');
      }

      // Check if seller can request this level
      const currentLevel = seller.SQL_level;
      const levelOrder = ['Free', 'Basic', 'Normal', 'High', 'VIP'];
      const currentIndex = levelOrder.indexOf(currentLevel);
      const requestedIndex = levelOrder.indexOf(requestedLevel);

      if (requestedIndex <= currentIndex) {
        throw new ApiError(400, 'Requested level must be higher than current level');
      }

      // Check if there's already a pending request
      const existingRequest = await SQLUpgradeRequest.findOne({
        sellerId: seller._id,
        type,
        productId: type === 'product' ? productId : null,
        verificationStatus: 'pending'
      });

      if (existingRequest) {
        throw new ApiError(400, 'You already have a pending upgrade request');
      }

      // Create upgrade request
      const upgradeRequest = new SQLUpgradeRequest({
        sellerId: seller._id,
        productId: type === 'product' ? productId : null,
        type,
        currentLevel,
        requestedLevel,
        reason,
        businessPlan,
        financialProjections,
        submittedDocs
      });

      await upgradeRequest.save();

      return upgradeRequest;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Approve an SQL upgrade request
   */
  async approveUpgradeRequest(requestId, adminId, notes = '') {
    try {
      const request = await SQLUpgradeRequest.findById(requestId)
        .populate('sellerId', 'name email SQL_level')
        .populate('productId', 'title price');

      if (!request) {
        throw new ApiError(404, 'Upgrade request not found');
      }

      if (request.verificationStatus !== 'pending') {
        throw new ApiError(400, 'Request is not in pending status');
      }

      // Approve the request
      await request.approve(adminId, notes);

      // Update seller's SQL level
      const seller = await Seller.findById(request.sellerId);
      if (request.type === 'profile') {
        seller.SQL_level = request.requestedLevel;
        await seller.save();
      }

      // Update product's SQL level if it's a product upgrade
      if (request.type === 'product' && request.productId) {
        const product = await Product.findById(request.productId);
        if (product) {
          product.SQL_level = request.requestedLevel;
          await product.save();
        }
      }

      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reject an SQL upgrade request
   */
  async rejectUpgradeRequest(requestId, adminId, reason = '') {
    try {
      const request = await SQLUpgradeRequest.findById(requestId);
      if (!request) {
        throw new ApiError(404, 'Upgrade request not found');
      }

      if (request.verificationStatus !== 'pending') {
        throw new ApiError(400, 'Request is not in pending status');
      }

      await request.reject(adminId, reason);
      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update verification progress for PSS, EDR, EMO
   */
  async updateVerificationProgress(requestId, verificationType, status, verifiedBy, notes = '') {
    try {
      const request = await SQLUpgradeRequest.findById(requestId);
      if (!request) {
        throw new ApiError(404, 'Upgrade request not found');
      }

      await request.updateVerificationProgress(verificationType, status, verifiedBy, notes);

      // Check if all verifications are completed
      const progress = request.verificationProgress;
      const allCompleted = ['pss', 'edr', 'emo'].every(type =>
        progress[type].status === 'completed'
      );

      if (allCompleted) {
        // Auto-approve if all verifications are completed
        await this.approveUpgradeRequest(requestId, verifiedBy, 'Auto-approved after all verifications completed');
      }

      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get pending upgrade requests
   */
  async getPendingRequests(filters = {}) {
    try {
      const query = { verificationStatus: 'pending', isActive: true };

      if (filters.type) query.type = filters.type;
      if (filters.requestedLevel) query.requestedLevel = filters.requestedLevel;

      const requests = await SQLUpgradeRequest.find(query)
        .populate('sellerId', 'name email shopName sellerType SQL_level')
        .populate('productId', 'title price')
        .sort({ createdAt: -1 });

      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get upgrade requests by seller
   */
  async getRequestsBySeller(sellerId) {
    try {
      const requests = await SQLUpgradeRequest.findBySeller(sellerId);
      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get upgrade statistics
   */
  async getUpgradeStats() {
    try {
      const stats = await SQLUpgradeRequest.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: { $cond: [{ $eq: ['$verificationStatus', 'pending'] }, 1, 0] }
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$verificationStatus', 'approved'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$verificationStatus', 'rejected'] }, 1, 0] }
            },
            profileUpgrades: {
              $sum: { $cond: [{ $eq: ['$type', 'profile'] }, 1, 0] }
            },
            productUpgrades: {
              $sum: { $cond: [{ $eq: ['$type', 'product'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        profileUpgrades: 0,
        productUpgrades: 0
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get verification progress for a request
   */
  async getVerificationProgress(requestId) {
    try {
      const request = await SQLUpgradeRequest.findById(requestId);
      if (!request) {
        throw new ApiError(404, 'Upgrade request not found');
      }

      const progress = {
        pss: request.verificationProgress.pss,
        edr: request.verificationProgress.edr,
        emo: request.verificationProgress.emo,
        overall: request.verificationProgressPercentage
      };

      return progress;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Escalate upgrade request
   */
  async escalateRequest(requestId, level, escalatedBy, notes = '') {
    try {
      const request = await SQLUpgradeRequest.findById(requestId);
      if (!request) {
        throw new ApiError(404, 'Upgrade request not found');
      }

      await request.escalate(level, escalatedBy, notes);
      return request;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get upgrade requests by status
   */
  async getRequestsByStatus(status) {
    try {
      const requests = await SQLUpgradeRequest.findByStatus(status);
      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get upgrade requests by requested level
   */
  async getRequestsByLevel(level) {
    try {
      const requests = await SQLUpgradeRequest.findByRequestedLevel(level);
      return requests;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if seller is eligible for upgrade
   */
  async checkEligibility(sellerId, requestedLevel) {
    try {
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        throw new ApiError(404, 'Seller not found');
      }

      const levelOrder = ['Free', 'Basic', 'Normal', 'High', 'VIP'];
      const currentIndex = levelOrder.indexOf(seller.SQL_level);
      const requestedIndex = levelOrder.indexOf(requestedLevel);

      const eligible = requestedIndex > currentIndex;
      const nextLevel = levelOrder[currentIndex + 1] || null;

      return {
        eligible,
        currentLevel: seller.SQL_level,
        requestedLevel,
        nextLevel,
        canUpgrade: eligible
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new SQLUpgradeService();
