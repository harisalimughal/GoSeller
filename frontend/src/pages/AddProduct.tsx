"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiDollarSign,
  FiTag,
  FiImage,
  FiSettings,
  FiArrowRight,
  FiPlus,
  FiX,
  FiInfo
} from 'react-icons/fi';
import { productsAPI, sellerRegistrationAPI } from '../services/api';
import { CATEGORIES } from '../config/categories';

interface ProductData {
  name: string;
  description: string;
  price: number;
  comparePrice: number;
  stock: number;
  category: string;
  subcategory: string;
  brand: string;
  sku: string;
  weight: number;
  dimensions: { length: number; width: number; height: number; };
  images: File[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  shippingInfo: { weight: number; dimensions: string; shippingClass: string; };
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  // Tiered Pricing for Company Sellers
  tieredPricing?: {
    dealerPrice: number;
    wholesalerPrice: number;
    storePrice: number;
    retailPrice: number;
  };
  // Enhanced Inventory Management
  inventory?: {
    availableStock: number;
    reservedStock: number;
    minimumStockLevel: number;
    reorderPoint: number;
    supplierInfo: {
      name: string;
      contact: string;
      leadTime: number;
    };
  };
}

interface ProductVariant {
  id: string;
  name: string;
  options: string[];
  values: string[];
}

interface ProductSpecification {
  name: string;
  value: string;
}

const AddProduct: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [sellerProfile, setSellerProfile] = useState<{
    sellerCategory: string;
    businessName: string;
  } | null>(null);
  const [isCompanySeller, setIsCompanySeller] = useState(false);
  
  // Function to get sellerId from localStorage token
  const getSellerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('sellerToken');
      if (!token) return null;
      
      // Simple JWT decode (for client-side, we only need the payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sellerId || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Get sellerId from localStorage token
  const sellerId = getSellerIdFromToken();
  
  // Debug log to help troubleshoot
  console.log('AddProduct - sellerId from token:', getSellerIdFromToken());
  console.log('AddProduct - final sellerId:', sellerId);

