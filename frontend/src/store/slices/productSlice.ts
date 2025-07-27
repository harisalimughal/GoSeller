import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  image: string
  createdAt: string
}

interface ProductState {
  products: Product[]
  selectedProduct: Product | null
  loading: boolean
  error: string | null
  filters: {
    category: string
    priceRange: [number, number]
    searchTerm: string
  }
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  filters: {
    category: 'all',
    priceRange: [0, 1000],
    searchTerm: '',
  },
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload)
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.products[index] = action.payload
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter(p => p.id !== action.payload)
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setSelectedProduct,
  setFilters,
  setLoading,
  setError,
} = productSlice.actions

export default productSlice.reducer
