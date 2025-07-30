import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiDollarSign,
  FiImage,
  FiTruck,
  FiTag,
  FiSave,
  FiX,
  FiPlus,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';
import ProductForm from '../components/ProductForm';

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
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  images: File[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  shippingInfo: {
    weight: number;
    dimensions: string;
    shippingClass: string;
  };
  variants: ProductVariant[];
  specifications: ProductSpecification[];
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
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
    shippingInfo: {
      weight: 0,
      dimensions: '',
      shippingClass: 'standard'
    },
    variants: [],
    specifications: []
  });

  const [newVariant, setNewVariant] = useState({ name: '', options: [''], values: [] });
  const [newSpecification, setNewSpecification] = useState({ name: '', value: '' });

  const categories = [
    'Electronics',
    'Fashion & Apparel',
    'Home & Garden',
    'Sports & Outdoors',
    'Beauty & Health',
    'Books & Media',
    'Toys & Games',
    'Automotive',
    'Food & Beverages',
    'Jewelry & Accessories'
  ];

  const subcategories = {
    'Electronics': ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Cameras'],
    'Fashion & Apparel': ['Men', 'Women', 'Kids', 'Shoes', 'Bags', 'Jewelry'],
    'Home & Garden': ['Furniture', 'Decor', 'Kitchen', 'Garden', 'Tools', 'Lighting'],
    'Sports & Outdoors': ['Fitness', 'Outdoor', 'Team Sports', 'Water Sports', 'Camping'],
    'Beauty & Health': ['Skincare', 'Makeup', 'Hair Care', 'Fragrances', 'Health'],
    'Books & Media': ['Books', 'Movies', 'Music', 'Games', 'Magazines'],
    'Toys & Games': ['Educational', 'Action Figures', 'Board Games', 'Puzzles', 'Arts & Crafts'],
    'Automotive': ['Car Parts', 'Accessories', 'Tools', 'Maintenance', 'Electronics'],
    'Food & Beverages': ['Snacks', 'Beverages', 'Organic', 'Gourmet', 'Supplements'],
    'Jewelry & Accessories': ['Necklaces', 'Rings', 'Earrings', 'Watches', 'Bracelets']
  };

  const shippingClasses = [
    'standard',
    'express',
    'premium',
    'economy'
  ];

  const handleInputChange = (field: keyof ProductData, value: any) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.options[0]) {
      setProductData(prev => ({
        ...prev,
        variants: [...prev.variants, { ...newVariant, id: Date.now().toString(), values: [] }]
      }));
      setNewVariant({ name: '', options: [''], values: [] });
    }
  };

  const removeVariant = (index: number) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
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

  const handleSubmit = async (formData: any) => {
    try {
      console.log('Submitting product data:', formData);
      // Here you would send the data to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate back to store dashboard
      navigate('/store-dashboard');
    } catch (error) {
      console.error('Product creation failed:', error);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Information', icon: FiPackage },
    { id: 2, title: 'Pricing & Inventory', icon: FiDollarSign },
    { id: 3, title: 'Images & Media', icon: FiImage },
    { id: 4, title: 'Variants & Options', icon: FiTag },
    { id: 5, title: 'Shipping & Fulfillment', icon: FiTruck }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GoSeller</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/store-dashboard" className="text-gray-600 hover:text-gray-900">Store Dashboard</Link>
              <Link to="/products" className="text-gray-600 hover:text-gray-900">Products</Link>
              <Link to="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new product listing for your store</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <FiPlus className="mr-2" />
                Quick Add
              </button>
              <Link
                to="/store-dashboard"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-orange-500 border-orange-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <FiCheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    currentStep > step.id ? 'bg-orange-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <div className={`text-sm font-semibold ${
                  currentStep >= step.id ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
                  
                  <div className="space-y-6">
                    <div>
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={productData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Describe your product in detail..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={productData.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subcategory
                        </label>
                        <select
                          value={productData.subcategory}
                          onChange={(e) => handleInputChange('subcategory', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          disabled={!productData.category}
                        >
                          <option value="">Select subcategory</option>
                          {productData.category && subcategories[productData.category as keyof typeof subcategories]?.map((subcategory) => (
                            <option key={subcategory} value={subcategory}>{subcategory}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU *
                        </label>
                        <input
                          type="text"
                          value={productData.sku}
                          onChange={(e) => handleInputChange('sku', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Enter SKU"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing & Inventory</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={productData.price}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Compare Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={productData.comparePrice}
                            onChange={(e) => handleInputChange('comparePrice', parseFloat(e.target.value) || 0)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

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

                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={productData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={productData.isFeatured}
                          onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Featured</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Images & Media</h2>
                  
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="productImages"
                      />
                      <label htmlFor="productImages" className="cursor-pointer">
                        <span className="text-orange-500 font-medium text-lg">Upload Product Images</span>
                        <span className="text-gray-500 text-sm block mt-2">PNG, JPG up to 5MB each</span>
                      </label>
                    </div>

                    {productData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {productData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => {
                                setProductData(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== index)
                                }));
                              }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Variants & Options</h2>
                  
                  <div className="space-y-6">
                    {/* Product Variants */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Variants</h3>
                      <div className="space-y-4">
                        {productData.variants.map((variant, index) => (
                          <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="Variant name (e.g., Size, Color)"
                              />
                              <button
                                onClick={() => removeVariant(index)}
                                className="ml-2 text-red-500 hover:text-red-700"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {variant.options.map((option, optionIndex) => (
                                <input
                                  key={optionIndex}
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...variant.options];
                                    newOptions[optionIndex] = e.target.value;
                                    handleVariantChange(index, 'options', newOptions);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                  placeholder="Option value"
                                />
                              ))}
                              <button
                                onClick={() => {
                                  handleVariantChange(index, 'options', [...variant.options, '']);
                                }}
                                className="text-orange-500 hover:text-orange-700 text-sm"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={newVariant.name}
                                                         onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value, values: [] }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Variant name"
                          />
                          <input
                            type="text"
                            value={newVariant.options[0]}
                                                         onChange={(e) => setNewVariant(prev => ({ ...prev, options: [e.target.value], values: [] }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Option value"
                          />
                        </div>
                        <button
                          onClick={addVariant}
                          className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Add Variant
                        </button>
                      </div>
                    </div>

                    {/* Product Specifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
                      <div className="space-y-4">
                        {productData.specifications.map((spec, index) => (
                          <div key={index} className="flex items-center space-x-4">
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => {
                                const newSpecs = [...productData.specifications];
                                newSpecs[index].name = e.target.value;
                                handleInputChange('specifications', newSpecs);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Specification name"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => {
                                const newSpecs = [...productData.specifications];
                                newSpecs[index].value = e.target.value;
                                handleInputChange('specifications', newSpecs);
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                              placeholder="Specification value"
                            />
                            <button
                              onClick={() => removeSpecification(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-4">
                        <input
                          type="text"
                          value={newSpecification.name}
                          onChange={(e) => setNewSpecification(prev => ({ ...prev, name: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Specification name"
                        />
                        <input
                          type="text"
                          value={newSpecification.value}
                          onChange={(e) => setNewSpecification(prev => ({ ...prev, value: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Specification value"
                        />
                        <button
                          onClick={addSpecification}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping & Fulfillment</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (lbs)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={productData.shippingInfo.weight}
                          onChange={(e) => handleInputChange('shippingInfo', {
                            ...productData.shippingInfo,
                            weight: parseFloat(e.target.value) || 0
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shipping Class
                        </label>
                        <select
                          value={productData.shippingInfo.shippingClass}
                          onChange={(e) => handleInputChange('shippingInfo', {
                            ...productData.shippingInfo,
                            shippingClass: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          {shippingClasses.map((shippingClass) => (
                            <option key={shippingClass} value={shippingClass}>
                              {shippingClass.charAt(0).toUpperCase() + shippingClass.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions (L x W x H inches)
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        <input
                          type="number"
                          step="0.01"
                          value={productData.dimensions.length}
                          onChange={(e) => handleInputChange('dimensions', {
                            ...productData.dimensions,
                            length: parseFloat(e.target.value) || 0
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Length"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={productData.dimensions.width}
                          onChange={(e) => handleInputChange('dimensions', {
                            ...productData.dimensions,
                            width: parseFloat(e.target.value) || 0
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Width"
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={productData.dimensions.height}
                          onChange={(e) => handleInputChange('dimensions', {
                            ...productData.dimensions,
                            height: parseFloat(e.target.value) || 0
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Height"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
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
                  onClick={() => {
                    if (currentStep < 5) {
                      setCurrentStep(currentStep + 1);
                    } else {
                      handleSubmit(productData);
                    }
                  }}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center"
                >
                  {currentStep === 5 ? 'Create Product' : 'Next'}
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Preview</h3>
              {productData.name ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    {productData.images.length > 0 ? (
                      <img
                        src={URL.createObjectURL(productData.images[0])}
                        alt={productData.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <FiImage className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{productData.name}</h4>
                    <p className="text-orange-600 font-bold">${productData.price.toFixed(2)}</p>
                    {productData.comparePrice > 0 && (
                      <p className="text-gray-500 line-through">${productData.comparePrice.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <FiPackage className="w-12 h-12 mx-auto mb-2" />
                  <p>Product preview will appear here</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
                >
                  <FiPlus className="mr-2" />
                  Quick Add
                </button>
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <FiSave className="mr-2" />
                  Save Draft
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FiAlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Tips for Better Listings</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use high-quality images</li>
                    <li>• Write detailed descriptions</li>
                    <li>• Set competitive prices</li>
                    <li>• Add relevant tags</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          mode="add"
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default AddProduct; 