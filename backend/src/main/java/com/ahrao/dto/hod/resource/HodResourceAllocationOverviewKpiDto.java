package com.ahrao.dto.hod.resource;

public class HodResourceAllocationOverviewKpiDto {
    private long totalAllocations;
    private long activeAllocations;
    private long pendingAllocations;
    private long completedAllocations;

    public HodResourceAllocationOverviewKpiDto() {
    }

    public long getTotalAllocations() {
        return totalAllocations;
    }

    public void setTotalAllocations(long totalAllocations) {
        this.totalAllocations = totalAllocations;
    }

    public long getActiveAllocations() {
        return activeAllocations;
    }

    public void setActiveAllocations(long activeAllocations) {
        this.activeAllocations = activeAllocations;
    }

    public long getPendingAllocations() {
        return pendingAllocations;
    }

    public void setPendingAllocations(long pendingAllocations) {
        this.pendingAllocations = pendingAllocations;
    }

    public long getCompletedAllocations() {
        return completedAllocations;
    }

    public void setCompletedAllocations(long completedAllocations) {
        this.completedAllocations = completedAllocations;
    }
}
