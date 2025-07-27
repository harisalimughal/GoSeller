import React from 'react'

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            EHB GoSeller Admin Panel
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Total Sales</h3>
              <p className="text-3xl font-bold">$45,231</p>
              <p className="text-blue-100">+20.1% from last month</p>
            </div>

            <div className="bg-green-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Orders</h3>
              <p className="text-3xl font-bold">2,350</p>
              <p className="text-green-100">+180.1% from last month</p>
            </div>

            <div className="bg-yellow-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Products</h3>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-yellow-100">+19% from last month</p>
            </div>

            <div className="bg-purple-500 text-white rounded-lg p-6">
              <h3 className="text-lg font-semibold">Customers</h3>
              <p className="text-3xl font-bold">12,234</p>
              <p className="text-purple-100">+201 since last hour</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-600">✅ PostCSS and Tailwind CSS configuration fixed!</p>
              <p className="text-gray-600">✅ Admin panel dependencies installed successfully</p>
              <p className="text-gray-600">✅ EHB GoSeller platform is now running</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
