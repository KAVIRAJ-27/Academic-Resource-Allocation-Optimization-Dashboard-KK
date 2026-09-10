package com.ahrao.dto.student.hostel.request;

public class StudentHostelRequestSummaryCountsDto {
    private long total;
    private long pending;
    private long approved;
    private long rejected;
    private long cancelled;
    private long completed;

    public StudentHostelRequestSummaryCountsDto() {
    }

    public StudentHostelRequestSummaryCountsDto(long total, long pending, long approved, long rejected, long cancelled, long completed) {
        this.total = total;
        this.pending = pending;
        this.approved = approved;
        this.rejected = rejected;
        this.cancelled = cancelled;
        this.completed = completed;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
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

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }
}
