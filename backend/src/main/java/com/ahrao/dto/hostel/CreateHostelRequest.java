package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.HostelType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateHostelRequest {

    @NotBlank(message = "Hostel name is required")
    @Size(max = 150, message = "Hostel name cannot exceed 150 characters")
    private String name;

    @NotBlank(message = "Hostel code is required")
    @Size(max = 50, message = "Hostel code cannot exceed 50 characters")
    private String code;

    @NotNull(message = "Hostel type is required (BOYS, GIRLS, CO_ED)")
    private HostelType type;

    @Size(max = 255, message = "Address cannot exceed 255 characters")
    private String address;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Hostel capacity must be at least 1")
    private Integer capacity;

    public CreateHostelRequest() {
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public HostelType getType() { return type; }
    public void setType(HostelType type) { this.type = type; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }
}
