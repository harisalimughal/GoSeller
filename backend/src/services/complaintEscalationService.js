const Complaint = require('../models/Complaint');
const cron = require('node-cron');

class ComplaintEscalationService {
  constructor() {
    this.initializeCronJobs();
  }

  /**
   * Initialize cron jobs for auto-escalation
   */
  initializeCronJobs() {
    // Check for complaints that need escalation every hour
    cron.schedule('0 * * * *', () => {
      this.checkPendingComplaints();
    }, {
      scheduled: true,
      timezone: 'Asia/Karachi'
    });

    // Check for complaints that need fine calculation every 30 minutes
    cron.schedule('*/30 * * * *', () => {
      this.calculateFinesForDelayedComplaints();
    }, {
      scheduled: true,
      timezone: 'Asia/Karachi'
    });

    console.log('🕐 Complaint escalation cron jobs initialized');
  }

  /**
   * Check pending complaints and escalate if needed
   */
  async checkPendingComplaints() {
    try {
      const now = new Date();
      const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      // Find complaints that need escalation
      const complaintsToEscalate = await Complaint.find({
        status: { $in: ['pending', 'in_progress'] },
        escalated: false,
        isActive: true,
        createdAt: { $lt: sixHoursAgo }
      }).populate('orderId', 'totalAmount');

      console.log(`🔍 Found ${complaintsToEscalate.length} complaints to check for escalation`);

      for (const complaint of complaintsToEscalate) {
        const hoursSinceCreation = Math.round((now - complaint.createdAt) / (1000 * 60 * 60));

        if (hoursSinceCreation >= 12) {
          // Escalate to corporate
          await this.escalateComplaint(complaint._id, 'corporate', 'Auto-escalation after 12 hours');
          console.log(`🚨 Complaint ${complaint._id} escalated to corporate`);
        } else if (hoursSinceCreation >= 6) {
          // Escalate to master
          await this.escalateComplaint(complaint._id, 'master_franchise', 'Auto-escalation after 6 hours');
          console.log(`⚠️ Complaint ${complaint._id} escalated to master franchise`);
        }
      }
    } catch (error) {
      console.error('❌ Error in checkPendingComplaints:', error);
    }
  }

  /**
   * Calculate fines for delayed complaints
   */
  async calculateFinesForDelayedComplaints() {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Find complaints that are overdue (24+ hours)
      const overdueComplaints = await Complaint.find({
        status: { $in: ['pending', 'in_progress'] },
        isActive: true,
        createdAt: { $lt: twentyFourHoursAgo },
        fineStatus: { $ne: 'charged' }
      }).populate('orderId', 'totalAmount');

      console.log(`💰 Found ${overdueComplaints.length} complaints for fine calculation`);

      for (const complaint of overdueComplaints) {
        await this.calculateAndApplyFine(complaint);
      }
    } catch (error) {
      console.error('❌ Error in calculateFinesForDelayedComplaints:', error);
    }
  }

  /**
   * Escalate a complaint to the next level
   */
  async escalateComplaint(complaintId, level, reason) {
    try {
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        throw new Error('Complaint not found');
      }

      await complaint.escalate(level, 'System', reason);

      // Update fine percentage based on escalation level
      let finePercentage = 2; // Default for sub-franchise
      switch (level) {
        case 'master_franchise':
          finePercentage = 3;
          break;
        case 'corporate':
          finePercentage = 5;
          break;
      }

      complaint.finePercentage = finePercentage;
      await complaint.save();

      console.log(`📈 Complaint ${complaintId} escalated to ${level} with ${finePercentage}% fine`);
    } catch (error) {
      console.error('❌ Error escalating complaint:', error);
    }
  }

  /**
   * Calculate and apply fine for a complaint
   */
  async calculateAndApplyFine(complaint) {
    try {
      const orderAmount = complaint.orderId?.totalAmount || 1000; // Default amount
      const fineAmount = (orderAmount * complaint.finePercentage) / 100;

      complaint.fineAmount = fineAmount;
      complaint.fineStatus = 'calculated';
      await complaint.save();

      console.log(`💸 Fine calculated for complaint ${complaint._id}: ${fineAmount} (${complaint.finePercentage}%)`);

      // TODO: Implement wallet distribution logic
      // await this.distributeFineToCustomer(complaint.buyerId, fineAmount);
      // await this.addToCompanyIncome(fineAmount);

    } catch (error) {
      console.error('❌ Error calculating fine:', error);
    }
  }

  /**
   * Get escalation statistics
   */
  async getEscalationStats() {
    try {
      const stats = await Complaint.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            escalated: { $sum: { $cond: [{ $eq: ['$escalated', true] }, 1, 0] } },
            escalatedToMaster: {
              $sum: {
                $cond: [
                  { $eq: ['$escalationLevel', 'master_franchise'] },
                  1,
                  0
                ]
              }
            },
            escalatedToCorporate: {
              $sum: {
                $cond: [
                  { $eq: ['$escalationLevel', 'corporate'] },
                  1,
                  0
                ]
              }
            },
            totalFines: { $sum: '$fineAmount' }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        escalated: 0,
        escalatedToMaster: 0,
        escalatedToCorporate: 0,
        totalFines: 0
      };
    } catch (error) {
      console.error('❌ Error getting escalation stats:', error);
      return null;
    }
  }

  /**
   * Manual escalation trigger
   */
  async manualEscalation(complaintId, level, reason, escalatedBy) {
    try {
      const complaint = await Complaint.findById(complaintId);
      if (!complaint) {
        throw new Error('Complaint not found');
      }

      await complaint.escalate(level, escalatedBy, reason);
      console.log(`👤 Manual escalation: Complaint ${complaintId} escalated to ${level} by ${escalatedBy}`);

      return complaint;
    } catch (error) {
      console.error('❌ Error in manual escalation:', error);
      throw error;
    }
  }

  /**
   * Get complaints that need immediate attention
   */
  async getUrgentComplaints() {
    try {
      const now = new Date();
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

      return await Complaint.find({
        status: { $in: ['pending', 'in_progress'] },
        isActive: true,
        createdAt: { $lt: fourHoursAgo },
        escalated: false
      }).populate('orderId', 'orderNumber totalAmount')
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name shopName')
        .sort({ createdAt: 1 });
    } catch (error) {
      console.error('❌ Error getting urgent complaints:', error);
      return [];
    }
  }

  /**
   * Get complaints by escalation level
   */
  async getComplaintsByLevel(level) {
    try {
      return await Complaint.find({
        escalationLevel: level,
        isActive: true
      }).populate('orderId', 'orderNumber totalAmount')
        .populate('buyerId', 'name email')
        .populate('sellerId', 'name shopName')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('❌ Error getting complaints by level:', error);
      return [];
    }
  }
}

module.exports = new ComplaintEscalationService();
