package com.ahrao.dto.academic;

import java.time.Instant;
import java.time.LocalDate;

public class AcademicYearSummaryResponse {
    private Long id;
    private Long institutionId;
    private String institutionName;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Long semesterCount;
    private Long sectionCount;
    private Instant createdAt;
    private Instant updatedAt;

    public AcademicYearSummaryResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInstitutionId() {
        return institutionId;
    }

    public void setInstitutionId(Long institutionId) {
        this.institutionId = institutionId;
    }

    public String getInstitutionName() {
        return institutionName;
    }

    public void setInstitutionName(String institutionName) {
        this.institutionName = institutionName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getSemesterCount() {
        return semesterCount;
    }

    public void setSemesterCount(Long semesterCount) {
        this.semesterCount = semesterCount;
    }

    public Long getSectionCount() {
        return sectionCount;
    }

    public void setSectionCount(Long sectionCount) {
        this.sectionCount = sectionCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
