import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  HodFacultySummary,
  HodFacultyDetail,
  HodUpdateFacultyRequest,
  HodUpdateStatusRequest,
  HodStudentSummary,
  HodStudentDetail,
  HodUpdateStudentRequest,
  HodStudentReferenceData,
  HodDepartmentWorkloadOverview,
  HodFacultyWorkloadDetail,
  HodDepartmentAssignmentItem,
  HodResourceRequestSummary,
  HodResourceRequestDetail,
  HodApprovalActionRequest,
  HodResourceRequestOverviewKpi,
  HodResourceAllocationSummary,
  HodResourceAllocationDetail,
  HodResourceAllocationOverviewKpi,
} from '../../types/hod';

export interface FacultyQueryParams {
  search?: string;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface StudentQueryParams {
  search?: string;
  programId?: number;
  sectionId?: number;
  semester?: number;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ResourceRequestQueryParams {
  categoryId?: number;
  resourceId?: number;
  status?: string;
  priority?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AllocationQueryParams {
  resourceId?: number;
  allocatedToUserId?: number;
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const hodApi = {
  // =====================
  // FACULTY MANAGEMENT
  // =====================
  getFaculty: async (params?: FacultyQueryParams): Promise<ApiResponse<PagedResponse<HodFacultySummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<HodFacultySummary>>>('/hod/faculty', {
      params,
    });
    return response.data;
  },

  getFacultyById: async (id: number): Promise<ApiResponse<HodFacultyDetail>> => {
    const response = await apiClient.get<ApiResponse<HodFacultyDetail>>(`/hod/faculty/${id}`);
    return response.data;
  },

  updateFacultyStatus: async (
    id: number,
    data: HodUpdateStatusRequest
  ): Promise<ApiResponse<HodFacultySummary>> => {
    const response = await apiClient.patch<ApiResponse<HodFacultySummary>>(`/hod/faculty/${id}/status`, data);
    return response.data;
  },

  updateFacultyProfile: async (
    id: number,
    data: HodUpdateFacultyRequest
  ): Promise<ApiResponse<HodFacultyDetail>> => {
    const response = await apiClient.put<ApiResponse<HodFacultyDetail>>(`/hod/faculty/${id}`, data);
    return response.data;
  },

  // =====================
  // STUDENT MANAGEMENT
  // =====================
  getStudents: async (params?: StudentQueryParams): Promise<ApiResponse<PagedResponse<HodStudentSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<HodStudentSummary>>>('/hod/students', {
      params,
    });
    return response.data;
  },

  getStudentById: async (id: number): Promise<ApiResponse<HodStudentDetail>> => {
    const response = await apiClient.get<ApiResponse<HodStudentDetail>>(`/hod/students/${id}`);
    return response.data;
  },

  getStudentReferenceData: async (): Promise<ApiResponse<HodStudentReferenceData>> => {
    const response = await apiClient.get<ApiResponse<HodStudentReferenceData>>('/hod/students/reference-data');
    return response.data;
  },

  updateStudentStatus: async (
    id: number,
    data: HodUpdateStatusRequest
  ): Promise<ApiResponse<HodStudentSummary>> => {
    const response = await apiClient.patch<ApiResponse<HodStudentSummary>>(`/hod/students/${id}/status`, data);
    return response.data;
  },

  updateStudentProfile: async (
    id: number,
    data: HodUpdateStudentRequest
  ): Promise<ApiResponse<HodStudentDetail>> => {
    const response = await apiClient.put<ApiResponse<HodStudentDetail>>(`/hod/students/${id}`, data);
    return response.data;
  },

  // =====================
  // WORKLOAD MANAGEMENT
  // =====================
  getWorkloadOverview: async (): Promise<ApiResponse<HodDepartmentWorkloadOverview>> => {
    const response = await apiClient.get<ApiResponse<HodDepartmentWorkloadOverview>>('/hod/workload');
    return response.data;
  },

  getFacultyWorkloadDetail: async (facultyId: number): Promise<ApiResponse<HodFacultyWorkloadDetail>> => {
    const response = await apiClient.get<ApiResponse<HodFacultyWorkloadDetail>>(`/hod/workload/${facultyId}`);
    return response.data;
  },

  getDepartmentAssignments: async (): Promise<ApiResponse<HodDepartmentAssignmentItem[]>> => {
    const response = await apiClient.get<ApiResponse<HodDepartmentAssignmentItem[]>>('/hod/workload/assignments');
    return response.data;
  },

  // ===================================
  // PHASE 22: RESOURCE REQUESTS
  // ===================================
  getResourceRequests: async (
    params?: ResourceRequestQueryParams
  ): Promise<ApiResponse<PagedResponse<HodResourceRequestSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<HodResourceRequestSummary>>>(
      '/hod/resource-requests',
      { params }
    );
    return response.data;
  },

  getResourceRequestById: async (id: number): Promise<ApiResponse<HodResourceRequestDetail>> => {
    const response = await apiClient.get<ApiResponse<HodResourceRequestDetail>>(`/hod/resource-requests/${id}`);
    return response.data;
  },

  getResourceRequestSummary: async (): Promise<ApiResponse<HodResourceRequestOverviewKpi>> => {
    const response = await apiClient.get<ApiResponse<HodResourceRequestOverviewKpi>>('/hod/resource-requests/summary');
    return response.data;
  },

  approveResourceRequest: async (
    id: number,
    data?: HodApprovalActionRequest
  ): Promise<ApiResponse<HodResourceRequestDetail>> => {
    const response = await apiClient.patch<ApiResponse<HodResourceRequestDetail>>(
      `/hod/resource-requests/${id}/approve`,
      data || {}
    );
    return response.data;
  },

  rejectResourceRequest: async (
    id: number,
    data: HodApprovalActionRequest
  ): Promise<ApiResponse<HodResourceRequestDetail>> => {
    const response = await apiClient.patch<ApiResponse<HodResourceRequestDetail>>(
      `/hod/resource-requests/${id}/reject`,
      data
    );
    return response.data;
  },

  // ===================================
  // PHASE 22: RESOURCE ALLOCATIONS
  // ===================================
  getAllocations: async (
    params?: AllocationQueryParams
  ): Promise<ApiResponse<PagedResponse<HodResourceAllocationSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<HodResourceAllocationSummary>>>(
      '/hod/allocations',
      { params }
    );
    return response.data;
  },

  getAllocationById: async (id: number): Promise<ApiResponse<HodResourceAllocationDetail>> => {
    const response = await apiClient.get<ApiResponse<HodResourceAllocationDetail>>(`/hod/allocations/${id}`);
    return response.data;
  },

  getAllocationSummary: async (): Promise<ApiResponse<HodResourceAllocationOverviewKpi>> => {
    const response = await apiClient.get<ApiResponse<HodResourceAllocationOverviewKpi>>('/hod/allocations/summary');
    return response.data;
  },
};
