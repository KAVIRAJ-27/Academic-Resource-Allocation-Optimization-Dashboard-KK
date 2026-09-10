import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import { FacultyProfile, UpdateFacultyProfilePayload } from '../../types/faculty';

export const facultyProfileApi = {
  getProfile: async (): Promise<ApiResponse<FacultyProfile>> => {
    const response = await apiClient.get<ApiResponse<FacultyProfile>>('/faculty/profile');
    return response.data;
  },

  updateProfile: async (payload: UpdateFacultyProfilePayload): Promise<ApiResponse<FacultyProfile>> => {
    const response = await apiClient.put<ApiResponse<FacultyProfile>>('/faculty/profile', payload);
    return response.data;
  },
};
