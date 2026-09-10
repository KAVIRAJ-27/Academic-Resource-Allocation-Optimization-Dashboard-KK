package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.HostelBedStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateHostelBedRequest {

    @NotBlank(message = "Bed number/identifier is required")
    @Size(max = 20, message = "Bed number cannot exceed 20 characters")
    private String bedNumber;

    @NotNull(message = "Bed status is required (AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED, INACTIVE)")
    private HostelBedStatus status;

    public UpdateHostelBedRequest() {
    }

    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }

    public HostelBedStatus getStatus() { return status; }
    public void setStatus(HostelBedStatus status) { this.status = status; }
}
