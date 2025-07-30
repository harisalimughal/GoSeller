import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import SellerDashboard from './pages/SellerDashboard';
import SellerRegistration from './pages/SellerRegistration';
import StoreDashboard from './pages/StoreDashboard';
import SQLVerification from './pages/SQLVerification';
import AddProduct from './pages/AddProduct';
import Layout from './components/Layout';
import './styles/HomePage.css';

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
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/seller-registration" element={<SellerRegistration />} />
            <Route path="/store-dashboard" element={<StoreDashboard />} />
            <Route path="/verification" element={<SQLVerification />} />
            <Route path="/add-product" element={<AddProduct />} />
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

export default App;
