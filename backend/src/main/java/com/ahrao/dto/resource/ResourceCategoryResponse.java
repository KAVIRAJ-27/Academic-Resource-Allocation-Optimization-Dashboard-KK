package com.ahrao.dto.resource;

import com.ahrao.entity.enums.ResourceType;

public class ResourceCategoryResponse {
    private Long id;
    private String name;
    private String description;
    private ResourceType resourceType;
    private String status;
    private long resourceCount;

    public ResourceCategoryResponse() {
    }

    public ResourceCategoryResponse(Long id, String name, String description, ResourceType resourceType, String status, long resourceCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.resourceType = resourceType;
        this.status = status;
        this.resourceCount = resourceCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getResourceCount() {
        return resourceCount;
    }

    public void setResourceCount(long resourceCount) {
        this.resourceCount = resourceCount;
    }
}
