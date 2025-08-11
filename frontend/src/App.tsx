import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import MainDashboard from './pages/MainDashboard';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import SellerDashboard from './pages/SellerDashboard';
import SellerRegistration from './pages/SellerRegistration';
import SellerLogin from './pages/SellerLogin';
import StoreDashboard from './pages/StoreDashboard';
import SellerHierarchy from './pages/SellerHierarchy';
import DealerHierarchy from './pages/DealerHierarchy';
import WholesalerHierarchy from './pages/WholesalerHierarchy';
import TraderHierarchy from './pages/TraderHierarchy';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import SQLVerification from './pages/SQLVerification';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import './styles/HomePage.css';

// Wrapper components for hierarchy pages
const SellerHierarchyWrapper = () => {
  const { companyId } = useParams();
  return companyId ? <SellerHierarchy companyId={companyId} /> : <Navigate to="/" />;
};

const DealerHierarchyWrapper = () => {
  const { dealerId } = useParams();
  return dealerId ? <DealerHierarchy dealerId={dealerId} /> : <Navigate to="/" />;
};

const WholesalerHierarchyWrapper = () => {
  const { wholesalerId } = useParams();
  return wholesalerId ? <WholesalerHierarchy wholesalerId={wholesalerId} /> : <Navigate to="/" />;
};

const TraderHierarchyWrapper = () => {
  const { traderId } = useParams();
  return traderId ? <TraderHierarchy traderId={traderId} /> : <Navigate to="/" />;
};

function App() {
  console.log('🚀 App component rendering - Current pathname:', window.location.pathname);
  console.log('🚀 App component rendering - Current URL:', window.location.href);
  console.log('🚀 App component rendering - User agent:', navigator.userAgent);
  
  return (
    <AuthProvider>
      <CartProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/products" element={<MainDashboard />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
                    <Route path="/seller-registration" element={<SellerRegistration />} />
        <Route path="/seller-login" element={<SellerLogin />} />
        <Route path="/seller-hierarchy/:companyId" element={<SellerHierarchyWrapper />} />
        <Route path="/dealer-hierarchy/:dealerId" element={<DealerHierarchyWrapper />} />
        <Route path="/wholesaler-hierarchy/:wholesalerId" element={<WholesalerHierarchyWrapper />} />
        <Route path="/trader-hierarchy/:traderId" element={<TraderHierarchyWrapper />} />
            <Route path="/store-dashboard" element={
              <SellerProtectedRoute>
                <StoreDashboard />
              </SellerProtectedRoute>
            } />
            <Route path="/verification" element={<SQLVerification />} />
            <Route path="/add-product" element={
              <SellerProtectedRoute>
                <AddProduct />
              </SellerProtectedRoute>
            } />
            <Route path="/edit-product" element={
              <SellerProtectedRoute>
                <EditProduct />
              </SellerProtectedRoute>
            } />
            <Route path="/test" element={<div style={{padding: '20px', fontSize: '24px', color: 'green'}}>✅ Test route is working! Current URL: {window.location.href}</div>} />
            <Route path="/products" element={
              // <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              // </ProtectedRoute>
            } />
            <Route path="/orders" element={
              //<ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              //</ProtectedRoute>
            } />
            <Route path="/customers" element={
              // <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              // </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              //<ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              //</ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Seller Protected Route Component
interface SellerProtectedRouteProps {
  children: React.ReactNode;
}

const SellerProtectedRoute: React.FC<SellerProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('sellerToken');

  if (!token) {
    return <Navigate to="/seller-login" replace />;
  }

  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem('sellerToken');
      return <Navigate to="/seller-login" replace />;
    }
  } catch (error) {
    localStorage.removeItem('sellerToken');
    return <Navigate to="/seller-login" replace />;
  }

  return <>{children}</>;
};

export default App;
