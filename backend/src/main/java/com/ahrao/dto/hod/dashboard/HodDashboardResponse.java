package com.ahrao.dto.hod.dashboard;

import java.util.ArrayList;
import java.util.List;

public class HodDashboardResponse {

    private HodDepartmentInfoDto department;
    private HodDepartmentSummaryKpiDto summary;
    private List<HodStudentProgramDistributionDto> studentDistribution = new ArrayList<>();
    private List<HodFacultyWorkloadSummaryItemDto> facultyWorkloads = new ArrayList<>();
    private List<HodPendingResourceRequestItemDto> pendingRequests = new ArrayList<>();
    private List<HodActiveAllocationItemDto> activeAllocations = new ArrayList<>();
    private HodResourceUtilizationSummaryDto resourceUtilization;
    private List<HodActivityDto> recentActivities = new ArrayList<>();

    public HodDashboardResponse() {
    }

    public HodDepartmentInfoDto getDepartment() {
        return department;
    }

    public void setDepartment(HodDepartmentInfoDto department) {
        this.department = department;
    }

    public HodDepartmentSummaryKpiDto getSummary() {
        return summary;
    }

    public void setSummary(HodDepartmentSummaryKpiDto summary) {
        this.summary = summary;
    }

    public List<HodStudentProgramDistributionDto> getStudentDistribution() {
        return studentDistribution;
    }

    public void setStudentDistribution(List<HodStudentProgramDistributionDto> studentDistribution) {
        this.studentDistribution = studentDistribution;
    }

    public List<HodFacultyWorkloadSummaryItemDto> getFacultyWorkloads() {
        return facultyWorkloads;
    }

    public void setFacultyWorkloads(List<HodFacultyWorkloadSummaryItemDto> facultyWorkloads) {
        this.facultyWorkloads = facultyWorkloads;
    }

    public List<HodPendingResourceRequestItemDto> getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(List<HodPendingResourceRequestItemDto> pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public List<HodActiveAllocationItemDto> getActiveAllocations() {
        return activeAllocations;
    }

    public void setActiveAllocations(List<HodActiveAllocationItemDto> activeAllocations) {
        this.activeAllocations = activeAllocations;
    }

    public HodResourceUtilizationSummaryDto getResourceUtilization() {
        return resourceUtilization;
    }

    public void setResourceUtilization(HodResourceUtilizationSummaryDto resourceUtilization) {
        this.resourceUtilization = resourceUtilization;
    }

    public List<HodActivityDto> getRecentActivities() {
        return recentActivities;
    }

    public void setRecentActivities(List<HodActivityDto> recentActivities) {
        this.recentActivities = recentActivities;
    }
}
