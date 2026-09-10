package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RequestHistoryDto {
    private Long id;
    @JsonProperty("resource_category")
    private String resourceCategory;
    @JsonProperty("department_id")
    private Long departmentId;
    private String status = "PENDING";
    @JsonProperty("requested_capacity")
    private Integer requestedCapacity = 40;

    public RequestHistoryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getResourceCategory() { return resourceCategory; }
    public void setResourceCategory(String resourceCategory) { this.resourceCategory = resourceCategory; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getRequestedCapacity() { return requestedCapacity; }
    public void setRequestedCapacity(Integer requestedCapacity) { this.requestedCapacity = requestedCapacity; }
}
