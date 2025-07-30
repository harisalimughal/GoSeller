import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUpload,
  FiFileText,
  FiCamera,
  FiMapPin,
  FiCalendar,
  FiArrowRight,
  FiAlertCircle,
  FiInfo,
  FiDownload,
  FiEye,
  FiEdit
} from 'react-icons/fi';

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  icon: React.ReactNode;
  requirements: string[];
  documents: string[];
}

interface SQLLevel {
  level: 'Free' | 'Basic' | 'Normal' | 'High' | 'VIP';
  productLimit: number;
  features: string[];
  requirements: string[];
  commission: number;
}

const SQLVerification: React.FC = () => {
  const [activeStep, setActiveStep] = useState('pss');
  const [currentLevel, setCurrentLevel] = useState<'Free' | 'Basic' | 'Normal' | 'High' | 'VIP'>('Free');
  const [targetLevel, setTargetLevel] = useState<'Basic' | 'Normal' | 'High' | 'VIP'>('Basic');

  const verificationSteps: VerificationStep[] = [
    {
      id: 'pss',
      title: 'PSS Verification',
      description: 'Personal Security System - ID and Document Verification',
      status: 'in-progress',
      icon: <FiShield className="w-6 h-6" />,
      requirements: [
        'Valid CNIC (Computerized National Identity Card)',
        'Business Registration Certificate',
        'Tax Registration Certificate',
        'Recent passport-size photograph'
      ],
      documents: [
        'CNIC Front & Back',
        'Business License',
        'Tax Certificate',
        'Passport Photo'
      ]
    },
    {
      id: 'edr',
      title: 'EDR Verification',
      description: 'Exam Decision Registration - Skills and Knowledge Testing',
      status: 'pending',
      icon: <FiFileText className="w-6 h-6" />,
      requirements: [
        'Complete online assessment test',
        'Demonstrate product knowledge',
        'Show customer service skills',
        'Pass quality standards test'
      ],
      documents: [
        'Assessment Results',
        'Skills Certificate',
        'Quality Standards Report'
      ]
    },
    {
      id: 'emo',
      title: 'EMO Verification',
      description: 'Easy Management Office - Physical Business Inspection',
      status: 'pending',
      icon: <FiMapPin className="w-6 h-6" />,
      requirements: [
        'Physical store inspection',
        'Inventory verification',
        'Business location verification',
        'Quality control assessment'
      ],
      documents: [
        'Inspection Report',
        'Location Verification',
        'Quality Assessment'
      ]
    }
  ];

  const sqlLevels: SQLLevel[] = [
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

  const currentLevelData = sqlLevels.find(level => level.level === currentLevel);
  const targetLevelData = sqlLevels.find(level => level.level === targetLevel);

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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(step.status)}`}>
                        {getStatusIcon(step.status)}
                        <span className="ml-1 capitalize">{step.status.replace('-', ' ')}</span>
                      </span>
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
                            <div className="space-y-3">
                              {step.documents.map((document, idx) => (
                                <div key={idx} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <FiUpload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                  <div className="text-sm font-medium text-gray-900">{document}</div>
                                  <button className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm">
                                    Upload Document
                                  </button>
                                </div>
                              ))}
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
                          
                          <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center">
                            {step.status === 'completed' ? 'Completed' : 'Submit for Review'}
                            <FiArrowRight className="ml-2" />
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade to: {targetLevel}</h3>
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
                        <div className="font-semibold text-gray-900">{level.level}</div>
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
    </div>
  );
};

export default SQLVerification; 