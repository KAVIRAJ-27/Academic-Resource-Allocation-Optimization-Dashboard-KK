package com.ahrao.dto.principal.dashboard;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class PrincipalPendingApprovalsDto {
    private long pendingCount;
    private List<PendingApprovalItemDto> items = new ArrayList<>();

    public PrincipalPendingApprovalsDto() {
    }

    public long getPendingCount() {
        return pendingCount;
    }

    public void setPendingCount(long pendingCount) {
        this.pendingCount = pendingCount;
    }

    public List<PendingApprovalItemDto> getItems() {
        return items;
    }

    public void setItems(List<PendingApprovalItemDto> items) {
        this.items = items;
    }

    public static class PendingApprovalItemDto {
        private Long id;
        private String entityType;
        private Long entityId;
        private String requesterName;
        private String requesterEmail;
        private String approvalLevel;
        private String status;
        private String comments;
        private Instant createdAt;

        public PendingApprovalItemDto() {
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEntityType() {
            return entityType;
        }

        public void setEntityType(String entityType) {
            this.entityType = entityType;
        }

        public Long getEntityId() {
            return entityId;
        }

        public void setEntityId(Long entityId) {
            this.entityId = entityId;
        }

        public String getRequesterName() {
            return requesterName;
        }

        public void setRequesterName(String requesterName) {
            this.requesterName = requesterName;
        }

        public String getRequesterEmail() {
            return requesterEmail;
        }

        public void setRequesterEmail(String requesterEmail) {
            this.requesterEmail = requesterEmail;
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
}
