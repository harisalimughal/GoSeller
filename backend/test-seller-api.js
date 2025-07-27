const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testSellerRegistration() {
  try {
    console.log('🧪 Testing Seller Registration API...');

    const sellerData = {
      name: 'Test Seller',
      email: 'test.seller@gosellr.com',
      password: 'password123',
      contact: '+923001234567',
      location: {
        address: '123 Test Street',
        city: 'Karachi',
        province: 'Sindh'
      },
      sellerType: 'shopkeeper',
      shopName: 'Test Shop',
      businessDetails: {
        businessId: 'BIZ123456',
        taxNumber: 'TAX789012',
        businessCategory: 'Electronics'
      }
    };

    const response = await axios.post(`${BASE_URL}/seller/register`, sellerData);

    console.log('✅ Seller Registration Successful!');
    console.log('Response:', response.data);

    return response.data.token;
  } catch (error) {
    console.error('❌ Seller Registration Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testSellerLogin() {
  try {
    console.log('\n🧪 Testing Seller Login API...');

    const loginData = {
      email: 'test.seller@gosellr.com',
      password: 'password123'
    };

    const response = await axios.post(`${BASE_URL}/seller/login`, loginData);

    console.log('✅ Seller Login Successful!');
    console.log('Response:', response.data);

    return response.data.token;
  } catch (error) {
    console.error('❌ Seller Login Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testSellerDashboard(token) {
  if (!token) {
    console.log('❌ No token available for dashboard test');
    return;
  }

  try {
    console.log('\n🧪 Testing Seller Dashboard API...');

    const response = await axios.get(`${BASE_URL}/seller/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Seller Dashboard Successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Seller Dashboard Failed:', error.response?.data || error.message);
  }
}

async function testComplaintCreation() {
  try {
    console.log('\n🧪 Testing Complaint Creation API...');

    const complaintData = {
      orderId: '507f1f77bcf86cd799439011', // Mock order ID
      complaintType: 'delivery_delayed',
      description: 'Order was supposed to be delivered yesterday but still not received',
      priority: 'high',
      attachments: []
    };

    const response = await axios.post(`${BASE_URL}/complaints`, complaintData);

    console.log('✅ Complaint Creation Successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Complaint Creation Failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting GoSellr API Tests...\n');

  // Test seller registration
  const token = await testSellerRegistration();

  // Test seller login
  const loginToken = await testSellerLogin();

  // Test dashboard with login token
  await testSellerDashboard(loginToken);

  // Test complaint creation
  await testComplaintCreation();

  console.log('\n🎉 All tests completed!');
}

// Run tests
runTests().catch(console.error);
