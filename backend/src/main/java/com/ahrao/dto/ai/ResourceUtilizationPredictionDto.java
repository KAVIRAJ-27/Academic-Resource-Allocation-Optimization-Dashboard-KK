package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ResourceUtilizationPredictionDto {
    @JsonProperty("resource_id")
    private Long resourceId;
    @JsonProperty("resource_name")
    private String resourceName;
    @JsonProperty("resource_category")
    private String resourceCategory;
    @JsonProperty("current_utilization")
    private Double currentUtilization;
    @JsonProperty("predicted_utilization")
    private Double predictedUtilization;
    @JsonProperty("utilization_delta")
    private Double utilizationDelta;
    @JsonProperty("prediction_period")
    private String predictionPeriod;
    private String explanation;
    @JsonProperty("model_version")
    private String modelVersion;

    public ResourceUtilizationPredictionDto() {}

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getResourceCategory() { return resourceCategory; }
    public void setResourceCategory(String resourceCategory) { this.resourceCategory = resourceCategory; }

    public Double getCurrentUtilization() { return currentUtilization; }
    public void setCurrentUtilization(Double currentUtilization) { this.currentUtilization = currentUtilization; }

    public Double getPredictedUtilization() { return predictedUtilization; }
    public void setPredictedUtilization(Double predictedUtilization) { this.predictedUtilization = predictedUtilization; }

    public Double getUtilizationDelta() { return utilizationDelta; }
    public void setUtilizationDelta(Double utilizationDelta) { this.utilizationDelta = utilizationDelta; }

    public String getPredictionPeriod() { return predictionPeriod; }
    public void setPredictionPeriod(String predictionPeriod) { this.predictionPeriod = predictionPeriod; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getModelVersion() { return modelVersion; }
    public void setModelVersion(String modelVersion) { this.modelVersion = modelVersion; }
}
