import { apiClient } from './apiClient';
import { ApiResponse } from '../../types/api';
import {
  AiFilterParams,
  AiOverview,
  AcademicDemandPrediction,
  ResourceUtilizationPrediction,
  ResourceShortage,
  Bottleneck,
  HostelOccupancyPrediction,
  HostelShortage,
  FacultyWorkloadInsight,
  Anomaly,
  AiRecommendation,
  ModelTrainingResult,
} from '../../types/ai';

export const aiApi = {
  getOverview: async (params?: AiFilterParams): Promise<AiOverview> => {
    const res = await apiClient.get<ApiResponse<AiOverview>>('/ai/overview', { params });
    return res.data.data;
  },

  getAcademicDemand: async (params?: AiFilterParams): Promise<AcademicDemandPrediction[]> => {
    const res = await apiClient.get<ApiResponse<AcademicDemandPrediction[]>>('/ai/academic/demand', { params });
    return res.data.data;
  },

  getAcademicUtilization: async (params?: AiFilterParams): Promise<ResourceUtilizationPrediction[]> => {
    const res = await apiClient.get<ApiResponse<ResourceUtilizationPrediction[]>>('/ai/academic/utilization', { params });
    return res.data.data;
  },

  getAcademicShortages: async (params?: AiFilterParams): Promise<ResourceShortage[]> => {
    const res = await apiClient.get<ApiResponse<ResourceShortage[]>>('/ai/academic/shortage', { params });
    return res.data.data;
  },

  getBottlenecks: async (params?: AiFilterParams): Promise<Bottleneck[]> => {
    const res = await apiClient.get<ApiResponse<Bottleneck[]>>('/ai/academic/bottlenecks', { params });
    return res.data.data;
  },

  getWorkloadInsights: async (params?: AiFilterParams): Promise<FacultyWorkloadInsight[]> => {
    const res = await apiClient.get<ApiResponse<FacultyWorkloadInsight[]>>('/ai/academic/workload', { params });
    return res.data.data;
  },

  getHostelOccupancy: async (params?: AiFilterParams): Promise<HostelOccupancyPrediction[]> => {
    const res = await apiClient.get<ApiResponse<HostelOccupancyPrediction[]>>('/ai/hostel/occupancy', { params });
    return res.data.data;
  },

  getHostelShortages: async (params?: AiFilterParams): Promise<HostelShortage[]> => {
    const res = await apiClient.get<ApiResponse<HostelShortage[]>>('/ai/hostel/shortage', { params });
    return res.data.data;
  },

  getAnomalies: async (params?: AiFilterParams): Promise<Anomaly[]> => {
    const res = await apiClient.get<ApiResponse<Anomaly[]>>('/ai/anomalies', { params });
    return res.data.data;
  },

  getRecommendations: async (params?: AiFilterParams): Promise<AiRecommendation[]> => {
    const res = await apiClient.get<ApiResponse<AiRecommendation[]>>('/ai/recommendations', { params });
    return res.data.data;
  },

  trainModels: async (modelType: string = 'academic-demand'): Promise<ModelTrainingResult> => {
    const res = await apiClient.post<ApiResponse<ModelTrainingResult>>('/ai/models/train', null, {
      params: { modelType },
    });
    return res.data.data;
  },
};
