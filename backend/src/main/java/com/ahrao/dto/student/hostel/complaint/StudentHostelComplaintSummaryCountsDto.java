package com.ahrao.dto.student.hostel.complaint;

public class StudentHostelComplaintSummaryCountsDto {
    private long total;
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private long rejected;

    public StudentHostelComplaintSummaryCountsDto() {
    }

    public StudentHostelComplaintSummaryCountsDto(long total, long open, long inProgress, long resolved, long closed, long rejected) {
        this.total = total;
        this.open = open;
        this.inProgress = inProgress;
        this.resolved = resolved;
        this.closed = closed;
        this.rejected = rejected;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public long getOpen() {
        return open;
    }

    public void setOpen(long open) {
        this.open = open;
    }

    public long getInProgress() {
        return inProgress;
    }

    public void setInProgress(long inProgress) {
        this.inProgress = inProgress;
    }

    public long getResolved() {
        return resolved;
    }

    public void setResolved(long resolved) {
        this.resolved = resolved;
    }

    public long getClosed() {
        return closed;
    }

    public void setClosed(long closed) {
        this.closed = closed;
    }

    public long getRejected() {
        return rejected;
    }

    public void setRejected(long rejected) {
        this.rejected = rejected;
    }
}
