package com.ahrao.dto.principal.resource;

import java.time.Instant;

public class PrincipalApprovalHistoryItemDto {
    private Long id;
    private String approvalLevel;
    private String status;
    private String reviewerName;
    private String reviewerEmail;
    private String comments;
    private Instant createdAt;

    public PrincipalApprovalHistoryItemDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApprovalLevel() {
        return approvalLevel;
    }

    public void setApprovalLevel(String approvalLevel) {
        this.approvalLevel = approvalLevel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public String getApprovedByName() {
        return reviewerName;
    }

    public void setApprovedByName(String approvedByName) {
        this.reviewerName = approvedByName;
    }

    public String getReviewerEmail() {
        return reviewerEmail;
    }

    public void setReviewerEmail(String reviewerEmail) {
        this.reviewerEmail = reviewerEmail;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
