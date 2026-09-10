import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import {
  StudentProfile,
  StudentProfileUpdateRequest,
  StudentDashboardData,
} from '../../types/student';

export const studentApi = {
  getDashboard: async (): Promise<ApiResponse<StudentDashboardData>> => {
    const response = await apiClient.get<ApiResponse<StudentDashboardData>>('/student/dashboard');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<StudentProfile>> => {
    const response = await apiClient.get<ApiResponse<StudentProfile>>('/student/profile');
    return response.data;
  },

  updateProfile: async (data: StudentProfileUpdateRequest): Promise<ApiResponse<StudentProfile>> => {
    const response = await apiClient.put<ApiResponse<StudentProfile>>('/student/profile', data);
    return response.data;
  },
};
