import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token && mounted) {
          const storedUser = authService.getStoredUser();
          if (storedUser) setUser(storedUser);
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.data && mounted) {
              setUser(response.data);
              authService.setStoredUser(response.data);
            }
          } catch (_error) {
            console.error('Error getting current user:', _error);
          }
        }
      } catch (error) {
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAuthError = (error: any, defaultMessage: string): never => {
    const errorData = error.response?.data;
    if (errorData?.errors && Array.isArray(errorData.errors)) {
      throw new Error(errorData.errors.join(', '));
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      throw new Error('Cannot connect to the server. Please make sure the backend server is running.');
    }
    throw new Error(errorData?.message || error.message || defaultMessage);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const { token, user } = response.data;
        authService.setToken(token);
        authService.setStoredUser(user);
        setUser(user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      handleAuthError(error, 'Login failed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        const { token, user } = response.data;
        localStorage.setItem('justRegistered', 'true');
        authService.setToken(token);
        authService.setStoredUser(user);
        setUser(user);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      handleAuthError(error, 'Registration failed');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    authService.setStoredUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!authService.getToken(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};