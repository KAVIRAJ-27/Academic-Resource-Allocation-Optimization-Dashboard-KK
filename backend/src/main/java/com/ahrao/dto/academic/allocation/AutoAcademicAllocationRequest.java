package com.ahrao.dto.academic.allocation;

import jakarta.validation.constraints.NotNull;

public class AutoAcademicAllocationRequest {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    private Long timeSlotId;
    private String purpose;

    public AutoAcademicAllocationRequest() {
    }

    public AutoAcademicAllocationRequest(Long requestId) {
        this.requestId = requestId;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getTimeSlotId() {
        return timeSlotId;
    }

    public void setTimeSlotId(Long timeSlotId) {
        this.timeSlotId = timeSlotId;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }
}
