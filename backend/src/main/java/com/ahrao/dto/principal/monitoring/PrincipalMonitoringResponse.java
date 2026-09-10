package com.ahrao.dto.principal.monitoring;

import com.ahrao.dto.principal.dashboard.PrincipalRecentActivityDto;

import java.util.ArrayList;
import java.util.List;

public class PrincipalMonitoringResponse {
    private PrincipalMonitoringSummaryDto summary;
    private List<PrincipalDepartmentMonitoringDto> departments = new ArrayList<>();
    private List<PrincipalHostelMonitoringDto> hostels = new ArrayList<>();
    private List<PrincipalRecentActivityDto> recentActivity = new ArrayList<>();

    public PrincipalMonitoringResponse() {
    }

    public PrincipalMonitoringSummaryDto getSummary() {
        return summary;
    }

    public void setSummary(PrincipalMonitoringSummaryDto summary) {
        this.summary = summary;
    }

    public List<PrincipalDepartmentMonitoringDto> getDepartments() {
        return departments;
    }

    public void setDepartments(List<PrincipalDepartmentMonitoringDto> departments) {
        this.departments = departments;
    }

    public List<PrincipalHostelMonitoringDto> getHostels() {
        return hostels;
    }

    public void setHostels(List<PrincipalHostelMonitoringDto> hostels) {
        this.hostels = hostels;
    }

    public List<PrincipalRecentActivityDto> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<PrincipalRecentActivityDto> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
