import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { APIResponse, AuthResponse, NotesResponse, Note, NoteStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  register: (data: { name: string; email: string; password: string }): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/register', data),

  verifyOTP: (data: { email: string; otp: string }): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/verify-otp', data),

  resendOTP: (data: { email: string }): Promise<AxiosResponse<APIResponse>> =>
    api.post('/auth/resend-otp', data),

  login: (data: { email: string; password: string }): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/login', data),

  googleAuth: (data: { credential: string }): Promise<AxiosResponse<AuthResponse>> =>
    api.post('/auth/google', data),

  getCurrentUser: (): Promise<AxiosResponse<APIResponse<{ user: any }>>> =>
    api.get('/auth/me'),
};

// Notes API functions
export const notesAPI = {
  getNotes: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    pinned?: boolean;
    tags?: string;
  }): Promise<AxiosResponse<NotesResponse>> =>
    api.get('/notes', { params }),

  getNote: (id: string): Promise<AxiosResponse<APIResponse<{ note: Note }>>> =>
    api.get(`/notes/${id}`),

  createNote: (data: {
    title: string;
    content: string;
    tags?: string[];
    isPinned?: boolean;
    color?: string;
  }): Promise<AxiosResponse<APIResponse<{ note: Note }>>> =>
    api.post('/notes', data),

  updateNote: (id: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
    color?: string;
  }): Promise<AxiosResponse<APIResponse<{ note: Note }>>> =>
    api.put(`/notes/${id}`, data),

  deleteNote: (id: string): Promise<AxiosResponse<APIResponse>> =>
    api.delete(`/notes/${id}`),

  deleteMultiple: (data: { noteIds: string[] }): Promise<AxiosResponse<APIResponse>> =>
    api.delete('/notes/bulk', { data }),

  togglePin: (id: string): Promise<AxiosResponse<APIResponse<{ note: Note }>>> =>
    api.patch(`/notes/${id}/pin`),

  getStats: (): Promise<AxiosResponse<APIResponse<NoteStats>>> =>
    api.get('/notes/stats'),
};

// Health check
export const healthCheck = (): Promise<AxiosResponse<APIResponse>> =>
  api.get('/health');

export default api;
