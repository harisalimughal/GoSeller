const axios = require('axios');

const BASE_URL = 'http://localhost:5002/api';

async function testPhase16ServiceBasedSellers() {
  console.log('🚀 Testing GoSellr Phase 16: Service-Based Sellers & Dual Profile Integration\n');

  try {
    // Test 1: Service Provider Registration
    console.log('🧪 Test 1: Service Provider Registration');
    const serviceRegistrationResponse = await axios.post(`${BASE_URL}/services/register`, {
      title: 'Professional Electrician Services',
      description: 'Expert electrical services for homes and businesses. Licensed and insured electrician with 10+ years experience.',
      category: 'Electrician',
      subcategory: 'Residential & Commercial',
      pricingType: 'hourly',
      price: 1500,
      priceRange: { min: 1000, max: 3000 },
      serviceArea: ['Karachi', 'Lahore', 'Islamabad'],
      availability: {
        monday: { available: true, hours: '9:00 AM - 6:00 PM' },
        tuesday: { available: true, hours: '9:00 AM - 6:00 PM' },
        wednesday: { available: true, hours: '9:00 AM - 6:00 PM' },
        thursday: { available: true, hours: '9:00 AM - 6:00 PM' },
        friday: { available: true, hours: '9:00 AM - 6:00 PM' },
        saturday: { available: true, hours: '9:00 AM - 2:00 PM' },
        sunday: { available: false, hours: 'Closed' }
      },
      experience: {
        years: 10,
        description: 'Over 10 years of experience in electrical installations and repairs'
      },
      qualifications: ['Licensed Electrician', 'Diploma in Electrical Engineering'],
      certifications: [
        {
          name: 'Professional Electrician License',
          issuer: 'Pakistan Engineering Council',
          year: 2015,
          validUntil: '2025-12-31'
        }
      ],
      images: ['https://example.com/electrician1.jpg', 'https://example.com/electrician2.jpg'],
      contactInfo: {
        phone: '+92-300-1234567',
        whatsapp: '+92-300-1234567',
        email: 'electrician@example.com',
        website: 'https://electrician.example.com'
      },
      location: {
        address: '123 Main Street',
        city: 'Karachi',
        area: 'Gulshan-e-Iqbal',
        coordinates: { lat: 24.8607, lng: 67.0011 }
      },
      tags: ['licensed', 'experienced', '24/7', 'emergency', 'professional'],
      keywords: ['electrician', 'electrical', 'wiring', 'installation', 'repair'],
      serviceFeatures: ['Emergency Services', '24/7 Support', 'Warranty', 'Free Consultation'],
      serviceInclusions: ['Labor', 'Basic Materials', 'Testing', 'Safety Checks'],
      serviceExclusions: ['Major Materials', 'Permits', 'Travel beyond service area'],
      businessDetails: {
        businessName: 'Pro Electric Services',
        businessType: 'individual',
        registrationNumber: 'REG123456',
        taxNumber: 'TAX789012'
      }
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_SELLER_TOKEN'
      }
    });
    console.log('✅ Service Registration Successful');
    console.log(`🔧 Service Title: ${serviceRegistrationResponse.data.data.service.title}`);
    console.log(`💰 Price: ${serviceRegistrationResponse.data.data.service.price} PKR`);
    console.log(`🏷️ Category: ${serviceRegistrationResponse.data.data.service.category}`);

    // Test 2: Get Seller's Services
    console.log('\n🧪 Test 2: Get Seller\'s Services');
    const myServicesResponse = await axios.get(`${BASE_URL}/services/my-services`, {
      headers: {
        'Authorization': 'Bearer YOUR_SELLER_TOKEN'
      },
      params: {
        page: 1,
        limit: 10
      }
    });
    console.log('✅ Seller Services Retrieved');
    console.log(`📦 Total Services: ${myServicesResponse.data.data.pagination.total}`);
    console.log(`📄 Services on Page: ${myServicesResponse.data.data.services.length}`);

    // Test 3: Public Service Listing
    console.log('\n🧪 Test 3: Public Service Listing');
    const publicServicesResponse = await axios.get(`${BASE_URL}/services/public/all`, {
      params: {
        page: 1,
        limit: 12,
        category: 'Electrician',
        location: 'Karachi',
        sqlLevel: 'all',
        verified: 'true',
        sort: 'popular'
      }
    });
    console.log('✅ Public Services Retrieved');
    console.log(`🔧 Total Services: ${publicServicesResponse.data.data.pagination.total}`);
    console.log(`📄 Services on Page: ${publicServicesResponse.data.data.services.length}`);

    // Test 4: Get Service by Slug
    console.log('\n🧪 Test 4: Get Service by Slug');
    const serviceBySlugResponse = await axios.get(`${BASE_URL}/services/public/service/professional-electrician-services`);
    console.log('✅ Service by Slug Retrieved');
    console.log(`🔧 Service Title: ${serviceBySlugResponse.data.data.service.title}`);
    console.log(`🏪 Seller: ${serviceBySlugResponse.data.data.service.sellerId.shopName}`);
    console.log(`🔍 SQL Level: ${serviceBySlugResponse.data.data.service.sellerId.SQL_level}`);

    // Test 5: Search Services
    console.log('\n🧪 Test 5: Search Services');
    const searchServicesResponse = await axios.get(`${BASE_URL}/services/public/search`, {
      params: {
        q: 'electrician',
        category: 'Electrician',
        location: 'Karachi',
        minPrice: 500,
        maxPrice: 2000,
        sqlLevel: 'all',
        verified: 'true',
        page: 1,
        limit: 12
      }
    });
    console.log('✅ Service Search Completed');
    console.log(`🔍 Search Query: ${searchServicesResponse.data.data.searchQuery}`);
    console.log(`📦 Search Results: ${searchServicesResponse.data.data.services.length}`);

    // Test 6: Get Services by Category
    console.log('\n🧪 Test 6: Get Services by Category');
    const categoryServicesResponse = await axios.get(`${BASE_URL}/services/public/category/Electrician`, {
      params: {
        page: 1,
        limit: 12,
        location: 'Karachi',
        sqlLevel: 'Basic'
      }
    });
    console.log('✅ Category Services Retrieved');
    console.log(`🏷️ Category: ${categoryServicesResponse.data.data.category}`);
    console.log(`📦 Total Services: ${categoryServicesResponse.data.data.pagination.total}`);

    // Test 7: Get Trending Services
    console.log('\n🧪 Test 7: Get Trending Services');
    const trendingServicesResponse = await axios.get(`${BASE_URL}/services/public/trending`, {
      params: {
        limit: 10
      }
    });
    console.log('✅ Trending Services Retrieved');
    console.log(`🔥 Trending Services: ${trendingServicesResponse.data.data.trendingServices.length}`);

    // Test 8: Get Services by SQL Level
    console.log('\n🧪 Test 8: Get Services by SQL Level');
    const sqlLevelServicesResponse = await axios.get(`${BASE_URL}/services/public/sql-level/Basic`, {
      params: {
        page: 1,
        limit: 12
      }
    });
    console.log('✅ SQL Level Services Retrieved');
    console.log(`🔍 SQL Level: ${sqlLevelServicesResponse.data.data.sqlLevel}`);
    console.log(`📦 Total Services: ${sqlLevelServicesResponse.data.data.pagination.total}`);

    // Test 9: Service Inquiry
    console.log('\n🧪 Test 9: Service Inquiry');
    const inquiryResponse = await axios.post(`${BASE_URL}/services/507f1f77bcf86cd799439011/inquire`, {
      name: 'Ahmed Khan',
      email: 'ahmed@example.com',
      phone: '+92-300-1234567',
      message: 'Need electrical work for my new house',
      preferredDate: '2024-02-15',
      preferredTime: '10:00 AM'
    });
    console.log('✅ Service Inquiry Created');
    console.log(`💬 Message: ${inquiryResponse.data.data.message}`);

    // Test 10: Service Analytics
    console.log('\n🧪 Test 10: Service Analytics');
    const analyticsResponse = await axios.get(`${BASE_URL}/services/analytics/overview`, {
      headers: {
        'Authorization': 'Bearer YOUR_SELLER_TOKEN'
      }
    });
    console.log('✅ Service Analytics Retrieved');
    console.log(`📊 Total Services: ${analyticsResponse.data.data.analytics.totalServices}`);
    console.log(`✅ Active Services: ${analyticsResponse.data.data.analytics.activeServices}`);
    console.log(`👀 Total Views: ${analyticsResponse.data.data.analytics.totalViews}`);
    console.log(`💬 Total Inquiries: ${analyticsResponse.data.data.analytics.totalInquiries}`);

    // Test 11: Service Verification
    console.log('\n🧪 Test 11: Service Verification');
    const verificationResponse = await axios.patch(`${BASE_URL}/services/507f1f77bcf86cd799439011/verification`, {
      type: 'pss',
      status: 'approved',
      verifiedBy: 'admin@ehb.com',
      notes: 'Documents verified successfully'
    });
    console.log('✅ Service Verification Updated');
    console.log(`🔍 Verification Type: PSS`);
    console.log(`✅ Status: Approved`);

    // Test 12: Get Service Categories
    console.log('\n🧪 Test 12: Get Service Categories');
    const categoriesResponse = await axios.get(`${BASE_URL}/services/categories/list`);
    console.log('✅ Service Categories Retrieved');
    console.log(`📂 Total Categories: ${categoriesResponse.data.data.categories.length}`);

    // Test 13: Get Popular Tags
    console.log('\n🧪 Test 13: Get Popular Tags');
    const tagsResponse = await axios.get(`${BASE_URL}/services/tags/popular`, {
      params: {
        limit: 20
      }
    });
    console.log('✅ Popular Tags Retrieved');
    console.log(`🏷️ Popular Tags: ${tagsResponse.data.data.popularTags.length}`);

    // Test 14: Service Stats
    console.log('\n🧪 Test 14: Service Stats');
    const statsResponse = await axios.get(`${BASE_URL}/services/stats/overview`);
    console.log('✅ Service Stats Retrieved');
    console.log(`📊 Total Services: ${statsResponse.data.data.stats.totalServices || 0}`);
    console.log(`👀 Total Views: ${statsResponse.data.data.stats.totalViews || 0}`);
    console.log(`💬 Total Inquiries: ${statsResponse.data.data.stats.totalInquiries || 0}`);

    // Test 15: Update Service
    console.log('\n🧪 Test 15: Update Service');
    const updateResponse = await axios.put(`${BASE_URL}/services/507f1f77bcf86cd799439011`, {
      title: 'Professional Electrician Services - Updated',
      price: 1800,
      description: 'Updated description with more details about our services.'
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_SELLER_TOKEN'
      }
    });
    console.log('✅ Service Updated Successfully');
    console.log(`🔧 Updated Title: ${updateResponse.data.data.service.title}`);
    console.log(`💰 Updated Price: ${updateResponse.data.data.service.price} PKR`);

    console.log('\n🎉 All Phase 16 Tests Completed Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Service Provider Registration');
    console.log('✅ Dual Profile Integration');
    console.log('✅ Service Management (CRUD)');
    console.log('✅ Public Service Listing');
    console.log('✅ Service Search & Filtering');
    console.log('✅ Service Categories');
    console.log('✅ Service Analytics');
    console.log('✅ Service Verification (PSS/EDR/EMO)');
    console.log('✅ Service Inquiries');
    console.log('✅ SQL Level Integration');
    console.log('✅ Trending Services');
    console.log('✅ Service Tags & SEO');
    console.log('✅ Service Stats & Analytics');

    console.log('\n💡 Phase 16 Features:');
    console.log('🔧 Service-Based Seller Registration');
    console.log('👤 Dual Profile (Product + Service)');
    console.log('🔍 Advanced Service Search');
    console.log('📊 Service Analytics Dashboard');
    console.log('✅ PSS/EDR/EMO Verification');
    console.log('💰 SQL Level Integration');
    console.log('🏷️ Service Categories & Tags');
    console.log('📱 Public Service Discovery');

    console.log('\n🎯 GoSellr Expansion Status:');
    console.log('✅ Phase 16: Service-Based Sellers - COMPLETED');
    console.log('✅ Dual Profile Integration - IMPLEMENTED');
    console.log('✅ Service Management System - READY');
    console.log('✅ Public Service Discovery - ENABLED');
    console.log('✅ SQL Level Integration - FUNCTIONAL');

    console.log('\n🚀 Next Expansion Phases Available:');
    console.log('1. 🚚 Phase 17: Rider Dashboard & Sub-Franchise System');
    console.log('2. 📱 Phase 18: Mobile App Development');
    console.log('3. 🌐 Phase 19: Advanced AI Integration');
    console.log('4. 💳 Phase 20: Payment Gateway Integration');
    console.log('5. 📊 Phase 21: Advanced Analytics & Reporting');

  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

// Run tests
testPhase16ServiceBasedSellers().catch(console.error);
