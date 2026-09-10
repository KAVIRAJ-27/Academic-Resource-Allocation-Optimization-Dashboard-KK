import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  StudentAcademicResponse,
  StudentSubject,
  StudentSubjectDetails,
  StudentTimetableEntry,
  StudentSubjectQueryParams,
} from '../../types/studentAcademic';

export const studentAcademicApi = {
  getAcademicOverview: async (): Promise<ApiResponse<StudentAcademicResponse>> => {
    const response = await apiClient.get<ApiResponse<StudentAcademicResponse>>('/student/academics');
    return response.data;
  },

  getSubjects: async (
    params?: StudentSubjectQueryParams
  ): Promise<ApiResponse<PagedResponse<StudentSubject>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<StudentSubject>>>(
      '/student/academics/subjects',
      { params }
    );
    return response.data;
  },

  getSubjectDetails: async (subjectId: number): Promise<ApiResponse<StudentSubjectDetails>> => {
    const response = await apiClient.get<ApiResponse<StudentSubjectDetails>>(
      `/student/academics/subjects/${subjectId}`
    );
    return response.data;
  },

  getTimetable: async (): Promise<ApiResponse<StudentTimetableEntry[]>> => {
    const response = await apiClient.get<ApiResponse<StudentTimetableEntry[]>>(
      '/student/academics/timetable'
    );
    return response.data;
  },
};
