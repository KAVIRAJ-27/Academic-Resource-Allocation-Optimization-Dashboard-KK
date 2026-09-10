package com.ahrao.dto.faculty.resource;

public class FacultyResourceRequestSummaryCountsDto {

    private long totalCount;
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;
    private long cancelledCount;
    private long completedCount;

    public FacultyResourceRequestSummaryCountsDto() {
    }

    public FacultyResourceRequestSummaryCountsDto(
            long totalCount,
            long pendingCount,
            long approvedCount,
            long rejectedCount,
            long cancelledCount,
            long completedCount) {
        this.totalCount = totalCount;
        this.pendingCount = pendingCount;
        this.approvedCount = approvedCount;
        this.rejectedCount = rejectedCount;
        this.cancelledCount = cancelledCount;
        this.completedCount = completedCount;
    }

    public long getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(long totalCount) {
        this.totalCount = totalCount;
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

    public long getCompletedCount() {
        return completedCount;
    }

    public void setCompletedCount(long completedCount) {
        this.completedCount = completedCount;
    }
}
