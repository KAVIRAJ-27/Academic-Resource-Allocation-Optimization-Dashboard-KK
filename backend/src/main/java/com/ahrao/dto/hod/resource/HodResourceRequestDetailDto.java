package com.ahrao.dto.hod.resource;

import com.ahrao.entity.enums.PriorityLevel;
import com.ahrao.entity.enums.RequestStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class HodResourceRequestDetailDto {
    private Long id;
    private Long requesterUserId;
    private String requesterName;
    private String requesterEmail;
    private String requesterRole;
    private String requesterEmployeeOrRegNumber;
    private Long departmentId;
    private String departmentName;
    private Long resourceCategoryId;
    private String categoryName;
    private Long requestedResourceId;
    private String requestedResourceName;
    private String requestedResourceCode;
    private String resourceLocation;
    private Integer resourceCapacity;
    private String purpose;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer quantity;
    private PriorityLevel priority;
    private RequestStatus status;
    private String description;
    private String academicSubject;
    private String academicSection;
    private Instant createdAt;
    private Instant updatedAt;
    private List<HodApprovalHistoryItemDto> approvalHistory = new ArrayList<>();
    private HodRelatedAllocationDto relatedAllocation;

    public HodResourceRequestDetailDto() {
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

    public String getRequesterRole() {
        return requesterRole;
    }

    public void setRequesterRole(String requesterRole) {
        this.requesterRole = requesterRole;
    }

    public String getRequesterEmployeeOrRegNumber() {
        return requesterEmployeeOrRegNumber;
    }

    public void setRequesterEmployeeOrRegNumber(String requesterEmployeeOrRegNumber) {
        this.requesterEmployeeOrRegNumber = requesterEmployeeOrRegNumber;
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

    public Long getResourceCategoryId() {
        return resourceCategoryId;
    }

    public void setResourceCategoryId(Long resourceCategoryId) {
        this.resourceCategoryId = resourceCategoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getRequestedResourceId() {
        return requestedResourceId;
    }

    public void setRequestedResourceId(Long requestedResourceId) {
        this.requestedResourceId = requestedResourceId;
    }

    public String getRequestedResourceName() {
        return requestedResourceName;
    }

    public void setRequestedResourceName(String requestedResourceName) {
        this.requestedResourceName = requestedResourceName;
    }

    public String getRequestedResourceCode() {
        return requestedResourceCode;
    }

    public void setRequestedResourceCode(String requestedResourceCode) {
        this.requestedResourceCode = requestedResourceCode;
    }

    public String getResourceLocation() {
        return resourceLocation;
    }

    public void setResourceLocation(String resourceLocation) {
        this.resourceLocation = resourceLocation;
    }

    public Integer getResourceCapacity() {
        return resourceCapacity;
    }

    public void setResourceCapacity(Integer resourceCapacity) {
        this.resourceCapacity = resourceCapacity;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
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

    public PriorityLevel getPriority() {
        return priority;
    }

    public void setPriority(PriorityLevel priority) {
        this.priority = priority;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAcademicSubject() {
        return academicSubject;
    }

    public void setAcademicSubject(String academicSubject) {
        this.academicSubject = academicSubject;
    }

    public String getAcademicSection() {
        return academicSection;
    }

    public void setAcademicSection(String academicSection) {
        this.academicSection = academicSection;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<HodApprovalHistoryItemDto> getApprovalHistory() {
        return approvalHistory;
    }

    public void setApprovalHistory(List<HodApprovalHistoryItemDto> approvalHistory) {
        this.approvalHistory = approvalHistory;
    }

    public HodRelatedAllocationDto getRelatedAllocation() {
        return relatedAllocation;
    }

    public void setRelatedAllocation(HodRelatedAllocationDto relatedAllocation) {
        this.relatedAllocation = relatedAllocation;
    }
}
