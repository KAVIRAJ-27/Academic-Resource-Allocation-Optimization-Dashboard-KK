import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';

export interface StudentSummary {
  id: number;
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  studentName?: string;
  email: string;
  phone?: string;
  registerNumber: string;
  rollNumber?: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  programId: number;
  programName: string;
  sectionId?: number;
  sectionName?: string;
  admissionYear: number;
  currentSemester: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userStatus: string;
  createdAt: string;
}

export interface StudentDetails {
  id: number;
  registerNumber: string;
  rollNumber?: string;
  admissionYear: number;
  currentSemester: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  programId: number;
  programName: string;
  sectionId?: number;
  sectionName?: string;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userStatus: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}

export interface ProgramOption {
  id: number;
  departmentId: number;
  code: string;
  name: string;
  degreeType: string;
  totalSemesters: number;
}

export interface SectionOption {
  id: number;
  programId: number;
  name: string;
  semester: number;
  academicYear: string;
  capacity?: number;
}

export interface UnassignedUserOption {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface StudentReferenceData {
  departments: DepartmentOption[];
  programs: ProgramOption[];
  sections: SectionOption[];
  unassignedUsers: UnassignedUserOption[];
}

export interface CreateStudentData {
  registerNumber: string;
  rollNumber?: string;
  admissionYear: number;
  currentSemester: number;
  departmentId: number;
  programId: number;
  sectionId?: number;
  createNewUser: boolean;
  userId?: number;
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateStudentData {
  registerNumber: string;
  rollNumber?: string;
  admissionYear: number;
  currentSemester: number;
  departmentId: number;
  programId: number;
  sectionId?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface GetStudentsParams {
  search?: string;
  departmentId?: number;
  programId?: number;
  sectionId?: number;
  status?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const adminStudentApi = {
  getStudents: async (params?: GetStudentsParams): Promise<ApiResponse<PagedResponse<StudentSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<StudentSummary>>>('/admin/students', {
      params,
    });
    return response.data;
  },

  getStudentById: async (id: number): Promise<ApiResponse<StudentDetails>> => {
    const response = await apiClient.get<ApiResponse<StudentDetails>>(`/admin/students/${id}`);
    return response.data;
  },

  getReferenceData: async (): Promise<ApiResponse<StudentReferenceData>> => {
    const response = await apiClient.get<ApiResponse<StudentReferenceData>>('/admin/students/reference-data');
    return response.data;
  },

  createStudent: async (data: CreateStudentData): Promise<ApiResponse<StudentSummary>> => {
    const response = await apiClient.post<ApiResponse<StudentSummary>>('/admin/students', data);
    return response.data;
  },

  updateStudent: async (id: number, data: UpdateStudentData): Promise<ApiResponse<StudentSummary>> => {
    const response = await apiClient.put<ApiResponse<StudentSummary>>(`/admin/students/${id}`, data);
    return response.data;
  },

  updateStudentStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string): Promise<ApiResponse<StudentSummary>> => {
    const response = await apiClient.patch<ApiResponse<StudentSummary>>(`/admin/students/${id}/status`, {
      status,
    });
    return response.data;
  },
};
