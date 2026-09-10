package com.ahrao.dto.academic.allocation;

public class AcademicAllocationOverviewDto {

    private long totalAllocations;
    private long activeAllocations;
    private long completedAllocations;
    private long cancelledAllocations;
    private long classroomsAllocated;
    private long labsAllocated;
    private long pendingApprovedRequests;
    private double allocationSuccessRate;

    public AcademicAllocationOverviewDto() {
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

    public long getClassroomsAllocated() {
        return classroomsAllocated;
    }

    public void setClassroomsAllocated(long classroomsAllocated) {
        this.classroomsAllocated = classroomsAllocated;
    }

    public long getLabsAllocated() {
        return labsAllocated;
    }

    public void setLabsAllocated(long labsAllocated) {
        this.labsAllocated = labsAllocated;
    }

    public long getPendingApprovedRequests() {
        return pendingApprovedRequests;
    }

    public void setPendingApprovedRequests(long pendingApprovedRequests) {
        this.pendingApprovedRequests = pendingApprovedRequests;
    }

    public double getAllocationSuccessRate() {
        return allocationSuccessRate;
    }

    public void setAllocationSuccessRate(double allocationSuccessRate) {
        this.allocationSuccessRate = allocationSuccessRate;
    }
}
