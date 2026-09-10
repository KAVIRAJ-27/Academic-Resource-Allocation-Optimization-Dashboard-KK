import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  FacultyResourceRequestItem,
  FacultyResourceRequestDetails,
  FacultyResourceRequestSummaryCounts,
  FacultyAvailableResource,
  CreateFacultyResourceRequestPayload,
  FacultyResourceRequestFilterParams,
} from '../../types/faculty';

export const facultyResourceRequestApi = {
  getRequests: async (
    params?: FacultyResourceRequestFilterParams
  ): Promise<ApiResponse<PagedResponse<FacultyResourceRequestItem>>> => {
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
      if (params.categoryId) cleanParams.categoryId = params.categoryId;
      if (params.date) cleanParams.date = params.date;
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortDirection) cleanParams.sortDirection = params.sortDirection;
    }

    const response = await apiClient.get<ApiResponse<PagedResponse<FacultyResourceRequestItem>>>(
      '/faculty/resource-requests',
      { params: cleanParams }
    );
    return response.data;
  },

  getSummaryCounts: async (): Promise<ApiResponse<FacultyResourceRequestSummaryCounts>> => {
    const response = await apiClient.get<ApiResponse<FacultyResourceRequestSummaryCounts>>(
      '/faculty/resource-requests/summary'
    );
    return response.data;
  },

  getAvailableResources: async (
    categoryId?: number
  ): Promise<ApiResponse<FacultyAvailableResource[]>> => {
    const response = await apiClient.get<ApiResponse<FacultyAvailableResource[]>>(
      '/faculty/resource-requests/resources',
      { params: categoryId ? { categoryId } : undefined }
    );
    return response.data;
  },

  getRequestById: async (id: number): Promise<ApiResponse<FacultyResourceRequestDetails>> => {
    const response = await apiClient.get<ApiResponse<FacultyResourceRequestDetails>>(
      `/faculty/resource-requests/${id}`
    );
    return response.data;
  },

  createRequest: async (
    payload: CreateFacultyResourceRequestPayload
  ): Promise<ApiResponse<FacultyResourceRequestItem>> => {
    const response = await apiClient.post<ApiResponse<FacultyResourceRequestItem>>(
      '/faculty/resource-requests',
      payload
    );
    return response.data;
  },

  cancelRequest: async (id: number): Promise<ApiResponse<FacultyResourceRequestItem>> => {
    const response = await apiClient.patch<ApiResponse<FacultyResourceRequestItem>>(
      `/faculty/resource-requests/${id}/cancel`
    );
    return response.data;
  },
};
