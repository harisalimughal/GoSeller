const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  // Wallet Owner
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'ownerType'
  },
  ownerType: {
    type: String,
    required: true,
    enum: ['User', 'Seller', 'Rider', 'SubFranchise', 'MasterFranchise', 'CorporateFranchise', 'Company']
  },

  // Wallet Types
  mainWallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'PKR'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  trustyWallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    requiredAmount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'EHBGC'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  shoppingWallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'PKR'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // Wallet Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'locked'],
    default: 'active'
  },

  // SQL Level for Trusty Wallet requirements
  sqlLevel: {
    type: String,
    enum: ['Free', 'Basic', 'Normal', 'High', 'VIP'],
    default: 'Free'
  },

  // Auto-withdrawal settings
  autoWithdrawal: {
    enabled: {
      type: Boolean,
      default: false
    },
    threshold: {
      type: Number,
      default: 1000
    },
    bankAccount: {
      accountNumber: String,
      bankName: String,
      accountTitle: String
    }
  },

  // Transaction limits
  limits: {
    dailyTransaction: {
      type: Number,
      default: 50000
    },
    monthlyTransaction: {
      type: Number,
      default: 500000
    },
    singleTransaction: {
      type: Number,
      default: 10000
    }
  },

  // Security settings
  security: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    pinRequired: {
      type: Boolean,
      default: true
    },
    lastLogin: Date,
    failedAttempts: {
      type: Number,
      default: 0
    }
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
walletSchema.index({ ownerId: 1, ownerType: 1 }, { unique: true });
walletSchema.index({ 'mainWallet.balance': -1 });
walletSchema.index({ 'trustyWallet.balance': -1 });
walletSchema.index({ status: 1 });

// Pre-save middleware
walletSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Update lastUpdated for wallet balances
  if (this.isModified('mainWallet.balance')) {
    this.mainWallet.lastUpdated = new Date();
  }
  if (this.isModified('trustyWallet.balance')) {
    this.trustyWallet.lastUpdated = new Date();
  }
  if (this.isModified('shoppingWallet.balance')) {
    this.shoppingWallet.lastUpdated = new Date();
  }

  next();
});

// Instance methods
walletSchema.methods.addToMainWallet = function(amount) {
  this.mainWallet.balance += amount;
  return this.save();
};

walletSchema.methods.deductFromMainWallet = function(amount) {
  if (this.mainWallet.balance >= amount) {
    this.mainWallet.balance -= amount;
    return this.save();
  }
  throw new Error('Insufficient balance in main wallet');
};

walletSchema.methods.addToTrustyWallet = function(amount) {
  this.trustyWallet.balance += amount;
  return this.save();
};

walletSchema.methods.deductFromTrustyWallet = function(amount) {
  if (this.trustyWallet.balance >= amount) {
    this.trustyWallet.balance -= amount;
    return this.save();
  }
  throw new Error('Insufficient balance in trusty wallet');
};

walletSchema.methods.addToShoppingWallet = function(amount) {
  this.shoppingWallet.balance += amount;
  return this.save();
};

walletSchema.methods.deductFromShoppingWallet = function(amount) {
  if (this.shoppingWallet.balance >= amount) {
    this.shoppingWallet.balance -= amount;
    return this.save();
  }
  throw new Error('Insufficient balance in shopping wallet');
};

walletSchema.methods.getTotalBalance = function() {
  return {
    main: this.mainWallet.balance,
    trusty: this.trustyWallet.balance,
    shopping: this.shoppingWallet.balance,
    total: this.mainWallet.balance + this.shoppingWallet.balance
  };
};

walletSchema.methods.checkTrustyWalletRequirement = function() {
  const requiredAmounts = {
    'Free': 0,
    'Basic': 100,
    'Normal': 500,
    'High': 1000,
    'VIP': 5000
  };

  this.trustyWallet.requiredAmount = requiredAmounts[this.sqlLevel] || 0;
  return this.trustyWallet.balance >= this.trustyWallet.requiredAmount;
};

walletSchema.methods.updateSQLLevel = function(newLevel) {
  this.sqlLevel = newLevel;
  this.trustyWallet.requiredAmount = this.getRequiredTrustyAmount(newLevel);
  return this.save();
};

walletSchema.methods.getRequiredTrustyAmount = function(level) {
  const requiredAmounts = {
    'Free': 0,
    'Basic': 100,
    'Normal': 500,
    'High': 1000,
    'VIP': 5000
  };
  return requiredAmounts[level] || 0;
};

// Static methods
walletSchema.statics.findByOwner = function(ownerId, ownerType) {
  return this.findOne({ ownerId, ownerType, isActive: true });
};

walletSchema.statics.createWallet = function(ownerId, ownerType, sqlLevel = 'Free') {
  return this.create({
    ownerId,
    ownerType,
    sqlLevel,
    trustyWallet: {
      requiredAmount: this.getRequiredTrustyAmount(sqlLevel)
    }
  });
};

walletSchema.statics.getRequiredTrustyAmount = function(level) {
  const requiredAmounts = {
    'Free': 0,
    'Basic': 100,
    'Normal': 500,
    'High': 1000,
    'VIP': 5000
  };
  return requiredAmounts[level] || 0;
};

walletSchema.statics.getWalletStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalWallets: { $sum: 1 },
        totalMainBalance: { $sum: '$mainWallet.balance' },
        totalTrustyBalance: { $sum: '$trustyWallet.balance' },
        totalShoppingBalance: { $sum: '$shoppingWallet.balance' },
        byOwnerType: {
          $push: {
            ownerType: '$ownerType',
            count: 1,
            totalBalance: { $add: ['$mainWallet.balance', '$shoppingWallet.balance'] }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Wallet', walletSchema);
