import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiStar,
  FiTruck, FiShield, FiGift, FiTrendingUp, FiLogIn, FiUserPlus,
  FiHome, FiPackage, FiUsers, FiDollarSign, FiBarChart, FiSettings,
  FiShoppingBag, FiTag, FiAward, FiZap, FiGlobe, FiSmartphone,
  FiMapPin, FiChevronDown, FiChevronRight, FiGrid, FiList
} from 'react-icons/fi';
import { FaAmazon, FaShopify, FaEbay, FaBitcoin } from 'react-icons/fa';
import { SiOpensea } from 'react-icons/si';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import apiService from '../services/api';
import { Product, Category } from '../services/api';

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
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

  // GoSeller categories with best sellers
  const gosellerCategories = [
    { 
      id: '1', 
      name: 'Electronics', 
      icon: '📱', 
      color: 'bg-blue-500',
      slug: 'electronics',
      bestSellers: [
        { _id: '1', name: 'Wireless Bluetooth Headphones', price: 89.99, originalPrice: 129.99, rating: 4.5, reviews: 1247, stock: 50, images: ['https://via.placeholder.com/300x200?text=Headphones'], category: 'Electronics', isBestSeller: true },
        { _id: '2', name: 'Smartphone 128GB', price: 599.99, originalPrice: 699.99, rating: 4.8, reviews: 892, stock: 25, images: ['https://via.placeholder.com/300x200?text=Smartphone'], category: 'Electronics', isBestSeller: true },
        { _id: '3', name: '4K Smart TV 55"', price: 449.99, originalPrice: 599.99, rating: 4.6, reviews: 567, stock: 15, images: ['https://via.placeholder.com/300x200?text=TV'], category: 'Electronics', isBestSeller: true },
        { _id: '4', name: 'Laptop 15.6" 8GB RAM', price: 799.99, originalPrice: 999.99, rating: 4.7, reviews: 423, stock: 30, images: ['https://via.placeholder.com/300x200?text=Laptop'], category: 'Electronics', isBestSeller: true },
      ]
    },
    { 
      id: '2', 
      name: 'Fashion', 
      icon: '👕', 
      color: 'bg-pink-500',
      slug: 'fashion',
      bestSellers: [
        { _id: '5', name: 'Men\'s Casual T-Shirt', price: 24.99, originalPrice: 34.99, rating: 4.3, reviews: 156, stock: 100, images: ['https://via.placeholder.com/300x200?text=T-Shirt'], category: 'Fashion', isBestSeller: true },
        { _id: '6', name: 'Women\'s Summer Dress', price: 49.99, originalPrice: 69.99, rating: 4.4, reviews: 234, stock: 75, images: ['https://via.placeholder.com/300x200?text=Dress'], category: 'Fashion', isBestSeller: true },
        { _id: '7', name: 'Running Shoes', price: 79.99, originalPrice: 99.99, rating: 4.6, reviews: 189, stock: 60, images: ['https://via.placeholder.com/300x200?text=Shoes'], category: 'Fashion', isBestSeller: true },
        { _id: '8', name: 'Denim Jeans', price: 59.99, originalPrice: 79.99, rating: 4.2, reviews: 98, stock: 80, images: ['https://via.placeholder.com/300x200?text=Jeans'], category: 'Fashion', isBestSeller: true },
      ]
    },
    { 
      id: '3', 
      name: 'Home & Kitchen', 
      icon: '🏠', 
      color: 'bg-green-500',
      slug: 'home-kitchen',
      bestSellers: [
        { _id: '9', name: 'Coffee Maker', price: 89.99, originalPrice: 119.99, rating: 4.5, reviews: 312, stock: 40, images: ['https://via.placeholder.com/300x200?text=Coffee+Maker'], category: 'Home & Kitchen', isBestSeller: true },
        { _id: '10', name: 'Kitchen Knife Set', price: 69.99, originalPrice: 89.99, rating: 4.7, reviews: 156, stock: 55, images: ['https://via.placeholder.com/300x200?text=Knife+Set'], category: 'Home & Kitchen', isBestSeller: true },
        { _id: '11', name: 'Blender 1000W', price: 49.99, originalPrice: 69.99, rating: 4.3, reviews: 234, stock: 70, images: ['https://via.placeholder.com/300x200?text=Blender'], category: 'Home & Kitchen', isBestSeller: true },
        { _id: '12', name: 'Bedding Set Queen', price: 79.99, originalPrice: 99.99, rating: 4.4, reviews: 189, stock: 45, images: ['https://via.placeholder.com/300x200?text=Bedding'], category: 'Home & Kitchen', isBestSeller: true },
      ]
    },
    { 
      id: '4', 
      name: 'Sports & Outdoors', 
      icon: '⚽', 
      color: 'bg-orange-500',
      slug: 'sports-outdoors',
      bestSellers: [
        { _id: '13', name: 'Yoga Mat Premium', price: 29.99, originalPrice: 39.99, rating: 4.6, reviews: 445, stock: 120, images: ['https://via.placeholder.com/300x200?text=Yoga+Mat'], category: 'Sports & Outdoors', isBestSeller: true },
        { _id: '14', name: 'Basketball Official Size', price: 24.99, originalPrice: 34.99, rating: 4.5, reviews: 234, stock: 90, images: ['https://via.placeholder.com/300x200?text=Basketball'], category: 'Sports & Outdoors', isBestSeller: true },
        { _id: '15', name: 'Tennis Racket Pro', price: 89.99, originalPrice: 119.99, rating: 4.7, reviews: 156, stock: 35, images: ['https://via.placeholder.com/300x200?text=Tennis+Racket'], category: 'Sports & Outdoors', isBestSeller: true },
        { _id: '16', name: 'Camping Tent 4-Person', price: 149.99, originalPrice: 199.99, rating: 4.4, reviews: 98, stock: 25, images: ['https://via.placeholder.com/300x200?text=Tent'], category: 'Sports & Outdoors', isBestSeller: true },
      ]
    },
    { 
      id: '5', 
      name: 'Books', 
      icon: '📚', 
      color: 'bg-purple-500',
      slug: 'books',
      bestSellers: [
        { _id: '17', name: 'The Great Gatsby', price: 12.99, originalPrice: 16.99, rating: 4.8, reviews: 1234, stock: 200, images: ['https://via.placeholder.com/300x200?text=Book'], category: 'Books', isBestSeller: true },
        { _id: '18', name: 'Programming Guide 2024', price: 34.99, originalPrice: 44.99, rating: 4.6, reviews: 567, stock: 150, images: ['https://via.placeholder.com/300x200?text=Programming+Book'], category: 'Books', isBestSeller: true },
        { _id: '19', name: 'Cookbook Collection', price: 24.99, originalPrice: 29.99, rating: 4.5, reviews: 345, stock: 100, images: ['https://via.placeholder.com/300x200?text=Cookbook'], category: 'Books', isBestSeller: true },
        { _id: '20', name: 'Children\'s Story Book', price: 9.99, originalPrice: 14.99, rating: 4.7, reviews: 234, stock: 300, images: ['https://via.placeholder.com/300x200?text=Children+Book'], category: 'Books', isBestSeller: true },
      ]
    },
    { 
      id: '6', 
      name: 'Toys & Games', 
      icon: '🎮', 
      color: 'bg-red-500',
      slug: 'toys-games',
      bestSellers: [
        { _id: '21', name: 'Board Game Strategy', price: 39.99, originalPrice: 49.99, rating: 4.6, reviews: 234, stock: 75, images: ['https://via.placeholder.com/300x200?text=Board+Game'], category: 'Toys & Games', isBestSeller: true },
        { _id: '22', name: 'LEGO Building Set', price: 59.99, originalPrice: 79.99, rating: 4.8, reviews: 456, stock: 60, images: ['https://via.placeholder.com/300x200?text=LEGO'], category: 'Toys & Games', isBestSeller: true },
        { _id: '23', name: 'Remote Control Car', price: 29.99, originalPrice: 39.99, rating: 4.4, reviews: 189, stock: 90, images: ['https://via.placeholder.com/300x200?text=RC+Car'], category: 'Toys & Games', isBestSeller: true },
        { _id: '24', name: 'Puzzle 1000 Pieces', price: 19.99, originalPrice: 24.99, rating: 4.5, reviews: 123, stock: 120, images: ['https://via.placeholder.com/300x200?text=Puzzle'], category: 'Toys & Games', isBestSeller: true },
      ]
    },
    { 
      id: '7', 
      name: 'Automotive', 
      icon: '🚗', 
      color: 'bg-gray-500',
      slug: 'automotive',
      bestSellers: [
        { _id: '25', name: 'Car Phone Mount', price: 19.99, originalPrice: 29.99, rating: 4.4, reviews: 567, stock: 200, images: ['https://via.placeholder.com/300x200?text=Phone+Mount'], category: 'Automotive', isBestSeller: true },
        { _id: '26', name: 'Dash Camera HD', price: 89.99, originalPrice: 119.99, rating: 4.6, reviews: 234, stock: 80, images: ['https://via.placeholder.com/300x200?text=Dash+Camera'], category: 'Automotive', isBestSeller: true },
        { _id: '27', name: 'Car Floor Mats', price: 39.99, originalPrice: 49.99, rating: 4.3, reviews: 189, stock: 150, images: ['https://via.placeholder.com/300x200?text=Floor+Mats'], category: 'Automotive', isBestSeller: true },
        { _id: '28', name: 'Bluetooth Car Speaker', price: 69.99, originalPrice: 89.99, rating: 4.5, reviews: 123, stock: 60, images: ['https://via.placeholder.com/300x200?text=Car+Speaker'], category: 'Automotive', isBestSeller: true },
      ]
    },
    { 
      id: '8', 
      name: 'Health & Beauty', 
      icon: '💄', 
      color: 'bg-indigo-500',
      slug: 'health-beauty',
      bestSellers: [
        { _id: '29', name: 'Electric Toothbrush', price: 49.99, originalPrice: 69.99, rating: 4.7, reviews: 456, stock: 100, images: ['https://via.placeholder.com/300x200?text=Toothbrush'], category: 'Health & Beauty', isBestSeller: true },
        { _id: '30', name: 'Facial Cleanser Set', price: 29.99, originalPrice: 39.99, rating: 4.5, reviews: 234, stock: 120, images: ['https://via.placeholder.com/300x200?text=Cleanser'], category: 'Health & Beauty', isBestSeller: true },
        { _id: '31', name: 'Hair Dryer Professional', price: 79.99, originalPrice: 99.99, rating: 4.6, reviews: 189, stock: 75, images: ['https://via.placeholder.com/300x200?text=Hair+Dryer'], category: 'Health & Beauty', isBestSeller: true },
        { _id: '32', name: 'Makeup Brush Set', price: 24.99, originalPrice: 34.99, rating: 4.4, reviews: 156, stock: 90, images: ['https://via.placeholder.com/300x200?text=Makeup+Brushes'], category: 'Health & Beauty', isBestSeller: true },
      ]
    },
    { 
      id: '9', 
      name: 'Garden & Tools', 
      icon: '🌱', 
      color: 'bg-teal-500',
      slug: 'garden-tools',
      bestSellers: [
        { _id: '33', name: 'Garden Hose 50ft', price: 34.99, originalPrice: 44.99, rating: 4.5, reviews: 234, stock: 80, images: ['https://via.placeholder.com/300x200?text=Garden+Hose'], category: 'Garden & Tools', isBestSeller: true },
        { _id: '34', name: 'Cordless Drill Set', price: 89.99, originalPrice: 119.99, rating: 4.7, reviews: 189, stock: 45, images: ['https://via.placeholder.com/300x200?text=Drill+Set'], category: 'Garden & Tools', isBestSeller: true },
        { _id: '35', name: 'Plant Pots Set', price: 19.99, originalPrice: 29.99, rating: 4.3, reviews: 123, stock: 150, images: ['https://via.placeholder.com/300x200?text=Plant+Pots'], category: 'Garden & Tools', isBestSeller: true },
        { _id: '36', name: 'Garden Tool Kit', price: 59.99, originalPrice: 79.99, rating: 4.6, reviews: 98, stock: 60, images: ['https://via.placeholder.com/300x200?text=Tool+Kit'], category: 'Garden & Tools', isBestSeller: true },
      ]
    },
    { 
      id: '10', 
      name: 'Pet Supplies', 
      icon: '🐕', 
      color: 'bg-yellow-500',
      slug: 'pet-supplies',
      bestSellers: [
        { _id: '37', name: 'Pet Food Premium', price: 39.99, originalPrice: 49.99, rating: 4.6, reviews: 345, stock: 100, images: ['https://via.placeholder.com/300x200?text=Pet+Food'], category: 'Pet Supplies', isBestSeller: true },
        { _id: '38', name: 'Pet Bed Large', price: 49.99, originalPrice: 69.99, rating: 4.5, reviews: 234, stock: 75, images: ['https://via.placeholder.com/300x200?text=Pet+Bed'], category: 'Pet Supplies', isBestSeller: true },
        { _id: '39', name: 'Cat Scratching Post', price: 29.99, originalPrice: 39.99, rating: 4.4, reviews: 189, stock: 90, images: ['https://via.placeholder.com/300x200?text=Scratching+Post'], category: 'Pet Supplies', isBestSeller: true },
        { _id: '40', name: 'Dog Leash Retractable', price: 24.99, originalPrice: 34.99, rating: 4.7, reviews: 156, stock: 120, images: ['https://via.placeholder.com/300x200?text=Dog+Leash'], category: 'Pet Supplies', isBestSeller: true },
      ]
    },
    { 
      id: '11', 
      name: 'Baby Products', 
      icon: '🍼', 
      color: 'bg-pink-400',
      slug: 'baby-products',
      bestSellers: [
        { _id: '41', name: 'Baby Diapers Pack', price: 34.99, originalPrice: 44.99, rating: 4.6, reviews: 456, stock: 200, images: ['https://via.placeholder.com/300x200?text=Diapers'], category: 'Baby Products', isBestSeller: true },
        { _id: '42', name: 'Baby Formula Premium', price: 29.99, originalPrice: 39.99, rating: 4.7, reviews: 234, stock: 150, images: ['https://via.placeholder.com/300x200?text=Baby+Formula'], category: 'Baby Products', isBestSeller: true },
        { _id: '43', name: 'Baby Stroller Lightweight', price: 149.99, originalPrice: 199.99, rating: 4.5, reviews: 189, stock: 50, images: ['https://via.placeholder.com/300x200?text=Stroller'], category: 'Baby Products', isBestSeller: true },
        { _id: '44', name: 'Baby Monitor HD', price: 89.99, originalPrice: 119.99, rating: 4.6, reviews: 123, stock: 75, images: ['https://via.placeholder.com/300x200?text=Baby+Monitor'], category: 'Baby Products', isBestSeller: true },
      ]
    },
    { 
      id: '12', 
      name: 'Office Products', 
      icon: '💼', 
      color: 'bg-blue-600',
      slug: 'office-products',
      bestSellers: [
        { _id: '45', name: 'Wireless Mouse Ergonomic', price: 24.99, originalPrice: 34.99, rating: 4.5, reviews: 234, stock: 120, images: ['https://via.placeholder.com/300x200?text=Mouse'], category: 'Office Products', isBestSeller: true },
        { _id: '46', name: 'Desk Lamp LED', price: 39.99, originalPrice: 49.99, rating: 4.4, reviews: 189, stock: 90, images: ['https://via.placeholder.com/300x200?text=Desk+Lamp'], category: 'Office Products', isBestSeller: true },
        { _id: '47', name: 'Office Chair Ergonomic', price: 199.99, originalPrice: 249.99, rating: 4.7, reviews: 156, stock: 30, images: ['https://via.placeholder.com/300x200?text=Office+Chair'], category: 'Office Products', isBestSeller: true },
        { _id: '48', name: 'Printer All-in-One', price: 89.99, originalPrice: 119.99, rating: 4.6, reviews: 98, stock: 60, images: ['https://via.placeholder.com/300x200?text=Printer'], category: 'Office Products', isBestSeller: true },
      ]
    },
  ];

  // Load data on component mount
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Use dummy categories
      setCategories(gosellerCategories);
    }
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProducts();
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      // Use dummy products
      const allBestSellers = gosellerCategories.flatMap(cat => cat.bestSellers);
      setProducts(allBestSellers);
    } finally {
      setIsLoading(false);
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
      {/* GoSeller Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold">GoSeller</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search GoSeller"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </form>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-white hover:text-orange-200 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/cart" className="relative text-white hover:text-orange-200 transition-colors">
                    <FiShoppingCart className="w-6 h-6" />
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {getCartItemCount()}
                      </span>
                    )}
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm font-medium">
                        {user?.firstName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-white">{user?.firstName}</span>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-white hover:text-orange-200 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:text-orange-200 hover:bg-orange-700"
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
              className="md:hidden border-t border-orange-400"
            >
              <div className="px-4 py-6 space-y-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="block text-white hover:text-orange-200">
                      Dashboard
                    </Link>
                    <Link to="/cart" className="block text-white hover:text-orange-200">
                      Cart ({getCartItemCount()})
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="block w-full text-left text-white hover:text-orange-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="block w-full text-left text-white hover:text-orange-200"
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

      {/* Categories Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-2 overflow-x-auto">
            {gosellerCategories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              >
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sell Button - Prominent GoSeller-style */}
        <div className="mb-8">
          <Link
            to="/seller-dashboard"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <FiPackage className="w-6 h-6" />
            <span className="text-lg font-semibold">Start Selling Today!</span>
            <FiChevronRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Best Sellers by Category */}
        <div className="space-y-12">
          {gosellerCategories.map((category) => (
            <section key={category.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.name} Best Sellers</h2>
                    <p className="text-gray-600">Top products in {category.name.toLowerCase()}</p>
                  </div>
                </div>
                <Link
                  to={`/category/${category.slug}`}
                  className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                >
                  <span>View All</span>
                  <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.bestSellers.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                  >
                    <div className="relative">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/300x200?text=Product'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {product.originalPrice && product.price < product.originalPrice && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Best Seller
                        </span>
                      )}
                      <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                        <FiHeart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                        {product.name}
                      </h3>
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">({product.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-gray-900">${product.price}</span>
                          {product.originalPrice && product.price < product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-green-600 font-medium">
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowRegisterModal(true);
                    }}
                    className="text-orange-600 hover:text-orange-700"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                    }}
                    className="text-orange-600 hover:text-orange-700"
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
