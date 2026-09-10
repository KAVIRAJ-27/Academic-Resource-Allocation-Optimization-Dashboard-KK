package com.ahrao.dto.resource;

import com.ahrao.entity.enums.ResourceStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateResourceRequest {

    @NotBlank(message = "Resource name is required")
    @Size(max = 150, message = "Resource name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Resource code is required")
    @Size(max = 50, message = "Resource code must not exceed 50 characters")
    private String code;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Long departmentId;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 150, message = "Location must not exceed 150 characters")
    private String location;

    private ResourceStatus status;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    public UpdateResourceRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
}
