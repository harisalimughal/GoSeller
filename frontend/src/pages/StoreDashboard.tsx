import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  status: 'pending' | 'approved' | 'rejected' | 'draft';
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
  const location = useLocation();
  const navigate = useNavigate();
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
      
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('sellerToken');
        return null;
      }
      
      return payload.sellerId || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('sellerToken');
      return null;
    }
  };

  // Function to fetch seller info from backend
  const fetchSellerInfo = async (token: string) => {
    try {
      // You can add an API call here to get seller info if needed
      // For now, we'll just decode the token
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sellerId;
    } catch (error) {
      console.error('Error fetching seller info:', error);
      return null;
    }
  };

  // Function to fetch seller profile data
  const fetchSellerProfile = async (sellerId: string) => {
    try {
      const response = await sellerRegistrationAPI.getProfile(sellerId);
      if (response && response.seller) {
        setSellerProfile({
          businessName: response.seller.shopName || response.seller.businessName || 'My Store',
          sellerCategory: response.seller.sellerCategory || 'Storekeeper',
          name: response.seller.name || 'Seller'
        });
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      // Set default values if API call fails
      setSellerProfile({
        businessName: 'My Store',
        sellerCategory: 'Storekeeper',
        name: 'Seller'
      });
    }
  };

  // Function to fetch seller's products
  const fetchSellerProducts = async () => {
    if (!sellerId) return;
    
    setProductsLoading(true);
    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}/products/seller/${sellerId}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.products || []);
      } else {
        console.error('Failed to fetch products:', data.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    const initializeSellerId = async () => {
      setIsLoading(true);
      
      // First try to get from location state
      let currentSellerId = location.state?.sellerId;
      
      // If not in location state, try to get from localStorage token
      if (!currentSellerId) {
        currentSellerId = getSellerIdFromToken();
      }
      
      // If still no sellerId, try to fetch from backend using stored token
      if (!currentSellerId) {
        const token = localStorage.getItem('sellerToken');
        if (token) {
          currentSellerId = await fetchSellerInfo(token);
        }
      }
      
      setSellerId(currentSellerId);
      
      // Fetch seller profile if we have a sellerId
      if (currentSellerId) {
        await fetchSellerProfile(currentSellerId);
      }
      
      setIsLoading(false);
    };

    initializeSellerId();
  }, [location.state]);

  // Check for valid session on component mount
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('sellerToken');
      if (!token) {
        console.log('🔐 StoreDashboard: No session found, redirecting to login');
        navigate('/seller-login');
        return;
      }

      // Check if token is expired
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          console.log('🔐 StoreDashboard: Token expired, redirecting to login');
          localStorage.removeItem('sellerToken');
          navigate('/seller-login');
        }
      } catch (error) {
        console.log('🔐 StoreDashboard: Invalid token, redirecting to login');
        localStorage.removeItem('sellerToken');
        navigate('/seller-login');
      }
    };

    checkSession();
  }, [navigate]);

  // Fetch products when sellerId is available
  useEffect(() => {
    if (sellerId) {
      fetchSellerProducts();
    }
  }, [sellerId]);

  // Store stats based on actual data
  const [storeStats] = useState<StoreStats>({
    totalProducts: products.length,
    totalSales: products.reduce((sum, product) => sum + (product.sales || 0), 0),
    totalOrders: 89, // This would come from API
    totalCustomers: 67, // This would come from API
    monthlyRevenue: products.reduce((sum, product) => sum + ((product.sales || 0) * product.price), 0),
    growthRate: 15.4 // This would come from API
  });

  const [sqlVerification] = useState<SQLVerification>({
    pssStatus: 'pending',
    edrStatus: 'pending',
    emoStatus: 'pending',
    currentLevel: 'Free',
    nextLevel: 'Basic',
    productLimit: 3,
    currentProducts: products.length
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if no sellerId found
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
            to="/seller-login"
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

  // Product action handlers
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product: Product) => {
    console.log('StoreDashboard - handleEditProduct called');
    console.log('StoreDashboard - product:', product);
    console.log('StoreDashboard - sellerId:', sellerId);
    console.log('StoreDashboard - product._id:', product._id);
    console.log('StoreDashboard - product.id:', (product as any).id);
    
    if (!sellerId) {
      console.error('StoreDashboard - sellerId is missing');
      alert('Authentication required. Please sign in to your seller account first.');
      navigate('/seller-login');
      return;
    }
    
    const productId = getProductId(product);
    
    if (!productId) {
      console.error('StoreDashboard - No product ID found');
      alert('Product ID is missing. Please try again.');
      return;
    }
    
    navigate('/edit-product', { 
      state: { 
        productId: productId, 
        sellerId: sellerId,
        product: product 
      } 
    });
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
      setIsDeleting(false);
      
      // Show success message (you can add a toast notification here)
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
      setIsDeleting(false);
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedProduct(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedProduct(null);
    setIsDeleting(false);
  };

  // Handle seller sign out
  const handleSignOut = async () => {
    try {
      // Call backend logout API
      await sellerAuthAPI.logout();
    } catch (error) {
      console.log('Logout API call failed, continuing with local logout');
    } finally {
      // Clear seller token
      localStorage.removeItem('sellerToken');
      // Navigate to seller login
      navigate('/seller-login');
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
              <button
                onClick={handleSignOut}
                className="text-red-600 hover:text-red-700 transition-colors flex items-center"
              >
                <FiLogOut className="w-4 h-4 mr-1" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sellerProfile ? `${sellerProfile.businessName} Dashboard` : 'My Store Dashboard'}
              </h1>
              <p className="text-gray-600">
                {sellerProfile ? 
                  `${sellerProfile.sellerCategory} • Manage your products, track sales, and grow your business` :
                  'Manage your products, track sales, and grow your business'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/add-product" 
                state={{ sellerId: sellerId }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <FiPlus className="mr-2" />
                Add Product
              </Link>
              {sellerProfile?.sellerCategory === 'Company' && (
                <Link 
                  to={`/seller-hierarchy/${sellerId}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FiUsers className="mr-2" />
                  Supply Chain
                </Link>
              )}
              {sellerProfile?.sellerCategory === 'Dealer' && (
                <Link 
                  to={`/dealer-hierarchy/${sellerId}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FiUsers className="mr-2" />
                  Supply Chain
                </Link>
              )}
              {sellerProfile?.sellerCategory === 'Wholesaler' && (
                <Link 
                  to={`/wholesaler-hierarchy/${sellerId}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FiUsers className="mr-2" />
                  Supply Chain
                </Link>
              )}
              {sellerProfile?.sellerCategory === 'Trader' && (
                <Link 
                  to={`/trader-hierarchy/${sellerId}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                >
                  <FiUsers className="mr-2" />
                  Supply Chain
                </Link>
              )}
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
                  
                    <span className="inline-block ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Coming Soon
                    </span>
                  
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
          {/* <h2 className="text-xl font-bold text-gray-900 mb-4">SQL Quality Verification Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4"> */}
              {/* <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">PSS Verification</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(sqlVerification.pssStatus)}`}>
                  {getStatusIcon(sqlVerification.pssStatus)}
                  <span className="ml-1 capitalize">{sqlVerification.pssStatus}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">Personal Security System verification for ID and documents</p>
            </div> */}

            {/* <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">EDR Verification</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(sqlVerification.edrStatus)}`}>
                  {getStatusIcon(sqlVerification.edrStatus)}
                  <span className="ml-1 capitalize">{sqlVerification.edrStatus}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">Exam Decision Registration for practical skills testing</p>
            </div> */}

            {/* <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">EMO Verification</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(sqlVerification.emoStatus)}`}>
                  {getStatusIcon(sqlVerification.emoStatus)}
                  <span className="ml-1 capitalize">{sqlVerification.emoStatus}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600">Easy Management Office for physical inspection</p>
            </div> */}
          {/* </div> */}
          
          <div className="mt-6 flex justify-center">
            <Link
              to="/verification"
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
            >
              <FiShield className="mr-2" />
              SQL Verification
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
                        <div key={product._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <img src={product.images[0] || '/api/placeholder/150/150'} alt={product.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{product.title}</h4>
                            <p className="text-sm text-gray-600">${product.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{product.sales} sold</p>
                            <div className="flex items-center text-sm text-gray-600">
                              <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                              {product.rating.average}
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
                    
                                  <Link 
                to="/add-product" 
                state={{ sellerId: sellerId }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <FiPlus className="mr-2" />
                Add Product
              </Link>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {productsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search or add your first product</p>
                      <Link 
                        to="/add-product" 
                        state={{ sellerId: sellerId }}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Add Your First Product
                      </Link>
                    </div>
                  ) : (
                                         filteredProducts.map((product) => (
                       <motion.div
                         key={product._id}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                       >
                         <img src={product.images[0] || '/api/placeholder/150/150'} alt={product.title} className="w-full h-48 object-cover" />
                         
                         <div className="p-4">
                           <div className="flex items-center justify-between mb-2">
                             <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                               product.status === 'approved' ? 'bg-green-100 text-green-800' : 
                               product.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                               'bg-red-100 text-red-800'
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
                               {product.rating.average}
                             </div>
                           </div>
                          
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewProduct(product)}
                              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                              <FiEye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                            >
                              <FiEdit className="w-4 h-4 mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product)}
                              className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                            >
                              <FiTrash2 className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
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

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiXCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedProduct.images[0] || '/api/placeholder/400/400'} 
                    alt={selectedProduct.title} 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedProduct.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">${selectedProduct.price}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedProduct.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      selectedProduct.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <p className="font-medium">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock:</span>
                      <p className="font-medium">{selectedProduct.stock} units</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Sales:</span>
                      <p className="font-medium">{selectedProduct.sales} sold</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="font-medium">{selectedProduct.rating.average}</span>
                        <span className="text-gray-500 ml-1">({selectedProduct.rating.count} reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditProduct(selectedProduct)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Edit Product
                      </button>
                      <button
                        onClick={closeViewModal}
                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <FiTrash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>"{selectedProduct.title}"</strong>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This will permanently remove the product from your store.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmDeleteProduct}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </button>
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
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