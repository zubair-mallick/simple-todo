import axios from 'axios';
import toast from 'react-hot-toast';
import type { AuthResponse, APIResponse, Note } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance for general API calls
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate axios instance for auth operations with longer timeout
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for auth operations (email can be slow)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (for both instances)
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Response interceptor for error handling (for both instances)
const handleResponseError = (error: any) => {
  // Only redirect on 401 if we're on a protected route and have a token
  if (error.response?.status === 401 && localStorage.getItem('auth_token')) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    toast.error('Session expired. Please login again.');
    // Use a timeout to allow current operations to complete
    setTimeout(() => {
      if (window.location.pathname !== '/' && window.location.pathname !== '/register' && window.location.pathname !== '/verify-otp') {
        window.location.href = '/';
      }
    }, 100);
  }
  return Promise.reject(error);
};

// Apply interceptors to both instances
api.interceptors.request.use(addAuthToken);
api.interceptors.response.use((response) => response, handleResponseError);

authApi.interceptors.request.use(addAuthToken);
authApi.interceptors.response.use((response) => response, handleResponseError);

// Auth API - Using authApi with longer timeout for operations that involve email sending
export const authAPI = {
  register: async (data: { name: string; email: string; dateOfBirth: string }) => {
    const response = await authApi.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  verifyOTP: async (data: { email: string; otp: string }) => {
    const response = await authApi.post<AuthResponse>('/auth/verify-otp', data);
    return response.data;
  },

  resendOTP: async (data: { email: string }) => {
    const response = await authApi.post<APIResponse>('/auth/resend-otp', data);
    return response.data;
  },

  login: async (data: { email: string }) => {
    const response = await authApi.post<APIResponse>('/auth/login', data);
    return response.data;
  },

  verifyLoginOTP: async (data: { email: string; otp: string }) => {
    const response = await authApi.post<AuthResponse>('/auth/verify-login-otp', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<APIResponse<{ user: any }>>('/auth/me');
    return response.data;
  },

  googleAuth: async (data: { idToken: string }) => {
    const response = await authApi.post<AuthResponse>('/auth/google', data);
    return response.data;
  },

  checkAuthMethod: async (data: { email: string }) => {
    const response = await api.post<APIResponse<{ authMethod: string | null; userExists: boolean; isVerified: boolean }>>('/auth/check-auth-method', data);
    return response.data;
  },
};

// Notes API
export const notesAPI = {
  getNotes: async () => {
    const response = await api.get<APIResponse<{ notes: Note[] }>>('/notes');
    return response.data;
  },

  createNote: async (data: { title: string; content: string }) => {
    const response = await api.post<APIResponse<{ note: Note }>>('/notes', data);
    return response.data;
  },

  updateNote: async (id: string, data: { title: string; content: string }) => {
    const response = await api.put<APIResponse<{ note: Note }>>(`/notes/${id}`, data);
    return response.data;
  },

  deleteNote: async (id: string) => {
    const response = await api.delete<APIResponse>(`/notes/${id}`);
    return response.data;
  },

  togglePin: async (id: string) => {
    const response = await api.patch<APIResponse<{ note: Note }>>(`/notes/${id}/pin`);
    return response.data;
  },
};

export default api;
