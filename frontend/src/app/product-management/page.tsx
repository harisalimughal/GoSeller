import dynamic from 'next/dynamic';

// Use dynamic import to avoid potential SSR issues
const ProductManagement = dynamic(() => import('@/pages/ProductManagement'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Product Management...</p>
      </div>
    </div>
  )
});

export default function ProductManagementPage() {
  return <ProductManagement />;
}

