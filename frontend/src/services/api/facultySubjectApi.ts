import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';
import {
  FacultySubject,
  FacultySubjectDetails,
  FacultySubjectFilterParams,
} from '../../types/faculty';

export const facultySubjectApi = {
  getSubjects: async (
    params?: FacultySubjectFilterParams
  ): Promise<ApiResponse<PagedResponse<FacultySubject>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<FacultySubject>>>(
      '/faculty/subjects',
      { params }
    );
    return response.data;
  },

  getSubjectDetails: async (
    subjectId: number
  ): Promise<ApiResponse<FacultySubjectDetails>> => {
    const response = await apiClient.get<ApiResponse<FacultySubjectDetails>>(
      `/faculty/subjects/${subjectId}`
    );
    return response.data;
  },
};
