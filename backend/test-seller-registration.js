const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSellerRegistration() {
  try {
    console.log('🧪 Testing Seller Registration API...\n');

    // Test 1: Health check
    console.log('1️⃣ Testing health check endpoint...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/seller-registration/health`);
      console.log('✅ Health check successful:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.response?.data || error.message);
    }

    // Test 2: Test registration endpoint
    console.log('\n2️⃣ Testing registration endpoint...');
    
    const testData = {
      firstName: 'Test',
      lastName: 'Seller',
      email: 'test.seller@gosellr.com',
      phone: '+923001234567',
      password: 'password123',
      businessName: 'Test Store',
      businessType: 'Electronics',
      businessLicense: 'LIC123456',
      businessAddress: '123 Test Street',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75000',
      country: 'Pakistan',
      sellerCategory: 'Storekeeper',
      distributionArea: 'Local',
      authorizedTerritories: 'Karachi',
      storeDescription: 'A test store for testing purposes',
      storeCategory: 'Electronics Store'
    };

    const formData = new FormData();
    Object.keys(testData).forEach(key => {
      formData.append(key, testData[key]);
    });

    try {
      const response = await axios.post(`${BASE_URL}/seller-registration/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Registration successful:', response.data);
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('\n🔍 This might be due to missing Cloudinary credentials.');
        console.log('📝 Please create a .env file with:');
        console.log('   CLOUDINARY_CLOUD_NAME=your-cloud-name');
        console.log('   CLOUDINARY_API_KEY=your-api-key');
        console.log('   CLOUDINARY_API_SECRET=your-api-secret');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSellerRegistration();
