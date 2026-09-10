import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import { UserSummary } from '../../types/auth';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: string[];
  status?: string;
}

export const adminApi = {
  getOverview: async () => {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>('/admin/overview');
    return response.data;
  },

  getUsers: async (params?: { search?: string; role?: string; status?: string }) => {
    const response = await apiClient.get<ApiResponse<UserSummary[]>>('/admin/users', {
      params,
    });
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await apiClient.get<ApiResponse<UserSummary>>(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserData) => {
    const response = await apiClient.post<ApiResponse<UserSummary>>('/admin/users', data);
    return response.data;
  },

  updateUserStatus: async (id: number, status: string) => {
    const response = await apiClient.patch<ApiResponse<UserSummary>>(`/admin/users/${id}/status`, {
      status,
    });
    return response.data;
  },

  updateUserRoles: async (id: number, roles: string[]) => {
    const response = await apiClient.patch<ApiResponse<UserSummary>>(`/admin/users/${id}/roles`, {
      roles,
    });
    return response.data;
  },

  resetUserPassword: async (id: number, newPassword: string) => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/admin/users/${id}/reset-password`,
      { newPassword }
    );
    return response.data;
  },

  getDepartments: async () => {
    return Promise.resolve({
      success: true,
      message: 'Departments placeholder ready',
      data: [],
      timestamp: new Date().toISOString(),
    });
  },
};
