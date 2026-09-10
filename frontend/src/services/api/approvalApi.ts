import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  ApprovalSummaryDto,
  ApprovalDetailDto,
  ApprovalFilterParams,
  CreateApprovalRequestDto,
  ApprovalActionRequestDto,
  AllocationTimelineItemDto,
} from '../../types/approval';

export const approvalApi = {
  /**
   * Submit a new request for approval.
   */
  createApproval: async (data: CreateApprovalRequestDto): Promise<ApprovalSummaryDto> => {
    const res = await apiClient.post<ApiResponse<ApprovalSummaryDto>>('/approvals', data);
    return res.data.data;
  },

  /**
   * List approvals with filtering and pagination.
   */
  getApprovals: async (
    params?: ApprovalFilterParams,
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Promise<PagedResponse<ApprovalSummaryDto>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ApprovalSummaryDto>>>('/approvals', {
      params: { ...params, page, size, sort },
    });
    return res.data.data;
  },

  /**
   * List approvals currently pending the authenticated user's action.
   */
  getPendingApprovals: async (
    page = 0,
    size = 10,
    sort = 'createdAt,desc'
  ): Promise<PagedResponse<ApprovalSummaryDto>> => {
    const res = await apiClient.get<ApiResponse<PagedResponse<ApprovalSummaryDto>>>('/approvals/pending', {
      params: { page, size, sort },
    });
    return res.data.data;
  },

  /**
   * Get approval details along with real-time Phase 30 live conflict detection.
   */
  getApprovalById: async (id: number): Promise<ApprovalDetailDto> => {
    const res = await apiClient.get<ApiResponse<ApprovalDetailDto>>(`/approvals/${id}`);
    return res.data.data;
  },

  /**
   * Approve a request and trigger transactional resource allocation.
   */
  approve: async (id: number, data?: ApprovalActionRequestDto): Promise<ApprovalDetailDto> => {
    const res = await apiClient.post<ApiResponse<ApprovalDetailDto>>(`/approvals/${id}/approve`, data || {});
    return res.data.data;
  },

  /**
   * Reject a request with mandatory comments.
   */
  reject: async (id: number, data?: ApprovalActionRequestDto): Promise<ApprovalDetailDto> => {
    const res = await apiClient.post<ApiResponse<ApprovalDetailDto>>(`/approvals/${id}/reject`, data || {});
    return res.data.data;
  },

  /**
   * Retrieve chronological lifecycle milestones for an approval.
   */
  getApprovalTimeline: async (id: number): Promise<AllocationTimelineItemDto[]> => {
    const res = await apiClient.get<ApiResponse<AllocationTimelineItemDto[]>>(`/approvals/${id}/timeline`);
    return res.data.data;
  },

  /**
   * Retrieve chronological lifecycle milestones for an academic allocation.
   */
  getAcademicAllocationTimeline: async (allocationId: number): Promise<AllocationTimelineItemDto[]> => {
    const res = await apiClient.get<ApiResponse<AllocationTimelineItemDto[]>>(
      `/academic/resource-allocations/${allocationId}/timeline`
    );
    return res.data.data;
  },

  /**
   * Retrieve chronological lifecycle milestones for a hostel allocation.
   */
  getHostelAllocationTimeline: async (allocationId: number): Promise<AllocationTimelineItemDto[]> => {
    const res = await apiClient.get<ApiResponse<AllocationTimelineItemDto[]>>(
      `/hostel/resource-allocations/${allocationId}/timeline`
    );
    return res.data.data;
  },
};

