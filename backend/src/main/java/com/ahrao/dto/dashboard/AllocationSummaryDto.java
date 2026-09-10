package com.ahrao.dto.dashboard;

public class AllocationSummaryDto {
    private long totalAllocations;
    private long active;
    private long pending;
    private long completed;
    private long cancelled;

    public AllocationSummaryDto() {
    }

    public AllocationSummaryDto(long totalAllocations, long active, long pending,
                                long completed, long cancelled) {
        this.totalAllocations = totalAllocations;
        this.active = active;
        this.pending = pending;
        this.completed = completed;
        this.cancelled = cancelled;
    }

    public long getTotalAllocations() {
        return totalAllocations;
    }

    public void setTotalAllocations(long totalAllocations) {
        this.totalAllocations = totalAllocations;
    }

    public long getActive() {
        return active;
    }

    public void setActive(long active) {
        this.active = active;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
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
