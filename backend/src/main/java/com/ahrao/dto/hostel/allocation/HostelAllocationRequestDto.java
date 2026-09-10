package com.ahrao.dto.hostel.allocation;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class HostelAllocationRequestDto {

    @NotNull(message = "Student ID is required.")
    private Long studentId;

    @NotNull(message = "Hostel ID is required.")
    private Long hostelId;

    private Long roomId;

    @NotNull(message = "Bed ID is required.")
    private Long bedId;

    private Long hostelRequestId;

    @NotNull(message = "Start date is required.")
    private LocalDate startDate;

    private LocalDate endDate;

    private Long academicYearId;

    public HostelAllocationRequestDto() {
    }

    public HostelAllocationRequestDto(Long studentId, Long hostelId, Long roomId, Long bedId, Long hostelRequestId, LocalDate startDate, LocalDate endDate, Long academicYearId) {
        this.studentId = studentId;
        this.hostelId = hostelId;
        this.roomId = roomId;
        this.bedId = bedId;
        this.hostelRequestId = hostelRequestId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.academicYearId = academicYearId;
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

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }

    public Long getHostelRequestId() {
        return hostelRequestId;
    }

    public void setHostelRequestId(Long hostelRequestId) {
        this.hostelRequestId = hostelRequestId;
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
