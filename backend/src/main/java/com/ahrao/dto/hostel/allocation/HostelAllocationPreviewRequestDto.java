package com.ahrao.dto.hostel.allocation;

public class HostelAllocationPreviewRequestDto {

    private Long hostelRequestId;
    private Long studentId;
    private Long hostelId;

    public HostelAllocationPreviewRequestDto() {
    }

    public HostelAllocationPreviewRequestDto(Long hostelRequestId) {
        this.hostelRequestId = hostelRequestId;
    }

    public HostelAllocationPreviewRequestDto(Long hostelRequestId, Long studentId, Long hostelId) {
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
}
