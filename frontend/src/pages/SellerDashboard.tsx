import React from 'react';
import { Link } from 'react-router-dom';
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
  FiSettings
} from 'react-icons/fi';

const SellerDashboard: React.FC = () => {
  console.log('🎯 SellerDashboard component is rendering - URL:', window.location.href);
  console.log('🎯 Current pathname:', window.location.pathname);
  



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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
      </div>
              <span className="text-xl font-bold text-gray-900">GoSeller</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Sign In
              </button>
            </nav>
          </div>
        </div>
      </header>

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
              <button className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Selling Today
              </button>
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
            <button className="bg-white text-orange-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
              Start Selling Now
              <FiArrowRight className="ml-2" />
            </button>
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
                <li><Link to="/seller-guide" className="hover:text-white">Seller Guide</Link></li>
                <li><Link to="/fees" className="hover:text-white">Fees & Pricing</Link></li>
                <li><Link to="/fulfillment" className="hover:text-white">Fulfillment</Link></li>
                <li><Link to="/advertising" className="hover:text-white">Advertising</Link></li>
              </ul>
                  </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="/community" className="hover:text-white">Seller Community</Link></li>
                <li><Link to="/training" className="hover:text-white">Training</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/blog" className="hover:text-white">Seller Blog</Link></li>
                <li><Link to="/events" className="hover:text-white">Events</Link></li>
                <li><Link to="/partners" className="hover:text-white">Partners</Link></li>
                <li><Link to="/api" className="hover:text-white">API</Link></li>
              </ul>
                  </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/cookies" className="hover:text-white">Cookie Policy</Link></li>
                <li><Link to="/accessibility" className="hover:text-white">Accessibility</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoSeller. All rights reserved.</p>
          </div>
      </div>
      </footer>
    </div>
  );
};

export default SellerDashboard;
