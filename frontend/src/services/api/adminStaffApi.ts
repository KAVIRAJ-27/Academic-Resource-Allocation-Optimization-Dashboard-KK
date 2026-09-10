import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';

// ==========================================
// Types: Faculty
// ==========================================
export interface FacultySummary {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  employeeId: string;
  designation: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  qualification?: string;
  specialization?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userStatus: string;
  createdAt?: string;
}

export interface FacultyDetails extends FacultySummary {
  updatedAt?: string;
  roles: string[];
}

export interface CreateFacultyData {
  existingUserId?: number;
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  employeeId: string;
  departmentId: number;
  designation: string;
  qualification?: string;
  specialization?: string;
  status?: string;
}

export interface UpdateFacultyData {
  departmentId: number;
  designation: string;
  qualification?: string;
  specialization?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

// ==========================================
// Types: HOD
// ==========================================
export interface HodSummary {
  id: number;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  facultyId: number;
  employeeId: string;
  facultyName: string;
  facultyEmail: string;
  facultyPhone?: string;
  designation?: string;
  userId: number;
  username: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export interface HodDetails extends HodSummary {
  roles: string[];
  userStatus: string;
  qualification?: string;
  specialization?: string;
}

export interface CreateHodAssignmentData {
  departmentId: number;
  facultyId: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateHodAssignmentData {
  startDate?: string;
  endDate?: string;
  status?: string;
}

// ==========================================
// Types: Principal
// ==========================================
export interface PrincipalData {
  id: number;
  institutionId: number;
  institutionName: string;
  institutionCode: string;
  facultyId: number;
  employeeId: string;
  facultyName: string;
  facultyEmail: string;
  facultyPhone?: string;
  designation?: string;
  departmentName?: string;
  userId: number;
  username: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface AssignPrincipalData {
  institutionId: number;
  facultyId: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePrincipalAssignmentData {
  startDate?: string;
  endDate?: string;
  status?: string;
}

// ==========================================
// Types: Warden
// ==========================================
export interface HostelSummaryOption {
  id: number;
  name: string;
  code: string;
  type: string;
}

export interface WardenSummary {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  employeeId: string;
  contactNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userStatus: string;
  assignedHostels: HostelSummaryOption[];
  createdAt?: string;
}

export interface WardenDetails extends WardenSummary {
  roles: string[];
  updatedAt?: string;
}

export interface CreateWardenData {
  existingUserId?: number;
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  employeeId: string;
  contactNumber?: string;
  status?: string;
  hostelIds?: number[];
}

export interface UpdateWardenData {
  contactNumber?: string;
  status?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// ==========================================
// Types: Staff Reference Data
// ==========================================
export interface DepartmentOption {
  id: number;
  name: string;
  code: string;
  institutionId: number;
}

export interface InstitutionOption {
  id: number;
  name: string;
  code: string;
}

export interface EligibleFacultyOption {
  id: number;
  employeeId: string;
  fullName: string;
  departmentName: string;
  designation: string;
  userId: number;
}

export interface UnassignedUserOption {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export interface StaffReferenceData {
  departments: DepartmentOption[];
  hostels: HostelSummaryOption[];
  institutions: InstitutionOption[];
  eligibleFaculty: EligibleFacultyOption[];
  unassignedFacultyUsers: UnassignedUserOption[];
  unassignedWardenUsers: UnassignedUserOption[];
}

// ==========================================
// Filter Params
// ==========================================
export interface StaffFilterParams {
  search?: string;
  departmentId?: number;
  hostelId?: number;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ==========================================
// API Implementation
// ==========================================
export const adminStaffApi = {
  // Reference Data
  getReferenceData: async (): Promise<ApiResponse<StaffReferenceData>> => {
    const response = await apiClient.get<ApiResponse<StaffReferenceData>>('/admin/staff/reference-data');
    return response.data;
  },

  // Faculty APIs
  getFaculty: async (params?: StaffFilterParams): Promise<ApiResponse<PagedResponse<FacultySummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FacultySummary>>>('/admin/faculty', { params });
    return response.data;
  },

  getFacultyById: async (id: number): Promise<ApiResponse<FacultyDetails>> => {
    const response = await apiClient.get<ApiResponse<FacultyDetails>>(`/admin/faculty/${id}`);
    return response.data;
  },

  createFaculty: async (data: CreateFacultyData): Promise<ApiResponse<FacultySummary>> => {
    const response = await apiClient.post<ApiResponse<FacultySummary>>('/admin/faculty', data);
    return response.data;
  },

  updateFaculty: async (id: number, data: UpdateFacultyData): Promise<ApiResponse<FacultySummary>> => {
    const response = await apiClient.put<ApiResponse<FacultySummary>>(`/admin/faculty/${id}`, data);
    return response.data;
  },

  updateFacultyStatus: async (id: number, status: string): Promise<ApiResponse<FacultySummary>> => {
    const response = await apiClient.patch<ApiResponse<FacultySummary>>(`/admin/faculty/${id}/status`, { status });
    return response.data;
  },

  // HOD APIs
  getHods: async (params?: StaffFilterParams): Promise<ApiResponse<PagedResponse<HodSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<HodSummary>>>('/admin/hods', { params });
    return response.data;
  },

  getHodById: async (id: number): Promise<ApiResponse<HodDetails>> => {
    const response = await apiClient.get<ApiResponse<HodDetails>>(`/admin/hods/${id}`);
    return response.data;
  },

  assignHod: async (data: CreateHodAssignmentData): Promise<ApiResponse<HodSummary>> => {
    const response = await apiClient.post<ApiResponse<HodSummary>>('/admin/hods', data);
    return response.data;
  },

  updateHodAssignment: async (id: number, data: UpdateHodAssignmentData): Promise<ApiResponse<HodSummary>> => {
    const response = await apiClient.put<ApiResponse<HodSummary>>(`/admin/hods/${id}`, data);
    return response.data;
  },

  updateHodStatus: async (id: number, status: string): Promise<ApiResponse<HodSummary>> => {
    const response = await apiClient.patch<ApiResponse<HodSummary>>(`/admin/hods/${id}/status`, { status });
    return response.data;
  },

  // Principal APIs
  getCurrentPrincipal: async (): Promise<ApiResponse<PrincipalData>> => {
    const response = await apiClient.get<ApiResponse<PrincipalData>>('/admin/principal/current');
    return response.data;
  },

  getPrincipalHistory: async (params?: StaffFilterParams): Promise<ApiResponse<PagedResponse<PrincipalData>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<PrincipalData>>>('/admin/principal', { params });
    return response.data;
  },

  getPrincipalById: async (id: number): Promise<ApiResponse<PrincipalData>> => {
    const response = await apiClient.get<ApiResponse<PrincipalData>>(`/admin/principal/${id}`);
    return response.data;
  },

  assignPrincipal: async (data: AssignPrincipalData): Promise<ApiResponse<PrincipalData>> => {
    const response = await apiClient.post<ApiResponse<PrincipalData>>('/admin/principal', data);
    return response.data;
  },

  updatePrincipalAssignment: async (id: number, data: UpdatePrincipalAssignmentData): Promise<ApiResponse<PrincipalData>> => {
    const response = await apiClient.put<ApiResponse<PrincipalData>>(`/admin/principal/${id}`, data);
    return response.data;
  },

  updatePrincipalStatus: async (id: number, status: string): Promise<ApiResponse<PrincipalData>> => {
    const response = await apiClient.patch<ApiResponse<PrincipalData>>(`/admin/principal/${id}/status`, { status });
    return response.data;
  },

  // Warden APIs
  getWardens: async (params?: StaffFilterParams): Promise<ApiResponse<PagedResponse<WardenSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<WardenSummary>>>('/admin/wardens', { params });
    return response.data;
  },

  getWardenById: async (id: number): Promise<ApiResponse<WardenDetails>> => {
    const response = await apiClient.get<ApiResponse<WardenDetails>>(`/admin/wardens/${id}`);
    return response.data;
  },

  createWarden: async (data: CreateWardenData): Promise<ApiResponse<WardenSummary>> => {
    const response = await apiClient.post<ApiResponse<WardenSummary>>('/admin/wardens', data);
    return response.data;
  },

  updateWarden: async (id: number, data: UpdateWardenData): Promise<ApiResponse<WardenSummary>> => {
    const response = await apiClient.put<ApiResponse<WardenSummary>>(`/admin/wardens/${id}`, data);
    return response.data;
  },

  updateWardenStatus: async (id: number, status: string): Promise<ApiResponse<WardenSummary>> => {
    const response = await apiClient.patch<ApiResponse<WardenSummary>>(`/admin/wardens/${id}/status`, { status });
    return response.data;
  },

  assignHostels: async (id: number, hostelIds: number[]): Promise<ApiResponse<WardenSummary>> => {
    const response = await apiClient.post<ApiResponse<WardenSummary>>(`/admin/wardens/${id}/hostels`, { hostelIds });
    return response.data;
  },
};
