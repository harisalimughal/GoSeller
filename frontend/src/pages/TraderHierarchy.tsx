import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiX,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiMapPin,
  FiPackage,
  FiDollarSign,
  FiSettings,
  FiTrash2,
  FiEdit,
  FiEye,
  FiArrowRight,
  FiFilter
} from 'react-icons/fi';
import { sellerHierarchyAPI } from '../services/api';

interface TraderHierarchyProps {
  traderId: string;
}

interface HierarchyData {
  trader: {
    id: string;
    name: string;
    businessName: string;
    category: string;
    location: string;
  };
  storekeepers: Array<{
    _id: string;
    name: string;
    shopName: string;
    location: string;
    sellerCategory: string;
    supplyChain: any;
    status: string;
    verified: boolean;
  }>;
}

const TraderHierarchy: React.FC<TraderHierarchyProps> = ({ traderId }) => {
  const [hierarchy, setHierarchy] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showStorekeeperSearchModal, setShowStorekeeperSearchModal] = useState(false);
  const [availableStorekeepers, setAvailableStorekeepers] = useState<any[]>([]);
  const [storekeeperSearchTerm, setStorekeeperSearchTerm] = useState('');
  const [storekeeperSearchLoading, setStorekeeperSearchLoading] = useState(false);
  const [storekeeperPagination, setStorekeeperPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [traderProducts, setTraderProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    loadHierarchyData();
  }, [traderId]);

  // Auto-search storekeepers when modal opens
  useEffect(() => {
    if (showStorekeeperSearchModal) {
      console.log('Modal opened, searching for storekeepers...');
      searchAvailableStorekeepers('', 1);
      loadTraderProducts();
    }
  }, [showStorekeeperSearchModal]);

  const loadHierarchyData = async () => {
    try {
      setLoading(true);
      const response = await sellerHierarchyAPI.getTraderHierarchy(traderId);
      setHierarchy(response.hierarchy);
    } catch (error) {
      console.error('Error loading hierarchy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchAvailableStorekeepers = async (search?: string, page: number = 1) => {
    try {
      setStorekeeperSearchLoading(true);
      console.log('Searching storekeepers with:', { traderId, search, page });
      const response = await sellerHierarchyAPI.searchAvailableStorekeepers(traderId, search, page);
      console.log('Storekeeper search response:', response);
      setAvailableStorekeepers(response.storekeepers);
      setStorekeeperPagination(response.pagination);
    } catch (error) {
      console.error('Error searching storekeepers:', error);
      alert('Failed to search storekeepers. Please try again.');
    } finally {
      setStorekeeperSearchLoading(false);
    }
  };

  const loadTraderProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await sellerHierarchyAPI.getTraderProducts(traderId);
      setTraderProducts(response.products);
    } catch (error) {
      console.error('Error loading trader products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddStorekeeperFromSearch = async (data: {
    storekeeperId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      storekeeperPrice: number;
      commissionMargin?: number;
      maxStockLimit?: number;
      priceRules?: any;
    }>;
    priceRules?: any;
    commissionMargin?: number;
    expiryDate?: string;
    contractDuration?: number;
  }) => {
    try {
      await sellerHierarchyAPI.addStorekeeperWithProducts({
        traderId,
        ...data
      });
      setShowStorekeeperSearchModal(false);
      await loadHierarchyData();
    } catch (error) {
      console.error('Error adding storekeeper:', error);
      alert('Failed to add storekeeper. Please try again.');
    }
  };

  const handleRemoveStorekeeper = async (storekeeperId: string) => {
    if (window.confirm('Are you sure you want to remove this storekeeper from your hierarchy?')) {
      try {
        await sellerHierarchyAPI.removeStorekeeper(traderId, storekeeperId);
        await loadHierarchyData();
      } catch (error) {
        console.error('Error removing storekeeper:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'rejected':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <FiUsers className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Storekeeper Management</h1>
                <p className="text-sm text-gray-600">Manage your storekeeper network and distribution</p>
              </div>
            </div>
            <button
              onClick={() => setShowStorekeeperSearchModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Storekeeper
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Storekeepers</p>
                <p className="text-2xl font-bold text-gray-900">{hierarchy?.storekeepers.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiPackage className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{traderProducts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue Share</p>
                <p className="text-2xl font-bold text-gray-900">15%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: FiUsers },
                { id: 'storekeepers', name: 'Storekeepers', icon: FiPackage },
                { id: 'products', name: 'Products', icon: FiPackage }
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
            {/* Overview Tab */}
            {activeTab === 'overview' && hierarchy && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900">Storekeepers</h3>
                    <p className="text-3xl font-bold text-blue-600">{hierarchy.storekeepers.length}</p>
                    <p className="text-sm text-blue-700">Retail partners</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900">Products</h3>
                    <p className="text-3xl font-bold text-green-600">{traderProducts.length}</p>
                    <p className="text-sm text-green-700">Available items</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-900">Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600">$38K</p>
                    <p className="text-sm text-purple-700">Monthly average</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {hierarchy.storekeepers.slice(0, 3).map((storekeeper) => (
                      <div key={storekeeper._id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <FiUsers className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">{storekeeper.shopName}</p>
                            <p className="text-sm text-gray-600">{storekeeper.location}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(storekeeper.status)}`}>
                          {getStatusIcon(storekeeper.status)}
                          <span className="ml-1">{storekeeper.status}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Storekeepers Tab */}
            {activeTab === 'storekeepers' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Storekeeper Network</h3>
                  <button
                    onClick={() => setShowStorekeeperSearchModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                  >
                    <FiPlus className="mr-2" />
                    Add Storekeeper
                  </button>
                </div>

                {hierarchy?.storekeepers.length === 0 ? (
                  <div className="text-center py-12">
                    <FiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Storekeepers Yet</h3>
                    <p className="text-gray-600 mb-4">Start building your storekeeper network to expand your retail distribution</p>
                    <button
                      onClick={() => setShowStorekeeperSearchModal(true)}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Add Your First Storekeeper
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hierarchy?.storekeepers.map((storekeeper) => (
                      <motion.div
                        key={storekeeper._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-md p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{storekeeper.shopName}</h4>
                            <p className="text-sm text-gray-600">{storekeeper.location}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(storekeeper.status)}`}>
                            {getStatusIcon(storekeeper.status)}
                            <span className="ml-1">{storekeeper.status}</span>
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMapPin className="mr-2" />
                            <span>Territories: {storekeeper.supplyChain?.authorizedTerritories?.join(', ') || 'Not assigned'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiPackage className="mr-2" />
                            <span>Products: {storekeeper.supplyChain?.storekeeperConfig?.assignedProducts?.length || 0}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
                            <FiEye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors">
                            <FiEdit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleRemoveStorekeeper(storekeeper._id)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4 mr-1" />
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Available Products</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                      <FiFilter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {productsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  </div>
                ) : traderProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Available</h3>
                    <p className="text-gray-600">Add products to your inventory to assign to storekeepers</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {traderProducts.map((product) => (
                      <div key={product._id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <span className="text-lg font-bold text-orange-600">${product.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Stock: {product.stockQuantity}</span>
                          <button className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors">
                            Assign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Storekeeper Search Modal */}
      {showStorekeeperSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Search Available Storekeepers</h3>
              <button
                onClick={() => setShowStorekeeperSearchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>
            
            <EnhancedAddStorekeeperModal
              storekeepers={availableStorekeepers}
              products={traderProducts}
              loading={storekeeperSearchLoading}
              searchTerm={storekeeperSearchTerm}
              onSearchChange={setStorekeeperSearchTerm}
              onSearch={() => searchAvailableStorekeepers(storekeeperSearchTerm, 1)}
              pagination={storekeeperPagination}
              onPageChange={(page) => searchAvailableStorekeepers(storekeeperSearchTerm, page)}
              onAddStorekeeper={handleAddStorekeeperFromSearch}
              onClose={() => setShowStorekeeperSearchModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Add Storekeeper Modal Component
interface EnhancedAddStorekeeperModalProps {
  storekeepers: any[];
  products: any[];
  loading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: () => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onPageChange: (page: number) => void;
  onAddStorekeeper: (data: {
    storekeeperId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      storekeeperPrice: number;
      commissionMargin: number;
      maxStockLimit?: number;
    }>;
    priceRules?: any;
    commissionMargin?: number;
    expiryDate?: string;
    contractDuration?: number;
  }) => void;
  onClose: () => void;
}

const EnhancedAddStorekeeperModal: React.FC<EnhancedAddStorekeeperModalProps> = ({
  storekeepers,
  products,
  loading,
  searchTerm,
  onSearchChange,
  onSearch,
  pagination,
  onPageChange,
  onAddStorekeeper,
  onClose
}) => {
  const [selectedStorekeeper, setSelectedStorekeeper] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [territories, setTerritories] = useState<string[]>([]);
  const [newTerritory, setNewTerritory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    productId: string;
    storekeeperPrice: number;
    commissionMargin: number;
    maxStockLimit?: number;
  }>>([]);
  const [globalCommissionMargin, setGlobalCommissionMargin] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [contractDuration, setContractDuration] = useState<number>(0);

  const addTerritory = () => {
    if (newTerritory.trim() && !territories.includes(newTerritory.trim())) {
      setTerritories([...territories, newTerritory.trim()]);
      setNewTerritory('');
    }
  };

  const removeTerritory = (index: number) => {
    setTerritories(territories.filter((_, i) => i !== index));
  };

  const addProduct = (product: any) => {
    const existingProduct = selectedProducts.find(p => p.productId === product._id);
    if (!existingProduct) {
      setSelectedProducts([...selectedProducts, {
        productId: product._id,
        storekeeperPrice: product.price * 0.9, // 10% discount for storekeeper
        commissionMargin: globalCommissionMargin,
        maxStockLimit: 50
      }]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const updateProductPrice = (productId: string, price: number) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.productId === productId ? { ...p, storekeeperPrice: price } : p
    ));
  };

  const updateProductCommission = (productId: string, commission: number) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.productId === productId ? { ...p, commissionMargin: commission } : p
    ));
  };

  const handleAddStorekeeper = () => {
    if (selectedStorekeeper && territories.length > 0 && selectedProducts.length > 0) {
      onAddStorekeeper({
        storekeeperId: selectedStorekeeper._id,
        territories,
        assignedProducts: selectedProducts,
        commissionMargin: globalCommissionMargin,
        expiryDate,
        contractDuration
      });
    }
  };

  return (
    <div>
      {!showAddForm ? (
        <div>
          {/* Search Section */}
          <div className="mb-6">
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                placeholder="Search storekeepers..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={onSearch}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                <FiSearch className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : storekeepers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No storekeepers found matching your search.' : 'No available storekeepers found. Click "Search All Storekeepers" to find storekeepers.'}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Found {storekeepers.length} storekeepers
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {storekeepers.map((storekeeper) => (
                  <motion.div
                    key={storekeeper._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{storekeeper.shopName}</h4>
                        <p className="text-sm text-gray-600">{storekeeper.location}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        storekeeper.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : storekeeper.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {storekeeper.status === 'approved' ? (
                          <>
                            <FiCheckCircle className="mr-1" />
                            Approved
                          </>
                        ) : storekeeper.status === 'pending' ? (
                          <>
                            <FiClock className="mr-1" />
                            Pending
                          </>
                        ) : (
                          <>
                            <FiXCircle className="mr-1" />
                            {storekeeper.status}
                          </>
                        )}
                      </span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiUsers className="mr-2" />
                        <span>Category: {storekeeper.sellerCategory}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiClock className="mr-2" />
                        <span>Registered: {new Date(storekeeper.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiEye className="mr-2" />
                        <span>Verification: {storekeeper.verified ? 'Verified' : 'Not Verified'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedStorekeeper(storekeeper);
                        setShowAddForm(true);
                      }}
                      className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                        storekeeper.status === 'approved' 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : storekeeper.status === 'pending'
                          ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {storekeeper.status === 'approved' ? 'Add to Network' : 'Request Addition'}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex space-x-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded text-sm ${
                      page === pagination.page
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Add {selectedStorekeeper?.shopName} to Your Network
            </h4>
            <p className="text-gray-600">Configure territories and product assignments</p>
          </div>

          {/* Territories */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3">Authorized Territories</h5>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="Add territory..."
                value={newTerritory}
                onChange={(e) => setNewTerritory(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={addTerritory}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {territories.map((territory, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                >
                  {territory}
                  <button
                    onClick={() => removeTerritory(index)}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3">Assign Products</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {products.map((product) => (
                <div key={product._id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h6 className="font-medium text-gray-900">{product.name}</h6>
                      <p className="text-sm text-gray-600">${product.price}</p>
                    </div>
                    <button
                      onClick={() => addProduct(product)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Products */}
            {selectedProducts.length > 0 && (
              <div>
                <h6 className="font-medium text-gray-900 mb-3">Selected Products</h6>
                <div className="space-y-3">
                  {selectedProducts.map((selectedProduct) => {
                    const product = products.find(p => p._id === selectedProduct.productId);
                    return (
                      <div key={selectedProduct.productId} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h6 className="font-medium text-gray-900">{product?.name}</h6>
                            <p className="text-sm text-gray-600">Original: ${product?.price}</p>
                          </div>
                          <button
                            onClick={() => removeProduct(selectedProduct.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Storekeeper Price
                            </label>
                            <input
                              type="number"
                              value={selectedProduct.storekeeperPrice}
                              onChange={(e) => updateProductPrice(selectedProduct.productId, parseFloat(e.target.value))}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Commission %
                            </label>
                            <input
                              type="number"
                              value={selectedProduct.commissionMargin}
                              onChange={(e) => updateProductCommission(selectedProduct.productId, parseFloat(e.target.value))}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Contract Details */}
          <div className="mb-6">
            <h5 className="font-medium text-gray-900 mb-3">Contract Details</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Global Commission Margin (%)
                </label>
                <input
                  type="number"
                  value={globalCommissionMargin}
                  onChange={(e) => setGlobalCommissionMargin(parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Duration (months)
                </label>
                <input
                  type="number"
                  value={contractDuration}
                  onChange={(e) => setContractDuration(parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={handleAddStorekeeper}
              disabled={!selectedStorekeeper || territories.length === 0 || selectedProducts.length === 0}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Add Storekeeper
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraderHierarchy;
