"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiStar,
  FiBarChart,
  FiSettings,
  FiUpload,
  FiDownload,
  FiSearch,
  FiLogOut
} from 'react-icons/fi';
import { productsAPI, sellerAuthAPI, sellerRegistrationAPI } from '../services/api';

interface Product {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  status: string; // Changed to match API interface
  createdAt: string;
  sales: number;
  rating: {
    average: number;
    count: number;
  };
  SQL_level: string;
  isActive: boolean;
}

interface StoreStats {
  totalProducts: number;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  monthlyRevenue: number;
  growthRate: number;
}

interface SQLVerification {
  pssStatus: 'pending' | 'verified' | 'rejected';
  edrStatus: 'pending' | 'verified' | 'rejected';
  emoStatus: 'pending' | 'verified' | 'rejected';
  currentLevel: 'Free' | 'Basic' | 'Normal' | 'High' | 'VIP';
  nextLevel: 'Basic' | 'Normal' | 'High' | 'VIP';
  productLimit: number;
  currentProducts: number;
}

const StoreDashboard: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  // New state for product actions
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Seller profile state
  const [sellerProfile, setSellerProfile] = useState<{
    businessName: string;
    sellerCategory: string;
    name: string;
  } | null>(null);

  // Utility function to get product ID consistently
  const getProductId = (product: Product): string => {
    return product._id || (product as any).id || '';
  };

  // Function to decode JWT token and extract sellerId
  const getSellerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('sellerToken');
      if (!token) return null;
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sellerId || payload.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Load seller profile
  const loadSellerProfile = async () => {
    try {
      const token = localStorage.getItem('sellerToken');
      if (!token) return;

      const response = await sellerAuthAPI.getProfile();
      if (response && response.seller) {
        setSellerProfile(response.seller);
      }
    } catch (error) {
      console.error('Error loading seller profile:', error);
    }
  };

  // Load products
  const loadProducts = async () => {
    if (!sellerId) return;
    
    setProductsLoading(true);
    try {
      const response = await productsAPI.getBySeller(sellerId);
      if (response && response.products) {
        setProducts(response.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    const token = localStorage.getItem('sellerToken');
    if (!token) {
      router.push('/seller-login');
      return;
    }

    const id = getSellerIdFromToken();
    if (!id) {
      router.push('/seller-login');
      return;
    }

    setSellerId(id);
    loadSellerProfile();
    loadProducts();
    setIsLoading(false);
  }, [router]);

  // Handle sign out
  const handleSignOut = () => {
    localStorage.removeItem('sellerToken');
    localStorage.removeItem('sellerId');
    localStorage.removeItem('sqlLevel');
    router.push('/seller-login');
  };

  // Product action handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: Product) => {
    if (!sellerId) {
      alert('Authentication required. Please sign in to your seller account first.');
      router.push('/seller-login');
      return;
    }
    
    const productId = getProductId(product);
    if (!productId) {
      alert('Product ID is missing. Please try again.');
      return;
    }
    
    // Navigate to edit product page with product ID
    router.push(`/edit-product/${productId}`);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    setIsDeleting(true);
    try {
      const productId = getProductId(selectedProduct);
      await productsAPI.delete(productId);
      
      // Remove the product from the local state
      setProducts(products.filter(p => {
        const pId = getProductId(p);
        const selectedId = getProductId(selectedProduct);
        return pId !== selectedId;
      }));
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!sellerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiShield className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your seller dashboard</p>
          <Link
            href="/seller-login"
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <FiCheckCircle className="w-4 h-4" />;
      case 'pending': return <FiClock className="w-4 h-4" />;
      case 'rejected': return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GoSeller</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/seller-dashboard" className="text-gray-600 hover:text-gray-900">Seller Dashboard</Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {sellerProfile?.name || 'Seller'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your products, track sales, and grow your business
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/seller/add-product"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/product-management"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <FiPackage className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Product Management</h3>
                <p className="text-sm text-gray-600">Manage products & inventory</p>
              </div>
            </div>
          </Link>

          <Link
            href="/supply-chain-management"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <FiUsers className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Supply Chain</h3>
                <p className="text-sm text-gray-600">Manage network hierarchy</p>
              </div>
            </div>
          </Link>

          {sellerId && (
            <Link
              href={`/seller-hierarchy/${sellerId}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FiTrendingUp className="w-8 h-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Seller Hierarchy</h3>
                  <p className="text-sm text-gray-600">View your network</p>
                </div>
              </div>
            </Link>
          )}

          {sellerId && (
            <Link
              href={`/dealer-hierarchy/${sellerId}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <FiShoppingCart className="w-8 h-8 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">Dealer Network</h3>
                  <p className="text-sm text-gray-600">Manage dealers</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* SQL Verification Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">SQL Verification Status</h2>
            <Link href="/verification" className="text-orange-600 font-medium ml-1 hover:underline">
              View Details
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">PSS</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">EDR</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">EMO</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Products</h2>
            <Link
              href="/verification"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={getProductId(product)} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{product.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">${product.price}</span>
                    <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <FiEdit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FiPackage className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start by adding your first product'
                }
              </p>
              <Link
                href="/seller/add-product"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add Product
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-gray-900">{selectedProduct.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900">{selectedProduct.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <p className="mt-1 text-gray-900">${selectedProduct.price}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <p className="mt-1 text-gray-900">{selectedProduct.stock}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-gray-900">{selectedProduct.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-gray-900">{selectedProduct.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <FiTrash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{selectedProduct.title}"? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDashboard; 