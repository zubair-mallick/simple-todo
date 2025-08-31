import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthContextType, RegisterFormData } from '../types';
import { authAPI } from '../utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          
          // Verify token is still valid
          await getCurrentUser();
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const register = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        // Registration successful, redirect to OTP verification
        return;
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error.response?.data || error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyOTP({ email, otp });

      if (response.data.success && response.data.data) {
        const { user: userData, token: authToken } = response.data.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.data.message || 'OTP verification failed');
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw error.response?.data || error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.resendOTP({ email });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      throw error.response?.data || error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ email, password });

      if (response.data.success && response.data.data) {
        const { user: userData, token: authToken } = response.data.data;
        
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error.response?.data || error;
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.data.success && response.data.data) {
        const userData = response.data.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Get current user error:', error);
      logout();
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    register,
    verifyOTP,
    resendOTP,
    login,
    logout,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
