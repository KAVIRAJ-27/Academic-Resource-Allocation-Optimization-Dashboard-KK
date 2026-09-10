import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  HostelAllocationResponseDto,
  HostelAllocationPreviewDto,
  HostelAllocationRequestDto,
  AutoHostelAllocationRequestDto,
  HostelAllocationPreviewRequestDto,
  HostelAllocationFilterParams,
} from '../../types/hostelAllocation';

import { HostelOptimizationRequest, OptimizationResult } from '../../types/optimization';

export const hostelAllocationApi = {
  /**
   * Evaluates explainable optimization recommendations for hostel bed allocation.
   */
  optimizeAllocation: async (
    request: HostelOptimizationRequest
  ): Promise<ApiResponse<OptimizationResult>> => {
    const response = await apiClient.post<ApiResponse<OptimizationResult>>(
      '/hostel/resource-allocations/optimize',
      request
    );
    return response.data;
  },

  /**
   * Paged search of hostel bed allocations.
   */
  getAllocations: async (
    params?: HostelAllocationFilterParams
  ): Promise<ApiResponse<PagedResponse<HostelAllocationResponseDto>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<HostelAllocationResponseDto>>>(
      '/hostel/resource-allocations',
      { params }
    );
    return response.data;
  },

  /**
   * Retrieves single allocation details.
   */
  getAllocationById: async (
    id: number
  ): Promise<ApiResponse<HostelAllocationResponseDto>> => {
    const response = await apiClient.get<ApiResponse<HostelAllocationResponseDto>>(
      `/hostel/resource-allocations/${id}`
    );
    return response.data;
  },

  /**
   * Simulates an allocation preview without mutating database state.
   */
  previewAllocation: async (
    request: HostelAllocationPreviewRequestDto
  ): Promise<ApiResponse<HostelAllocationPreviewDto>> => {
    const response = await apiClient.post<ApiResponse<HostelAllocationPreviewDto>>(
      '/hostel/resource-allocations/preview',
      request
    );
    return response.data;
  },

  /**
   * Deterministically auto-allocates the optimal candidate bed to a student request.
   */
  autoAllocate: async (
    request: AutoHostelAllocationRequestDto
  ): Promise<ApiResponse<HostelAllocationResponseDto>> => {
    const response = await apiClient.post<ApiResponse<HostelAllocationResponseDto>>(
      '/hostel/resource-allocations/auto',
      request
    );
    return response.data;
  },

  /**
   * Manually allocates a specific bed to a student.
   */
  allocate: async (
    request: HostelAllocationRequestDto
  ): Promise<ApiResponse<HostelAllocationResponseDto>> => {
    const response = await apiClient.post<ApiResponse<HostelAllocationResponseDto>>(
      '/hostel/resource-allocations/manual',
      request
    );
    return response.data;
  },

  /**
   * Alias for manualAllocation.
   */
  manualAllocation: async (
    request: HostelAllocationRequestDto
  ): Promise<ApiResponse<HostelAllocationResponseDto>> => {
    const response = await apiClient.post<ApiResponse<HostelAllocationResponseDto>>(
      '/hostel/resource-allocations/manual',
      request
    );
    return response.data;
  },

  /**
   * Releases an active bed allocation, marking status COMPLETED and updating bed to AVAILABLE.
   */
  releaseAllocation: async (
    id: number
  ): Promise<ApiResponse<HostelAllocationResponseDto>> => {
    const response = await apiClient.patch<ApiResponse<HostelAllocationResponseDto>>(
      `/hostel/resource-allocations/${id}/release`
    );
    return response.data;
  },
};
