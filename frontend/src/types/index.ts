// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  authProvider: 'email' | 'google';
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: ValidationError[];
}

export interface ValidationError {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
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

export interface NotesResponse {
  success: boolean;
  message?: string;
  data?: {
    notes: Note[];
    pagination: PaginationInfo;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalNotes: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NoteStats {
  totalNotes: number;
  pinnedNotes: number;
  recentNotes: number;
  topTags: Array<{
    name: string;
    count: number;
  }>;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OTPFormData {
  email: string;
  otp: string;
}

export interface NoteFormData {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  color: string;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
}

export interface NotesContextType {
  notes: Note[];
  stats: NoteStats | null;
  isLoading: boolean;
  filters: NotesFilters;
  getNotes: () => Promise<void>;
  getNote: (id: string) => Promise<Note>;
  createNote: (data: NoteFormData) => Promise<void>;
  updateNote: (id: string, data: Partial<NoteFormData>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  getStats: () => Promise<void>;
  setFilters: (filters: Partial<NotesFilters>) => void;
}

export interface NotesFilters {
  page: number;
  limit: number;
  search: string;
  pinned?: boolean;
  tags?: string;
}
