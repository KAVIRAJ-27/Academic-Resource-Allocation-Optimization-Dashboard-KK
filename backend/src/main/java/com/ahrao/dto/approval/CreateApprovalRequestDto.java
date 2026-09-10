package com.ahrao.dto.approval;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateApprovalRequestDto {

    @NotBlank(message = "Request type is required (e.g. ACADEMIC_RESOURCE or HOSTEL_RESOURCE)")
    private String requestType;

    @NotNull(message = "Request ID is required")
    private Long requestId;

    private Long recommendedResourceId;
    private Long recommendedBedId;
    private String comments;

    public CreateApprovalRequestDto() {
    }

    public CreateApprovalRequestDto(String requestType, Long requestId, Long recommendedResourceId, Long recommendedBedId, String comments) {
        this.requestType = requestType;
        this.requestId = requestId;
        this.recommendedResourceId = recommendedResourceId;
        this.recommendedBedId = recommendedBedId;
        this.comments = comments;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Long getRecommendedResourceId() {
        return recommendedResourceId;
    }

    public void setRecommendedResourceId(Long recommendedResourceId) {
        this.recommendedResourceId = recommendedResourceId;
    }

    public Long getRecommendedBedId() {
        return recommendedBedId;
    }

    public void setRecommendedBedId(Long recommendedBedId) {
        this.recommendedBedId = recommendedBedId;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
