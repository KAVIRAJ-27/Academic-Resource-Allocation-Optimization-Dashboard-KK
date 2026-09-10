package com.ahrao.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AllocationHistoryDto {
    private Long id;
    @JsonProperty("resource_id")
    private Long resourceId;
    @JsonProperty("resource_name")
    private String resourceName;
    private String category;
    @JsonProperty("department_id")
    private Long departmentId;
    @JsonProperty("department_name")
    private String departmentName;
    @JsonProperty("allocated_students")
    private Integer allocatedStudents = 0;
    private Integer capacity = 60;
    @JsonProperty("duration_hours")
    private Double durationHours = 1.0;
    private String status = "COMPLETED";

    public AllocationHistoryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Integer getAllocatedStudents() { return allocatedStudents; }
    public void setAllocatedStudents(Integer allocatedStudents) { this.allocatedStudents = allocatedStudents; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Double getDurationHours() { return durationHours; }
    public void setDurationHours(Double durationHours) { this.durationHours = durationHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
