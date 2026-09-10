package com.ahrao.dto.allocation;

import com.ahrao.entity.enums.AllocationStatus;

import java.time.LocalDateTime;

public class ResourceAllocationDto {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceCode;
    private Long allocatedToUserId;
    private String allocatedToUserName;
    private Long departmentId;
    private Long requestId;
    private Long academicYearId;
    private Long semesterId;
    private Long timeSlotId;
    private LocalDateTime startDatetime;
    private LocalDateTime endDatetime;
    private Integer quantity;
    private String purpose;
    private AllocationStatus status;
    private String allocatedBy;
    private LocalDateTime createdAt;

    public ResourceAllocationDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getResourceName() { return resourceName; }
    public void setResourceName(String resourceName) { this.resourceName = resourceName; }

    public String getResourceCode() { return resourceCode; }
    public void setResourceCode(String resourceCode) { this.resourceCode = resourceCode; }

    public Long getAllocatedToUserId() { return allocatedToUserId; }
    public void setAllocatedToUserId(Long allocatedToUserId) { this.allocatedToUserId = allocatedToUserId; }

    public String getAllocatedToUserName() { return allocatedToUserName; }
    public void setAllocatedToUserName(String allocatedToUserName) { this.allocatedToUserName = allocatedToUserName; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public Long getTimeSlotId() { return timeSlotId; }
    public void setTimeSlotId(Long timeSlotId) { this.timeSlotId = timeSlotId; }

    public LocalDateTime getStartDatetime() { return startDatetime; }
    public void setStartDatetime(LocalDateTime startDatetime) { this.startDatetime = startDatetime; }

    public LocalDateTime getEndDatetime() { return endDatetime; }
    public void setEndDatetime(LocalDateTime endDatetime) { this.endDatetime = endDatetime; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public AllocationStatus getStatus() { return status; }
    public void setStatus(AllocationStatus status) { this.status = status; }

    public String getAllocatedBy() { return allocatedBy; }
    public void setAllocatedBy(String allocatedBy) { this.allocatedBy = allocatedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
