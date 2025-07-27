const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testPhase14FranchiseAnalytics() {
  console.log('🚀 Testing GoSellr Phase 14: Franchise Analytics + Income Report Dashboard\n');

  try {
    // Test 1: Get Franchise Dashboard
    console.log('🧪 Test 1: Get Franchise Dashboard');
    const dashboardResponse = await axios.get(`${BASE_URL}/franchise/dashboard`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Franchise Dashboard Retrieved');
    console.log(`📊 Total Orders: ${dashboardResponse.data.data.dashboard.metrics.orders.totalOrders}`);
    console.log(`💰 Total Income: ${dashboardResponse.data.data.dashboard.metrics.income.incomeSummary.total}`);

    // Test 2: Get Income Summary
    console.log('\n🧪 Test 2: Get Income Summary');
    const incomeResponse = await axios.get(`${BASE_URL}/franchise/income/summary`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Income Summary Retrieved');
    console.log(`💰 Orders: ${incomeResponse.data.data.incomeSummary.summary.orders}`);
    console.log(`💰 Late Complaint Fines: ${incomeResponse.data.data.incomeSummary.summary.lateComplaintFines}`);
    console.log(`💰 Service Upgrades: ${incomeResponse.data.data.incomeSummary.summary.serviceUpgrades}`);

    // Test 3: Get Order Metrics
    console.log('\n🧪 Test 3: Get Order Metrics');
    const orderMetricsResponse = await axios.get(`${BASE_URL}/franchise/metrics/orders`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Order Metrics Retrieved');
    console.log(`📦 Total Orders: ${orderMetricsResponse.data.data.orderMetrics.totalOrders}`);
    console.log(`💰 Average Order Value: ${orderMetricsResponse.data.data.orderMetrics.averageOrderValue}`);

    // Test 4: Get Complaint Metrics
    console.log('\n🧪 Test 4: Get Complaint Metrics');
    const complaintMetricsResponse = await axios.get(`${BASE_URL}/franchise/metrics/complaints`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Complaint Metrics Retrieved');
    console.log(`⚠️ Total Complaints: ${complaintMetricsResponse.data.data.complaintMetrics.totalComplaints}`);
    console.log(`💰 Total Fines: ${complaintMetricsResponse.data.data.complaintMetrics.escalationMetrics.totalFines}`);

    // Test 5: Get Delivery Metrics
    console.log('\n🧪 Test 5: Get Delivery Metrics');
    const deliveryMetricsResponse = await axios.get(`${BASE_URL}/franchise/metrics/delivery`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Delivery Metrics Retrieved');
    console.log(`🚚 Total Deliveries: ${deliveryMetricsResponse.data.data.deliveryMetrics.totalDeliveries}`);
    console.log(`⏰ Average Delivery Time: ${deliveryMetricsResponse.data.data.deliveryMetrics.averageDeliveryTime} hours`);

    // Test 6: Get Wallet Metrics
    console.log('\n🧪 Test 6: Get Wallet Metrics');
    const walletMetricsResponse = await axios.get(`${BASE_URL}/franchise/metrics/wallet`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise'
      }
    });
    console.log('✅ Wallet Metrics Retrieved');
    console.log(`💰 Main Wallet: ${walletMetricsResponse.data.data.walletMetrics.mainWallet} PKR`);
    console.log(`🔐 Trusty Wallet: ${walletMetricsResponse.data.data.walletMetrics.trustyWallet} EHBGC`);

    // Test 7: Get SQL Metrics
    console.log('\n🧪 Test 7: Get SQL Metrics');
    const sqlMetricsResponse = await axios.get(`${BASE_URL}/franchise/metrics/sql`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ SQL Metrics Retrieved');
    console.log(`📊 Total SQL Requests: ${sqlMetricsResponse.data.data.sqlMetrics.totalSQLRequests}`);
    console.log(`✅ Approved Requests: ${sqlMetricsResponse.data.data.sqlMetrics.approvedRequests}`);

    // Test 8: Get AI Insights
    console.log('\n🧪 Test 8: Get AI Insights');
    const insightsResponse = await axios.get(`${BASE_URL}/franchise/insights`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise'
      }
    });
    console.log('✅ AI Insights Retrieved');
    console.log(`🧠 Total Insights: ${insightsResponse.data.data.insights.length}`);

    // Test 9: Get Franchise Ranking
    console.log('\n🧪 Test 9: Get Franchise Ranking');
    const rankingResponse = await axios.get(`${BASE_URL}/franchise/rank`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise'
      }
    });
    console.log('✅ Franchise Ranking Retrieved');
    console.log(`🏆 Current Rank: ${rankingResponse.data.data.ranking.currentRank}`);
    console.log(`📊 Performance Score: ${rankingResponse.data.data.ranking.performanceScore}`);

    // Test 10: Get Daily Analytics
    console.log('\n🧪 Test 10: Get Daily Analytics');
    const dailyAnalyticsResponse = await axios.get(`${BASE_URL}/franchise/analytics/daily`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        date: '2024-01-15'
      }
    });
    console.log('✅ Daily Analytics Retrieved');
    console.log(`📅 Date: ${dailyAnalyticsResponse.data.data.dailyAnalytics.date}`);

    // Test 11: Get Weekly Analytics
    console.log('\n🧪 Test 11: Get Weekly Analytics');
    const weeklyAnalyticsResponse = await axios.get(`${BASE_URL}/franchise/analytics/weekly`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        weekStart: '2024-01-15'
      }
    });
    console.log('✅ Weekly Analytics Retrieved');
    console.log(`📅 Week Start: ${weeklyAnalyticsResponse.data.data.weeklyAnalytics.weekStart}`);

    // Test 12: Get Monthly Analytics
    console.log('\n🧪 Test 12: Get Monthly Analytics');
    const monthlyAnalyticsResponse = await axios.get(`${BASE_URL}/franchise/analytics/monthly`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        month: '1',
        year: '2024'
      }
    });
    console.log('✅ Monthly Analytics Retrieved');
    console.log(`📅 Month: ${monthlyAnalyticsResponse.data.data.monthlyAnalytics.month}`);
    console.log(`📅 Year: ${monthlyAnalyticsResponse.data.data.monthlyAnalytics.year}`);

    // Test 13: Generate Franchise Report
    console.log('\n🧪 Test 13: Generate Franchise Report');
    const reportResponse = await axios.post(`${BASE_URL}/franchise/report`, {
      franchiseId: '507f1f77bcf86cd799439011',
      franchiseType: 'SubFranchise',
      reportType: 'dashboard',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      format: 'json'
    });
    console.log('✅ Franchise Report Generated');
    console.log(`📊 Report Type: ${reportResponse.data.data.report.reportType}`);

    // Test 14: Compare Franchises
    console.log('\n🧪 Test 14: Compare Franchises');
    const compareResponse = await axios.get(`${BASE_URL}/franchise/compare`, {
      params: {
        franchiseIds: '507f1f77bcf86cd799439011,507f1f77bcf86cd799439012',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }
    });
    console.log('✅ Franchise Comparison Retrieved');
    console.log(`📊 Comparisons: ${compareResponse.data.data.comparisons.length}`);

    // Test 15: Get Franchise Orders
    console.log('\n🧪 Test 15: Get Franchise Orders');
    const ordersResponse = await axios.get(`${BASE_URL}/franchise/orders`, {
      params: {
        franchiseId: '507f1f77bcf86cd799439011',
        franchiseType: 'SubFranchise',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        limit: 10
      }
    });
    console.log('✅ Franchise Orders Retrieved');
    console.log(`📦 Total Orders: ${ordersResponse.data.data.pagination.total}`);

    console.log('\n🎉 All Phase 14 Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Franchise Dashboard System');
    console.log('✅ Income Summary & Analytics');
    console.log('✅ Order Metrics & Tracking');
    console.log('✅ Complaint Metrics & Fines');
    console.log('✅ Delivery Performance Analytics');
    console.log('✅ Wallet Metrics Integration');
    console.log('✅ SQL Level Analytics');
    console.log('✅ AI-Driven Insights');
    console.log('✅ Franchise Ranking System');
    console.log('✅ Daily/Weekly/Monthly Analytics');
    console.log('✅ Report Generation');
    console.log('✅ Franchise Comparison');
    console.log('✅ Order & Complaint Management');

    console.log('\n💡 Phase 14 Features:');
    console.log('📊 Comprehensive Business Intelligence');
    console.log('💰 Income Tracking & Reporting');
    console.log('🧠 AI-Powered Insights');
    console.log('🏆 Performance Ranking System');
    console.log('📈 Real-time Analytics Dashboard');
    console.log('📋 Automated Report Generation');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

// Run tests
testPhase14FranchiseAnalytics().catch(console.error);
