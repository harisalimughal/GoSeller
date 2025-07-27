import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiStar,
  FiTruck, FiShield, FiGift, FiTrendingUp, FiLogIn, FiUserPlus,
  FiHome, FiPackage, FiUsers, FiDollarSign, FiBarChart3, FiSettings,
  FiShoppingBag, FiTag, FiAward, FiZap, FiGlobe, FiSmartphone
} from 'react-icons/fi';
import { FaAmazon, FaShopify, FaEbay, FaOpensea, FaBitcoin } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import apiService from '../services/api';
import { Product, Category } from '../services/api';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 1250,
    totalUsers: 8500,
    totalOrders: 3200,
    totalRevenue: 125000
  });

  const { user, isAuthenticated, login, register, error: authError, clearError } = useAuth();
  const { addToCart, getCartItemCount } = useCart();

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // Hero carousel data
  const heroSlides = [
    {
      id: 1,
      title: "🌟 EHB GoSeller Platform",
      subtitle: "The Ultimate E-commerce Solution",
      description: "Experience the future of online shopping with AI-powered recommendations, blockchain security, and lightning-fast performance.",
      image: "/images/hero-1.jpg",
      bgGradient: "from-purple-600 via-pink-600 to-red-600",
      ctaText: "Explore Products",
      ctaLink: "/products"
    },
    {
      id: 2,
      title: "🚀 Multi-Platform Integration",
      subtitle: "Sell Everywhere, Manage from One Place",
      description: "Connect with Amazon, Shopify, eBay, and more. Manage all your sales from a single dashboard.",
      image: "/images/hero-2.jpg",
      bgGradient: "from-blue-600 via-cyan-600 to-teal-600",
      ctaText: "View Dashboard",
      ctaLink: "/dashboard"
    },
    {
      id: 3,
      title: "🤖 AI-Powered Intelligence",
      subtitle: "Smart Recommendations & Analytics",
      description: "Discover products tailored to your preferences with our advanced AI recommendation system.",
      image: "/images/hero-3.jpg",
      bgGradient: "from-green-600 via-emerald-600 to-teal-600",
      ctaText: "Try AI Features",
      ctaLink: "/ai-recommendations"
    }
  ];

  // Dashboard Cards Data
  const dashboardCards = [
    {
      id: 1,
      title: "Total Products",
      value: dashboardStats.totalProducts.toLocaleString(),
      icon: FiPackage,
      color: "bg-blue-500",
      link: "/products",
      description: "Active products in catalog"
    },
    {
      id: 2,
      title: "Total Users",
      value: dashboardStats.totalUsers.toLocaleString(),
      icon: FiUsers,
      color: "bg-green-500",
      link: "/users",
      description: "Registered customers"
    },
    {
      id: 3,
      title: "Total Orders",
      value: dashboardStats.totalOrders.toLocaleString(),
      icon: FiShoppingBag,
      color: "bg-purple-500",
      link: "/orders",
      description: "Completed transactions"
    },
    {
      id: 4,
      title: "Total Revenue",
      value: `$${dashboardStats.totalRevenue.toLocaleString()}`,
      icon: FiDollarSign,
      color: "bg-orange-500",
      link: "/analytics",
      description: "Total sales revenue"
    },
    {
      id: 5,
      title: "AI Analytics",
      value: "Live",
      icon: FiBarChart3,
      color: "bg-indigo-500",
      link: "/analytics",
      description: "Real-time insights"
    },
    {
      id: 6,
      title: "Platform Integration",
      value: "4 Active",
      icon: FiGlobe,
      color: "bg-teal-500",
      link: "/integrations",
      description: "Connected platforms"
    }
  ];

  // Platform Integration Cards
  const platformCards = [
    {
      id: 1,
      name: "Amazon",
      icon: FaAmazon,
      status: "Connected",
      color: "bg-orange-500",
      sales: 450,
      revenue: 25000
    },
    {
      id: 2,
      name: "Shopify",
      icon: FaShopify,
      status: "Connected",
      color: "bg-green-500",
      sales: 320,
      revenue: 18000
    },
    {
      id: 3,
      name: "eBay",
      icon: FaEbay,
      status: "Connected",
      color: "bg-blue-500",
      sales: 280,
      revenue: 15000
    },
    {
      id: 4,
      name: "OpenSea",
      icon: FaOpensea,
      status: "Connected",
      color: "bg-purple-500",
      sales: 120,
      revenue: 8000
    }
  ];

  // Load data on component mount
  useEffect(() => {
    loadFeaturedProducts();
    loadCategories();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const loadFeaturedProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getFeaturedProducts();
      if (response.success) {
        setFeaturedProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to load featured products:', error);
      // Add mock data for demo
      setFeaturedProducts([
        {
          _id: '1',
          name: 'Premium Wireless Headphones',
          price: 199.99,
          originalPrice: 249.99,
          description: 'High-quality wireless headphones with noise cancellation',
          images: ['/images/headphones.jpg'],
          rating: 4.5,
          reviews: 128,
          stock: 50,
          isFeatured: true
        },
        {
          _id: '2',
          name: 'Smart Fitness Watch',
          price: 299.99,
          originalPrice: 349.99,
          description: 'Advanced fitness tracking with heart rate monitoring',
          images: ['/images/watch.jpg'],
          rating: 4.8,
          reviews: 95,
          stock: 30,
          isFeatured: true
        },
        {
          _id: '3',
          name: 'Ultra HD Camera',
          price: 599.99,
          originalPrice: 699.99,
          description: 'Professional 4K camera for content creators',
          images: ['/images/camera.jpg'],
          rating: 4.7,
          reviews: 67,
          stock: 15,
          isFeatured: true
        },
        {
          _id: '4',
          name: 'Gaming Laptop',
          price: 1299.99,
          originalPrice: 1499.99,
          description: 'High-performance gaming laptop with RTX graphics',
          images: ['/images/laptop.jpg'],
          rating: 4.9,
          reviews: 203,
          stock: 25,
          isFeatured: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Add mock data for demo
      setCategories([
        { _id: '1', name: 'Electronics', slug: 'electronics', description: 'Latest gadgets and devices' },
        { _id: '2', name: 'Fashion', slug: 'fashion', description: 'Trendy clothing and accessories' },
        { _id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Everything for your home' },
        { _id: '4', name: 'Sports', slug: 'sports', description: 'Sports equipment and gear' },
        { _id: '5', name: 'Books', slug: 'books', description: 'Books and educational materials' },
        { _id: '6', name: 'Toys', slug: 'toys', description: 'Fun toys and games' }
      ]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm.email, loginForm.password);
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerForm);
      setShowRegisterModal(false);
      setRegisterForm({ email: '', password: '', firstName: '', lastName: '' });
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EHB GoSeller</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, categories, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </form>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors">
                    <FiShoppingCart className="w-6 h-6" />
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {getCartItemCount()}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-gray-700">{user?.firstName}</span>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <FiLogIn className="w-5 h-5" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <FiUserPlus className="w-5 h-5" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="block text-gray-600 hover:text-gray-900">
                      Dashboard
                    </Link>
                    <Link to="/cart" className="block text-gray-600 hover:text-gray-900">
                      Cart ({getCartItemCount()})
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="block w-full text-left text-gray-600 hover:text-gray-900"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="block w-full text-left text-gray-600 hover:text-gray-900"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-96 md:h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].bgGradient}`}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-3xl">
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-6xl font-bold text-white mb-4"
                    >
                      {heroSlides[currentSlide].title}
                    </motion.h1>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xl md:text-2xl text-white mb-6"
                    >
                      {heroSlides[currentSlide].subtitle}
                    </motion.p>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-lg text-white/90 mb-8"
                    >
                      {heroSlides[currentSlide].description}
                    </motion.p>
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Link
                        to={heroSlides[currentSlide].ctaLink}
                        className="inline-flex items-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {heroSlides[currentSlide].ctaText}
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Cards Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Overview</h2>
            <p className="text-lg text-gray-600">Real-time statistics and performance metrics</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <Link to={card.link} className="block">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <FiZap className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integration Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Integrations</h2>
            <p className="text-lg text-gray-600">Connected marketplaces and sales channels</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformCards.map((platform) => (
              <motion.div
                key={platform.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center`}>
                    <platform.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {platform.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{platform.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sales:</span>
                    <span className="font-medium">{platform.sales}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="font-medium">${platform.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Discover amazing products in your favorite categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group bg-gray-50 rounded-lg p-6 text-center hover:bg-purple-50 transition-colors"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Handpicked products just for you</p>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/300x200?text=Product'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.isFeatured && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                        Featured
                      </span>
                    )}
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                      <FiHeart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-green-600 font-medium">
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EHB GoSeller?</h2>
            <p className="text-lg text-gray-600">Experience the future of e-commerce</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">100% secure payment processing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGift className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day money-back guarantee</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Recommendations</h3>
              <p className="text-gray-600">Personalized product suggestions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>
              {authError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {authError}
                </div>
              )}
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowRegisterModal(true);
                    }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRegisterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
              {authError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {authError}
                </div>
              )}
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                    <input
                      type="text"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                    }}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Already have an account?
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
