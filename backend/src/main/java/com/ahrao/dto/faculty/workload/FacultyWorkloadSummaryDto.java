package com.ahrao.dto.faculty.workload;

import java.math.BigDecimal;
import java.time.Instant;

public class FacultyWorkloadSummaryDto {

    private Long facultyId;
    private String facultyName;
    private String employeeId;
    private String departmentName;

    private BigDecimal totalHours;
    private BigDecimal teachingHours;
    private BigDecimal labHours;
    private BigDecimal otherHours;

    private int assignedSubjectsCount;
    private int assignedSectionsCount;
    private int weeklyInstructionHours;

    private String workloadStatus; // BALANCED, OVERLOAD, UNDERLOAD, etc.
    private String academicYearName;
    private String semesterName;
    private Instant calculatedAt;

    public FacultyWorkloadSummaryDto() {
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

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
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

    public BigDecimal getOtherHours() {
        return otherHours;
    }

    public void setOtherHours(BigDecimal otherHours) {
        this.otherHours = otherHours;
    }

    public int getAssignedSubjectsCount() {
        return assignedSubjectsCount;
    }

    public void setAssignedSubjectsCount(int assignedSubjectsCount) {
        this.assignedSubjectsCount = assignedSubjectsCount;
    }

    public int getAssignedSectionsCount() {
        return assignedSectionsCount;
    }

    public void setAssignedSectionsCount(int assignedSectionsCount) {
        this.assignedSectionsCount = assignedSectionsCount;
    }

    public int getWeeklyInstructionHours() {
        return weeklyInstructionHours;
    }

    public void setWeeklyInstructionHours(int weeklyInstructionHours) {
        this.weeklyInstructionHours = weeklyInstructionHours;
    }

    public String getWorkloadStatus() {
        return workloadStatus;
    }

    public void setWorkloadStatus(String workloadStatus) {
        this.workloadStatus = workloadStatus;
    }

    public String getAcademicYearName() {
        return academicYearName;
    }

    public void setAcademicYearName(String academicYearName) {
        this.academicYearName = academicYearName;
    }

    public String getSemesterName() {
        return semesterName;
    }

    public void setSemesterName(String semesterName) {
        this.semesterName = semesterName;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}
