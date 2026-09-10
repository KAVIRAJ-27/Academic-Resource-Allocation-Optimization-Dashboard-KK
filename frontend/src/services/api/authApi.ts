import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import {
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  UpdateProfileData,
  UserSummary,
} from '../../types/auth';

export interface LoginApiResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  status: string;
}

export interface CurrentUserApiResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
  permissions: string[];
  status: string;
  lastLoginAt?: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<ApiResponse<LoginApiResponse>>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await apiClient.post<ApiResponse<CurrentUserApiResponse>>(
      '/auth/register',
      data
    );
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<ApiResponse<CurrentUserApiResponse>>('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/auth/logout');
      return response.data;
    } catch {
      // Allow local logout even if server communication fails
      return { success: true, message: 'Logged out', data: null, timestamp: new Date().toISOString() };
    }
  },

  changePassword: async (data: ChangePasswordData) => {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/change-password',
      data
    );
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData) => {
    const response = await apiClient.put<ApiResponse<UserSummary>>(
      '/auth/profile',
      data
    );
    return response.data;
  },
};
