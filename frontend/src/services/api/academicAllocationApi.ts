import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  AcademicAllocationSummaryDto,
  AcademicAllocationDetailDto,
  AcademicAllocationPreviewDto,
  CreateAcademicAllocationRequest,
  AutoAcademicAllocationRequest,
  PreviewAcademicAllocationRequest,
  AcademicAllocationFilterParams,
} from '../../types/academicAllocation';

import { AcademicOptimizationRequest, OptimizationResult } from '../../types/optimization';

export const academicAllocationApi = {
  /**
   * Evaluates explainable optimization recommendations for academic allocation.
   */
  optimizeAllocation: async (
    request: AcademicOptimizationRequest
  ): Promise<ApiResponse<OptimizationResult>> => {
    const response = await apiClient.post<ApiResponse<OptimizationResult>>(
      '/academic/resource-allocations/optimize',
      request
    );
    return response.data;
  },

  /**
   * Paged search of academic resource allocations.
   */
  getAllocations: async (
    params?: AcademicAllocationFilterParams
  ): Promise<ApiResponse<PagedResponse<AcademicAllocationSummaryDto>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<AcademicAllocationSummaryDto>>>(
      '/academic/resource-allocations',
      { params }
    );
    return response.data;
  },

  /**
   * Retrieves single allocation details.
   */
  getAllocationById: async (
    id: number
  ): Promise<ApiResponse<AcademicAllocationDetailDto>> => {
    const response = await apiClient.get<ApiResponse<AcademicAllocationDetailDto>>(
      `/academic/resource-allocations/${id}`
    );
    return response.data;
  },

  /**
   * Manually allocates a selected resource to a request.
   */
  allocateResource: async (
    request: CreateAcademicAllocationRequest
  ): Promise<ApiResponse<AcademicAllocationDetailDto>> => {
    const response = await apiClient.post<ApiResponse<AcademicAllocationDetailDto>>(
      '/academic/resource-allocations',
      request
    );
    return response.data;
  },

  /**
   * Deterministically auto-allocates the best candidate resource.
   */
  autoAllocateResource: async (
    request: AutoAcademicAllocationRequest
  ): Promise<ApiResponse<AcademicAllocationDetailDto>> => {
    const response = await apiClient.post<ApiResponse<AcademicAllocationDetailDto>>(
      '/academic/resource-allocations/auto',
      request
    );
    return response.data;
  },

  /**
   * Evaluates candidate resources and conflicts without allocating.
   */
  previewAllocation: async (
    request: PreviewAcademicAllocationRequest
  ): Promise<ApiResponse<AcademicAllocationPreviewDto>> => {
    const response = await apiClient.post<ApiResponse<AcademicAllocationPreviewDto>>(
      '/academic/resource-allocations/preview',
      request
    );
    return response.data;
  },

  /**
   * Safely cancels an allocation without deleting historical logs.
   */
  cancelAllocation: async (
    id: number,
    remarks?: string
  ): Promise<ApiResponse<AcademicAllocationDetailDto>> => {
    const response = await apiClient.patch<ApiResponse<AcademicAllocationDetailDto>>(
      `/academic/resource-allocations/${id}/cancel`,
      null,
      { params: remarks ? { remarks } : undefined }
    );
    return response.data;
  },
};
