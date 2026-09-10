import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import { StudentHostelResponse, StudentHostelAllocationHistory } from '../../types/studentHostel';

export const studentHostelApi = {
  getHostel: async (): Promise<ApiResponse<StudentHostelResponse>> => {
    const response = await apiClient.get<ApiResponse<StudentHostelResponse>>('/student/hostel');
    return response.data;
  },

  getHostelHistory: async (): Promise<ApiResponse<StudentHostelAllocationHistory[]>> => {
    const response = await apiClient.get<ApiResponse<StudentHostelAllocationHistory[]>>('/student/hostel/history');
    return response.data;
  },
};
