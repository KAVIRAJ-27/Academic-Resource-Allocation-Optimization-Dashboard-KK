package com.ahrao.dto.academic.allocation;

import com.ahrao.entity.enums.ResourceStatus;
import java.util.ArrayList;
import java.util.List;

public class AcademicResourceCandidateDto {

    private Long resourceId;
    private String resourceName;
    private String resourceCode;
    private Long categoryId;
    private String categoryName;
    private Integer capacity;
    private Integer wastedCapacity;
    private String location;
    private String building;
    private String roomNumber;
    private ResourceStatus status;
    private boolean eligible;
    private List<String> conflictReasons = new ArrayList<>();

    public AcademicResourceCandidateDto() {
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

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getWastedCapacity() {
        return wastedCapacity;
    }

    public void setWastedCapacity(Integer wastedCapacity) {
        this.wastedCapacity = wastedCapacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public List<String> getConflictReasons() {
        return conflictReasons;
    }

    public void setConflictReasons(List<String> conflictReasons) {
        this.conflictReasons = conflictReasons;
    }
}
