package com.ahrao.dto.principal.approval;

public class PrincipalApprovalActionRequest {
    private String comments;

    public PrincipalApprovalActionRequest() {
    }

    public PrincipalApprovalActionRequest(String comments) {
        this.comments = comments;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
