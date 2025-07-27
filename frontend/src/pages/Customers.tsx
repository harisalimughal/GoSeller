import React from 'react'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  lastOrder: string
  status: 'active' | 'inactive'
}

const Customers = () => {
  const customers: Customer[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-0123',
      totalOrders: 15,
      totalSpent: 2499.99,
      lastOrder: '2024-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+1-555-0124',
      totalOrders: 8,
      totalSpent: 1299.99,
      lastOrder: '2024-01-10',
      status: 'active'
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+1-555-0125',
      totalOrders: 3,
      totalSpent: 599.99,
      lastOrder: '2024-01-05',
      status: 'inactive'
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+1-555-0126',
      totalOrders: 22,
      totalSpent: 3999.99,
      lastOrder: '2024-01-12',
      status: 'active'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-600">1,234</div>
          <div className="text-sm text-gray-500">Total Customers</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-600">892</div>
          <div className="text-sm text-gray-500">Active Customers</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-600">342</div>
          <div className="text-sm text-gray-500">New This Month</div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="text-2xl font-bold text-purple-600">$45,231</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search customers..."
          className="border rounded-lg px-3 py-2 flex-1"
        />
        <select className="border rounded-lg px-3 py-2">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
          Export
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{customer.email}</div>
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${customer.totalSpent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900">View</button>
                      <button className="text-green-600 hover:text-green-900">Edit</button>
                      <button className="text-purple-600 hover:text-purple-900">Message</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Customers
