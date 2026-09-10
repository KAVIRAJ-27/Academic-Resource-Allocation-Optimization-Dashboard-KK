package com.ahrao.dto.hod.resource;

import com.ahrao.entity.enums.AllocationStatus;

import java.time.Instant;

public class HodResourceAllocationSummaryDto {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceCode;
    private String categoryName;
    private Long allocatedToUserId;
    private String allocatedToName;
    private String allocatedToEmail;
    private String allocatedToRole;
    private Long departmentId;
    private String departmentName;
    private String academicYearName;
    private String semesterName;
    private String timeSlotName;
    private Instant startDatetime;
    private Instant endDatetime;
    private Integer quantity;
    private String purpose;
    private AllocationStatus status;
    private Long allocatedByUserId;
    private String allocatedByName;
    private Long requestId;
    private Instant createdAt;

    public HodResourceAllocationSummaryDto() {
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getAllocatedToUserId() {
        return allocatedToUserId;
    }

    public void setAllocatedToUserId(Long allocatedToUserId) {
        this.allocatedToUserId = allocatedToUserId;
    }

    public String getAllocatedToName() {
        return allocatedToName;
    }

    public void setAllocatedToName(String allocatedToName) {
        this.allocatedToName = allocatedToName;
    }

    public String getAllocatedToEmail() {
        return allocatedToEmail;
    }

    public void setAllocatedToEmail(String allocatedToEmail) {
        this.allocatedToEmail = allocatedToEmail;
    }

    public String getAllocatedToRole() {
        return allocatedToRole;
    }

    public void setAllocatedToRole(String allocatedToRole) {
        this.allocatedToRole = allocatedToRole;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getAcademicYearName() {
        return academicYearName;
    }

    public void setAcademicYearName(String academicYearName) {
        this.academicYearName = academicYearName;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public String getTimeSlotName() {
        return timeSlotName;
    }

    public void setTimeSlotName(String timeSlotName) {
        this.timeSlotName = timeSlotName;
    }

    public Instant getStartDatetime() {
        return startDatetime;
    }

    public void setStartDatetime(Instant startDatetime) {
        this.startDatetime = startDatetime;
    }

    public Instant getEndDatetime() {
        return endDatetime;
    }

    public void setEndDatetime(Instant endDatetime) {
        this.endDatetime = endDatetime;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public AllocationStatus getStatus() {
        return status;
    }

    public void setStatus(AllocationStatus status) {
        this.status = status;
    }

    public Long getAllocatedByUserId() {
        return allocatedByUserId;
    }

    public void setAllocatedByUserId(Long allocatedByUserId) {
        this.allocatedByUserId = allocatedByUserId;
    }

    public String getAllocatedByName() {
        return allocatedByName;
    }

    public void setAllocatedByName(String allocatedByName) {
        this.allocatedByName = allocatedByName;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
