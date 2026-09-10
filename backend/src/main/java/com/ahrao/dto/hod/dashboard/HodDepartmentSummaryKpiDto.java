package com.ahrao.dto.hod.dashboard;

public class HodDepartmentSummaryKpiDto {

    private long totalStudents;
    private long totalFaculty;
    private long totalPrograms;
    private long totalSubjects;
    private long activeSections;
    private long pendingResourceRequests;
    private long activeResourceAllocations;
    private long totalDepartmentResources;

    public HodDepartmentSummaryKpiDto() {
    }

    public HodDepartmentSummaryKpiDto(
            long totalStudents,
            long totalFaculty,
            long totalPrograms,
            long totalSubjects,
            long activeSections,
            long pendingResourceRequests,
            long activeResourceAllocations,
            long totalDepartmentResources) {
        this.totalStudents = totalStudents;
        this.totalFaculty = totalFaculty;
        this.totalPrograms = totalPrograms;
        this.totalSubjects = totalSubjects;
        this.activeSections = activeSections;
        this.pendingResourceRequests = pendingResourceRequests;
        this.activeResourceAllocations = activeResourceAllocations;
        this.totalDepartmentResources = totalDepartmentResources;
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

    public long getActiveSections() {
        return activeSections;
    }

    public void setActiveSections(long activeSections) {
        this.activeSections = activeSections;
    }

    public long getPendingResourceRequests() {
        return pendingResourceRequests;
    }

    public void setPendingResourceRequests(long pendingResourceRequests) {
        this.pendingResourceRequests = pendingResourceRequests;
    }

    public long getActiveResourceAllocations() {
        return activeResourceAllocations;
    }

    public void setActiveResourceAllocations(long activeResourceAllocations) {
        this.activeResourceAllocations = activeResourceAllocations;
    }

    public long getTotalDepartmentResources() {
        return totalDepartmentResources;
    }

    public void setTotalDepartmentResources(long totalDepartmentResources) {
        this.totalDepartmentResources = totalDepartmentResources;
    }
}
