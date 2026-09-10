package com.ahrao.dto.hostel;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateHostelBlockRequest {

    @NotNull(message = "Hostel ID is required")
    private Long hostelId;

    @NotBlank(message = "Block name is required")
    @Size(max = 100, message = "Block name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Block code is required")
    @Size(max = 30, message = "Block code cannot exceed 30 characters")
    private String code;

    @NotNull(message = "Number of floors is required")
    @Min(value = 1, message = "Block must have at least 1 floor")
    private Integer numberOfFloors;

    private String status;

    public CreateHostelBlockRequest() {
    }

    public Long getHostelId() { return hostelId; }
    public void setHostelId(Long hostelId) { this.hostelId = hostelId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Integer getNumberOfFloors() { return numberOfFloors; }
    public void setNumberOfFloors(Integer numberOfFloors) { this.numberOfFloors = numberOfFloors; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
