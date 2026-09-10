package com.ahrao.dto.hod.resource;

import jakarta.validation.constraints.Size;

public class HodApprovalActionRequest {

    @Size(max = 1000, message = "Comments cannot exceed 1000 characters")
    private String comments;

    public HodApprovalActionRequest() {
    }

    public HodApprovalActionRequest(String comments) {
        this.comments = comments;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
