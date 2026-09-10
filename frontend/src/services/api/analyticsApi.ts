import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import {
  AnalyticsFilterParams,
  AnalyticsOverview,
  AcademicUtilizationAnalytics,
  ClassroomAnalytics,
  LaboratoryAnalytics,
  EquipmentAnalytics,
  AllocationAnalytics,
  RequestAnalytics,
  ConflictAnalytics,
  FacultyWorkloadAnalytics,
  DepartmentAnalytics,
  HostelOccupancyAnalytics,
  RoomUtilization,
  HostelRequestAnalytics,
  HostelComplaintAnalytics,
  MaintenanceAnalytics,
} from '../../types/analytics';

export const analyticsApi = {
  getOverview: async (params?: AnalyticsFilterParams): Promise<AnalyticsOverview> => {
    const res = await apiClient.get<ApiResponse<AnalyticsOverview>>('/analytics/overview', { params });
    return res.data.data;
  },

  getAcademicOverview: async (params?: AnalyticsFilterParams): Promise<AcademicUtilizationAnalytics> => {
    const res = await apiClient.get<ApiResponse<AcademicUtilizationAnalytics>>('/analytics/academic/overview', { params });
    return res.data.data;
  },

  getAcademicResources: async (params?: AnalyticsFilterParams): Promise<AcademicUtilizationAnalytics> => {
    const res = await apiClient.get<ApiResponse<AcademicUtilizationAnalytics>>('/analytics/academic/resources', { params });
    return res.data.data;
  },

  getAcademicUtilization: async (params?: AnalyticsFilterParams): Promise<AcademicUtilizationAnalytics> => {
    const res = await apiClient.get<ApiResponse<AcademicUtilizationAnalytics>>('/analytics/academic/resources', { params });
    return res.data.data;
  },

  getClassroomAnalytics: async (params?: AnalyticsFilterParams): Promise<ClassroomAnalytics> => {
    const res = await apiClient.get<ApiResponse<ClassroomAnalytics>>('/analytics/academic/classrooms', { params });
    return res.data.data;
  },

  getLaboratoryAnalytics: async (params?: AnalyticsFilterParams): Promise<LaboratoryAnalytics> => {
    const res = await apiClient.get<ApiResponse<LaboratoryAnalytics>>('/analytics/academic/labs', { params });
    return res.data.data;
  },

  getEquipmentAnalytics: async (params?: AnalyticsFilterParams): Promise<EquipmentAnalytics> => {
    const res = await apiClient.get<ApiResponse<EquipmentAnalytics>>('/analytics/academic/equipment', { params });
    return res.data.data;
  },

  getAllocationAnalytics: async (params?: AnalyticsFilterParams): Promise<AllocationAnalytics> => {
    const res = await apiClient.get<ApiResponse<AllocationAnalytics>>('/analytics/academic/allocations', { params });
    return res.data.data;
  },

  getRequestAnalytics: async (params?: AnalyticsFilterParams): Promise<RequestAnalytics> => {
    const res = await apiClient.get<ApiResponse<RequestAnalytics>>('/analytics/academic/requests', { params });
    return res.data.data;
  },

  getConflictAnalytics: async (params?: AnalyticsFilterParams): Promise<ConflictAnalytics> => {
    const res = await apiClient.get<ApiResponse<ConflictAnalytics>>('/analytics/academic/conflicts', { params });
    return res.data.data;
  },

  getFacultyWorkloadAnalytics: async (params?: AnalyticsFilterParams): Promise<FacultyWorkloadAnalytics> => {
    const res = await apiClient.get<ApiResponse<FacultyWorkloadAnalytics>>('/analytics/academic/workload', { params });
    return res.data.data;
  },

  getDepartmentAnalytics: async (params?: AnalyticsFilterParams): Promise<DepartmentAnalytics> => {
    const res = await apiClient.get<ApiResponse<DepartmentAnalytics>>('/analytics/academic/departments', { params });
    return res.data.data;
  },

  getHostelOverview: async (params?: AnalyticsFilterParams): Promise<HostelOccupancyAnalytics> => {
    const res = await apiClient.get<ApiResponse<HostelOccupancyAnalytics>>('/analytics/hostel/overview', { params });
    return res.data.data;
  },

  getHostelOccupancy: async (params?: AnalyticsFilterParams): Promise<HostelOccupancyAnalytics> => {
    const res = await apiClient.get<ApiResponse<HostelOccupancyAnalytics>>('/analytics/hostel/occupancy', { params });
    return res.data.data;
  },

  getRoomUtilization: async (params?: AnalyticsFilterParams): Promise<RoomUtilization> => {
    const res = await apiClient.get<ApiResponse<RoomUtilization>>('/analytics/hostel/rooms', { params });
    return res.data.data;
  },

  getHostelRequests: async (params?: AnalyticsFilterParams): Promise<HostelRequestAnalytics> => {
    const res = await apiClient.get<ApiResponse<HostelRequestAnalytics>>('/analytics/hostel/requests', { params });
    return res.data.data;
  },

  getHostelComplaints: async (params?: AnalyticsFilterParams): Promise<HostelComplaintAnalytics> => {
    const res = await apiClient.get<ApiResponse<HostelComplaintAnalytics>>('/analytics/hostel/complaints', { params });
    return res.data.data;
  },

  getMaintenanceAnalytics: async (params?: AnalyticsFilterParams): Promise<MaintenanceAnalytics> => {
    const res = await apiClient.get<ApiResponse<MaintenanceAnalytics>>('/analytics/hostel/maintenance', { params });
    return res.data.data;
  },

  exportReport: async (reportType: string, params?: AnalyticsFilterParams): Promise<void> => {
    const response = await apiClient.get('/analytics/reports/export', {
      params: { ...params, reportType },
      responseType: 'blob',
    });

    const contentDisposition = response.headers['content-disposition'];
    let filename = `${reportType.toLowerCase().replace(/_/g, '-')}.csv`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
