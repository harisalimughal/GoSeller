import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface Order {
  id: string
  orderNumber: string
  customerId: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  subtotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress: any
  billingAddress: any
  notes: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  productSku: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params: { page?: number; limit?: number; status?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.status) queryParams.append('status', params.status)

      const response = await fetch(`/api/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        return rejectWithValue('Failed to fetch orders')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error')
    }
  }
)

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        return rejectWithValue('Failed to update order status')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error')
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
  },
  extraReducers: (builder) => {
    // Fetch orders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.orders
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update order status
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.orders.findIndex(o => o.id === action.payload.id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentOrder, clearError, setPage } = orderSlice.actions
export default orderSlice.reducer
