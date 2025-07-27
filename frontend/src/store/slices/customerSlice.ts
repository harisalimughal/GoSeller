import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address: any
  isActive: boolean
  totalOrders: number
  totalSpent: number
  createdAt: string
  updatedAt: string
}

interface CustomerState {
  customers: Customer[]
  currentCustomer: Customer | null
  isLoading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
}

const initialState: CustomerState = {
  customers: [],
  currentCustomer: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (params: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.search) queryParams.append('search', params.search)

      const response = await fetch(`/api/customers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        return rejectWithValue('Failed to fetch customers')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error')
    }
  }
)

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false
        state.customers = action.payload.customers
        state.totalCount = action.payload.totalCount
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setCurrentCustomer, clearError, setPage } = customerSlice.actions
export default customerSlice.reducer
