package com.ahrao.dto.hostel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateHostelFloorRequest {

    @NotNull(message = "Hostel block ID is required")
    private Long blockId;

    @NotNull(message = "Floor number is required")
    private Integer floorNumber;

    @NotBlank(message = "Floor name is required")
    @Size(max = 50, message = "Floor name cannot exceed 50 characters")
    private String name;

    public CreateHostelFloorRequest() {
    }

    public Long getBlockId() { return blockId; }
    public void setBlockId(Long blockId) { this.blockId = blockId; }

    public Integer getFloorNumber() { return floorNumber; }
    public void setFloorNumber(Integer floorNumber) { this.floorNumber = floorNumber; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
