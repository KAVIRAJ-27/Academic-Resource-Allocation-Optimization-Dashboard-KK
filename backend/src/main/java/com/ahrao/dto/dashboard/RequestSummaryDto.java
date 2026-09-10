package com.ahrao.dto.dashboard;

public class RequestSummaryDto {
    private long totalRequests;
    private long pending;
    private long approved;
    private long rejected;
    private long completed;
    private long cancelled;

    public RequestSummaryDto() {
    }

    public RequestSummaryDto(long totalRequests, long pending, long approved, long rejected,
                             long completed, long cancelled) {
        this.totalRequests = totalRequests;
        this.pending = pending;
        this.approved = approved;
        this.rejected = rejected;
        this.completed = completed;
        this.cancelled = cancelled;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
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

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public long getCancelled() {
        return cancelled;
    }

    public void setCancelled(long cancelled) {
        this.cancelled = cancelled;
    }
}
