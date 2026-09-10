package com.ahrao.dto.principal.resource;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class PrincipalResourceRequestDetailDto {
    private Long id;
    private Long requesterUserId;
    private String requesterName;
    private String requesterEmail;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long categoryId;
    private String categoryName;
    private Long resourceId;
    private String resourceName;
    private String resourceCode;
    private Integer resourceCapacity;
    private String resourceLocation;
    private String purpose;
    private String description;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer quantity;
    private String priority;
    private String status;
    private Instant createdAt;
    private List<PrincipalApprovalHistoryItemDto> approvalHistory = new ArrayList<>();
    private PrincipalRelatedAllocationDto relatedAllocation;
    private boolean canPrincipalApprove;
    private boolean canPrincipalReject;

    public PrincipalResourceRequestDetailDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRequesterUserId() {
        return requesterUserId;
    }

    public void setRequesterUserId(Long requesterUserId) {
        this.requesterUserId = requesterUserId;
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

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getResourceCode() {
        return resourceCode;
    }

    public void setResourceCode(String resourceCode) {
        this.resourceCode = resourceCode;
    }

    public Integer getResourceCapacity() {
        return resourceCapacity;
    }

    public void setResourceCapacity(Integer resourceCapacity) {
        this.resourceCapacity = resourceCapacity;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getRequestedDate() {
        return requestedDate;
    }

    public void setRequestedDate(LocalDate requestedDate) {
        this.requestedDate = requestedDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<PrincipalApprovalHistoryItemDto> getApprovalHistory() {
        return approvalHistory;
    }

    public void setApprovalHistory(List<PrincipalApprovalHistoryItemDto> approvalHistory) {
        this.approvalHistory = approvalHistory;
    }

    public PrincipalRelatedAllocationDto getRelatedAllocation() {
        return relatedAllocation;
    }

    public void setRelatedAllocation(PrincipalRelatedAllocationDto relatedAllocation) {
        this.relatedAllocation = relatedAllocation;
    }

    public boolean isCanPrincipalApprove() {
        return canPrincipalApprove;
    }

    public void setCanPrincipalApprove(boolean canPrincipalApprove) {
        this.canPrincipalApprove = canPrincipalApprove;
    }

    public boolean isCanPrincipalReject() {
        return canPrincipalReject;
    }

    public void setCanPrincipalReject(boolean canPrincipalReject) {
        this.canPrincipalReject = canPrincipalReject;
    }
}
