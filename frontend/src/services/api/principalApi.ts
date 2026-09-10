import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  PrincipalDashboardResponse,
  PrincipalMonitoringResponse,
  PrincipalResourceRequestSummaryDto,
  PrincipalResourceRequestDetailDto,
  PrincipalResourceRequestFilterParams,
  PrincipalApprovalSummaryDto,
  PrincipalApprovalDetailDto,
  PrincipalApprovalFilterParams,
  PrincipalApprovalActionRequest,
  PrincipalAllocationSummaryDto,
  PrincipalAllocationDetailDto,
  PrincipalAllocationFilterParams,
} from '../../types/principal';

export const principalApi = {
  getDashboard: async (): Promise<ApiResponse<PrincipalDashboardResponse>> => {
    const response = await apiClient.get<ApiResponse<PrincipalDashboardResponse>>('/principal/dashboard');
    return response.data;
  },

  // Monitoring
  getMonitoring: async (): Promise<ApiResponse<PrincipalMonitoringResponse>> => {
    const response = await apiClient.get<ApiResponse<PrincipalMonitoringResponse>>('/principal/monitoring');
    return response.data;
  },

  // Resource Requests
  getResourceRequests: async (
    params?: PrincipalResourceRequestFilterParams
  ): Promise<ApiResponse<PagedResponse<PrincipalResourceRequestSummaryDto>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<PrincipalResourceRequestSummaryDto>>>(
      '/principal/resource-requests',
      { params }
    );
    return response.data;
  },

  getResourceRequest: async (id: number): Promise<ApiResponse<PrincipalResourceRequestDetailDto>> => {
    const response = await apiClient.get<ApiResponse<PrincipalResourceRequestDetailDto>>(
      `/principal/resource-requests/${id}`
    );
    return response.data;
  },

  approveResourceRequest: async (
    id: number,
    data?: PrincipalApprovalActionRequest
  ): Promise<ApiResponse<PrincipalResourceRequestDetailDto>> => {
    const response = await apiClient.patch<ApiResponse<PrincipalResourceRequestDetailDto>>(
      `/principal/resource-requests/${id}/approve`,
      data
    );
    return response.data;
  },

  rejectResourceRequest: async (
    id: number,
    data: PrincipalApprovalActionRequest
  ): Promise<ApiResponse<PrincipalResourceRequestDetailDto>> => {
    const response = await apiClient.patch<ApiResponse<PrincipalResourceRequestDetailDto>>(
      `/principal/resource-requests/${id}/reject`,
      data
    );
    return response.data;
  },

  // Approvals
  getApprovals: async (
    params?: PrincipalApprovalFilterParams
  ): Promise<ApiResponse<PagedResponse<PrincipalApprovalSummaryDto>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<PrincipalApprovalSummaryDto>>>(
      '/principal/approvals',
      { params }
    );
    return response.data;
  },

  getApproval: async (id: number): Promise<ApiResponse<PrincipalApprovalDetailDto>> => {
    const response = await apiClient.get<ApiResponse<PrincipalApprovalDetailDto>>(`/principal/approvals/${id}`);
    return response.data;
  },

  approveApproval: async (
    id: number,
    data?: PrincipalApprovalActionRequest
  ): Promise<ApiResponse<PrincipalApprovalDetailDto>> => {
    const response = await apiClient.patch<ApiResponse<PrincipalApprovalDetailDto>>(
      `/principal/approvals/${id}/approve`,
      data
    );
    return response.data;
  },

  rejectApproval: async (
    id: number,
    data: PrincipalApprovalActionRequest
  ): Promise<ApiResponse<PrincipalApprovalDetailDto>> => {
    const response = await apiClient.patch<ApiResponse<PrincipalApprovalDetailDto>>(
      `/principal/approvals/${id}/reject`,
      data
    );
    return response.data;
  },

  // Allocations
  getAllocations: async (
    params?: PrincipalAllocationFilterParams
  ): Promise<ApiResponse<PagedResponse<PrincipalAllocationSummaryDto>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<PrincipalAllocationSummaryDto>>>(
      '/principal/allocations',
      { params }
    );
    return response.data;
  },

  getAllocation: async (id: number): Promise<ApiResponse<PrincipalAllocationDetailDto>> => {
    const response = await apiClient.get<ApiResponse<PrincipalAllocationDetailDto>>(`/principal/allocations/${id}`);
    return response.data;
  },
};