  // Function to fetch seller profile
  const fetchSellerProfile = async (sellerId: string) => {
    try {
      const response = await sellerRegistrationAPI.getProfile(sellerId);
      if (response && response.seller) {
        const profile = {
          sellerCategory: response.seller.sellerCategory || 'Storekeeper',
          businessName: response.seller.shopName || response.seller.businessName || 'My Store'
        };
        setSellerProfile(profile);
        setIsCompanySeller(profile.sellerCategory === 'Company');
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      // Set default values
      setSellerProfile({
        sellerCategory: 'Storekeeper',
        businessName: 'My Store'
      });
      setIsCompanySeller(false);
    }
  };

  // Check for sellerId and redirect if not found
  useEffect(() => {
    if (!sellerId) {
      console.log('No sellerId found, redirecting to login');
      router.push('/seller-login');
    } else {
      // Fetch seller profile when sellerId is available
      fetchSellerProfile(sellerId);
    }
  }, [sellerId, router]);

  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    stock: 0,
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    images: [],
    tags: [],
    isActive: true,
    isFeatured: false,
    shippingInfo: { weight: 0, dimensions: '', shippingClass: 'standard' },
    variants: [],
    specifications: [],
    // Initialize tiered pricing for Company sellers
    tieredPricing: {
      dealerPrice: 0,
      wholesalerPrice: 0,
      storePrice: 0,
      retailPrice: 0
    },
    // Initialize enhanced inventory management
    inventory: {
      availableStock: 0,
      reservedStock: 0,
      minimumStockLevel: 0,
      reorderPoint: 0,
      supplierInfo: {
        name: '',
        contact: '',
        leadTime: 0
      }
    }
  });

  const [newVariant, setNewVariant] = useState<ProductVariant>({
    id: '',
    name: '',
    options: [],
    values: []
  });

  const [newSpecification, setNewSpecification] = useState<ProductSpecification>({
    name: '',
    value: ''
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    // Load categories from API
    const loadCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        console.log('Categories loaded:', response.categories);
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Set default categories as fallback
        setCategories([...CATEGORIES]);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (field: keyof ProductData, value: any) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setProductData(prev => ({
        ...prev,
        images: [...prev.images, ...fileArray]
      }));
    }
  };

  const removeImage = (index: number) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !productData.tags.includes(newTag.trim())) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.options.length > 0) {
      setProductData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant, id: Date.now().toString() }]
      }));
      setNewVariant({ id: '', name: '', options: [], values: [] });
    }
  };

  const removeVariant = (id: string) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => v.id !== id)
    }));
  };

  const addSpecification = () => {
    if (newSpecification.name && newSpecification.value) {
      setProductData(prev => ({
        ...prev,
        specifications: [...prev.specifications, { ...newSpecification }]
      }));
      setNewSpecification({ name: '', value: '' });
    }
  };

  const removeSpecification = (index: number) => {
    setProductData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!sellerId) {
      alert('Authentication required. Please sign in to your seller account first.');
      router.push('/seller-login');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await productsAPI.create({
        title: productData.name,
        description: productData.description,
        price: productData.price,
        originalPrice: productData.comparePrice,
        stock: productData.stock,
        category: productData.category,
        subcategory: productData.subcategory,
        sellerId: sellerId,
        brand: productData.brand,
        sku: productData.sku,
        weight: productData.weight,
        dimensions: productData.dimensions,
        tags: productData.tags,
        specifications: productData.specifications,
        variants: productData.variants,
        images: productData.images,
        // Add tiered pricing for Company sellers
        tieredPricing: isCompanySeller ? JSON.stringify(productData.tieredPricing) : undefined,
        // Add enhanced inventory management for Company sellers
        inventory: isCompanySeller ? JSON.stringify(productData.inventory) : undefined
      });

      // Set success state and data
      setSuccessData(response.product);
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Failed to create product:', error);
      alert(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessOK = () => {
    router.push('/store-dashboard');
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Product details' },
    { number: 2, title: 'Pricing & Inventory', description: 'Price and stock' },
    { number: 3, title: 'Images & Media', description: 'Product images' },
    { number: 4, title: 'Variants & Specs', description: 'Product options' },
    { number: 5, title: 'Review & Publish', description: 'Final review' }
  ];

  // Success Message Component
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <FiPackage className="w-6 h-6 text-green-500" />
                <span className="text-xl font-bold text-gray-900">Product Created</span>
              </div>
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
              <FiPackage className="w-10 h-10 text-white" />
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Product Created Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your product has been successfully added to your store. 
                It's now pending approval and will be visible to customers once approved.
              </p>

              {/* Product Details */}
              {successData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-800 mb-2">Product Details</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><span className="font-medium">Name:</span> {successData.title}</p>
                    <p><span className="font-medium">Price:</span> ${successData.price}</p>
                    <p><span className="font-medium">Category:</span> {successData.category}</p>
                    <p><span className="font-medium">Status:</span> {successData.status}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSuccessOK}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>OK</span>
                <FiArrowRight className="w-5 h-5" />
              </motion.button>

              {/* Additional Info */}
              <div className="text-xs text-gray-500 space-y-2">
                <p>
                  💡 <strong>Next Steps:</strong> Add more products or manage your existing ones from the dashboard.
                </p>
                <p>
                  📧 You'll receive a notification once your product is approved.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <FiPackage className="w-6 h-6 text-orange-500" />
              <span className="text-xl font-bold text-gray-900">Add Product</span>
            </div>
            <button
              onClick={() => router.push('/store-dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              Back to Dashboard
            </button>
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
                    <FiPackage className="w-5 h-5" />
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Describe your product..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={productData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">{categories && categories.length > 0 ? 'Select category' : 'Loading categories...'}</option>
                    {categories && categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {(!categories || categories.length === 0) && (
                    <p className="text-sm text-gray-500 mt-1">Loading categories...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={productData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    SKU *
                    <div className="relative group">
                      <FiInfo className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                        <div className="font-medium mb-1">Stock Keeping Unit</div>
                        <div className="text-xs">
                          • Unique product identifier<br/>
                          • Format: BRAND-CATEGORY-SIZE-COLOR<br/>
                          • Example: NIKE-TSHIRT-RED-M<br/>
                          • Used for inventory tracking
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={productData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Enter SKU (e.g., NIKE-TSHIRT-RED-M)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productData.weight}
                    onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={productData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compare Price
                  </label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={productData.comparePrice}
                      onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Tiered Pricing for Company Sellers */}
                {isCompanySeller && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dealer Price
                      </label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={productData.tieredPricing?.dealerPrice || 0}
                          onChange={(e) => handleInputChange('tieredPricing', {
                            ...productData.tieredPricing,
                            dealerPrice: parseFloat(e.target.value) || 0
                          })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wholesaler Price
                      </label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={productData.tieredPricing?.wholesalerPrice || 0}
                          onChange={(e) => handleInputChange('tieredPricing', {
                            ...productData.tieredPricing,
                            wholesalerPrice: parseFloat(e.target.value) || 0
                          })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Store Price
                      </label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={productData.tieredPricing?.storePrice || 0}
                          onChange={(e) => handleInputChange('tieredPricing', {
                            ...productData.tieredPricing,
                            storePrice: parseFloat(e.target.value) || 0
                          })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Retail Price
                      </label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={productData.tieredPricing?.retailPrice || 0}
                          onChange={(e) => handleInputChange('tieredPricing', {
                            ...productData.tieredPricing,
                            retailPrice: parseFloat(e.target.value) || 0
                          })}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={productData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                  />
                </div>

                {/* Enhanced Inventory Management for Company Sellers */}
                {isCompanySeller && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Stock
                      </label>
                      <input
                        type="number"
                        value={productData.inventory?.availableStock || 0}
                        onChange={(e) => handleInputChange('inventory', {
                          ...productData.inventory,
                          availableStock: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reserved Stock
                      </label>
                      <input
                        type="number"
                        value={productData.inventory?.reservedStock || 0}
                        onChange={(e) => handleInputChange('inventory', {
                          ...productData.inventory,
                          reservedStock: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Stock Level
                      </label>
                      <input
                        type="number"
                        value={productData.inventory?.minimumStockLevel || 0}
                        onChange={(e) => handleInputChange('inventory', {
                          ...productData.inventory,
                          minimumStockLevel: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reorder Point
                      </label>
                      <input
                        type="number"
                        value={productData.inventory?.reorderPoint || 0}
                        onChange={(e) => handleInputChange('inventory', {
                          ...productData.inventory,
                          reorderPoint: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Name
                      </label>
                      <input
                        type="text"
                        value={productData.inventory?.supplierInfo?.name || ''}
                        onChange={(e) => handleInputChange('inventory', {
                          ...productData.inventory,
                          supplierInfo: {
                            ...productData.inventory?.supplierInfo,
                            name: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Supplier name"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Supplier Contact
                      </label>
                      <input
                        type="text"
                        value={productData.inventory?.supplierInfo?.contact || ''}
                        onChange={(e) => handleInputChange('inventory', {
                          ...productData.inventory,
                          supplierInfo: {
                            ...productData.inventory?.supplierInfo,
                            contact: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Supplier contact information"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Time (days)
                      </label>
                      <input
                        type="number"
                        value={productData.inventory?.supplierInfo?.leadTime || 0}
                        onChange={(e) => handleInputChange('inventory', {
                          ...productData.inventory,
                          supplierInfo: {
                            ...productData.inventory?.supplierInfo,
                            leadTime: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="0"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Add tag"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  {productData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {productData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-orange-600 hover:text-orange-800"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Images & Media</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Images *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FiImage className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="hidden"
                      id="productImages"
                    />
                    <label htmlFor="productImages" className="cursor-pointer">
                      <span className="text-orange-500 font-medium">Upload Images</span>
                      <span className="text-gray-500 text-sm block">PNG, JPG up to 5MB each</span>
                    </label>
                  </div>
                </div>

                {productData.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {productData.images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Variants & Specifications</h2>
              
              <div className="space-y-8">
                {/* Variants */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Variants</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={newVariant.name}
                        onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Variant name (e.g., Size, Color)"
                      />
                      <input
                        type="text"
                        value={newVariant.options.join(', ')}
                        onChange={(e) => setNewVariant(prev => ({ 
                          ...prev, 
                          options: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Options (e.g., S, M, L)"
                      />
                      <button
                        onClick={addVariant}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        Add Variant
                      </button>
                    </div>
                    
                    {productData.variants.length > 0 && (
                      <div className="space-y-2">
                        {productData.variants.map((variant) => (
                          <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{variant.name}:</span>
                              <span className="ml-2 text-gray-600">{variant.options.join(', ')}</span>
                            </div>
                            <button
                              onClick={() => removeVariant(variant.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Specifications</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={newSpecification.name}
                        onChange={(e) => setNewSpecification(prev => ({ ...prev, name: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Specification name"
                      />
                      <input
                        type="text"
                        value={newSpecification.value}
                        onChange={(e) => setNewSpecification(prev => ({ ...prev, value: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Specification value"
                      />
                      <button
                        onClick={addSpecification}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        Add Specification
                      </button>
                    </div>
                    
                    {productData.specifications.length > 0 && (
                      <div className="space-y-2">
                        {productData.specifications.map((spec, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium">{spec.name}:</span>
                              <span className="ml-2 text-gray-600">{spec.value}</span>
                            </div>
                            <button
                              onClick={() => removeSpecification(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Publish</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Product Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{productData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-medium">{productData.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="font-medium">${productData.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="font-medium">{productData.stock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Brand</p>
                      <p className="font-medium">{productData.brand}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">SKU</p>
                      <p className="font-medium">{productData.sku}</p>
                    </div>
                  </div>
                  
                  {productData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Images ({productData.images.length})</p>
                      <div className="grid grid-cols-4 gap-2">
                        {productData.images.map((file, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg border ${
                currentStep === 1
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                Next
                <FiArrowRight className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Product...
                  </>
                ) : (
                  <>
                    <FiPackage className="mr-2" />
                    Create Product
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProduct; 