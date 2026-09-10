package com.ahrao.dto.hostel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateHostelFloorRequest {

    private Integer floorNumber;

    @NotBlank(message = "Floor name is required")
    @Size(max = 50, message = "Floor name cannot exceed 50 characters")
    private String name;

    private String status;

    public UpdateHostelFloorRequest() {
    }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
