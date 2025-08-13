import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiUsers,
  FiGlobe,
  FiShield,
  FiTruck,
  FiTrendingUp,
  FiArrowRight,
  FiStar,
  FiPackage,
  FiShoppingCart,
  FiBarChart,
  FiSettings,
  FiCheckCircle,
  FiClock,
  FiLock,
  FiRefreshCw
} from 'react-icons/fi';

interface Seller {
  _id: string;
  name: string;
  shopName: string;
  email: string;
  serviceSQL_level: string;
  productSQL_level: string;
  sqlLevelUpdatedAt?: string;
  serviceVerification?: {
    pss?: { status: string };
    edr?: { status: string };
    emo?: { status: string };
  };
}

const SellerDashboard: React.FC = () => {
  console.log('🎯 SellerDashboard component is rendering - URL:', window.location.href);
  console.log('🎯 Current pathname:', window.location.pathname);
  
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSQLLevel, setLastSQLLevel] = useState<string | null>(null);
  const [showUpgradeNotification, setShowUpgradeNotification] = useState(false);

  useEffect(() => {
    fetchSellerProfile();
    
    // Set up auto-refresh every 30 seconds to check for SQL level updates
    const profileInterval = setInterval(() => {
      fetchSellerProfile(true); // Silent refresh
    }, 30000);
    
    return () => {
      clearInterval(profileInterval);
    };
  }, []);

  useEffect(() => {
    if (!seller) return;
    
    // Set up verification status check every 10 seconds for faster updates when seller is logged in
    const verificationInterval = setInterval(() => {
      checkVerificationStatus();
    }, 10000);
    
    return () => {
      clearInterval(verificationInterval);
    };
  }, [seller]);

  const fetchSellerProfile = async (silent = false) => {
    try {
      if (!silent) {
        setRefreshing(true);
      }
      
      const sellerToken = localStorage.getItem('sellerToken');
      console.log('🔑 Seller token exists:', !!sellerToken);
      if (!sellerToken) {
        if (!silent) setLoading(false);
        return;
      }

      const api = (await import('../services/api')).default;
      console.log('📡 Making API call to /seller/profile...');
      
      const response = await api.get('/seller/profile', {
        headers: {
          'Authorization': `Bearer ${sellerToken}`
        }
      });

      console.log('📥 API Response:', response.data);

      if (response.data.success) {
        const newSeller = response.data.data.seller;
        console.log('👤 Seller data received:', {
          name: newSeller.name,
          serviceSQL_level: newSeller.serviceSQL_level,
          productSQL_level: newSeller.productSQL_level,
          serviceVerification: newSeller.serviceVerification
        });
        
        // Check if SQL level was upgraded
        if (seller && !silent) {
          const oldLevel = seller.serviceSQL_level;
          const newLevel = newSeller.serviceSQL_level;
          
          console.log('📊 SQL Level check:', { oldLevel, newLevel });
          
          if (oldLevel !== newLevel && newLevel !== 'Free') {
            setShowUpgradeNotification(true);
            setLastSQLLevel(oldLevel);
            console.log('🎉 SQL Level upgraded!', { from: oldLevel, to: newLevel });
            // Hide notification after 5 seconds
            setTimeout(() => setShowUpgradeNotification(false), 5000);
          }
        }
        
        setSeller(newSeller);
        console.log('✅ Seller profile updated successfully');
      }
    } catch (error) {
      console.error('Failed to fetch seller profile:', error);
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchSellerProfile();
  };

  const checkVerificationStatus = async () => {
    try {
      const sellerToken = localStorage.getItem('sellerToken');
      if (!sellerToken) return;

      const api = (await import('../services/api')).default;
      const response = await api.get('/seller/verification-status', {
        headers: {
          'Authorization': `Bearer ${sellerToken}`
        }
      });

      if (response.data.success) {
        const verificationData = response.data.data;
        console.log('Verification status checked:', verificationData);
        
        // If verification status changed, refresh seller profile
        if (seller?.serviceVerification && verificationData.serviceVerification) {
          const oldPSS = seller.serviceVerification.pss?.status;
          const newPSS = verificationData.serviceVerification.pss?.status;
          
          if (oldPSS !== newPSS && newPSS === 'approved') {
            console.log('PSS verification approved! Refreshing profile...');
            setTimeout(() => fetchSellerProfile(), 1000); // Small delay to ensure backend processing is complete
          }
        }
      }
    } catch (error) {
      console.log('Verification status check failed (normal if route doesn\'t exist):', error);
    }
  };

  const getSQLLevelInfo = (level: string) => {
    switch (level) {
      case 'Free':
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiLock, limit: '3 products' };
      case 'Basic':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FiCheckCircle, limit: '10 products' };
      case 'Normal':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: FiCheckCircle, limit: '50 products' };
      case 'High':
        return { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: FiCheckCircle, limit: '200 products' };
      case 'VIP':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: FiStar, limit: 'Unlimited' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: FiClock, limit: 'Unknown' };
    }
  };

  const getVerificationStatus = () => {
    if (!seller?.serviceVerification) return 'Not Started';
    
    const pss = seller.serviceVerification.pss?.status === 'approved';
    const edr = seller.serviceVerification.edr?.status === 'approved';
    const emo = seller.serviceVerification.emo?.status === 'approved';
    
    if (pss && edr && emo) return 'All Verified';
    if (pss && edr) return 'PSS & EDR Verified';
    if (pss) return 'PSS Verified';
    return 'Pending Verification';
  };
  



  const benefits = [
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: "Reach Millions of Customers",
      description: "Access GoSeller's vast customer base and grow your business globally"
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Secure Payment Processing",
      description: "Get paid quickly and securely with our trusted payment system"
    },
    {
      icon: <FiTruck className="w-8 h-8" />,
      title: "Fulfillment Options",
      description: "Choose between self-fulfillment or our fulfillment service"
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Analytics & Insights",
      description: "Track your performance with detailed analytics and reports"
    }
  ];

  const successStories = [
    {
      name: "Sarah Johnson",
      business: "Handmade Crafts Co.",
      story: "Started with just 10 products, now selling 500+ items monthly",
      revenue: "$15,000/month",
      rating: 4.8
    },
    {
      name: "Mike Chen",
      business: "Tech Gadgets Pro",
      story: "Grew from $500 to $25,000 monthly sales in 6 months",
      revenue: "$25,000/month",
      rating: 4.9
    },
    {
      name: "Lisa Rodriguez",
      business: "Organic Beauty Store",
      story: "Reached 10,000+ customers in first year of selling",
      revenue: "$18,000/month",
      rating: 4.7
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up and complete your seller profile with business information"
    },
    {
      number: "02",
      title: "List Your Products",
      description: "Add your products with high-quality images and detailed descriptions"
    },
    {
      number: "03",
      title: "Start Selling",
      description: "Begin receiving orders and growing your business"
    }
  ];

    return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading seller dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="bg-white rounded-lg p-1">
                    <img 
                      src="/images/GoSellrLogo.png" 
                      alt="GoSellr Logo" 
                      className="h-8 w-auto"
                    />
                  </div>
                </Link>
                
                <nav className="hidden md:flex items-center space-x-8">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                  <Link href="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
                  <Link href="/seller-login" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    Sign In
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Upgrade Notification */}
          {showUpgradeNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-green-500 text-white py-4"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiCheckCircle className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Congratulations! Your SQL Level has been upgraded!</p>
                    <p className="text-sm opacity-90">
                      {lastSQLLevel ? `Upgraded from ${lastSQLLevel} to ${seller?.serviceSQL_level}` : `Now at ${seller?.serviceSQL_level} level`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUpgradeNotification(false)}
                  className="text-white hover:text-gray-200"
                >
                  <FiArrowRight className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </motion.div>
          )}

      {/* SQL Level Status Section - Only show if seller is logged in */}
      {seller && (
        <section className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your SQL Status</h2>
              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Service SQL Level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Service SQL Level</p>
                    <div className="flex items-center space-x-2">
                      {React.createElement(getSQLLevelInfo(seller.serviceSQL_level).icon, {
                        className: `w-5 h-5 ${getSQLLevelInfo(seller.serviceSQL_level).color}`
                      })}
                      <span className={`text-lg font-semibold ${getSQLLevelInfo(seller.serviceSQL_level).color}`}>
                        {seller.serviceSQL_level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getSQLLevelInfo(seller.serviceSQL_level).limit}
                      {seller.sqlLevelUpdatedAt && (
                        <span className="block text-xs text-blue-500 mt-1">
                          Updated: {new Date(seller.sqlLevelUpdatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Product SQL Level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product SQL Level</p>
                    <div className="flex items-center space-x-2">
                      {React.createElement(getSQLLevelInfo(seller.productSQL_level).icon, {
                        className: `w-5 h-5 ${getSQLLevelInfo(seller.productSQL_level).color}`
                      })}
                      <span className={`text-lg font-semibold ${getSQLLevelInfo(seller.productSQL_level).color}`}>
                        {seller.productSQL_level}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getSQLLevelInfo(seller.productSQL_level).limit}
                      {seller.sqlLevelUpdatedAt && (
                        <span className="block text-xs text-green-500 mt-1">
                          Updated: {new Date(seller.sqlLevelUpdatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Verification Status */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-4 border border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verification Status</p>
                    <div className="flex items-center space-x-2">
                      <FiCheckCircle className="w-5 h-5 text-purple-600" />
                      <span className="text-lg font-semibold text-purple-600">
                        {getVerificationStatus()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Complete verification to upgrade
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Upgrade Now</p>
                    <Link 
                      href="/sql-verification"
                      className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      <span className="text-sm font-medium">Complete Verification</span>
                      <FiArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      Unlock higher limits
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Start Selling on GoSeller
          </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Join thousands of successful sellers and reach millions of customers worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/seller-registration" className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Selling Today
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">50,000+</div>
              <div className="text-gray-600">Active Sellers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">$2B+</div>
              <div className="text-gray-600">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">10M+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Sell on GoSeller?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to start and grow your online business
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-orange-500 mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how other sellers are growing their businesses
            </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(story.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">{story.rating}</span>
                </div>
                <p className="text-gray-600 mb-4">"{story.story}"</p>
                  <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{story.name}</div>
                    <div className="text-sm text-gray-600">{story.business}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-orange-500">{story.revenue}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
            </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just three simple steps
            </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.number}
                  </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
                      </div>
                    </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Tools for Sellers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FiPackage className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold">Inventory Management</h3>
                    </div>
              <p className="text-gray-600">Easily manage your product inventory and track stock levels</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FiShoppingCart className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold">Order Management</h3>
                  </div>
              <p className="text-gray-600">Process orders efficiently and track shipping status</p>
                  </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FiBarChart className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
                  </div>
              <p className="text-gray-600">Get detailed insights into your sales and customer behavior</p>
                  </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FiDollarSign className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold">Payment Processing</h3>
                  </div>
              <p className="text-gray-600">Secure payment processing with multiple payment methods</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FiUsers className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold">Customer Support</h3>
                    </div>
              <p className="text-gray-600">24/7 customer support for both sellers and buyers</p>
                  </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <FiSettings className="w-6 h-6 text-orange-500 mr-3" />
                <h3 className="text-lg font-semibold">Easy Setup</h3>
              </div>
              <p className="text-gray-600">Quick and easy setup process to get you selling fast</p>
            </div>
                    </div>
                  </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of successful sellers and start your journey to business success
          </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/seller-registration" className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
              Start Selling Now
              <FiArrowRight className="ml-2" />
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-500 transition-colors">
              Contact Sales
            </button>
          </div>
                    </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sell on GoSeller</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/seller-guide" className="hover:text-white">Seller Guide</Link></li>
                <li><Link href="/fees" className="hover:text-white">Fees & Pricing</Link></li>
                <li><Link href="/fulfillment" className="hover:text-white">Fulfillment</Link></li>
                <li><Link href="/advertising" className="hover:text-white">Advertising</Link></li>
              </ul>
                  </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/community" className="hover:text-white">Seller Community</Link></li>
                <li><Link href="/training" className="hover:text-white">Training</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white">Seller Blog</Link></li>
                <li><Link href="/events" className="hover:text-white">Events</Link></li>
                <li><Link href="/partners" className="hover:text-white">Partners</Link></li>
                <li><Link href="/api" className="hover:text-white">API</Link></li>
              </ul>
                  </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
                <li><Link href="/accessibility" className="hover:text-white">Accessibility</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoSeller. All rights reserved.</p>
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
};

export default SellerDashboard;
