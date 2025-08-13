"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiPlus, 
  FiTrash2, 
  FiEye, 
  FiTrendingUp, 
  FiMapPin, 
  FiDollarSign,
  FiPackage,
  FiShoppingCart,
  FiStore,
  FiBuilding,
  FiUserCheck,
  FiUserX,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

interface Seller {
  _id: string;
  name: string;
  shopName: string;
  sellerCategory: string;
  location: string;
  status: string;
  verified: boolean;
  createdAt: string;
}

interface SupplyChain {
  seller: {
    id: string;
    name: string;
    businessName: string;
    category: string;
    location: string;
    status: string;
    verified: boolean;
  };
  parentCompany: Seller | null;
  downstream: {
    dealers: Seller[];
    wholesalers: Seller[];
    traders: Seller[];
    storekeepers: Seller[];
  };
  statistics: {
    totalDownstream: number;
    totalProducts: number;
    networkRevenue: number;
  };
}

interface NetworkPerformance {
  period: string;
  startDate: string;
  endDate: string;
  networkGrowth: {
    totalSellers: number;
    newSellers: number;
    activeSellers: number;
    growthRate: number;
  };
  revenueMetrics: {
    directRevenue: number;
    networkRevenue: number;
    totalRevenue: number;
    averageRevenuePerSeller: number;
  };
  topPerformers: any[];
  categoryPerformance: any;
}

