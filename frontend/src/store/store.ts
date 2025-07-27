import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import orderReducer from './slices/orderSlice'
import customerReducer from './slices/customerSlice'
import analyticsReducer from './slices/analyticsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
    customers: customerReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
