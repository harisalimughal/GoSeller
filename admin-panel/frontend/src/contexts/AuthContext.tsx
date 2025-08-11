import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<void>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('admin_token'),
  loading: true,
  isAuthenticated: false,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token');

      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });

          // Set token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Verify token and get user data
          const response = await api.get('/auth/me');
          const { user } = response.data.data;

          // Only allow admin and seller roles in admin panel
          if (user.role === 'admin' || user.role === 'seller') {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token },
            });
          } else {
            throw new Error('Access denied. Admin privileges required.');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('admin_token');
          delete api.defaults.headers.common['Authorization'];
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      // Only allow admin and seller roles in admin panel
      if (user.role !== 'admin' && user.role !== 'seller') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store token
      localStorage.setItem('admin_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.firstName}!`);
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE' });

      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);

      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('admin_token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh');
      const { token } = response.data.data;

      localStorage.setItem('admin_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Update the token in state
      if (state.user) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: state.user, token },
        });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  // Check permissions
  const hasPermission = (permission: string): boolean => {
    if (!state.user) return false;

    // Admin has all permissions
    if (state.user.role === 'admin') return true;

    // Check specific permissions
    return state.user.permissions?.includes(permission) || false;
  };

  // Check role
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Permission hook
export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  return { hasPermission, hasRole, user };
};

export default AuthContext;
