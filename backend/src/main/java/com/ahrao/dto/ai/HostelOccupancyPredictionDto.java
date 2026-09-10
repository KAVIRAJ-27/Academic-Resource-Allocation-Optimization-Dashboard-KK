package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HostelOccupancyPredictionDto {
    @JsonProperty("hostel_id")
    private Long hostelId;
    @JsonProperty("hostel_name")
    private String hostelName;
    @JsonProperty("total_beds")
    private Integer totalBeds;
    @JsonProperty("current_occupancy")
    private Integer currentOccupancy;
    @JsonProperty("current_occupancy_pct")
    private Double currentOccupancyPct;
    @JsonProperty("predicted_occupancy")
    private Integer predictedOccupancy;
    @JsonProperty("predicted_occupancy_pct")
    private Double predictedOccupancyPct;
    @JsonProperty("expected_available_beds")
    private Integer expectedAvailableBeds;
    @JsonProperty("occupancy_trend")
    private String occupancyTrend; // INCREASING, STABLE, DECREASING
    private String explanation;
    @JsonProperty("model_version")
    private String modelVersion;

    public HostelOccupancyPredictionDto() {}

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public Integer getTotalBeds() { return totalBeds; }
    public void setTotalBeds(Integer totalBeds) { this.totalBeds = totalBeds; }

    public Integer getCurrentOccupancy() { return currentOccupancy; }
    public void setCurrentOccupancy(Integer currentOccupancy) { this.currentOccupancy = currentOccupancy; }

    public Double getCurrentOccupancyPct() { return currentOccupancyPct; }
    public void setCurrentOccupancyPct(Double currentOccupancyPct) { this.currentOccupancyPct = currentOccupancyPct; }

    public Integer getPredictedOccupancy() { return predictedOccupancy; }
    public void setPredictedOccupancy(Integer predictedOccupancy) { this.predictedOccupancy = predictedOccupancy; }

    public Double getPredictedOccupancyPct() { return predictedOccupancyPct; }
    public void setPredictedOccupancyPct(Double predictedOccupancyPct) { this.predictedOccupancyPct = predictedOccupancyPct; }

    public Integer getExpectedAvailableBeds() { return expectedAvailableBeds; }
    public void setExpectedAvailableBeds(Integer expectedAvailableBeds) { this.expectedAvailableBeds = expectedAvailableBeds; }

    public String getOccupancyTrend() { return occupancyTrend; }
    public void setOccupancyTrend(String occupancyTrend) { this.occupancyTrend = occupancyTrend; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
