package com.ahrao.dto.warden;

import jakarta.validation.constraints.NotNull;

public class AssignMaintenanceRequest {

    @NotNull(message = "Assigned user ID is required")
    private Long assignedToId;

    public AssignMaintenanceRequest() {
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public void setAssignedToId(Long assignedToId) {
        this.assignedToId = assignedToId;
    }
}
