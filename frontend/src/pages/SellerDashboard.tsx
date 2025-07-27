import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  BarChart3,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Award,
  Target,
  ShoppingCart,
  Eye,
  Heart,
  MessageSquare
} from 'lucide-react';

interface Seller {
  _id: string;
  businessName: string;
  businessType: string;
  status: string;
  rating: number;
  totalSales: number;
  totalOrders: number;
  sqlLevel: {
    current: number;
    experience: number;
    nextLevelExp: number;
    achievements: string[];
    badges: string[];
  };
  companySqlLevel: {
    current: number;
    experience: number;
    nextLevelExp: number;
    companyAchievements: string[];
    companyBadges: string[];
  };
  performance: {
    monthlySales: number;
    monthlyOrders: number;
    customerSatisfaction: number;
    deliveryTime: number;
    returnRate: number;
  };
  analytics: {
    totalViews: number;
    totalFavorites: number;
    conversionRate: number;
    averageOrderValue: number;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  rating: number;
  viewCount: number;
  isActive: boolean;
  images: string[];
}

const SellerDashboard: React.FC = () => {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSellerData();
    fetchProducts();
  }, []);

  const fetchSellerData = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success && data.data.seller) {
        setSeller(data.data.seller);
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/seller', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getSqlLevelProgress = (level: any) => {
    const progress = Math.round((level.experience / level.nextLevelExp) * 100);
    return Math.min(progress, 100);
  };

  const getBadgeIcon = (badge: string) => {
    const badgeIcons: { [key: string]: string } = {
      'new_seller': '🌟',
      'rising_star': '⭐',
      'trusted_seller': '🏆',
      'premium_seller': '💎',
      'expert_seller': '👑',
      'master_seller': '🎯',
      'legend_seller': '🔥',
      'divine_seller': '✨',
      'cosmic_seller': '🌌',
      'eternal_seller': '⚡'
    };
    return badgeIcons[badge] || '🏅';
  };

  const getCompanyBadgeIcon = (badge: string) => {
    const badgeIcons: { [key: string]: string } = {
      'startup': '🚀',
      'growing_business': '📈',
      'established_company': '🏢',
      'market_player': '🎮',
      'industry_leader': '👑',
      'premium_brand': '💎',
      'trusted_enterprise': '🏆',
      'global_company': '🌍',
      'innovative_leader': '💡',
      'legacy_company': '🏛️'
    };
    return badgeIcons[badge] || '🏅';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Seller Profile Not Found</h2>
          <p className="text-gray-600">Please complete your seller registration to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {seller.businessName}!
          </h1>
          <p className="text-gray-600">
            Manage your products, track your performance, and grow your business
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <Badge
            variant={seller.status === 'approved' ? 'default' : 'secondary'}
            className="text-sm"
          >
            {seller.status === 'approved' ? '✅ Active Seller' : '⏳ Pending Approval'}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sql-levels">SQL Levels</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${seller.totalSales.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +${seller.performance.monthlySales} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{seller.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    +{seller.performance.monthlyOrders} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{seller.rating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    {seller.performance.customerSatisfaction}% satisfaction
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Product Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{seller.analytics.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {seller.analytics.conversionRate}% conversion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* SQL Level Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Personal SQL Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level {seller.sqlLevel.current}</span>
                    <span className="text-sm text-muted-foreground">
                      {seller.sqlLevel.experience} / {seller.sqlLevel.nextLevelExp} XP
                    </span>
                  </div>
                  <Progress value={getSqlLevelProgress(seller.sqlLevel)} className="w-full" />
                  <div className="flex flex-wrap gap-2">
                    {seller.sqlLevel.badges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {getBadgeIcon(badge)} {badge.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Company SQL Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Level {seller.companySqlLevel.current}</span>
                    <span className="text-sm text-muted-foreground">
                      {seller.companySqlLevel.experience} / {seller.companySqlLevel.nextLevelExp} XP
                    </span>
                  </div>
                  <Progress value={getSqlLevelProgress(seller.companySqlLevel)} className="w-full" />
                  <div className="flex flex-wrap gap-2">
                    {seller.companySqlLevel.companyBadges.map((badge, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {getCompanyBadgeIcon(badge)} {badge.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Products</h2>
              <Button>Add New Product</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge
                      variant={product.isActive ? 'default' : 'secondary'}
                      className="absolute top-2 right-2"
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">${product.price}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Stock: {product.stock}</span>
                      <span>{product.viewCount} views</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Customer Satisfaction</span>
                    <span className="font-semibold">{seller.performance.customerSatisfaction}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Delivery Time</span>
                    <span className="font-semibold">{seller.performance.deliveryTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return Rate</span>
                    <span className="font-semibold">{seller.performance.returnRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Order Value</span>
                    <span className="font-semibold">${seller.analytics.averageOrderValue}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Views</span>
                    <span className="font-semibold">{seller.analytics.totalViews.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Favorites</span>
                    <span className="font-semibold">{seller.analytics.totalFavorites}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Rate</span>
                    <span className="font-semibold">{seller.analytics.conversionRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SQL Levels Tab */}
          <TabsContent value="sql-levels" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Personal SQL Level Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      Level {seller.sqlLevel.current}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {seller.sqlLevel.experience} / {seller.sqlLevel.nextLevelExp} Experience Points
                    </div>
                    <Progress value={getSqlLevelProgress(seller.sqlLevel)} className="w-full mb-4" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Achievements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {seller.sqlLevel.achievements.map((achievement, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          ✅ {achievement.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Company SQL Level Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      Level {seller.companySqlLevel.current}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {seller.companySqlLevel.experience} / {seller.companySqlLevel.nextLevelExp} Experience Points
                    </div>
                    <Progress value={getSqlLevelProgress(seller.companySqlLevel)} className="w-full mb-4" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Company Achievements:</h4>
                    <div className="flex flex-wrap gap-2">
                      {seller.companySqlLevel.companyAchievements.map((achievement, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          🏢 {achievement.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Personal Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {seller.sqlLevel.badges.map((badge, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="text-3xl mb-2">{getBadgeIcon(badge)}</div>
                        <div className="text-sm font-medium">{badge.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Company Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {seller.companySqlLevel.companyBadges.map((badge, index) => (
                      <div key={index} className="text-center p-4 border rounded-lg">
                        <div className="text-3xl mb-2">{getCompanyBadgeIcon(badge)}</div>
                        <div className="text-sm font-medium">{badge.replace('_', ' ')}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;
