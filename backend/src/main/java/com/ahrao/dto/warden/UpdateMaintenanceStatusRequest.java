package com.ahrao.dto.warden;

import com.ahrao.entity.enums.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateMaintenanceStatusRequest {

    @NotNull(message = "Status is required")
    private MaintenanceStatus status;

    @Size(max = 500, message = "Remarks must not exceed 500 characters")
    private String remarks;

    public UpdateMaintenanceStatusRequest() {
    }

    public MaintenanceStatus getStatus() {
        return status;
    }

    public void setStatus(MaintenanceStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
