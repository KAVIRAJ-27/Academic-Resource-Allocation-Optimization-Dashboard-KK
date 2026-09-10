import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import { HodDashboardResponse } from '../../types/hod';

export const hodDashboardApi = {
  getDashboard: async (): Promise<ApiResponse<HodDashboardResponse>> => {
    const response = await apiClient.get<ApiResponse<HodDashboardResponse>>('/hod/dashboard');
    return response.data;
  },
};
