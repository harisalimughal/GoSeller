import React, { useState, useEffect } from 'react'
import { FileCheck, CheckCircle, XCircle, Clock, Eye, Download, Filter, User, ArrowLeft } from 'lucide-react'
import { verificationsAPI } from '../services/api'

interface Seller {
  id: string
  name: string
  shopName: string
  email: string
  contact: string
  profileType: string
  sellerType: string
  submittedAt: string
  pssStatus: 'pending' | 'approved' | 'rejected'
  edrStatus: 'pending' | 'approved' | 'rejected'
  emoStatus: 'pending' | 'approved' | 'rejected'
  overallStatus: 'pending' | 'approved' | 'rejected' | 'partial'
}

interface VerificationDocument {
  type: string
  name: string
  url: string
}

interface VerificationSection {
  status: 'pending' | 'approved' | 'rejected'
  verifiedAt?: string
  verifiedBy?: string
  notes?: string
  documents: VerificationDocument[]
}

interface SellerDetails {
  id: string
  name: string
  shopName: string
  email: string
  contact: string
  profileType: string
  sellerType: string
  businessDetails?: any
  address?: any
  registeredAt: string
  verificationSections: {
    pss: VerificationSection
    edr: VerificationSection
    emo: VerificationSection
  }
}

const Verifications: React.FC = () => {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'partial'>('all')
  const [selectedSeller, setSelectedSeller] = useState<SellerDetails | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [reviewNotes, setReviewNotes] = useState<{[key: string]: string}>({})

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      setLoading(true)
      const response = await verificationsAPI.getAll()
      
      if (response.success) {
        const data = response.data as { sellers?: Seller[] }
        setSellers(data.sellers || [])
      } else {
        console.error('Failed to load sellers:', response.message)
        setSellers([])
      }
    } catch (error) {
      console.error('Error loading sellers:', error)
      setSellers([])
    } finally {
      setLoading(false)
    }
  }

  const loadSellerDetails = async (sellerId: string) => {
    try {
      setLoadingDetails(true)
      const response = await verificationsAPI.getSellerDetails(sellerId)
      
      if (response.success) {
        const data = response.data as { seller: SellerDetails }
        setSelectedSeller(data.seller)
      } else {
        console.error('Failed to load seller details:', response.message)
      }
    } catch (error) {
      console.error('Error loading seller details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleSectionStatusUpdate = async (section: 'pss' | 'edr' | 'emo', status: 'approved' | 'rejected') => {
    if (!selectedSeller) return
    
    try {
      const notes = reviewNotes[section] || ''
      const response = await verificationsAPI.updateSectionStatus(selectedSeller.id, section, status, notes)

      if (response.success) {
        // Update the selected seller details
        setSelectedSeller(prev => {
          if (!prev) return null
          return {
            ...prev,
            verificationSections: {
              ...prev.verificationSections,
              [section]: {
                ...prev.verificationSections[section],
                status,
                verifiedAt: new Date().toISOString(),
                verifiedBy: 'admin',
                notes
              }
            }
          }
        })
        
        // Update the sellers list
        setSellers(prev => prev.map(seller => {
          if (seller.id === selectedSeller.id) {
            const updatedSeller = { ...seller, [`${section}Status`]: status }
            // Recalculate overall status
            const statuses = [
              section === 'pss' ? status : seller.pssStatus,
              section === 'edr' ? status : seller.edrStatus,
              section === 'emo' ? status : seller.emoStatus
            ]
            if (statuses.every(s => s === 'approved')) updatedSeller.overallStatus = 'approved'
            else if (statuses.some(s => s === 'rejected')) updatedSeller.overallStatus = 'rejected'
            else if (statuses.some(s => s === 'approved')) updatedSeller.overallStatus = 'partial'
            else updatedSeller.overallStatus = 'pending'
            
            return updatedSeller
          }
          return seller
        }))
        
        // Clear the review notes for this section
        setReviewNotes(prev => ({ ...prev, [section]: '' }))
      }
    } catch (error) {
      console.error('Error updating verification:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'partial':
        return <FileCheck className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'partial':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSellers = sellers.filter(seller => 
    filter === 'all' ? true : seller.overallStatus === filter
  )

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'pss': return 'PSS Verification'
      case 'edr': return 'EDR Verification'
      case 'emo': return 'EMO Verification'
      default: return section.toUpperCase()
    }
  }

  if (selectedSeller) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedSeller(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Seller Verification Details</h1>
                <p className="text-gray-600 mt-1">{selectedSeller.shopName || selectedSeller.name}</p>
              </div>
            </div>
          </div>
        </div>

        {loadingDetails ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-center text-gray-600">Loading seller details...</p>
          </div>
        ) : (
          <>
            {/* Seller Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{selectedSeller.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Shop Name</p>
                  <p className="font-medium">{selectedSeller.shopName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedSeller.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium">{selectedSeller.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Seller Type</p>
                  <p className="font-medium">{selectedSeller.sellerType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile Type</p>
                  <p className="font-medium">{selectedSeller.profileType}</p>
                </div>
              </div>
            </div>

            {/* Verification Sections */}
            {Object.entries(selectedSeller.verificationSections).map(([section, sectionData]) => (
              <div key={section} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(sectionData.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getSectionTitle(section)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sectionData.status)}`}>
                      {sectionData.status.charAt(0).toUpperCase() + sectionData.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Documents */}
                {sectionData.documents.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sectionData.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <span className="text-sm font-medium">{doc.name}</span>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No documents uploaded for this section</p>
                  </div>
                )}

                {/* Review Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes[section] || ''}
                    onChange={(e) => setReviewNotes(prev => ({ ...prev, [section]: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Add your review notes here..."
                  />
                </div>

                {/* Current Notes */}
                {sectionData.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Previous Notes:</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{sectionData.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {sectionData.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSectionStatusUpdate(section as 'pss' | 'edr' | 'emo', 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve {section.toUpperCase()}
                    </button>
                    <button
                      onClick={() => handleSectionStatusUpdate(section as 'pss' | 'edr' | 'emo', 'rejected')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject {section.toUpperCase()}
                    </button>
                  </div>
                )}

                {/* Verification Info */}
                {sectionData.status !== 'pending' && sectionData.verifiedAt && (
                  <div className="text-sm text-gray-600">
                    <p>Verified on: {new Date(sectionData.verifiedAt).toLocaleDateString()}</p>
                    {sectionData.verifiedBy && <p>Verified by: {sectionData.verifiedBy}</p>}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Verifications</h1>
            <p className="text-gray-600 mt-2">Review and approve seller verification documents</p>
          </div>
          <button
            onClick={loadSellers}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sellers</p>
              <p className="text-2xl font-bold text-gray-900">{sellers.length}</p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">
                {sellers.filter(s => s.overallStatus === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {sellers.filter(s => s.overallStatus === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Partially Verified</p>
              <p className="text-2xl font-bold text-gray-900">
                {sellers.filter(s => s.overallStatus === 'partial').length}
              </p>
            </div>
            <FileCheck className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected', 'partial'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sellers List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Sellers for Verification</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading sellers...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSellers.map((seller) => (
              <div key={seller.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(seller.overallStatus)}
                    <div>
                      <h3 className="font-medium text-gray-900">{seller.shopName || seller.name}</h3>
                      <p className="text-sm text-gray-600">
                        {seller.email} • Registered: {new Date(seller.submittedAt).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(seller.pssStatus)}`}>
                          PSS: {seller.pssStatus}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(seller.edrStatus)}`}>
                          EDR: {seller.edrStatus}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(seller.emoStatus)}`}>
                          EMO: {seller.emoStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(seller.overallStatus)}`}>
                      {seller.overallStatus.charAt(0).toUpperCase() + seller.overallStatus.slice(1)}
                    </span>
                    
                    <button
                      onClick={() => loadSellerDetails(seller.id)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredSellers.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No sellers found for the selected filter.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Verifications
