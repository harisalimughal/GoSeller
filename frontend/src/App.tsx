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
import Layout from './components/Layout';
import './styles/HomePage.css';

function App() {
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
