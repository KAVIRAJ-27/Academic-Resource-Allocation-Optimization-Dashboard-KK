package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashMap;
import java.util.Map;

public class AiRecommendationDto {
    private String id;
    private String type; // RESOURCE_CAPACITY, WORKLOAD_BALANCING, HOSTEL_CAPACITY, CONFLICT_PREVENTION, MAINTENANCE_PRIORITY
    private String priority; // HIGH, MEDIUM, LOW
    @JsonProperty("entity_id")
    private Long entityId;
    @JsonProperty("entity_name")
    private String entityName;
    private String recommendation;
    private String reason;
    @JsonProperty("supporting_metrics")
    private Map<String, Object> supportingMetrics = new HashMap<>();
    @JsonProperty("generated_at")
    private String generatedAt;

    public AiRecommendationDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getRecommendation() { return recommendation; }
    public void setRecommendation(String recommendation) { this.recommendation = recommendation; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Map<String, Object> getSupportingMetrics() { return supportingMetrics; }
    public void setSupportingMetrics(Map<String, Object> supportingMetrics) { this.supportingMetrics = supportingMetrics; }

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }
}
