// User types
export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  avatar?: string;
  authProvider: 'otp';
  createdAt?: string;
}

// Auth response types
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Note types
export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Form data types
export interface RegisterFormData {
  name: string;
  email: string;
  dateOfBirth: string;
}

export interface LoginFormData {
  email: string;
}

export interface OTPFormData {
  email: string;
  otp: string;
}
