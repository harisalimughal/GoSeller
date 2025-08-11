import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiX, FiCheck, FiInfo } from 'react-icons/fi';
import { productsAPI } from '../services/api';

interface ProductData {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  subcategory?: string;
  sellerId: string;
  brand: string;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags?: string[];
  specifications?: Array<{
    name: string;
    value: string;
  }>;
  variants?: Array<{
    name: string;
    options: string[];
  }>;
  images?: File[];
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  subcategory?: string;
  brand: string;
  sku: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  specifications: Array<{
    name: string;
    value: string;
  }>;
  variants: Array<{
    name: string;
    options: string[];
  }>;
  images: string[];
  status: string;
  rating: {
    average: number;
    count: number;
  };
  sales: number;
  SQL_level: string;
  isActive: boolean;
}

// Utility function to check seller authentication
const checkSellerAuth = (): { sellerId: string | null; isAuthenticated: boolean } => {
  try {
    const token = localStorage.getItem('sellerToken');
    if (!token) {
      return { sellerId: null, isAuthenticated: false };
    }
    
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem('sellerToken');
      return { sellerId: null, isAuthenticated: false };
    }
    
    return { sellerId: payload.sellerId || null, isAuthenticated: true };
  } catch (error) {
    console.error('Error checking seller auth:', error);
    localStorage.removeItem('sellerToken');
    return { sellerId: null, isAuthenticated: false };
  }
};

// Global debug function for browser console
if (typeof window !== 'undefined') {
  (window as any).debugSellerAuth = () => {
    const auth = checkSellerAuth();
    console.log('Seller Auth Debug:', auth);
    console.log('Token:', localStorage.getItem('sellerToken'));
    console.log('Token Payload:', localStorage.getItem('sellerToken') ? JSON.parse(atob(localStorage.getItem('sellerToken')!.split('.')[1])) : 'No token');
    return auth;
  };
}

const EditProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId, sellerId: locationSellerId, product } = location.state || {};

  // Function to get sellerId from localStorage token
  const getSellerIdFromToken = (): string | null => {
    const { sellerId } = checkSellerAuth();
    return sellerId;
  };

  // Get sellerId from location state or localStorage
  const sellerId = locationSellerId || getSellerIdFromToken();

  // Debug logging
  console.log('EditProduct - location.state:', location.state);
  console.log('EditProduct - locationSellerId:', locationSellerId);
  console.log('EditProduct - sellerId from token:', getSellerIdFromToken());
  console.log('EditProduct - final sellerId:', sellerId);
  console.log('EditProduct - productId:', productId);

  const [formData, setFormData] = useState<ProductData>({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    stock: 0,
    category: '',
    subcategory: '',
    sellerId: sellerId || '',
    brand: '',
    sku: '',
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    tags: [],
    specifications: [],
    variants: [],
    images: []
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [specInput, setSpecInput] = useState({ name: '', value: '' });
  const [variantInput, setVariantInput] = useState({ name: '', options: [] as string[] });

  useEffect(() => {
    // Check for required parameters
    if (!productId) {
      console.error('Product ID is missing');
      alert('Product ID is missing. Please go back to the dashboard and try again.');
      navigate('/store-dashboard');
      return;
    }

    if (!sellerId) {
      console.error('Seller ID is missing');
      console.log('EditProduct - No sellerId found, redirecting to login');
      
      // Show debug information
      const { sellerId: authSellerId, isAuthenticated } = checkSellerAuth();
      console.log('EditProduct - Auth check:', { authSellerId, isAuthenticated });
      console.log('EditProduct - localStorage sellerToken:', localStorage.getItem('sellerToken'));
      
      alert('Authentication required. Please sign in to your seller account first.');
      navigate('/seller-login');
      return;
    }

    const loadProductData = async () => {
      try {
        console.log('Loading product with ID:', productId);
        const response = await productsAPI.getById(productId);
        console.log('Product API response:', response);
        const productData = response.product;
        console.log('Product data:', productData);
        
        // Ensure we get a string sellerId
        let finalSellerId = sellerId;
        if (productData.sellerId) {
          if (typeof productData.sellerId === 'object' && productData.sellerId.id) {
            finalSellerId = productData.sellerId.id;
          } else if (typeof productData.sellerId === 'string') {
            finalSellerId = productData.sellerId;
          }
        }
        
        setFormData({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          stock: productData.stock,
          category: productData.category,
          subcategory: productData.subcategory,
          sellerId: finalSellerId,
          brand: productData.brand,
          sku: productData.sku,
          weight: productData.weight,
          dimensions: productData.dimensions,
          tags: productData.tags,
          specifications: productData.specifications,
          variants: productData.variants,
          images: []
        });
        
        setExistingImages(productData.images);
      } catch (error: any) {
        console.error('Error loading product:', error);
        console.error('Error details:', error.response?.data);
        
        // Check if it's an authentication error
        if (error.response?.status === 401) {
          alert('Your session has expired. Please sign in again.');
          navigate('/seller-login');
        } else {
          alert('Failed to load product data. Please try again.');
          navigate('/store-dashboard');
        }
      }
    };

    loadProductData();
    loadCategories();
  }, [productId, sellerId, navigate]);

  const loadCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback categories
      setCategories(['Grocery', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Books', 'Automotive', 'Health', 'Other']);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'stock' || name === 'weight' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleDimensionChange = (dimension: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [dimension]: parseFloat(value) || 0
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const addSpecification = () => {
    if (specInput.name.trim() && specInput.value.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: [...(prev.specifications || []), { ...specInput }]
      }));
      setSpecInput({ name: '', value: '' });
    }
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== index) || []
    }));
  };

  const addVariant = () => {
    if (variantInput.name.trim() && variantInput.options.length > 0) {
      setFormData(prev => ({
        ...prev,
        variants: [...(prev.variants || []), { ...variantInput }]
      }));
      setVariantInput({ name: '', options: [] as string[] });
    }
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sellerId) {
      alert('Authentication required. Please sign in to your seller account first.');
      navigate('/seller-login');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create update data without sellerId since it shouldn't be changed
      const { sellerId: _, ...updateData } = formData;
      
      const finalUpdateData = {
        ...updateData,
        images: newImages.length > 0 ? newImages : undefined
      };

      const response = await productsAPI.update(productId, finalUpdateData);
      
      setIsSuccess(true);
      setSuccessData(response.product);
    } catch (error: any) {
      console.error('Error updating product:', error);
      const errorMessage = error.response?.data?.error?.message || 'Failed to update product. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessOK = () => {
    navigate('/store-dashboard', { state: { sellerId } });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Updated Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your product "{successData?.title}" has been updated and is now live in your store.
            </p>
            <button
              onClick={handleSuccessOK}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors w-full"
            >
              OK
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug Component - Remove this after fixing the issue */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-4">
          <strong>Debug Info:</strong>
          <br />
          Product ID: {productId || 'Missing'}
          <br />
          Seller ID: {sellerId || 'Missing'}
          <br />
          Auth Status: {JSON.stringify(checkSellerAuth())}
          <br />
          Token: {localStorage.getItem('sellerToken') ? 'Present' : 'Missing'}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = 'http://localhost:4000'}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Edit Product</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Original Price</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
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
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter SKU (e.g., NIKE-TSHIRT-RED-M)"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions (cm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    placeholder="Length"
                    value={formData.dimensions?.length || ''}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    step="0.01"
                    min="0"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Width"
                    value={formData.dimensions?.width || ''}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    step="0.01"
                    min="0"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="number"
                    placeholder="Height"
                    value={formData.dimensions?.height || ''}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    step="0.01"
                    min="0"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Upload New Images
                  </label>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB each</p>
                </div>

                {/* New Images Preview */}
                {newImages.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">New Images:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {newImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`New ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/store-dashboard', { state: { sellerId } })}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default EditProduct; 