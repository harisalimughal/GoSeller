import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHeart, FiStar, FiGrid, FiList
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';

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

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<DummyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const { addToCart } = useCart();

  // Dummy category data
  const categoryData = {
    'electronics': {
      name: 'Electronics',
      description: 'Latest gadgets and electronic devices',
      products: [
        { _id: '1', name: 'Wireless Bluetooth Headphones', price: 89.99, originalPrice: 129.99, rating: 4.5, reviews: 1247, stock: 50, images: ['https://via.placeholder.com/300x200?text=Headphones'], category: 'Electronics', brand: 'TechPro' },
        { _id: '2', name: 'Smartphone 128GB', price: 599.99, originalPrice: 699.99, rating: 4.8, reviews: 892, stock: 25, images: ['https://via.placeholder.com/300x200?text=Smartphone'], category: 'Electronics', brand: 'PhoneMax' },
        { _id: '3', name: '4K Smart TV 55"', price: 449.99, originalPrice: 599.99, rating: 4.6, reviews: 567, stock: 15, images: ['https://via.placeholder.com/300x200?text=TV'], category: 'Electronics', brand: 'ViewTech' },
        { _id: '4', name: 'Laptop 15.6" 8GB RAM', price: 799.99, originalPrice: 999.99, rating: 4.7, reviews: 423, stock: 30, images: ['https://via.placeholder.com/300x200?text=Laptop'], category: 'Electronics', brand: 'CompTech' },
        { _id: '5', name: 'Wireless Mouse', price: 24.99, originalPrice: 34.99, rating: 4.3, reviews: 156, stock: 100, images: ['https://via.placeholder.com/300x200?text=Mouse'], category: 'Electronics', brand: 'OfficePro' },
        { _id: '6', name: 'Mechanical Keyboard', price: 129.99, originalPrice: 159.99, rating: 4.6, reviews: 234, stock: 40, images: ['https://via.placeholder.com/300x200?text=Keyboard'], category: 'Electronics', brand: 'KeyPro' },
      ]
    },
    'fashion': {
      name: 'Fashion',
      description: 'Trendy clothing and accessories',
      products: [
        { _id: '7', name: 'Men\'s Casual T-Shirt', price: 24.99, originalPrice: 34.99, rating: 4.3, reviews: 156, stock: 100, images: ['https://via.placeholder.com/300x200?text=T-Shirt'], category: 'Fashion', brand: 'StyleWear' },
        { _id: '8', name: 'Women\'s Summer Dress', price: 49.99, originalPrice: 69.99, rating: 4.4, reviews: 234, stock: 75, images: ['https://via.placeholder.com/300x200?text=Dress'], category: 'Fashion', brand: 'Fashionista' },
        { _id: '9', name: 'Running Shoes', price: 79.99, originalPrice: 99.99, rating: 4.6, reviews: 189, stock: 60, images: ['https://via.placeholder.com/300x200?text=Shoes'], category: 'Fashion', brand: 'SportFlex' },
        { _id: '10', name: 'Denim Jeans', price: 59.99, originalPrice: 79.99, rating: 4.2, reviews: 98, stock: 80, images: ['https://via.placeholder.com/300x200?text=Jeans'], category: 'Fashion', brand: 'DenimCo' },
      ]
    },
    'home-kitchen': {
      name: 'Home & Kitchen',
      description: 'Everything for your home and kitchen',
      products: [
        { _id: '11', name: 'Coffee Maker', price: 89.99, originalPrice: 119.99, rating: 4.5, reviews: 312, stock: 40, images: ['https://via.placeholder.com/300x200?text=Coffee+Maker'], category: 'Home & Kitchen', brand: 'BrewMaster' },
        { _id: '12', name: 'Kitchen Knife Set', price: 69.99, originalPrice: 89.99, rating: 4.7, reviews: 156, stock: 55, images: ['https://via.placeholder.com/300x200?text=Knife+Set'], category: 'Home & Kitchen', brand: 'SharpEdge' },
        { _id: '13', name: 'Blender 1000W', price: 49.99, originalPrice: 69.99, rating: 4.3, reviews: 234, stock: 70, images: ['https://via.placeholder.com/300x200?text=Blender'], category: 'Home & Kitchen', brand: 'BlendPro' },
        { _id: '14', name: 'Bedding Set Queen', price: 79.99, originalPrice: 99.99, rating: 4.4, reviews: 189, stock: 45, images: ['https://via.placeholder.com/300x200?text=Bedding'], category: 'Home & Kitchen', brand: 'SleepComfort' },
      ]
    },
    'sports-outdoors': {
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      products: [
        { _id: '15', name: 'Yoga Mat Premium', price: 29.99, originalPrice: 39.99, rating: 4.6, reviews: 445, stock: 120, images: ['https://via.placeholder.com/300x200?text=Yoga+Mat'], category: 'Sports & Outdoors', brand: 'FitLife' },
        { _id: '16', name: 'Basketball Official Size', price: 24.99, originalPrice: 34.99, rating: 4.5, reviews: 234, stock: 90, images: ['https://via.placeholder.com/300x200?text=Basketball'], category: 'Sports & Outdoors', brand: 'SportBall' },
        { _id: '17', name: 'Tennis Racket Pro', price: 89.99, originalPrice: 119.99, rating: 4.7, reviews: 156, stock: 35, images: ['https://via.placeholder.com/300x200?text=Tennis+Racket'], category: 'Sports & Outdoors', brand: 'RacketPro' },
        { _id: '18', name: 'Camping Tent 4-Person', price: 149.99, originalPrice: 199.99, rating: 4.4, reviews: 98, stock: 25, images: ['https://via.placeholder.com/300x200?text=Tent'], category: 'Sports & Outdoors', brand: 'OutdoorLife' },
      ]
    },
  };

  useEffect(() => {
    if (slug && categoryData[slug as keyof typeof categoryData]) {
      setProducts(categoryData[slug as keyof typeof categoryData].products as DummyProduct[]);
    }
    setLoading(false);
  }, [slug]);

  const handleAddToCart = async (product: DummyProduct) => {
    try {
      // Convert DummyProduct to Product for API
      const productForAPI = {
        _id: product._id,
        name: product.name,
        description: product.name, // Use name as description for dummy data
        price: product.price,
        originalPrice: product.originalPrice,
        images: product.images,
        category: product.category,
        brand: product.brand || 'Unknown',
        sku: product._id,
        stock: product.stock,
        rating: product.rating,
        reviews: product.reviews,
        tags: [product.category],
        specifications: {},
        isActive: true,
        isFeatured: product.isBestSeller || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await addToCart(productForAPI, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
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

  if (!slug || !categoryData[slug as keyof typeof categoryData]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const category = categoryData[slug as keyof typeof categoryData];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-gray-600">{category.description}</p>
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
                <span className="text-sm text-gray-600">{products.length} products</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-48' : ''}`}>
                    <img
                      src={product.images[0] || 'https://via.placeholder.com/300x200?text=Product'}
                      alt={product.name}
                      className={`object-cover rounded-t-lg ${viewMode === 'list' ? 'rounded-l-lg rounded-t-none' : ''}`}
                      style={{ height: viewMode === 'list' ? '100%' : '200px' }}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 