import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../services/api';
import apiService from '../services/api';

// Auth State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Action Types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Auth Context Interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await apiService.getCurrentUser();
          if (response.success) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data, token },
            });
          } else {
            localStorage.removeItem('authToken');
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          }
        } catch (error) {
          localStorage.removeItem('authToken');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: '' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.login(email, password);
      if (response.success) {
        localStorage.setItem('authToken', response.data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token: response.data.token },
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Login failed' });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Login failed',
      });
    }
  };

  // Register function
  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.register(userData);
      if (response.success) {
        localStorage.setItem('authToken', response.data.token);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token: response.data.token },
        });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.message || 'Registration failed' });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Registration failed',
      });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('authToken');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Update profile function
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await apiService.updateProfile(userData);
      if (response.success) {
        dispatch({ type: 'UPDATE_USER', payload: response.data });
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.response?.data?.message || 'Profile update failed',
      });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
