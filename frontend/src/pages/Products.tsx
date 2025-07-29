import { useState } from 'react'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  image: string
}

const Products = () => {
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: 99.99,
      stock: 50,
      status: 'active',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: '2',
      name: 'Smart Watch',
      category: 'Electronics',
      price: 299.99,
      stock: 25,
      status: 'active',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: '3',
      name: 'Running Shoes',
      category: 'Sports',
      price: 79.99,
      stock: 100,
      status: 'active',
      image: 'https://via.placeholder.com/60'
    },
    {
      id: '4',
      name: 'Coffee Maker',
      category: 'Home',
      price: 149.99,
      stock: 15,
      status: 'inactive',
      image: 'https://via.placeholder.com/60'
    }
  ])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select className="border rounded-lg px-3 py-2">
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Sports</option>
          <option>Home</option>
        </select>
        <select className="border rounded-lg px-3 py-2">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <input
          type="text"
          placeholder="Search products..."
          className="border rounded-lg px-3 py-2 flex-1"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg border shadow-sm p-4">
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Price:</span>
                <span className="font-medium">${product.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Stock:</span>
                <span className={`font-medium ${product.stock < 20 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Edit
              </button>
              <button className="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Products
