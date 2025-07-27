import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiStar, FiTruck, FiShield, FiGift, FiTrendingUp, FiLogIn, FiUserPlus } from 'react-icons/fi';
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
      title: "🌟 Divine E-commerce Experience",
      subtitle: "The World's Most Advanced Shopping Platform",
      description: "Experience the future of online shopping with AI-powered recommendations, blockchain security, and lightning-fast performance.",
      image: "/images/hero-1.jpg",
      bgGradient: "from-purple-600 via-pink-600 to-red-600",
      ctaText: "Shop Now",
      ctaLink: "/products"
    },
    {
      id: 2,
      title: "🚀 Ultra-Fast Performance",
      subtitle: "Lightning Speed Shopping",
      description: "Enjoy sub-2ms response times and seamless shopping experience with our cutting-edge technology.",
      image: "/images/hero-2.jpg",
      bgGradient: "from-blue-600 via-cyan-600 to-teal-600",
      ctaText: "Explore",
      ctaLink: "/categories"
    },
    {
      id: 3,
      title: "🤖 AI-Powered Intelligence",
      subtitle: "Smart Recommendations",
      description: "Discover products tailored to your preferences with our advanced AI recommendation system.",
      image: "/images/hero-3.jpg",
      bgGradient: "from-green-600 via-emerald-600 to-teal-600",
      ctaText: "Discover",
      ctaLink: "/ai-recommendations"
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GoSellr</span>
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

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
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
                className="group bg-white rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
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
      <section className="py-16">
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
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={product.images[0] || '/images/placeholder.jpg'}
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose GoSellr?</h2>
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
