import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

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

const DocumentSubmission: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentSubmission>({
    pss: null,
    edr: null,
    emo: null,
    businessLicense: null,
    cnic: null,
    addressProof: null,
    bankStatement: null
  });
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentTypes = [
    {
      key: 'pss',
      label: 'PSS (Product Safety Standards)',
      description: 'Product safety and quality standards documentation',
      required: true,
      acceptedTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    },
    {
      key: 'edr',
      label: 'EDR (Electronic Data Records)',
      description: 'Electronic data records and compliance documents',
      required: true,
      acceptedTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    },
    {
      key: 'emo',
      label: 'EMO (Electronic Market Operations)',
      description: 'Electronic market operations and trading documents',
      required: true,
      acceptedTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    },
    {
      key: 'businessLicense',
      label: 'Business License',
      description: 'Valid business registration and license',
      required: true,
      acceptedTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    },
    {
      key: 'cnic',
      label: 'CNIC (National ID)',
      description: 'Computerized National Identity Card',
      required: true,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png'
    },
    {
      key: 'addressProof',
      label: 'Address Proof',
      description: 'Utility bill or rental agreement',
      required: true,
      acceptedTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
    },
    {
      key: 'bankStatement',
      label: 'Bank Statement',
      description: 'Recent bank statement for verification',
      required: false,
      acceptedTypes: '.pdf,.jpg,.jpeg,.png'
    }
  ];

  const handleFileChange = (documentKey: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
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

  const validateSubmission = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required);
    const missingDocs = requiredDocs.filter(doc => !documents[doc.key as keyof DocumentSubmission]);
    
    if (missingDocs.length > 0) {
      setError(`Please upload required documents: ${missingDocs.map(doc => doc.label).join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('Submit button clicked');
    console.log('Documents state:', documents);
    
    if (!validateSubmission()) {
      console.log('Validation failed');
      return;
    }

    console.log('Starting upload process...');
    setUploading(true);
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
      formData.append('sellerId', 'current-seller-id'); // This should come from auth context

      console.log('Sending request to:', 'http://localhost:3001/api/seller/submit-documents');
      
      const response = await fetch('http://localhost:3001/api/seller/submit-documents', {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setSubmitted(true);
        setDocuments({
          pss: null,
          edr: null,
          emo: null,
          businessLicense: null,
          cnic: null,
          addressProof: null,
          bankStatement: null
        });
      } else {
        setError(data.message || 'Failed to submit documents');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
        >
          <div className="text-center">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your documents have been successfully submitted for verification. 
              You will be notified once the review is complete.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit More Documents
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Submission</h1>
          <p className="text-gray-600">
            Please upload all required documents for verification. This helps us ensure compliance and security.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Document Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documentTypes.map((docType, index) => (
            <motion.div
              key={docType.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {docType.label}
                    {docType.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <p className="text-sm text-gray-600">{docType.description}</p>
                </div>
              </div>

              {!documents[docType.key as keyof DocumentSubmission] ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept={docType.acceptedTypes}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileChange(docType.key, file);
                      }
                    }}
                    className="hidden"
                    id={`file-${docType.key}`}
                  />
                  <label
                    htmlFor={`file-${docType.key}`}
                    className="cursor-pointer block"
                  >
                    <FiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      {docType.acceptedTypes.split(',').join(', ')}
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiFile className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {documents[docType.key as keyof DocumentSubmission]?.file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeDocument(docType.key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                  {documents[docType.key as keyof DocumentSubmission]?.type.startsWith('image/') && (
                    <img
                      src={documents[docType.key as keyof DocumentSubmission]?.preview}
                      alt="Preview"
                      className="mt-2 max-h-32 rounded object-cover"
                    />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-center"
        >
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4 mr-2" />
                Submit Documents
              </>
            )}
          </button>
        </motion.div>

        {/* Information */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All documents will be securely stored and encrypted</li>
            <li>• Verification process typically takes 2-3 business days</li>
            <li>• You will be notified via email once verification is complete</li>
            <li>• Ensure all documents are clear and legible</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default DocumentSubmission;
