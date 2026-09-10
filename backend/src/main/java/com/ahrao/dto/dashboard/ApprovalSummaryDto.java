package com.ahrao.dto.dashboard;

public class ApprovalSummaryDto {
    private long totalApprovals;
    private long pending;
    private long approved;
    private long rejected;
    private long cancelled;

    public ApprovalSummaryDto() {
    }

    public ApprovalSummaryDto(long totalApprovals, long pending, long approved,
                              long rejected, long cancelled) {
        this.totalApprovals = totalApprovals;
        this.pending = pending;
        this.approved = approved;
        this.rejected = rejected;
        this.cancelled = cancelled;
    }

    public long getTotalApprovals() {
        return totalApprovals;
    }

    public void setTotalApprovals(long totalApprovals) {
        this.totalApprovals = totalApprovals;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getApproved() {
        return approved;
    }

    public void setApproved(long approved) {
        this.approved = approved;
    }

    public long getRejected() {
        return rejected;
    }

    public void setRejected(long rejected) {
        this.rejected = rejected;
    }

    public long getCancelled() {
        return cancelled;
    }

    public void setCancelled(long cancelled) {
        this.cancelled = cancelled;
    }
}
