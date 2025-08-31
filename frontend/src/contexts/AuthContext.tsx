import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  register: (name: string, email: string, dateOfBirth: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  verifyLoginOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  googleSignIn: () => Promise<void>;
  checkAuthMethod: (email: string) => Promise<{ authMethod: string | null; userExists: boolean; isVerified: boolean }>;
  logout: () => void;
}

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
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Helper function to extract error messages
  const getErrorMessage = (error: any, fallback: string = 'An error occurred') => {
    // Check for validation errors first
    if (error.response?.data?.errors && error.response.data.errors.length > 0) {
      const validationError = error.response.data.errors[0];
      return validationError.msg || error.response.data.message || fallback;
    }
    // Check for general API error message
    return error.response?.data?.message || error.message || fallback;
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Optionally verify token validity with backend
          await authAPI.getCurrentUser();
        } catch (error) {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string) => {
    try {
      const response = await authAPI.login({ email });
      
      if (response.success) {
        toast.success('OTP sent to your email. Please verify to login.');
      } else {
        throw new Error(response.message || 'Failed to send login OTP');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Failed to send login OTP');
      toast.error(message);
      throw error;
    }
  };

  const register = async (name: string, email: string, dateOfBirth: string) => {
    try {
      const response = await authAPI.register({ name, email, dateOfBirth });
      
      if (response.success) {
        toast.success('Registration successful! Please check your email for OTP.');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Registration failed');
      toast.error(message);
      throw error;
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await authAPI.verifyOTP({ email, otp });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        setUser(userData);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Email verified successfully!');
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'OTP verification failed');
      toast.error(message);
      throw error;
    }
  };

  const verifyLoginOTP = async (email: string, otp: string) => {
    try {
      const response = await authAPI.verifyLoginOTP({ email, otp });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        setUser(userData);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Login successful!');
      } else {
        throw new Error(response.message || 'Login OTP verification failed');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Login OTP verification failed');
      toast.error(message);
      throw error;
    }
  };

  const resendOTP = async (email: string) => {
    try {
      const response = await authAPI.resendOTP({ email });
      
      if (response.success) {
        toast.success('OTP sent successfully!');
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Failed to send OTP');
      toast.error(message);
      throw error;
    }
  };

  const googleSignIn = async () => {
    try {
      // Sign in with Google using Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Send the ID token to our backend
      const response = await authAPI.googleAuth({ idToken });
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        setUser(userData);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success(response.message || 'Google authentication successful!');
      } else {
        throw new Error(response.message || 'Google authentication failed');
      }
    } catch (error: any) {
      // Sign out from Firebase if backend authentication fails
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.error('Error signing out from Firebase:', signOutError);
      }
      
      const message = getErrorMessage(error, 'Google authentication failed');
      toast.error(message);
      throw error;
    }
  };

  const checkAuthMethod = async (email: string) => {
    try {
      const response = await authAPI.checkAuthMethod({ email });
      
      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to check authentication method');
      }
    } catch (error: any) {
      const message = getErrorMessage(error, 'Failed to check authentication method');
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    verifyOTP,
    verifyLoginOTP,
    resendOTP,
    googleSignIn,
    checkAuthMethod,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
