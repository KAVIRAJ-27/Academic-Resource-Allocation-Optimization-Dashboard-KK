package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HostelShortageDto {
    @JsonProperty("hostel_id")
    private Long hostelId;
    @JsonProperty("hostel_name")
    private String hostelName;
    @JsonProperty("total_active_beds")
    private Integer totalActiveBeds;
    @JsonProperty("available_beds")
    private Integer availableBeds;
    @JsonProperty("predicted_demand")
    private Integer predictedDemand;
    @JsonProperty("expected_shortage")
    private Integer expectedShortage;
    @JsonProperty("risk_level")
    private String riskLevel; // LOW_RISK, MEDIUM_RISK, HIGH_RISK
    private String explanation;

    public HostelShortageDto() {}

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public String getHostelName() { return hostelName; }
    public void setHostelName(String hostelName) { this.hostelName = hostelName; }

    public Integer getTotalActiveBeds() { return totalActiveBeds; }
    public void setTotalActiveBeds(Integer totalActiveBeds) { this.totalActiveBeds = totalActiveBeds; }

    public Integer getAvailableBeds() { return availableBeds; }
    public void setAvailableBeds(Integer availableBeds) { this.availableBeds = availableBeds; }

    public Integer getPredictedDemand() { return predictedDemand; }
    public void setPredictedDemand(Integer predictedDemand) { this.predictedDemand = predictedDemand; }

    public Integer getExpectedShortage() { return expectedShortage; }
    public void setExpectedShortage(Integer expectedShortage) { this.expectedShortage = expectedShortage; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
