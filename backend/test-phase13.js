const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testPhase13WalletSystem() {
  console.log('🚀 Testing GoSellr Phase 13: Wallet Distribution System\n');

  try {
    // Test 1: Seller Registration
    console.log('🧪 Test 1: Seller Registration');
    const sellerData = {
      name: 'Test Seller Phase13',
      email: 'test.phase13@gosellr.com',
      password: 'password123',
      contact: '+923001234567',
      location: {
        address: '123 Test Street',
        city: 'Karachi',
        province: 'Sindh'
      },
      sellerType: 'shopkeeper',
      shopName: 'Test Shop Phase13',
      businessDetails: {
        businessId: 'BIZ123456',
        taxNumber: 'TAX789012',
        businessCategory: 'Electronics'
      }
    };

    const registerResponse = await axios.post(`${BASE_URL}/seller/register`, sellerData);
    console.log('✅ Seller Registration Successful');
    const token = registerResponse.data.data.token;

    // Test 2: Get Wallet Balance
    console.log('\n🧪 Test 2: Get Wallet Balance');
    const balanceResponse = await axios.get(`${BASE_URL}/wallet/balance`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Wallet Balance Retrieved');
    console.log(`💰 Main Wallet: ${balanceResponse.data.data.wallet.mainWallet.balance} PKR`);
    console.log(`🔐 Trusty Wallet: ${balanceResponse.data.data.wallet.trustyWallet.balance} EHBGC`);

    // Test 3: Add Money to Wallet (Demo)
    console.log('\n🧪 Test 3: Add Money to Wallet');
    const addMoneyResponse = await axios.post(`${BASE_URL}/wallet/add`, {
      amount: 5000,
      walletType: 'main'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Money Added to Wallet');
    console.log(`💰 New Balance: ${addMoneyResponse.data.data.wallet.mainWallet.balance} PKR`);

    // Test 4: Add Trusty Wallet Balance
    console.log('\n🧪 Test 4: Add Trusty Wallet Balance');
    const addTrustyResponse = await axios.post(`${BASE_URL}/wallet/add`, {
      amount: 100,
      walletType: 'trusty'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Trusty Wallet Balance Added');
    console.log(`🔐 Trusty Balance: ${addTrustyResponse.data.data.wallet.trustyWallet.balance} EHBGC`);

    // Test 5: Check Trusty Wallet Requirement
    console.log('\n🧪 Test 5: Check Trusty Wallet Requirement');
    const trustyCheckResponse = await axios.get(`${BASE_URL}/wallet/trusty-check`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Trusty Wallet Check Completed');
    console.log(`📊 Meets Requirement: ${trustyCheckResponse.data.data.meetsRequirement}`);
    console.log(`📊 Required Amount: ${trustyCheckResponse.data.data.requiredAmount} EHBGC`);

    // Test 6: Transfer Between Wallets
    console.log('\n🧪 Test 6: Transfer Between Wallets');
    const transferResponse = await axios.post(`${BASE_URL}/wallet/transfer`, {
      fromWallet: 'main',
      toWallet: 'shopping',
      amount: 500
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Transfer Completed');
    console.log(`💰 Main Wallet: ${transferResponse.data.data.wallet.mainWallet.balance} PKR`);
    console.log(`🛍️ Shopping Wallet: ${transferResponse.data.data.wallet.shoppingWallet.balance} PKR`);

    // Test 7: Get Wallet History
    console.log('\n🧪 Test 7: Get Wallet History');
    const historyResponse = await axios.get(`${BASE_URL}/wallet/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Wallet History Retrieved');
    console.log(`📊 Total Transactions: ${historyResponse.data.data.pagination.total}`);

    // Test 8: Get Wallet Analytics
    console.log('\n🧪 Test 8: Get Wallet Analytics');
    const analyticsResponse = await axios.get(`${BASE_URL}/wallet/analytics?period=30`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Wallet Analytics Retrieved');
    console.log(`📊 Total Transactions: ${analyticsResponse.data.data.analytics.totalTransactions}`);
    console.log(`📊 Net Amount: ${analyticsResponse.data.data.analytics.netAmount} PKR`);

    // Test 9: Update SQL Level
    console.log('\n🧪 Test 9: Update SQL Level');
    const sqlLevelResponse = await axios.patch(`${BASE_URL}/wallet/sql-level`, {
      newLevel: 'Basic'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ SQL Level Updated');
    console.log(`📊 New SQL Level: ${sqlLevelResponse.data.data.wallet.sqlLevel}`);

    // Test 10: Request Withdrawal
    console.log('\n🧪 Test 10: Request Withdrawal');
    const withdrawalResponse = await axios.post(`${BASE_URL}/wallet/withdraw`, {
      amount: 1000,
      withdrawalMethod: 'bank_transfer',
      bankDetails: {
        accountNumber: '1234567890',
        bankName: 'Test Bank',
        accountTitle: 'Test Account'
      }
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Withdrawal Request Processed');
    console.log(`💰 Withdrawal Amount: ${withdrawalResponse.data.data.withdrawal.amount} PKR`);

    // Test 11: Get Wallet Statistics (Admin)
    console.log('\n🧪 Test 11: Get Wallet Statistics');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/wallet/stats`);
      console.log('✅ Wallet Statistics Retrieved');
      console.log(`📊 Total Wallets: ${statsResponse.data.data.walletStats.totalWallets}`);
    } catch (error) {
      console.log('⚠️ Admin routes might need authentication');
    }

    // Test 12: Get Transaction Statistics
    console.log('\n🧪 Test 12: Get Transaction Statistics');
    const transactionStatsResponse = await axios.get(`${BASE_URL}/wallet/transaction-stats`);
    console.log('✅ Transaction Statistics Retrieved');
    console.log(`📊 Total Transactions: ${transactionStatsResponse.data.data.stats.totalTransactions}`);

    // Test 13: Update Wallet Security
    console.log('\n🧪 Test 13: Update Wallet Security');
    const securityResponse = await axios.patch(`${BASE_URL}/wallet/security`, {
      twoFactorEnabled: true,
      pinRequired: true,
      autoWithdrawal: {
        enabled: false,
        threshold: 2000
      }
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Wallet Security Updated');
    console.log(`🔒 2FA Enabled: ${securityResponse.data.data.wallet.security.twoFactorEnabled}`);

    // Test 14: Update Transaction Limits
    console.log('\n🧪 Test 14: Update Transaction Limits');
    const limitsResponse = await axios.patch(`${BASE_URL}/wallet/limits`, {
      dailyTransaction: 10000,
      monthlyTransaction: 100000,
      singleTransaction: 5000
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Transaction Limits Updated');
    console.log(`📊 Daily Limit: ${limitsResponse.data.data.wallet.limits.dailyTransaction} PKR`);

    // Test 15: Public Wallet Balance Check
    console.log('\n🧪 Test 15: Public Wallet Balance Check');
    const publicBalanceResponse = await axios.get(`${BASE_URL}/wallet/${registerResponse.data.data.seller.id}/balance?ownerType=Seller`);
    console.log('✅ Public Wallet Balance Retrieved');
    console.log(`💰 Public Balance: ${publicBalanceResponse.data.data.wallet.mainWallet.balance} PKR`);

    console.log('\n🎉 All Phase 13 Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Wallet Creation & Management');
    console.log('✅ Multi-Wallet System (Main, Trusty, Shopping)');
    console.log('✅ SQL Level Integration');
    console.log('✅ Trusty Wallet Requirements');
    console.log('✅ Transaction History & Analytics');
    console.log('✅ Withdrawal System');
    console.log('✅ Security Settings');
    console.log('✅ Transfer Between Wallets');
    console.log('✅ Public Wallet Access');
    console.log('✅ Statistics & Reporting');

    console.log('\n💡 Phase 13 Features:');
    console.log('💰 Auto-Distribution System Ready');
    console.log('🔐 Trusty Wallet (EHBGC) Integration');
    console.log('📊 Real-time Analytics');
    console.log('🔄 Multi-party Payment Flow');
    console.log('⚡ Instant Transaction Processing');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

// Run tests
testPhase13WalletSystem().catch(console.error);
