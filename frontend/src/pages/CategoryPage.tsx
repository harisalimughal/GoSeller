"use client"
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiHeart, FiStar, FiGrid, FiList, FiShoppingCart
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { productsAPI, Product } from '../services/api';
import { CATEGORY_SLUG_MAPPING, CATEGORY_DESCRIPTIONS } from '../config/categories';

const CategoryPage: React.FC = () => {
  const params = useParams();
const slug = params?.slug as string;
const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const { addToCart } = useCart();

  // Use shared category mapping
  const categoryMapping = CATEGORY_SLUG_MAPPING;

  const fetchProducts = async () => {
    if (!slug || !categoryMapping[slug as keyof typeof categoryMapping]) {
      setError('Category not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const category = categoryMapping[slug as keyof typeof categoryMapping];
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        category: category,
        sortBy: sortBy,
        sortOrder: 'desc'
      };

      if (priceRange[1] < 1000) {
        params.maxPrice = priceRange[1];
      }

      const response = await productsAPI.getAll(params);
      console.log('CategoryPage - API Response:', response);
      
      if (response && response.products) {
        console.log('CategoryPage - Products:', response.products);
        setProducts(response.products);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setProducts([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [slug, pagination.page, sortBy, priceRange]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      // You could show a toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleProductClick = (product: Product) => {
    console.log('CategoryPage - Product clicked:', product);
    console.log('CategoryPage - Product ID:', product.id);
            router.push(`/product/${product.id}`);
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

  if (!slug || !categoryMapping[slug as keyof typeof categoryMapping]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const categoryName = categoryMapping[slug as keyof typeof categoryMapping];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryName}</h1>
          <p className="text-gray-600">{CATEGORY_DESCRIPTIONS[categoryName as keyof typeof CATEGORY_DESCRIPTIONS]}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Brands</h4>
                <div className="space-y-2">
                  {Array.from(new Set(products.map(p => p.brand))).map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand || '')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrands([...selectedBrands, brand || '']);
                          } else {
                            setSelectedBrands(selectedBrands.filter(b => b !== brand));
                          }
                        }}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-600'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-600'}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{pagination.total} products</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="rating.average">Highest Rated</option>
                  <option value="sales">Best Selling</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48' : ''}`}>
                      <img
                        src={product.images[0] || '/placeholder-product.jpg'}
                        alt={product.title}
                        className={`object-cover rounded-t-lg cursor-pointer ${viewMode === 'list' ? 'rounded-l-lg rounded-t-none' : ''}`}
                        style={{ height: viewMode === 'list' ? '100%' : '200px' }}
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
                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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
                                i < Math.floor(product.rating?.average || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600 ml-1">
                          ({product.rating?.count || 0})
                        </span>
                      </div>

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
                        <span className="text-xs text-green-600 font-medium">
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center"
                      >
                        <FiShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiShoppingCart className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  No products available in this category yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 