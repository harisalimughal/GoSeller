"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiUpload,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { sellerRegistrationAPI } from '../services/api';

interface RegistrationForm {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Business Information
  businessName: string;
  businessType: string;
  businessLicense: string;
  businessAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Seller Category Information
  sellerCategory: 'Company' | 'Dealer' | 'Wholesaler' | 'Trader' | 'Storekeeper';
  parentCompanyId?: string;
  distributionArea: 'National' | 'Regional' | 'Zonal' | 'Local' | 'Area-specific';
  authorizedTerritories: string;
  
  // Store Details
  storeDescription: string;
  storeCategory: string;
  storeLogo: File | null;
  storeBanner: File | null;
  businessDocuments: File[];
  
  // SQL Quality Level
  sqlLevel: 'Free' | 'Basic' | 'Normal' | 'High' | 'VIP';
  
  // Verification Status
  pssVerified: boolean;
  edrVerified: boolean;
  emoVerified: boolean;
}

const SellerRegistration: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ sellerId: string; sqlLevel: string } | null>(null);
  const [formData, setFormData] = useState<RegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    businessLicense: '',
    businessAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    sellerCategory: 'Storekeeper',
    distributionArea: 'Local',
    authorizedTerritories: '',
    storeDescription: '',
    storeCategory: '',
    storeLogo: null,
    storeBanner: null,
    businessDocuments: [],
    sqlLevel: 'Free',
    pssVerified: false,
    edrVerified: false,
    emoVerified: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessTypes = [
    'Electronics',
    'Fashion & Apparel',
    'Home & Garden',
    'Sports & Outdoors',
    'Beauty & Health',
    'Books & Media',
    'Toys & Games',
    'Automotive',
    'Food & Beverages',
    'Jewelry & Accessories',
    'Other'
  ];

  const storeCategories = [
    'Electronics Store',
    'Fashion Boutique',
    'Home & Lifestyle',
    'Sports Equipment',
    'Beauty & Cosmetics',
    'Bookstore',
    'Toy Store',
    'Auto Parts',
    'Grocery Store',
    'Jewelry Store',
    'General Store',
    'Specialty Store'
  ];

  const sellerCategories = [
    {
      name: 'Company',
      description: 'Manufacturers or official product owners who produce goods under their own brand.',
      keyFeatures: [
        'Can monitor all downstream supply chain',
        'Highest level of product control',
        'Can register dealers, wholesalers, etc.'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Full'
      }
    },
    {
      name: 'Dealer',
      description: 'Direct representatives of the manufacturing company or major stockists.',
      keyFeatures: [
        'Works directly under company',
        'Can manage multiple wholesalers',
        'Handles regional distribution'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Regional'
      }
    },
    {
      name: 'Wholesaler',
      description: 'Buys products in bulk from dealers or companies and sells to traders.',
      keyFeatures: [
        'Mid-level distributor',
        'Manages stock and pricing',
        'May serve multiple areas'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Zonal'
      }
    },
    {
      name: 'Trader',
      description: 'Purchases from wholesalers and supplies to local shops.',
      keyFeatures: [
        'Works on local demand',
        'Can manage small product quantities',
        'Often limited by region'
      ],
      capabilities: {
        productListing: true,
        priceControl: true,
        orderHandling: false,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: true,
        bulkOrderTools: true,
        dashboardRoleAccess: 'Local'
      }
    },
    {
      name: 'Storekeeper',
      description: 'Final seller to customers through GoSellr platform.',
      keyFeatures: [
        'Registers store on GoSellr',
        'Manages orders, deliveries, and customer complaints',
        'Can be verified under SQL levels (Free → VIP)'
      ],
      capabilities: {
        productListing: true,
        priceControl: false,
        orderHandling: true,
        franchiseIncomeContribution: true,
        supplyChainFlowMonitoring: false,
        bulkOrderTools: false,
        dashboardRoleAccess: 'Area-wise'
      }
    }
  ];

  const distributionAreas = [
    { value: 'National', label: 'National' },
    { value: 'Regional', label: 'Regional' },
    { value: 'Zonal', label: 'Zonal' },
    { value: 'Local', label: 'Local' },
    { value: 'Area-specific', label: 'Area-specific' }
  ];

  const handleInputChange = (field: keyof RegistrationForm, value: string | File | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (field: 'storeLogo' | 'storeBanner' | 'businessDocuments', file: File | File[]) => {
    if (field === 'businessDocuments') {
      const files = Array.isArray(file) ? file : [file];
      setFormData(prev => ({
        ...prev,
        businessDocuments: [...prev.businessDocuments, ...files]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      businessDocuments: prev.businessDocuments.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2:
        if (!formData.sellerCategory) newErrors.sellerCategory = 'Seller category is required';
        break;

      case 3:
        if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.businessLicense.trim()) newErrors.businessLicense = 'Business license is required';
        if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Business address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        break;

      case 4:
        if (!formData.storeDescription.trim()) newErrors.storeDescription = 'Store description is required';
        if (!formData.storeCategory) newErrors.storeCategory = 'Store category is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const response = await sellerRegistrationAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        businessName: formData.businessName,
        businessType: formData.businessType,
        businessLicense: formData.businessLicense,
        businessAddress: formData.businessAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        sellerCategory: formData.sellerCategory,
        distributionArea: formData.distributionArea,
        authorizedTerritories: formData.authorizedTerritories,
        parentCompanyId: formData.parentCompanyId,
        storeDescription: formData.storeDescription,
        storeCategory: formData.storeCategory,
        storeLogo: formData.storeLogo || undefined,
        storeBanner: formData.storeBanner || undefined,
        businessDocuments: formData.businessDocuments
      });

      // Set success state and data
      setSuccessData({
        sellerId: response.seller.id,
        sqlLevel: response.seller.sqlLevel
      });
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrors({
        submit: error.response?.data?.error?.message || error.response?.data?.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    if (successData) {
      router.push('/store-dashboard');
    }
  };

  // Success Message Component
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
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
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6"
            >
              <FiCheckCircle className="w-10 h-10 text-white" />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Registration Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to GoSeller! Your seller account has been created successfully. 
                You can now start managing your store and listing your products.
              </p>

              {/* Account Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-800 mb-2">Account Details</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p><span className="font-medium">Business Name:</span> {formData.businessName}</p>
                  <p><span className="font-medium">Email:</span> {formData.email}</p>
                  <p><span className="font-medium">Seller Category:</span> {formData.sellerCategory}</p>
                  <p className="flex items-center">
                    <span className="font-medium">SQL Level:</span> 
                    <span className="ml-1">{successData?.sqlLevel || 'Free'}</span>
                    {successData?.sqlLevel && successData.sqlLevel !== 'Free' && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoToDashboard}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <FiArrowRight className="w-5 h-5" />
                </motion.button>

                <Link
                  href="/seller-login"
                  className="block w-full bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Sign In to Your Account
                </Link>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 space-y-2">
                <p>
                  💡 <strong>Next Steps:</strong> Complete your profile, add products, and start selling!
                </p>
                <p>
                  📧 Check your email for verification and welcome instructions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Personal Information', description: 'Your basic details' },
    { number: 2, title: 'Seller Category', description: 'Choose your role' },
    { number: 3, title: 'Business Information', description: 'Your business details' },
    { number: 4, title: 'Store Setup', description: 'Configure your store' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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
              <Link href="/seller-dashboard" className="text-gray-600 hover:text-gray-900">Seller Dashboard</Link>
              <Link href="/seller-login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
              <Link href="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.number ? (
                    <FiCheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{step.number}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className={`text-sm font-semibold ${
                  currentStep >= step.number ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md p-8"
        >
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4 text-gray-500" /> : <FiEye className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? <FiEyeOff className="w-4 h-4 text-gray-500" /> : <FiEye className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Seller Category Selection</h2>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Choose your role in the supply chain. This will determine your capabilities and access levels.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {sellerCategories.map((category) => (
                  <div
                    key={category.name}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.sellerCategory === category.name
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('sellerCategory', category.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      {formData.sellerCategory === category.name && (
                        <FiCheckCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Key Features:</h4>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {category.keyFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-500 mr-1">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Capabilities:</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <div className={`p-1 rounded ${category.capabilities.productListing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          Product Listing
                        </div>
                        <div className={`p-1 rounded ${category.capabilities.priceControl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          Price Control
                        </div>
                        <div className={`p-1 rounded ${category.capabilities.orderHandling ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          Order Handling
                        </div>
                        <div className={`p-1 rounded ${category.capabilities.bulkOrderTools ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          Bulk Tools
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.sellerCategory !== 'Company' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distribution Area
                    </label>
                    <select
                      value={formData.distributionArea}
                      onChange={(e) => handleInputChange('distributionArea', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {distributionAreas.map((area) => (
                        <option key={area.value} value={area.value}>{area.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Authorized Territories (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.authorizedTerritories}
                      onChange={(e) => handleInputChange('authorizedTerritories', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="e.g., Karachi, Lahore, Islamabad"
                    />
                  </div>
                </div>
              )}

              {errors.sellerCategory && (
                <p className="text-red-500 text-sm mt-1">{errors.sellerCategory}</p>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.businessName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your business name"
                  />
                  {errors.businessName && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.businessType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.businessType && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business License Number *
                  </label>
                  <input
                    type="text"
                    value={formData.businessLicense}
                    onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.businessLicense ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter business license number"
                  />
                  {errors.businessLicense && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessLicense}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address *
                  </label>
                  <textarea
                    value={formData.businessAddress}
                    onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.businessAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter complete business address"
                  />
                  {errors.businessAddress && (
                    <p className="text-red-500 text-sm mt-1">{errors.businessAddress}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter state/province"
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.zipCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter ZIP/postal code"
                  />
                  {errors.zipCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter country"
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Store Setup</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Category *
                  </label>
                  <select
                    value={formData.storeCategory}
                    onChange={(e) => handleInputChange('storeCategory', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.storeCategory ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select store category</option>
                    {storeCategories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.storeCategory && (
                    <p className="text-red-500 text-sm mt-1">{errors.storeCategory}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('storeLogo', file);
                      }}
                      className="hidden"
                      id="storeLogo"
                    />
                    <label htmlFor="storeLogo" className="cursor-pointer">
                      <span className="text-orange-500 font-medium">Upload Logo</span>
                      <span className="text-gray-500 text-sm block">PNG, JPG up to 5MB</span>
                    </label>
                  </div>
                  {formData.storeLogo && (
                    <p className="text-green-600 text-sm mt-1">✓ {formData.storeLogo.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Description *
                  </label>
                  <textarea
                    value={formData.storeDescription}
                    onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.storeDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your store, products, and what makes you unique..."
                  />
                  {errors.storeDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.storeDescription}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Banner
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload('storeBanner', file);
                      }}
                      className="hidden"
                      id="storeBanner"
                    />
                    <label htmlFor="storeBanner" className="cursor-pointer">
                      <span className="text-orange-500 font-medium">Upload Banner</span>
                      <span className="text-gray-500 text-sm block">PNG, JPG up to 5MB</span>
                    </label>
                  </div>
                  {formData.storeBanner && (
                    <p className="text-green-600 text-sm mt-1">✓ {formData.storeBanner.name}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Documents
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) handleFileUpload('businessDocuments', files);
                      }}
                      className="hidden"
                      id="businessDocuments"
                    />
                    <label htmlFor="businessDocuments" className="cursor-pointer">
                      <span className="text-orange-500 font-medium">Upload Documents</span>
                      <span className="text-gray-500 text-sm block">Images, PDF up to 5MB each</span>
                    </label>
                  </div>
                  {formData.businessDocuments.length > 0 && (
                    <div className="mt-2">
                      {formData.businessDocuments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-1">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SQL Quality Level Info */}
                <div className="md:col-span-2">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FiShield className="w-5 h-5 text-orange-500 mr-2" />
                      <h3 className="text-lg font-semibold text-orange-800">SQL Quality Level</h3>
                    </div>
                    <p className="text-orange-700 text-sm mb-3">
                      Your store will start at <strong>Free</strong> level. You can upgrade through our verification system.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-semibold">Free</div>
                        <div className="text-gray-600">3 products</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border relative">
                        <div className="font-semibold">Basic</div>
                        <div className="text-gray-600">10 products</div>
                        <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <div className="text-center p-2 bg-white rounded border relative">
                        <div className="font-semibold">Normal</div>
                        <div className="text-gray-600">50 products</div>
                        <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <div className="text-center p-2 bg-white rounded border relative">
                        <div className="font-semibold">High</div>
                        <div className="text-gray-600">Unlimited</div>
                        <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <div className="text-center p-2 bg-white rounded border relative">
                        <div className="font-semibold">VIP</div>
                        <div className="text-gray-600">Top ranking</div>
                        <span className="absolute -top-1 -right-1 px-1 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Coming Soon
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg border ${
                currentStep === 1
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Store...
                </>
              ) : (
                <>
                  {currentStep === 4 ? 'Create Store' : 'Next'}
                  <FiArrowRight className="ml-2" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SellerRegistration; 