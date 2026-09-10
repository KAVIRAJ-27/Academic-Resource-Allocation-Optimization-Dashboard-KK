package com.ahrao.dto.principal.resource;

import java.time.Instant;

public class PrincipalRelatedAllocationDto {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceCode;
    private String allocatedToName;
    private String status;
    private Instant allocatedAt;

    public PrincipalRelatedAllocationDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getResourceCode() {
        return resourceCode;
    }

    public void setResourceCode(String resourceCode) {
        this.resourceCode = resourceCode;
    }

    public String getAllocatedToName() {
        return allocatedToName;
    }

    public void setAllocatedToName(String allocatedToName) {
        this.allocatedToName = allocatedToName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getAllocatedAt() {
        return allocatedAt;
    }

    public void setAllocatedAt(Instant allocatedAt) {
        this.allocatedAt = allocatedAt;
    }
}
