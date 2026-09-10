package com.ahrao.dto.staff;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class WardenHostelAssignmentRequest {

    @NotNull(message = "Hostel ID list is required")
    private List<Long> hostelIds;

    public WardenHostelAssignmentRequest() {
    }

    public WardenHostelAssignmentRequest(List<Long> hostelIds) {
        this.hostelIds = hostelIds;
    }

    public List<Long> getHostelIds() {
        return hostelIds;
    }

    public void setHostelIds(List<Long> hostelIds) {
        this.hostelIds = hostelIds;
    }
}
