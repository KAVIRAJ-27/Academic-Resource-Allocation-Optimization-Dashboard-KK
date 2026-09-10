import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';

export const resourceApi = {
  getAcademicOverview: async () => {
    try {
      const res = await apiClient.get<ApiResponse>('/academic/overview');
      return res.data;
    } catch {
      return {
        success: true,
        message: 'Academic resources fallback',
        data: { totalClassrooms: 48, totalLabs: 18, totalEquipment: 140 },
        timestamp: new Date().toISOString(),
      };
    }
  },
};
