package com.ahrao.dto.hostel;

import com.ahrao.entity.enums.HostelType;

public class HostelDto {
    private Long id;
    private Long institutionId;
    private String name;
    private String code;
    private HostelType type;
    private String address;
    private Integer capacity;
    private String status;

    public HostelDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getInstitutionId() { return institutionId; }
    public void setInstitutionId(Long institutionId) { this.institutionId = institutionId; }

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

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
