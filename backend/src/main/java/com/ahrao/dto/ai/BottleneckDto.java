package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BottleneckDto {
    private String id;
    @JsonProperty("entity_id")
    private Long entityId;
    @JsonProperty("entity_name")
    private String entityName;
    private String category; // ACADEMIC, HOSTEL, WORKLOAD, CONFLICT
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW
    @JsonProperty("conflict_count")
    private Integer conflictCount = 0;
    @JsonProperty("utilization_pct")
    private Double utilizationPct = 0.0;
    private String explanation;
    @JsonProperty("recommended_action")
    private String recommendedAction;

    public BottleneckDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }

    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public Integer getConflictCount() { return conflictCount; }
    public void setConflictCount(Integer conflictCount) { this.conflictCount = conflictCount; }

    public Double getUtilizationPct() { return utilizationPct; }
    public void setUtilizationPct(Double utilizationPct) { this.utilizationPct = utilizationPct; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }
}
