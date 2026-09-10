package com.ahrao.dto.student;

import jakarta.validation.constraints.NotBlank;

public class UpdateStudentStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;

    public UpdateStudentStatusRequest() {
    }

    public UpdateStudentStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
