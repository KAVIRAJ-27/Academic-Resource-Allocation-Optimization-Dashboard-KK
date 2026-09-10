package com.ahrao.dto.hod.resource;

public class HodResourceRequestOverviewKpiDto {
    // Request status counts
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;
    private long cancelledCount;
    private long totalRequestsCount;

    // Resource status overview
    private long totalResources;
    private long availableResources;
    private long allocatedResources;
    private long maintenanceResources;
    private long inactiveResources;

    public HodResourceRequestOverviewKpiDto() {
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public long getApprovedCount() {
        return approvedCount;
    }

    public void setApprovedCount(long approvedCount) {
        this.approvedCount = approvedCount;
    }

    public long getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(long rejectedCount) {
        this.rejectedCount = rejectedCount;
    }

    public long getCancelledCount() {
        return cancelledCount;
    }

    public void setCancelledCount(long cancelledCount) {
        this.cancelledCount = cancelledCount;
    }

    public long getTotalRequestsCount() {
        return totalRequestsCount;
    }

    public void setTotalRequestsCount(long totalRequestsCount) {
        this.totalRequestsCount = totalRequestsCount;
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getAvailableResources() {
        return availableResources;
    }

    public void setAvailableResources(long availableResources) {
        this.availableResources = availableResources;
    }

    public long getAllocatedResources() {
        return allocatedResources;
    }

    public void setAllocatedResources(long allocatedResources) {
        this.allocatedResources = allocatedResources;
    }

    public long getMaintenanceResources() {
        return maintenanceResources;
    }

    public void setMaintenanceResources(long maintenanceResources) {
        this.maintenanceResources = maintenanceResources;
    }

    public long getInactiveResources() {
        return inactiveResources;
    }

    public void setInactiveResources(long inactiveResources) {
        this.inactiveResources = inactiveResources;
    }
}
