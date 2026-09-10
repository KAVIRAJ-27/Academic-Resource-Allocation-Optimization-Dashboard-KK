package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AcademicDemandPredictionDto {
    @JsonProperty("resource_category")
    private String resourceCategory;
    @JsonProperty("current_demand")
    private Integer currentDemand;
    @JsonProperty("predicted_demand")
    private Integer predictedDemand;
    @JsonProperty("demand_growth_pct")
    private Double demandGrowthPct;
    private Double confidence;
    @JsonProperty("confidence_label")
    private String confidenceLabel;
    private String explanation;
    @JsonProperty("model_version")
    private String modelVersion;

    public AcademicDemandPredictionDto() {}

    public String getResourceCategory() { return resourceCategory; }
    public void setResourceCategory(String resourceCategory) { this.resourceCategory = resourceCategory; }

    public Integer getCurrentDemand() { return currentDemand; }
    public void setCurrentDemand(Integer currentDemand) { this.currentDemand = currentDemand; }

    public Integer getPredictedDemand() { return predictedDemand; }
    public void setPredictedDemand(Integer predictedDemand) { this.predictedDemand = predictedDemand; }

    public Double getDemandGrowthPct() { return demandGrowthPct; }
    public void setDemandGrowthPct(Double demandGrowthPct) { this.demandGrowthPct = demandGrowthPct; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public String getConfidenceLabel() { return confidenceLabel; }
    public void setConfidenceLabel(String confidenceLabel) { this.confidenceLabel = confidenceLabel; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
