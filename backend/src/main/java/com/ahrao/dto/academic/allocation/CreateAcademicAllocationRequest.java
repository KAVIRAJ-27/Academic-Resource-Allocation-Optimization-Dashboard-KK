package com.ahrao.dto.academic.allocation;

import jakarta.validation.constraints.NotNull;

public class CreateAcademicAllocationRequest {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    @NotNull(message = "Resource ID is required")
    private Long resourceId;

    private Long timeSlotId;
    private String purpose;

    public CreateAcademicAllocationRequest() {
    }

    public CreateAcademicAllocationRequest(Long requestId, Long resourceId) {
        this.requestId = requestId;
        this.resourceId = resourceId;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
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
