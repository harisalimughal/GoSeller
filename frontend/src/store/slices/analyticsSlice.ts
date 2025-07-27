import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface AnalyticsData {
  sales: {
    total: number
    today: number
    thisWeek: number
    thisMonth: number
    trend: number[]
  }
  orders: {
    total: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  products: {
    total: number
    active: number
    lowStock: number
    outOfStock: number
  }
  customers: {
    total: number
    newThisMonth: number
    repeatCustomers: number
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
}

interface AnalyticsState {
  data: AnalyticsData | null
  isLoading: boolean
  error: string | null
  period: 'today' | 'week' | 'month' | 'year'
}

const initialState: AnalyticsState = {
  data: null,
  isLoading: false,
  error: null,
  period: 'month',
}

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetchAnalytics',
  async (period: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        return rejectWithValue('Failed to fetch analytics')
      }

      return await response.json()
    } catch (error) {
      return rejectWithValue('Network error')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<'today' | 'week' | 'month' | 'year'>) => {
      state.period = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch analytics
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false
        state.data = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setPeriod, clearError } = analyticsSlice.actions
export default analyticsSlice.reducer
