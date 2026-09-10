package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AnomalyDto {
    private String id;
    @JsonProperty("anomaly_type")
    private String anomalyType; // USAGE_SPIKE, UNUSUAL_ALLOCATION, HOSTEL_SURGE, COMPLAINT_SPIKE, CONFLICT_BURST
    @JsonProperty("entity_id")
    private Long entityId;
    @JsonProperty("entity_name")
    private String entityName;
    @JsonProperty("observed_value")
    private Double observedValue;
    @JsonProperty("expected_baseline")
    private Double expectedBaseline;
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW
    @JsonProperty("anomaly_score")
    private Double anomalyScore;
    private String reason;

    public AnomalyDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAnomalyType() { return anomalyType; }
    public void setAnomalyType(String anomalyType) { this.anomalyType = anomalyType; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public Double getObservedValue() { return observedValue; }
    public void setObservedValue(Double observedValue) { this.observedValue = observedValue; }

    public Double getExpectedBaseline() { return expectedBaseline; }
    public void setExpectedBaseline(Double expectedBaseline) { this.expectedBaseline = expectedBaseline; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public Double getAnomalyScore() { return anomalyScore; }
    public void setAnomalyScore(Double anomalyScore) { this.anomalyScore = anomalyScore; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
