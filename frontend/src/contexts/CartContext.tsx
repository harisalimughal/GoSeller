import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Cart, Product, ProductVariant } from '../services/api';
import apiService from '../services/api';

// Cart State Interface
interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

// Cart Action Types
type CartAction =
  | { type: 'CART_LOADING' }
  | { type: 'CART_SUCCESS'; payload: Cart }
  | { type: 'CART_ERROR'; payload: string }
  | { type: 'CART_UPDATING' }
  | { type: 'CART_CLEAR' }
  | { type: 'CLEAR_ERROR' };

// Cart Context Interface
interface CartContextType extends CartState {
  addToCart: (product: Product, quantity: number, variant?: ProductVariant) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  loadCart: () => Promise<void>;
  clearError: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
}

// Initial State
const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'CART_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'CART_SUCCESS':
      return {
        ...state,
        cart: action.payload,
        isLoading: false,
        error: null,
        isUpdating: false,
      };
    case 'CART_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isUpdating: false,
      };
    case 'CART_UPDATING':
      return {
        ...state,
        isUpdating: true,
        error: null,
      };
    case 'CART_CLEAR':
      return {
        ...state,
        cart: null,
        isLoading: false,
        error: null,
        isUpdating: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Props
interface CartProviderProps {
  children: ReactNode;
}

// Cart Provider Component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Load cart function
  const loadCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING' });
      const response = await apiService.getCart();
      if (response.success) {
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'CART_ERROR', payload: response.message || 'Failed to load cart' });
      }
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to load cart',
      });
    }
  };

  // Add to cart function
  const addToCart = async (product: Product, quantity: number, variant?: ProductVariant) => {
    try {
      dispatch({ type: 'CART_UPDATING' });
      const response = await apiService.addToCart(product._id, quantity, variant?._id);
      if (response.success) {
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'CART_ERROR', payload: response.message || 'Failed to add item to cart' });
      }
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to add item to cart',
      });
    }
  };

  // Update cart item function
  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'CART_UPDATING' });
      const response = await apiService.updateCartItem(itemId, quantity);
      if (response.success) {
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'CART_ERROR', payload: response.message || 'Failed to update cart item' });
      }
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update cart item',
      });
    }
  };

  // Remove from cart function
  const removeFromCart = async (itemId: string) => {
    try {
      dispatch({ type: 'CART_UPDATING' });
      const response = await apiService.removeFromCart(itemId);
      if (response.success) {
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'CART_ERROR', payload: response.message || 'Failed to remove item from cart' });
      }
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to remove item from cart',
      });
    }
  };

  // Clear cart function
  const clearCart = async () => {
    try {
      dispatch({ type: 'CART_UPDATING' });
      const response = await apiService.clearCart();
      if (response.success) {
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'CART_ERROR', payload: response.message || 'Failed to clear cart' });
      }
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to clear cart',
      });
    }
  };

  // Apply coupon function
  const applyCoupon = async (code: string) => {
    try {
      dispatch({ type: 'CART_UPDATING' });
      const response = await apiService.applyCoupon(code);
      if (response.success) {
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'CART_ERROR', payload: response.message || 'Failed to apply coupon' });
      }
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to apply coupon',
      });
    }
  };

  // Remove coupon function
  const removeCoupon = async () => {
    try {
      dispatch({ type: 'CART_UPDATING' });
      const response = await apiService.removeCoupon();
      if (response.success) {
        dispatch({ type: 'CART_SUCCESS', payload: response.data });
      } else {
        dispatch({ type: 'CART_ERROR', payload: response.message || 'Failed to remove coupon' });
      }
    } catch (error: any) {
      dispatch({
        type: 'CART_ERROR',
        payload: error.response?.data?.error?.message || error.response?.data?.message || 'Failed to remove coupon',
      });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Get cart item count
  const getCartItemCount = (): number => {
    if (!state.cart?.items) return 0;
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get cart total
  const getCartTotal = (): number => {
    return state.cart?.total || 0;
  };

  const value: CartContextType = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    loadCart,
    clearError,
    getCartItemCount,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
