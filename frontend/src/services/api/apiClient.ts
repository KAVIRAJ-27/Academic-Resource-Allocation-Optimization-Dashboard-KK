import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../../types/api';
import { authStorage } from '../../utils/authStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request interceptor for Bearer JWT token from centralized authStorage
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error mapping and 401/403 status handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status || 500;

    // 401 Handling: Clear auth and redirect only if not already navigating to /login
    if (status === 401) {
      const isLoginUrl = error.config?.url?.includes('/auth/login');
      if (!isLoginUrl && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          authStorage.clearAuth();
          // Avoid infinite loops by direct replace
          window.location.replace('/login?expired=true');
        }
      }
    }

    // 403 Forbidden is NOT logged out - caller or route guard renders unauthorized feedback

    const customError: ApiErrorResponse = {
      success: false,
      status,
      error: error.response?.data?.error || (status === 403 ? 'FORBIDDEN' : status === 401 ? 'UNAUTHORIZED' : 'Network Error'),
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected communication error occurred. Please check server connectivity.',
      path: error.response?.data?.path || error.config?.url,
      details: error.response?.data?.details,
      timestamp: error.response?.data?.timestamp || new Date().toISOString(),
    };

    return Promise.reject(customError);
  }
);
