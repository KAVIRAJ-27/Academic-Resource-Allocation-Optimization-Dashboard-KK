package com.ahrao.dto.warden;

import jakarta.validation.constraints.Size;

public class UpdateFacilityRequest {

    @Size(max = 20, message = "Status must not exceed 20 characters")
    private String status;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    private Integer quantity;

    public UpdateFacilityRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
