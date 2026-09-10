package com.ahrao.dto.conflict;

import com.ahrao.entity.enums.ConflictCode;
import com.ahrao.entity.enums.ConflictDomain;
import com.ahrao.entity.enums.ConflictSeverity;

import java.time.Instant;

public class ConflictSummaryDto {
    private Long allocationId;
    private ConflictDomain domain;
    private String resourceName;
    private String entityIdentifier;
    private ConflictCode conflictCode;
    private ConflictSeverity severity;
    private String summary;
    private Instant detectedAt;
    private String status;

    public ConflictSummaryDto() {
        this.detectedAt = Instant.now();
    }

    public ConflictSummaryDto(Long allocationId, ConflictDomain domain, String resourceName,
                              String entityIdentifier, ConflictCode conflictCode, ConflictSeverity severity,
                              String summary, String status) {
        this.allocationId = allocationId;
        this.domain = domain;
        this.resourceName = resourceName;
        this.entityIdentifier = entityIdentifier;
        this.conflictCode = conflictCode;
        this.severity = severity;
        this.summary = summary;
        this.detectedAt = Instant.now();
        this.status = status;
    }

    public Long getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(Long allocationId) {
        this.allocationId = allocationId;
    }

    public ConflictDomain getDomain() {
        return domain;
    }

    public void setDomain(ConflictDomain domain) {
        this.domain = domain;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getEntityIdentifier() {
        return entityIdentifier;
    }

    public void setEntityIdentifier(String entityIdentifier) {
        this.entityIdentifier = entityIdentifier;
    }

    public ConflictCode getConflictCode() {
        return conflictCode;
    }

    public void setConflictCode(ConflictCode conflictCode) {
        this.conflictCode = conflictCode;
    }

    public ConflictSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(ConflictSeverity severity) {
        this.severity = severity;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Instant getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(Instant detectedAt) {
        this.detectedAt = detectedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
