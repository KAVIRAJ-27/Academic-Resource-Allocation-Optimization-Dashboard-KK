package com.ahrao.dto.hod.dashboard;

import java.time.Instant;

public class HodActiveAllocationItemDto {

    private Long allocationId;
    private String resourceName;
    private String resourceCode;
    private String resourceCategoryName;
    private String allocatedToName;
    private String allocatedToRole;
    private String purpose;
    private Instant startDatetime;
    private Instant endDatetime;
    private Integer quantity;
    private String status;

    public HodActiveAllocationItemDto() {
    }

    public Long getAllocationId() {
        return allocationId;
    }

    public void setAllocationId(Long allocationId) {
        this.allocationId = allocationId;
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

    public String getResourceCategoryName() {
        return resourceCategoryName;
    }

    public void setResourceCategoryName(String resourceCategoryName) {
        this.resourceCategoryName = resourceCategoryName;
    }

    public String getAllocatedToName() {
        return allocatedToName;
    }

    public void setAllocatedToName(String allocatedToName) {
        this.allocatedToName = allocatedToName;
    }

    public String getAllocatedToRole() {
        return allocatedToRole;
    }

    public void setAllocatedToRole(String allocatedToRole) {
        this.allocatedToRole = allocatedToRole;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
