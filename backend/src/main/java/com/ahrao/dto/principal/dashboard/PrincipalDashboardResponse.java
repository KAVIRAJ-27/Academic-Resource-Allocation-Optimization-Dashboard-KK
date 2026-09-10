package com.ahrao.dto.principal.dashboard;

import java.util.ArrayList;
import java.util.List;

public class PrincipalDashboardResponse {
    private PrincipalInstitutionDto institution;
    private PrincipalKpiSummaryDto kpiSummary;
    private List<PrincipalDepartmentOverviewDto> departments = new ArrayList<>();
    private PrincipalStudentOverviewDto students;
    private PrincipalFacultyOverviewDto faculty;
    private PrincipalResourceOverviewDto academicResources;
    private PrincipalRequestOverviewDto resourceRequests;
    private PrincipalAllocationOverviewDto allocations;
    private PrincipalHostelOverviewDto hostel;
    private PrincipalPendingApprovalsDto approvals;
    private List<PrincipalRecentActivityDto> recentActivity = new ArrayList<>();

    public PrincipalDashboardResponse() {
    }

    public PrincipalInstitutionDto getInstitution() {
        return institution;
    }

    public void setInstitution(PrincipalInstitutionDto institution) {
        this.institution = institution;
    }

    public PrincipalKpiSummaryDto getKpiSummary() {
        return kpiSummary;
    }

    public void setKpiSummary(PrincipalKpiSummaryDto kpiSummary) {
        this.kpiSummary = kpiSummary;
    }

    public List<PrincipalDepartmentOverviewDto> getDepartments() {
        return departments;
    }

    public void setDepartments(List<PrincipalDepartmentOverviewDto> departments) {
        this.departments = departments;
    }

    public PrincipalStudentOverviewDto getStudents() {
        return students;
    }

    public void setStudents(PrincipalStudentOverviewDto students) {
        this.students = students;
    }

    public PrincipalFacultyOverviewDto getFaculty() {
        return faculty;
    }

    public void setFaculty(PrincipalFacultyOverviewDto faculty) {
        this.faculty = faculty;
    }

    public PrincipalResourceOverviewDto getAcademicResources() {
        return academicResources;
    }

    public void setAcademicResources(PrincipalResourceOverviewDto academicResources) {
        this.academicResources = academicResources;
    }

    public PrincipalRequestOverviewDto getResourceRequests() {
        return resourceRequests;
    }

    public void setResourceRequests(PrincipalRequestOverviewDto resourceRequests) {
        this.resourceRequests = resourceRequests;
    }

    public PrincipalAllocationOverviewDto getAllocations() {
        return allocations;
    }

    public void setAllocations(PrincipalAllocationOverviewDto allocations) {
        this.allocations = allocations;
    }

    public PrincipalHostelOverviewDto getHostel() {
        return hostel;
    }

    public void setHostel(PrincipalHostelOverviewDto hostel) {
        this.hostel = hostel;
    }

    public PrincipalPendingApprovalsDto getApprovals() {
        return approvals;
    }

    public void setApprovals(PrincipalPendingApprovalsDto approvals) {
        this.approvals = approvals;
    }

    public List<PrincipalRecentActivityDto> getRecentActivity() {
        return recentActivity;
    }

    public void setRecentActivity(List<PrincipalRecentActivityDto> recentActivity) {
        this.recentActivity = recentActivity;
    }
}
