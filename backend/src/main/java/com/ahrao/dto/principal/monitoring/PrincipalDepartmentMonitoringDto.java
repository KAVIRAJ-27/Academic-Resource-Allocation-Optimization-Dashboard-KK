package com.ahrao.dto.principal.monitoring;

public class PrincipalDepartmentMonitoringDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String status;
    private String hodName;
    private String hodEmail;
    private long studentCount;
    private long facultyCount;
    private long programCount;
    private long subjectCount;
    private long totalRequests;
    private long pendingRequests;
    private long approvedRequests;
    private long activeAllocations;

    public PrincipalDepartmentMonitoringDto() {
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHodName() {
        return hodName;
    }

    public void setHodName(String hodName) {
        this.hodName = hodName;
    }

    public String getHodEmail() {
        return hodEmail;
    }

    public void setHodEmail(String hodEmail) {
        this.hodEmail = hodEmail;
    }

    public long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(long studentCount) {
        this.studentCount = studentCount;
    }

    public long getFacultyCount() {
        return facultyCount;
    }

    public void setFacultyCount(long facultyCount) {
        this.facultyCount = facultyCount;
    }

    public long getProgramCount() {
        return programCount;
    }

    public void setProgramCount(long programCount) {
        this.programCount = programCount;
    }

    public long getSubjectCount() {
        return subjectCount;
    }

    public void setSubjectCount(long subjectCount) {
        this.subjectCount = subjectCount;
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

    public long getActiveAllocations() {
        return activeAllocations;
    }

    public void setActiveAllocations(long activeAllocations) {
        this.activeAllocations = activeAllocations;
    }
}
