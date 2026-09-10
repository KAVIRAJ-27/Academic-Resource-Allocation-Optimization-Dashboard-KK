import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';

// ============================================================================
// 1. INSTITUTION INTERFACES
// ============================================================================
export interface InstitutionResponse {
  id: number;
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  totalDepartments: number;
  totalPrograms: number;
  totalActiveStudents: number;
  totalFaculty: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateInstitutionRequest {
  name: string;
  code: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

// ============================================================================
// 2. DEPARTMENT INTERFACES
// ============================================================================
export interface DepartmentSummary {
  id: number;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalPrograms: number;
  totalFaculty: number;
  totalStudents: number;
  activeHodName?: string;
  createdAt: string;
}

export interface DepartmentDetails {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  institutionId: number;
  institutionName: string;
  activeHodId?: number;
  activeHodName?: string;
  totalPrograms: number;
  totalFaculty: number;
  totalStudents: number;
  totalSubjects: number;
  totalRooms: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// 3. ACADEMIC YEAR INTERFACES
// ============================================================================
export interface AcademicYearSummary {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalSemesters: number;
  createdAt: string;
}

export interface AcademicYearDetails {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  institutionId: number;
  institutionName: string;
  totalSemesters: number;
  totalAllocations: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateAcademicYearRequest {
  name: string;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// 4. SEMESTER INTERFACES
// ============================================================================
export interface SemesterSummary {
  id: number;
  academicYearId: number;
  academicYearName: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalSections: number;
  createdAt: string;
}

export interface SemesterDetails {
  id: number;
  academicYearId: number;
  academicYearName: string;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalSections: number;
  totalAllocations: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSemesterRequest {
  academicYearId: number;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateSemesterRequest {
  academicYearId: number;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// 5. PROGRAM / COURSE INTERFACES
// ============================================================================
export interface ProgramSummary {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  programType: 'UG' | 'PG' | 'DIPLOMA' | 'PHD';
  durationYears: number;
  totalSemesters: number;
  status: 'ACTIVE' | 'INACTIVE';
  totalStudents: number;
  createdAt: string;
}

export interface ProgramDetails {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  programType: 'UG' | 'PG' | 'DIPLOMA' | 'PHD';
  durationYears: number;
  totalSemesters: number;
  status: 'ACTIVE' | 'INACTIVE';
  totalStudents: number;
  totalSubjects: number;
  totalSections: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramRequest {
  departmentId: number;
  name: string;
  code: string;
  programType: 'UG' | 'PG' | 'DIPLOMA' | 'PHD';
  durationYears: number;
  totalSemesters: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateProgramRequest {
  departmentId: number;
  name: string;
  code: string;
  programType: 'UG' | 'PG' | 'DIPLOMA' | 'PHD';
  durationYears: number;
  totalSemesters: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// 6. SUBJECT INTERFACES
// ============================================================================
export interface SubjectSummary {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  programId: number;
  programName: string;
  semesterNumber: number;
  credits: number;
  type: 'THEORY' | 'PRACTICAL' | 'HYBRID';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface SubjectDetails {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  programId: number;
  programName: string;
  semesterNumber: number;
  credits: number;
  type: 'THEORY' | 'PRACTICAL' | 'HYBRID';
  weeklyHours: number;
  requiresLab: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  totalAllocations: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  departmentId: number;
  programId: number;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  type: 'THEORY' | 'PRACTICAL' | 'HYBRID';
  weeklyHours?: number;
  requiresLab?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateSubjectRequest {
  departmentId: number;
  programId: number;
  name: string;
  code: string;
  credits: number;
  semesterNumber: number;
  type: 'THEORY' | 'PRACTICAL' | 'HYBRID';
  weeklyHours?: number;
  requiresLab?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// 7. SECTION INTERFACES
// ============================================================================
export interface SectionSummary {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  programId: number;
  programName: string;
  semesterId: number;
  semesterNumber: number;
  academicYearName: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  studentCount: number;
  createdAt: string;
}

export interface SectionDetails {
  id: number;
  name: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  programId: number;
  programName: string;
  semesterId: number;
  semesterNumber: number;
  academicYearId: number;
  academicYearName: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  studentCount: number;
  totalAllocations: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSectionRequest {
  departmentId: number;
  programId: number;
  semesterId: number;
  name: string;
  capacity: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateSectionRequest {
  departmentId: number;
  programId: number;
  semesterId: number;
  name: string;
  capacity: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

// ============================================================================
// 8. REFERENCE DATA INTERFACES
// ============================================================================
export interface AcademicOption {
  id: number;
  code?: string;
  name: string;
  parentId?: number;
  status?: string;
  number?: number;
}

export interface AcademicReferenceData {
  departments: AcademicOption[];
  academicYears: AcademicOption[];
  semesters: AcademicOption[];
  programs: AcademicOption[];
  programTypes: string[];
  subjectTypes: string[];
}

// ============================================================================
// API CLIENT IMPLEMENTATION
// ============================================================================
export const adminAcademicApi = {
  // --- Institution ---
  getInstitution: async (): Promise<ApiResponse<InstitutionResponse>> => {
    const response = await apiClient.get<ApiResponse<InstitutionResponse>>('/admin/institution');
    return response.data;
  },

  updateInstitution: async (data: UpdateInstitutionRequest): Promise<ApiResponse<InstitutionResponse>> => {
    const response = await apiClient.put<ApiResponse<InstitutionResponse>>('/admin/institution', data);
    return response.data;
  },

  // --- Departments ---
  getDepartments: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<DepartmentSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<DepartmentSummary>>>('/admin/departments', { params });
    return response.data;
  },

  getDepartmentById: async (id: number): Promise<ApiResponse<DepartmentDetails>> => {
    const response = await apiClient.get<ApiResponse<DepartmentDetails>>(`/admin/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data: CreateDepartmentRequest): Promise<ApiResponse<DepartmentDetails>> => {
    const response = await apiClient.post<ApiResponse<DepartmentDetails>>('/admin/departments', data);
    return response.data;
  },

  updateDepartment: async (id: number, data: UpdateDepartmentRequest): Promise<ApiResponse<DepartmentDetails>> => {
    const response = await apiClient.put<ApiResponse<DepartmentDetails>>(`/admin/departments/${id}`, data);
    return response.data;
  },

  changeDepartmentStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<DepartmentSummary>> => {
    const response = await apiClient.patch<ApiResponse<DepartmentSummary>>(`/admin/departments/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/departments/${id}`);
    return response.data;
  },

  // --- Academic Years ---
  getAcademicYears: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<AcademicYearSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<AcademicYearSummary>>>('/admin/academic-years', { params });
    return response.data;
  },

  getAcademicYearById: async (id: number): Promise<ApiResponse<AcademicYearDetails>> => {
    const response = await apiClient.get<ApiResponse<AcademicYearDetails>>(`/admin/academic-years/${id}`);
    return response.data;
  },

  createAcademicYear: async (data: CreateAcademicYearRequest): Promise<ApiResponse<AcademicYearDetails>> => {
    const response = await apiClient.post<ApiResponse<AcademicYearDetails>>('/admin/academic-years', data);
    return response.data;
  },

  updateAcademicYear: async (id: number, data: UpdateAcademicYearRequest): Promise<ApiResponse<AcademicYearDetails>> => {
    const response = await apiClient.put<ApiResponse<AcademicYearDetails>>(`/admin/academic-years/${id}`, data);
    return response.data;
  },

  changeAcademicYearStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<AcademicYearSummary>> => {
    const response = await apiClient.patch<ApiResponse<AcademicYearSummary>>(`/admin/academic-years/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  activateAcademicYear: async (id: number): Promise<ApiResponse<AcademicYearSummary>> => {
    const response = await apiClient.post<ApiResponse<AcademicYearSummary>>(`/admin/academic-years/${id}/activate`);
    return response.data;
  },

  deleteAcademicYear: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/academic-years/${id}`);
    return response.data;
  },

  // --- Semesters ---
  getSemesters: async (params?: {
    search?: string;
    academicYearId?: number;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<SemesterSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<SemesterSummary>>>('/admin/semesters', { params });
    return response.data;
  },

  getSemesterById: async (id: number): Promise<ApiResponse<SemesterDetails>> => {
    const response = await apiClient.get<ApiResponse<SemesterDetails>>(`/admin/semesters/${id}`);
    return response.data;
  },

  createSemester: async (data: CreateSemesterRequest): Promise<ApiResponse<SemesterDetails>> => {
    const response = await apiClient.post<ApiResponse<SemesterDetails>>('/admin/semesters', data);
    return response.data;
  },

  updateSemester: async (id: number, data: UpdateSemesterRequest): Promise<ApiResponse<SemesterDetails>> => {
    const response = await apiClient.put<ApiResponse<SemesterDetails>>(`/admin/semesters/${id}`, data);
    return response.data;
  },

  changeSemesterStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<SemesterSummary>> => {
    const response = await apiClient.patch<ApiResponse<SemesterSummary>>(`/admin/semesters/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteSemester: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/semesters/${id}`);
    return response.data;
  },

  // --- Programs ---
  getPrograms: async (params?: {
    search?: string;
    departmentId?: number;
    programType?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<ProgramSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ProgramSummary>>>('/admin/programs', { params });
    return response.data;
  },

  getProgramById: async (id: number): Promise<ApiResponse<ProgramDetails>> => {
    const response = await apiClient.get<ApiResponse<ProgramDetails>>(`/admin/programs/${id}`);
    return response.data;
  },

  createProgram: async (data: CreateProgramRequest): Promise<ApiResponse<ProgramDetails>> => {
    const response = await apiClient.post<ApiResponse<ProgramDetails>>('/admin/programs', data);
    return response.data;
  },

  updateProgram: async (id: number, data: UpdateProgramRequest): Promise<ApiResponse<ProgramDetails>> => {
    const response = await apiClient.put<ApiResponse<ProgramDetails>>(`/admin/programs/${id}`, data);
    return response.data;
  },

  changeProgramStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<ProgramSummary>> => {
    const response = await apiClient.patch<ApiResponse<ProgramSummary>>(`/admin/programs/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteProgram: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/programs/${id}`);
    return response.data;
  },

  // --- Subjects ---
  getSubjects: async (params?: {
    search?: string;
    departmentId?: number;
    programId?: number;
    semesterNumber?: number;
    type?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<SubjectSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<SubjectSummary>>>('/admin/subjects', { params });
    return response.data;
  },

  getSubjectById: async (id: number): Promise<ApiResponse<SubjectDetails>> => {
    const response = await apiClient.get<ApiResponse<SubjectDetails>>(`/admin/subjects/${id}`);
    return response.data;
  },

  createSubject: async (data: CreateSubjectRequest): Promise<ApiResponse<SubjectDetails>> => {
    const response = await apiClient.post<ApiResponse<SubjectDetails>>('/admin/subjects', data);
    return response.data;
  },

  updateSubject: async (id: number, data: UpdateSubjectRequest): Promise<ApiResponse<SubjectDetails>> => {
    const response = await apiClient.put<ApiResponse<SubjectDetails>>(`/admin/subjects/${id}`, data);
    return response.data;
  },

  changeSubjectStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<SubjectSummary>> => {
    const response = await apiClient.patch<ApiResponse<SubjectSummary>>(`/admin/subjects/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteSubject: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/subjects/${id}`);
    return response.data;
  },

  // --- Sections ---
  getSections: async (params?: {
    search?: string;
    departmentId?: number;
    programId?: number;
    semesterId?: number;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<SectionSummary>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<SectionSummary>>>('/admin/sections', { params });
    return response.data;
  },

  getSectionById: async (id: number): Promise<ApiResponse<SectionDetails>> => {
    const response = await apiClient.get<ApiResponse<SectionDetails>>(`/admin/sections/${id}`);
    return response.data;
  },

  createSection: async (data: CreateSectionRequest): Promise<ApiResponse<SectionDetails>> => {
    const response = await apiClient.post<ApiResponse<SectionDetails>>('/admin/sections', data);
    return response.data;
  },

  updateSection: async (id: number, data: UpdateSectionRequest): Promise<ApiResponse<SectionDetails>> => {
    const response = await apiClient.put<ApiResponse<SectionDetails>>(`/admin/sections/${id}`, data);
    return response.data;
  },

  changeSectionStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<SectionSummary>> => {
    const response = await apiClient.patch<ApiResponse<SectionSummary>>(`/admin/sections/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  },

  deleteSection: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/sections/${id}`);
    return response.data;
  },

  // --- Reference Data ---
  getReferenceData: async (): Promise<ApiResponse<AcademicReferenceData>> => {
    const response = await apiClient.get<ApiResponse<AcademicReferenceData>>('/admin/academic/reference-data');
    return response.data;
  }
};
