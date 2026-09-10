package com.ahrao.dto.hostel.allocation;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AutoHostelAllocationRequestDto {

    @NotNull(message = "Hostel request ID is required for auto-allocation.")
    private Long hostelRequestId;

    private Long hostelId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Long academicYearId;

    public AutoHostelAllocationRequestDto() {
    }

    public AutoHostelAllocationRequestDto(Long hostelRequestId) {
        this.hostelRequestId = hostelRequestId;
    }

    public AutoHostelAllocationRequestDto(Long hostelRequestId, Long hostelId, LocalDate startDate, LocalDate endDate, Long academicYearId) {
        this.hostelRequestId = hostelRequestId;
        this.hostelId = hostelId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.academicYearId = academicYearId;
    }

    public Long getHostelRequestId() {
        return hostelRequestId;
    }

    public void setHostelRequestId(Long hostelRequestId) {
        this.hostelRequestId = hostelRequestId;
    }

    public Long getHostelId() {
        return hostelId;
    }

    public void setHostelId(Long hostelId) {
        this.hostelId = hostelId;
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

    public Long getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(Long academicYearId) {
        this.academicYearId = academicYearId;
    }
}
