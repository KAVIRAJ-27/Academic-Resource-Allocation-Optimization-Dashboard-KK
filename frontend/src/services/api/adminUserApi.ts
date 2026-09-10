import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
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

export interface UpdateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles?: string[];
  status?: string;
}

export interface GetUsersParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const adminUserApi = {
  getUsers: async (params?: GetUsersParams): Promise<ApiResponse<PagedResponse<UserSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<UserSummary>>>('/admin/users', {
      params,
    });
    return response.data;
  },

  getUserById: async (id: number): Promise<ApiResponse<UserSummary>> => {
    const response = await apiClient.get<ApiResponse<UserSummary>>(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserData): Promise<ApiResponse<UserSummary>> => {
    const response = await apiClient.post<ApiResponse<UserSummary>>('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserData): Promise<ApiResponse<UserSummary>> => {
    const response = await apiClient.put<ApiResponse<UserSummary>>(`/admin/users/${id}`, data);
    return response.data;
  },

  updateUserStatus: async (id: number, status: string): Promise<ApiResponse<UserSummary>> => {
    const response = await apiClient.patch<ApiResponse<UserSummary>>(`/admin/users/${id}/status`, {
      status,
    });
    return response.data;
  },

  updateUserRoles: async (id: number, roles: string[]): Promise<ApiResponse<UserSummary>> => {
    const response = await apiClient.patch<ApiResponse<UserSummary>>(`/admin/users/${id}/roles`, {
      roles,
    });
    return response.data;
  },

  resetUserPassword: async (id: number, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `/admin/users/${id}/reset-password`,
      { newPassword }
    );
    return response.data;
  },
};
