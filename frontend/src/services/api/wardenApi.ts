import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  WardenHostelOption,
  WardenRoomSummary,
  WardenRoomDetail,
  WardenRoomFilterParams,
  WardenBedSummary,
  WardenBedDetail,
  WardenBedFilterParams,
  WardenStudentSearch,
  WardenStudentSearchParams,
  WardenAllocationSummary,
  WardenAllocationDetail,
  WardenAllocationFilterParams,
  CreateHostelAllocationRequest,
} from '../../types/wardenAllocation';
import {
  WardenFacilitySummary,
  WardenFacilityDetail,
  UpdateFacilityRequest,
  WardenFacilityFilterParams,
  WardenComplaintSummary,
  WardenComplaintDetail,
  UpdateComplaintStatusRequest,
  WardenComplaintFilterParams,
  WardenMaintenanceSummary,
  WardenMaintenanceDetail,
  UpdateMaintenanceStatusRequest,
  AssignMaintenanceRequest,
  CreateWardenMaintenanceRequest,
  WardenMaintenanceFilterParams,
  WardenOverview,
} from '../../types/wardenOperations';

export const wardenApi = {
  // 1. Authorized Hostels
  getHostels: async (): Promise<ApiResponse<WardenHostelOption[]>> => {
    const response = await apiClient.get<ApiResponse<WardenHostelOption[]>>('/warden/hostels');
    return response.data;
  },

  // 2. Rooms
  getRooms: async (
    params?: WardenRoomFilterParams
  ): Promise<ApiResponse<PagedResponse<WardenRoomSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenRoomSummary>>>('/warden/rooms', {
      params,
    });
    return response.data;
  },

  getRoom: async (id: number): Promise<ApiResponse<WardenRoomDetail>> => {
    const response = await apiClient.get<ApiResponse<WardenRoomDetail>>(`/warden/rooms/${id}`);
    return response.data;
  },

  // 3. Beds
  getBeds: async (
    params?: WardenBedFilterParams
  ): Promise<ApiResponse<PagedResponse<WardenBedSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenBedSummary>>>('/warden/beds', {
      params,
    });
    return response.data;
  },

  getBed: async (id: number): Promise<ApiResponse<WardenBedDetail>> => {
    const response = await apiClient.get<ApiResponse<WardenBedDetail>>(`/warden/beds/${id}`);
    return response.data;
  },

  // 4. Student Search
  searchStudents: async (
    params?: WardenStudentSearchParams
  ): Promise<ApiResponse<PagedResponse<WardenStudentSearch>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenStudentSearch>>>(
      '/warden/students/search',
      { params }
    );
    return response.data;
  },

  // 5. Allocations
  getAllocations: async (
    params?: WardenAllocationFilterParams
  ): Promise<ApiResponse<PagedResponse<WardenAllocationSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenAllocationSummary>>>(
      '/warden/allocations',
      { params }
    );
    return response.data;
  },

  getAllocation: async (id: number): Promise<ApiResponse<WardenAllocationDetail>> => {
    const response = await apiClient.get<ApiResponse<WardenAllocationDetail>>(`/warden/allocations/${id}`);
    return response.data;
  },

  createAllocation: async (
    data: CreateHostelAllocationRequest
  ): Promise<ApiResponse<WardenAllocationSummary>> => {
    const response = await apiClient.post<ApiResponse<WardenAllocationSummary>>('/warden/allocations', data);
    return response.data;
  },

  releaseAllocation: async (id: number): Promise<ApiResponse<WardenAllocationSummary>> => {
    const response = await apiClient.patch<ApiResponse<WardenAllocationSummary>>(
      `/warden/allocations/${id}/release`
    );
    return response.data;
  },

  // 6. Hostel Resources / Facilities
  getResources: async (
    params?: WardenFacilityFilterParams
  ): Promise<ApiResponse<PagedResponse<WardenFacilitySummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenFacilitySummary>>>(
      '/warden/resources',
      { params }
    );
    return response.data;
  },

  getResource: async (id: number): Promise<ApiResponse<WardenFacilityDetail>> => {
    const response = await apiClient.get<ApiResponse<WardenFacilityDetail>>(`/warden/resources/${id}`);
    return response.data;
  },

  updateResource: async (
    id: number,
    data: UpdateFacilityRequest
  ): Promise<ApiResponse<WardenFacilityDetail>> => {
    const response = await apiClient.patch<ApiResponse<WardenFacilityDetail>>(`/warden/resources/${id}`, data);
    return response.data;
  },

  // 7. Hostel Complaints
  getComplaints: async (
    params?: WardenComplaintFilterParams
  ): Promise<ApiResponse<PagedResponse<WardenComplaintSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenComplaintSummary>>>(
      '/warden/complaints',
      { params }
    );
    return response.data;
  },

  getComplaint: async (id: number): Promise<ApiResponse<WardenComplaintDetail>> => {
    const response = await apiClient.get<ApiResponse<WardenComplaintDetail>>(`/warden/complaints/${id}`);
    return response.data;
  },

  updateComplaintStatus: async (
    id: number,
    data: UpdateComplaintStatusRequest
  ): Promise<ApiResponse<WardenComplaintDetail>> => {
    const response = await apiClient.patch<ApiResponse<WardenComplaintDetail>>(
      `/warden/complaints/${id}/status`,
      data
    );
    return response.data;
  },

  // 8. Maintenance Work Orders
  getMaintenanceRequests: async (
    params?: WardenMaintenanceFilterParams
  ): Promise<ApiResponse<PagedResponse<WardenMaintenanceSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenMaintenanceSummary>>>(
      '/warden/maintenance',
      { params }
    );
    return response.data;
  },

  getMaintenanceRequest: async (id: number): Promise<ApiResponse<WardenMaintenanceDetail>> => {
    const response = await apiClient.get<ApiResponse<WardenMaintenanceDetail>>(`/warden/maintenance/${id}`);
    return response.data;
  },

  updateMaintenanceStatus: async (
    id: number,
    data: UpdateMaintenanceStatusRequest
  ): Promise<ApiResponse<WardenMaintenanceDetail>> => {
    const response = await apiClient.patch<ApiResponse<WardenMaintenanceDetail>>(
      `/warden/maintenance/${id}/status`,
      data
    );
    return response.data;
  },

  assignMaintenance: async (
    id: number,
    data: AssignMaintenanceRequest
  ): Promise<ApiResponse<WardenMaintenanceDetail>> => {
    const response = await apiClient.patch<ApiResponse<WardenMaintenanceDetail>>(
      `/warden/maintenance/${id}/assign`,
      data
    );
    return response.data;
  },

  createMaintenance: async (
    data: CreateWardenMaintenanceRequest
  ): Promise<ApiResponse<WardenMaintenanceDetail>> => {
    const response = await apiClient.post<ApiResponse<WardenMaintenanceDetail>>('/warden/maintenance', data);
    return response.data;
  },

  // 9. Overview Telemetry
  getOverview: async (hostelId?: number): Promise<ApiResponse<WardenOverview>> => {
    const response = await apiClient.get<ApiResponse<WardenOverview>>('/warden/overview', {
      params: hostelId ? { hostelId } : undefined,
    });
    return response.data;
  },
};
