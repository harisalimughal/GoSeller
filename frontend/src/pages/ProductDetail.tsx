"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiShoppingCart, FiHeart, FiStar, FiTruck, 
  FiShield, FiCheck, FiX, FiMinus, FiPlus, FiMapPin 
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { productsAPI, Product } from '../services/api';

const ProductDetail: React.FC = () => {
  const params = useParams();
const productId = params?.productId as string;
const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, getCartItemCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showStoreDetails, setShowStoreDetails] = useState(false);

  useEffect(() => {
    console.log('ProductDetail - productId:', productId);
    if (productId) {
      fetchProduct();
    } else {
      setError('Product ID is missing. Please go back to the dashboard and try again.');
      setLoading(false);
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('ProductDetail - Fetching product with ID:', productId);
      const response = await productsAPI.getById(productId!);
      console.log('ProductDetail - API Response:', response);
      setProduct(response.product);
      
      // If we have images, set the first one as selected
      if (response.product.images && response.product.images.length > 0) {
        setSelectedImage(0);
      }
    } catch (err: any) {
      console.error('ProductDetail - Error fetching product:', err);
      setError(err.message || 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      // You could show a success toast here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };

  const handleBuyNow = () => {
    // Navigate to checkout with this product
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FiX className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Back Home
          </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <FiShoppingCart className="w-6 h-6 text-gray-600" />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </div>
              
              {isAuthenticated && (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-900">{user?.firstName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-w-1 aspect-h-1 w-full">
              <img
                src={product.images[selectedImage] || '/placeholder-product.jpg'}
                alt={product.title}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index 
                        ? 'border-orange-500' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Title and Brand */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-lg text-gray-600">by {product.brand}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating?.average || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-gray-600">
                  {product.rating?.average?.toFixed(1) || '0.0'} ({product.rating?.count || 0} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && product.price < product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-600">
                  <FiCheck className="w-5 h-5 mr-2" />
                  <span>In Stock ({product.stock} available)</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <FiX className="w-5 h-5 mr-2" />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {product.stock > 0 && (
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            )}

            {/* Store Information */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
                <button
                  onClick={() => setShowStoreDetails(!showStoreDetails)}
                  className="text-orange-600 hover:text-orange-700 text-sm"
                >
                  {showStoreDetails ? 'Hide Details' : 'View Details'}
                </button>
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {product.sellerId?.shopName?.charAt(0) || product.sellerId?.name?.charAt(0) || 'S'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {product.sellerId?.shopName || product.sellerId?.name || 'Unknown Store'}
                  </p>
                  <div className="flex items-center space-x-2">
                    {product.sellerId?.verified && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        ✓ Verified Seller
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center">
                      SQL Level: {product.sellerId?.SQL_level || 'Unknown'}
                      {product.sellerId?.SQL_level && product.sellerId.SQL_level !== 'Free' && (
                        <span className="ml-1 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {showStoreDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    {product.sellerId?.location && (
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{product.sellerId.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <FiShield className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Secure transaction guaranteed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiTruck className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Fast shipping available</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="mt-12 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-700">{spec.name}</span>
                      <span className="text-gray-600">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="text-gray-900">{product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{product.category}</span>
                    </div>
                    {product.subcategory && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subcategory:</span>
                        <span className="text-gray-900">{product.subcategory}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span className="text-gray-900">{product.brand}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Physical Details</h3>
                  <div className="space-y-2">
                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="text-gray-900">{product.weight} kg</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="text-gray-900">
                            {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className="text-gray-900">{product.stock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sales:</span>
                      <span className="text-gray-900">{product.sales || 0} sold</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail; 