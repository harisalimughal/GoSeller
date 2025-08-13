"use client"
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiMapPin,
  FiEdit,
  FiTrash2,
  FiEye,
  FiBarChart,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSearch,
  FiFilter,
  FiPlus,
  FiX,
  FiArrowRight,
  FiArrowDown,
  FiArrowUp
} from 'react-icons/fi';
import { sellerHierarchyAPI, HierarchyData, HierarchyStats } from '../services/api';

interface SellerHierarchyProps {
  companyId: string;
}

const SellerHierarchy: React.FC<SellerHierarchyProps> = ({ companyId }) => {
  const [hierarchy, setHierarchy] = useState<HierarchyData | null>(null);
  const [stats, setStats] = useState<HierarchyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [showAddDealerModal, setShowAddDealerModal] = useState(false);
  const [showDealerSearchModal, setShowDealerSearchModal] = useState(false);
  const [showTerritoryModal, setShowTerritoryModal] = useState(false);
  const [pendingDealers, setPendingDealers] = useState<any[]>([]);
  const [allDealers, setAllDealers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [availableDealers, setAvailableDealers] = useState<any[]>([]);
  const [dealerSearchTerm, setDealerSearchTerm] = useState('');
  const [dealerSearchLoading, setDealerSearchLoading] = useState(false);
  const [dealerPagination, setDealerPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [companyProducts, setCompanyProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    loadHierarchyData();
  }, [companyId]);

  // Auto-search dealers when modal opens
  useEffect(() => {
    if (showDealerSearchModal) {
      console.log('Modal opened, searching for dealers...');
      searchAvailableDealers('', 1);
      loadCompanyProducts();
    }
  }, [showDealerSearchModal]);

  const loadHierarchyData = async () => {
    try {
      setLoading(true);
      const [hierarchyResponse, statsResponse, pendingResponse, dealersResponse] = await Promise.all([
        sellerHierarchyAPI.getHierarchy(companyId),
        sellerHierarchyAPI.getStats(companyId),
        sellerHierarchyAPI.getPendingDealers(companyId),
        sellerHierarchyAPI.getDealers(companyId)
      ]);

      setHierarchy(hierarchyResponse.hierarchy);
      setStats(statsResponse.stats);
      setPendingDealers(pendingResponse.pendingDealers);
      setAllDealers(dealersResponse.dealers);
    } catch (error) {
      console.error('Error loading hierarchy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDealer = async (dealerId: string) => {
    try {
      await sellerHierarchyAPI.approveDealer(dealerId);
      await loadHierarchyData();
    } catch (error) {
      console.error('Error approving dealer:', error);
    }
  };

  const handleRejectDealer = async (dealerId: string, reason: string) => {
    try {
      await sellerHierarchyAPI.rejectDealer(dealerId, reason);
      await loadHierarchyData();
    } catch (error) {
      console.error('Error rejecting dealer:', error);
    }
  };

  const handleUpdateTerritories = async (dealerId: string, territories: string[]) => {
    try {
      await sellerHierarchyAPI.updateDealerTerritories(dealerId, territories);
      await loadHierarchyData();
      setShowTerritoryModal(false);
    } catch (error) {
      console.error('Error updating territories:', error);
    }
  };

  const handleRemoveDealer = async (dealerId: string) => {
    if (window.confirm('Are you sure you want to remove this dealer from your hierarchy?')) {
      try {
        await sellerHierarchyAPI.removeDealer(companyId, dealerId);
        await loadHierarchyData();
      } catch (error) {
        console.error('Error removing dealer:', error);
      }
    }
  };

  const searchAvailableDealers = async (search?: string, page: number = 1) => {
    try {
      setDealerSearchLoading(true);
      console.log('Searching dealers with:', { companyId, search, page });
      const response = await sellerHierarchyAPI.searchAvailableDealers(companyId, search, page);
      console.log('Dealer search response:', response);
      setAvailableDealers(response.dealers);
      setDealerPagination(response.pagination);
    } catch (error) {
      console.error('Error searching dealers:', error);
      alert('Failed to search dealers. Please try again.');
    } finally {
      setDealerSearchLoading(false);
    }
  };

  const loadCompanyProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await sellerHierarchyAPI.getCompanyProducts(companyId);
      setCompanyProducts(response.products);
    } catch (error) {
      console.error('Error loading company products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleAddDealerFromSearch = async (data: {
    dealerId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      dealerPrice: number;
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
      await sellerHierarchyAPI.addDealerWithProducts({
        companyId,
        ...data
      });
      setShowDealerSearchModal(false);
      await loadHierarchyData();
    } catch (error) {
      console.error('Error adding dealer:', error);
      alert('Failed to add dealer. Please try again.');
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
                <h1 className="text-2xl font-bold text-gray-900">Supply Chain Management</h1>
                <p className="text-sm text-gray-600">Manage your dealer network and supply chain</p>
              </div>
            </div>
            <button
              onClick={() => {
                console.log('Opening dealer search modal for company:', companyId);
                setShowDealerSearchModal(true);
                setDealerSearchTerm('');
                searchAvailableDealers('', 1);
                loadCompanyProducts();
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
            >
              <FiUserPlus className="mr-2" />
              Add Dealer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Dealers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDealers}</p>
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
                  <FiUserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved Dealers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approvedDealers}</p>
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
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Dealers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingDealers}</p>
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
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiBarChart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Network</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalDealers + stats.totalWholesalers + stats.totalTraders + stats.totalStorekeepers}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: FiBarChart },
                { id: 'dealers', name: 'Dealers', icon: FiUsers },
                { id: 'wholesalers', name: 'Wholesalers', icon: FiArrowDown },
                { id: 'traders', name: 'Traders', icon: FiArrowRight },
                { id: 'storekeepers', name: 'Storekeepers', icon: FiArrowUp },
                { id: 'pending', name: 'Pending Approvals', icon: FiClock }
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900">Dealers</h3>
                    <p className="text-3xl font-bold text-blue-600">{hierarchy.dealers.length}</p>
                    <p className="text-sm text-blue-700">Direct representatives</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900">Wholesalers</h3>
                    <p className="text-3xl font-bold text-green-600">{hierarchy.wholesalers.length}</p>
                    <p className="text-sm text-green-700">Mid-level distributors</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-900">Traders</h3>
                    <p className="text-3xl font-bold text-purple-600">{hierarchy.traders.length}</p>
                    <p className="text-sm text-purple-700">Local suppliers</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-orange-900">Storekeepers</h3>
                    <p className="text-3xl font-bold text-orange-600">{hierarchy.storekeepers.length}</p>
                    <p className="text-sm text-orange-700">Retail outlets</p>
                  </div>
                </div>

                {/* Hierarchy Visualization */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Supply Chain Hierarchy</h3>
                  <div className="flex flex-col items-center space-y-4">
                    {/* Company */}
                    <div className="bg-orange-500 text-white px-6 py-3 rounded-lg">
                      <h4 className="font-semibold">{hierarchy.company.businessName}</h4>
                      <p className="text-sm opacity-90">Company</p>
                    </div>
                    <FiArrowDown className="text-gray-400" />
                    
                    {/* Dealers */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      {hierarchy.dealers.slice(0, 3).map((dealer, index) => (
                        <div key={dealer._id} className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg text-center">
                          <h5 className="font-medium">{dealer.shopName}</h5>
                          <p className="text-sm opacity-75">Dealer</p>
                        </div>
                      ))}
                      {hierarchy.dealers.length > 3 && (
                        <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg text-center">
                          <h5 className="font-medium">+{hierarchy.dealers.length - 3} more</h5>
                          <p className="text-sm opacity-75">Dealers</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dealers Tab */}
            {activeTab === 'dealers' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Dealers ({allDealers?.length || 0})</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search dealers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allDealers
                    ?.filter(dealer => 
                      dealer.shopName.toLowerCase().includes(searchTerm.toLowerCase()) &&
                      (filterStatus === 'all' || dealer.status === filterStatus)
                    )
                    .map((dealer) => (
                      <motion.div
                        key={dealer._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{dealer.shopName}</h4>
                            <p className="text-sm text-gray-600">{dealer.location}</p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dealer.status)}`}>
                            {getStatusIcon(dealer.status)}
                            <span className="ml-1">{dealer.status}</span>
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiMapPin className="mr-2" />
                            <span>Territories: {dealer.supplyChain?.authorizedTerritories?.join(', ') || 'Not assigned'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <FiUsers className="mr-2" />
                            <span>Category: {dealer.sellerCategory}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedDealer(dealer);
                              setShowTerritoryModal(true);
                            }}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            <FiEdit className="inline mr-1" />
                            Territories
                          </button>
                          <button
                            onClick={() => handleRemoveDealer(dealer._id)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            <FiTrash2 className="inline mr-1" />
                            Remove
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* Pending Approvals Tab */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Dealer Approvals ({pendingDealers.length})</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingDealers.map((dealer) => (
                    <motion.div
                      key={dealer._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{dealer.shopName}</h4>
                          <p className="text-sm text-gray-600">{dealer.location}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <FiClock className="mr-1" />
                          Pending
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {dealer.verificationNotes || 'No notes provided'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Registered:</strong> {new Date(dealer.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveDealer(dealer._id)}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          <FiUserCheck className="inline mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Please provide a reason for rejection:');
                            if (reason) {
                              handleRejectDealer(dealer._id, reason);
                            }
                          }}
                          className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          <FiUserX className="inline mr-1" />
                          Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Tabs */}
            {['wholesalers', 'traders', 'storekeepers'].includes(activeTab) && hierarchy && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({(hierarchy[activeTab as keyof HierarchyData] as any[])?.length || 0})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(hierarchy[activeTab as keyof HierarchyData] as any[])?.map((seller: any) => (
                    <motion.div
                      key={seller._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{seller.shopName}</h4>
                          <p className="text-sm text-gray-600">{seller.location}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(seller.status)}`}>
                          {getStatusIcon(seller.status)}
                          <span className="ml-1">{seller.status}</span>
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <FiUsers className="mr-2" />
                          <span>Category: {seller.sellerCategory}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FiMapPin className="mr-2" />
                          <span>Territories: {seller.supplyChain?.authorizedTerritories?.join(', ') || 'Not assigned'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dealer Search Modal */}
      {showDealerSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Search Available Dealers</h3>
              <button
                onClick={() => setShowDealerSearchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>
            
            <EnhancedAddDealerModal
              dealers={availableDealers}
              products={companyProducts}
              loading={dealerSearchLoading}
              searchTerm={dealerSearchTerm}
              onSearchChange={setDealerSearchTerm}
              onSearch={() => searchAvailableDealers(dealerSearchTerm, 1)}
              pagination={dealerPagination}
              onPageChange={(page: number) => searchAvailableDealers(dealerSearchTerm, page)}
              onAddDealer={handleAddDealerFromSearch}
              onClose={() => setShowDealerSearchModal(false)}
            />
          </div>
        </div>
      )}

      {/* Territory Management Modal */}
      {showTerritoryModal && selectedDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Territories for {selectedDealer.shopName}
            </h3>
            
            <TerritoryForm
              currentTerritories={selectedDealer.supplyChain?.authorizedTerritories || []}
              onSubmit={(territories) => handleUpdateTerritories(selectedDealer._id, territories)}
              onCancel={() => setShowTerritoryModal(false)}
            />
          </div>
        </div>
      )}


    </div>
  );
};

// Territory Form Component
interface TerritoryFormProps {
  currentTerritories: string[];
  onSubmit: (territories: string[]) => void;
  onCancel: () => void;
}

const TerritoryForm: React.FC<TerritoryFormProps> = ({ currentTerritories, onSubmit, onCancel }) => {
  const [territories, setTerritories] = useState<string[]>(currentTerritories);
  const [newTerritory, setNewTerritory] = useState('');

  const addTerritory = () => {
    if (newTerritory.trim() && !territories.includes(newTerritory.trim())) {
      setTerritories([...territories, newTerritory.trim()]);
      setNewTerritory('');
    }
  };

  const removeTerritory = (index: number) => {
    setTerritories(territories.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Authorized Territories
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTerritory}
            onChange={(e) => setNewTerritory(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTerritory()}
            placeholder="Enter territory name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={addTerritory}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {territories.map((territory, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
            <span className="text-sm text-gray-700">{territory}</span>
            <button
              onClick={() => removeTerritory(index)}
              className="text-red-500 hover:text-red-700"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={() => onSubmit(territories)}
          className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Update Territories
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};



// Dealer Search Modal Component
interface EnhancedAddDealerModalProps {
  dealers: any[];
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
  onAddDealer: (data: {
    dealerId: string;
    territories: string[];
    assignedProducts: Array<{
      productId: string;
      dealerPrice: number;
      commissionMargin?: number;
      maxStockLimit?: number;
      priceRules?: any;
    }>;
    priceRules?: any;
    commissionMargin?: number;
    expiryDate?: string;
    contractDuration?: number;
  }) => void;
  onClose: () => void;
}

const EnhancedAddDealerModal: React.FC<EnhancedAddDealerModalProps> = ({
  dealers,
  products,
  loading,
  searchTerm,
  onSearchChange,
  onSearch,
  pagination,
  onPageChange,
  onAddDealer,
  onClose
}) => {
  console.log('EnhancedAddDealerModal props:', { dealers: dealers.length, loading, searchTerm, pagination });
  const [selectedDealer, setSelectedDealer] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [territories, setTerritories] = useState<string[]>([]);
  const [newTerritory, setNewTerritory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    productId: string;
    dealerPrice: number;
    commissionMargin: number;
    maxStockLimit?: number;
  }>>([]);
  const [globalCommissionMargin, setGlobalCommissionMargin] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [contractDuration, setContractDuration] = useState<number>(0);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

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
        dealerPrice: product.price * 0.8, // Default 20% discount
        commissionMargin: globalCommissionMargin,
        maxStockLimit: 100
      }]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const updateProductPrice = (productId: string, price: number) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.productId === productId ? { ...p, dealerPrice: price } : p
    ));
  };

  const updateProductCommission = (productId: string, commission: number) => {
    setSelectedProducts(selectedProducts.map(p => 
      p.productId === productId ? { ...p, commissionMargin: commission } : p
    ));
  };

  const handleAddDealer = () => {
    if (selectedDealer && territories.length > 0 && selectedProducts.length > 0) {
      onAddDealer({
        dealerId: selectedDealer._id,
        territories,
        assignedProducts: selectedProducts,
        priceRules: {},
        commissionMargin: globalCommissionMargin,
        expiryDate: expiryDate || undefined,
        contractDuration: contractDuration || undefined
      });
      setSelectedDealer(null);
      setShowAddForm(false);
      setTerritories([]);
      setSelectedProducts([]);
      setGlobalCommissionMargin(0);
      setExpiryDate('');
      setContractDuration(0);
    } else {
      alert('Please select territories and at least one product for the dealer');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Search dealers by name, location, or business name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Searching...' : searchTerm ? 'Search' : 'Search All Dealers'}
        </button>
      </div>

      {/* Status Legend */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">Dealer Status Legend:</div>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 mr-2">
              <FiCheckCircle className="w-3 h-3 mr-1" />
              Approved
            </span>
            <span className="text-gray-600">- Verified and ready to add</span>
          </div>
          <div className="flex items-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 mr-2">
              <FiClock className="w-3 h-3 mr-1" />
              Pending
            </span>
            <span className="text-gray-600">- Awaiting approval, can still be added</span>
          </div>
        </div>
      </div>

      {/* Dealers List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : dealers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No dealers found matching your search.' : 'No available dealers found. Click "Search All Dealers" to find dealers.'}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-4">
            Found {dealers.length} dealers
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dealers.map((dealer) => (
              <motion.div
                key={dealer._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{dealer.shopName}</h4>
                    <p className="text-sm text-gray-600">{dealer.location}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    dealer.status === 'approved' 
                      ? 'bg-green-100 text-green-800' 
                      : dealer.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dealer.status === 'approved' ? (
                      <>
                        <FiCheckCircle className="mr-1" />
                        Approved
                      </>
                    ) : dealer.status === 'pending' ? (
                      <>
                        <FiClock className="mr-1" />
                        Pending
                      </>
                    ) : (
                      <>
                        <FiXCircle className="mr-1" />
                        {dealer.status}
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUsers className="mr-2" />
                    <span>Category: {dealer.sellerCategory}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiClock className="mr-2" />
                    <span>Registered: {new Date(dealer.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiEye className="mr-2" />
                    <span>Verification: {dealer.verified ? 'Verified' : 'Not Verified'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedDealer(dealer);
                    setShowAddForm(true);
                  }}
                  className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                    dealer.status === 'approved' 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : dealer.status === 'pending'
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  <FiUserPlus className="inline mr-1" />
                  {dealer.status === 'approved' ? 'Add Approved Dealer' : dealer.status === 'pending' ? 'Add Pending Dealer' : 'Add Dealer'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Add Dealer Form Modal */}
      {showAddForm && selectedDealer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Add {selectedDealer.shopName} to Network
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Territory Assignment */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Territory Assignment</h4>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTerritory}
                    onChange={(e) => setNewTerritory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTerritory()}
                    placeholder="Enter territory (city/district)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    onClick={addTerritory}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {territories.map((territory, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {territory}
                      <button
                        onClick={() => removeTerritory(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Product Assignment */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Product Distribution</h4>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product._id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{product.title}</h5>
                          <button
                            onClick={() => addProduct(product)}
                            className="text-orange-500 hover:text-orange-700"
                          >
                            <FiPlus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        <div className="text-sm text-gray-500">
                          <p>Price: ${product.price}</p>
                          <p>Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Products Configuration */}
              {selectedProducts.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Product Configuration</h4>
                  <div className="space-y-3">
                    {selectedProducts.map((selectedProduct) => {
                      const product = products.find(p => p._id === selectedProduct.productId);
                      return (
                        <div key={selectedProduct.productId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium text-gray-900">{product?.title}</h5>
                            <button
                              onClick={() => removeProduct(selectedProduct.productId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dealer Price
                              </label>
                              <input
                                type="number"
                                value={selectedProduct.dealerPrice}
                                onChange={(e) => updateProductPrice(selectedProduct.productId, parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commission Margin (%)
                              </label>
                              <input
                                type="number"
                                value={selectedProduct.commissionMargin}
                                onChange={(e) => updateProductCommission(selectedProduct.productId, parseFloat(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Stock Limit
                              </label>
                              <input
                                type="number"
                                value={selectedProduct.maxStockLimit || ''}
                                onChange={(e) => {
                                  const newProducts = selectedProducts.map(p => 
                                    p.productId === selectedProduct.productId 
                                      ? { ...p, maxStockLimit: parseInt(e.target.value) || undefined }
                                      : p
                                  );
                                  setSelectedProducts(newProducts);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Global Settings */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Contract Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Global Commission Margin (%)
                    </label>
                    <input
                      type="number"
                      value={globalCommissionMargin}
                      onChange={(e) => setGlobalCommissionMargin(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Expiry Date
                    </label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDealer}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Add to Network
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerHierarchy; 