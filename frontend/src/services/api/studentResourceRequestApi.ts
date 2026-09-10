import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  StudentResourceRequest,
  CreateResourceRequestPayload,
  StudentResourceSummary,
  StudentResourceRequestSummaryCounts,
  ResourceRequestFilters,
} from '../../types/studentResourceRequest';

export const studentResourceRequestApi = {
  getRequests: async (
    params?: ResourceRequestFilters
  ): Promise<ApiResponse<PagedResponse<StudentResourceRequest>>> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.categoryId) cleanParams.categoryId = params.categoryId;
      if (params.date) cleanParams.date = params.date;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortDir) cleanParams.sortDirection = params.sortDir;
    }

    const response = await apiClient.get<ApiResponse<PagedResponse<StudentResourceRequest>>>(
      '/student/resource-requests',
      { params: cleanParams }
    );
    return response.data;
  },

  getSummaryCounts: async (): Promise<ApiResponse<StudentResourceRequestSummaryCounts>> => {
    const response = await apiClient.get<ApiResponse<StudentResourceRequestSummaryCounts>>(
      '/student/resource-requests/summary'
    );
    return response.data;
  },

  getAvailableResources: async (categoryId?: number): Promise<ApiResponse<StudentResourceSummary[]>> => {
    const response = await apiClient.get<ApiResponse<StudentResourceSummary[]>>(
      '/student/resource-requests/resources',
      { params: categoryId ? { categoryId } : undefined }
    );
    return response.data;
  },

  getRequestById: async (id: number): Promise<ApiResponse<StudentResourceRequest>> => {
    const response = await apiClient.get<ApiResponse<StudentResourceRequest>>(
      `/student/resource-requests/${id}`
    );
    return response.data;
  },

  createRequest: async (
    payload: CreateResourceRequestPayload
  ): Promise<ApiResponse<StudentResourceRequest>> => {
    const response = await apiClient.post<ApiResponse<StudentResourceRequest>>(
      '/student/resource-requests',
      payload
    );
    return response.data;
  },

  cancelRequest: async (id: number): Promise<ApiResponse<StudentResourceRequest>> => {
    const response = await apiClient.patch<ApiResponse<StudentResourceRequest>>(
      `/student/resource-requests/${id}/cancel`
    );
    return response.data;
  },
};
