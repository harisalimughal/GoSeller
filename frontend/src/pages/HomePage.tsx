"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FiSearch, FiShoppingCart, FiHeart, FiMenu, FiX, FiStar,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { CATEGORIES, CATEGORY_TO_SLUG_MAPPING, CATEGORY_DESCRIPTIONS } from '../config/categories';

// Simplified Product interface for dummy data
interface DummyProduct {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  images: string[];
  category: string;
  brand?: string;
  isBestSeller?: boolean;
}

const HomePage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [currentCarouselSlide, setCurrentCarouselSlide] = useState(0);

  const { user, isAuthenticated, login, register, error: authError } = useAuth();
  const { addToCart, getCartItemCount } = useCart();

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to get product images based on category
  const getProductImage = (productName: string, category: string) => {
    const imageMap: { [key: string]: { [key: string]: string } } = {
      'Electronics': {
        'Wireless Bluetooth Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop&crop=center',
        'Smartphone 128GB': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop&crop=center',
        '4K Smart TV 55"': 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop&crop=center',
        'Laptop 15.6" 8GB RAM': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop&crop=center'
      },
      'Fashion': {
        'Men\'s Casual T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=200&fit=crop&crop=center',
        'Women\'s Summer Dress': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop&crop=center',
        'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop&crop=center',
        'Denim Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=200&fit=crop&crop=center'
      },
      'Home & Kitchen': {
        'Coffee Maker': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=200&fit=crop&crop=center',
        'Kitchen Knife Set': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop&crop=center',
        'Blender 1000W': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
        'Bedding Set Queen': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop&crop=center'
      },
      'Sports & Outdoors': {
        'Yoga Mat Premium': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=200&fit=crop&crop=center',
        'Basketball Official Size': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&h=200&fit=crop&crop=center',
        'Tennis Racket Pro': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop&crop=center',
        'Camping Tent 4-Person': 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=300&h=200&fit=crop&crop=center'
      },
      'Books': {
        'The Great Gatsby': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop&crop=center',
        'Programming Guide 2024': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center',
        'Cookbook Collection': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=200&fit=crop&crop=center',
        'Children\'s Story Book': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center'
      },
      'Toys & Games': {
        'Board Game Strategy': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop&crop=center',
        'LEGO Building Set': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
        'Remote Control Car': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
        'Puzzle 1000 Pieces': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=200&fit=crop&crop=center'
      },
      'Automotive': {
        'Car Phone Mount': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
        'Dash Camera HD': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
        'Car Floor Mats': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center',
        'Bluetooth Car Speaker': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop&crop=center'
      },
      'Health & Beauty': {
        'Electric Toothbrush': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop&crop=center',
        'Facial Cleanser Set': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop&crop=center',
        'Hair Dryer Professional': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop&crop=center',
        'Makeup Brush Set': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&h=200&fit=crop&crop=center'
      },
      'Garden & Tools': {
        'Garden Hose 50ft': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop&crop=center',
        'Cordless Drill Set': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center',
        'Plant Pots Set': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=200&fit=crop&crop=center',
        'Garden Tool Kit': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop&crop=center'
      },
      'Pet Supplies': {
        'Pet Food Premium': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop&crop=center',
        'Pet Bed Large': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop&crop=center',
        'Cat Scratching Post': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop&crop=center',
        'Dog Leash Retractable': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop&crop=center'
      },
      'Baby Products': {
        'Baby Diapers Pack': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop&crop=center',
        'Baby Formula Premium': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop&crop=center',
        'Baby Stroller Lightweight': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300&h=200&fit=crop&crop=center',
        'Baby Monitor HD': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop&crop=center'
      },
      'Office Products': {
        'Wireless Mouse Ergonomic': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop&crop=center',
        'Desk Lamp LED': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=200&fit=crop&crop=center',
        'Office Chair Ergonomic': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop&crop=center',
        'Printer All-in-One': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop&crop=center'
      }
    };
    
    return imageMap[category]?.[productName] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop&crop=center';
  };

  // Carousel images - you can replace these with your uploaded images
  const carouselImages = [
    {
      id: 1,
      src: "/images/carousel/carasoul1.jpg",
      alt: "Carousel Image 1",
      title: "Amazing Deals",
      subtitle: "Discover incredible offers"
    },
    {
      id: 2,
      src: "/images/carousel/carasoul2.jpg",
      alt: "Carousel Image 2",
      title: "Best Sellers",
      subtitle: "Top rated products"
    },
    {
      id: 3,
      src: "/images/carousel/carasoul3.jpg",
      alt: "Carousel Image 3",
      title: "Flash Sale",
      subtitle: "Limited time offers"
    },
    {
      id: 4,
      src: "/images/carousel/carasoul4.jpg",
      alt: "Carousel Image 4",
      title: "New Arrivals",
      subtitle: "Fresh products daily"
    },
    {
      id: 5,
      src: "/images/carousel/carasoul5.jpg",
      alt: "Carousel Image 5",
      title: "Trending Now",
      subtitle: "What's hot right now"
    }
  ];

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCarouselSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCategoriesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  // GoSeller categories with best sellers - using shared categories
  const categoryIcons = {
    'Electronics': '📱',
    'Fashion': '👕',
    'Home': '🏠',
    'Beauty': '💄',
    'Sports': '⚽',
    'Books': '📚',
    'Automotive': '🚗',
    'Health': '🏥',
    'Grocery': '🛒',
    'Other': '📦'
  };

  const categoryColors = {
    'Electronics': 'bg-blue-500',
    'Fashion': 'bg-pink-500',
    'Home': 'bg-green-500',
    'Beauty': 'bg-purple-500',
    'Sports': 'bg-orange-500',
    'Books': 'bg-indigo-500',
    'Automotive': 'bg-gray-500',
    'Health': 'bg-red-500',
    'Grocery': 'bg-yellow-500',
    'Other': 'bg-teal-500'
  };

  const gosellerCategories = CATEGORIES.map((category, index) => ({
    id: (index + 1).toString(),
    name: category,
    icon: categoryIcons[category as keyof typeof categoryIcons] || '📦',
    color: categoryColors[category as keyof typeof categoryColors] || 'bg-gray-500',
    slug: CATEGORY_TO_SLUG_MAPPING[category as keyof typeof CATEGORY_TO_SLUG_MAPPING],
    bestSellers: [
      { _id: `${index + 1}`, name: `${category} Product 1`, price: 29.99, originalPrice: 39.99, rating: 4.5, reviews: 123, stock: 50, images: [getProductImage(`${category} Product 1`, category)], category, brand: `${category}Brand`, isBestSeller: true },
      { _id: `${index + 2}`, name: `${category} Product 2`, price: 49.99, originalPrice: 59.99, rating: 4.3, reviews: 89, stock: 30, images: [getProductImage(`${category} Product 2`, category)], category, brand: `${category}Brand`, isBestSeller: true },
      { _id: `${index + 3}`, name: `${category} Product 3`, price: 79.99, originalPrice: 99.99, rating: 4.7, reviews: 156, stock: 25, images: [getProductImage(`${category} Product 3`, category)], category, brand: `${category}Brand`, isBestSeller: true },
      { _id: `${index + 4}`, name: `${category} Product 4`, price: 19.99, originalPrice: 24.99, rating: 4.2, reviews: 67, stock: 100, images: [getProductImage(`${category} Product 4`, category)], category, brand: `${category}Brand`, isBestSeller: true },
    ]
  }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleAddToCart = async (product: DummyProduct) => {
    try {
      // Convert DummyProduct to Product for API
      const productForAPI = {
        id: product._id,
        title: product.name,
        description: product.name, // Use name as description for dummy data
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        category: product.category,
        brand: product.brand || 'Unknown',
        sku: product._id,
        stock: product.stock,
        tags: [product.category],
        specifications: [],
        variants: [],
        sellerId: {
          id: 'dummy-seller',
          name: 'Dummy Store',
          shopName: 'Dummy Store',
          location: 'Unknown',
          SQL_level: 'Free',
          verified: false
        },
        SQL_level: 'Free',
        status: 'approved',
        isActive: true,
        views: 0,
        sales: 0,
        rating: {
          average: product.rating,
          count: product.reviews
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await addToCart(productForAPI, 1);
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
    <div className="min-h-screen bg-gray-100">
      {/* GoSeller Header */}
      <header className="bg-black text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-white rounded-lg p-1">
                <img 
                  src="/images/GoSellrLogo.png" 
                  alt="GoSellr Logo" 
                  className="h-8 w-auto"
                />
              </div>
              {/* <span className="text-xl font-bold">GoSellr</span> */}
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search GoSeller"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </form>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* Cart Icon - Always visible */}
              <Link href="/cart" className="relative text-white hover:text-gray-300 transition-colors">
                    <FiShoppingCart className="w-6 h-6" />
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {getCartItemCount()}
                      </span>
                    )}
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="text-white hover:text-gray-300 transition-colors">
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-medium">
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
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:text-gray-300 hover:bg-gray-800"
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
              className="md:hidden border-t border-gray-700"
            >
              <div className="px-4 py-6 space-y-4">
                {/* Cart - Always visible */}
                <Link href="/cart" className="block text-white hover:text-gray-300">
                  Cart ({getCartItemCount()})
                </Link>
                
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="block text-white hover:text-gray-300">
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="block w-full text-left text-white hover:text-gray-300"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setShowRegisterModal(true)}
                      className="block w-full text-left text-white hover:text-gray-300"
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
      <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-8">
              {/* Show first 4 categories */}
              {gosellerCategories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-white font-bold hover:text-orange-300 hover:bg-gray-700"
                >
                  <span className="text-sm">{category.name}</span>
                </Link>
              ))}
              
              {/* All Categories Button */}
              <div className="relative">
                <button
                  onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-white font-bold hover:text-orange-300 hover:bg-gray-700"
                >
                  <FiMenu className="w-4 h-4" />
                  <span className="text-sm">All</span>
                </button>
                
                {/* Dropdown for remaining categories */}
                <AnimatePresence>
                  {showCategoriesDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
                      ref={dropdownRef}
                    >
                      <div className="py-2">
                        {gosellerCategories.slice(4).map((category) => (
                      <Link
                            key={category.id}
                            href={`/category/${category.slug}`}
                            className="block px-4 py-2 text-white font-bold hover:text-orange-300 hover:bg-gray-700 transition-colors"
                            onClick={() => setShowCategoriesDropdown(false)}
                          >
                            <span className="text-sm">{category.name}</span>
                      </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                  </div>
                </div>
            
            {/* Sell Button */}
            <Link
              href="/seller-dashboard"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-bold text-sm"
            >
              Sell
            </Link>
              </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Carousel */}
        <div className="relative mb-8 -mx-8 -mt-8" style={{ marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
          <div className="relative h-96 bg-yellow-400 overflow-hidden">
            {/* Carousel Images */}
            <div className="absolute inset-0">
              <div className="flex h-full transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentCarouselSlide * 100}%)` }}>
                {carouselImages.map((image) => (
                  <div key={image.id} className="flex-shrink-0 w-full h-full relative">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                    
                    {/* Image Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h1 className="text-4xl font-bold mb-4">{image.title}</h1>
                        <p className="text-xl mb-6">{image.subtitle}</p>
                        <Link href="/products" className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors inline-block">
                          Shop Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Carousel Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselImages.map((_, index) => (
              <button
                key={index}
                  onClick={() => setCurrentCarouselSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentCarouselSlide === index 
                      ? 'bg-white opacity-100' 
                      : 'bg-white opacity-50 hover:opacity-75'
                }`}
              />
            ))}
          </div>
            
            {/* Carousel Arrow Navigation */}
            <button
              onClick={() => setCurrentCarouselSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <FiChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <button
              onClick={() => setCurrentCarouselSlide((prev) => (prev + 1) % carouselImages.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
        </div>
        </div>

        {/* Content Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 -mt-24 relative z-10">
          {/* Block 1: Gaming */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Get your game on</h3>
            <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-inner flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop&crop=center"
                alt="Gaming Setup"
                className="w-full h-full object-cover"
              />
          </div>
                    </div>

          {/* Block 2: Home Essentials */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Shop for your home essentials</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-100 rounded-lg p-3 text-center">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&h=100&fit=crop&crop=center"
                  alt="Cleaning Tools"
                  className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium text-gray-700">Cleaning Tools</p>
                  </div>
              <div className="bg-green-100 rounded-lg p-3 text-center">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=100&fit=crop&crop=center"
                  alt="Home Storage"
                  className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium text-gray-700">Home Storage</p>
              </div>
            </div>
          </div>

          {/* Block 3: Fashion Trends */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Fashion trends you like</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-pink-100 rounded-lg p-3 text-center">
                <img
                  src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=150&h=100&fit=crop&crop=center"
                  alt="Dresses"
                  className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium text-gray-700">Dresses</p>
              </div>
              <div className="bg-orange-100 rounded-lg p-3 text-center">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150&h=100&fit=crop&crop=center"
                  alt="Knits"
                  className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium text-gray-700">Knits</p>
              </div>
            </div>
          </div>

          {/* Block 4: School Essentials */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Save big on school essentials</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-100 rounded-lg p-3 text-center">
                <img
                  src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=100&fit=crop&crop=center"
                  alt="Backpacks"
                  className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium text-gray-700">Backpacks</p>
              </div>
              <div className="bg-purple-100 rounded-lg p-3 text-center">
                <img
                  src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=150&h=100&fit=crop&crop=center"
                  alt="Electronics"
                  className="w-12 h-12 rounded-lg mx-auto mb-2 object-cover"
                />
                <p className="text-sm font-medium text-gray-700">Electronics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Amazon-style Deals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Deals</h2>
            <Link href="/deals" className="text-orange-600 hover:text-orange-700 font-medium">
              See all deals
                </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center",
                title: "Premium Wireless Headphones",
                price: "$29.99",
                originalPrice: "$99.99",
                discount: "70% off"
              },
              {
                id: 2,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&crop=center",
                title: "Smart Watch Series 5",
                price: "$149.99",
                originalPrice: "$299.99",
                discount: "50% off"
              },
              {
                id: 3,
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop&crop=center",
                title: "Running Shoes Pro",
                price: "$59.99",
                originalPrice: "$129.99",
                discount: "54% off"
              },
              {
                id: 4,
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
                title: "Laptop Stand Premium",
                price: "$24.99",
                originalPrice: "$49.99",
                discount: "50% off"
              }
            ].map((deal: any) => (
              <div key={deal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {deal.discount}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-lg font-bold text-gray-900">{deal.price}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">{deal.originalPrice}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{deal.title}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>Deal ends in 2h 15m</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

        {/* Amazon-style Featured Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured for you</h2>
            <Link href="/featured" className="text-orange-700 font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=250&fit=crop&crop=center",
                title: "Premium Smart Watch",
                price: "$199.99",
                rating: 4,
                reviews: 1247
              },
              {
                id: 2,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=250&fit=crop&crop=center",
                title: "Wireless Bluetooth Headphones",
                price: "$89.99",
                rating: 5,
                reviews: 892
              },
              {
                id: 3,
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=250&fit=crop&crop=center",
                title: "Professional Running Shoes",
                price: "$129.99",
                rating: 4,
                reviews: 567
              }
            ].map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${
                            i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                  </div>
                    <span className="text-sm text-gray-600 ml-1">({item.reviews})</span>
                </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{item.price}</span>
                    <button className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                  </div>
                </div>
            ))}
          </div>
        </section>

        {/* Amazon-style Prime Section */}
        <section className="mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">GoSeller Prime</h2>
            <p className="text-xl mb-6">Free fast delivery, exclusive deals, and more</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Try Prime
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
          </div>
        </div>
      </section>

        {/* Amazon-style Recently Viewed */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently viewed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 1,
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=200&fit=crop&crop=center",
                title: "Wireless Earbuds",
                price: "$49.99"
              },
              {
                id: 2,
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop&crop=center",
                title: "Smart Watch",
                price: "$199.99"
              },
              {
                id: 3,
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop&crop=center",
                title: "Running Shoes",
                price: "$89.99"
              },
              {
                id: 4,
                image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center",
                title: "Laptop Stand",
                price: "$29.99"
              }
            ].map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-32 object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{item.price}</span>
                    <button className="text-orange-600 text-sm hover:text-orange-700">
                      Add to Cart
                    </button>
          </div>
                </div>
              </div>
            ))}
        </div>
      </section>

        {/* Best Sellers by Category */}
        <div className="space-y-12">
          {gosellerCategories.map((category) => (
            <section key={category.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category.name} Best Sellers</h2>
                  <p className="text-gray-600">Top products in {category.name.toLowerCase()}</p>
          </div>
                <Link
                  href={`/category/${category.slug}`}
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
                        src={product.images[0] || getProductImage(product.name, product.category)}
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
                    <button
                      onClick={() => handleAddToCart(product)}
                          className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-orange-600 transition-colors"
                    >
                      Add to Cart
                    </button>
                      </div>
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
