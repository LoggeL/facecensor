import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth
export interface User {
  id: number;
  email: string;
  username: string;
  credits: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  register: (email: string, username: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, username, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<User>('/auth/me'),
};

// Images
export interface ImageRecord {
  id: number;
  original_filename: string;
  faces_detected: number;
  status: string;
  credits_used: number;
  created_at: string;
  has_processed: boolean;
}

export const imagesApi = {
  upload: (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<ImageRecord>('/images/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },

  list: () => api.get<ImageRecord[]>('/images/'),

  originalUrl: (id: number) => `${API_BASE}/images/${id}/original?token=${localStorage.getItem('token')}`,
  processedUrl: (id: number) => `${API_BASE}/images/${id}/processed?token=${localStorage.getItem('token')}`,
};

// Credits
export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
  popular: boolean;
}

export interface Transaction {
  id: number;
  credits: number;
  amount_usd: number | null;
  type: string;
  description: string | null;
  created_at: string;
}

export const creditsApi = {
  packages: () => api.get<CreditPackage[]>('/credits/packages'),
  balance: () => api.get<{ credits: number; transactions: Transaction[] }>('/credits/balance'),
  purchase: (package_id: string) => api.post('/credits/purchase', { package_id }),
};
