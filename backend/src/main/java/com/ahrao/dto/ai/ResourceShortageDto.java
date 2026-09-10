package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ResourceShortageDto {
    @JsonProperty("resource_category")
    private String resourceCategory;
    @JsonProperty("available_units")
    private Integer availableUnits;
    @JsonProperty("predicted_demand")
    private Integer predictedDemand;
    @JsonProperty("potential_shortage")
    private Integer potentialShortage;
    @JsonProperty("risk_level")
    private String riskLevel; // LOW_RISK, MEDIUM_RISK, HIGH_RISK
    private String explanation;

    public ResourceShortageDto() {}

    public String getResourceCategory() { return resourceCategory; }
    public void setResourceCategory(String resourceCategory) { this.resourceCategory = resourceCategory; }

    public Integer getAvailableUnits() { return availableUnits; }
    public void setAvailableUnits(Integer availableUnits) { this.availableUnits = availableUnits; }

    public Integer getPredictedDemand() { return predictedDemand; }
    public void setPredictedDemand(Integer predictedDemand) { this.predictedDemand = predictedDemand; }

    public Integer getPotentialShortage() { return potentialShortage; }
    public void setPotentialShortage(Integer potentialShortage) { this.potentialShortage = potentialShortage; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
