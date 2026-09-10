import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import { FacultyWorkloadResponse } from '../../types/faculty';

export const facultyWorkloadApi = {
  getWorkload: async (): Promise<ApiResponse<FacultyWorkloadResponse>> => {
    const response = await apiClient.get<ApiResponse<FacultyWorkloadResponse>>(
      '/faculty/workload'
    );
    return response.data;
  },
};
