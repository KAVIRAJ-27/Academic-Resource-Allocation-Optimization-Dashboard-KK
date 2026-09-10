package com.ahrao.dto.conflict;

import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.ConflictSeverity;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public class ConflictItemDto {
    private ConflictCode code;
    private ConflictDomain domain;
    private ConflictSeverity severity;
    private String resourceType;
    private Long resourceId;
    private String message;
    private String details;
    private Instant timestamp;

    public ConflictItemDto() {
        this.timestamp = Instant.now();
    }

    public ConflictItemDto(ConflictCode code, ConflictDomain domain, ConflictSeverity severity,
                           String resourceType, Long resourceId, String message) {
        this(code, domain, severity, resourceType, resourceId, message, null);
    }

    public ConflictItemDto(ConflictCode code, ConflictDomain domain, ConflictSeverity severity,
                           String resourceType, Long resourceId, String message, String details) {
        this.code = code;
        this.domain = domain;
        this.severity = severity;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.message = message;
        this.details = details;
        this.timestamp = Instant.now();
    }

    public ConflictCode getCode() {
        return code;
    }

    public void setCode(ConflictCode code) {
        this.code = code;
    }

    @JsonProperty("conflictType")
    public String getConflictType() {
        return code != null ? code.name() : null;
    }

    public void setConflictType(String conflictType) {
        if (conflictType != null) {
            try {
                this.code = ConflictCode.valueOf(conflictType);
            } catch (IllegalArgumentException ignored) {
            }
        }
    }

    public ConflictDomain getDomain() {
        return domain;
    }

    public void setDomain(ConflictDomain domain) {
        this.domain = domain;
    }

    public ConflictSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(ConflictSeverity severity) {
        this.severity = severity;
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

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}

