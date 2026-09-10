package com.ahrao.dto.resource;

import com.ahrao.entity.enums.ResourceStatus;
import com.ahrao.entity.enums.ResourceType;

import java.time.Instant;

public class ResourceDetailsResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private ResourceType resourceType;
    private Long departmentId;
    private String departmentCode;
    private String departmentName;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private Integer quantity;
    private Integer availableQuantity;
    private ClassroomSummaryResponse classroomDetails;
    private LaboratorySummaryResponse laboratoryDetails;
    private EquipmentSummaryResponse equipmentDetails;
    private long totalAllocations;
    private Instant createdAt;
    private Instant updatedAt;

    public ResourceDetailsResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(ResourceStatus status) {
        this.status = status;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public ClassroomSummaryResponse getClassroomDetails() {
        return classroomDetails;
    }

    public void setClassroomDetails(ClassroomSummaryResponse classroomDetails) {
        this.classroomDetails = classroomDetails;
    }

    public LaboratorySummaryResponse getLaboratoryDetails() {
        return laboratoryDetails;
    }

    public void setLaboratoryDetails(LaboratorySummaryResponse laboratoryDetails) {
        this.laboratoryDetails = laboratoryDetails;
    }

    public EquipmentSummaryResponse getEquipmentDetails() {
        return equipmentDetails;
    }

    public void setEquipmentDetails(EquipmentSummaryResponse equipmentDetails) {
        this.equipmentDetails = equipmentDetails;
    }

    public long getTotalAllocations() {
        return totalAllocations;
    }

    public void setTotalAllocations(long totalAllocations) {
        this.totalAllocations = totalAllocations;
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
}
