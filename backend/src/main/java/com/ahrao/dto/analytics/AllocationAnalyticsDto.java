package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class AllocationAnalyticsDto {

    private long totalAllocations;
    private long activeAllocations;
    private long completedAllocations;
    private long cancelledAllocations;
    private long pendingAllocations;

    private Map<String, Long> statusDistribution;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> departmentDistribution;
    private List<TimeSeriesPointDto> allocationsOverTime = new ArrayList<>();

    public AllocationAnalyticsDto() {
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

    public long getPendingAllocations() {
        return pendingAllocations;
    }

    public void setPendingAllocations(long pendingAllocations) {
        this.pendingAllocations = pendingAllocations;
    }

    public Map<String, Long> getStatusDistribution() {
        return statusDistribution;
    }

    public void setStatusDistribution(Map<String, Long> statusDistribution) {
        this.statusDistribution = statusDistribution;
    }

    public Map<String, Long> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Long> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public Map<String, Long> getDepartmentDistribution() {
        return departmentDistribution;
    }

    public void setDepartmentDistribution(Map<String, Long> departmentDistribution) {
        this.departmentDistribution = departmentDistribution;
    }

    public List<TimeSeriesPointDto> getAllocationsOverTime() {
        return allocationsOverTime;
    }

    public void setAllocationsOverTime(List<TimeSeriesPointDto> allocationsOverTime) {
        this.allocationsOverTime = allocationsOverTime;
    }
}
