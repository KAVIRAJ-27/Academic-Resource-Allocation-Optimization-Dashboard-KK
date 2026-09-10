import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import {
  AdminDashboardOverview,
  UserDistribution,
  AcademicResourceOverview,
  HostelResourceOverview,
} from '../../types/dashboard';

export const adminDashboardApi = {
  getOverview: async (): Promise<ApiResponse<AdminDashboardOverview>> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardOverview>>('/admin/dashboard/overview');
    return response.data;
  },

  getUserDistribution: async (): Promise<ApiResponse<UserDistribution>> => {
    const response = await apiClient.get<ApiResponse<UserDistribution>>('/admin/dashboard/user-distribution');
    return response.data;
  },

  getAcademicSummary: async (): Promise<ApiResponse<AcademicResourceOverview>> => {
    const response = await apiClient.get<ApiResponse<AcademicResourceOverview>>('/admin/dashboard/academic-summary');
    return response.data;
  },

  getHostelSummary: async (): Promise<ApiResponse<HostelResourceOverview>> => {
    const response = await apiClient.get<ApiResponse<HostelResourceOverview>>('/admin/dashboard/hostel-summary');
    return response.data;
  },
};
