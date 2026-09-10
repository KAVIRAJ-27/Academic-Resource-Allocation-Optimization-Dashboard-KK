package com.ahrao.dto.academic.allocation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class AcademicAllocationPreviewDto {

    private Long requestId;
    private String requesterName;
    private String requestPurpose;
    private LocalDate requestedDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer quantity;
    private Integer requestedCapacity;
    private Long categoryId;
    private String categoryName;
    private String departmentName;
    private List<AcademicResourceCandidateDto> eligibleResources = new ArrayList<>();
    private List<AcademicResourceCandidateDto> unavailableResources = new ArrayList<>();
    private AcademicResourceCandidateDto recommendedResource;
    private boolean canAllocate;
    private com.ahrao.dto.conflict.ConflictResultDto conflictResult;
    private List<com.ahrao.dto.conflict.ConflictItemDto> conflicts = new ArrayList<>();

    public AcademicAllocationPreviewDto() {
    }


    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequestPurpose() {
        return requestPurpose;
    }

    public void setRequestPurpose(String requestPurpose) {
        this.requestPurpose = requestPurpose;
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

    public Integer getRequestedCapacity() {
        return requestedCapacity;
    }

    public void setRequestedCapacity(Integer requestedCapacity) {
        this.requestedCapacity = requestedCapacity;
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

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public List<AcademicResourceCandidateDto> getEligibleResources() {
        return eligibleResources;
    }

    public void setEligibleResources(List<AcademicResourceCandidateDto> eligibleResources) {
        this.eligibleResources = eligibleResources;
    }

    public List<AcademicResourceCandidateDto> getUnavailableResources() {
        return unavailableResources;
    }

    public void setUnavailableResources(List<AcademicResourceCandidateDto> unavailableResources) {
        this.unavailableResources = unavailableResources;
    }

    public AcademicResourceCandidateDto getRecommendedResource() {
        return recommendedResource;
    }

    public void setRecommendedResource(AcademicResourceCandidateDto recommendedResource) {
        this.recommendedResource = recommendedResource;
    }

    public boolean isCanAllocate() {
        return canAllocate;
    }

    public void setCanAllocate(boolean canAllocate) {
        this.canAllocate = canAllocate;
    }

    public com.ahrao.dto.conflict.ConflictResultDto getConflictResult() {
        return conflictResult;
    }

    public void setConflictResult(com.ahrao.dto.conflict.ConflictResultDto conflictResult) {
        this.conflictResult = conflictResult;
        if (conflictResult != null && conflictResult.getConflicts() != null) {
            this.conflicts = conflictResult.getConflicts();
        }
    }

    public List<com.ahrao.dto.conflict.ConflictItemDto> getConflicts() {
        return conflicts;
    }

    public void setConflicts(List<com.ahrao.dto.conflict.ConflictItemDto> conflicts) {
        this.conflicts = conflicts;
    }
}

