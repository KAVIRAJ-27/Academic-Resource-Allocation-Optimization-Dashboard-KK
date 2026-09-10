package com.ahrao.dto.principal.dashboard;

public class PrincipalAllocationOverviewDto {
    private long totalAllocations;
    private long activeAllocations;
    private long pendingAllocations;
    private long completedAllocations;
    private long cancelledAllocations;

    public PrincipalAllocationOverviewDto() {
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

    public long getCancelledAllocations() {
        return cancelledAllocations;
    }

    public void setCancelledAllocations(long cancelledAllocations) {
        this.cancelledAllocations = cancelledAllocations;
    }
}
