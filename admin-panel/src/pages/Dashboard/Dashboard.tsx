import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Star,
  AlertTriangle,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Settings,
  Eye,
  ShoppingCart,
  CreditCard,
  UserCheck,
  Package2,
  MessageSquare,
  Zap,
  Globe,
  Smartphone,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Heart
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsAPI, ordersAPI, productsAPI, usersAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

// Types
interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface TopProduct {
  _id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard Stats Query
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: () => analyticsAPI.getDashboard({ period: dateRange }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Recent Orders Query
  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => ordersAPI.getAll({ limit: 5, sort: '-createdAt' }),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Top Products Query
  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['top-products', dateRange],
    queryFn: () => analyticsAPI.getTopProducts({ period: dateRange, limit: 5 }),
  });

  // Sales Data Query
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', dateRange],
    queryFn: () => analyticsAPI.getSales({ period: dateRange }),
  });

  // Order Status Distribution Query
  const { data: orderStatusData } = useQuery({
    queryKey: ['order-status', dateRange],
    queryFn: () => analyticsAPI.getOrders({ period: dateRange }),
  });

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchStats(),
      ]);
      toast.success('Dashboard refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setRefreshing(false);
    }
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Sample data for demo (replace with real data from API)
  const sampleSalesData = [
    { date: '2024-01-01', revenue: 12000, orders: 45 },
    { date: '2024-01-02', revenue: 15000, orders: 52 },
    { date: '2024-01-03', revenue: 18000, orders: 61 },
    { date: '2024-01-04', revenue: 14000, orders: 48 },
    { date: '2024-01-05', revenue: 22000, orders: 73 },
    { date: '2024-01-06', revenue: 25000, orders: 82 },
    { date: '2024-01-07', revenue: 28000, orders: 95 },
  ];

  const sampleOrderStatus = [
    { name: 'Pending', value: 15, color: '#F59E0B' },
    { name: 'Processing', value: 25, color: '#3B82F6' },
    { name: 'Shipped', value: 30, color: '#06B6D4' },
    { name: 'Delivered', value: 120, color: '#10B981' },
    { name: 'Cancelled', value: 8, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {user?.firstName}! Here's what's happening with your store.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${statsLoading ? '...' : (stats?.data?.totalRevenue || 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">
                    +{stats?.data?.revenueGrowth || 12.5}%
                  </span>
                  <span className="text-gray-500 text-sm ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? '...' : (stats?.data?.totalOrders || 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">
                    +{stats?.data?.ordersGrowth || 8.2}%
                  </span>
                  <span className="text-gray-500 text-sm ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? '...' : (stats?.data?.totalCustomers || 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">
                    +{stats?.data?.customersGrowth || 15.3}%
                  </span>
                  <span className="text-gray-500 text-sm ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? '...' : (stats?.data?.totalProducts || 0).toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">
                    +{stats?.data?.productsGrowth || 5.7}%
                  </span>
                  <span className="text-gray-500 text-sm ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Overview Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Overview</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Orders</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={salesData?.data || sampleSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Order Status</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={orderStatusData?.data || sampleOrderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(orderStatusData?.data || sampleOrderStatus).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {(orderStatusData?.data || sampleOrderStatus).map((entry, index) => (
                  <div key={entry.name} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                (recentOrders?.data?.docs || []).map((order: RecentOrder) => (
                  <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Products</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {productsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                (topProducts?.data || []).map((product: TopProduct, index: number) => (
                  <div key={product._id} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Package2 className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <span className="absolute -top-2 -left-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {product.sales} sales
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${product.revenue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <button className="flex flex-col items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Add Product</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Add Customer</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-colors">
                <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Create Coupon</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors group">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/60 transition-colors">
                <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">View Analytics</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/60 transition-colors">
                <MessageSquare className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Manage Reviews</span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors group">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/60 transition-colors">
                <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
