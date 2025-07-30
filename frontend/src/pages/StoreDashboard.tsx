import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  FiFilter,
  FiSearch
} from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  sales: number;
  rating: number;
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock data - in real app this would come from API
  const [storeStats] = useState<StoreStats>({
    totalProducts: 12,
    totalSales: 15420,
    totalOrders: 89,
    totalCustomers: 67,
    monthlyRevenue: 3240,
    growthRate: 15.4
  });

  const [sqlVerification] = useState<SQLVerification>({
    pssStatus: 'pending',
    edrStatus: 'pending',
    emoStatus: 'pending',
    currentLevel: 'Free',
    nextLevel: 'Basic',
    productLimit: 3,
    currentProducts: 12
  });

  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 89.99,
      stock: 25,
      category: 'Electronics',
      image: '/api/placeholder/150/150',
      status: 'active',
      createdAt: '2024-01-15',
      sales: 12,
      rating: 4.5
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      description: 'Comfortable organic cotton t-shirt in various colors',
      price: 24.99,
      stock: 50,
      category: 'Fashion',
      image: '/api/placeholder/150/150',
      status: 'active',
      createdAt: '2024-01-10',
      sales: 8,
      rating: 4.2
    },
    {
      id: '3',
      name: 'Smartphone Case',
      description: 'Durable protective case for smartphones',
      price: 15.99,
      stock: 30,
      category: 'Electronics',
      image: '/api/placeholder/150/150',
      status: 'active',
      createdAt: '2024-01-08',
      sales: 15,
      rating: 4.7
    }
  ]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GoSeller</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/seller-dashboard" className="text-gray-600 hover:text-gray-900">Seller Dashboard</Link>
              <Link to="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Store Dashboard</h1>
              <p className="text-gray-600">Manage your products, track sales, and grow your business</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/add-product" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                <FiPlus className="mr-2" />
                Add Product
              </Link>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <FiSettings className="mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* SQL Quality Level Alert */}
        {sqlVerification.currentLevel === 'Free' && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <FiShield className="w-5 h-5 text-orange-500 mr-3" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">Upgrade Your SQL Quality Level</h3>
                <p className="text-orange-700 text-sm">
                  You're currently at <strong>Free</strong> level with a limit of {sqlVerification.productLimit} products. 
                  You have {sqlVerification.currentProducts} products listed. 
                  <Link to="/verification" className="text-orange-600 font-medium ml-1 hover:underline">
                    Upgrade to {sqlVerification.nextLevel} level
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{storeStats.totalProducts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">${storeStats.totalSales.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{storeStats.totalOrders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{storeStats.totalCustomers}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* SQL Verification Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">SQL Quality Verification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">PSS Verification</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(sqlVerification.pssStatus)}`}>
                  {getStatusIcon(sqlVerification.pssStatus)}
                  <span className="ml-1 capitalize">{sqlVerification.pssStatus}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">Personal Security System verification for ID and documents</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">EDR Verification</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(sqlVerification.edrStatus)}`}>
                  {getStatusIcon(sqlVerification.edrStatus)}
                  <span className="ml-1 capitalize">{sqlVerification.edrStatus}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">Exam Decision Registration for practical skills testing</p>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">EMO Verification</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(sqlVerification.emoStatus)}`}>
                  {getStatusIcon(sqlVerification.emoStatus)}
                  <span className="ml-1 capitalize">{sqlVerification.emoStatus}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">Easy Management Office for physical inspection</p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Link
              to="/verification"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
            >
              <FiShield className="mr-2" />
              Start Verification Process
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: FiBarChart },
                { id: 'products', name: 'Products', icon: FiPackage },
                { id: 'orders', name: 'Orders', icon: FiShoppingCart },
                { id: 'analytics', name: 'Analytics', icon: FiTrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Sales */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
                    <div className="space-y-4">
                      {products.slice(0, 3).map((product) => (
                        <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">${product.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{product.sales} sold</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                              {product.rating}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <button className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                        <FiPlus className="w-5 h-5 text-orange-600 mr-3" />
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Add New Product</h4>
                          <p className="text-sm text-gray-600">List a new product in your store</p>
                        </div>
                      </button>
                      
                      <button className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                        <FiUpload className="w-5 h-5 text-blue-600 mr-3" />
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Bulk Import</h4>
                          <p className="text-sm text-gray-600">Import multiple products at once</p>
                        </div>
                      </button>
                      
                      <button className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                        <FiDownload className="w-5 h-5 text-green-600 mr-3" />
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Export Data</h4>
                          <p className="text-sm text-gray-600">Download your sales reports</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div>
                {/* Products Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                    <p className="text-sm text-gray-600">Manage your product inventory</p>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category}
                        </option>
                      ))}
                    </select>
                    
                    <Link to="/add-product" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                      <FiPlus className="mr-2" />
                      Add Product
                    </Link>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 truncate">{product.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-gray-900">${product.price}</span>
                          <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <span>Sales: {product.sales}</span>
                          <div className="flex items-center">
                            <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                            {product.rating}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center">
                            <FiEye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center">
                            <FiEdit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center">
                            <FiTrash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search or add your first product</p>
                    <Link to="/add-product" className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                      Add Your First Product
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FiShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Orders will appear here</h3>
                  <p className="text-gray-600">When customers place orders, they'll show up in this section</p>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Analytics</h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                  <p className="text-gray-600">Detailed analytics and insights will be available here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDashboard; 