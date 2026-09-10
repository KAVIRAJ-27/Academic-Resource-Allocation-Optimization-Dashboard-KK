package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ConflictHistoryDto {
    private Long id;
    @JsonProperty("conflict_code")
    private String conflictCode;
    private String severity;
    @JsonProperty("resource_id")
    private Long resourceId;
    @JsonProperty("resource_name")
    private String resourceName;
    @JsonProperty("department_id")
    private Long departmentId;

    public ConflictHistoryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getConflictCode() { return conflictCode; }
    public void setConflictCode(String conflictCode) { this.conflictCode = conflictCode; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
}
