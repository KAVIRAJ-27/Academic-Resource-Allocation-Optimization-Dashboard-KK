package com.ahrao.dto.principal.dashboard;

public class PrincipalKpiSummaryDto {
    private long totalDepartments;
    private long totalStudents;
    private long totalFaculty;
    private long totalPrograms;
    private long totalSubjects;
    private long totalSections;
    private long academicResources;
    private long pendingResourceRequests;
    private long activeAllocations;
    private long totalHostels;
    private long totalHostelBeds;
    private long occupiedHostelBeds;
    private long pendingApprovals;

    public PrincipalKpiSummaryDto() {
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public long getTotalPrograms() {
        return totalPrograms;
    }

    public void setTotalPrograms(long totalPrograms) {
        this.totalPrograms = totalPrograms;
    }

    public long getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(long totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public long getTotalSections() {
        return totalSections;
    }

    public void setTotalSections(long totalSections) {
        this.totalSections = totalSections;
    }

    public long getAcademicResources() {
        return academicResources;
    }

    public void setAcademicResources(long academicResources) {
        this.academicResources = academicResources;
    }

    public long getPendingResourceRequests() {
        return pendingResourceRequests;
    }

    public void setPendingResourceRequests(long pendingResourceRequests) {
        this.pendingResourceRequests = pendingResourceRequests;
    }

    public long getActiveAllocations() {
        return activeAllocations;
    }

    public void setActiveAllocations(long activeAllocations) {
        this.activeAllocations = activeAllocations;
    }

    public long getTotalHostels() {
        return totalHostels;
    }

    public void setTotalHostels(long totalHostels) {
        this.totalHostels = totalHostels;
    }

    public long getTotalHostelBeds() {
        return totalHostelBeds;
    }

    public void setTotalHostelBeds(long totalHostelBeds) {
        this.totalHostelBeds = totalHostelBeds;
    }

    public long getOccupiedHostelBeds() {
        return occupiedHostelBeds;
    }

    public void setOccupiedHostelBeds(long occupiedHostelBeds) {
        this.occupiedHostelBeds = occupiedHostelBeds;
    }

    public long getPendingApprovals() {
        return pendingApprovals;
    }

    public void setPendingApprovals(long pendingApprovals) {
        this.pendingApprovals = pendingApprovals;
    }
}
