package com.ahrao.dto.academic.allocation;

import jakarta.validation.constraints.NotBlank;

public class AcademicDeallocationRequest {

    @NotBlank(message = "Reason is required for deallocation")
    private String reason;

    public AcademicDeallocationRequest() {
    }

    public AcademicDeallocationRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
