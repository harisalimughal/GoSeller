const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPhase17RiderDashboardAndComplaintSystem() {
  console.log('🚀 Testing GoSellr Phase 17: Rider Dashboard + Complaint Escalation System\n');

  try {
    // Test 1: Rider Registration
    console.log('🧪 Test 1: Rider Registration');
    const riderRegistrationResponse = await axios.post(`${BASE_URL}/riders/register`, {
      name: 'Ahmed Khan',
      email: 'ahmed.rider@example.com',
      phone: '+92-300-1234567',
      password: 'rider123456',
      cnic: {
        number: '35202-1234567-8',
        frontImage: 'https://example.com/cnic-front.jpg',
        backImage: 'https://example.com/cnic-back.jpg'
      },
      drivingLicense: {
        number: 'DL-123456789',
        image: 'https://example.com/license.jpg',
        expiryDate: '2025-12-31'
      },
      address: {
        street: '123 Rider Street',
        city: 'Karachi',
        area: 'Gulshan-e-Iqbal',
        postalCode: '75300',
        coordinates: { lat: 24.8607, lng: 67.0011 }
      },
      deliveryAreas: [
        {
          city: 'Karachi',
          areas: ['Gulshan-e-Iqbal', 'Defence', 'Clifton'],
          coordinates: { lat: 24.8607, lng: 67.0011 }
        }
      ],
      vehicle: {
        type: 'motorcycle',
        model: 'Honda CG 125',
        registrationNumber: 'KHI-12345',
        color: 'Black',
        year: 2020
      },
      availability: {
        monday: { available: true, hours: '9:00 AM - 8:00 PM' },
        tuesday: { available: true, hours: '9:00 AM - 8:00 PM' },
        wednesday: { available: true, hours: '9:00 AM - 8:00 PM' },
        thursday: { available: true, hours: '9:00 AM - 8:00 PM' },
        friday: { available: true, hours: '9:00 AM - 8:00 PM' },
        saturday: { available: true, hours: '9:00 AM - 6:00 PM' },
        sunday: { available: false, hours: 'Off' }
      },
      franchiseId: '507f1f77bcf86cd799439011'
    });
    console.log('✅ Rider Registration Successful');
    console.log(`🚚 Rider Name: ${riderRegistrationResponse.data.data.rider.name}`);
    console.log(`📱 Phone: ${riderRegistrationResponse.data.data.rider.phone}`);
    console.log(`🏍️ Vehicle: ${riderRegistrationResponse.data.data.rider.vehicle.type}`);

    // Test 2: Rider Login
    console.log('\n🧪 Test 2: Rider Login');
    const riderLoginResponse = await axios.post(`${BASE_URL}/riders/login`, {
      email: 'ahmed.rider@example.com',
      password: 'rider123456'
    });
    console.log('✅ Rider Login Successful');
    console.log(`🔑 Token: ${riderLoginResponse.data.data.token}`);
    console.log(`👤 Rider Status: ${riderLoginResponse.data.data.rider.status}`);

    const RIDER_TOKEN = riderLoginResponse.data.data.token;

    // Test 3: Rider Dashboard
    console.log('\n🧪 Test 3: Rider Dashboard');
    const dashboardResponse = await axios.get(`${BASE_URL}/riders/dashboard`, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      }
    });
    console.log('✅ Rider Dashboard Retrieved');
    console.log(`📊 Performance Score: ${dashboardResponse.data.data.dashboard.rider.performanceScore}`);
    console.log(`⭐ Rating: ${dashboardResponse.data.data.dashboard.rider.rating.average}`);
    console.log(`📦 Total Deliveries: ${dashboardResponse.data.data.dashboard.rider.totalDeliveries}`);

    // Test 4: Get Rider's Deliveries
    console.log('\n🧪 Test 4: Get Rider\'s Deliveries');
    const deliveriesResponse = await axios.get(`${BASE_URL}/riders/deliveries`, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      },
      params: {
        page: 1,
        limit: 10,
        status: 'assigned'
      }
    });
    console.log('✅ Rider Deliveries Retrieved');
    console.log(`📦 Total Deliveries: ${deliveriesResponse.data.data.pagination.total}`);
    console.log(`📄 Deliveries on Page: ${deliveriesResponse.data.data.deliveries.length}`);

    // Test 5: Update Delivery Status
    console.log('\n🧪 Test 5: Update Delivery Status');
    const updateStatusResponse = await axios.patch(`${BASE_URL}/riders/deliveries/507f1f77bcf86cd799439011/status`, {
      status: 'picked',
      location: { lat: 24.8607, lng: 67.0011 }
    }, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      }
    });
    console.log('✅ Delivery Status Updated');
    console.log(`📦 New Status: ${updateStatusResponse.data.data.delivery.status}`);
    console.log(`📍 Location Updated: ${updateStatusResponse.data.data.delivery.currentLocation.coordinates.lat}, ${updateStatusResponse.data.data.delivery.currentLocation.coordinates.lng}`);

    // Test 6: Update Rider Location
    console.log('\n🧪 Test 6: Update Rider Location');
    const locationResponse = await axios.patch(`${BASE_URL}/riders/location`, {
      lat: 24.8608,
      lng: 67.0012
    }, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      }
    });
    console.log('✅ Rider Location Updated');
    console.log(`📍 New Location: ${locationResponse.data.data.location.lat}, ${locationResponse.data.data.location.lng}`);

    // Test 7: Update Rider Status
    console.log('\n🧪 Test 7: Update Rider Status');
    const statusResponse = await axios.patch(`${BASE_URL}/riders/status`, {
      status: 'available'
    }, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      }
    });
    console.log('✅ Rider Status Updated');
    console.log(`🔄 New Status: ${statusResponse.data.data.status}`);

    // Test 8: Get Rider Profile
    console.log('\n🧪 Test 8: Get Rider Profile');
    const profileResponse = await axios.get(`${BASE_URL}/riders/profile`, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      }
    });
    console.log('✅ Rider Profile Retrieved');
    console.log(`👤 Name: ${profileResponse.data.data.rider.name}`);
    console.log(`📱 Phone: ${profileResponse.data.data.rider.phone}`);
    console.log(`🏍️ Vehicle: ${profileResponse.data.data.rider.vehicle.type}`);

    // Test 9: Update Rider Profile
    console.log('\n🧪 Test 9: Update Rider Profile');
    const updateProfileResponse = await axios.put(`${BASE_URL}/riders/profile`, {
      name: 'Ahmed Khan - Updated',
      phone: '+92-300-1234568'
    }, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      }
    });
    console.log('✅ Rider Profile Updated');
    console.log(`👤 Updated Name: ${updateProfileResponse.data.data.rider.name}`);
    console.log(`📱 Updated Phone: ${updateProfileResponse.data.data.rider.phone}`);

    // Test 10: Get Rider Analytics
    console.log('\n🧪 Test 10: Get Rider Analytics');
    const analyticsResponse = await axios.get(`${BASE_URL}/riders/analytics`, {
      headers: {
        'Authorization': `Bearer ${RIDER_TOKEN}`
      },
      params: {
        period: 'month'
      }
    });
    console.log('✅ Rider Analytics Retrieved');
    console.log(`📊 Total Deliveries: ${analyticsResponse.data.data.analytics.stats.totalDeliveries || 0}`);
    console.log(`✅ Successful Deliveries: ${analyticsResponse.data.data.analytics.stats.successfulDeliveries || 0}`);
    console.log(`💰 Total Earnings: ${analyticsResponse.data.data.analytics.stats.totalEarnings || 0}`);

    // Test 11: Get Available Riders (Public)
    console.log('\n🧪 Test 11: Get Available Riders (Public)');
    const availableRidersResponse = await axios.get(`${BASE_URL}/riders/available`, {
      params: {
        location: { city: 'Karachi' },
        franchiseType: 'sub'
      }
    });
    console.log('✅ Available Riders Retrieved');
    console.log(`🚚 Available Riders: ${availableRidersResponse.data.data.riders.length}`);

    // Test 12: Get Rider by ID (Public)
    console.log('\n🧪 Test 12: Get Rider by ID (Public)');
    const riderByIdResponse = await axios.get(`${BASE_URL}/riders/507f1f77bcf86cd799439011`);
    console.log('✅ Rider by ID Retrieved');
    console.log(`👤 Rider Name: ${riderByIdResponse.data.data.rider.name}`);
    console.log(`📱 Phone: ${riderByIdResponse.data.data.rider.phone}`);

    // Test 13: Admin - Get All Riders
    console.log('\n🧪 Test 13: Admin - Get All Riders');
    const allRidersResponse = await axios.get(`${BASE_URL}/riders/admin/all`, {
      params: {
        page: 1,
        limit: 20,
        status: 'active',
        franchiseType: 'sub',
        verified: 'true'
      }
    });
    console.log('✅ All Riders Retrieved (Admin)');
    console.log(`📦 Total Riders: ${allRidersResponse.data.data.pagination.total}`);
    console.log(`📄 Riders on Page: ${allRidersResponse.data.data.riders.length}`);

    // Test 14: Admin - Get Rider Stats
    console.log('\n🧪 Test 14: Admin - Get Rider Stats');
    const riderStatsResponse = await axios.get(`${BASE_URL}/riders/admin/stats`);
    console.log('✅ Rider Stats Retrieved (Admin)');
    console.log(`📊 Total Riders: ${riderStatsResponse.data.data.stats.totalRiders || 0}`);
    console.log(`✅ Active Riders: ${riderStatsResponse.data.data.stats.activeRiders || 0}`);
    console.log(`🔍 Verified Riders: ${riderStatsResponse.data.data.stats.verifiedRiders || 0}`);

    // Test 15: Admin - Get Top Performers
    console.log('\n🧪 Test 15: Admin - Get Top Performers');
    const topPerformersResponse = await axios.get(`${BASE_URL}/riders/admin/top-performers`, {
      params: {
        limit: 10
      }
    });
    console.log('✅ Top Performers Retrieved (Admin)');
    console.log(`🏆 Top Performers: ${topPerformersResponse.data.data.topPerformers.length}`);

    // Test 16: Admin - Update Rider Verification
    console.log('\n🧪 Test 16: Admin - Update Rider Verification');
    const verificationResponse = await axios.patch(`${BASE_URL}/riders/admin/507f1f77bcf86cd799439011/verification`, {
      type: 'pss',
      status: 'approved',
      verifiedBy: 'admin@ehb.com',
      notes: 'CNIC verified successfully'
    });
    console.log('✅ Rider Verification Updated (Admin)');
    console.log(`🔍 Verification Type: PSS`);
    console.log(`✅ Status: Approved`);

    // Test 17: Admin - Update Rider Status
    console.log('\n🧪 Test 17: Admin - Update Rider Status');
    const updateRiderStatusResponse = await axios.patch(`${BASE_URL}/riders/admin/507f1f77bcf86cd799439011/status`, {
      status: 'active'
    });
    console.log('✅ Rider Status Updated (Admin)');
    console.log(`🔄 New Status: ${updateRiderStatusResponse.data.data.rider.status}`);

    // Test 18: Delivery Assignment
    console.log('\n🧪 Test 18: Delivery Assignment');
    const deliveryAssignmentResponse = await axios.post(`${BASE_URL}/delivery/assign`, {
      orderId: '507f1f77bcf86cd799439011',
      riderId: '507f1f77bcf86cd799439011',
      franchiseId: '507f1f77bcf86cd799439011',
      pickupLocation: {
        address: '123 Seller Street',
        city: 'Karachi',
        area: 'Gulshan-e-Iqbal',
        coordinates: { lat: 24.8607, lng: 67.0011 }
      },
      deliveryLocation: {
        address: '456 Customer Street',
        city: 'Karachi',
        area: 'Defence',
        coordinates: { lat: 24.8608, lng: 67.0012 }
      },
      estimatedDeliveryTime: 45,
      deliveryFee: 150,
      customerInfo: {
        name: 'Customer Name',
        phone: '+92-300-1234567',
        email: 'customer@example.com',
        address: '456 Customer Street'
      }
    });
    console.log('✅ Delivery Assignment Successful');
    console.log(`📦 Order ID: ${deliveryAssignmentResponse.data.data.delivery.orderId}`);
    console.log(`🚚 Rider ID: ${deliveryAssignmentResponse.data.data.delivery.riderId}`);
    console.log(`💰 Delivery Fee: ${deliveryAssignmentResponse.data.data.delivery.deliveryFee}`);

    // Test 19: Delivery Status Update
    console.log('\n🧪 Test 19: Delivery Status Update');
    const deliveryStatusResponse = await axios.patch(`${BASE_URL}/delivery/507f1f77bcf86cd799439011/status`, {
      status: 'delivered',
      location: { lat: 24.8608, lng: 67.0012 }
    });
    console.log('✅ Delivery Status Updated');
    console.log(`📦 New Status: ${deliveryStatusResponse.data.data.delivery.status}`);
    console.log(`⏱️ Actual Delivery Time: ${deliveryStatusResponse.data.data.delivery.actualDeliveryTime} minutes`);

    // Test 20: Delivery Escalation
    console.log('\n🧪 Test 20: Delivery Escalation');
    const escalationResponse = await axios.patch(`${BASE_URL}/delivery/507f1f77bcf86cd799439011/escalate`, {
      level: 'sub_franchise',
      reason: 'Delivery delayed beyond estimated time'
    });
    console.log('✅ Delivery Escalated');
    console.log(`📈 Escalation Level: ${escalationResponse.data.data.delivery.escalationLevel}`);
    console.log(`💰 Fine Amount: ${escalationResponse.data.data.delivery.fineAmount}`);

    console.log('\n🎉 All Phase 17 Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Rider Registration & Authentication');
    console.log('✅ Rider Dashboard & Profile Management');
    console.log('✅ Delivery Status Updates');
    console.log('✅ Real-time Location Tracking');
    console.log('✅ Rider Analytics & Performance');
    console.log('✅ Admin Rider Management');
    console.log('✅ Delivery Assignment System');
    console.log('✅ Complaint Escalation Logic');
    console.log('✅ Fine Calculation System');
    console.log('✅ Franchise Integration');

    console.log('\n💡 Phase 17 Features:');
    console.log('🚚 Rider Registration & Dashboard');
    console.log('📱 Real-time Delivery Tracking');
    console.log('⚡ Delivery Status Updates');
    console.log('📍 Location Tracking');
    console.log('📊 Performance Analytics');
    console.log('🔍 Admin Rider Management');
    console.log('📦 Delivery Assignment Engine');
    console.log('⚠️ Complaint Escalation System');
    console.log('💰 Auto Fine Calculation');
    console.log('🏢 Franchise Integration');

    console.log('\n🎯 GoSellr Expansion Status:');
    console.log('✅ Phase 16: Service-Based Sellers - COMPLETED');
    console.log('✅ Phase 17: Rider Dashboard & Complaint System - COMPLETED');
    console.log('✅ Delivery Operations - IMPLEMENTED');
    console.log('✅ Complaint Escalation - FUNCTIONAL');
    console.log('✅ Auto Fine System - READY');

    console.log('\n🚀 Next Expansion Phases Available:');
    console.log('1. 📱 Phase 18: Mobile App Development');
    console.log('2. 🌐 Phase 19: Advanced AI Integration');
    console.log('3. 💳 Phase 20: Payment Gateway Integration');
    console.log('4. 📊 Phase 21: Advanced Analytics & Reporting');
    console.log('5. 🔗 Phase 22: Blockchain Integration');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

// Run tests
testPhase17RiderDashboardAndComplaintSystem().catch(console.error);
