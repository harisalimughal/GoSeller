"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { sellerAuthAPI } from '../services/api';
import { safeLocalStorage } from '@/utils/localStorage';

interface LoginForm {
  email: string;
  password: string;
}

const SellerLogin: React.FC = () => {
  console.log('🔐 SellerLogin: Component rendering');
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Check for existing session on component mount
  React.useEffect(() => {
    const checkExistingSession = () => {
      const token = safeLocalStorage.getItem('sellerToken');
      if (token) {
        console.log('🔐 SellerLogin: Found existing session, redirecting to dashboard');
        // Check if token is valid
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            console.log('🔐 SellerLogin: Token expired, clearing and staying on login page');
            safeLocalStorage.removeItem('sellerToken');
            return;
          }
          
          console.log('🔐 SellerLogin: Valid token found, redirecting to dashboard');
          router.push('/seller/store-dashboard');
        } catch (error) {
          console.log('🔐 SellerLogin: Invalid token, clearing and staying on login page');
          safeLocalStorage.removeItem('sellerToken');
        }
      }
    };

    checkExistingSession();
  }, [router]);

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 SellerLogin: Starting login process...');
    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔐 SellerLogin: Making API call...');
      const response = await sellerAuthAPI.login(formData);
      console.log('🔐 SellerLogin: Login successful, response:', response);
      
      // Store token
      safeLocalStorage.setItem('sellerToken', response.token);
      
      // Navigate to store dashboard
      console.log('🔐 SellerLogin: Navigating to store dashboard...');
      // Store additional data in localStorage since Next.js doesn't support state in router.push
      safeLocalStorage.setItem('sellerId', response.seller.id);
      safeLocalStorage.setItem('sqlLevel', response.seller.sqlLevel);
      router.push('/seller/store-dashboard');
    } catch (error: any) {
      console.error('🔐 SellerLogin: Login failed:', error);
      console.log('🔐 SellerLogin: Error response structure:', {
        response: error.response,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle different error response structures
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.log('🔐 SellerLogin: Setting error message:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GoSeller</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
                              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
                <Link href="/seller-registration" className="text-gray-600 hover:text-gray-900">Register</Link>
                <Link href="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8"
        >
          {/* Logo and Title */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">G</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your seller account</p>
          </div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>

            {/* Links */}
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/seller-registration"
                  className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  Register here
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                <Link
                  href="/forgot-password"
                  className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>
          </motion.form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerLogin; 