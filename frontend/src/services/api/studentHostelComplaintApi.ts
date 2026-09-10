import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  StudentHostelComplaint,
  CreateHostelComplaintPayload,
  StudentHostelComplaintSummaryCounts,
  HostelComplaintFilters,
} from '../../types/studentHostelComplaint';

export const studentHostelComplaintApi = {
  getComplaints: async (
    params?: HostelComplaintFilters
  ): Promise<ApiResponse<PagedResponse<StudentHostelComplaint>>> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.category && params.category !== 'ALL') cleanParams.category = params.category;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortDir) cleanParams.sortDirection = params.sortDir;
    }

    const response = await apiClient.get<ApiResponse<PagedResponse<StudentHostelComplaint>>>(
      '/student/hostel/complaints',
      { params: cleanParams }
    );
    return response.data;
  },

  getSummaryCounts: async (): Promise<ApiResponse<StudentHostelComplaintSummaryCounts>> => {
    const response = await apiClient.get<ApiResponse<StudentHostelComplaintSummaryCounts>>(
      '/student/hostel/complaints/summary'
    );
    return response.data;
  },

  getComplaintById: async (id: number): Promise<ApiResponse<StudentHostelComplaint>> => {
    const response = await apiClient.get<ApiResponse<StudentHostelComplaint>>(
      `/student/hostel/complaints/${id}`
    );
    return response.data;
  },

  createComplaint: async (
    payload: CreateHostelComplaintPayload
  ): Promise<ApiResponse<StudentHostelComplaint>> => {
    const response = await apiClient.post<ApiResponse<StudentHostelComplaint>>(
      '/student/hostel/complaints',
      payload
    );
    return response.data;
  },
};
