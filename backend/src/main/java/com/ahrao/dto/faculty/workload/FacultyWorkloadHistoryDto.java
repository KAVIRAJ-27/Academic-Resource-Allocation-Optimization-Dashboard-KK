package com.ahrao.dto.faculty.workload;

import java.math.BigDecimal;
import java.time.Instant;

public class FacultyWorkloadHistoryDto {

    private Long id;
    private String academicYearName;
    private String semesterName;
    private BigDecimal totalHours;
    private BigDecimal teachingHours;
    private BigDecimal labHours;
    private BigDecimal otherHours;
    private String workloadStatus;
    private Instant calculatedAt;

    public FacultyWorkloadHistoryDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getWorkloadStatus() {
        return workloadStatus;
    }

    public void setWorkloadStatus(String workloadStatus) {
        this.workloadStatus = workloadStatus;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}
