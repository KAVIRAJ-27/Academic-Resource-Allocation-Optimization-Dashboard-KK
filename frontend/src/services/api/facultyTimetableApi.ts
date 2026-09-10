import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import {
  FacultyTimetableEntry,
  FacultyTimetableFilterParams,
  FacultyTimetableResponse,
} from '../../types/faculty';

export const facultyTimetableApi = {
  getTimetable: async (
    params?: FacultyTimetableFilterParams
  ): Promise<ApiResponse<FacultyTimetableResponse>> => {
    const response = await apiClient.get<ApiResponse<FacultyTimetableResponse>>(
      '/faculty/timetable',
      { params }
    );
    return response.data;
  },

  getTodayClasses: async (): Promise<ApiResponse<FacultyTimetableEntry[]>> => {
    const response = await apiClient.get<ApiResponse<FacultyTimetableEntry[]>>(
      '/faculty/timetable/today'
    );
    return response.data;
  },
};
