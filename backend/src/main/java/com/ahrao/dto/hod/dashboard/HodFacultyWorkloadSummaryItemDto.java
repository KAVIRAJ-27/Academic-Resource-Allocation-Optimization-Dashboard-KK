package com.ahrao.dto.hod.dashboard;

import java.math.BigDecimal;

public class HodFacultyWorkloadSummaryItemDto {

    private Long facultyId;
    private String facultyName;
    private String employeeId;
    private String designation;
    private BigDecimal totalHours;
    private BigDecimal teachingHours;
    private BigDecimal labHours;
    private int assignedSubjectsCount;
    private String workloadStatus;

    public HodFacultyWorkloadSummaryItemDto() {
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public BigDecimal getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(BigDecimal totalHours) {
        this.totalHours = totalHours;
    }

    public BigDecimal getTeachingHours() {
        return teachingHours;
    }

    public void setTeachingHours(BigDecimal teachingHours) {
        this.teachingHours = teachingHours;
    }

    public BigDecimal getLabHours() {
        return labHours;
    }

    public void setLabHours(BigDecimal labHours) {
        this.labHours = labHours;
    }

    public int getAssignedSubjectsCount() {
        return assignedSubjectsCount;
    }

    public void setAssignedSubjectsCount(int assignedSubjectsCount) {
        this.assignedSubjectsCount = assignedSubjectsCount;
    }

    public String getWorkloadStatus() {
        return workloadStatus;
    }

    public void setWorkloadStatus(String workloadStatus) {
        this.workloadStatus = workloadStatus;
    }
}
