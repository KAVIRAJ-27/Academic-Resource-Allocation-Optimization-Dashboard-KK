package com.ahrao.dto.analytics;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class HostelRequestAnalyticsDto {

    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long rejectedRequests;
    private long cancelledRequests;

    private double approvalRate;
    private double rejectionRate;

    private Map<String, Long> requestsByType;
    private Map<String, Long> requestsByHostel;
    private List<TimeSeriesPointDto> requestsOverTime = new ArrayList<>();

    public HostelRequestAnalyticsDto() {
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getApprovedRequests() {
        return approvedRequests;
    }

    public void setApprovedRequests(long approvedRequests) {
        this.approvedRequests = approvedRequests;
    }

    public long getRejectedRequests() {
        return rejectedRequests;
    }

    public void setRejectedRequests(long rejectedRequests) {
        this.rejectedRequests = rejectedRequests;
    }

    public long getCancelledRequests() {
        return cancelledRequests;
    }

    public void setCancelledRequests(long cancelledRequests) {
        this.cancelledRequests = cancelledRequests;
    }

    public double getApprovalRate() {
        return approvalRate;
    }

    public void setApprovalRate(double approvalRate) {
        this.approvalRate = approvalRate;
    }

    public double getRejectionRate() {
        return rejectionRate;
    }

    public void setRejectionRate(double rejectionRate) {
        this.rejectionRate = rejectionRate;
    }

    public Map<String, Long> getRequestsByType() {
        return requestsByType;
    }

    public void setRequestsByType(Map<String, Long> requestsByType) {
        this.requestsByType = requestsByType;
    }

    public Map<String, Long> getRequestsByHostel() {
        return requestsByHostel;
    }

    public void setRequestsByHostel(Map<String, Long> requestsByHostel) {
        this.requestsByHostel = requestsByHostel;
    }

    public List<TimeSeriesPointDto> getRequestsOverTime() {
        return requestsOverTime;
    }

    public void setRequestsOverTime(List<TimeSeriesPointDto> requestsOverTime) {
        this.requestsOverTime = requestsOverTime;
    }
}
