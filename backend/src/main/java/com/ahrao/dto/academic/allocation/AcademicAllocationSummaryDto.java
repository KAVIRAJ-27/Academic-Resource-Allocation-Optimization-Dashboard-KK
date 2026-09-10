package com.ahrao.dto.academic.allocation;

import com.ahrao.entity.enums.AllocationStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public class AcademicAllocationSummaryDto {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceCode;
    private String categoryName;
    private Long departmentId;
    private String departmentName;
    private String building;
    private String roomNumber;
    private String location;
    private Integer capacity;
    private Long allocatedToUserId;
    private String allocatedToUserName;
    private String allocatedToUserEmail;
    private Long requestId;
    private LocalDate allocationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Instant startDatetime;
    private Instant endDatetime;
    private String purpose;
    private AllocationStatus status;
    private String remarks;
    private String allocatedByName;
    private Instant createdAt;
    private Instant allocatedAt;

    public AcademicAllocationSummaryDto() {
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

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Long getAllocatedToUserId() {
        return allocatedToUserId;
    }

    public void setAllocatedToUserId(Long allocatedToUserId) {
        this.allocatedToUserId = allocatedToUserId;
    }

    public String getAllocatedToUserName() {
        return allocatedToUserName;
    }

    public void setAllocatedToUserName(String allocatedToUserName) {
        this.allocatedToUserName = allocatedToUserName;
    }

    public String getAllocatedToUserEmail() {
        return allocatedToUserEmail;
    }

    public void setAllocatedToUserEmail(String allocatedToUserEmail) {
        this.allocatedToUserEmail = allocatedToUserEmail;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public LocalDate getAllocationDate() {
        return allocationDate;
    }

    public void setAllocationDate(LocalDate allocationDate) {
        this.allocationDate = allocationDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
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

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getAllocatedByName() {
        return allocatedByName;
    }

    public void setAllocatedByName(String allocatedByName) {
        this.allocatedByName = allocatedByName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getAllocatedAt() {
        return allocatedAt;
    }

    public void setAllocatedAt(Instant allocatedAt) {
        this.allocatedAt = allocatedAt;
    }
}
