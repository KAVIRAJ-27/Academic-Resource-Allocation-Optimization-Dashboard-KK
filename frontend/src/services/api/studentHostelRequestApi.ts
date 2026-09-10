import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  StudentHostelRequest,
  CreateHostelRequestPayload,
  StudentHostelRequestSummaryCounts,
  HostelRequestFilters,
} from '../../types/studentHostelRequest';

export const studentHostelRequestApi = {
  getRequests: async (
    params?: HostelRequestFilters
  ): Promise<ApiResponse<PagedResponse<StudentHostelRequest>>> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.requestType && params.requestType !== 'ALL') cleanParams.requestType = params.requestType;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortDir) cleanParams.sortDirection = params.sortDir;
    }

    const response = await apiClient.get<ApiResponse<PagedResponse<StudentHostelRequest>>>(
      '/student/hostel/requests',
      { params: cleanParams }
    );
    return response.data;
  },

  getSummaryCounts: async (): Promise<ApiResponse<StudentHostelRequestSummaryCounts>> => {
    const response = await apiClient.get<ApiResponse<StudentHostelRequestSummaryCounts>>(
      '/student/hostel/requests/summary'
    );
    return response.data;
  },

  getRequestById: async (id: number): Promise<ApiResponse<StudentHostelRequest>> => {
    const response = await apiClient.get<ApiResponse<StudentHostelRequest>>(
      `/student/hostel/requests/${id}`
    );
    return response.data;
  },

  createRequest: async (
    payload: CreateHostelRequestPayload
  ): Promise<ApiResponse<StudentHostelRequest>> => {
    const response = await apiClient.post<ApiResponse<StudentHostelRequest>>(
      '/student/hostel/requests',
      payload
    );
    return response.data;
  },

  cancelRequest: async (id: number): Promise<ApiResponse<StudentHostelRequest>> => {
    const response = await apiClient.patch<ApiResponse<StudentHostelRequest>>(
      `/student/hostel/requests/${id}/cancel`
    );
    return response.data;
  },
};
