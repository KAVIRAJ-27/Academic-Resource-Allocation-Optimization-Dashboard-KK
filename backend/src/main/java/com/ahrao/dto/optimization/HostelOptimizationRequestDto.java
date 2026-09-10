package com.ahrao.dto.optimization;

import java.time.LocalDate;

public class HostelOptimizationRequestDto {
    private Long hostelRequestId;
    private Long studentId;
    private Long hostelId;
    private LocalDate startDate;
    private LocalDate endDate;

    public HostelOptimizationRequestDto() {
    }

    public HostelOptimizationRequestDto(Long hostelRequestId) {
        this.hostelRequestId = hostelRequestId;
    }

    public HostelOptimizationRequestDto(Long hostelRequestId, Long studentId, Long hostelId) {
        this.hostelRequestId = hostelRequestId;
        this.studentId = studentId;
        this.hostelId = hostelId;
    }

    public Long getHostelRequestId() {
        return hostelRequestId;
    }

    public void setHostelRequestId(Long hostelRequestId) {
        this.hostelRequestId = hostelRequestId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
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
}
