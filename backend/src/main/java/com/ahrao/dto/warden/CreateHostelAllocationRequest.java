package com.ahrao.dto.warden;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateHostelAllocationRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Bed ID is required")
    private Long bedId;

    private Long academicYearId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    public CreateHostelAllocationRequest() {
    }

    public CreateHostelAllocationRequest(Long studentId, Long bedId, Long academicYearId, LocalDate startDate, LocalDate endDate) {
        this.studentId = studentId;
        this.bedId = bedId;
        this.academicYearId = academicYearId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }

    public Long getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(Long academicYearId) {
        this.academicYearId = academicYearId;
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
}
