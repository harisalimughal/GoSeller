import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUpload,
  FiFileText,
  FiArrowRight,
  FiInfo,
  FiX,
  FiAlertCircle,
  FiEye
} from 'react-icons/fi';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  icon: React.ReactNode;
  requirements: string[];
  documents?: string[];
  details?: string[];
}

interface SQLLevel {
  level: 'Free' | 'Basic' | 'Normal' | 'High' | 'VIP';
  productLimit: number;
  features: string[];
  requirements: string[];
  commission: number;
}

interface DocumentFile {
  file: File;
  preview: string;
  type: string;
}

interface DocumentSubmission {
  pss: DocumentFile | null;
  edr: DocumentFile | null;
  emo: DocumentFile | null;
  businessLicense: DocumentFile | null;
  cnic: DocumentFile | null;
  addressProof: DocumentFile | null;
  bankStatement: DocumentFile | null;
}

const SQLVerification: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState('pss');
  const [currentLevel] = useState<'Free' | 'Basic' | 'Normal' | 'High' | 'VIP'>('Free');
  const [targetLevel, setTargetLevel] = useState<'Basic' | 'Normal' | 'High' | 'VIP'>('Basic');
  const [documents, setDocuments] = useState<DocumentSubmission>({
    pss: null,
    edr: null,
    emo: null,
    businessLicense: null,
    cnic: null,
    addressProof: null,
    bankStatement: null
  });
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({
    pss: false,
    edr: false,
    emo: false
  });
  const [submitted, setSubmitted] = useState<{[key: string]: boolean}>({
    pss: false,
    edr: false,
    emo: false
  });
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    try {
      const sellerToken = localStorage.getItem('sellerToken');
      if (!sellerToken) return;

      const payload = JSON.parse(atob(sellerToken.split('.')[1]));
      const sellerId = payload.sellerId;

      const api = (await import('../services/api')).default;
      const response = await api.get(`/seller/verification-status/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${sellerToken}`
        }
      });

      if (response.data.success) {
        setVerificationStatus(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check seller authentication on component mount
  useEffect(() => {
    const checkSellerAuth = () => {
      const sellerToken = localStorage.getItem('sellerToken');
      if (!sellerToken) {
        setError('Please login with a seller account to access SQL verification.');
        // Redirect to seller login after a delay
        setTimeout(() => {
          navigate('/seller-login');
        }, 2000);
        return;
      }

      // Check if token is valid
      try {
        const payload = JSON.parse(atob(sellerToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem('sellerToken');
          setError('Session expired. Please login again.');
          setTimeout(() => {
            navigate('/seller-login');
          }, 2000);
        }
      } catch (error) {
        localStorage.removeItem('sellerToken');
        setError('Invalid session. Please login again.');
        setTimeout(() => {
          navigate('/seller-login');
        }, 2000);
      }
    };

    checkSellerAuth();
    fetchVerificationStatus();

    // Set up interval to refresh verification status every 30 seconds
    const interval = setInterval(fetchVerificationStatus, 30000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const getVerificationSteps = (): VerificationStep[] => {
    const getStepStatus = (stepId: string): 'pending' | 'in-progress' | 'completed' | 'failed' => {
      if (!verificationStatus?.serviceVerification) return 'pending';
      
      const verification = verificationStatus.serviceVerification[stepId];
      if (!verification) return 'pending';
      
      switch (verification.status) {
        case 'approved':
          return 'completed';
        case 'rejected':
          return 'failed';
        case 'pending':
          // If document is submitted but awaiting review
          return verification.submittedAt ? 'in-progress' : 'pending';
        default:
          return 'pending';
      }
    };

    return [
      {
        id: 'pss',
        title: 'PSS Verification',
        description: 'Personal Security System - ID and Document Verification',
        status: getStepStatus('pss'),
        icon: <FiShield />,
        details: [
          'Identity verification through government-issued ID',
          'Biometric verification',
          'Background check',
          'Criminal record verification',
          'Credit history check',
          'Employment verification',
          'Reference verification',
          'Social media verification'
        ],
        requirements: ['Valid government ID', 'Biometric data', 'Employment proof']
      },
      {
        id: 'edr',
        title: 'EDR Verification',
        description: 'Enhanced Due Diligence Review - Business Compliance & Records',
        status: getStepStatus('edr'),
        icon: <FiFileText />,
        details: [
          'Business registration verification',
          'Tax compliance check',
          'Financial record verification',
          'Regulatory compliance check',
          'Industry-specific certifications',
          'Audit trail verification',
          'Compliance documentation',
          'Legal standing verification'
        ],
        requirements: ['Business registration', 'Tax documents', 'Financial records']
      },
      {
        id: 'emo',
        title: 'EMO Verification',
        description: 'Enhanced Monitoring Operations - Real-time Business Assessment',
        status: getStepStatus('emo'),
        icon: <FiEye />,
        details: [
          'Real-time transaction monitoring',
          'Behavioral pattern analysis',
          'Risk assessment evaluation',
          'Compliance monitoring',
          'Performance tracking',
          'Quality assurance checks',
          'Inventory verification',
          'Business location verification',
          'Customer feedback analysis',
          'Market reputation check',
          'Location Verification',
          'Operational Assessment'
        ],
        requirements: ['Operational data', 'Transaction history', 'Location proof']
      }
    ];
  };

  const verificationSteps = getVerificationSteps();  const sqlLevels: SQLLevel[] = [
    {
      level: 'Free',
      productLimit: 3,
      features: [
        'Basic store setup',
        'Standard listing',
        'Email support'
      ],
      requirements: ['Store registration'],
      commission: 15
    },
    {
      level: 'Basic',
      productLimit: 10,
      features: [
        'Enhanced store features',
        'Basic analytics',
        'Priority support',
        'Reduced commission'
      ],
      requirements: ['PSS verification'],
      commission: 12
    },
    {
      level: 'Normal',
      productLimit: 50,
      features: [
        'AI-powered listings',
        'Advanced analytics',
        'Marketing tools',
        'City ranking'
      ],
      requirements: ['PSS + EDR verification'],
      commission: 10
    },
    {
      level: 'High',
      productLimit: 200,
      features: [
        'Unlimited products',
        'Premium support',
        'Advanced marketing',
        'Regional ranking'
      ],
      requirements: ['PSS + EDR + EMO verification'],
      commission: 8
    },
    {
      level: 'VIP',
      productLimit: 1000,
      features: [
        'Top 3 search ranking',
        'Dedicated account manager',
        'Exclusive features',
        'Lowest commission'
      ],
      requirements: ['All verifications + special approval'],
      commission: 5
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheckCircle className="w-4 h-4" />;
      case 'in-progress': return <FiClock className="w-4 h-4" />;
      case 'failed': return <FiXCircle className="w-4 h-4" />;
      default: return <FiClock className="w-4 h-4" />;
    }
  };

  const handleFileChange = (documentKey: string, file: File) => {
    console.log('handleFileChange called with:', documentKey, file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      console.log('File preview generated for:', documentKey);
      setDocuments(prev => ({
        ...prev,
        [documentKey]: { file, preview, type: file.type }
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = (documentKey: string) => {
    setDocuments(prev => ({
      ...prev,
      [documentKey]: null
    }));
  };

  const validateSectionSubmission = (section: string) => {
    let requiredDocs: string[] = [];
    
    switch (section) {
      case 'pss':
        requiredDocs = ['pss', 'cnic'];
        break;
      case 'edr':
        requiredDocs = ['edr', 'businessLicense'];
        break;
      case 'emo':
        requiredDocs = ['emo', 'addressProof'];
        break;
      default:
        return false;
    }
    
    const missingDocs = requiredDocs.filter(doc => !documents[doc as keyof DocumentSubmission]);
    
    if (missingDocs.length > 0) {
      setError(`Please upload required documents for ${section.toUpperCase()}: ${missingDocs.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSectionSubmit = async (section: string) => {
    console.log(`Submit button clicked for section: ${section}`);
    console.log('Documents state:', documents);
    
    if (!validateSectionSubmission(section)) {
      console.log('Validation failed');
      return;
    }

    console.log(`Starting ${section} upload process...`);
    setUploading(prev => ({ ...prev, [section]: true }));
    setError(null);

    try {
      const formData = new FormData();
      
      // Add section-specific documents to form data
      const sectionDocs = getSectionDocuments(section);
      sectionDocs.forEach(docKey => {
        const doc = documents[docKey as keyof DocumentSubmission];
        if (doc) {
          console.log(`Adding document: ${docKey}`, doc.file);
          formData.append(docKey, doc.file);
        }
      });

      // Add metadata
      formData.append('submittedAt', new Date().toISOString());
      
      // Get seller ID from seller token
      const sellerToken = localStorage.getItem('sellerToken');
      if (!sellerToken) {
        setError('Please login with a seller account to submit documents.');
        setUploading(prev => ({ ...prev, [section]: false }));
        return;
      }

      // Extract seller ID from token
      try {
        const payload = JSON.parse(atob(sellerToken.split('.')[1]));
        const sellerId = payload.sellerId;
        if (!sellerId) {
          setError('Invalid seller session. Please login again.');
          setUploading(prev => ({ ...prev, [section]: false }));
          return;
        }
        formData.append('sellerId', sellerId);
      } catch (error) {
        setError('Invalid seller session. Please login again.');
        setUploading(prev => ({ ...prev, [section]: false }));
        return;
      }

      console.log('Sending request to:', `/api/seller/submit-documents/${section}`);
      
      // Use the API service instead of direct fetch
      const api = (await import('../services/api')).default;
      
      const response = await api.post(`/seller/submit-documents/${section}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('sellerToken')}`
        },
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.success) {
        setSubmitted(prev => ({ ...prev, [section]: true }));
        
        // Clear section-specific documents
        const clearedDocs = { ...documents };
        sectionDocs.forEach(docKey => {
          clearedDocs[docKey as keyof DocumentSubmission] = null;
        });
        setDocuments(clearedDocs);
        
        // Refresh verification status after successful submission
        await fetchVerificationStatus();
      } else {
        setError(response.data.message || `Failed to submit ${section} documents`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please try again.');
    } finally {
      setUploading(prev => ({ ...prev, [section]: false }));
    }
  };

  const getSectionDocuments = (section: string): string[] => {
    switch (section) {
      case 'pss':
        return ['pss', 'cnic'];
      case 'edr':
        return ['edr', 'businessLicense'];
      case 'emo':
        return ['emo', 'addressProof', 'bankStatement'];
      default:
        return [];
    }
  };

  const validateSubmission = () => {
    const requiredDocs = ['pss', 'edr', 'emo', 'businessLicense', 'cnic', 'addressProof'];
    const missingDocs = requiredDocs.filter(doc => !documents[doc as keyof DocumentSubmission]);
    
    if (missingDocs.length > 0) {
      setError(`Please upload required documents: ${missingDocs.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked (legacy - all documents)');
    console.log('Documents state:', documents);
    
    if (!validateSubmission()) {
      console.log('Validation failed');
      return;
    }

    console.log('Starting upload process...');
    setUploading({ pss: true, edr: true, emo: true });
    setError(null);

    try {
      const formData = new FormData();
      
      // Add all documents to form data
      Object.entries(documents).forEach(([key, doc]) => {
        if (doc) {
          console.log(`Adding document: ${key}`, doc.file);
          formData.append(key, doc.file);
        }
      });

      // Add metadata
      formData.append('submittedAt', new Date().toISOString());
      
      // Get seller ID from seller token
      const sellerToken = localStorage.getItem('sellerToken');
      if (!sellerToken) {
        setError('Please login with a seller account to submit documents.');
        setUploading({ pss: false, edr: false, emo: false });
        return;
      }

      // Extract seller ID from token
      try {
        const payload = JSON.parse(atob(sellerToken.split('.')[1]));
        const sellerId = payload.sellerId;
        if (!sellerId) {
          setError('Invalid seller session. Please login again.');
          setUploading({ pss: false, edr: false, emo: false });
          return;
        }
        formData.append('sellerId', sellerId);
      } catch (error) {
        setError('Invalid seller session. Please login again.');
        setUploading({ pss: false, edr: false, emo: false });
        return;
      }

      console.log('Sending request to:', '/api/seller/submit-documents');
      
      // Use the API service instead of direct fetch
      const api = (await import('../services/api')).default;
      
      const response = await api.post('/seller/submit-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('sellerToken')}`
        },
      });

      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.success) {
        setSubmitted({ pss: true, edr: true, emo: true });
        setDocuments({
          pss: null,
          edr: null,
          emo: null,
          businessLicense: null,
          cnic: null,
          addressProof: null,
          bankStatement: null
        });
        // Refresh verification status after successful submission
        await fetchVerificationStatus();
      } else {
        setError(response.data.message || 'Failed to submit documents');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please try again.');
    } finally {
      setUploading({ pss: false, edr: false, emo: false });
    }
  };

  const currentLevelData = sqlLevels.find(level => level.level === currentLevel);
  const targetLevelData = sqlLevels.find(level => level.level === targetLevel);

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600">Loading verification status...</span>
        </div>
      ) : (
        <>
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
              <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link to="/store-dashboard" className="text-gray-600 hover:text-gray-900">Store Dashboard</Link>
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
              <h1 className="text-2xl font-bold text-gray-900">SQL Quality Verification</h1>
              <p className="text-gray-600">Complete verification steps to upgrade your store quality level</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Current Level</div>
              <div className="text-xl font-bold text-orange-600">{currentLevel}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Verification Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Verification Steps</h2>
              
              <div className="space-y-6">
                {verificationSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-6 ${
                      activeStep === step.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg mr-4 ${
                          step.status === 'completed' ? 'bg-green-100' :
                          step.status === 'in-progress' ? 'bg-blue-100' :
                          step.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(step.status)}`}>
                          {getStatusIcon(step.status)}
                          <span className="ml-1 capitalize">{step.status.replace('-', ' ')}</span>
                        </span>
                        {submitted[step.id] && step.status !== 'completed' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center">
                            <FiClock className="w-3 h-3 mr-1" />
                            Submitted
                          </span>
                        )}
                      </div>
                    </div>

                    {activeStep === step.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                            <ul className="space-y-2">
                              {step.requirements.map((requirement, idx) => (
                                <li key={idx} className="flex items-start">
                                  <FiCheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-700">{requirement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Documents to Upload</h4>
                            
                            {/* Error Message */}
                            {error && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center">
                                  <FiAlertCircle className="w-4 h-4 text-red-500 mr-2" />
                                  <span className="text-red-700 text-sm">{error}</span>
                                </div>
                              </div>
                            )}

                            {/* Success Message */}
                            {submitted[step.id] && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                <div className="flex items-center">
                                  <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                  <span className="text-green-700 text-sm">{step.id.toUpperCase()} documents submitted successfully! You will be notified once verification is complete.</span>
                                </div>
                              </div>
                            )}

                            <div className="space-y-3">
                              {/* PSS Documents */}
                              {step.id === 'pss' && (
                                <>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        console.log('PSS file input changed:', e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          console.log('PSS file selected:', file.name, file.type);
                                          handleFileChange('pss', file);
                                        }
                                      }}
                                      className="hidden"
                                      id="pss-upload"
                                    />
                                    <div 
                                      className="cursor-pointer block text-center"
                                      onClick={() => {
                                        console.log('PSS upload area clicked');
                                        document.getElementById('pss-upload')?.click();
                                      }}
                                    >
                                      <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium text-gray-900">PSS Assessment Results</div>
                                      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                        {documents.pss ? 'Change File' : 'Upload Document'}
                                      </button>
                                    </div>
                                    {documents.pss && (
                                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-xs text-gray-600">{documents.pss.file.name}</span>
                                        <button
                                          onClick={() => removeDocument('pss')}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        console.log('CNIC file input changed:', e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          console.log('CNIC file selected:', file.name, file.type);
                                          handleFileChange('cnic', file);
                                        }
                                      }}
                                      className="hidden"
                                      id="cnic-upload"
                                    />
                                    <div 
                                      className="cursor-pointer block text-center"
                                      onClick={() => {
                                        console.log('CNIC upload area clicked');
                                        document.getElementById('cnic-upload')?.click();
                                      }}
                                    >
                                      <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium text-gray-900">CNIC Front & Back</div>
                                      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                        {documents.cnic ? 'Change File' : 'Upload Document'}
                                      </button>
                                    </div>
                                    {documents.cnic && (
                                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-xs text-gray-600">{documents.cnic.file.name}</span>
                                        <button
                                          onClick={() => removeDocument('cnic')}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* EDR Documents */}
                              {step.id === 'edr' && (
                                <>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        console.log('EDR file input changed:', e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          console.log('EDR file selected:', file.name, file.type);
                                          handleFileChange('edr', file);
                                        }
                                      }}
                                      className="hidden"
                                      id="edr-upload"
                                    />
                                    <div 
                                      className="cursor-pointer block text-center"
                                      onClick={() => {
                                        console.log('EDR upload area clicked');
                                        document.getElementById('edr-upload')?.click();
                                      }}
                                    >
                                      <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium text-gray-900">EDR Skills Certificate</div>
                                      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                        {documents.edr ? 'Change File' : 'Upload Document'}
                                      </button>
                                    </div>
                                    {documents.edr && (
                                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-xs text-gray-600">{documents.edr.file.name}</span>
                                        <button
                                          onClick={() => removeDocument('edr')}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        console.log('Business License file input changed:', e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          console.log('Business License file selected:', file.name, file.type);
                                          handleFileChange('businessLicense', file);
                                        }
                                      }}
                                      className="hidden"
                                      id="businessLicense-upload"
                                    />
                                    <div 
                                      className="cursor-pointer block text-center"
                                      onClick={() => {
                                        console.log('Business License upload area clicked');
                                        document.getElementById('businessLicense-upload')?.click();
                                      }}
                                    >
                                      <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium text-gray-900">Business License</div>
                                      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                        {documents.businessLicense ? 'Change File' : 'Upload Document'}
                                      </button>
                                    </div>
                                    {documents.businessLicense && (
                                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-xs text-gray-600">{documents.businessLicense.file.name}</span>
                                        <button
                                          onClick={() => removeDocument('businessLicense')}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}

                              {/* EMO Documents */}
                              {step.id === 'emo' && (
                                <>
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        console.log('EMO file input changed:', e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          console.log('EMO file selected:', file.name, file.type);
                                          handleFileChange('emo', file);
                                        }
                                      }}
                                      className="hidden"
                                      id="emo-upload"
                                    />
                                    <div 
                                      className="cursor-pointer block text-center"
                                      onClick={() => {
                                        console.log('EMO upload area clicked');
                                        document.getElementById('emo-upload')?.click();
                                      }}
                                    >
                                      <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium text-gray-900">EMO Inspection Report</div>
                                      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                        {documents.emo ? 'Change File' : 'Upload Document'}
                                      </button>
                                    </div>
                                    {documents.emo && (
                                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-xs text-gray-600">{documents.emo.file.name}</span>
                                        <button
                                          onClick={() => removeDocument('emo')}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        console.log('Address Proof file input changed:', e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          console.log('Address Proof file selected:', file.name, file.type);
                                          handleFileChange('addressProof', file);
                                        }
                                      }}
                                      className="hidden"
                                      id="addressProof-upload"
                                    />
                                    <div 
                                      className="cursor-pointer block text-center"
                                      onClick={() => {
                                        console.log('Address Proof upload area clicked');
                                        document.getElementById('addressProof-upload')?.click();
                                      }}
                                    >
                                      <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium text-gray-900">Address Proof</div>
                                      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                        {documents.addressProof ? 'Change File' : 'Upload Document'}
                                      </button>
                                    </div>
                                    {documents.addressProof && (
                                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-xs text-gray-600">{documents.addressProof.file.name}</span>
                                        <button
                                          onClick={() => removeDocument('addressProof')}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                    <input
                                      type="file"
                                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        console.log('Bank Statement file input changed:', e.target.files);
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          console.log('Bank Statement file selected:', file.name, file.type);
                                          handleFileChange('bankStatement', file);
                                        }
                                      }}
                                      className="hidden"
                                      id="bankStatement-upload"
                                    />
                                    <div 
                                      className="cursor-pointer block text-center"
                                      onClick={() => {
                                        console.log('Bank Statement upload area clicked');
                                        document.getElementById('bankStatement-upload')?.click();
                                      }}
                                    >
                                      <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                      <div className="text-sm font-medium text-gray-900">Bank Statement</div>
                                      <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                        {documents.bankStatement ? 'Change File' : 'Upload Document'}
                                      </button>
                                    </div>
                                    {documents.bankStatement && (
                                      <div className="mt-2 flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-xs text-gray-600">{documents.bankStatement.file.name}</span>
                                        <button
                                          onClick={() => removeDocument('bankStatement')}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <FiX className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex justify-between">
                          <button
                            onClick={() => setActiveStep(verificationSteps[index - 1]?.id || 'pss')}
                            disabled={index === 0}
                            className={`px-4 py-2 rounded-lg border ${
                              index === 0
                                ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Previous
                          </button>
                          
                          <button 
                            onClick={() => handleSectionSubmit(step.id)}
                            disabled={uploading[step.id] || submitted[step.id]}
                            className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
                              submitted[step.id] 
                                ? 'bg-green-500 text-white cursor-default'
                                : step.status === 'completed'
                                  ? 'bg-blue-500 text-white cursor-default'
                                  : 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            {uploading[step.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                              </>
                            ) : submitted[step.id] ? (
                              <>
                                <FiCheckCircle className="mr-2" />
                                Already Submitted
                              </>
                            ) : step.status === 'completed' ? (
                              <>
                                <FiCheckCircle className="mr-2" />
                                Verified
                              </>
                            ) : (
                              <>
                                Submit {step.id.toUpperCase()} for Review
                                <FiArrowRight className="ml-2" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeStep !== step.id && (
                      <button
                        onClick={() => setActiveStep(step.id)}
                        className="w-full mt-4 text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">View Details</span>
                          <FiArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* SQL Levels Sidebar */}
          <div className="space-y-6">
            {/* Current Level */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Level: {currentLevel}</h3>
              {currentLevelData && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{currentLevelData.productLimit}</div>
                    <div className="text-sm text-gray-600">Product Limit</div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {currentLevelData.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{currentLevelData.commission}%</div>
                    <div className="text-sm text-gray-600">Commission Rate</div>
                  </div>
                </div>
              )}
            </div>

            {/* Target Level */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                Upgrade to: {targetLevel}
                {targetLevel !== 'Basic' && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Coming Soon
                  </span>
                )}
              </h3>
              {targetLevelData && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{targetLevelData.productLimit}</div>
                    <div className="text-sm text-gray-600">Product Limit</div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">New Features:</h4>
                    <ul className="space-y-1">
                      {targetLevelData.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{targetLevelData.commission}%</div>
                    <div className="text-sm text-gray-600">Commission Rate</div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                    <ul className="space-y-1">
                      {targetLevelData.requirements.map((requirement, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <FiInfo className="w-4 h-4 text-blue-500 mr-2" />
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Level Comparison */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All SQL Levels</h3>
              <div className="space-y-3">
                {sqlLevels.map((level) => (
                  <div
                    key={level.level}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      level.level === currentLevel
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setTargetLevel(level.level as any)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center">
                          {level.level}
                          {level.level !== 'Free' && (
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{level.productLimit} products</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{level.commission}%</div>
                        <div className="text-xs text-gray-500">commission</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {verificationSteps.map((step) => (
              <div key={step.id} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  step.status === 'completed' ? 'bg-green-100' :
                  step.status === 'in-progress' ? 'bg-blue-100' :
                  step.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {step.icon}
                </div>
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                <p className="text-sm text-gray-600 capitalize">{step.status.replace('-', ' ')}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <FiShield className="mr-2" />
              Complete All Verifications
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default SQLVerification; 