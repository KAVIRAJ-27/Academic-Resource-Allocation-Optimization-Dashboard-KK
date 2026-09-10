package com.ahrao.dto.approval;

public class ApprovalActionRequestDto {

    private String comments;
    private Long resourceId;
    private Long bedId;

    public ApprovalActionRequestDto() {
    }

    public ApprovalActionRequestDto(String comments) {
        this.comments = comments;
    }

    public ApprovalActionRequestDto(String comments, Long resourceId, Long bedId) {
        this.comments = comments;
        this.resourceId = resourceId;
        this.bedId = bedId;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }
}
