package com.ahrao.dto.dashboard;

import java.util.ArrayList;
import java.util.List;

public class AdminDashboardOverviewResponse {
    // 1. Core Headline KPI Metrics
    private long totalUsers;
    private long totalDepartments;
    private long activeDepartments;
    private long totalAcademicResources;
    private long totalHostelResources;
    private long totalHostels;
    private long totalRooms;
    private long totalBeds;

    // 2. Operational Statistics
    private long pendingRequests;
    private long activeAllocations;
    private long pendingApprovals;
    private long openIssues;
    private long openComplaints;
    private long openMaintenanceRequests;

    // 3. User Distribution by Role
    private UserDistributionDto userDistribution;

    // 4. Academic Resource Overview
    private AcademicResourceOverviewDto academicResourceOverview;

    // 5. Hostel Resource Overview
    private HostelResourceOverviewDto hostelResourceOverview;

    // 6. Request Summary
    private RequestSummaryDto requestSummary;

    // 7. Allocation Summary
    private AllocationSummaryDto allocationSummary;

    // 8. Approval Summary
    private ApprovalSummaryDto approvalSummary;

    // 9. Recent Activity
    private List<RecentActivityDto> recentActivities = new ArrayList<>();

    public AdminDashboardOverviewResponse() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getActiveDepartments() {
        return activeDepartments;
    }

    public void setActiveDepartments(long activeDepartments) {
        this.activeDepartments = activeDepartments;
    }

    public long getTotalAcademicResources() {
        return totalAcademicResources;
    }

    public void setTotalAcademicResources(long totalAcademicResources) {
        this.totalAcademicResources = totalAcademicResources;
    }

    public long getTotalHostelResources() {
        return totalHostelResources;
    }

    public void setTotalHostelResources(long totalHostelResources) {
        this.totalHostelResources = totalHostelResources;
    }

    public long getTotalHostels() {
        return totalHostels;
    }

    public void setTotalHostels(long totalHostels) {
        this.totalHostels = totalHostels;
    }

    public long getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(long totalRooms) {
        this.totalRooms = totalRooms;
    }

    public long getTotalBeds() {
        return totalBeds;
    }

    public void setTotalBeds(long totalBeds) {
        this.totalBeds = totalBeds;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(long pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public long getActiveAllocations() {
        return activeAllocations;
    }

    public void setActiveAllocations(long activeAllocations) {
        this.activeAllocations = activeAllocations;
    }

    public long getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(long pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }

    public long getOpenIssues() {
        return openIssues;
    }

    public void setOpenIssues(long openIssues) {
        this.openIssues = openIssues;
    }

    public long getOpenComplaints() {
        return openComplaints;
    }

    public void setOpenComplaints(long openComplaints) {
        this.openComplaints = openComplaints;
    }

    public long getOpenMaintenanceRequests() {
        return openMaintenanceRequests;
    }

    public void setOpenMaintenanceRequests(long openMaintenanceRequests) {
        this.openMaintenanceRequests = openMaintenanceRequests;
    }

    public UserDistributionDto getUserDistribution() {
        return userDistribution;
    }

    public void setUserDistribution(UserDistributionDto userDistribution) {
        this.userDistribution = userDistribution;
    }

    public AcademicResourceOverviewDto getAcademicResourceOverview() {
        return academicResourceOverview;
    }

    public void setAcademicResourceOverview(AcademicResourceOverviewDto academicResourceOverview) {
        this.academicResourceOverview = academicResourceOverview;
    }

    public HostelResourceOverviewDto getHostelResourceOverview() {
        return hostelResourceOverview;
    }

    public void setHostelResourceOverview(HostelResourceOverviewDto hostelResourceOverview) {
        this.hostelResourceOverview = hostelResourceOverview;
    }

    public RequestSummaryDto getRequestSummary() {
        return requestSummary;
    }

    public void setRequestSummary(RequestSummaryDto requestSummary) {
        this.requestSummary = requestSummary;
    }

    public AllocationSummaryDto getAllocationSummary() {
        return allocationSummary;
    }

    public void setAllocationSummary(AllocationSummaryDto allocationSummary) {
        this.allocationSummary = allocationSummary;
    }

    public ApprovalSummaryDto getApprovalSummary() {
        return approvalSummary;
    }

    public void setApprovalSummary(ApprovalSummaryDto approvalSummary) {
        this.approvalSummary = approvalSummary;
    }

    public List<RecentActivityDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<RecentActivityDto> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
