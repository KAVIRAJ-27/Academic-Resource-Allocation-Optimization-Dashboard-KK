package com.ahrao.dto.hostel.allocation;

import com.fasterxml.jackson.annotation.JsonProperty;

public class HostelAllocationConflictDto {

    private String code;
    private String resourceType;
    private Long resourceId;
    private String message;
    private String severity;
    private String details;

    public HostelAllocationConflictDto() {
        this.severity = "ERROR";
    }

    public HostelAllocationConflictDto(String code, String resourceType, Long resourceId, String message) {
        this(code, resourceType, resourceId, message, "ERROR", null);
    }

    public HostelAllocationConflictDto(String code, String resourceType, Long resourceId, String message, String severity, String details) {
        this.code = code;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.message = message;
        this.severity = severity != null ? severity : "ERROR";
        this.details = details;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    @JsonProperty("conflictType")
    public String getConflictType() {
        return code;
    }

    public void setConflictType(String conflictType) {
        this.code = conflictType;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    @JsonProperty("entityType")
    public String getEntityType() {
        return resourceType;
    }

    public void setEntityType(String entityType) {
        this.resourceType = entityType;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    @JsonProperty("entityId")
    public Long getEntityId() {
        return resourceId;
    }

    public void setEntityId(Long entityId) {
        this.resourceId = entityId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}

