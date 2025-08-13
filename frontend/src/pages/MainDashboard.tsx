"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiHeart, FiStar, FiChevronRight, FiFilter, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productsAPI, Product } from '../services/api';
import { CATEGORIES } from '../config/categories';

const MainDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams?.get('category') || '',
    minPrice: searchParams?.get('minPrice') || '',
    maxPrice: searchParams?.get('maxPrice') || '',
    sortBy: searchParams?.get('sortBy') || 'createdAt',
    sortOrder: searchParams?.get('sortOrder') || 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const { user, isAuthenticated } = useAuth();
  const { addToCart, getCartItemCount } = useCart();
  const router = useRouter();

  const categories = CATEGORIES;

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'rating.average', label: 'Highest Rated' },
    { value: 'sales', label: 'Best Selling' }
  ];

  useEffect(() => {
    // Only fetch products if pagination is properly initialized
    if (pagination && typeof pagination.page === 'number') {
      fetchProducts();
    }
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };

      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      const response = await productsAPI.getAll(params);
      console.log('MainDashboard - API Response:', response);
      
      // Add proper error handling and default values
      if (response && response.products) {
        console.log('MainDashboard - Products:', response.products);
        setProducts(response.products);
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          // Set default pagination if response doesn't include it
          setPagination({
            page: 1,
            limit: 12,
            total: response.products.length,
            pages: 1
          });
        }
      } else {
        // Handle case where API returns unexpected format
        setProducts([]);
        setPagination({
          page: 1,
          limit: 12,
          total: 0,
          pages: 0
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
      // Set default values on error
      setProducts([]);
      setPagination({
        page: 1,
        limit: 12,
        total: 0,
        pages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleProductClick = (product: Product) => {
    console.log('MainDashboard - Product clicked:', product);
    console.log('MainDashboard - Product ID:', product.id);
    router.push(`/product/${product.id}`);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GoSeller</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <Link href="/cart" className="flex items-center space-x-2">
                <FiShoppingCart className="w-6 h-6" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-900">{user?.firstName}</span>
                </div>
              ) : (
                                 <Link
                   href="/login"
                   className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                 >
                   Sign In
                 </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Discover Products</h1>
            <p className="text-gray-600 mt-2">
              {pagination?.total || 0} products available from verified sellers
            </p>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-lg shadow-md p-6 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={`${filters.sortBy}${filters.sortOrder === 'desc' ? '' : '-asc'}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.includes('-asc') 
                        ? [e.target.value.replace('-asc', ''), 'asc']
                        : [e.target.value, 'desc'];
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                >
                  <div className="relative">
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.title}
                      className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    />
                    {product.originalPrice && product.price < product.originalPrice && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                      </span>
                    )}
                    <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                      <FiHeart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 
                      className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm cursor-pointer hover:text-orange-600 transition-colors"
                      onClick={() => handleProductClick(product)}
                    >
                      {product.title}
                    </h3>
                    
                    {/* Store Info */}
                    <div className="flex items-center mb-2">
                      <span className="text-xs text-gray-500">
                        by {product.sellerId?.shopName || product.sellerId?.name || 'Unknown Store'}
                      </span>
                      {product.sellerId?.verified && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating?.average || 0) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-1">
                        ({product.rating?.count || 0})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && product.price < product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice.toFixed(2)}
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

                    {/* Stock Status */}
                    <div className="text-xs text-gray-500">
                      {product.stock > 0 ? (
                        <span className="text-green-600">In Stock ({product.stock} available)</span>
                      ) : (
                        <span className="text-red-600">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                                     <button
                     onClick={() => handlePageChange((pagination?.page || 1) - 1)}
                     disabled={(pagination?.page || 1) === 1}
                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                   >
                     Previous
                   </button>
                  
                                     {[...Array(pagination?.pages || 0)].map((_, index) => {
                     const page = index + 1;
                     const isCurrent = page === (pagination?.page || 1);
                     const isNearCurrent = Math.abs(page - (pagination?.page || 1)) <= 2;
                    
                                         if (isCurrent || isNearCurrent || page === 1 || page === (pagination?.pages || 0)) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg text-sm ${
                            isCurrent
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                                         } else if (page === (pagination?.page || 1) - 3 || page === (pagination?.page || 1) + 3) {
                      return <span key={page} className="px-2 text-gray-500">...</span>;
                    }
                    return null;
                  })}
                  
                                     <button
                     onClick={() => handlePageChange((pagination?.page || 1) + 1)}
                     disabled={(pagination?.page || 1) === (pagination?.pages || 0)}
                     className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                   >
                     Next
                   </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiSearch className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainDashboard; 