import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import { FacultyDashboardData } from '../../types/faculty';

export const facultyDashboardApi = {
  getDashboard: async (): Promise<ApiResponse<FacultyDashboardData>> => {
    const response = await apiClient.get<ApiResponse<FacultyDashboardData>>('/faculty/dashboard');
    return response.data;
  },
};
