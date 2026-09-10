package com.ahrao.service.ai;

import com.ahrao.dto.ai.*;
import java.util.List;
import java.util.Map;

public interface AiInsightsService {
    AiOverviewDto getOverview(AiFilterParams params);
    List<AcademicDemandPredictionDto> getAcademicDemand(AiFilterParams params);
    List<ResourceUtilizationPredictionDto> getAcademicUtilization(AiFilterParams params);
    List<ResourceShortageDto> getAcademicShortages(AiFilterParams params);
    List<BottleneckDto> getBottlenecks(AiFilterParams params);
    List<FacultyWorkloadInsightDto> getWorkloadInsights(AiFilterParams params);
    List<HostelOccupancyPredictionDto> getHostelOccupancy(AiFilterParams params);
    List<HostelShortageDto> getHostelShortages(AiFilterParams params);
    List<AnomalyDto> getAnomalies(AiFilterParams params);
    List<AiRecommendationDto> getRecommendations(AiFilterParams params);
    Map<String, Object> trainModels(String modelType);
}
