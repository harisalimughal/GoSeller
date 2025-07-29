import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiHeart, FiStar, FiFilter, FiGrid, FiList,
  FiChevronDown, FiChevronUp, FiMapPin, FiTruck, FiShield
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Product } from '../services/api';

interface CategoryPageProps {}

const CategoryPage: React.FC<CategoryPageProps> = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { isAuthenticated } = useAuth();
  const { addToCart, getCartItemCount } = useCart();

  // Category data mapping
  const categoryData = {
    'electronics': {
      name: 'Electronics',
      icon: '📱',
      description: 'Latest gadgets and electronic devices',
      products: [
        { _id: '1', name: 'Wireless Bluetooth Headphones', price: 89.99, originalPrice: 129.99, rating: 4.5, reviews: 1247, stock: 50, images: ['https://via.placeholder.com/300x200?text=Headphones'], category: 'Electronics', brand: 'TechPro' },
        { _id: '2', name: 'Smartphone 128GB', price: 599.99, originalPrice: 699.99, rating: 4.8, reviews: 892, stock: 25, images: ['https://via.placeholder.com/300x200?text=Smartphone'], category: 'Electronics', brand: 'PhoneMax' },
        { _id: '3', name: '4K Smart TV 55"', price: 449.99, originalPrice: 599.99, rating: 4.6, reviews: 567, stock: 15, images: ['https://via.placeholder.com/300x200?text=TV'], category: 'Electronics', brand: 'ViewTech' },
        { _id: '4', name: 'Laptop 15.6" 8GB RAM', price: 799.99, originalPrice: 999.99, rating: 4.7, reviews: 423, stock: 30, images: ['https://via.placeholder.com/300x200?text=Laptop'], category: 'Electronics', brand: 'CompTech' },
        { _id: '5', name: 'Wireless Mouse', price: 29.99, originalPrice: 39.99, rating: 4.4, reviews: 234, stock: 100, images: ['https://via.placeholder.com/300x200?text=Mouse'], category: 'Electronics', brand: 'TechPro' },
        { _id: '6', name: 'Bluetooth Speaker', price: 79.99, originalPrice: 99.99, rating: 4.6, reviews: 189, stock: 60, images: ['https://via.placeholder.com/300x200?text=Speaker'], category: 'Electronics', brand: 'SoundMax' },
        { _id: '7', name: 'Tablet 10" 64GB', price: 299.99, originalPrice: 399.99, rating: 4.5, reviews: 156, stock: 40, images: ['https://via.placeholder.com/300x200?text=Tablet'], category: 'Electronics', brand: 'TabTech' },
        { _id: '8', name: 'Gaming Headset', price: 69.99, originalPrice: 89.99, rating: 4.7, reviews: 298, stock: 75, images: ['https://via.placeholder.com/300x200?text=Headset'], category: 'Electronics', brand: 'GamePro' },
      ]
    },
    'fashion': {
      name: 'Fashion',
      icon: '👕',
      description: 'Trendy clothing and accessories',
      products: [
        { _id: '9', name: 'Men\'s Casual T-Shirt', price: 24.99, originalPrice: 34.99, rating: 4.3, reviews: 156, stock: 100, images: ['https://via.placeholder.com/300x200?text=T-Shirt'], category: 'Fashion', brand: 'StyleWear' },
        { _id: '10', name: 'Women\'s Summer Dress', price: 49.99, originalPrice: 69.99, rating: 4.4, reviews: 234, stock: 75, images: ['https://via.placeholder.com/300x200?text=Dress'], category: 'Fashion', brand: 'Fashionista' },
        { _id: '11', name: 'Running Shoes', price: 79.99, originalPrice: 99.99, rating: 4.6, reviews: 189, stock: 60, images: ['https://via.placeholder.com/300x200?text=Shoes'], category: 'Fashion', brand: 'SportFlex' },
        { _id: '12', name: 'Denim Jeans', price: 59.99, originalPrice: 79.99, rating: 4.2, reviews: 98, stock: 80, images: ['https://via.placeholder.com/300x200?text=Jeans'], category: 'Fashion', brand: 'DenimCo' },
        { _id: '13', name: 'Leather Jacket', price: 149.99, originalPrice: 199.99, rating: 4.5, reviews: 123, stock: 45, images: ['https://via.placeholder.com/300x200?text=Jacket'], category: 'Fashion', brand: 'LeatherPro' },
        { _id: '14', name: 'Sneakers Casual', price: 89.99, originalPrice: 119.99, rating: 4.4, reviews: 167, stock: 70, images: ['https://via.placeholder.com/300x200?text=Sneakers'], category: 'Fashion', brand: 'FootWear' },
        { _id: '15', name: 'Handbag Designer', price: 129.99, originalPrice: 159.99, rating: 4.6, reviews: 89, stock: 35, images: ['https://via.placeholder.com/300x200?text=Handbag'], category: 'Fashion', brand: 'LuxuryBag' },
        { _id: '16', name: 'Sunglasses Premium', price: 39.99, originalPrice: 59.99, rating: 4.3, reviews: 145, stock: 90, images: ['https://via.placeholder.com/300x200?text=Sunglasses'], category: 'Fashion', brand: 'EyeStyle' },
      ]
    },
    'home-kitchen': {
      name: 'Home & Kitchen',
      icon: '🏠',
      description: 'Everything for your home and kitchen',
      products: [
        { _id: '17', name: 'Coffee Maker', price: 89.99, originalPrice: 119.99, rating: 4.5, reviews: 312, stock: 40, images: ['https://via.placeholder.com/300x200?text=Coffee+Maker'], category: 'Home & Kitchen', brand: 'BrewMaster' },
        { _id: '18', name: 'Kitchen Knife Set', price: 69.99, originalPrice: 89.99, rating: 4.7, reviews: 156, stock: 55, images: ['https://via.placeholder.com/300x200?text=Knife+Set'], category: 'Home & Kitchen', brand: 'SharpEdge' },
        { _id: '19', name: 'Blender 1000W', price: 49.99, originalPrice: 69.99, rating: 4.3, reviews: 234, stock: 70, images: ['https://via.placeholder.com/300x200?text=Blender'], category: 'Home & Kitchen', brand: 'BlendPro' },
        { _id: '20', name: 'Bedding Set Queen', price: 79.99, originalPrice: 99.99, rating: 4.4, reviews: 189, stock: 45, images: ['https://via.placeholder.com/300x200?text=Bedding'], category: 'Home & Kitchen', brand: 'SleepComfort' },
        { _id: '21', name: 'Toaster 4-Slice', price: 39.99, originalPrice: 49.99, rating: 4.2, reviews: 98, stock: 85, images: ['https://via.placeholder.com/300x200?text=Toaster'], category: 'Home & Kitchen', brand: 'ToastMaster' },
        { _id: '22', name: 'Food Processor', price: 129.99, originalPrice: 159.99, rating: 4.6, reviews: 123, stock: 30, images: ['https://via.placeholder.com/300x200?text=Food+Processor'], category: 'Home & Kitchen', brand: 'KitchenPro' },
        { _id: '23', name: 'Microwave Oven', price: 149.99, originalPrice: 199.99, rating: 4.5, reviews: 167, stock: 25, images: ['https://via.placeholder.com/300x200?text=Microwave'], category: 'Home & Kitchen', brand: 'WaveTech' },
        { _id: '24', name: 'Dishwasher Portable', price: 299.99, originalPrice: 399.99, rating: 4.7, reviews: 89, stock: 15, images: ['https://via.placeholder.com/300x200?text=Dishwasher'], category: 'Home & Kitchen', brand: 'CleanPro' },
      ]
    },
    'sports-outdoors': {
      name: 'Sports & Outdoors',
      icon: '⚽',
      description: 'Sports equipment and outdoor gear',
      products: [
        { _id: '25', name: 'Yoga Mat Premium', price: 29.99, originalPrice: 39.99, rating: 4.6, reviews: 445, stock: 120, images: ['https://via.placeholder.com/300x200?text=Yoga+Mat'], category: 'Sports & Outdoors', brand: 'FitLife' },
        { _id: '26', name: 'Basketball Official Size', price: 24.99, originalPrice: 34.99, rating: 4.5, reviews: 234, stock: 90, images: ['https://via.placeholder.com/300x200?text=Basketball'], category: 'Sports & Outdoors', brand: 'SportBall' },
        { _id: '27', name: 'Tennis Racket Pro', price: 89.99, originalPrice: 119.99, rating: 4.7, reviews: 156, stock: 35, images: ['https://via.placeholder.com/300x200?text=Tennis+Racket'], category: 'Sports & Outdoors', brand: 'RacketPro' },
        { _id: '28', name: 'Camping Tent 4-Person', price: 149.99, originalPrice: 199.99, rating: 4.4, reviews: 98, stock: 25, images: ['https://via.placeholder.com/300x200?text=Tent'], category: 'Sports & Outdoors', brand: 'OutdoorLife' },
        { _id: '29', name: 'Running Shoes Pro', price: 129.99, originalPrice: 159.99, rating: 4.8, reviews: 234, stock: 60, images: ['https://via.placeholder.com/300x200?text=Running+Shoes'], category: 'Sports & Outdoors', brand: 'RunFast' },
        { _id: '30', name: 'Dumbbells Set 20kg', price: 79.99, originalPrice: 99.99, rating: 4.5, reviews: 167, stock: 80, images: ['https://via.placeholder.com/300x200?text=Dumbbells'], category: 'Sports & Outdoors', brand: 'GymPro' },
        { _id: '31', name: 'Bicycle Mountain', price: 299.99, originalPrice: 399.99, rating: 4.6, reviews: 123, stock: 20, images: ['https://via.placeholder.com/300x200?text=Bicycle'], category: 'Sports & Outdoors', brand: 'BikeMaster' },
        { _id: '32', name: 'Swimming Goggles', price: 19.99, originalPrice: 29.99, rating: 4.3, reviews: 89, stock: 150, images: ['https://via.placeholder.com/300x200?text=Goggles'], category: 'Sports & Outdoors', brand: 'SwimPro' },
      ]
    },
    'books': {
      name: 'Books',
      icon: '📚',
      description: 'Books and educational materials',
      products: [
        { _id: '33', name: 'The Great Gatsby', price: 12.99, originalPrice: 16.99, rating: 4.8, reviews: 1234, stock: 200, images: ['https://via.placeholder.com/300x200?text=Book'], category: 'Books', brand: 'ClassicBooks' },
        { _id: '34', name: 'Programming Guide 2024', price: 34.99, originalPrice: 44.99, rating: 4.6, reviews: 567, stock: 150, images: ['https://via.placeholder.com/300x200?text=Programming+Book'], category: 'Books', brand: 'TechBooks' },
        { _id: '35', name: 'Cookbook Collection', price: 24.99, originalPrice: 29.99, rating: 4.5, reviews: 345, stock: 100, images: ['https://via.placeholder.com/300x200?text=Cookbook'], category: 'Books', brand: 'CookingPro' },
        { _id: '36', name: 'Children\'s Story Book', price: 9.99, originalPrice: 14.99, rating: 4.7, reviews: 234, stock: 300, images: ['https://via.placeholder.com/300x200?text=Children+Book'], category: 'Books', brand: 'KidsRead' },
        { _id: '37', name: 'Business Strategy Guide', price: 19.99, originalPrice: 24.99, rating: 4.4, reviews: 189, stock: 120, images: ['https://via.placeholder.com/300x200?text=Business+Book'], category: 'Books', brand: 'BusinessPro' },
        { _id: '38', name: 'Science Fiction Novel', price: 14.99, originalPrice: 19.99, rating: 4.6, reviews: 278, stock: 180, images: ['https://via.placeholder.com/300x200?text=Science+Fiction'], category: 'Books', brand: 'SciFiBooks' },
        { _id: '39', name: 'Self-Help Guide', price: 16.99, originalPrice: 21.99, rating: 4.5, reviews: 156, stock: 90, images: ['https://via.placeholder.com/300x200?text=Self+Help'], category: 'Books', brand: 'LifeGuide' },
        { _id: '40', name: 'Art History Textbook', price: 49.99, originalPrice: 59.99, rating: 4.7, reviews: 98, stock: 75, images: ['https://via.placeholder.com/300x200?text=Art+Book'], category: 'Books', brand: 'ArtBooks' },
      ]
    },
    'toys-games': {
      name: 'Toys & Games',
      icon: '🎮',
      description: 'Fun toys and games for all ages',
      products: [
        { _id: '41', name: 'Board Game Strategy', price: 39.99, originalPrice: 49.99, rating: 4.6, reviews: 234, stock: 75, images: ['https://via.placeholder.com/300x200?text=Board+Game'], category: 'Toys & Games', brand: 'GameMaster' },
        { _id: '42', name: 'LEGO Building Set', price: 59.99, originalPrice: 79.99, rating: 4.8, reviews: 456, stock: 60, images: ['https://via.placeholder.com/300x200?text=LEGO'], category: 'Toys & Games', brand: 'LEGO' },
        { _id: '43', name: 'Remote Control Car', price: 29.99, originalPrice: 39.99, rating: 4.4, reviews: 189, stock: 90, images: ['https://via.placeholder.com/300x200?text=RC+Car'], category: 'Toys & Games', brand: 'RCPro' },
        { _id: '44', name: 'Puzzle 1000 Pieces', price: 19.99, originalPrice: 24.99, rating: 4.5, reviews: 123, stock: 120, images: ['https://via.placeholder.com/300x200?text=Puzzle'], category: 'Toys & Games', brand: 'PuzzleMaster' },
        { _id: '45', name: 'Video Game Console', price: 299.99, originalPrice: 399.99, rating: 4.7, reviews: 567, stock: 30, images: ['https://via.placeholder.com/300x200?text=Game+Console'], category: 'Toys & Games', brand: 'GameTech' },
        { _id: '46', name: 'Doll House Complete', price: 89.99, originalPrice: 119.99, rating: 4.5, reviews: 234, stock: 45, images: ['https://via.placeholder.com/300x200?text=Doll+House'], category: 'Toys & Games', brand: 'DollWorld' },
        { _id: '47', name: 'Science Kit Kids', price: 34.99, originalPrice: 44.99, rating: 4.6, reviews: 167, stock: 80, images: ['https://via.placeholder.com/300x200?text=Science+Kit'], category: 'Toys & Games', brand: 'ScienceFun' },
        { _id: '48', name: 'Art Supplies Set', price: 24.99, originalPrice: 34.99, rating: 4.4, reviews: 98, stock: 150, images: ['https://via.placeholder.com/300x200?text=Art+Supplies'], category: 'Toys & Games', brand: 'ArtCraft' },
      ]
    }
  };

  useEffect(() => {
    if (slug && categoryData[slug as keyof typeof categoryData]) {
      setProducts(categoryData[slug as keyof typeof categoryData].products);
      setIsLoading(false);
    }
  }, [slug]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product, 1);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    let sortedProducts = [...products];
    
    switch (sortType) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b._id).getTime() - new Date(a._id).getTime());
        break;
      default:
        // Featured - keep original order
        break;
    }
    
    setProducts(sortedProducts);
  };

  const filteredProducts = products.filter(product => {
    const priceInRange = product.price >= priceRange.min && product.price <= priceRange.max;
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand || '');
    return priceInRange && brandMatch;
  });

  const availableBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  if (!slug || !categoryData[slug as keyof typeof categoryData]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <Link to="/" className="text-orange-600 hover:text-orange-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const category = categoryData[slug as keyof typeof categoryData];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold">GoSeller</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link to="/cart" className="relative text-white hover:text-orange-200 transition-colors">
                <FiShoppingCart className="w-6 h-6" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Category Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  {showFilters ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
                </button>
              </div>
              
              <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
                {/* Sort By */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Customer Rating</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>${priceRange.min}</span>
                      <span>${priceRange.max}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                  <div className="space-y-2">
                    {availableBrands.map((brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand]);
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
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  {filteredProducts.length} products
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
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
                        className={`object-cover rounded-t-lg ${viewMode === 'list' ? 'h-full rounded-l-lg rounded-t-none' : 'w-full h-48'}`}
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
            )}

            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage; 