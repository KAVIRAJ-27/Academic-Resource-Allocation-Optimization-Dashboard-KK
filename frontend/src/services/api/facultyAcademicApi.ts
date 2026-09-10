import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import { FacultyAcademicOverview, FacultyCourse } from '../../types/faculty';

export const facultyAcademicApi = {
  getAcademicOverview: async (): Promise<ApiResponse<FacultyAcademicOverview>> => {
    const response = await apiClient.get<ApiResponse<FacultyAcademicOverview>>('/faculty/academics');
    return response.data;
  },

  getAssignedCourses: async (): Promise<ApiResponse<FacultyCourse[]>> => {
    const response = await apiClient.get<ApiResponse<FacultyCourse[]>>('/faculty/courses');
    return response.data;
  },
};
