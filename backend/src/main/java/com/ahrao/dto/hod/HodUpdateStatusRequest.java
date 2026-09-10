package com.ahrao.dto.hod;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class HodUpdateStatusRequest {

    @NotBlank(message = "Status cannot be blank")
    @Pattern(regexp = "ACTIVE|INACTIVE|SUSPENDED|PENDING", message = "Status must be ACTIVE, INACTIVE, SUSPENDED, or PENDING")
    private String status;

    public HodUpdateStatusRequest() {
    }

    public HodUpdateStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
