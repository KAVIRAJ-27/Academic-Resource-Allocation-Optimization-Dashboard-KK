package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class AiOverviewDto {
    private String status = "SUCCESS"; // SUCCESS, INSUFFICIENT_DATA, AI_SERVICE_UNAVAILABLE, ERROR
    private String message;
    @JsonProperty("active_predictions_count")
    private Integer activePredictionsCount = 0;
    @JsonProperty("high_risk_shortages_count")
    private Integer highRiskShortagesCount = 0;
    @JsonProperty("detected_bottlenecks_count")
    private Integer detectedBottlenecksCount = 0;
    @JsonProperty("anomalies_count")
    private Integer anomaliesCount = 0;
    @JsonProperty("recommendations_count")
    private Integer recommendationsCount = 0;

    @JsonProperty("top_recommendations")
    private List<AiRecommendationDto> topRecommendations = new ArrayList<>();
    @JsonProperty("critical_bottlenecks")
    private List<BottleneckDto> criticalBottlenecks = new ArrayList<>();
    @JsonProperty("academic_demand_summary")
    private List<AcademicDemandPredictionDto> academicDemandSummary = new ArrayList<>();
    @JsonProperty("hostel_occupancy_summary")
    private List<HostelOccupancyPredictionDto> hostelOccupancySummary = new ArrayList<>();

    public AiOverviewDto() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Integer getActivePredictionsCount() { return activePredictionsCount; }
    public void setActivePredictionsCount(Integer activePredictionsCount) { this.activePredictionsCount = activePredictionsCount; }

    public Integer getHighRiskShortagesCount() { return highRiskShortagesCount; }
    public void setHighRiskShortagesCount(Integer highRiskShortagesCount) { this.highRiskShortagesCount = highRiskShortagesCount; }

    public Integer getDetectedBottlenecksCount() { return detectedBottlenecksCount; }
    public void setDetectedBottlenecksCount(Integer detectedBottlenecksCount) { this.detectedBottlenecksCount = detectedBottlenecksCount; }

    public Integer getAnomaliesCount() { return anomaliesCount; }
    public void setAnomaliesCount(Integer anomaliesCount) { this.anomaliesCount = anomaliesCount; }

    public Integer getRecommendationsCount() { return recommendationsCount; }
    public void setRecommendationsCount(Integer recommendationsCount) { this.recommendationsCount = recommendationsCount; }

    public List<AiRecommendationDto> getTopRecommendations() { return topRecommendations; }
    public void setTopRecommendations(List<AiRecommendationDto> topRecommendations) { this.topRecommendations = topRecommendations; }

    public List<BottleneckDto> getCriticalBottlenecks() { return criticalBottlenecks; }
    public void setCriticalBottlenecks(List<BottleneckDto> criticalBottlenecks) { this.criticalBottlenecks = criticalBottlenecks; }

    public List<AcademicDemandPredictionDto> getAcademicDemandSummary() { return academicDemandSummary; }
    public void setAcademicDemandSummary(List<AcademicDemandPredictionDto> academicDemandSummary) { this.academicDemandSummary = academicDemandSummary; }

    public List<HostelOccupancyPredictionDto> getHostelOccupancySummary() { return hostelOccupancySummary; }
    public void setHostelOccupancySummary(List<HostelOccupancyPredictionDto> hostelOccupancySummary) { this.hostelOccupancySummary = hostelOccupancySummary; }
}
