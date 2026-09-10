package com.ahrao.dto.academic.allocation;

import jakarta.validation.constraints.NotNull;

public class PreviewAcademicAllocationRequest {

    @NotNull(message = "Request ID is required")
    private Long requestId;

    private Long resourceId;

    public PreviewAcademicAllocationRequest() {
    }

    public PreviewAcademicAllocationRequest(Long requestId) {
        this.requestId = requestId;
    }

    public PreviewAcademicAllocationRequest(Long requestId, Long resourceId) {
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
}