const SupplyChainManagement: React.FC = () => {
  const router = useRouter();
  const [supplyChain, setSupplyChain] = useState<SupplyChain | null>(null);
  const [performance, setPerformance] = useState<NetworkPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Get seller ID from token
  const getSellerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('sellerToken');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sellerId || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const sellerId = getSellerIdFromToken();

  useEffect(() => {
    if (sellerId) {
      fetchSupplyChain();
      fetchNetworkPerformance();
    }
  }, [sellerId, selectedPeriod]);

  const fetchSupplyChain = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/seller/supply-chain/${sellerId}`);
      const data = await response.json();

      if (data.success) {
        setSupplyChain(data.data.supplyChain);
      }
    } catch (error) {
      console.error('Error fetching supply chain:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworkPerformance = async () => {
    try {
      const response = await fetch(`/api/seller/network/${sellerId}/performance?period=${selectedPeriod}`);
      const data = await response.json();

      if (data.success) {
        setPerformance(data.data.performance);
      }
    } catch (error) {
      console.error('Error fetching network performance:', error);
    }
  };

  const handleRemoveSeller = async (sellerId: string, relationshipType: string) => {
    if (!confirm(`Are you sure you want to remove this ${relationshipType} from your network?`)) return;

    try {
      const response = await fetch(`/api/seller-hierarchy/remove-seller/${sellerId}/${sellerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchSupplyChain();
        fetchNetworkPerformance();
      }
    } catch (error) {
      console.error('Error removing seller:', error);
    }
  };

  const getSellerIcon = (category: string) => {
    switch (category) {
      case 'Company':
        return <FiBuilding className="w-5 h-5 text-blue-600" />;
      case 'Dealer':
        return <FiShoppingCart className="w-5 h-5 text-green-600" />;
      case 'Wholesaler':
        return <FiPackage className="w-5 h-5 text-purple-600" />;
      case 'Trader':
        return <FiTrendingUp className="w-5 h-5 text-orange-600" />;
      case 'Storekeeper':
        return <FiStore className="w-5 h-5 text-red-600" />;
      default:
        return <FiUsers className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!sellerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please log in as a seller to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supply Chain Management</h1>
              <p className="text-gray-600">Manage your network hierarchy and monitor performance</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/add-seller-to-network')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Seller</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Network Overview', icon: FiUsers },
                { id: 'performance', label: 'Performance Analytics', icon: FiTrendingUp },
                { id: 'hierarchy', label: 'Hierarchy View', icon: FiArrowDown }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading supply chain data...</p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && supplyChain && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Current Seller Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                      <div className="flex items-center space-x-4">
                        {getSellerIcon(supplyChain.seller.category)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {supplyChain.seller.businessName}
                          </h3>
                          <p className="text-gray-600">{supplyChain.seller.category}</p>
                          <p className="text-sm text-gray-500 flex items-center mt-1">
                            <FiMapPin className="w-4 h-4 mr-1" />
                            {supplyChain.seller.location}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            supplyChain.seller.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {supplyChain.seller.verified ? (
                              <>
                                <FiUserCheck className="w-4 h-4 mr-1" />
                                Verified
                              </>
                            ) : (
                              <>
                                <FiUserX className="w-4 h-4 mr-1" />
                                Pending
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Network Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FiUsers className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Network</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {supplyChain.statistics.totalDownstream + 1}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <FiPackage className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {supplyChain.statistics.totalProducts}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FiDollarSign className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Network Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                              ${supplyChain.statistics.networkRevenue?.toFixed(2) || '0'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Downstream Sellers */}
                    <div className="space-y-6">
                      {Object.entries(supplyChain.downstream).map(([type, sellers]) => (
                        sellers.length > 0 && (
                          <div key={type} className="bg-white rounded-lg shadow">
                            <div className="px-6 py-4 border-b border-gray-200">
                              <h4 className="text-lg font-medium text-gray-900 capitalize">
                                {type} ({sellers.length})
                              </h4>
                            </div>
                            <div className="divide-y divide-gray-200">
                              {sellers.map((seller) => (
                                <div key={seller._id} className="px-6 py-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                      {getSellerIcon(seller.sellerCategory)}
                                      <div>
                                        <p className="font-medium text-gray-900">{seller.shopName}</p>
                                        <p className="text-sm text-gray-500">{seller.sellerCategory}</p>
                                        <p className="text-xs text-gray-400 flex items-center mt-1">
                                          <FiMapPin className="w-3 h-3 mr-1" />
                                          {seller.location}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(seller.status)}`}>
                                        {seller.status}
                                      </span>
                                      <button
                                        onClick={() => handleRemoveSeller(seller._id, type)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        <FiTrash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && performance && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {/* Period Selector */}
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-gray-700">Time Period:</label>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                      </select>
                    </div>

                    {/* Network Growth */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Network Growth</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{performance.networkGrowth.totalSellers}</p>
                          <p className="text-sm text-gray-600">Total Sellers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{performance.networkGrowth.newSellers}</p>
                          <p className="text-sm text-gray-600">New Sellers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{performance.networkGrowth.activeSellers}</p>
                          <p className="text-sm text-gray-600">Active Sellers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">
                            {performance.networkGrowth.growthRate > 0 ? '+' : ''}{performance.networkGrowth.growthRate.toFixed(1)}%
                          </p>
                          <p className="text-sm text-gray-600">Growth Rate</p>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Metrics */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Metrics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Direct Revenue</span>
                            <span className="text-lg font-semibold text-gray-900">
                              ${performance.revenueMetrics.directRevenue?.toFixed(2) || '0'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${performance.revenueMetrics.totalRevenue > 0 
                                  ? (performance.revenueMetrics.directRevenue / performance.revenueMetrics.totalRevenue) * 100 
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Network Revenue</span>
                            <span className="text-lg font-semibold text-gray-900">
                              ${performance.revenueMetrics.networkRevenue?.toFixed(2) || '0'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${performance.revenueMetrics.totalRevenue > 0 
                                  ? (performance.revenueMetrics.networkRevenue / performance.revenueMetrics.totalRevenue) * 100 
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium text-gray-900">Total Revenue</span>
                          <span className="text-2xl font-bold text-gray-900">
                            ${performance.revenueMetrics.totalRevenue?.toFixed(2) || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Hierarchy Tab */}
                {activeTab === 'hierarchy' && supplyChain && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Network Hierarchy</h3>
                      
                      {/* Hierarchical View */}
                      <div className="space-y-6">
                        {/* Top Level - Current Seller */}
                        <div className="flex justify-center">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-4 text-center">
                            <div className="text-lg font-semibold">{supplyChain.seller.businessName}</div>
                            <div className="text-sm opacity-90">{supplyChain.seller.category}</div>
                          </div>
                        </div>

                        {/* Connection Lines */}
                        {supplyChain.statistics.totalDownstream > 0 && (
                          <div className="flex justify-center">
                            <div className="w-px h-8 bg-gray-300"></div>
                          </div>
                        )}

                        {/* Downstream Levels */}
                        {Object.entries(supplyChain.downstream).map(([type, sellers]) => (
                          sellers.length > 0 && (
                            <div key={type} className="space-y-4">
                              <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-700 capitalize mb-2">{type}</h4>
                                <div className="flex justify-center space-x-4">
                                  {sellers.map((seller) => (
                                    <div key={seller._id} className="bg-gray-100 rounded-lg p-3 text-center min-w-[120px]">
                                      <div className="text-sm font-medium text-gray-900">{seller.shopName}</div>
                                      <div className="text-xs text-gray-500">{seller.sellerCategory}</div>
                                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(seller.status)}`}>
                                        {seller.status}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainManagement;
