package com.ahrao.dto.principal.dashboard;

public class PrincipalDepartmentOverviewDto {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String status;
    private long studentCount;
    private long facultyCount;
    private long programCount;
    private long subjectCount;
    private long pendingRequestCount;
    private long activeAllocationCount;

    public PrincipalDepartmentOverviewDto() {
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

    public long getPendingRequestCount() {
        return pendingRequestCount;
    }

    public void setPendingRequestCount(long pendingRequestCount) {
        this.pendingRequestCount = pendingRequestCount;
    }

    public long getActiveAllocationCount() {
        return activeAllocationCount;
    }

    public void setActiveAllocationCount(long activeAllocationCount) {
        this.activeAllocationCount = activeAllocationCount;
    }
}
